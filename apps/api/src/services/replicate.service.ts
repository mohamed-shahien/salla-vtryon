import type { Prediction } from 'replicate'

import { replicate } from '../config/clients.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'
import type { TryOnCategory } from './jobs.service.js'

interface CreateTryOnPredictionInput {
  humanImageUrl: string
  garmentImageUrl: string
  category: TryOnCategory
  garmentDescription?: string | null
}

const TERMINAL_PREDICTION_STATUSES = new Set(['succeeded', 'failed', 'canceled', 'aborted'])
const DEFAULT_REPLICATE_MODEL = 'cuuupid/idm-vton'
const DEFAULT_REPLICATE_MODEL_VERSION =
  '06c010e9b3e0a97fbff913c8c3d0ff34cb943afd87b1530f078516f2c5fca971'

function getReplicateClient() {
  if (!replicate) {
    throw new AppError('Replicate is not configured for AI processing.', 500, 'REPLICATE_NOT_CONFIGURED')
  }

  return replicate
}

function getPredictionIdentifier() {
  if (env.REPLICATE_MODEL_VERSION?.trim()) {
    return {
      version: env.REPLICATE_MODEL_VERSION.trim(),
    } as const
  }

  if (env.REPLICATE_MODEL.trim() === DEFAULT_REPLICATE_MODEL) {
    return {
      version: DEFAULT_REPLICATE_MODEL_VERSION,
    } as const
  }

  return {
    model: env.REPLICATE_MODEL.trim(),
  } as const
}

export function isPredictionTerminal(status: Prediction['status']) {
  return TERMINAL_PREDICTION_STATUSES.has(status)
}

export async function createTryOnPrediction(input: CreateTryOnPredictionInput) {
  const client = getReplicateClient()

  return client.predictions.create({
    ...getPredictionIdentifier(),
    input: {
      human_img: input.humanImageUrl,
      garm_img: input.garmentImageUrl,
      category: input.category,
      garment_des: input.garmentDescription ?? '',
    },
  })
}

export async function getPrediction(predictionId: string) {
  const client = getReplicateClient()
  return client.predictions.get(predictionId)
}

export async function cancelPrediction(predictionId: string) {
  const client = getReplicateClient()
  return client.predictions.cancel(predictionId)
}

export function extractPredictionOutputUrl(prediction: Prediction) {
  const output = prediction.output

  if (typeof output === 'string') {
    return output
  }

  if (Array.isArray(output)) {
    for (const item of output) {
      if (typeof item === 'string') {
        return item
      }

      if (
        item &&
        typeof item === 'object' &&
        'url' in item &&
        typeof (item as { url?: unknown }).url === 'function'
      ) {
        const value = (item as { url: () => URL }).url()
        return value.toString()
      }
    }
  }

  if (
    output &&
    typeof output === 'object' &&
    'url' in output &&
    typeof (output as { url?: unknown }).url === 'function'
  ) {
    return (output as { url: () => URL }).url().toString()
  }

  return null
}

export async function waitForPredictionCompletion(predictionId: string) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < env.REPLICATE_TIMEOUT_MS) {
    const prediction = await getPrediction(predictionId)

    if (isPredictionTerminal(prediction.status)) {
      return prediction
    }

    await new Promise((resolve) => setTimeout(resolve, env.REPLICATE_POLL_INTERVAL_MS))
  }

  throw new AppError(
    `Replicate prediction ${predictionId} exceeded the timeout window.`,
    504,
    'REPLICATE_TIMEOUT',
  )
}
