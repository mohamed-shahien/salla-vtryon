import type { Prediction } from 'replicate'

import { replicate } from '../config/clients.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/app-error.js'

export interface CreateTryOnPredictionInput {
  humanImageUrl: string
  garmentImageUrl: string
  garmentDescription?: string | null
  jobId?: string
}

const TERMINAL_STATUSES = new Set(['succeeded', 'failed', 'canceled', 'aborted'])

class ReplicatePool {
  private inFlight = 0
  private queue: (() => void)[] = []

  async acquire(): Promise<void> {
    if (this.inFlight < env.REPLICATE_MAX_CONCURRENCY) {
      this.inFlight++
      return
    }
    return new Promise((resolve) => this.queue.push(resolve))
  }

  release(): void {
    const next = this.queue.shift()
    if (next) {
      next()
    } else {
      this.inFlight--
    }
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire()
    try {
      const result = await fn()
      await new Promise(r => setTimeout(r, 500))
      return result
    } finally {
      this.release()
    }
  }
}

const pool = new ReplicatePool()

const DEFAULT_MODEL = 'google/nano-banana'
const DEFAULT_VERSION = ''

function getPredictionIdentifier() {
  const model = (env.REPLICATE_MODEL ?? DEFAULT_MODEL).trim()
  const version = (env.REPLICATE_MODEL_VERSION || (model === DEFAULT_MODEL ? DEFAULT_VERSION : '')).trim()

  if (version) {
    return { version } as const
  }

  return { model } as const
}

function getModelFamily(): 'nano-banana' | 'idm-vton' | 'flux' {
  const model = (env.REPLICATE_MODEL ?? DEFAULT_MODEL).toLowerCase()
  const version = (env.REPLICATE_MODEL_VERSION ?? '').toLowerCase()

  if (model.includes('nano-banana')) return 'nano-banana'
  if (model.includes('idm-vton') || model.includes('vton') || version.includes('vton')) return 'idm-vton'
  return 'flux'
}

const UNIVERSAL_TRYON_PROMPT = `You are an expert virtual try-on AI system. Your task is to seamlessly integrate the garment from the second image onto the person in the first image.

ANALYSIS PHASE:
1. Examine the person (first image) thoroughly:
   - Body shape and proportions
   - Pose and posture
   - Camera angle and perspective
   - Visible body areas and occlusions
   - Lighting conditions and shadows
   - Skin tone and facial features

2. Examine the garment (second image) thoroughly:
   - Product type (shirt, dress, pants, thobe, abaya, suit, etc.)
   - Texture, fabric, and material properties
   - Colors and patterns
   - Fitting style (loose, fitted, oversized)
   - Edges, sleeves, length, layers, and any accessories

GENERATION PHASE:
Apply the garment to the person following these rules:
- Preserve the EXACT texture, pattern, and color of the garment
- Maintain the person's original pose, facial features, hair, and background
- Align the clothing naturally with body shape and perspective
- Respect all occlusions - fabric should drape correctly over visible body parts
- Match lighting and shadows to the person's environment
- Ensure proper fit based on the garment's intended style

OUTPUT REQUIREMENTS:
- Photorealistic fashion editorial quality
- Sharp fabric detail
- Seamless integration without visible seams
- Format: JPG
- Resolution: High quality`

function buildUniversalTryOnInput(input: CreateTryOnPredictionInput): Record<string, unknown> {
  const family = getModelFamily()

  if (family === 'idm-vton') {
    return {
      human_img: input.humanImageUrl,
      garm_img: input.garmentImageUrl,
      garment_des: input.garmentDescription?.trim() || 'A garment for virtual try-on',
      category: 'upper_body',
      crop: true,
      denoise_steps: 40,
      force_dc: false,
      seed: Math.floor(Math.random() * 2147483647),
    }
  }

  if (family === 'nano-banana') {
    return {
      prompt: UNIVERSAL_TRYON_PROMPT,
      image_input: [input.humanImageUrl, input.garmentImageUrl],
      aspect_ratio: 'match_input_image',
      output_format: 'jpg',
    }
  }

  return {
    prompt: `${UNIVERSAL_TRYON_PROMPT}\n\n${input.garmentDescription?.trim() || ''}`,
    aspect_ratio: '2:3',
    output_format: 'jpg',
    output_quality: 90,
  }
}

function getReplicateClient() {
  if (!replicate) throw new AppError('Replicate not configured.', 500, 'REPLICATE_NOT_CONFIGURED')
  return replicate
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function executeWithRetry<T>(
  jobId: string,
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  const BASE_DELAY_MS = 15000 // 15 seconds

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.code === 'REPLICATE_RATE_LIMIT'

      if (!isRateLimit || attempt === maxRetries) {
        throw error
      }

      const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 5000
      const retryNum = attempt + 1
      console.log(`[replicate] job=${jobId} 429 caught, retry ${retryNum}/${maxRetries} after ${Math.round(delay)}ms`)
      await sleep(delay)
    }
  }

  throw new AppError('Max retries exceeded for Replicate API', 504, 'REPLICATE_MAX_RETRIES')
}

export async function createTryOnPrediction(input: CreateTryOnPredictionInput) {
  const client = getReplicateClient()
  const identifier = getPredictionIdentifier()
  const family = getModelFamily()
  const modelName = env.REPLICATE_MODEL || DEFAULT_MODEL
  const tryOnInput = buildUniversalTryOnInput(input)

  console.log(`[replicate] job=${input.jobId || 'unknown'} Creating prediction. family=${family} model=${modelName}`)

  return executeWithRetry(input.jobId || 'unknown', async () => {
    try {
      return await pool.run(() =>
        client.predictions.create({
          ...identifier,
          input: tryOnInput,
        })
      )
    } catch (error: any) {
      const status = error?.status || error?.response?.status
      const details = error?.response?.data || error?.message

      console.error(`[replicate] job=${input.jobId || 'unknown'} Prediction creation failed (Status: ${status}):`, details)

      if (status === 401) throw new AppError('Auth failed.', 401, 'REPLICATE_AUTH_FAILED')
      if (status === 429) throw new AppError('Replicate capacity reached.', 429, 'REPLICATE_RATE_LIMIT')

      throw error
    }
  })
}

export async function getPrediction(predictionId: string) {
  return getReplicateClient().predictions.get(predictionId)
}

export async function cancelPrediction(predictionId: string) {
  try { await getReplicateClient().predictions.cancel(predictionId) } catch { }
}

export async function removeImageBackground(imageUrl: string): Promise<string> {
  const client = getReplicateClient()
  console.log(`[replicate] Cleaning garment image...`)

  try {
    const prediction = await pool.run(() =>
      client.predictions.create({
        model: 'lucataco/remove-bg',
        version: '95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1',
        input: { image: imageUrl },
      })
    )

    const result = await waitForPredictionCompletion(prediction.id)
    const cleanUrl = extractPredictionOutputUrl(result)
    if (!cleanUrl) throw new Error('Rembg failed.')
    return cleanUrl
  } catch (error) {
    console.warn(`[replicate] Rembg failed, using original:`, error)
    return imageUrl
  }
}

export function isPredictionTerminal(status: Prediction['status']) {
  return TERMINAL_STATUSES.has(status)
}

export function extractPredictionOutputUrl(prediction: Prediction): string | null {
  const output = prediction.output
  if (!output) return null
  if (typeof output === 'string' && output.startsWith('http')) return output
  if (Array.isArray(output)) {
    for (const item of output) {
      const url = resolveOutputItem(item)
      if (url) return url
    }
  }
  return resolveOutputItem(output)
}

function resolveOutputItem(item: unknown): string | null {
  if (typeof item === 'string' && item.startsWith('http')) return item
  if (item && typeof item === 'object' && 'url' in item) {
    const urlProp = (item as any).url
    if (typeof urlProp === 'function') {
      try { return urlProp().toString() } catch { }
    }
    if (typeof urlProp === 'string' && urlProp.startsWith('http')) return urlProp
  }
  return null
}

export async function waitForPredictionCompletion(predictionId: string): Promise<Prediction> {
  const startedAt = Date.now()
  while (Date.now() - startedAt < env.REPLICATE_TIMEOUT_MS) {
    const prediction = await getPrediction(predictionId)
    if (isPredictionTerminal(prediction.status)) return prediction
    await new Promise(r => setTimeout(r, env.REPLICATE_POLL_INTERVAL_MS))
  }
  throw new AppError(`Timeout.`, 504, 'REPLICATE_TIMEOUT')
}
