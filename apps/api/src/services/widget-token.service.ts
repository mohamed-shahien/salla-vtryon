import { createHmac } from 'node:crypto'

import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'

const WIDGET_TOKEN_TTL_MS = 1000 * 60 * 30

export interface WidgetTokenPayload {
  merchant_uuid: string
  merchant_id: number
  product_id: string
  issued_at: string
  exp: string
}

function getSigningKey() {
  if (!env.ENCRYPTION_KEY?.trim()) {
    throw new AppError(
      'ENCRYPTION_KEY is required to sign widget tokens.',
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
  return createHmac('sha256', getSigningKey())
    .update(serializedPayload)
    .digest('base64url')
}

export function createWidgetToken(input: {
  merchantUuid: string
  merchantId: number
  productId: string
}) {
  const issuedAt = new Date()
  const payload = {
    merchant_uuid: input.merchantUuid,
    merchant_id: input.merchantId,
    product_id: input.productId,
    issued_at: issuedAt.toISOString(),
    exp: new Date(issuedAt.getTime() + WIDGET_TOKEN_TTL_MS).toISOString(),
  } satisfies WidgetTokenPayload

  const serializedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signPayload(serializedPayload)

  return `${serializedPayload}.${signature}`
}

export function readWidgetToken(token: string) {
  const [payload, signature] = token.split('.')

  if (!payload || !signature || signPayload(payload) !== signature) {
    throw new AppError('Widget token is invalid or expired.', 401, 'INVALID_WIDGET_TOKEN')
  }

  let parsed: WidgetTokenPayload

  try {
    parsed = JSON.parse(base64UrlDecode(payload)) as WidgetTokenPayload
  } catch {
    throw new AppError('Widget token is invalid or expired.', 401, 'INVALID_WIDGET_TOKEN')
  }

  if (Number.isNaN(Date.parse(parsed.exp)) || Date.parse(parsed.exp) <= Date.now()) {
    throw new AppError('Widget token is invalid or expired.', 401, 'INVALID_WIDGET_TOKEN')
  }

  return parsed
}
