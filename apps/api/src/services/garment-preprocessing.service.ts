import { randomUUID } from 'node:crypto'

import sharp from 'sharp'

import type { TryOnCategory } from './jobs.service.js'
import { uploadBufferToBunny } from './bunny.service.js'

// ─── Constants ────────────────────────────────────────────────────────────────

/** IDM-VTON training resolution — images should be normalized to this ratio */
const TARGET_WIDTH = 768
const TARGET_HEIGHT = 1024
const JPEG_QUALITY = 92

/**
 * Category-specific vertical extraction ratios.
 *
 * These define what PERCENTAGE of the trimmed content to keep, and from WHERE.
 * The idea: a suit photo has jacket on top, pants in the middle, shoes at bottom.
 * If the user selected "upper_body", we ONLY want the top portion (the jacket).
 * This physically removes shoes, belts, hats, and other items from the image
 * before the AI model ever sees them.
 *
 * FORMAT: { from: 'top' | 'bottom' | 'full', offsetPercent: number, keepPercent: number }
 */
const CATEGORY_REGION: Record<TryOnCategory, { from: 'top' | 'bottom' | 'full'; offsetPercent: number; keepPercent: number }> = {
  upper_body: { from: 'top', offsetPercent: 0.12, keepPercent: 0.52 },  // Skip head (top 12%), keep torso
  lower_body: { from: 'bottom', offsetPercent: 0.05, keepPercent: 0.60 }, // Skip shoes (bottom 5%), keep pants
  dresses:    { from: 'full', offsetPercent: 0, keepPercent: 1.0 },      // Use full content
}

// ─── Result Type ──────────────────────────────────────────────────────────────

export interface PreprocessedGarmentResult {
  /** CDN URL of the cleaned garment image */
  cleanedUrl: string
  /** Storage path in Bunny */
  storagePath: string
  /** Original dimensions */
  originalWidth: number
  originalHeight: number
  /** Final dimensions after preprocessing */
  finalWidth: number
  finalHeight: number
  /** What preprocessing steps were applied */
  steps: string[]
}

// ─── Download ─────────────────────────────────────────────────────────────────

async function downloadImageToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download image (status ${response.status})`)
  }

  return Buffer.from(await response.arrayBuffer())
}

// ─── Preprocessing Pipeline ──────────────────────────────────────────────────

/**
 * Preprocesses a garment image for optimal IDM-VTON results.
 *
 * Pipeline:
 *  1. Download the raw image
 *  2. Auto-trim whitespace/background to isolate the garment region
 *  3. **CATEGORY-AWARE CROP** — extract only the relevant garment region:
 *     - upper_body → top 55% (jacket, not shoes/pants)
 *     - lower_body → bottom 55% (pants, not jacket/head)
 *     - dresses → full content
 *  4. If result is still very wide, center-extract to handle multi-item layouts
 *  5. Resize to 768×1024 (3:4) with white-background padding (no stretching)
 *  6. Flatten to opaque white background
 *  7. Upload cleaned image to Bunny CDN
 */
export async function preprocessGarmentImage(options: {
  imageUrl: string
  merchantId: number
  category: TryOnCategory
}): Promise<PreprocessedGarmentResult> {
  const steps: string[] = []

  // Step 1: Download
  const rawBuffer = await downloadImageToBuffer(options.imageUrl)
  const rawMeta = await sharp(rawBuffer).metadata()
  const originalWidth = rawMeta.width ?? 0
  const originalHeight = rawMeta.height ?? 0
  steps.push(`downloaded (${originalWidth}×${originalHeight})`)

  const pipeline = sharp(rawBuffer).rotate() // auto-rotate based on EXIF

  // Step 2: Auto-trim whitespace around the garment
  // This removes uniform borders (similar color to the edges), effectively
  // cropping to the "bounding box" of the garment/object.
  let trimmedBuffer: Buffer
  let trimmedWidth: number
  let trimmedHeight: number

  try {
    const trimResult = await pipeline
      .trim({ threshold: 25, lineArt: false })
      .toBuffer({ resolveWithObject: true })

    trimmedBuffer = trimResult.data
    trimmedWidth = trimResult.info.width
    trimmedHeight = trimResult.info.height
    steps.push(`trimmed → ${trimmedWidth}×${trimmedHeight}`)
  } catch {
    // trim() can fail on images with no detectable border — use original
    trimmedBuffer = await pipeline.toBuffer()
    trimmedWidth = originalWidth
    trimmedHeight = originalHeight
    steps.push('trim skipped (no uniform border)')
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Step 3: CATEGORY-AWARE REGION EXTRACTION
  //
  // This is the highest-impact step. Product photos often contain multiple
  // items (jacket + pants + shoes + tie + hat on a mannequin). The AI model
  // cannot distinguish between them — it tries to render EVERYTHING onto
  // the person, creating distorted results.
  //
  // By physically cutting the image to only the relevant region based on
  // the category, we ensure the model only sees the target garment.
  // ═══════════════════════════════════════════════════════════════════════════

  const region = CATEGORY_REGION[options.category]

  if (region.from !== 'full' && region.keepPercent < 1.0 && trimmedHeight > 200) {
    const extractHeight = Math.round(trimmedHeight * region.keepPercent)
    const offsetRows = Math.round(trimmedHeight * region.offsetPercent)

    if (region.from === 'top') {
      // Upper body: skip the head (offset) and take the torso
      trimmedBuffer = await sharp(trimmedBuffer)
        .extract({
          left: 0,
          top: offsetRows,
          width: trimmedWidth,
          height: Math.min(extractHeight, trimmedHeight - offsetRows),
        })
        .toBuffer()

      steps.push(`head-safe-crop: upper_body → offset ${Math.round(region.offsetPercent * 100)}% + keep ${Math.round(region.keepPercent * 100)}%`)
    } else if (region.from === 'bottom') {
      // Lower body: skip the shoes (offset) and take the legs
      const extractTop = Math.max(0, trimmedHeight - extractHeight - offsetRows)

      trimmedBuffer = await sharp(trimmedBuffer)
        .extract({
          left: 0,
          top: extractTop,
          width: trimmedWidth,
          height: extractHeight,
        })
        .toBuffer()

      steps.push(`shoe-safe-crop: lower_body → offset ${Math.round(region.offsetPercent * 100)}% + keep ${Math.round(region.keepPercent * 100)}%`)
    }

    trimmedHeight = Math.min(extractHeight, trimmedHeight - offsetRows)
  }

  // Step 4: If content is very wide (>1.8:1 ratio), it likely has multiple
  // items side-by-side. Extract the center column to focus on the main garment.
  const trimmedRatio = trimmedWidth / trimmedHeight

  if (trimmedRatio > 1.8 && trimmedWidth > 400) {
    const extractWidth = Math.round(trimmedWidth * 0.6)
    const extractLeft = Math.round((trimmedWidth - extractWidth) / 2)

    trimmedBuffer = await sharp(trimmedBuffer)
      .extract({
        left: extractLeft,
        top: 0,
        width: extractWidth,
        height: trimmedHeight,
      })
      .toBuffer()

    trimmedWidth = extractWidth
    steps.push(`center-extracted (${extractWidth}×${trimmedHeight}, was ${trimmedRatio.toFixed(2)}:1)`)
  }

  // Step 5: If after all crops the image is extremely tall and narrow
  // (like a mannequin stand shot), extract the center 80%.
  const verticalRatio = trimmedHeight / trimmedWidth
  if (verticalRatio > 3.0 && trimmedHeight > 600) {
    const extractHeight = Math.round(trimmedHeight * 0.8)
    const extractTop = Math.round((trimmedHeight - extractHeight) / 2)

    trimmedBuffer = await sharp(trimmedBuffer)
      .extract({
        left: 0,
        top: extractTop,
        width: trimmedWidth,
        height: extractHeight,
      })
      .toBuffer()

    trimmedHeight = extractHeight
    steps.push(`vertical-trimmed (${trimmedWidth}×${extractHeight})`)
  }

  // Step 6: Resize to target dimensions with padding (contain, no stretch)
  // This creates a properly sized 768×1024 image with the garment centered
  // on a white background.
  const finalBuffer = await sharp(trimmedBuffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: 'contain',
      position: 'centre',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      withoutEnlargement: false,
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } }) // remove any alpha/transparency
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer()

  steps.push(`resized → ${TARGET_WIDTH}×${TARGET_HEIGHT} (padded, white bg)`)

  // Step 7: Upload to Bunny CDN
  const storagePath = `${options.merchantId}/preprocessed/${randomUUID()}.jpg`
  const upload = await uploadBufferToBunny(storagePath, finalBuffer, 'image/jpeg')
  steps.push('uploaded to CDN')

  return {
    cleanedUrl: upload.url,
    storagePath: upload.storagePath,
    originalWidth,
    originalHeight,
    finalWidth: TARGET_WIDTH,
    finalHeight: TARGET_HEIGHT,
    steps,
  }
}
