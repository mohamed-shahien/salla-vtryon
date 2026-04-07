import sharp from 'sharp'

// ─── Quality Verdicts ─────────────────────────────────────────────────────────

export type QualityVerdict = 'pass' | 'warn' | 'reject'

export interface ImageQualityReport {
  verdict: QualityVerdict
  reasons: string[]
  warnings: string[]
  metadata: {
    width: number
    height: number
    aspectRatio: number
    format: string | undefined
    meanBrightness: number
    isPortrait: boolean
    isLandscape: boolean
    isSquare: boolean
    trimmedPercent: number
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_DIMENSION = 256
const MAX_DIMENSION = 2048
const MIN_BRIGHTNESS = 20  // too dark
const MAX_BRIGHTNESS = 245 // too bright (washed out)
const MAX_LANDSCAPE_RATIO = 1.5 // wider than 3:2 landscape = likely multi-item or flat lay
const SUPPORTED_FORMATS = new Set(['jpeg', 'png', 'webp', 'tiff'])

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function downloadImageToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download image (status ${response.status})`)
  }

  return Buffer.from(await response.arrayBuffer())
}

function computeAspectRatio(width: number, height: number) {
  return width / height
}

function classifyOrientation(ratio: number) {
  if (ratio < 0.9) return 'portrait' as const
  if (ratio > 1.1) return 'landscape' as const
  return 'square' as const
}

/**
 * Calculates how much of the original image was background (trimmable whitespace).
 * A high trim percentage means the object is small relative to the frame.
 * A very low percentage means the image is tightly cropped already.
 */
async function calculateTrimPercent(buffer: Buffer, width: number, height: number) {
  try {
    const trimmed = await sharp(buffer)
      .trim({ threshold: 30 })
      .toBuffer({ resolveWithObject: true })

    const trimmedArea = trimmed.info.width * trimmed.info.height
    const originalArea = width * height
    const removedPercent = ((originalArea - trimmedArea) / originalArea) * 100

    return {
      removedPercent: Math.round(removedPercent * 10) / 10,
      trimmedWidth: trimmed.info.width,
      trimmedHeight: trimmed.info.height,
    }
  } catch {
    return { removedPercent: 0, trimmedWidth: width, trimmedHeight: height }
  }
}

/**
 * Analyzes the edge density of an image to estimate visual complexity.
 * Higher edge density = more complex / cluttered image.
 */
async function calculateEdgeDensity(buffer: Buffer) {
  try {
    // Apply Laplacian-like edge detection via convolution
    const edgeBuffer = await sharp(buffer)
      .resize(256, 256, { fit: 'fill' }) // normalize to fixed size for comparable stats
      .greyscale()
      .convolve({
        width: 3,
        height: 3,
        kernel: [0, -1, 0, -1, 4, -1, 0, -1, 0],
      })
      .raw()
      .toBuffer()

    // Calculate the mean edge intensity
    let sum = 0
    for (let i = 0; i < edgeBuffer.length; i++) {
      sum += edgeBuffer[i] ?? 0
    }

    return sum / edgeBuffer.length
  } catch {
    return 0
  }
}

/**
 * Analyzes the color diversity of an image.
 * High standard deviation across channels = diverse colors = possible multi-item.
 */
async function analyzeColorDiversity(buffer: Buffer) {
  try {
    const stats = await sharp(buffer)
      .resize(128, 128, { fit: 'fill' })
      .stats()

    const channels = stats.channels
    const avgStdDev = channels.reduce((acc, ch) => acc + ch.stdev, 0) / channels.length
    const avgMean = channels.reduce((acc, ch) => acc + ch.mean, 0) / channels.length

    return { avgStdDev, avgMean }
  } catch {
    return { avgStdDev: 0, avgMean: 128 }
  }
}

// ─── Garment Image Analysis ──────────────────────────────────────────────────

export async function analyzeGarmentImage(imageUrl: string): Promise<ImageQualityReport> {
  const reasons: string[] = []
  const warnings: string[] = []

  let buffer: Buffer
  try {
    buffer = await downloadImageToBuffer(imageUrl)
  } catch (error) {
    return buildRejectReport('Could not download the product image.', error)
  }

  let metadata: sharp.Metadata
  try {
    metadata = await sharp(buffer).metadata()
  } catch {
    return buildRejectReport('The product image file is not a valid image.')
  }

  const width = metadata.width ?? 0
  const height = metadata.height ?? 0

  if (!metadata.format || !SUPPORTED_FORMATS.has(metadata.format)) {
    reasons.push(`Unsupported image format: ${metadata.format ?? 'unknown'}. Use JPEG, PNG, or WebP.`)
  }

  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    reasons.push(`Product image is too small (${width}×${height}). Minimum ${MIN_DIMENSION}×${MIN_DIMENSION} required.`)
  }

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    warnings.push(`Large product image (${width}×${height}). Will be resized.`)
  }

  const ratio = computeAspectRatio(width, height)
  const orientation = classifyOrientation(ratio)

  // Very wide landscape images are almost certainly flat-lays or multi-item shots
  if (ratio > MAX_LANDSCAPE_RATIO) {
    warnings.push(
      `Product image is wide landscape (${width}×${height}, ratio ${ratio.toFixed(2)}). ` +
      `This may contain multiple items or a flat-lay arrangement. Results may be unpredictable.`,
    )
  }

  // Trim analysis — how much of the frame is background?
  const trimResult = await calculateTrimPercent(buffer, width, height)

  if (trimResult.removedPercent > 85) {
    warnings.push(
      `The product garment appears very small in the frame (only ~${Math.round(100 - trimResult.removedPercent)}% fill). ` +
      `Consider a closer crop.`,
    )
  }

  // Check if the trimmed image is extremely wide (multi-item heuristic)
  if (trimResult.trimmedWidth > 0 && trimResult.trimmedHeight > 0) {
    const trimmedRatio = trimResult.trimmedWidth / trimResult.trimmedHeight
    if (trimmedRatio > 2.0) {
      warnings.push(
        'After removing background, the remaining content is very wide — this suggests multiple items side by side.',
      )
    }
  }

  // Edge density — high complexity = cluttered image
  const edgeDensity = await calculateEdgeDensity(buffer)
  if (edgeDensity > 60) {
    warnings.push(
      `High visual complexity detected (edge density: ${edgeDensity.toFixed(1)}). ` +
      `The image may contain multiple items, complex backgrounds, or accessories.`,
    )
  }

  // Color diversity
  const colorInfo = await analyzeColorDiversity(buffer)

  // Brightness check
  if (colorInfo.avgMean < MIN_BRIGHTNESS) {
    warnings.push('Product image appears very dark. Results may be degraded.')
  }
  if (colorInfo.avgMean > MAX_BRIGHTNESS) {
    warnings.push('Product image appears very bright/washed out. Fabric detail may be lost.')
  }

  // Build verdict
  let verdict: QualityVerdict = 'pass'

  if (reasons.length > 0) {
    verdict = 'reject'
  } else if (warnings.length >= 3) {
    // 3+ warnings = likely problematic but let's try with a warning
    verdict = 'warn'
  }

  return {
    verdict,
    reasons,
    warnings,
    metadata: {
      width,
      height,
      aspectRatio: Math.round(ratio * 100) / 100,
      format: metadata.format,
      meanBrightness: Math.round(colorInfo.avgMean),
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      isSquare: orientation === 'square',
      trimmedPercent: trimResult.removedPercent,
    },
  }
}

// ─── Human Image Analysis ────────────────────────────────────────────────────

export async function analyzeHumanImage(imageUrl: string): Promise<ImageQualityReport> {
  const reasons: string[] = []
  const warnings: string[] = []

  let buffer: Buffer
  try {
    buffer = await downloadImageToBuffer(imageUrl)
  } catch (error) {
    return buildRejectReport('Could not download the customer image.', error)
  }

  let metadata: sharp.Metadata
  try {
    metadata = await sharp(buffer).metadata()
  } catch {
    return buildRejectReport('The customer image file is not a valid image.')
  }

  const width = metadata.width ?? 0
  const height = metadata.height ?? 0

  if (!metadata.format || !SUPPORTED_FORMATS.has(metadata.format)) {
    reasons.push(`Unsupported image format: ${metadata.format ?? 'unknown'}. Use JPEG, PNG, or WebP.`)
  }

  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    reasons.push(`Customer image is too small (${width}×${height}). Minimum ${MIN_DIMENSION}×${MIN_DIMENSION} required.`)
  }

  const ratio = computeAspectRatio(width, height)
  const orientation = classifyOrientation(ratio)

  // Human images should ideally be portrait or square
  if (orientation === 'landscape' && ratio > 1.6) {
    warnings.push(
      `Customer image is wide landscape (ratio ${ratio.toFixed(2)}). ` +
      `Portrait or square images produce much better results.`,
    )
  }

  // Trim analysis — check if person fills enough of the frame
  const trimResult = await calculateTrimPercent(buffer, width, height)

  if (trimResult.removedPercent > 80) {
    warnings.push(
      `The person appears very small in the frame (~${Math.round(100 - trimResult.removedPercent)}% fill). ` +
      `A closer photo will produce better results.`,
    )
  }

  // Brightness / exposure check
  const colorInfo = await analyzeColorDiversity(buffer)

  if (colorInfo.avgMean < MIN_BRIGHTNESS) {
    warnings.push('Customer image is very dark. The model may struggle to identify the body correctly.')
  }

  if (colorInfo.avgMean > MAX_BRIGHTNESS) {
    warnings.push('Customer image is overexposed/washed out.')
  }

  // Very low color standard deviation = blank/uniform image (possibly screenshot or placeholder)
  if (colorInfo.avgStdDev < 10) {
    reasons.push('Customer image appears to be a solid color or blank image.')
  }

  // Edge density — very low = no discernible person
  const edgeDensity = await calculateEdgeDensity(buffer)
  if (edgeDensity < 5) {
    warnings.push('Very low visual detail detected. Image may not contain a clear person.')
  }

  // Build verdict
  let verdict: QualityVerdict = 'pass'

  if (reasons.length > 0) {
    verdict = 'reject'
  } else if (warnings.length >= 3) {
    verdict = 'warn'
  }

  return {
    verdict,
    reasons,
    warnings,
    metadata: {
      width,
      height,
      aspectRatio: Math.round(ratio * 100) / 100,
      format: metadata.format,
      meanBrightness: Math.round(colorInfo.avgMean),
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      isSquare: orientation === 'square',
      trimmedPercent: trimResult.removedPercent,
    },
  }
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function buildRejectReport(reason: string, _error?: unknown): ImageQualityReport {
  return {
    verdict: 'reject',
    reasons: [reason],
    warnings: [],
    metadata: {
      width: 0,
      height: 0,
      aspectRatio: 0,
      format: undefined,
      meanBrightness: 0,
      isPortrait: false,
      isLandscape: false,
      isSquare: false,
      trimmedPercent: 0,
    },
  }
}
