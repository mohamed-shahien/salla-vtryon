import { supabase } from '../config/clients.js'
import { AppError } from '../utils/app-error.js'
import {
  ensureMerchantCreditsBaseline,
  findMerchantById,
  getCreditsForMerchant,
} from './merchant.service.js'

interface CreditTransactionRecord {
  id: string
  merchant_id: string
  amount: number
  type: string
  reason: string | null
  job_id: string | null
  created_at: string
}

interface CreditBalanceRecord {
  total_credits: number
  used_credits: number
  remaining_credits: number
  reset_at: string | null
  updated_at: string
}

function normalizeSupabaseMessage(value: string) {
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return lines[lines.length - 1] ?? value
}

function isMissingRpcFunction(message: string, functionName: string) {
  return (
    message.includes(`Could not find the function public.${functionName}`) ||
    message.includes(`function public.${functionName}`) ||
    message.includes(functionName)
  )
}

function getSupabaseClient() {
  if (!supabase) {
    throw new AppError('Supabase is not configured for credit operations.', 500, 'SUPABASE_NOT_CONFIGURED')
  }

  return supabase
}

export async function getMerchantCreditsSummary(merchantId: string, transactionLimit = 20) {
  const merchant = await findMerchantById(merchantId)
  const credits =
    merchant ? await ensureMerchantCreditsBaseline(merchant) : await getCreditsForMerchant(merchantId)
  const db = getSupabaseClient()

  const { data: transactions, error } = await db
    .from('credit_transactions')
    .select('id,merchant_id,amount,type,reason,job_id,created_at')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(transactionLimit)
    .returns<CreditTransactionRecord[]>()

  if (error) {
    throw new AppError(error.message, 500, 'CREDIT_TRANSACTIONS_LOOKUP_FAILED')
  }

  return {
    balance: credits
      ? {
          total_credits: credits.total_credits,
          used_credits: credits.used_credits,
          remaining_credits: Math.max(credits.total_credits - credits.used_credits, 0),
          reset_at: credits.reset_at,
          updated_at: credits.updated_at,
        }
      : null,
    transactions: transactions ?? [],
  }
}

export async function getAvailableMerchantCredits(merchantId: string) {
  const db = getSupabaseClient()

  const { data, error } = await db.rpc('check_credits', {
    p_merchant_id: merchantId,
  })

  if (error) {
    const normalizedMessage = normalizeSupabaseMessage(error.message)

    if (isMissingRpcFunction(normalizedMessage, 'check_credits')) {
      const credits = await getCreditsForMerchant(merchantId)
      if (!credits) {
        return 0
      }

      return Math.max(credits.total_credits - credits.used_credits, 0)
    }

    throw new AppError(normalizedMessage, 500, 'CREDIT_BALANCE_LOOKUP_FAILED')
  }

  return typeof data === 'number' ? data : 0
}

export async function hasMerchantCredits(merchantId: string) {
  return (await getAvailableMerchantCredits(merchantId)) > 0
}

async function getMerchantBalanceOrThrow(merchantId: string) {
  const credits = await getCreditsForMerchant(merchantId)

  if (!credits) {
    throw new AppError('Credits record was not found for this merchant.', 404, 'CREDITS_NOT_FOUND')
  }

  return {
    total_credits: credits.total_credits,
    used_credits: credits.used_credits,
    remaining_credits: Math.max(credits.total_credits - credits.used_credits, 0),
    reset_at: credits.reset_at,
    updated_at: credits.updated_at,
  } satisfies CreditBalanceRecord
}

async function hasExistingRefundTransaction(merchantId: string, jobId: string) {
  const db = getSupabaseClient()
  const { data, error } = await db
    .from('credit_transactions')
    .select('id')
    .eq('merchant_id', merchantId)
    .eq('job_id', jobId)
    .eq('type', 'refund')
    .limit(1)
    .maybeSingle<{ id: string }>()

  if (error) {
    throw new AppError(error.message, 500, 'CREDIT_TRANSACTIONS_LOOKUP_FAILED')
  }

  return Boolean(data?.id)
}

export async function refundMerchantCredit(merchantId: string, jobId: string) {
  if (await hasExistingRefundTransaction(merchantId, jobId)) {
    return getMerchantBalanceOrThrow(merchantId)
  }

  const db = getSupabaseClient()

  const { error } = await db.rpc('refund_credit', {
    p_merchant_id: merchantId,
    p_job_id: jobId,
  })

  if (error) {
    throw new AppError(error.message, 500, 'CREDIT_REFUND_FAILED')
  }

  return getMerchantBalanceOrThrow(merchantId)
}

export async function resetMerchantCredits(
  merchantId: string,
  totalCredits: number,
  reason = 'Subscription credits reset',
) {
  if (totalCredits < 0) {
    throw new AppError('Credit total cannot be negative.', 400, 'INVALID_CREDIT_AMOUNT')
  }

  const db = getSupabaseClient()

  const { error } = await db.rpc('reset_credits', {
    p_merchant_id: merchantId,
    p_total_credits: totalCredits,
    p_reason: reason,
  })

  if (error) {
    const normalizedMessage = normalizeSupabaseMessage(error.message)

    if (isMissingRpcFunction(normalizedMessage, 'reset_credits')) {
      const { error: updateError } = await db
        .from('credits')
        .update({
          total_credits: totalCredits,
          used_credits: 0,
          reset_at: new Date().toISOString(),
        })
        .eq('merchant_id', merchantId)

      if (updateError) {
        throw new AppError(updateError.message, 500, 'CREDIT_RESET_FAILED')
      }

      const { error: insertError } = await db.from('credit_transactions').insert({
        merchant_id: merchantId,
        amount: totalCredits,
        type: 'reset',
        reason,
        job_id: null,
      })

      if (insertError) {
        throw new AppError(insertError.message, 500, 'CREDIT_RESET_FAILED')
      }

      return getMerchantBalanceOrThrow(merchantId)
    }

    if (normalizedMessage.includes('CREDITS_RECORD_NOT_FOUND')) {
      throw new AppError(
        'Credits record was not found for this merchant.',
        404,
        'CREDITS_NOT_FOUND',
      )
    }

    throw new AppError(normalizedMessage, 500, 'CREDIT_RESET_FAILED')
  }

  return getMerchantBalanceOrThrow(merchantId)
}

export async function addMerchantCredits(
  merchantId: string,
  amount: number,
  reason = 'Manual credit top-up',
) {
  if (amount < 1) {
    throw new AppError('Credit amount must be at least 1.', 400, 'INVALID_CREDIT_AMOUNT')
  }

  const db = getSupabaseClient()

  const { error } = await db.rpc('add_credits', {
    p_merchant_id: merchantId,
    p_amount: amount,
    p_reason: reason,
  })

  if (error) {
    const normalizedMessage = normalizeSupabaseMessage(error.message)

    if (isMissingRpcFunction(normalizedMessage, 'add_credits')) {
      const existingCredits = await getCreditsForMerchant(merchantId)

      if (!existingCredits) {
        throw new AppError(
          'Credits record was not found for this merchant.',
          404,
          'CREDITS_NOT_FOUND',
        )
      }

      const { error: updateError } = await db
        .from('credits')
        .update({
          total_credits: existingCredits.total_credits + amount,
        })
        .eq('merchant_id', merchantId)

      if (updateError) {
        throw new AppError(updateError.message, 500, 'CREDIT_TOP_UP_FAILED')
      }

      const { error: insertError } = await db.from('credit_transactions').insert({
        merchant_id: merchantId,
        amount,
        type: 'credit',
        reason,
        job_id: null,
      })

      if (insertError) {
        throw new AppError(insertError.message, 500, 'CREDIT_TOP_UP_FAILED')
      }

      return getMerchantBalanceOrThrow(merchantId)
    }

    if (normalizedMessage.includes('INVALID_CREDIT_AMOUNT')) {
      throw new AppError('Credit amount must be at least 1.', 400, 'INVALID_CREDIT_AMOUNT')
    }

    if (normalizedMessage.includes('CREDITS_RECORD_NOT_FOUND')) {
      throw new AppError(
        'Credits record was not found for this merchant.',
        404,
        'CREDITS_NOT_FOUND',
      )
    }

    throw new AppError(normalizedMessage, 500, 'CREDIT_TOP_UP_FAILED')
  }

  return getMerchantBalanceOrThrow(merchantId)
}
