import { AppError } from '../utils/app-error.js'
import { getMerchantProductDetail } from './products.service.js'
import {
  createMerchantTryOnJob,
  getMerchantJobById,
  type TryOnCategory,
} from './jobs.service.js'
import {
  findMerchantById,
  findMerchantBySallaMerchantId,
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

function buildDisabledConfig(
  merchantId: number,
  productId: string | null,
  reason: string,
): WidgetConfigPayload {
  return {
    merchant_id: merchantId,
    current_product_id: productId,
    overall_enabled: false,
    current_product_enabled: false,
    widget_mode: 'all',
    widget_products: [],
    button_text: '',
    default_category: 'upper_body',
    widget_token: null,
    reason,
  }
}

export async function getWidgetConfig(
  sallaMerchantId: number,
  currentProductId?: string | null,
) {
  const merchant = await findMerchantBySallaMerchantId(sallaMerchantId)

  if (!merchant) {
    return buildDisabledConfig(sallaMerchantId, currentProductId ?? null, 'Merchant is not installed.')
  }

  const settings = normalizeWidgetSettings(merchant.settings)
  const overallEnabled =
    merchant.is_active === true &&
    merchant.plan_status === 'active' &&
    settings.widget_enabled

  const currentProductEnabled =
    overallEnabled && currentProductId
      ? isWidgetEnabledForProduct(settings, currentProductId)
      : overallEnabled && settings.widget_mode === 'all'

  const reason = !overallEnabled
    ? 'Widget is disabled for this merchant.'
    : !currentProductId
      ? 'Product context is missing for this storefront page.'
    : currentProductId && !currentProductEnabled
      ? 'Widget is not enabled for this product.'
      : null

  return {
    merchant_id: sallaMerchantId,
    current_product_id: currentProductId ?? null,
    overall_enabled: overallEnabled,
    current_product_enabled: currentProductEnabled,
    widget_mode: settings.widget_mode,
    widget_products: settings.widget_products,
    button_text: settings.widget_button_text,
    default_category: settings.default_category,
    widget_token:
      currentProductId && currentProductEnabled
        ? createWidgetToken({
            merchantUuid: merchant.id,
            merchantId: merchant.salla_merchant_id,
            productId: currentProductId,
          })
        : null,
    reason,
  } satisfies WidgetConfigPayload
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

  if (!isWidgetEnabledForProduct(settings, widgetContext.product_id)) {
    throw new AppError('This product is not enabled for widget try-on.', 403, 'PRODUCT_NOT_ENABLED')
  }

  const upload = await processAndUploadMerchantImage({
    merchantId: widgetContext.merchant_id,
    buffer: options.shopperImageBuffer,
  })

  const productPayload = await getMerchantProductDetail(
    widgetContext.merchant_id,
    widgetContext.product_id,
  )
  const productImageUrl =
    options.productImageUrl && options.productImageUrl.trim().length > 0
      ? options.productImageUrl.trim()
      : extractProductImage(productPayload.data)

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
      product_name: extractProductName(productPayload.data),
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
