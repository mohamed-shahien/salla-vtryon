import { supabase } from '../config/clients.js'
import { AppError } from '../utils/app-error.js'
import { decryptText, encryptText } from '../utils/crypto.js'

import {
  type WidgetSettings,
  createDefaultWidgetSettings,
  parseWidgetSettings,
} from '@virtual-tryon/shared-types'

const MERCHANT_SELECT =
  'id,salla_merchant_id,store_name,access_token_encrypted,refresh_token_encrypted,token_expires_at,plan,plan_status,is_active,settings,installed_at,uninstalled_at,created_at,updated_at'

const CREDITS_SELECT =
  'id,merchant_id,total_credits,used_credits,reset_at,created_at,updated_at'

const DEFAULT_SETTINGS = createDefaultWidgetSettings()

export const PLAN_CREDIT_ALLOCATIONS = {
  free: 10,
  trial: 5,
  basic: 50,
  professional: 200,
  enterprise: 1000,
  diamond: 500,
} as const

export type SupportedPlan = keyof typeof PLAN_CREDIT_ALLOCATIONS

export interface MerchantRecord {
  id: string
  salla_merchant_id: number
  store_name: string | null
  access_token_encrypted: string | null
  refresh_token_encrypted: string | null
  token_expires_at: string | null
  plan: string | null
  plan_status: string | null
  is_active: boolean | null
  settings: Record<string, unknown> | null
  installed_at: string | null
  uninstalled_at: string | null
  created_at: string
  updated_at: string
}

export interface CreditsRecord {
  id: string
  merchant_id: string
  total_credits: number
  used_credits: number
  reset_at: string | null
  created_at: string
  updated_at: string
}

export interface DashboardMerchantProfile {
  user: {
    id: string
    email: string
    full_name: string | null
  } | null
  merchant: Pick<
    MerchantRecord,
    | 'id'
    | 'salla_merchant_id'
    | 'store_name'
    | 'plan'
    | 'plan_status'
    | 'is_active'
    | 'settings'
    | 'installed_at'
    | 'uninstalled_at'
    | 'created_at'
    | 'updated_at'
  >
  credits: {
    total_credits: number
    used_credits: number
    remaining_credits: number
    reset_at: string | null
  } | null
}

function getPlanCredits(plan: string | null | undefined) {
  if (!plan) {
    return PLAN_CREDIT_ALLOCATIONS.free
  }

  if (plan in PLAN_CREDIT_ALLOCATIONS) {
    return PLAN_CREDIT_ALLOCATIONS[plan as SupportedPlan]
  }

  return PLAN_CREDIT_ALLOCATIONS.free
}

export function normalizeWidgetSettings(settings: Record<string, unknown> | null | undefined): WidgetSettings {
  if (!settings) return DEFAULT_SETTINGS
  return parseWidgetSettings(settings)
}

export function isWidgetEnabledForProduct(
  settings: WidgetSettings,
  productId: string | number,
  rule?: { enabled: boolean } | null,
) {
  // Use display_rules from unified schema
  const { eligibility_mode, selected_product_ids } = settings.display_rules

  if (eligibility_mode === 'all') {
    return true
  }

  // mode is 'selected'
  const normalizedProductId =
    typeof productId === 'number' ? productId : Number.parseInt(productId, 10)

  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0) {
    return false
  }

  // 1) check rules table override
  if (rule != null) {
    return rule.enabled
  }

  // 2) check selected_product_ids from settings
  return selected_product_ids.includes(normalizedProductId)
}

function getSupabaseClient() {
  if (!supabase) {
    throw new AppError('Supabase is not configured for merchant operations.', 500, 'SUPABASE_NOT_CONFIGURED')
  }

  return supabase
}

function toIsoDateTime(value: number | string | null | undefined) {
  if (value == null) {
    return null
  }

  if (typeof value === 'number') {
    const milliseconds = value > 1_000_000_000_000 ? value : value * 1000
    return new Date(milliseconds).toISOString()
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString()
}

async function patchMerchant(
  merchantId: string,
  patch: Partial<MerchantRecord> & Record<string, unknown>,
) {
  const db = getSupabaseClient()

  const { data, error } = await db
    .from('merchants')
    .update(patch)
    .eq('id', merchantId)
    .select(MERCHANT_SELECT)
    .single<MerchantRecord>()

  if (error) {
    throw new AppError(error.message, 500, 'MERCHANT_UPDATE_FAILED')
  }

  return data
}

export async function findMerchantBySallaMerchantId(sallaMerchantId: number) {
  const db = getSupabaseClient()

  const { data, error } = await db
    .from('merchants')
    .select(MERCHANT_SELECT)
    .eq('salla_merchant_id', sallaMerchantId)
    .limit(1)
    .maybeSingle<MerchantRecord>()

  if (error) {
    throw new AppError(error.message, 500, 'MERCHANT_LOOKUP_FAILED')
  }

  return data ?? null
}

export async function findMerchantById(merchantId: string) {
  const db = getSupabaseClient()

  const { data, error } = await db
    .from('merchants')
    .select(MERCHANT_SELECT)
    .eq('id', merchantId)
    .limit(1)
    .maybeSingle<MerchantRecord>()

  if (error) {
    throw new AppError(error.message, 500, 'MERCHANT_LOOKUP_FAILED')
  }

  return data ?? null
}

export async function ensureMerchantRecord(options: {
  sallaMerchantId: number
  storeName?: string | null
  installedAt?: string | null
  plan?: SupportedPlan
  planStatus?: 'active' | 'inactive'
}) {
  const existing = await findMerchantBySallaMerchantId(options.sallaMerchantId)

  if (existing) {
    const patch: Record<string, unknown> = {}

    if (options.storeName && options.storeName !== existing.store_name) {
      patch.store_name = options.storeName
    }

    if (options.installedAt && !existing.installed_at) {
      patch.installed_at = options.installedAt
    }

    if (!existing.is_active) {
      patch.is_active = true
      patch.uninstalled_at = null
    }

    if (Object.keys(patch).length === 0) {
      await ensureMerchantCreditsBaseline(existing)
      return existing
    }

    const merchant = await patchMerchant(existing.id, patch)
    await ensureMerchantCreditsBaseline(merchant)
    return merchant
  }

  const db = getSupabaseClient()

  const { data, error } = await db
    .from('merchants')
    .insert({
      salla_merchant_id: options.sallaMerchantId,
      store_name: options.storeName ?? null,
      plan: options.plan ?? 'free',
      plan_status: options.planStatus ?? 'active',
      is_active: true,
      settings: DEFAULT_SETTINGS,
      installed_at: options.installedAt ?? new Date().toISOString(),
      uninstalled_at: null,
    })
    .select(MERCHANT_SELECT)
    .single<MerchantRecord>()

  if (error) {
    throw new AppError(error.message, 500, 'MERCHANT_CREATE_FAILED')
  }

  await ensureMerchantCreditsBaseline(data)
  return data
}

export async function ensureCreditsRecord(options: {
  merchantId: string
  totalCredits: number
  usedCredits?: number
  resetAt?: string | null
}) {
  const db = getSupabaseClient()

  const { data, error } = await db
    .from('credits')
    .upsert(
      {
        merchant_id: options.merchantId,
        total_credits: options.totalCredits,
        used_credits: options.usedCredits ?? 0,
        reset_at: options.resetAt ?? null,
      },
      { onConflict: 'merchant_id' },
    )
    .select(CREDITS_SELECT)
    .single()

  if (error) {
    throw new AppError(error.message, 500, 'CREDITS_UPSERT_FAILED')
  }

  return data
}

export async function ensureMerchantCreditsBaseline(merchant: MerchantRecord) {
  const existingCredits = await getCreditsForMerchant(merchant.id)

  if (existingCredits) {
    return existingCredits
  }

  return ensureCreditsRecord({
    merchantId: merchant.id,
    totalCredits: getPlanCredits(merchant.plan),
    usedCredits: 0,
    resetAt: new Date().toISOString(),
  })
}

export async function getCreditsForMerchant(merchantId: string) {
  const db = getSupabaseClient()

  const { data, error } = await db
    .from('credits')
    .select(CREDITS_SELECT)
    .eq('merchant_id', merchantId)
    .limit(1)
    .maybeSingle<CreditsRecord>()

  if (error) {
    throw new AppError(error.message, 500, 'CREDITS_LOOKUP_FAILED')
  }

  return data ?? null
}

export async function ensureMerchantFromEmbeddedAuth(sallaMerchantId: number) {
  return ensureMerchantRecord({ sallaMerchantId })
}

export async function storeMerchantOauthTokens(options: {
  sallaMerchantId: number
  accessToken: string
  refreshToken: string
  expiresAt?: number | string | null
  storeName?: string | null
}) {
  const merchant = await ensureMerchantRecord({
    sallaMerchantId: options.sallaMerchantId,
    storeName: options.storeName ?? null,
  })

  return patchMerchant(merchant.id, {
    access_token_encrypted: encryptText(options.accessToken),
    refresh_token_encrypted: encryptText(options.refreshToken),
    token_expires_at: toIsoDateTime(options.expiresAt),
    is_active: true,
    uninstalled_at: null,
  })
}

export async function deactivateMerchant(sallaMerchantId: number, uninstalledAt?: string | null) {
  const merchant = await findMerchantBySallaMerchantId(sallaMerchantId)

  if (!merchant) {
    return null
  }

  return patchMerchant(merchant.id, {
    is_active: false,
    plan_status: 'inactive',
    uninstalled_at: uninstalledAt ?? new Date().toISOString(),
  })
}

export async function setMerchantPlan(options: {
  sallaMerchantId: number
  plan: SupportedPlan
  planStatus: 'active' | 'inactive'
}) {
  const merchant = await ensureMerchantRecord({
    sallaMerchantId: options.sallaMerchantId,
    plan: options.plan,
    planStatus: options.planStatus,
  })

  const updatedMerchant = await patchMerchant(merchant.id, {
    plan: options.plan,
    plan_status: options.planStatus,
    is_active: true,
    uninstalled_at: null,
  })

  return {
    merchant: updatedMerchant,
    credits: await getCreditsForMerchant(merchant.id),
  }
}

export async function setMerchantPlanStatus(
  sallaMerchantId: number,
  planStatus: 'active' | 'inactive',
) {
  const merchant = await ensureMerchantRecord({ sallaMerchantId })

  return patchMerchant(merchant.id, {
    plan_status: planStatus,
    is_active: planStatus === 'active' ? true : merchant.is_active,
  })
}

export async function updateMerchantSettings(
  sallaMerchantId: number,
  settings: Record<string, unknown>,
) {
  const merchant = await ensureMerchantRecord({ sallaMerchantId })

  return patchMerchant(merchant.id, {
    settings: normalizeWidgetSettings({
      ...normalizeWidgetSettings(merchant.settings),
      ...settings,
    }),
  })
}

export async function getMerchantWidgetSettings(merchantId: string) {
  const merchant = await findMerchantById(merchantId)

  if (!merchant) {
    throw new AppError('Merchant record was not found.', 404, 'MERCHANT_NOT_FOUND')
  }

  return normalizeWidgetSettings(merchant.settings)
}

export async function updateMerchantWidgetSettings(
  merchantId: string,
  settingsPatch: Partial<WidgetSettings>,
) {
  const merchant = await findMerchantById(merchantId)

  if (!merchant) {
    throw new AppError('Merchant record was not found.', 404, 'MERCHANT_NOT_FOUND')
  }

  const nextSettings = normalizeWidgetSettings({
    ...normalizeWidgetSettings(merchant.settings),
    ...settingsPatch,
  })

  const updatedMerchant = await patchMerchant(merchantId, {
    settings: nextSettings,
  })

  return normalizeWidgetSettings(updatedMerchant.settings)
}

export async function getMerchantProductRules(merchantId: string) {
  const db = getSupabaseClient()

  const { data, error } = await db
    .from('merchant_product_rules')
    .select('product_id, enabled')
    .eq('merchant_id', merchantId)

  if (error) {
    throw new AppError(error.message, 500, 'PRODUCT_RULES_LOOKUP_FAILED')
  }

  return data as { product_id: number; enabled: boolean }[]
}

export async function getMerchantProductRule(merchantId: string, productId: number | string) {
  const db = getSupabaseClient()
  const normalizedId = typeof productId === 'string' ? Number.parseInt(productId, 10) : productId

  if (!Number.isInteger(normalizedId)) {
    return null
  }

  const { data, error } = await db
    .from('merchant_product_rules')
    .select('enabled')
    .eq('merchant_id', merchantId)
    .eq('product_id', normalizedId)
    .maybeSingle()

  if (error) {
    throw new AppError(error.message, 500, 'PRODUCT_RULE_LOOKUP_FAILED')
  }

  return data as { enabled: boolean } | null
}

export async function updateMerchantProductRules(
  merchantId: string,
  productIds: number[],
  enabled: boolean,
) {
  if (productIds.length === 0) {
    return
  }

  const db = getSupabaseClient()

  const rows = productIds.map((id) => ({
    merchant_id: merchantId,
    product_id: id,
    enabled,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await db
    .from('merchant_product_rules')
    .upsert(rows, { onConflict: 'merchant_id, product_id' })

  if (error) {
    throw new AppError(error.message, 500, 'PRODUCT_RULES_UPDATE_FAILED')
  }
}

export async function cancelPendingJobsForMerchant(sallaMerchantId: number) {
  const merchant = await findMerchantBySallaMerchantId(sallaMerchantId)

  if (!merchant) {
    return null
  }

  const db = getSupabaseClient()

  const { error } = await db
    .from('tryon_jobs')
    .update({
      status: 'canceled',
      error_message: 'Canceled because the Salla app was uninstalled.',
      completed_at: new Date().toISOString(),
    })
    .eq('merchant_id', merchant.id)
    .eq('status', 'pending')

  if (error) {
    throw new AppError(error.message, 500, 'JOB_CANCEL_FAILED')
  }

  return merchant
}

export async function getMerchantTokensForApi(sallaMerchantId: number) {
  const merchant = await findMerchantBySallaMerchantId(sallaMerchantId)

  if (!merchant) {
    throw new AppError('Merchant record was not found.', 404, 'MERCHANT_NOT_FOUND')
  }

  if (!merchant.access_token_encrypted || !merchant.refresh_token_encrypted) {
    throw new AppError(
      'Merchant Salla access credentials are not stored yet.',
      403,
      'SALLA_TOKENS_MISSING',
    )
  }

  return {
    merchant,
    accessToken: decryptText(merchant.access_token_encrypted),
    refreshToken: decryptText(merchant.refresh_token_encrypted),
  }
}

export async function updateMerchantRefreshedTokens(options: {
  merchantId: string
  accessToken: string
  refreshToken: string
  expiresAt?: number | string | null
}) {
  return patchMerchant(options.merchantId, {
    access_token_encrypted: encryptText(options.accessToken),
    refresh_token_encrypted: encryptText(options.refreshToken),
    token_expires_at: toIsoDateTime(options.expiresAt),
  })
}

export async function getDashboardMerchantProfile(merchantId: string, userId: string | null = null) {
  const db = getSupabaseClient()
  const merchant = await findMerchantById(merchantId)

  if (!merchant) {
    throw new AppError('Merchant record was not found.', 404, 'MERCHANT_NOT_FOUND')
  }

  const credits = await ensureMerchantCreditsBaseline(merchant)

  let userProfile: DashboardMerchantProfile['user'] = null

  if (userId) {
    const { data: user, error: userError } = await db
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .single()

    if (!userError && user) {
      userProfile = user
    }
  }

  return {
    user: userProfile,
    merchant: {
      id: merchant.id,
      salla_merchant_id: merchant.salla_merchant_id,
      store_name: merchant.store_name,
      plan: merchant.plan,
      plan_status: merchant.plan_status,
      is_active: merchant.is_active,
      settings: normalizeWidgetSettings(merchant.settings),
      installed_at: merchant.installed_at,
      uninstalled_at: merchant.uninstalled_at,
      created_at: merchant.created_at,
      updated_at: merchant.updated_at,
    },
    credits: credits
      ? {
          total_credits: credits.total_credits,
          used_credits: credits.used_credits,
          remaining_credits: Math.max(credits.total_credits - credits.used_credits, 0),
          reset_at: credits.reset_at,
        }
      : null,
  } satisfies DashboardMerchantProfile
}
