import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'
import {
  findMerchantBySallaMerchantId,
  getMerchantTokensForApi,
  updateMerchantRefreshedTokens,
} from './merchant.service.js'

interface SallaApiEnvelope<TData> {
  status: number
  success: boolean
  data: TData
  pagination?: unknown
  error?: {
    code?: string
    message?: string
  }
}

interface SallaRefreshResponse {
  access_token: string
  refresh_token: string
  token_type?: string
  expires?: number
}

interface SallaOauthTokenResponse {
  access_token: string
  refresh_token: string
  token_type?: string
  scope?: string
  expires?: number
}

interface SallaUserInfoResponse {
  status: number
  success: boolean
  data: {
    id: number
    name: string
    email: string
    mobile?: string
    role?: string
    merchant: {
      id: number
      username?: string
      name: string
      avatar?: string
    }
  }
}

export interface SallaProduct {
  id: number
  name: string
  status: string
  is_available: boolean
  main_image: string | null
  thumbnail: string | null
  images?: { id: number; url: string; main: boolean }[]
  urls?: {
    customer?: string
    admin?: string
  }
  price?: {
    amount: number
    currency: string
  }
}

export interface SallaMerchantUserInfo {
  id: number
  name: string
  email: string
  mobile?: string
  role?: string
  merchant: {
    id: number
    username?: string
    name: string
    avatar?: string
  }
}

const refreshLocks = new Map<number, Promise<string>>()

function isTokenExpired(expiresAt: string | null) {
  if (!expiresAt) {
    return true
  }

  const parsed = Date.parse(expiresAt)

  if (Number.isNaN(parsed)) {
    return true
  }

  return parsed <= Date.now() + 60_000
}

async function refreshMerchantAccessToken(sallaMerchantId: number) {
  const existingLock = refreshLocks.get(sallaMerchantId)
  if (existingLock) {
    return existingLock
  }

  const lock = (async () => {
    if (!env.SALLA_CLIENT_ID || !env.SALLA_CLIENT_SECRET) {
      throw new AppError(
        'Salla OAuth client credentials are required to refresh merchant access tokens.',
        500,
        'CONFIGURATION_ERROR',
      )
    }

    const { merchant, refreshToken } = await getMerchantTokensForApi(sallaMerchantId)

    const response = await fetch(`${env.SALLA_ACCOUNTS_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: env.SALLA_CLIENT_ID,
        client_secret: env.SALLA_CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      throw new AppError(
        `Salla token refresh failed with status ${response.status}.`,
        response.status,
        'SALLA_TOKEN_REFRESH_FAILED',
      )
    }

    const payload = (await response.json()) as SallaRefreshResponse

    if (!payload.access_token || !payload.refresh_token) {
      throw new AppError(
        'Salla token refresh did not return both access and refresh tokens.',
        500,
        'SALLA_TOKEN_REFRESH_INVALID',
      )
    }

    await updateMerchantRefreshedTokens({
      merchantId: merchant.id,
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresAt: payload.expires ?? null,
    })

    return payload.access_token
  })().finally(() => {
    refreshLocks.delete(sallaMerchantId)
  })

  refreshLocks.set(sallaMerchantId, lock)

  return lock
}

async function getUsableMerchantAccessToken(sallaMerchantId: number) {
  const { merchant, accessToken } = await getMerchantTokensForApi(sallaMerchantId)

  if (!merchant.token_expires_at) {
    return accessToken
  }

  if (!isTokenExpired(merchant.token_expires_at)) {
    return accessToken
  }

  return refreshMerchantAccessToken(sallaMerchantId)
}

async function runMerchantApiRequest<TData>(
  sallaMerchantId: number,
  path: string,
  init?: RequestInit,
) {
  let accessToken = await getUsableMerchantAccessToken(sallaMerchantId)

  const send = async (token: string) =>
    fetch(`${env.SALLA_ADMIN_API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    })

  let response = await send(accessToken)

  if (response.status === 401) {
    accessToken = await refreshMerchantAccessToken(sallaMerchantId)
    response = await send(accessToken)
  }

  if (!response.ok) {
    let upstreamMessage = ''

    try {
      upstreamMessage = await response.text()
    } catch {
      upstreamMessage = ''
    }

    const scopeHint =
      (response.status === 401 || response.status === 403) && path.startsWith('/products')
        ? ' Ensure the Salla app has `products.read` scope and then re-authorize the merchant.'
        : ''

    throw new AppError(
      `Salla admin request failed with status ${response.status}.${scopeHint}`,
      response.status,
      'SALLA_ADMIN_REQUEST_FAILED',
      upstreamMessage ? { upstream: upstreamMessage } : undefined,
    )
  }

  const payload = (await response.json()) as SallaApiEnvelope<TData>

  if (!payload.success) {
    throw new AppError(
      payload.error?.message ?? 'Salla admin request failed.',
      response.status,
      'SALLA_ADMIN_REQUEST_FAILED',
      payload.error,
    )
  }

  return payload
}

export async function listMerchantProducts(sallaMerchantId: number, page = 1) {
  return runMerchantApiRequest<SallaProduct[]>(sallaMerchantId, `/products?page=${page}`)
}

export async function getMerchantProduct(sallaMerchantId: number, productId: string | number) {
  return runMerchantApiRequest<unknown>(sallaMerchantId, `/products/${productId}`)
}

export async function inferMerchantPlanFromSalla(sallaMerchantId: number) {
  const merchant = await findMerchantBySallaMerchantId(sallaMerchantId)

  if (!merchant?.access_token_encrypted || !merchant?.refresh_token_encrypted) {
    return null
  }

  try {
    const payload = await runMerchantApiRequest<unknown[]>(
      sallaMerchantId,
      `/apps/subscriptions?app_id=${env.SALLA_APP_ID ?? ''}`,
    )

    if (!Array.isArray(payload.data)) {
      return null
    }

    const appSubscription = payload.data.find((item) => {
      if (!item || typeof item !== 'object') {
        return false
      }

      const candidate = item as Record<string, unknown>
      return candidate.item_type === 'plan' || candidate.type === 'plan'
    }) as Record<string, unknown> | undefined

    if (!appSubscription) {
      return null
    }

    const planName = appSubscription.plan_name
    return typeof planName === 'string' ? planName : null
  } catch {
    return null
  }
}

export function getSallaOauthCallbackUrl() {
  const callbackUrl = env.SALLA_CALLBACK_URL ?? (env.API_URL ? `${env.API_URL.replace(/\/$/, '')}/api/auth/salla/callback` : undefined)

  if (!callbackUrl) {
    throw new AppError(
      'A public OAuth callback URL is required. Set SALLA_CALLBACK_URL or API_URL.',
      500,
      'CONFIGURATION_ERROR',
    )
  }

  return callbackUrl
}

export function buildSallaAuthorizationUrl(state: string) {
  if (!env.SALLA_CLIENT_ID) {
    throw new AppError('SALLA_CLIENT_ID is required for OAuth login.', 500, 'CONFIGURATION_ERROR')
  }

  const params = new URLSearchParams({
    client_id: env.SALLA_CLIENT_ID,
    response_type: 'code',
    redirect_uri: getSallaOauthCallbackUrl(),
    scope: env.SALLA_OAUTH_SCOPES,
    state,
  })

  return `${env.SALLA_ACCOUNTS_BASE_URL}/oauth2/auth?${params.toString()}`
}

export async function exchangeAuthorizationCode(code: string) {
  if (!env.SALLA_CLIENT_ID || !env.SALLA_CLIENT_SECRET) {
    throw new AppError(
      'Salla OAuth client credentials are required to exchange the authorization code.',
      500,
      'CONFIGURATION_ERROR',
    )
  }

  const response = await fetch(`${env.SALLA_ACCOUNTS_BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.SALLA_CLIENT_ID,
      client_secret: env.SALLA_CLIENT_SECRET,
      code,
      redirect_uri: getSallaOauthCallbackUrl(),
    }),
  })

  if (!response.ok) {
    throw new AppError(
      `Salla authorization code exchange failed with status ${response.status}.`,
      response.status,
      'SALLA_CODE_EXCHANGE_FAILED',
    )
  }

  const payload = (await response.json()) as SallaOauthTokenResponse

  if (!payload.access_token || !payload.refresh_token) {
    throw new AppError(
      'Salla token exchange did not return both access and refresh tokens.',
      500,
      'SALLA_CODE_EXCHANGE_INVALID',
    )
  }

  return payload
}

export async function fetchMerchantUserInfo(accessToken: string) {
  const response = await fetch(`${env.SALLA_ACCOUNTS_BASE_URL}/oauth2/user/info`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new AppError(
      `Salla user info request failed with status ${response.status}.`,
      response.status,
      'SALLA_USER_INFO_FAILED',
    )
  }

  const payload = (await response.json()) as SallaUserInfoResponse

  if (!payload.success || !payload.data?.merchant?.id) {
    throw new AppError('Salla user info payload is missing merchant identity.', 500, 'SALLA_USER_INFO_INVALID')
  }

  return payload.data satisfies SallaMerchantUserInfo
}

export async function fetchMerchantUserInfoForMerchant(sallaMerchantId: number) {
  const accessToken = await getUsableMerchantAccessToken(sallaMerchantId)
  return fetchMerchantUserInfo(accessToken)
}
