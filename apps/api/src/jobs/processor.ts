import { env } from '../config/env.js'
import { refundMerchantCredit } from '../services/credits.service.js'
import {
  claimPendingJob,
  completeMerchantJob,
  listPendingJobsForProcessing,
  listTimedOutProcessingJobs,
  markMerchantJobFailed,
  updateMerchantJobPrediction,
} from '../services/jobs.service.js'
import { findMerchantById } from '../services/merchant.service.js'
import {
  cancelPrediction,
  createTryOnPrediction,
  extractPredictionOutputUrl,
  waitForPredictionCompletion,
} from '../services/replicate.service.js'
import { processAndUploadReplicateResultImage } from '../services/upload.service.js'
import { AppError } from '../utils/app-error.js'

function extractGarmentDescription(metadata: Record<string, unknown>) {
  const productName = metadata.product_name
  return typeof productName === 'string' ? productName : null
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

async function processClaimedJob(jobId: string) {
  const claimedJob = await claimPendingJob(jobId)
  if (!claimedJob) {
    return
  }

  let predictionId: string | null = null

  try {
    const prediction = await createTryOnPrediction({
      humanImageUrl: claimedJob.user_image_url,
      garmentImageUrl: claimedJob.product_image_url,
      category: claimedJob.category,
      garmentDescription: extractGarmentDescription(claimedJob.metadata),
    })

    predictionId = prediction.id
    await updateMerchantJobPrediction(claimedJob.merchant_id, claimedJob.id, prediction.id)

    const finalPrediction = await waitForPredictionCompletion(prediction.id)

    if (finalPrediction.status !== 'succeeded') {
      throw new AppError(
        typeof finalPrediction.error === 'string'
          ? finalPrediction.error
          : `Replicate prediction ended with status ${finalPrediction.status}.`,
        502,
        'REPLICATE_PREDICTION_FAILED',
      )
    }

    const outputUrl = extractPredictionOutputUrl(finalPrediction)
    if (!outputUrl) {
      throw new AppError(
        'Replicate completed without returning a usable output URL.',
        502,
        'REPLICATE_OUTPUT_MISSING',
      )
    }

    const merchant = await findMerchantById(claimedJob.merchant_id)
    if (!merchant) {
      throw new AppError('Merchant record was not found.', 404, 'MERCHANT_NOT_FOUND')
    }

    const uploadedResult = await processAndUploadReplicateResultImage({
      merchantId: merchant.salla_merchant_id,
      sourceUrl: outputUrl,
    })

    await completeMerchantJob({
      merchantId: claimedJob.merchant_id,
      jobId: claimedJob.id,
      resultImageUrl: uploadedResult.url,
      replicatePredictionId: finalPrediction.id,
      metadataPatch: {
        ...(claimedJob.metadata ?? {}),
        replicate_output_url: outputUrl,
        result_storage_path: uploadedResult.storage_path,
        replicate_metrics: finalPrediction.metrics ?? null,
      },
    })
  } catch (error) {
    if (predictionId) {
      try {
        await cancelPrediction(predictionId)
      } catch {
        // best effort only; cancellation may fail if prediction already finished
      }
    }

    await markMerchantJobFailed({
      merchantId: claimedJob.merchant_id,
      jobId: claimedJob.id,
      errorMessage: error instanceof Error ? error.message : 'Unexpected job processing error.',
      replicatePredictionId: predictionId,
    })
    await refundMerchantCredit(claimedJob.merchant_id, claimedJob.id)
  }
}

export function startJobProcessor() {
  if (!env.JOB_PROCESSOR_ENABLED) {
    console.log('[jobs] processor disabled by JOB_PROCESSOR_ENABLED=false')
    return {
      stop() {
        return
      },
    }
  }

  let stopped = false
  let timer: NodeJS.Timeout | null = null
  let cycleInFlight = false

  const schedule = () => {
    if (stopped) {
      return
    }

    timer = setTimeout(() => {
      void runCycle()
    }, env.JOB_PROCESSOR_POLL_INTERVAL_MS)
  }

  const runCycle = async () => {
    if (stopped || cycleInFlight) {
      schedule()
      return
    }

    cycleInFlight = true

    try {
      await failTimedOutJobs()

      const pendingJobs = await listPendingJobsForProcessing(env.JOB_PROCESSOR_BATCH_SIZE)

      for (const job of pendingJobs) {
        if (stopped) {
          break
        }

        await processClaimedJob(job.id)
      }
    } catch (error) {
      console.error('[jobs] processor cycle failed', error)
    } finally {
      cycleInFlight = false
      schedule()
    }
  }

  console.log(
    `[jobs] processor enabled. poll=${env.JOB_PROCESSOR_POLL_INTERVAL_MS}ms batch=${env.JOB_PROCESSOR_BATCH_SIZE}`,
  )
  void runCycle()

  return {
    stop() {
      stopped = true

      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    },
  }
}
