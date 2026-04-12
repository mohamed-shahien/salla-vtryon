import sharp from 'sharp'

import {
  findMerchantById,
  getSupabaseClient,
  normalizeWidgetSettings,
} from './merchant.service.js'
import { AppError } from '../utils/app-error.js'

import type { WatermarkPosition, WatermarkSettings } from '@virtual-tryon/shared-types'

interface BrandingJobRecord {
  id: string
  merchant_id: string
  status: string
  result_image_url: string | null
}

interface ImageBuffer {
  buffer: Buffer
  contentType: string
}

export type BrandedImageResult =
  | { kind: 'redirect'; url: string }
  | { kind: 'image'; buffer: Buffer; contentType: string }

const BRANDING_JOB_SELECT = 'id,merchant_id,status,result_image_url'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

async function fetchImageBuffer(url: string, label: string): Promise<ImageBuffer> {
  const response = await fetch(url, {
    headers: {
      Accept: 'image/*',
    },
  })

  if (!response.ok) {
    throw new AppError(
      `${label} image request failed with status ${response.status}.`,
      response.status,
      'BRANDING_IMAGE_FETCH_FAILED',
    )
  }

  const contentType = response.headers.get('content-type') ?? 'application/octet-stream'
  if (!contentType.startsWith('image/')) {
    throw new AppError(
      `${label} URL did not return an image.`,
      422,
      'BRANDING_IMAGE_INVALID',
    )
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType,
  }
}

function getCompositePosition(options: {
  position: WatermarkPosition
  baseWidth: number
  baseHeight: number
  watermarkWidth: number
  watermarkHeight: number
}) {
  const margin = Math.max(12, Math.round(Math.min(options.baseWidth, options.baseHeight) * 0.04))
  const leftEdge = margin
  const rightEdge = Math.max(margin, options.baseWidth - options.watermarkWidth - margin)
  const topEdge = margin
  const bottomEdge = Math.max(margin, options.baseHeight - options.watermarkHeight - margin)

  switch (options.position) {
    case 'top-left':
      return { left: leftEdge, top: topEdge }
    case 'top-right':
      return { left: rightEdge, top: topEdge }
    case 'bottom-left':
      return { left: leftEdge, top: bottomEdge }
    case 'center':
      return {
        left: Math.max(0, Math.round((options.baseWidth - options.watermarkWidth) / 2)),
        top: Math.max(0, Math.round((options.baseHeight - options.watermarkHeight) / 2)),
      }
    case 'bottom-right':
    default:
      return { left: rightEdge, top: bottomEdge }
  }
}

async function createWatermarkBuffer(
  logoBuffer: Buffer,
  watermark: WatermarkSettings,
  baseWidth: number,
) {
  const logoWidth = clamp(watermark.size, 24, Math.max(24, Math.round(baseWidth * 0.35)))
  const resizedLogo = await sharp(logoBuffer)
    .resize({ width: logoWidth, withoutEnlargement: true })
    .png()
    .toBuffer()

  const metadata = await sharp(resizedLogo).metadata()
  const width = metadata.width
  const height = metadata.height

  if (!width || !height) {
    throw new AppError('Watermark logo dimensions could not be read.', 422, 'BRANDING_LOGO_INVALID')
  }

  const opacityMask = {
    create: {
      width,
      height,
      channels: 4 as const,
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: clamp(watermark.opacity, 0, 1),
      },
    },
  }

  const buffer = await sharp(resizedLogo)
    .ensureAlpha()
    .composite([{ input: opacityMask, blend: 'dest-in' }])
    .png()
    .toBuffer()

  return {
    buffer,
    width,
    height,
  }
}

export async function getBrandedJobImage(jobId: string): Promise<BrandedImageResult> {
  const db = getSupabaseClient()

  const { data: job, error } = await db
    .from('tryon_jobs')
    .select(BRANDING_JOB_SELECT)
    .eq('id', jobId)
    .limit(1)
    .maybeSingle<BrandingJobRecord>()

  if (error) {
    throw new AppError(error.message, 500, 'BRANDED_IMAGE_LOOKUP_FAILED')
  }

  if (!job || job.status !== 'completed' || !job.result_image_url) {
    throw new AppError('Completed try-on result was not found.', 404, 'BRANDED_IMAGE_NOT_FOUND')
  }

  const merchant = await findMerchantById(job.merchant_id)
  if (!merchant) {
    throw new AppError('Merchant record was not found.', 404, 'MERCHANT_NOT_FOUND')
  }

  const settings = normalizeWidgetSettings(merchant.settings)
  const watermark = settings.visual_identity.watermark
  const logoUrl = watermark.logo_url.trim()

  if (!watermark.enabled || !logoUrl) {
    return {
      kind: 'redirect',
      url: job.result_image_url,
    }
  }

  const [resultImage, logoImage] = await Promise.all([
    fetchImageBuffer(job.result_image_url, 'Result'),
    fetchImageBuffer(logoUrl, 'Watermark logo'),
  ])

  const baseMetadata = await sharp(resultImage.buffer).metadata()
  const baseWidth = baseMetadata.width
  const baseHeight = baseMetadata.height

  if (!baseWidth || !baseHeight) {
    throw new AppError('Result image dimensions could not be read.', 422, 'BRANDING_RESULT_INVALID')
  }

  const watermarkImage = await createWatermarkBuffer(logoImage.buffer, watermark, baseWidth)
  const position = getCompositePosition({
    position: watermark.position,
    baseWidth,
    baseHeight,
    watermarkWidth: watermarkImage.width,
    watermarkHeight: watermarkImage.height,
  })

  const buffer = await sharp(resultImage.buffer)
    .rotate()
    .composite([
      {
        input: watermarkImage.buffer,
        left: position.left,
        top: position.top,
      },
    ])
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer()

  return {
    kind: 'image',
    buffer,
    contentType: 'image/jpeg',
  }
}
