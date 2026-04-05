export interface DashboardMerchantIdentity {
  merchant_uuid: string
  merchant_id: number
  user_id: number | null
  store_name: string | null
  issued_at: string
  exp: string
  merchant: {
    id: string
    salla_merchant_id: number
    store_name: string | null
    plan: string | null
    plan_status: string | null
    is_active: boolean | null
    settings: MerchantWidgetSettings | null
    installed_at: string | null
    uninstalled_at: string | null
    created_at: string
    updated_at: string
  }
  credits: {
    total_credits: number
    used_credits: number
    remaining_credits: number
    reset_at: string | null
  } | null
  salla_profile: {
    id: number
    name: string
    email: string
    mobile?: string
    role?: string
    context?: {
      app?: number
      scope?: string
      exp?: number
    }
    merchant: {
      id: number
      username?: string
      name: string
      avatar?: string
    }
  } | null
}

export interface CreditTransaction {
  id: string
  merchant_id: string
  amount: number
  type: 'debit' | 'credit' | 'refund' | 'reset'
  reason: string | null
  job_id: string | null
  created_at: string
}

export interface MerchantCreditsSummary {
  balance: {
    total_credits: number
    used_credits: number
    remaining_credits: number
    reset_at: string | null
    updated_at: string
  } | null
  transactions: CreditTransaction[]
}

export type TryOnJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'canceled'
export type TryOnCategory = 'upper_body' | 'lower_body' | 'dresses'
export type WidgetMode = 'all' | 'selected'

export interface MerchantWidgetSettings {
  widget_enabled: boolean
  widget_mode: WidgetMode
  widget_products: number[]
  widget_button_text: string
  default_category: TryOnCategory
}

export interface TryOnJob {
  id: string
  merchant_id: string
  status: TryOnJobStatus
  user_image_url: string
  product_image_url: string
  product_id: string | null
  category: TryOnCategory
  result_image_url: string | null
  replicate_prediction_id: string | null
  error_message: string | null
  metadata: Record<string, unknown>
  processing_started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface ApiPagination {
  page: number
  limit: number
  total: number
  total_pages: number
  has_more: boolean
}

export interface SallaProductImage {
  id: number
  url: string
  main?: boolean
  alt?: string
  type?: string
}

export interface SallaProduct {
  id: number
  name: string
  status?: string
  is_available?: boolean
  main_image?: string
  thumbnail?: string
  quantity?: number
  description?: string
  images?: SallaProductImage[]
  urls?: {
    customer?: string
    admin?: string
    product_card?: string
  }
  price?: {
    amount: number
    currency: string
  }
  sale_price?: {
    amount: number
    currency: string
  } | null
}

export interface MerchantUploadResult {
  url: string
  storage_path: string
  content_type: string
  bytes: number
  width: number | null
  height: number | null
  original_format: string | null
}

interface ApiResponse<TData> {
  ok: true
  data: TData
  pagination?: ApiPagination | null
}

interface ApiErrorResponse {
  error?: string
  message?: string
  details?: unknown
}

function getApiErrorMessage(text: string, fallbackMessage: string) {
  if (!text) {
    return fallbackMessage
  }

  try {
    const parsed = JSON.parse(text) as ApiErrorResponse

    if (parsed.message) {
      return parsed.message
    }
  } catch {
    return text
  }

  return text
}

async function parseApiResponse<TData>(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(getApiErrorMessage(text, fallbackMessage))
  }

  return (await response.json()) as ApiResponse<TData>
}

export async function verifyAuthHandoff(handoff: string) {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({ handoff }),
  })

  return parseApiResponse<DashboardMerchantIdentity>(
    response,
    `Auth handoff verification failed with status ${response.status}`,
  )
}

export async function fetchCurrentMerchant() {
  const response = await fetch('/api/auth/me', {
    credentials: 'same-origin',
  })

  if (response.status === 401) {
    return null
  }

  return parseApiResponse<DashboardMerchantIdentity>(
    response,
    `Merchant lookup failed with status ${response.status}`,
  )
}

export async function logoutCurrentMerchant() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(getApiErrorMessage(text, `Logout failed with status ${response.status}`))
  }
}

export async function fetchMerchantCredits(limit = 20) {
  const response = await fetch(`/api/credits?limit=${limit}`, {
    credentials: 'same-origin',
  })

  return parseApiResponse<MerchantCreditsSummary>(
    response,
    `Credits lookup failed with status ${response.status}`,
  )
}

export async function fetchMerchantProducts(page = 1) {
  const response = await fetch(`/api/products?page=${page}`, {
    credentials: 'same-origin',
  })

  return parseApiResponse<SallaProduct[]>(
    response,
    `Products lookup failed with status ${response.status}`,
  )
}

export async function fetchMerchantJobs(options?: {
  page?: number
  limit?: number
  status?: TryOnJobStatus
}) {
  const searchParams = new URLSearchParams()

  if (options?.page) {
    searchParams.set('page', String(options.page))
  }

  if (options?.limit) {
    searchParams.set('limit', String(options.limit))
  }

  if (options?.status) {
    searchParams.set('status', options.status)
  }

  const query = searchParams.toString()
  const response = await fetch(query ? `/api/jobs?${query}` : '/api/jobs', {
    credentials: 'same-origin',
  })

  return parseApiResponse<TryOnJob[]>(
    response,
    `Jobs lookup failed with status ${response.status}`,
  )
}

export async function fetchMerchantJob(jobId: string) {
  const response = await fetch(`/api/jobs/${jobId}`, {
    credentials: 'same-origin',
  })

  return parseApiResponse<TryOnJob>(
    response,
    `Job lookup failed with status ${response.status}`,
  )
}

export async function uploadMerchantImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    credentials: 'same-origin',
    body: formData,
  })

  return parseApiResponse<MerchantUploadResult>(
    response,
    `Image upload failed with status ${response.status}`,
  )
}

export async function createTryOnJob(input: {
  user_image_url: string
  product_image_url: string
  product_id: string
  category: TryOnCategory
  metadata?: Record<string, unknown>
}) {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(input),
  })

  return parseApiResponse<TryOnJob>(
    response,
    `Job creation failed with status ${response.status}`,
  )
}

export async function fetchWidgetSettings() {
  const response = await fetch('/api/widget/settings', {
    credentials: 'same-origin',
  })

  return parseApiResponse<MerchantWidgetSettings>(
    response,
    `Widget settings lookup failed with status ${response.status}`,
  )
}

export async function updateWidgetSettings(input: Partial<MerchantWidgetSettings>) {
  const response = await fetch('/api/widget/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(input),
  })

  return parseApiResponse<MerchantWidgetSettings>(
    response,
    `Widget settings update failed with status ${response.status}`,
  )
}
