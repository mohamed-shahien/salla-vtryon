import { randomUUID } from 'node:crypto'

import sharp from 'sharp'

import type { TryOnCategory } from './jobs.service.js'
import { uploadBufferToBunny } from './bunny.service.js'

const TARGET_WIDTH = 768
const TARGET_HEIGHT = 1024
const JPEG_QUALITY = 92

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
  category?: TryOnCategory
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
