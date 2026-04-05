import { supabase } from '../config/clients.js'
import { AppError } from '../utils/app-error.js'
import {
  ensureMerchantCreditsBaseline,
  findMerchantById,
  type MerchantRecord,
} from './merchant.service.js'

export const TRYON_CATEGORIES = ['upper_body', 'lower_body', 'dresses'] as const
export type TryOnCategory = (typeof TRYON_CATEGORIES)[number]
export const TRYON_JOB_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'canceled',
] as const
export type TryOnJobStatus = (typeof TRYON_JOB_STATUSES)[number]

export interface TryOnJobRecord {
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

interface ListJobsOptions {
  page: number
  limit: number
  status?: TryOnJobStatus
}

interface JobCompletionPayload {
  merchantId: string
  jobId: string
  resultImageUrl: string
  replicatePredictionId?: string | null
  metadataPatch?: Record<string, unknown>
}

const JOB_SELECT =
  'id,merchant_id,status,user_image_url,product_image_url,product_id,category,result_image_url,replicate_prediction_id,error_message,metadata,processing_started_at,completed_at,created_at,updated_at'

function getSupabaseClient() {
  if (!supabase) {
    throw new AppError('Supabase is not configured for job operations.', 500, 'SUPABASE_NOT_CONFIGURED')
  }

  return supabase
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

async function getMerchantOrThrow(merchantId: string) {
  const merchant = await findMerchantById(merchantId)

  if (!merchant) {
    throw new AppError('Merchant record was not found.', 404, 'MERCHANT_NOT_FOUND')
  }

  return merchant
}

async function ensureMerchantCanCreateJobs(merchant: MerchantRecord) {
  await ensureMerchantCreditsBaseline(merchant)

  if (merchant.is_active !== true || merchant.plan_status !== 'active') {
    throw new AppError(
      'This merchant cannot create new try-on jobs because the plan is inactive.',
      403,
      'MERCHANT_PLAN_INACTIVE',
    )
  }
}

export async function listMerchantJobs(merchantId: string, options: ListJobsOptions) {
  const db = getSupabaseClient()
  const offset = (options.page - 1) * options.limit

  let query = db
    .from('tryon_jobs')
    .select(JOB_SELECT, { count: 'exact' })
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + options.limit - 1)

  if (options.status) {
    query = query.eq('status', options.status)
  }

  const { data, error, count } = await query.returns<TryOnJobRecord[]>()

  if (error) {
    throw new AppError(error.message, 500, 'JOB_LOOKUP_FAILED')
  }

  const total = count ?? 0

  return {
    jobs: data ?? [],
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      total_pages: total > 0 ? Math.ceil(total / options.limit) : 0,
      has_more: offset + (data?.length ?? 0) < total,
    },
  }
}

export async function getMerchantJobById(merchantId: string, jobId: string) {
  const db = getSupabaseClient()

  const { data, error } = await db
    .from('tryon_jobs')
    .select(JOB_SELECT)
    .eq('merchant_id', merchantId)
    .eq('id', jobId)
    .limit(1)
    .maybeSingle<TryOnJobRecord>()

  if (error) {
    throw new AppError(error.message, 500, 'JOB_LOOKUP_FAILED')
  }

  if (!data) {
    throw new AppError('Try-on job was not found.', 404, 'JOB_NOT_FOUND')
  }

  return data
}

export async function markMerchantJobFailed(options: {
  merchantId: string
  jobId: string
  errorMessage: string
  replicatePredictionId?: string | null
}) {
  const db = getSupabaseClient()

  const { error } = await db
    .from('tryon_jobs')
    .update({
      status: 'failed',
      error_message: options.errorMessage,
      replicate_prediction_id: options.replicatePredictionId ?? undefined,
      completed_at: new Date().toISOString(),
    })
    .eq('merchant_id', options.merchantId)
    .eq('id', options.jobId)

  if (error) {
    throw new AppError(error.message, 500, 'JOB_UPDATE_FAILED')
  }
}

export async function completeMerchantJob(options: JobCompletionPayload) {
  const db = getSupabaseClient()
  const existingJob = await getMerchantJobById(options.merchantId, options.jobId)

  const { error } = await db
    .from('tryon_jobs')
    .update({
      status: 'completed',
      error_message: null,
      result_image_url: options.resultImageUrl,
      replicate_prediction_id: options.replicatePredictionId ?? undefined,
      metadata: {
        ...(existingJob.metadata ?? {}),
        ...(options.metadataPatch ?? {}),
      },
      completed_at: new Date().toISOString(),
    })
    .eq('merchant_id', options.merchantId)
    .eq('id', options.jobId)

  if (error) {
    throw new AppError(error.message, 500, 'JOB_UPDATE_FAILED')
  }

  return getMerchantJobById(options.merchantId, options.jobId)
}

export async function updateMerchantJobPrediction(
  merchantId: string,
  jobId: string,
  predictionId: string,
) {
  const db = getSupabaseClient()

  const { error } = await db
    .from('tryon_jobs')
    .update({
      replicate_prediction_id: predictionId,
    })
    .eq('merchant_id', merchantId)
    .eq('id', jobId)

  if (error) {
    throw new AppError(error.message, 500, 'JOB_UPDATE_FAILED')
  }
}

export async function listPendingJobsForProcessing(limit: number) {
  const db = getSupabaseClient()
  const { data, error } = await db
    .from('tryon_jobs')
    .select(JOB_SELECT)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit)
    .returns<TryOnJobRecord[]>()

  if (error) {
    throw new AppError(error.message, 500, 'JOB_LOOKUP_FAILED')
  }

  return data ?? []
}

export async function claimPendingJob(jobId: string) {
  const db = getSupabaseClient()
  const { data, error } = await db
    .from('tryon_jobs')
    .update({
      status: 'processing',
      processing_started_at: new Date().toISOString(),
      error_message: null,
    })
    .eq('id', jobId)
    .eq('status', 'pending')
    .select(JOB_SELECT)
    .maybeSingle<TryOnJobRecord>()

  if (error) {
    throw new AppError(error.message, 500, 'JOB_CLAIM_FAILED')
  }

  return data ?? null
}

export async function listTimedOutProcessingJobs(timeoutMs: number) {
  const db = getSupabaseClient()
  const threshold = new Date(Date.now() - timeoutMs).toISOString()
  const { data, error } = await db
    .from('tryon_jobs')
    .select(JOB_SELECT)
    .eq('status', 'processing')
    .lt('processing_started_at', threshold)
    .returns<TryOnJobRecord[]>()

  if (error) {
    throw new AppError(error.message, 500, 'JOB_LOOKUP_FAILED')
  }

  return data ?? []
}

export async function createMerchantTryOnJob(input: {
  merchantId: string
  userImageUrl: string
  productImageUrl: string
  productId: string
  category: TryOnCategory
  metadata?: Record<string, unknown>
}) {
  const merchant = await getMerchantOrThrow(input.merchantId)
  await ensureMerchantCanCreateJobs(merchant)

  const db = getSupabaseClient()
  const rpcInput = {
    p_merchant_id: merchant.id,
    p_user_image_url: input.userImageUrl,
    p_product_image_url: input.productImageUrl,
    p_product_id: input.productId,
    p_category: input.category,
    p_metadata: input.metadata ?? {},
  }
  const { data, error } = await db.rpc('create_tryon_job_with_credit', rpcInput)

  if (error) {
    const normalizedMessage = normalizeSupabaseMessage(error.message)

    if (isMissingRpcFunction(normalizedMessage, 'create_tryon_job_with_credit')) {
      return createMerchantTryOnJobFallback(merchant.id, input)
    }

    if (normalizedMessage.includes('NO_CREDITS')) {
      throw new AppError(
        'No credits remaining for this merchant.',
        409,
        'NO_CREDITS',
        {
          credits_remaining: 0,
          upgrade_prompt: 'Upgrade the plan or add credits before creating another try-on job.',
        },
      )
    }

    if (normalizedMessage.includes('MERCHANT_PLAN_INACTIVE')) {
      throw new AppError(
        'This merchant cannot create new try-on jobs because the plan is inactive.',
        403,
        'MERCHANT_PLAN_INACTIVE',
      )
    }

    if (normalizedMessage.includes('CREDITS_RECORD_NOT_FOUND')) {
      throw new AppError('Credits record was not found for this merchant.', 404, 'CREDITS_NOT_FOUND')
    }

    throw new AppError(normalizedMessage, 500, 'JOB_CREATE_FAILED')
  }

  if (typeof data !== 'string' || data.length === 0) {
    throw new AppError('Try-on job creation did not return a job id.', 500, 'JOB_CREATE_FAILED')
  }

  return getMerchantJobById(merchant.id, data)
}

async function createMerchantTryOnJobFallback(
  merchantId: string,
  input: {
    userImageUrl: string
    productImageUrl: string
    productId: string
    category: TryOnCategory
    metadata?: Record<string, unknown>
  },
) {
  const db = getSupabaseClient()
  const { data: createdJob, error: createError } = await db
    .from('tryon_jobs')
    .insert({
      merchant_id: merchantId,
      status: 'pending',
      user_image_url: input.userImageUrl,
      product_image_url: input.productImageUrl,
      product_id: input.productId,
      category: input.category,
      metadata: input.metadata ?? {},
    })
    .select(JOB_SELECT)
    .single<TryOnJobRecord>()

  if (createError || !createdJob) {
    throw new AppError(
      createError?.message ?? 'Try-on job creation failed.',
      500,
      'JOB_CREATE_FAILED',
    )
  }

  const { data: deducted, error: deductError } = await db.rpc('deduct_credit', {
    p_merchant_id: merchantId,
    p_job_id: createdJob.id,
  })

  if (deductError) {
    await db.from('tryon_jobs').delete().eq('merchant_id', merchantId).eq('id', createdJob.id)

    throw new AppError(deductError.message, 500, 'JOB_CREATE_FAILED')
  }

  if (deducted !== true) {
    await db.from('tryon_jobs').delete().eq('merchant_id', merchantId).eq('id', createdJob.id)

    throw new AppError(
      'No credits remaining for this merchant.',
      409,
      'NO_CREDITS',
      {
        credits_remaining: 0,
        upgrade_prompt: 'Upgrade the plan or add credits before creating another try-on job.',
      },
    )
  }

  return createdJob
}
