export type WidgetCategory = 'upper_body' | 'lower_body' | 'dresses'
export type WidgetJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'canceled'

export interface WidgetConfigResponse {
  merchant_id: number
  current_product_id: string | null
  overall_enabled: boolean
  current_product_enabled: boolean
  widget_mode: 'all' | 'selected'
  widget_products: number[]
  button_text: string
  default_category: WidgetCategory
  widget_token: string | null
  reason: string | null
}

export interface WidgetJobResponse {
  id: string
  merchant_id: string
  status: WidgetJobStatus
  user_image_url: string
  product_image_url: string
  product_id: string | null
  category: WidgetCategory
  result_image_url: string | null
  replicate_prediction_id: string | null
  error_message: string | null
  metadata: Record<string, unknown>
  processing_started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

interface ApiEnvelope<TData> {
  ok: true
  data: TData
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, '')
}

/**
 * Base headers sent with every widget API request.
 *
 * ngrok-skip-browser-warning: bypasses ngrok's HTML interstitial page in
 * development. The header is silently ignored by any non-ngrok server, so it
 * is safe to include unconditionally.
 */
function baseHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'ngrok-skip-browser-warning': '1',
    ...extra,
  }
}

async function parseApiResponse<TData>(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    let message = fallbackMessage

    try {
      const text = await response.text()
      const payload = JSON.parse(text) as { message?: string }
      if (payload.message) {
        message = payload.message
      }
    } catch {
      // keep fallback message
    }

    throw new Error(message)
  }

  return (await response.json()) as ApiEnvelope<TData>
}

export function getWidgetApiUrl(baseUrl: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizeBaseUrl(baseUrl)}${normalizedPath}`
}

export async function fetchWidgetConfig(baseUrl: string, merchantId: number, productId: string) {
  const url = new URL(getWidgetApiUrl(baseUrl, `/api/widget/config/${merchantId}`))
  url.searchParams.set('productId', productId)

  const response = await fetch(url.toString(), {
    headers: baseHeaders(),
  })

  return parseApiResponse<WidgetConfigResponse>(
    response,
    `Widget config request failed with status ${response.status}`,
  )
}

export async function createWidgetJob(
  baseUrl: string,
  token: string,
  file: File,
  category: WidgetCategory,
  productImageUrl?: string | null,
) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)
  if (productImageUrl) {
    formData.append('product_image_url', productImageUrl)
  }

  const response = await fetch(getWidgetApiUrl(baseUrl, '/api/widget/job'), {
    method: 'POST',
    headers: baseHeaders({ 'X-Widget-Token': token }),
    body: formData,
  })

  return parseApiResponse<WidgetJobResponse>(
    response,
    `Widget job creation failed with status ${response.status}`,
  )
}

export async function fetchWidgetJob(baseUrl: string, token: string, jobId: string) {
  const response = await fetch(getWidgetApiUrl(baseUrl, `/api/widget/job/${jobId}`), {
    headers: baseHeaders({ 'X-Widget-Token': token }),
  })

  return parseApiResponse<WidgetJobResponse>(
    response,
    `Widget job lookup failed with status ${response.status}`,
  )
}
