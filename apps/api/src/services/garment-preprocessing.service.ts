import { randomUUID } from 'node:crypto'

import sharp from 'sharp'

import type { TryOnCategory } from './jobs.service.js'
import { uploadBufferToBunny } from './bunny.service.js'

const TARGET_WIDTH = 768
const TARGET_HEIGHT = 1024
const JPEG_QUALITY = 92

const CATEGORY_REGION: Record<TryOnCategory, { from: 'top' | 'bottom' | 'full'; offsetPercent: number; keepPercent: number }> = {
  upper_body: { from: 'top', offsetPercent: 0.12, keepPercent: 0.52 },  // Skip head (top 12%), keep torso
  lower_body: { from: 'bottom', offsetPercent: 0.05, keepPercent: 0.60 }, // Skip shoes (bottom 5%), keep pants
  dresses:    { from: 'full', offsetPercent: 0, keepPercent: 1.0 },      // Use full content
}

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

async function downloadImageToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download image (status ${response.status})`)
  }

  return Buffer.from(await response.arrayBuffer())
}

export async function preprocessGarmentImage(options: {
  imageUrl: string
  merchantId: number
  category: TryOnCategory
}): Promise<PreprocessedGarmentResult> {
  const steps: string[] = []

  const rawBuffer = await downloadImageToBuffer(options.imageUrl)
  const rawMeta = await sharp(rawBuffer).metadata()
  const originalWidth = rawMeta.width ?? 0
  const originalHeight = rawMeta.height ?? 0
  steps.push(`downloaded (${originalWidth}×${originalHeight})`)

  const pipeline = sharp(rawBuffer).rotate()

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
    trimmedBuffer = await pipeline.toBuffer()
    trimmedWidth = originalWidth
    trimmedHeight = originalHeight
    steps.push('trim skipped (no uniform border)')
  }

  const region = CATEGORY_REGION[options.category]

  if (region.from !== 'full' && region.keepPercent < 1.0 && trimmedHeight > 200) {
    const extractHeight = Math.round(trimmedHeight * region.keepPercent)
    const offsetRows = Math.round(trimmedHeight * region.offsetPercent)

    if (region.from === 'top') {
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

  const finalBuffer = await sharp(trimmedBuffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: 'contain',
      position: 'centre',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      withoutEnlargement: false,
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer()

  steps.push(`resized → ${TARGET_WIDTH}×${TARGET_HEIGHT} (padded, white bg)`)

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
