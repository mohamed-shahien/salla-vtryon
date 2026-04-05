import type { Prediction } from 'replicate'

import { replicate } from '../config/clients.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'
import type { TryOnCategory } from './jobs.service.js'

export interface CreateTryOnPredictionInput {
  humanImageUrl: string
  garmentImageUrl: string
  category: TryOnCategory
  garmentDescription?: string | null
}

const TERMINAL_STATUSES = new Set(['succeeded', 'failed', 'canceled', 'aborted'])

// ─── Model identity ───────────────────────────────────────────────────────────

const DEFAULT_MODEL = 'cuuupid/idm-vton'

/**
 * Returns the prediction identifier to use with the Replicate API.
 *
 * Priority:
 *  1. REPLICATE_MODEL_VERSION (explicit version hash → required for community models like IDM-VTON)
 *  2. REPLICATE_MODEL          (model slug → works for official deployment models like flux)
 */
function getPredictionIdentifier() {
  if (env.REPLICATE_MODEL_VERSION?.trim()) {
    return { version: env.REPLICATE_MODEL_VERSION.trim() } as const
  }

  return { model: (env.REPLICATE_MODEL ?? DEFAULT_MODEL).trim() } as const
}

// ─── Model family detection ───────────────────────────────────────────────────

/**
 * Detects the model family so we can build the correct input schema.
 *
 * - 'idm-vton' : image-to-image try-on (cuuupid/idm-vton, yisol/idm-vton)
 *                Inputs: human_img + garm_img + garment_des
 *                Result: same person, same pose, wearing the garment
 *
 * - 'flux'     : text-to-image (black-forest-labs/flux-*)
 *                Inputs: text prompt only — cannot perform real try-on
 */
function getModelFamily(): 'idm-vton' | 'flux' {
  const identifier = env.REPLICATE_MODEL_VERSION?.trim() || env.REPLICATE_MODEL?.trim() || DEFAULT_MODEL
  const id = identifier.toLowerCase()

  if (id.includes('idm-vton') || id.includes('vton')) return 'idm-vton'
  return 'flux'
}

// ─── Input builders ───────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<TryOnCategory, string> = {
  upper_body: 'upper body garment',
  lower_body: 'lower body clothing',
  dresses: 'full-length dress or one-piece outfit',
}

/**
 * Builds the Replicate prediction input for IDM-VTON.
 *
 * The model takes the person's exact photo and the garment photo, then
 * composites the garment onto the person while preserving identity, pose,
 * and background details.
 */
function buildIdmVtonInput(input: CreateTryOnPredictionInput): Record<string, unknown> {
  const garmentDescription =
    input.garmentDescription?.trim() || CATEGORY_LABEL[input.category]

  return {
    human_img: input.humanImageUrl,
    garm_img: input.garmentImageUrl,
    garment_des: garmentDescription,
    is_checked: true,        // auto-mask the garment region on the human photo
    is_checked_crop: false,  // keep full image dimensions
    denoise_steps: 30,       // 20–40; 30 is a good quality/speed balance
    seed: 42,
  }
}

/**
 * Fallback input for text-to-image models (flux etc.).
 * NOTE: these models cannot actually perform virtual try-on — they generate
 * a new image from text only, ignoring both input photos. Kept as a fallback
 * path only; the default model should always be an image-to-image VTON model.
 */
function buildFluxInput(input: CreateTryOnPredictionInput): Record<string, unknown> {
  const garmentPart = input.garmentDescription?.trim()
    ? `The garment is "${input.garmentDescription.trim()}".`
    : `A ${CATEGORY_LABEL[input.category]}.`

  const prompt = [
    'Professional fashion editorial photograph.',
    garmentPart,
    'Photorealistic, sharp fabric detail, clean studio background,',
    'soft diffused lighting, fashion magazine quality, 4K, no text, no watermark.',
  ].join(' ')

  return {
    prompt,
    aspect_ratio: '2:3',
    output_format: 'jpg',
    output_quality: 90,
    safety_tolerance: 2,
    prompt_upsampling: true,
  }
}

function buildTryOnInput(input: CreateTryOnPredictionInput): Record<string, unknown> {
  return getModelFamily() === 'idm-vton'
    ? buildIdmVtonInput(input)
    : buildFluxInput(input)
}

// ─── Public API ───────────────────────────────────────────────────────────────

function getReplicateClient() {
  if (!replicate) {
    throw new AppError(
      'Replicate is not configured. Set REPLICATE_API_TOKEN.',
      500,
      'REPLICATE_NOT_CONFIGURED',
    )
  }

  return replicate
}

/**
 * Creates a Replicate prediction for the virtual try-on job.
 *
 * When REPLICATE_MODEL is set to cuuupid/idm-vton (default), the prediction
 * receives the shopper's photo and the product photo and outputs the same
 * shopper wearing the product — pose, face, and background are preserved.
 */
export async function createTryOnPrediction(input: CreateTryOnPredictionInput) {
  const client = getReplicateClient()

  return client.predictions.create({
    ...getPredictionIdentifier(),
    input: buildTryOnInput(input),
  })
}

export async function getPrediction(predictionId: string) {
  const client = getReplicateClient()

  return client.predictions.get(predictionId)
}

export async function cancelPrediction(predictionId: string) {
  try {
    const client = getReplicateClient()
    await client.predictions.cancel(predictionId)
  } catch {
    // best-effort only
  }
}

export function isPredictionTerminal(status: Prediction['status']) {
  return TERMINAL_STATUSES.has(status)
}

/**
 * Extracts a usable HTTPS URL from any output format Replicate may return.
 *
 * Handles:
 *  - string (direct URL)                   ← IDM-VTON
 *  - FileOutput  { url: () => URL }         ← flux-1.1-pro
 *  - Array of either of the above
 */
export function extractPredictionOutputUrl(prediction: Prediction): string | null {
  const output = prediction.output

  if (!output) {
    return null
  }

  if (typeof output === 'string' && output.startsWith('http')) {
    return output
  }

  if (Array.isArray(output)) {
    for (const item of output) {
      const url = resolveOutputItem(item)
      if (url) return url
    }
    return null
  }

  return resolveOutputItem(output)
}

function resolveOutputItem(item: unknown): string | null {
  if (typeof item === 'string' && item.startsWith('http')) {
    return item
  }

  // Replicate FileOutput: { url: () => URL }
  if (item && typeof item === 'object' && 'url' in item) {
    const urlProp = (item as { url: unknown }).url

    if (typeof urlProp === 'function') {
      try {
        const result = (urlProp as () => URL | string)()
        const resolved = typeof result === 'string' ? result : result?.toString?.()
        if (resolved && resolved.startsWith('http')) return resolved
      } catch {
        // ignore
      }
    }

    if (typeof urlProp === 'string' && urlProp.startsWith('http')) {
      return urlProp
    }
  }

  return null
}

/**
 * Polls Replicate until the prediction reaches a terminal state or times out.
 */
export async function waitForPredictionCompletion(predictionId: string): Promise<Prediction> {
  const startedAt = Date.now()

  while (Date.now() - startedAt < env.REPLICATE_TIMEOUT_MS) {
    const prediction = await getPrediction(predictionId)

    if (isPredictionTerminal(prediction.status)) {
      return prediction
    }

    await new Promise<void>((resolve) => {
      setTimeout(resolve, env.REPLICATE_POLL_INTERVAL_MS)
    })
  }

  throw new AppError(
    `Replicate prediction ${predictionId} timed out after ${env.REPLICATE_TIMEOUT_MS}ms.`,
    504,
    'REPLICATE_TIMEOUT',
  )
}
