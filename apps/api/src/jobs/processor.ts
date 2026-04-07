import { env } from '../config/env.js'
import { refundMerchantCredit } from '../services/credits.service.js'
import { preprocessGarmentImage } from '../services/garment-preprocessing.service.js'
import {
  analyzeGarmentImage,
  analyzeHumanImage,
  type ImageQualityReport,
} from '../services/image-analysis.service.js'
import {
  claimPendingJob,
  completeMerchantJob,
  getLatestPreparedGarmentForProduct,
  listPendingJobsForProcessing,
  listTimedOutProcessingJobs,
  markMerchantJobFailed,
  updateMerchantJobMetadata,
  updateMerchantJobPrediction,
} from '../services/jobs.service.js'
import { findMerchantById } from '../services/merchant.service.js'
import {
  cancelPrediction,
  createTryOnPrediction,
  extractPredictionOutputUrl,
  removeImageBackground,
  waitForPredictionCompletion,
} from '../services/replicate.service.js'
import { processAndUploadReplicateResultImage } from '../services/upload.service.js'
import { AppError } from '../utils/app-error.js'

function extractGarmentDescription(metadata: Record<string, unknown>) {
  const productName = metadata.product_name
  return typeof productName === 'string' ? productName : null
}

async function failTimedOutJobs() {
  const timeoutMs = env.JOB_TIMEOUT_MS || 150000
  const timedOutJobs = await listTimedOutProcessingJobs(timeoutMs)
  for (const job of timedOutJobs) {
    console.log(`[jobs] job=${job.id} timed out, refunding credit`)
    await markMerchantJobFailed({
      merchantId: job.merchant_id,
      jobId: job.id,
      errorMessage: 'Try-on job exceeded the processing timeout window.',
      replicatePredictionId: job.replicate_prediction_id,
      failureCode: 'JOB_TIMEOUT',
    })
    await refundMerchantCredit(job.merchant_id, job.id)
  }
}

let globalJobsInFlight = 0

async function processClaimedJob(jobId: string) {
  if (globalJobsInFlight >= env.JOB_PROCESSOR_BATCH_SIZE * 2) {
    return
  }

  globalJobsInFlight++
  let predictionId: string | null = null
  let jobToCleanup: { merchant_id: string; id: string } | null = null
  const jobStart = Date.now()
  let cacheHit = false
  let retryCount = 0
  let failureCode: string | null = null

  try {
    const claimedJob = await claimPendingJob(jobId)
    if (!claimedJob) return
    jobToCleanup = { merchant_id: claimedJob.merchant_id, id: claimedJob.id }

    console.log(`[jobs] job=${claimedJob.id} merchant=${claimedJob.merchant_id} product=${claimedJob.product_id} starting`)

    await updateMerchantJobMetadata(claimedJob.merchant_id, claimedJob.id, {
      current_step: 'PREPARING_GARMENT',
      progress: 20,
      retry_count: 0,
    })

    const merchant = await findMerchantById(claimedJob.merchant_id)
    if (!merchant) throw new AppError('Merchant not found.', 404)

    let garmentImageUrl = claimedJob.product_image_url
    let preprocessingMeta: Record<string, unknown> = {}

    const cachedUrl = claimedJob.product_id ? await getLatestPreparedGarmentForProduct(claimedJob.merchant_id, claimedJob.product_id) : null

    if (cachedUrl) {
      console.log(`[jobs] job=${claimedJob.id} cache_hit=true product=${claimedJob.product_id}`)
      garmentImageUrl = cachedUrl
      cacheHit = true
      preprocessingMeta = { cache_hit: true, cleaned_garment_url: cachedUrl }
    } else {
      console.log(`[jobs] job=${claimedJob.id} cache_hit=false, starting preprocessing`)

      const garmentReport = await analyzeGarmentImage(claimedJob.product_image_url)

      const needsBackgroundRemoval =
        garmentReport.verdict === 'warn' &&
        (garmentReport.warnings.some(w => w.includes('complex')) ||
         garmentReport.warnings.some(w => w.includes('background')))

      let processImageUrl = claimedJob.product_image_url
      if (needsBackgroundRemoval) {
        console.log(`[jobs] job=${claimedJob.id} background_removal=true (garment quality indicates need)`)
        processImageUrl = await removeImageBackground(claimedJob.product_image_url)
        preprocessingMeta.background_removal = true
      } else {
        console.log(`[jobs] job=${claimedJob.id} background_removal=false (garment quality good)`)
      }

      const pre = await preprocessGarmentImage({
        imageUrl: processImageUrl,
        merchantId: merchant.salla_merchant_id,
      })
      garmentImageUrl = pre.cleanedUrl
      preprocessingMeta = {
        cache_hit: false,
        preprocessing_applied: true,
        cleaned_garment_url: pre.cleanedUrl,
        background_removal: preprocessingMeta.background_removal || false,
      }
    }

    await updateMerchantJobMetadata(claimedJob.merchant_id, claimedJob.id, {
      ...preprocessingMeta,
      current_step: 'GENERATING_RESULT',
      progress: 50,
    })

    const prediction: any = await createTryOnPrediction({
      humanImageUrl: claimedJob.user_image_url,
      garmentImageUrl,
      garmentDescription: extractGarmentDescription(claimedJob.metadata),
      jobId: claimedJob.id,
    })

    predictionId = prediction?.id
    if (predictionId) {
      const modelName = prediction.model || env.REPLICATE_MODEL
      console.log(`[jobs] job=${claimedJob.id} replicate_prediction_id=${predictionId} model=${modelName}`)
      await updateMerchantJobPrediction(claimedJob.merchant_id, claimedJob.id, predictionId)
      await updateMerchantJobMetadata(claimedJob.merchant_id, claimedJob.id, { model_name: modelName })

      const final: any = await waitForPredictionCompletion(predictionId)

      if (final.status !== 'succeeded') {
        const err = final.error ? (typeof final.error === 'string' ? final.error : JSON.stringify(final.error)) : 'AI failed'
        failureCode = 'AI_GENERATION_FAILED'
        throw new Error(err)
      }

      const outputUrl = extractPredictionOutputUrl(final)
      if (!outputUrl) throw new Error('AI output missing.')

      await updateMerchantJobMetadata(claimedJob.merchant_id, claimedJob.id, {
        current_step: 'FINALIZING',
        progress: 80,
      })

      const uploaded = await processAndUploadReplicateResultImage({
        merchantId: merchant.salla_merchant_id,
        sourceUrl: outputUrl,
      })

      const duration = Date.now() - jobStart
      console.log(`[jobs] job=${claimedJob.id} completed duration=${duration}ms cache_hit=${cacheHit} model=${prediction.model || 'unknown'}`)

      await completeMerchantJob({
        merchantId: claimedJob.merchant_id,
        jobId: claimedJob.id,
        resultImageUrl: uploaded.url,
        replicatePredictionId: final.id,
        metadataPatch: {
          ...preprocessingMeta,
          current_step: 'COMPLETED',
          progress: 100,
          duration,
          cache_hit: cacheHit,
          retry_count: 0,
          failure_code: null,
        },
      })
    }
  } catch (error) {
    const duration = Date.now() - jobStart
    const errorMessage = error instanceof Error ? error.message : 'Failed'

    if (error instanceof AppError) {
      failureCode = error.code || 'PROCESSING_ERROR'
    } else if (!failureCode) {
      failureCode = 'UNKNOWN_ERROR'
    }

    console.error(`[jobs] job=${jobToCleanup?.id || jobId} failed duration=${duration}ms cache_hit=${cacheHit} failure_code=${failureCode} error:`, error)

    if (predictionId) await cancelPrediction(predictionId).catch(() => {})

    if (jobToCleanup) {
      await markMerchantJobFailed({
        merchantId: jobToCleanup.merchant_id,
        jobId: jobToCleanup.id,
        errorMessage,
        replicatePredictionId: predictionId,
        failureCode,
      })
      await refundMerchantCredit(jobToCleanup.merchant_id, jobToCleanup.id)
    }
  } finally {
    globalJobsInFlight--
  }
}

export function startJobProcessor() {
  if (!env.JOB_PROCESSOR_ENABLED) return { stop() {} }
  let stopped = false
  let timer: NodeJS.Timeout | null = null
  let cycleInFlight = false

  const schedule = () => { if (!stopped) timer = setTimeout(() => void runCycle(), env.JOB_PROCESSOR_POLL_INTERVAL_MS) }

  const runCycle = async () => {
    if (stopped || cycleInFlight) { schedule(); return; }
    cycleInFlight = true
    try {
      await failTimedOutJobs()
      const pending = await listPendingJobsForProcessing(env.JOB_PROCESSOR_BATCH_SIZE)

      await Promise.all(pending.map(job => processClaimedJob(job.id)))
    } catch (err) {
      console.error('[jobs] cycle error', err)
    } finally {
      cycleInFlight = false;
      schedule()
    }
  }

  console.log(`[jobs] processor active (parallel-mode). batch_size=${env.JOB_PROCESSOR_BATCH_SIZE}`)
  void runCycle()
  return { stop() { stopped = true; if (timer) clearTimeout(timer); } }
}
