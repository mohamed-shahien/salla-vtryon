import { createHmac, randomBytes } from 'node:crypto'

import type { Response } from 'express'

import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'

const SESSION_COOKIE_NAME = 'vto_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8
const HANDOFF_TTL_MS = 1000 * 60 * 5
const STATE_TTL_MS = 1000 * 60 * 10

interface DashboardSessionPayload {
  merchant_uuid: string
  merchant_id: number
  user_id: number | null
  store_name: string | null
  issued_at: string
  exp: string
}

interface StoredHandoff {
  session: DashboardSessionPayload
  expiresAt: number
}

interface OAuthStatePayload {
  redirectTo: string
  exp: string
}

const handoffStore = new Map<string, StoredHandoff>()

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
  storeName: string | null
}) {
  const issuedAt = new Date()

  return {
    merchant_uuid: input.merchantUuid,
    merchant_id: input.merchantId,
    user_id: input.userId,
    store_name: input.storeName,
    issued_at: issuedAt.toISOString(),
    exp: new Date(issuedAt.getTime() + SESSION_TTL_MS).toISOString(),
  } satisfies DashboardSessionPayload
}

function serializeSession(session: DashboardSessionPayload) {
  const payload = base64UrlEncode(JSON.stringify(session))
  const signature = signPayload(payload)

  return `${payload}.${signature}`
}

function cleanupExpiringMaps() {
  const now = Date.now()

  for (const [token, value] of handoffStore.entries()) {
    if (value.expiresAt <= now) {
      handoffStore.delete(token)
    }
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
  storeName: string | null
}) {
  return createSessionPayload(input)
}

export function createDashboardAuthHandoff(session: DashboardSessionPayload) {
  cleanupExpiringMaps()

  const token = randomBytes(24).toString('base64url')
  handoffStore.set(token, {
    session,
    expiresAt: Date.now() + HANDOFF_TTL_MS,
  })

  return token
}

export function consumeDashboardAuthHandoff(token: string) {
  cleanupExpiringMaps()

  const match = handoffStore.get(token)
  if (!match) {
    throw new AppError('Auth handoff is invalid or expired.', 400, 'INVALID_AUTH_HANDOFF')
  }

  handoffStore.delete(token)
  return match.session
}

export function readDashboardSession(cookieHeader?: string | null) {
  const cookies = parseCookies(cookieHeader)
  const rawCookie = cookies[SESSION_COOKIE_NAME]

  if (!rawCookie) {
    return null
  }

  const [payload, signature] = rawCookie.split('.')
  if (!payload || !signature) {
    return null
  }

  if (signPayload(payload) !== signature) {
    return null
  }

  const session = JSON.parse(base64UrlDecode(payload)) as DashboardSessionPayload

  if (Date.parse(session.exp) <= Date.now()) {
    return null
  }

  return session
}

export function setDashboardSessionCookie(response: Response, session: DashboardSessionPayload) {
  response.cookie(SESSION_COOKIE_NAME, serializeSession(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
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
