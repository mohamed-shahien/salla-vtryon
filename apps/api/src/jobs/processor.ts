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
  removeImageBackground,
  waitForPredictionCompletion,
} from '../services/replicate.service.js'
import { processAndUploadReplicateResultImage } from '../services/upload.service.js'
import { AppError } from '../utils/app-error.js'

function extractGarmentDescription(metadata: Record<string, unknown>) {
  const productName = metadata.product_name
  return typeof productName === 'string' ? productName : null
}

/**
 * Formats a quality report into a human-readable failure message.
 */
function formatQualityRejection(
  label: string,
  report: ImageQualityReport,
): string {
  const issues = [...report.reasons, ...report.warnings]
  const detail = issues.length > 0 ? issues.join(' ') : 'Quality check failed.'
  return `${label}: ${detail}`
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
    // ─── Phase 1: Input Quality Gating ─────────────────────────────────
    // Analyze both images BEFORE sending to Replicate.
    // A rejection here means the input is fundamentally unsuitable —
    // we fail fast, refund the credit, and give a clear reason.

    console.log(`[jobs] preprocessing job ${claimedJob.id}`)

    const [garmentReport, humanReport] = await Promise.all([
      analyzeGarmentImage(claimedJob.product_image_url),
      analyzeHumanImage(claimedJob.user_image_url),
    ])

    // Log quality reports for debugging
    if (garmentReport.warnings.length > 0) {
      console.warn(`[jobs] garment quality warnings for ${claimedJob.id}:`, garmentReport.warnings)
    }
    if (humanReport.warnings.length > 0) {
      console.warn(`[jobs] human quality warnings for ${claimedJob.id}:`, humanReport.warnings)
    }

    // Hard reject: garment image is fundamentally broken
    if (garmentReport.verdict === 'reject') {
      const message = formatQualityRejection('Product image rejected', garmentReport)
      console.error(`[jobs] garment REJECTED for ${claimedJob.id}: ${message}`)

      await markMerchantJobFailed({
        merchantId: claimedJob.merchant_id,
        jobId: claimedJob.id,
        errorMessage: message,
      })
      await refundMerchantCredit(claimedJob.merchant_id, claimedJob.id)
      return
    }

    // Hard reject: human image is fundamentally broken
    if (humanReport.verdict === 'reject') {
      const message = formatQualityRejection('Customer image rejected', humanReport)
      console.error(`[jobs] human REJECTED for ${claimedJob.id}: ${message}`)

      await markMerchantJobFailed({
        merchantId: claimedJob.merchant_id,
        jobId: claimedJob.id,
        errorMessage: message,
      })
      await refundMerchantCredit(claimedJob.merchant_id, claimedJob.id)
      return
    }

    // ─── Phase 2: Garment Preprocessing ────────────────────────────────
    // Clean the garment image: trim background, isolate primary garment,
    // normalize to 3:4 ratio, flatten to white background.

    const merchant = await findMerchantById(claimedJob.merchant_id)
    if (!merchant) {
      throw new AppError('Merchant record was not found.', 404, 'MERCHANT_NOT_FOUND')
    }

    let garmentImageUrl = claimedJob.product_image_url
    let preprocessingMeta: Record<string, unknown> = {}

    try {
      // Step A: Advanced Garment Cleaning (AI-powered rembg)
      // This is the CRITICAL fix for 'noisy' product images (shoes, belts, mannequins)
      const cleanedGarmentUrl = await removeImageBackground(claimedJob.product_image_url)
      
      // Step B: Regional Cropping & Normalization
      const preprocessed = await preprocessGarmentImage({
        imageUrl: cleanedGarmentUrl, // Use the clean version
        merchantId: merchant.salla_merchant_id,
        category: claimedJob.category,
      })

      garmentImageUrl = preprocessed.cleanedUrl

      preprocessingMeta = {
        preprocessing_applied: true,
        preprocessing_steps: preprocessed.steps,
        original_garment_dimensions: `${preprocessed.originalWidth}×${preprocessed.originalHeight}`,
        cleaned_garment_url: preprocessed.cleanedUrl,
      }

      console.log(
        `[jobs] garment preprocessed for ${claimedJob.id}: ${preprocessed.steps.join(' → ')}`,
      )
    } catch (preprocessError) {
      // Preprocessing failure is NOT fatal — we proceed with the original image
      // but log the error for debugging
      console.warn(
        `[jobs] garment preprocessing failed for ${claimedJob.id}, using original:`,
        preprocessError instanceof Error ? preprocessError.message : preprocessError,
      )

      preprocessingMeta = {
        preprocessing_applied: false,
        preprocessing_error: preprocessError instanceof Error ? preprocessError.message : 'Unknown preprocessing error',
      }
    }

    // ─── Phase 3: Create Replicate Prediction ──────────────────────────
    let prediction
    let attempts = 0
    const MAX_ATTEMPTS = 5
    
    while (attempts < MAX_ATTEMPTS) {
      try {
        prediction = await createTryOnPrediction({
          humanImageUrl: claimedJob.user_image_url,
          garmentImageUrl,
          category: claimedJob.category,
          garmentDescription: extractGarmentDescription(claimedJob.metadata),
        })
        break
      } catch (err) {
        attempts++
        const message = err instanceof Error ? err.message : ''
        if (message.includes('429') && attempts < MAX_ATTEMPTS) {
          console.warn(`[jobs] Replicate rate limit (429) hit, retrying in 10s... (Attempt ${attempts}/${MAX_ATTEMPTS})`)
          await new Promise(resolve => setTimeout(resolve, 10000))
          continue
        }
        throw err
      }
    }

    if (!prediction) {
      throw new Error('Failed to create Replicate prediction after multiple retries.')
    }

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

    // ─── Phase 4: Upload Result ────────────────────────────────────────

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
        // Quality reports for observability
        garment_quality: {
          verdict: garmentReport.verdict,
          warnings: garmentReport.warnings,
          dimensions: `${garmentReport.metadata.width}×${garmentReport.metadata.height}`,
          brightness: garmentReport.metadata.meanBrightness,
        },
        human_quality: {
          verdict: humanReport.verdict,
          warnings: humanReport.warnings,
          dimensions: `${humanReport.metadata.width}×${humanReport.metadata.height}`,
          brightness: humanReport.metadata.meanBrightness,
        },
        ...preprocessingMeta,
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
