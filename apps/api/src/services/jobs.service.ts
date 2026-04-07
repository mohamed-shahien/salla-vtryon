import { supabase } from '../config/clients.js'
import { AppError } from '../utils/app-error.js'
import {
  ensureMerchantCreditsBaseline,
  findMerchantById,
  type MerchantRecord,
} from './merchant.service.js'

/**
 * Legacy category is kept only for DB compatibility and model fallback paths.
 * It must not be exposed in widget/public contracts anymore.
 */
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

export const TRYON_JOB_STAGES = [
  'queued',
  'validating_assets',
  'preparing_assets',
  'predicting',
  'uploading_result',
  'done',
] as const
export type TryOnJobStage = (typeof TRYON_JOB_STAGES)[number]

export interface TryOnJobMetadata extends Record<string, unknown> {
  request_id?: string
  source?: 'widget' | 'dashboard' | 'api' | string
  stage?: TryOnJobStage
  attempt_count?: number
  failure_code?: string | null
  human_analysis?: Record<string, unknown>
  garment_analysis?: Record<string, unknown>
  prepared_garment_url?: string
  prepared_garment_storage_path?: string
  product_name?: string | null
  product_thumbnail?: string | null
  upload_storage_path?: string | null
}

export interface TryOnJobRecord {
  id: string
  merchant_id: string
  status: TryOnJobStatus
  user_image_url: string
  product_image_url: string
  product_id: string | null
  category: TryOnCategory | null
  result_image_url: string | null
  replicate_prediction_id: string | null
  error_message: string | null
  metadata: TryOnJobMetadata
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

function mergeMetadata(
  current: TryOnJobMetadata | null | undefined,
  patch: Record<string, unknown>,
): TryOnJobMetadata {
  return {
    ...(current ?? {}),
    ...patch,
  }
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

export function inferLegacyCategoryFromText(value?: string | null): TryOnCategory {
  const text = value?.toLowerCase().trim() ?? ''

  if (
    text.includes('pant') ||
    text.includes('trouser') ||
    text.includes('jean') ||
    text.includes('short') ||
    text.includes('skirt') ||
    text.includes('legging') ||
    text.includes('بنطلون') ||
    text.includes('تنورة') ||
    text.includes('شورت')
  ) {
    return 'lower_body'
  }

  if (
    text.includes('dress') ||
    text.includes('gown') ||
    text.includes('jumpsuit') ||
    text.includes('abaya') ||
    text.includes('فستان') ||
    text.includes('عباية') ||
    text.includes('جمبسوت')
  ) {
    return 'dresses'
  }

  return 'upper_body'
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

export async function findMerchantJobByRequestId(
  merchantId: string,
  requestId: string,
) {
  const db = getSupabaseClient()
  const { data, error } = await db
    .from('tryon_jobs')
    .select(JOB_SELECT)
    .eq('merchant_id', merchantId)
    .eq('metadata->>request_id', requestId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<TryOnJobRecord>()

  if (error) {
    throw new AppError(error.message, 500, 'JOB_LOOKUP_FAILED')
  }

  return data ?? null
}

export async function markMerchantJobFailed(options: {
  merchantId: string
  jobId: string
  errorMessage: string
  replicatePredictionId?: string | null
  failureCode?: string | null
  metadataPatch?: Record<string, unknown>
}) {
  const db = getSupabaseClient()
  const existingJob = await getMerchantJobById(options.merchantId, options.jobId)

  const { error } = await db
    .from('tryon_jobs')
    .update({
      status: 'failed',
      error_message: options.errorMessage,
      replicate_prediction_id: options.replicatePredictionId ?? undefined,
      metadata: mergeMetadata(existingJob.metadata, {
        stage: 'done',
        failure_code: options.failureCode ?? 'PROCESSING_FAILED',
        ...(options.metadataPatch ?? {}),
      }),
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
      metadata: mergeMetadata(existingJob.metadata, {
        stage: 'done',
        failure_code: null,
        ...(options.metadataPatch ?? {}),
      }),
      completed_at: new Date().toISOString(),
    })
    .eq('merchant_id', options.merchantId)
    .eq('id', options.jobId)

  if (error) {
    throw new AppError(error.message, 500, 'JOB_UPDATE_FAILED')
  }

  return getMerchantJobById(options.merchantId, options.jobId)
}

export async function updateMerchantJobMetadata(
  merchantId: string,
  jobId: string,
  patch: Record<string, unknown>,
) {
  const db = getSupabaseClient()
  const existingJob = await getMerchantJobById(merchantId, jobId)

  const { error } = await db
    .from('tryon_jobs')
    .update({
      metadata: mergeMetadata(existingJob.metadata, patch),
    })
    .eq('merchant_id', merchantId)
    .eq('id', jobId)

  if (error) {
    throw new AppError(error.message, 500, 'JOB_UPDATE_FAILED')
  }
}

export async function updateMerchantJobStage(
  merchantId: string,
  jobId: string,
  stage: TryOnJobStage,
  patch?: Record<string, unknown>,
) {
  return updateMerchantJobMetadata(merchantId, jobId, {
    stage,
    ...(patch ?? {}),
  })
}

export async function getLatestPreparedGarmentForProduct(
  merchantId: string,
  productId: string,
) {
  const db = getSupabaseClient()
  const { data, error } = await db
    .from('tryon_jobs')
    .select('metadata')
    .eq('merchant_id', merchantId)
    .eq('product_id', productId)
    .eq('status', 'completed')
    .not('metadata->prepared_garment_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  return (data.metadata as TryOnJobMetadata)?.prepared_garment_url ?? null
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

export async function claimPendingJobsAtomic(limit: number): Promise<TryOnJobRecord[]> {
  const db = getSupabaseClient()

  const { data, error } = await db.rpc('claim_pending_jobs', {
    p_limit: limit,
  })

  if (error) {
    console.warn('[jobs] RPC claim_pending_jobs not available, falling back to non-atomic claiming')
    const pendingJobs = await listPendingJobsForProcessing(limit)
    const claimedJobs: TryOnJobRecord[] = []

    for (const job of pendingJobs) {
      const claimed = await claimPendingJob(job.id)
      if (claimed) {
        claimedJobs.push(claimed)
      }
    }

    return claimedJobs
  }

  return (data ?? []) as TryOnJobRecord[]
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

  if (!data) {
    return null
  }

  await updateMerchantJobStage(data.merchant_id, data.id, 'predicting')
  return getMerchantJobById(data.merchant_id, data.id)
}

export async function claimPendingJobs(limit: number) {
  return claimPendingJobsAtomic(limit)
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
  productName?: string | null
  requestId?: string | null
  category?: TryOnCategory | null
  metadata?: Record<string, unknown>
}) {
  const merchant = await getMerchantOrThrow(input.merchantId)
  await ensureMerchantCanCreateJobs(merchant)

  const normalizedRequestId = input.requestId?.trim() || null
  if (normalizedRequestId) {
    const existingJob = await findMerchantJobByRequestId(merchant.id, normalizedRequestId)
    if (existingJob && existingJob.status !== 'failed' && existingJob.status !== 'canceled') {
      return existingJob
    }
  }

  const db = getSupabaseClient()
  const legacyCategory = input.category ?? inferLegacyCategoryFromText(input.productName)
  const metadata = {
    stage: 'queued',
    request_id: normalizedRequestId,
    product_name: input.productName ?? null,
    ...(input.metadata ?? {}),
  }

  const rpcInput = {
    p_merchant_id: merchant.id,
    p_user_image_url: input.userImageUrl,
    p_product_image_url: input.productImageUrl,
    p_product_id: input.productId,
    p_category: legacyCategory,
    p_metadata: metadata,
  }

  const { data, error } = await db.rpc('create_tryon_job_with_credit', rpcInput)

  if (error) {
    const normalizedMessage = normalizeSupabaseMessage(error.message)

    if (isMissingRpcFunction(normalizedMessage, 'create_tryon_job_with_credit')) {
      return createMerchantTryOnJobFallback(merchant.id, {
        ...input,
        category: legacyCategory,
        metadata,
      })
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
    productName?: string | null
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
      metadata: input.metadata ?? {
        stage: 'queued',
        product_name: input.productName ?? null,
      },
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
