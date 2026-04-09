import { randomUUID } from 'node:crypto'

import { AppError } from '../utils/app-error.js'
import { widgetConfigCache, productRulesCache, productDetailsCache } from '../lib/cache.js'
import {
  analyzeGarmentImage,
  analyzeHumanImage,
} from './image-analysis.service.js'
import { getMerchantProductDetail } from './products.service.js'
import {
  createMerchantTryOnJob,
  findMerchantJobByRequestId,
  getMerchantJobById,
  type TryOnCategory,
} from './jobs.service.js'
import {
  ensureMerchantRecord,
  findMerchantById,
  findMerchantBySallaMerchantId,
  getMerchantProductRule,
  getMerchantProductRules,
  getMerchantWidgetSettings,
  isWidgetEnabledForProduct,
  normalizeWidgetSettings,
} from './merchant.service.js'
import { processAndUploadMerchantImage } from './upload.service.js'
import { createWidgetToken, readWidgetToken } from './widget-token.service.js'

interface WidgetConfigPayload {
  merchant_id: number
  current_product_id: string | null
  overall_enabled: boolean
  current_product_enabled: boolean
  enabled: boolean
  
  widget_token: string | null
  reason: string | null
  settings: Record<string, unknown>
  schema_version: number
}

function extractProductImage(product: unknown) {
  if (!product || typeof product !== 'object') {
    return null
  }

  const candidate = product as Record<string, unknown>

  if (typeof candidate.main_image === 'string' && candidate.main_image.length > 0) {
    return candidate.main_image
  }

  if (typeof candidate.thumbnail === 'string' && candidate.thumbnail.length > 0) {
    return candidate.thumbnail
  }

  if (Array.isArray(candidate.images)) {
    for (const image of candidate.images) {
      if (
        image &&
        typeof image === 'object' &&
        typeof (image as Record<string, unknown>).url === 'string'
      ) {
        return (image as Record<string, string>).url
      }
    }
  }

  return null
}

function extractProductName(product: unknown) {
  if (!product || typeof product !== 'object') {
    return null
  }

  const candidate = product as Record<string, unknown>
  return typeof candidate.name === 'string' ? candidate.name : null
}

function detectCategory(name: string): TryOnCategory {
  const n = name.toLowerCase()
  if (
    n.includes('pant') ||
    n.includes('trouser') ||
    n.includes('jean') ||
    n.includes('short') ||
    n.includes('skirt') ||
    n.includes('legging') ||
    n.includes('بنطلون') ||
    n.includes('تنورة') ||
    n.includes('شورت')
  ) return 'lower_body'

  if (
    n.includes('dress') ||
    n.includes('gown') ||
    n.includes('jumpsuit') ||
    n.includes('abaya') ||
    n.includes('فستان') ||
    n.includes('عباية') ||
    n.includes('جمبسوت')
  ) return 'dresses'

  return 'upper_body'
}

export async function getWidgetConfig(
  sallaMerchantId: number,
  currentProductId?: string | null,
) {
  // Use cache for widget config - only cache when no current product to avoid stale per-product state
  const cacheKey = `widget:${sallaMerchantId}:${currentProductId || 'no-product'}`

  const cached = widgetConfigCache.get(cacheKey)
  if (cached && !currentProductId) {
    return cached
  }

  // Get merchant first (needed for product rule query)
  let merchant = await findMerchantBySallaMerchantId(sallaMerchantId)
  if (!merchant) {
    merchant = await ensureMerchantRecord({ sallaMerchantId })
  }

  // Parallel queries where possible
  const [productRule, productDetail, rules] = await Promise.all([
    currentProductId ? getMerchantProductRule(merchant.id, currentProductId).catch(() => null) : Promise.resolve(null),
    currentProductId
      ? productDetailsCache.getOrSet(
          `product:${sallaMerchantId}:${currentProductId}`,
          () => getMerchantProductDetail(sallaMerchantId, currentProductId).catch(() => null),
          2 * 60 * 1000 // 2 minutes
        )
      : Promise.resolve(null),
    // Pre-fetch rules if we'll need them
    (async () => {
      const settings = normalizeWidgetSettings(merchant.settings)
      return settings.display_rules.eligibility_mode === 'selected' ? getMerchantProductRules(merchant.id).catch(() => []) : []
    })(),
  ])

  const settings = normalizeWidgetSettings(merchant.settings)
  const overallEnabled =
    merchant.is_active === true && merchant.plan_status === 'active' && settings.widget_enabled

  const productName = extractProductName(productDetail?.data) || ''

  const currentProductEnabled =
    overallEnabled && currentProductId
      ? isWidgetEnabledForProduct(settings, currentProductId, productRule)
      : overallEnabled && settings.display_rules.eligibility_mode === 'all'

  let widgetProducts = settings.display_rules.selected_product_ids
  if (settings.display_rules.eligibility_mode === 'selected' && rules) {
    const enabledFromRules = rules.filter((r) => r.enabled).map((r) => r.product_id)
    const disabledFromRules = new Set(rules.filter((r) => !r.enabled).map((r) => r.product_id))

    widgetProducts = Array.from(
      new Set([
        ...enabledFromRules,
        ...settings.display_rules.selected_product_ids.filter((id: number) => !disabledFromRules.has(id)),
      ]),
    )
  }

  const finalProductEnabled =
    currentProductEnabled &&
    (settings.display_rules.eligibility_mode === 'all' || widgetProducts.length > 0)

  const reason = !overallEnabled
    ? 'Widget is disabled for this merchant.'
    : !currentProductId
      ? 'Product context is missing for this storefront page.'
      : currentProductId && !finalProductEnabled
        ? 'Widget is not enabled for this product or no products are selected.'
        : null

  const config = {
    merchant_id: sallaMerchantId,
    current_product_id: currentProductId ?? null,
    overall_enabled: overallEnabled,
    current_product_enabled: finalProductEnabled,
    enabled: finalProductEnabled,

    widget_token:
      currentProductId && finalProductEnabled
        ? createWidgetToken({
            merchantUuid: merchant.id,
            merchantId: merchant.salla_merchant_id,
            productId: currentProductId,
          })
        : null,
    reason,
    settings: settings as unknown as Record<string, unknown>,
    schema_version: settings.schema_version,
  } satisfies WidgetConfigPayload

  // Cache the config (shorter TTL when there's a product context)
  widgetConfigCache.set(cacheKey, config, currentProductId ? 1 * 60 * 1000 : 5 * 60 * 1000)

  return config
}

function formatQualityRejection(label: string, report: any): string {
  const reasons = report?.reasons ?? []
  const warnings = report?.warnings ?? []
  const issues = [...reasons, ...warnings]
  return `${label}: ${issues.length > 0 ? issues.join(' ') : 'Quality check failed.'}`
}

async function validateImagesBeforeJobCreation(
  productImageUrl: string,
  userImageUrl: string,
): Promise<void> {
  const [garmentReport, humanReport] = await Promise.all([
    analyzeGarmentImage(productImageUrl),
    analyzeHumanImage(userImageUrl),
  ])

  if (garmentReport.verdict === 'reject') {
    const message = formatQualityRejection('Product image rejected', garmentReport)
    console.log(`[widget] quality_gate=reject reason=garment: "${message}"`)
    throw new AppError(message, 422, 'IMAGE_QUALITY_REJECTED', { failure_code: 'GARMENT_QUALITY_REJECT' })
  }

  if (humanReport.verdict === 'reject') {
    const message = formatQualityRejection('Customer image rejected', humanReport)
    console.log(`[widget] quality_gate=reject reason=human: "${message}"`)
    throw new AppError(message, 422, 'IMAGE_QUALITY_REJECTED', { failure_code: 'HUMAN_QUALITY_REJECT' })
  }
}

export async function createWidgetTryOnJob(options: {
  token: string
  shopperImageBuffer: Buffer
  productImageUrl?: string | null
  requestId?: string | null
}) {
  const widgetContext = readWidgetToken(options.token)

  // Parallel queries for better performance
  const [merchant, existingJob, settings, rule] = await Promise.all([
    findMerchantById(widgetContext.merchant_uuid),
    options.requestId
      ? findMerchantJobByRequestId(widgetContext.merchant_uuid, options.requestId).catch(() => null)
      : Promise.resolve(null),
    getMerchantWidgetSettings(widgetContext.merchant_uuid),
    getMerchantProductRule(widgetContext.merchant_uuid, widgetContext.product_id).catch(() => null),
  ])

  if (!merchant || merchant.is_active !== true || merchant.plan_status !== 'active') {
    throw new AppError('This merchant is not active for widget jobs.', 403, 'WIDGET_DISABLED')
  }

  if (existingJob) {
    console.log(`[widget] idempotency: returning existing job ${existingJob.id} for request_id ${options.requestId}`)
    return { job: existingJob, upload: null }
  }

  if (!isWidgetEnabledForProduct(settings, widgetContext.product_id, rule)) {
    throw new AppError('This product is not enabled for widget try-on.', 403, 'PRODUCT_NOT_ENABLED')
  }

  const upload = await processAndUploadMerchantImage({
    merchantId: widgetContext.merchant_id,
    buffer: options.shopperImageBuffer,
  })

  const clientProductImageUrl = options.productImageUrl?.trim() || null

  // Get product detail (cached)
  let productPayload: Awaited<ReturnType<typeof getMerchantProductDetail>> | null = null
  try {
    productPayload = await productDetailsCache.getOrSet(
      `product:${widgetContext.merchant_id}:${widgetContext.product_id}`,
      () => getMerchantProductDetail(widgetContext.merchant_id, widgetContext.product_id),
      2 * 60 * 1000 // 2 minutes
    )
  } catch (fetchError) {
    if (!clientProductImageUrl) {
      throw new AppError(
        'Product image could not be retrieved. Re-authorize the app in your Salla dashboard.',
        422,
        'PRODUCT_IMAGE_MISSING',
      )
    }
  }

  const productImageUrl = clientProductImageUrl ?? extractProductImage(productPayload?.data)

  if (!productImageUrl) {
    throw new AppError(
      'The selected product does not expose an image usable for widget try-on.',
      422,
      'PRODUCT_IMAGE_MISSING',
    )
  }

  await validateImagesBeforeJobCreation(productImageUrl, upload.url)

  const metadata: Record<string, unknown> = {
    source: 'widget',
    product_name: extractProductName(productPayload?.data ?? null),
    product_thumbnail: productImageUrl,
    upload_storage_path: upload.storage_path,
  }

  if (options.requestId) {
    metadata.request_id = options.requestId
  }

  const job = await createMerchantTryOnJob({
    merchantId: widgetContext.merchant_uuid,
    userImageUrl: upload.url,
    productImageUrl,
    productId: widgetContext.product_id,
    category: settings.window.preset === 'progressive-wizard' ? 'upper_body' : 'upper_body', // Simple default for now, can be improved
    metadata,
  })

  return {
    job,
    upload,
  }
}

export async function getWidgetJob(token: string, jobId: string) {
  const widgetContext = readWidgetToken(token)

  return getMerchantJobById(widgetContext.merchant_uuid, jobId)
}
