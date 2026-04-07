import { createHmac } from 'node:crypto'

import type { Response } from 'express'

import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'

const SESSION_COOKIE_NAME = 'vto_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8
const HANDOFF_TTL_MS = 1000 * 60 * 5
const STATE_TTL_MS = 1000 * 60 * 10

export interface DashboardSessionPayload {
  merchant_uuid: string
  merchant_id: number
  user_id: number | null
  local_user_id: string | null
  store_name: string | null
  issued_at: string
  exp: string
}

interface DashboardAuthHandoffPayload {
  session: DashboardSessionPayload
  exp: string
}

interface OAuthStatePayload {
  redirectTo: string
  exp: string
}

function getSessionSigningKey() {
  if (!env.ENCRYPTION_KEY?.trim()) {
    throw new AppError(
      'ENCRYPTION_KEY is required to sign dashboard sessions.',
      500,
      'CONFIGURATION_ERROR',
    )
  }

  return env.ENCRYPTION_KEY.trim()
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signPayload(serializedPayload: string) {
  return createHmac('sha256', getSessionSigningKey())
    .update(serializedPayload)
    .digest('base64url')
}

function normalizeUrl(value: string) {
  return value.replace(/\/$/, '')
}

function createSessionPayload(input: {
  merchantUuid: string
  merchantId: number
  userId: number | null
  localUserId: string | null
  storeName: string | null
}) {
  const issuedAt = new Date()

  return {
    merchant_uuid: input.merchantUuid,
    merchant_id: input.merchantId,
    user_id: input.userId,
    local_user_id: input.localUserId,
    store_name: input.storeName,
    issued_at: issuedAt.toISOString(),
    exp: new Date(issuedAt.getTime() + SESSION_TTL_MS).toISOString(),
  } satisfies DashboardSessionPayload
}

function serializeSignedPayload(value: object) {
  const payload = base64UrlEncode(JSON.stringify(value))
  const signature = signPayload(payload)

  return `${payload}.${signature}`
}

function parseSignedPayload<T>(value: string, errorCode: string, errorMessage: string) {
  const [payload, signature] = value.split('.')
  if (!payload || !signature) {
    throw new AppError(errorMessage, 400, errorCode)
  }

  if (signPayload(payload) !== signature) {
    throw new AppError(errorMessage, 400, errorCode)
  }

  try {
    return JSON.parse(base64UrlDecode(payload)) as T
  } catch {
    throw new AppError(errorMessage, 400, errorCode)
  }
}

export function parseCookies(cookieHeader?: string | null) {
  if (!cookieHeader) {
    return {}
  }

  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf('=')
        if (separatorIndex === -1) {
          return [part, '']
        }

        return [part.slice(0, separatorIndex), decodeURIComponent(part.slice(separatorIndex + 1))]
      }),
  )
}

export function createOauthState() {
  const payload = {
    redirectTo: normalizeUrl(env.DASHBOARD_URL),
    exp: new Date(Date.now() + STATE_TTL_MS).toISOString(),
  } satisfies OAuthStatePayload

  const serializedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signPayload(serializedPayload)

  return `${serializedPayload}.${signature}`
}

export function consumeOauthState(state: string) {
  const [payload, signature] = state.split('.')

  if (!payload || !signature) {
    return {
      redirectTo: normalizeUrl(env.DASHBOARD_URL),
    }
  }

  if (signPayload(payload) !== signature) {
    return {
      redirectTo: normalizeUrl(env.DASHBOARD_URL),
    }
  }

  const parsed = JSON.parse(base64UrlDecode(payload)) as OAuthStatePayload

  if (!parsed.redirectTo || Number.isNaN(Date.parse(parsed.exp)) || Date.parse(parsed.exp) <= Date.now()) {
    return {
      redirectTo: normalizeUrl(env.DASHBOARD_URL),
    }
  }

  return {
    redirectTo: parsed.redirectTo,
  }
}

export function createDashboardSession(input: {
  merchantUuid: string
  merchantId: number
  userId: number | null
  localUserId: string | null
  storeName: string | null
}) {
  return createSessionPayload(input)
}

export function createDashboardAuthHandoff(session: DashboardSessionPayload) {
  return serializeSignedPayload({
    session,
    exp: new Date(Date.now() + HANDOFF_TTL_MS).toISOString(),
  } satisfies DashboardAuthHandoffPayload)
}

export function consumeDashboardAuthHandoff(token: string) {
  const parsed = parseSignedPayload<DashboardAuthHandoffPayload>(
    token,
    'INVALID_AUTH_HANDOFF',
    'Auth handoff is invalid or expired.',
  )

  if (Number.isNaN(Date.parse(parsed.exp)) || Date.parse(parsed.exp) <= Date.now()) {
    throw new AppError('Auth handoff is invalid or expired.', 400, 'INVALID_AUTH_HANDOFF')
  }

  return parsed.session
}

export function readDashboardSession(
  parsedCookies?: Record<string, string>,
  cookieHeader?: string | null,
) {
  const cookies = parsedCookies || parseCookies(cookieHeader)
  const rawCookie = cookies[SESSION_COOKIE_NAME]

  if (!rawCookie) {
    return null
  }

  let session: DashboardSessionPayload
  try {
    session = parseSignedPayload<DashboardSessionPayload>(
      rawCookie,
      'INVALID_DASHBOARD_SESSION',
      'Dashboard session is invalid.',
    )
  } catch {
    return null
  }

  if (Date.parse(session.exp) <= Date.now()) {
    return null
  }

  return session
}

export function setDashboardSessionCookie(response: Response, session: DashboardSessionPayload) {
  const isProd = env.NODE_ENV === 'production'

  response.cookie(SESSION_COOKIE_NAME, serializeSignedPayload(session), {
    httpOnly: true,
    // sameSite 'lax' is generally safe for local dev, but 'none' + secure is needed for cross-site.
    // Since we use a proxy on localhost:5173, 'lax' should be fine.
    sameSite: isProd ? 'lax' : 'lax',
    secure: isProd,
    path: '/',
    maxAge: SESSION_TTL_MS,
  })
}

export function clearDashboardSessionCookie(response: Response) {
  response.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  })
}
