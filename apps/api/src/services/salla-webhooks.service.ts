import { createHmac, timingSafeEqual } from 'node:crypto'

import { z } from 'zod'

import { supabase } from '../config/clients.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'
import {
  PLAN_CREDIT_ALLOCATIONS,
  cancelPendingJobsForMerchant,
  deactivateMerchant,
  ensureMerchantRecord,
  findMerchantBySallaMerchantId,
  setMerchantPlan,
  setMerchantPlanStatus,
  storeMerchantOauthTokens,
  type SupportedPlan,
  updateMerchantSettings,
} from './merchant.service.js'
import { resetMerchantCredits } from './credits.service.js'
import { inferMerchantPlanFromSalla } from './salla-api.service.js'

const webhookSchema = z.object({
  event: z.string().min(1),
  merchant: z.coerce.number().int().positive(),
  created_at: z.string().min(1),
  data: z.record(z.string(), z.unknown()).default({}),
})

type SallaWebhookPayload = z.infer<typeof webhookSchema>

const handledWebhookEvents = new Set([
  'app.installed',
  'app.store.authorize',
  'app.uninstalled',
  'app.subscription.started',
  'app.subscription.renewed',
  'app.subscription.canceled',
  'app.subscription.expired',
  'app.trial.started',
  'app.trial.expired',
  'app.trial.canceled',
  'app.settings.updated',
])

function getSupabaseClient() {
  if (!supabase) {
    throw new AppError('Supabase is not configured for webhook processing.', 500, 'SUPABASE_NOT_CONFIGURED')
  }

  return supabase
}

function normalizeSignature(value: string) {
  return value.trim().replace(/^sha256=/i, '').toLowerCase()
}

export function verifySallaWebhookSignature(rawBody: Buffer, signatureHeader?: string | string[]) {
  if (!env.SALLA_WEBHOOK_SECRET) {
    throw new AppError(
      'SALLA_WEBHOOK_SECRET is required for webhook verification.',
      500,
      'CONFIGURATION_ERROR',
    )
  }

  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader
  if (!signature) {
    return false
  }

  const expectedSignature = createHmac('sha256', env.SALLA_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')

  const provided = Buffer.from(normalizeSignature(signature), 'hex')
  const expected = Buffer.from(expectedSignature, 'hex')

  if (provided.length === 0 || expected.length !== provided.length) {
    return false
  }

  return timingSafeEqual(expected, provided)
}

export function parseSallaWebhookPayload(rawBody: Buffer) {
  let parsed: unknown

  try {
    parsed = JSON.parse(rawBody.toString('utf8'))
  } catch {
    throw new AppError('Webhook payload is not valid JSON.', 400, 'INVALID_WEBHOOK_PAYLOAD')
  }

  return webhookSchema.parse(parsed)
}

function buildWebhookEventId(payload: SallaWebhookPayload) {
  return `${payload.event}_${payload.merchant}_${payload.created_at}`
}

async function reserveWebhookEvent(payload: SallaWebhookPayload) {
  const db = getSupabaseClient()
  const eventId = buildWebhookEventId(payload)

  const { error } = await db.from('webhook_events').insert({
    event_id: eventId,
    event_name: payload.event,
    merchant_id: payload.merchant,
    payload,
    processed: false,
  })

  if (!error) {
    return { eventId, duplicate: false }
  }

  if (error.code === '23505') {
    return { eventId, duplicate: true }
  }

  throw new AppError(error.message, 500, 'WEBHOOK_EVENT_RESERVE_FAILED')
}

async function markWebhookProcessed(eventId: string) {
  const db = getSupabaseClient()

  const { error } = await db
    .from('webhook_events')
    .update({ processed: true })
    .eq('event_id', eventId)

  if (error) {
    throw new AppError(error.message, 500, 'WEBHOOK_EVENT_UPDATE_FAILED')
  }
}

function normalizePlanName(planName?: string | null): SupportedPlan | null {
  if (!planName) {
    return null
  }

  const normalized = planName.toLowerCase().trim()

  if (normalized.includes('professional') || normalized.includes('pro')) {
    return 'professional'
  }

  if (normalized.includes('enterprise')) {
    return 'enterprise'
  }

  if (normalized.includes('diamond')) {
    return 'diamond'
  }

  if (normalized.includes('basic')) {
    return 'basic'
  }

  if (normalized.includes('trial')) {
    return 'trial'
  }

  if (normalized.includes('free')) {
    return 'free'
  }

  return null
}

async function resolveSubscriptionPlan(payload: SallaWebhookPayload) {
  const planName = typeof payload.data.plan_name === 'string' ? payload.data.plan_name : null
  const directPlan = normalizePlanName(planName)

  if (directPlan) {
    return directPlan
  }

  const inferredPlanName = await inferMerchantPlanFromSalla(payload.merchant)
  const inferredPlan = normalizePlanName(inferredPlanName)

  if (inferredPlan) {
    return inferredPlan
  }

  const currentMerchant = await findMerchantBySallaMerchantId(payload.merchant)
  const currentPlan = normalizePlanName(currentMerchant?.plan ?? null)

  if (currentPlan && currentPlan !== 'free') {
    return currentPlan
  }

  // Salla's subscription event examples can omit plan_name, so we fall back to the
  // smallest paid tier rather than over-crediting an unresolved merchant.
  return 'basic'
}

function getItemType(payload: SallaWebhookPayload) {
  return typeof payload.data.item_type === 'string' ? payload.data.item_type : 'plan'
}

async function handleInstalled(payload: SallaWebhookPayload) {
  const merchant = await ensureMerchantRecord({
    sallaMerchantId: payload.merchant,
    storeName: typeof payload.data.app_name === 'string' ? payload.data.app_name : null,
    installedAt:
      typeof payload.data.installation_date === 'string'
        ? payload.data.installation_date
        : payload.created_at,
    plan: 'free',
    planStatus: 'active',
  })

  await resetMerchantCredits(
    merchant.id,
    PLAN_CREDIT_ALLOCATIONS.free,
    'Free plan credits assigned on app installation',
  )
}

async function handleStoreAuthorize(payload: SallaWebhookPayload) {
  const accessToken =
    typeof payload.data.access_token === 'string' ? payload.data.access_token : null
  const refreshToken =
    typeof payload.data.refresh_token === 'string' ? payload.data.refresh_token : null

  if (!accessToken || !refreshToken) {
    throw new AppError(
      'app.store.authorize payload is missing access or refresh token.',
      400,
      'INVALID_WEBHOOK_PAYLOAD',
    )
  }

  await storeMerchantOauthTokens({
    sallaMerchantId: payload.merchant,
    accessToken,
    refreshToken,
    expiresAt:
      typeof payload.data.expires === 'number' || typeof payload.data.expires === 'string'
        ? payload.data.expires
        : null,
  })
}

async function handleUninstalled(payload: SallaWebhookPayload) {
  await deactivateMerchant(
    payload.merchant,
    typeof payload.data.uninstallation_date === 'string'
      ? payload.data.uninstallation_date
      : payload.created_at,
  )
  await cancelPendingJobsForMerchant(payload.merchant)
}

async function handleSubscriptionStarted(payload: SallaWebhookPayload) {
  if (getItemType(payload) === 'addon') {
    return
  }

  const plan = await resolveSubscriptionPlan(payload)
  const result = await setMerchantPlan({
    sallaMerchantId: payload.merchant,
    plan,
    planStatus: 'active',
  })

  await resetMerchantCredits(
    result.merchant.id,
    PLAN_CREDIT_ALLOCATIONS[plan],
    `Credits reset for ${plan} subscription start`,
  )
}

async function handleSubscriptionRenewed(payload: SallaWebhookPayload) {
  if (getItemType(payload) === 'addon') {
    return
  }

  const plan = await resolveSubscriptionPlan(payload)
  const result = await setMerchantPlan({
    sallaMerchantId: payload.merchant,
    plan,
    planStatus: 'active',
  })

  await resetMerchantCredits(
    result.merchant.id,
    PLAN_CREDIT_ALLOCATIONS[plan],
    `Credits reset for ${plan} subscription renewal`,
  )
}

async function handleSubscriptionStopped(payload: SallaWebhookPayload) {
  if (getItemType(payload) === 'addon') {
    return
  }

  await setMerchantPlanStatus(payload.merchant, 'inactive')
}

async function handleTrialStarted(payload: SallaWebhookPayload) {
  const result = await setMerchantPlan({
    sallaMerchantId: payload.merchant,
    plan: 'trial',
    planStatus: 'active',
  })

  await resetMerchantCredits(
    result.merchant.id,
    PLAN_CREDIT_ALLOCATIONS.trial,
    'Trial credits assigned',
  )
}

async function handleTrialStopped(payload: SallaWebhookPayload) {
  await setMerchantPlan({
    sallaMerchantId: payload.merchant,
    plan: 'trial',
    planStatus: 'inactive',
  })
}

async function handleSettingsUpdated(payload: SallaWebhookPayload) {
  const settings =
    payload.data.settings && typeof payload.data.settings === 'object'
      ? (payload.data.settings as Record<string, unknown>)
      : {}

  await updateMerchantSettings(payload.merchant, settings)
}

async function dispatchWebhook(payload: SallaWebhookPayload) {
  switch (payload.event) {
    case 'app.installed':
      await handleInstalled(payload)
      return
    case 'app.store.authorize':
      await handleStoreAuthorize(payload)
      return
    case 'app.uninstalled':
      await handleUninstalled(payload)
      return
    case 'app.subscription.started':
      await handleSubscriptionStarted(payload)
      return
    case 'app.subscription.renewed':
      await handleSubscriptionRenewed(payload)
      return
    case 'app.subscription.canceled':
    case 'app.subscription.expired':
      await handleSubscriptionStopped(payload)
      return
    case 'app.trial.started':
      await handleTrialStarted(payload)
      return
    case 'app.trial.expired':
    case 'app.trial.canceled':
      await handleTrialStopped(payload)
      return
    case 'app.settings.updated':
      await handleSettingsUpdated(payload)
      return
    default:
      return
  }
}

export async function processSallaWebhook(rawBody: Buffer, signatureHeader?: string | string[]) {
  if (!verifySallaWebhookSignature(rawBody, signatureHeader)) {
    throw new AppError('Webhook signature verification failed.', 401, 'INVALID_SALLA_SIGNATURE')
  }

  const payload = parseSallaWebhookPayload(rawBody)
  const { eventId, duplicate } = await reserveWebhookEvent(payload)

  if (duplicate) {
    return {
      eventId,
      duplicate: true,
      handled: handledWebhookEvents.has(payload.event),
      event: payload.event,
    }
  }

  await dispatchWebhook(payload)
  await markWebhookProcessed(eventId)

  return {
    eventId,
    duplicate: false,
    handled: handledWebhookEvents.has(payload.event),
    event: payload.event,
  }
}
