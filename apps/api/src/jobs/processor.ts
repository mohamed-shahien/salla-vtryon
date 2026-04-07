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
  getLatestCleanedGarmentForProduct,
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

function formatQualityRejection(label: string, report: ImageQualityReport): string {
  const issues = [...report.reasons, ...report.warnings]
  return `${label}: ${issues.length > 0 ? issues.join(' ') : 'Quality check failed.'}`
}

async function failTimedOutJobs() {
  const timedOutJobs = await listTimedOutProcessingJobs(env.REPLICATE_TIMEOUT_MS)
  for (const job of timedOutJobs) {
    await markMerchantJobFailed({
      merchantId: job.merchant_id,
      jobId: job.id,
      errorMessage: 'Try-on job exceeded the processing timeout window.',
      replicatePredictionId: job.replicate_prediction_id,
    })
    await refundMerchantCredit(job.merchant_id, job.id)
  }
}

let globalJobsInFlight = 0
const MAX_GLOBAL_CONCURRENCY = 1 

async function processClaimedJob(jobId: string) {
  // Wait for available global slot
  while (globalJobsInFlight >= MAX_GLOBAL_CONCURRENCY) {
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  globalJobsInFlight++
  let predictionId: string | null = null
  let jobToCleanup: { merchant_id: string; id: string } | null = null

  try {
    const claimedJob = await claimPendingJob(jobId)
    if (!claimedJob) return
    jobToCleanup = { merchant_id: claimedJob.merchant_id, id: claimedJob.id }

    console.log(`[jobs] starting job ${claimedJob.id}`)
    await updateMerchantJobMetadata(claimedJob.merchant_id, claimedJob.id, { current_step: 'ANALYZING_IMAGES' })

    const [garmentReport, humanReport] = await Promise.all([
      analyzeGarmentImage(claimedJob.product_image_url),
      analyzeHumanImage(claimedJob.user_image_url),
    ])

    if (garmentReport.verdict === 'reject') {
      const message = formatQualityRejection('Product image rejected', garmentReport)
      await markMerchantJobFailed({ merchantId: claimedJob.merchant_id, jobId: claimedJob.id, errorMessage: message })
      await refundMerchantCredit(claimedJob.merchant_id, claimedJob.id)
      return
    }

    if (humanReport.verdict === 'reject') {
      const message = formatQualityRejection('Customer image rejected', humanReport)
      await markMerchantJobFailed({ merchantId: claimedJob.merchant_id, jobId: claimedJob.id, errorMessage: message })
      await refundMerchantCredit(claimedJob.merchant_id, claimedJob.id)
      return
    }

    const merchant = await findMerchantById(claimedJob.merchant_id)
    if (!merchant) throw new AppError('Merchant not found.', 404)

    let garmentImageUrl = claimedJob.product_image_url
    let preprocessingMeta: Record<string, unknown> = {}

    try {
      await updateMerchantJobMetadata(claimedJob.merchant_id, claimedJob.id, { current_step: 'PREPARING_GARMENT' })
      
      const cachedUrl = claimedJob.product_id ? await getLatestCleanedGarmentForProduct(claimedJob.merchant_id, claimedJob.product_id) : null

      if (cachedUrl) {
        console.log(`[jobs] Reusing cached garment for ${claimedJob.product_id}`)
        garmentImageUrl = cachedUrl
        preprocessingMeta = { preprocessing_reused: true, cleaned_garment_url: cachedUrl }
      } else {
        const cleanedUrl = await removeImageBackground(claimedJob.product_image_url)
        const pre = await preprocessGarmentImage({
          imageUrl: cleanedUrl,
          merchantId: merchant.salla_merchant_id,
          category: claimedJob.category,
        })
        garmentImageUrl = pre.cleanedUrl
        preprocessingMeta = { preprocessing_applied: true, cleaned_garment_url: pre.cleanedUrl }
      }
    } catch {
      preprocessingMeta = { preprocessing_failed: true }
    }

    await updateMerchantJobMetadata(claimedJob.merchant_id, claimedJob.id, { ...preprocessingMeta, current_step: 'GENERATING_RESULT' })

    const prediction: any = await createTryOnPrediction({
      humanImageUrl: claimedJob.user_image_url,
      garmentImageUrl,
      category: claimedJob.category,
      garmentDescription: extractGarmentDescription(claimedJob.metadata),
    })

    predictionId = prediction?.id
    if (predictionId) {
      await updateMerchantJobPrediction(claimedJob.merchant_id, claimedJob.id, predictionId)
      const final: any = await waitForPredictionCompletion(predictionId)
      
      if (final.status !== 'succeeded') {
        const err = final.error ? (typeof final.error === 'string' ? final.error : JSON.stringify(final.error)) : 'AI failed'
        throw new Error(err)
      }

      const outputUrl = extractPredictionOutputUrl(final)
      if (!outputUrl) throw new Error('AI output missing.')

      await updateMerchantJobMetadata(claimedJob.merchant_id, claimedJob.id, { current_step: 'FINALIZING' })

      const uploaded = await processAndUploadReplicateResultImage({
        merchantId: merchant.salla_merchant_id,
        sourceUrl: outputUrl,
      })

      await completeMerchantJob({
        merchantId: claimedJob.merchant_id,
        jobId: claimedJob.id,
        resultImageUrl: uploaded.url,
        replicatePredictionId: final.id,
        metadataPatch: { ...preprocessingMeta, current_step: 'COMPLETED' },
      })
    }
  } catch (error) {
    console.error(`[jobs] job failed:`, error)
    if (predictionId) await cancelPrediction(predictionId).catch(() => {})
    if (jobToCleanup) {
      await markMerchantJobFailed({
        merchantId: jobToCleanup.merchant_id,
        jobId: jobToCleanup.id,
        errorMessage: error instanceof Error ? error.message : 'Failed',
        replicatePredictionId: predictionId,
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
      for (const job of pending) {
        if (stopped) break
        await processClaimedJob(job.id)
      }
    } catch (err) { console.error('[jobs] cycle error', err) }
    finally { cycleInFlight = false; schedule() }
  }

  console.log(`[jobs] processor active.`)
  void runCycle()
  return { stop() { stopped = true; if (timer) clearTimeout(timer); } }
}
