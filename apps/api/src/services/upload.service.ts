import { randomUUID } from 'node:crypto'

import sharp from 'sharp'

import { AppError } from '../utils/app-error.js'
import { uploadBufferToBunny } from './bunny.service.js'

const MAX_IMAGE_DIMENSION = 1024
const MIN_IMAGE_DIMENSION = 256
const SUPPORTED_IMAGE_FORMATS = new Set(['jpeg', 'png', 'webp'])

async function normalizeImageToJpeg(buffer: Buffer) {
  let metadata: sharp.Metadata

  try {
    metadata = await sharp(buffer).metadata()
  } catch {
    throw new AppError('Uploaded file is not a valid image.', 400, 'INVALID_IMAGE_FILE')
  }

  if (!metadata.format || !SUPPORTED_IMAGE_FORMATS.has(metadata.format)) {
    throw new AppError(
      'Only JPEG, PNG, and WebP images are supported.',
      400,
      'UNSUPPORTED_IMAGE_FORMAT',
    )
  }

  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < MIN_IMAGE_DIMENSION ||
    metadata.height < MIN_IMAGE_DIMENSION
  ) {
    throw new AppError(
      `Image dimensions must be at least ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION}.`,
      400,
      'IMAGE_DIMENSIONS_TOO_SMALL',
    )
  }

  const processedBuffer = await sharp(buffer)
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 90,
      mozjpeg: true,
    })
    .toBuffer()

  const outputMetadata = await sharp(processedBuffer).metadata()

  return {
    originalMetadata: metadata,
    processedBuffer,
    outputMetadata,
  }
}

export async function processAndUploadMerchantImage(options: {
  merchantId: number
  buffer: Buffer
}) {
  const normalized = await normalizeImageToJpeg(options.buffer)
  const storagePath = `${options.merchantId}/uploads/${randomUUID()}.jpg`
  const upload = await uploadBufferToBunny(
    storagePath,
    normalized.processedBuffer,
    'image/jpeg',
  )

  return {
    url: upload.url,
    storage_path: upload.storagePath,
    content_type: 'image/jpeg',
    bytes: normalized.processedBuffer.byteLength,
    width: normalized.outputMetadata.width ?? null,
    height: normalized.outputMetadata.height ?? null,
    original_format: normalized.originalMetadata.format,
  }
}

export async function processAndUploadReplicateResultImage(options: {
  merchantId: number
  sourceUrl: string
}) {
  const response = await fetch(options.sourceUrl)

  if (!response.ok) {
    throw new AppError(
      `Failed to download Replicate result image with status ${response.status}.`,
      response.status,
      'REPLICATE_RESULT_DOWNLOAD_FAILED',
    )
  }

  const sourceBuffer = Buffer.from(await response.arrayBuffer())
  const normalized = await normalizeImageToJpeg(sourceBuffer)
  const storagePath = `${options.merchantId}/results/${randomUUID()}.jpg`
  const upload = await uploadBufferToBunny(
    storagePath,
    normalized.processedBuffer,
    'image/jpeg',
  )

  return {
    url: upload.url,
    storage_path: upload.storagePath,
    content_type: 'image/jpeg',
    bytes: normalized.processedBuffer.byteLength,
    width: normalized.outputMetadata.width ?? null,
    height: normalized.outputMetadata.height ?? null,
    original_format: normalized.originalMetadata.format,
  }
}
