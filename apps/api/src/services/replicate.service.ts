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

/**
 * Global mutex to prevent concurrent Replicate calls.
 * This is critical because many Replicate accounts have a concurrency limit of 1.
 * By wrapping our calls in this lock, we ensure we never trigger a 429 internally.
 */
let replicateMutex: Promise<void> = Promise.resolve()

async function withReplicateLock<T>(fn: () => Promise<T>): Promise<T> {
  const currentLock = replicateMutex
  let resolveLock: () => void

  replicateMutex = new Promise((resolve) => {
    resolveLock = resolve
  })

  try {
    await currentLock
    return await fn()
  } finally {
    // After the API call completes, add a tiny 'settle' delay before releasing the lock
    await new Promise((resolve) => setTimeout(resolve, 500))
    resolveLock!()
  }
}

// ─── Model identity ───────────────────────────────────────────────────────────

const DEFAULT_MODEL = 'google/nano-banana'
const DEFAULT_VERSION = ''

/**
 * Returns the prediction identifier to use with the Replicate API.
 *
 * Priority:
 *  1. REPLICATE_MODEL_VERSION (explicit version hash)
 *  2. DEFAULT_VERSION (if using the default flux-vton model)
 *  3. REPLICATE_MODEL (model slug)
 */
function getPredictionIdentifier() {
  const model = (env.REPLICATE_MODEL ?? DEFAULT_MODEL).trim()
  const version = (env.REPLICATE_MODEL_VERSION || (model === DEFAULT_MODEL ? DEFAULT_VERSION : '')).trim()

  // Use version hash if provided (required for community models like flux-vton)
  if (version) {
    return { version } as const
  }

  // Fallback to model slug (works for official models like flux-1.1-pro)
  return { model } as const
}

// ─── Model family detection ───────────────────────────────────────────────────

function getModelFamily(): 'nano-banana' | 'idm-vton' | 'flux' {
  const model = (env.REPLICATE_MODEL ?? DEFAULT_MODEL).toLowerCase()
  const version = (env.REPLICATE_MODEL_VERSION ?? '').toLowerCase()
  
  if (model.includes('nano-banana')) {
    return 'nano-banana'
  }

  if (model.includes('idm-vton') || model.includes('vton') || version.includes('vton')) {
    return 'idm-vton'
  }

  return 'flux'
}

// ─── Input builders ───────────────────────────────────────────────────────────

/**
 * Category-specific short English descriptions for IDM-VTON.
 *
 * IDM-VTON uses `garment_des` as a SHORT semantic label — NOT a long prompt.
 * The model's IP-Adapter maps this to high-level garment features.
 * Keep it concise: type + basic attributes. The model does the rest visually.
 */
const CATEGORY_FALLBACK: Record<TryOnCategory, string> = {
  upper_body: 'Short sleeve round neck t-shirt',
  lower_body: 'Casual straight-leg trousers',
  dresses: 'Full-length one-piece dress',
}

/**
 * Builds a short, precise garment description for IDM-VTON.
 *
 * The model performs best with a simple, factual English description
 * of the garment type. Long instructions or Arabic text degrade quality.
 */
function buildSmartGarmentDescription(
  category: TryOnCategory,
  rawName?: string | null,
): string {
  // IDM-VTON wants a short English garment label.
  // We try to extract something useful from the product name,
  // but fall back to a category-appropriate default.
  if (!rawName?.trim()) {
    return CATEGORY_FALLBACK[category]
  }

  // If the product name is English and reasonably short, use it directly
  const name = rawName.trim()

  // Check if name is primarily ASCII (English) — use as-is if so
  const isEnglish = /^[\x20-\x7E]+$/.test(name)
  if (isEnglish && name.length <= 80) {
    return name
  }

  // For Arabic or very long names, use the category fallback
  // The visual information in the (now preprocessed) image is more reliable
  // than a translated product name
  return CATEGORY_FALLBACK[category]
}

/**
 * Builds the Replicate prediction input for google/nano-banana.
 *
 * Nano-Banana is a general image editor. We treat it as a try-on engine
 * by providing a prompt that asks to combine the person and the garment.
 */
function buildNanoBananaInput(input: CreateTryOnPredictionInput): Record<string, unknown> {
  const garmentType = input.category.replace('_', ' ')
  const prompt = [
    `The first image shows a person and the second image shows a ${garmentType}.`,
    `Modify the person to be wearing the exact ${garmentType} shown in the second image.`,
    'Maintain the person\'s pose, facial features, and background.',
    'The output should be a professional high-quality fashion photograph.',
  ].join(' ')

  return {
    prompt,
    image_input: [input.humanImageUrl, input.garmentImageUrl],
    aspect_ratio: 'match_input_image',
    output_format: 'jpg',
  }
}


/**
 * Builds the Replicate prediction input for IDM-VTON.
 *
 * Optimized parameters:
 *  - `category`    : explicit garment category (upper/lower/dresses)
 *  - `crop: true`  : handles non-3:4 human images without distortion
 *  - `denoise_steps: 40`: maximum quality (vs 30 default)
 *  - `force_dc`    : enables DressCode pipeline for full-body garments
 *  - `seed`        : randomized to avoid repeating artifacts
 */
function buildIdmVtonInput(input: CreateTryOnPredictionInput): Record<string, unknown> {
  const garmentDescription = buildSmartGarmentDescription(
    input.category,
    input.garmentDescription,
  )

  return {
    human_img: input.humanImageUrl,
    garm_img: input.garmentImageUrl,
    garment_des: garmentDescription,
    category: input.category,
    crop: true,
    denoise_steps: 40,
    force_dc: input.category === 'dresses',
    seed: Math.floor(Math.random() * 2147483647),
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
    : `A single ${input.category.replace('_', ' ')} garment.`

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
  const family = getModelFamily()

  if (family === 'nano-banana') {
    return buildNanoBananaInput(input)
  }

  if (family === 'idm-vton') {
    return buildIdmVtonInput(input)
  }

  return buildFluxInput(input)
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


export async function createTryOnPrediction(input: CreateTryOnPredictionInput) {
  const client = getReplicateClient()
  const identifier = getPredictionIdentifier()
  const family = getModelFamily()
  const tryOnInput = buildTryOnInput(input)

  // Log the exact input for debugging quality issues
  console.log(`[replicate] Creating prediction. family=${family} identifier=${'version' in identifier ? (identifier.version ? identifier.version.slice(0, 8) + '...' : 'unknown') : identifier.model} (Model: ${env.REPLICATE_MODEL})`)
  console.log(`[replicate] Input details:`, {
    family,
    category: input.category,
    ...(family === 'nano-banana' ? { prompt: (tryOnInput.prompt as string).slice(0, 50) + '...' } : { garment: (tryOnInput.garment || tryOnInput.human_img || tryOnInput.image || 'N/A').toString().slice(0, 80) + '...' }),
  })

  try {
    return await withReplicateLock(() => 
      client.predictions.create({
        ...identifier,
        input: tryOnInput,
      })
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      throw new AppError(
        'Replicate authentication failed. Please verify your REPLICATE_API_TOKEN in the .env file.',
        401,
        'REPLICATE_AUTH_FAILED',
      )
    }
    throw error
  }
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

/**
 * Removes the background from a garment image to isolate the clothing item.
 * 
 * This is CRITICAL for VTON. If the product image has mannequins, shoes, 
 * or belts, the VTON model will try to put them on the person. 
 * This cleaner removes everything but the main item.
 */
export async function removeImageBackground(imageUrl: string): Promise<string> {
  const client = getReplicateClient()
  
  console.log(`[replicate] Cleaning garment image (removing background/accessories)...`)
  
  try {
    const prediction = await withReplicateLock(() => 
      client.predictions.create({
        model: 'lucataco/remove-bg',
        version: '95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1',
        input: { image: imageUrl },
      })
    )

    const result = await waitForPredictionCompletion(prediction.id)
    const cleanUrl = extractPredictionOutputUrl(result)
    
    if (!cleanUrl) {
      throw new Error('Background removal failed to return a URL.')
    }

    console.log(`[replicate] Garment cleaned successfully.`)
    return cleanUrl
  } catch (error) {
    console.warn(`[replicate] Background removal failed, using original image:`, error)
    return imageUrl
  }
}

export function isPredictionTerminal(status: Prediction['status']) {
  return TERMINAL_STATUSES.has(status)
}


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
