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
  credits_remaining: number
  reason: string | null
  settings: Record<string, any>
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
  metadata: {
    current_step?: 'ANALYZING_IMAGES' | 'PREPARING_GARMENT' | 'GENERATING_RESULT' | 'FINALIZING'
    progress?: number
    retry_count?: number
    cache_hit?: boolean
    request_id?: string
    duration?: number
  }
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
  productImageUrl?: string | null,
  requestId?: string | null,
) {
  const formData = new FormData()
  formData.append('file', file)
  if (productImageUrl) {
    formData.append('product_image_url', productImageUrl)
  }
  if (requestId) {
    formData.append('request_id', requestId)
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

export function getPollInterval(job: WidgetJobResponse): number {
  if (job.status === 'pending') return 10000 // 10s
  if (job.status === 'processing') {
    const progress = job.metadata?.progress || 0
    if (progress > 70) return 3000 // 3s - near completion
    if (progress > 30) return 5000 // 5s - in progress
    return 5000 // 5s - early processing
  }
  return 3000 // 3s default
}
