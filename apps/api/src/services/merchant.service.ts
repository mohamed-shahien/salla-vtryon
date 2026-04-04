import { supabase } from '../config/clients.js'
import { AppError } from '../utils/app-error.js'
import { decryptText, encryptText } from '../utils/crypto.js'

const MERCHANT_SELECT =
  'id,salla_merchant_id,store_name,access_token_encrypted,refresh_token_encrypted,token_expires_at,plan,plan_status,is_active,settings,installed_at,uninstalled_at,created_at,updated_at'

const CREDITS_SELECT =
  'id,merchant_id,total_credits,used_credits,reset_at,created_at,updated_at'

const DEFAULT_SETTINGS = {
  widget_enabled: true,
  widget_mode: 'all',
  widget_products: [],
  widget_button_text: 'جرّب الآن',
  default_category: 'upper_body',
}

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
      return existing
    }

    return patchMerchant(existing.id, patch)
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
    credits: await ensureCreditsRecord({
      merchantId: merchant.id,
      totalCredits: PLAN_CREDIT_ALLOCATIONS[options.plan],
      usedCredits: options.planStatus === 'active' ? 0 : undefined,
      resetAt: options.planStatus === 'active' ? new Date().toISOString() : null,
    }),
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
    settings: {
      ...(merchant.settings ?? DEFAULT_SETTINGS),
      ...settings,
    },
  })
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
