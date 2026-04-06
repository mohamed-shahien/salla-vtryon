import { AppError } from '../utils/app-error.js'
import { getMerchantProductDetail } from './products.service.js'
import {
  createMerchantTryOnJob,
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
  // Legacy aliases for backward compatibility
  mode: 'all' | 'selected'
  products: number[]
  enabled: boolean
  
  widget_mode: 'all' | 'selected'
  widget_products: number[]
  button_text: string
  default_category: TryOnCategory
  widget_token: string | null
  reason: string | null
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



export async function getWidgetConfig(
  sallaMerchantId: number,
  currentProductId?: string | null,
) {
  // Auto-register the merchant on first widget contact — no manual install step required.
  // The merchant starts on the free plan (10 credits) with the widget enabled by default.
  let merchant = await findMerchantBySallaMerchantId(sallaMerchantId)

  if (!merchant) {
    merchant = await ensureMerchantRecord({ sallaMerchantId })
  }

  const settings = normalizeWidgetSettings(merchant.settings)
  const overallEnabled =
    merchant.is_active === true && merchant.plan_status === 'active' && settings.widget_enabled

  // Step 1: Fetch Rule for current product (if applicable)
  let currentProductRule: { enabled: boolean } | null = null
  if (currentProductId) {
    currentProductRule = await getMerchantProductRule(merchant.id, currentProductId)
  }

  // Step 2: Determine if widget is enabled for this specific page
  const currentProductEnabled =
    overallEnabled && currentProductId
      ? isWidgetEnabledForProduct(settings, currentProductId, currentProductRule)
      : overallEnabled && settings.widget_mode === 'all'

  // Step 3: Fetch all enabled products for 'selected' mode (backward compatibility + fallback)
  let widgetProducts = settings.widget_products
  if (settings.widget_mode === 'selected') {
    const rules = await getMerchantProductRules(merchant.id)
    const enabledFromRules = rules.filter((r) => r.enabled).map((r) => r.product_id)
    const disabledFromRules = new Set(rules.filter((r) => !r.enabled).map((r) => r.product_id))

    // Merge: legacy fallback minus explicit disables
    widgetProducts = Array.from(
      new Set([
        ...enabledFromRules,
        ...settings.widget_products.filter((id) => !disabledFromRules.has(id)),
      ]),
    )
  }

  // Edge Case: selected mode + no products enabled -> widget NOT rendered
  const finalProductEnabled =
    currentProductEnabled &&
    (settings.widget_mode === 'all' || widgetProducts.length > 0)

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
    widget_mode: settings.widget_mode,
    widget_products: widgetProducts,
    
    // LOCKED Legacy Aliases
    mode: settings.widget_mode,
    products: widgetProducts,
    enabled: finalProductEnabled,

    button_text: settings.widget_button_text,
    default_category: settings.default_category,
    widget_token:
      currentProductId && finalProductEnabled
        ? createWidgetToken({
            merchantUuid: merchant.id,
            merchantId: merchant.salla_merchant_id,
            productId: currentProductId,
          })
        : null,
    reason,
  } satisfies WidgetConfigPayload

  return config
}

export async function createWidgetTryOnJob(options: {
  token: string
  shopperImageBuffer: Buffer
  category?: TryOnCategory
  productImageUrl?: string | null
}) {
  const widgetContext = readWidgetToken(options.token)
  const merchant = await findMerchantById(widgetContext.merchant_uuid)

  if (!merchant || merchant.is_active !== true || merchant.plan_status !== 'active') {
    throw new AppError('This merchant is not active for widget jobs.', 403, 'WIDGET_DISABLED')
  }

  const settings = await getMerchantWidgetSettings(widgetContext.merchant_uuid)
  const rule = await getMerchantProductRule(widgetContext.merchant_uuid, widgetContext.product_id)

  if (!isWidgetEnabledForProduct(settings, widgetContext.product_id, rule)) {
    throw new AppError('This product is not enabled for widget try-on.', 403, 'PRODUCT_NOT_ENABLED')
  }

  const upload = await processAndUploadMerchantImage({
    merchantId: widgetContext.merchant_id,
    buffer: options.shopperImageBuffer,
  })

  const clientProductImageUrl = options.productImageUrl?.trim() || null

  // Fetch product details from Salla (best-effort).
  // If OAuth tokens are absent but the widget already sent an image URL, we proceed without them.
  let productPayload: Awaited<ReturnType<typeof getMerchantProductDetail>> | null = null
  try {
    productPayload = await getMerchantProductDetail(
      widgetContext.merchant_id,
      widgetContext.product_id,
    )
  } catch (fetchError) {
    if (!clientProductImageUrl) {
      // No fallback — cannot proceed without at least one image source
      throw new AppError(
        'Product image could not be retrieved. Re-authorize the app in your Salla dashboard.',
        422,
        'PRODUCT_IMAGE_MISSING',
      )
    }
    // Log and continue — we have a client-provided image URL
    console.warn('[widget] Salla product fetch failed, using client-provided product image URL', fetchError instanceof Error ? fetchError.message : fetchError)
  }

  const productImageUrl = clientProductImageUrl ?? extractProductImage(productPayload?.data)

  if (!productImageUrl) {
    throw new AppError(
      'The selected product does not expose an image usable for widget try-on.',
      422,
      'PRODUCT_IMAGE_MISSING',
    )
  }

  const job = await createMerchantTryOnJob({
    merchantId: widgetContext.merchant_uuid,
    userImageUrl: upload.url,
    productImageUrl,
    productId: widgetContext.product_id,
    category: options.category ?? settings.default_category,
    metadata: {
      source: 'widget',
      product_name: extractProductName(productPayload?.data ?? null),
      product_thumbnail: productImageUrl,
      upload_storage_path: upload.storage_path,
    },
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
