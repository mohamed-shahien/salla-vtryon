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
      // Add a small cool-down to prevent aggressive burst triggers
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

const CATEGORY_FALLBACK: Record<TryOnCategory, string> = {
  upper_body: 'Short sleeve round neck t-shirt',
  lower_body: 'Casual straight-leg trousers',
  dresses: 'Full-length one-piece dress',
}

function buildSmartGarmentDescription(category: TryOnCategory, rawName?: string | null): string {
  if (!rawName?.trim()) return CATEGORY_FALLBACK[category]
  const name = rawName.trim()
  const isEnglish = /^[\x20-\x7E]+$/.test(name)
  if (isEnglish && name.length <= 80) return name
  return CATEGORY_FALLBACK[category]
}

function buildNanoBananaInput(input: CreateTryOnPredictionInput): Record<string, unknown> {
  const garmentType = input.category.replace('_', ' ')
  const prompt = [
    'Task: Professional virtual try-on and garment synthesis.',
    `Target: Drape the exact ${garmentType} from the second image onto the person in the first image.`,
    'Constraints:',
    '- Preserve the exact texture, pattern, and color of the garment.',
    '- Maintain the person\'s pose, facial features, hair, and original background.',
    '- Align clothing naturally with body shape and perspective.',
    '- Professional high-resolution fashion editorial quality.',
  ].join('\n')

  return {
    prompt,
    image_input: [input.humanImageUrl, input.garmentImageUrl],
    aspect_ratio: 'match_input_image',
    output_format: 'jpg',
  }
}

function buildIdmVtonInput(input: CreateTryOnPredictionInput): Record<string, unknown> {
  const garmentDescription = buildSmartGarmentDescription(input.category, input.garmentDescription)
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

function buildFluxInput(input: CreateTryOnPredictionInput): Record<string, unknown> {
  const garmentPart = input.garmentDescription?.trim() ? `The garment is "${input.garmentDescription.trim()}".` : `A single ${input.category.replace('_', ' ')} garment.`
  const prompt = [
    'Professional fashion editorial photograph.',
    garmentPart,
    'Photorealistic, sharp fabric detail, clean studio background, target fashion quality.',
  ].join(' ')

  return {
    prompt,
    aspect_ratio: '2:3',
    output_format: 'jpg',
    output_quality: 90,
  }
}

function buildTryOnInput(input: CreateTryOnPredictionInput): Record<string, unknown> {
  const family = getModelFamily()
  if (family === 'nano-banana') return buildNanoBananaInput(input)
  if (family === 'idm-vton') return buildIdmVtonInput(input)
  return buildFluxInput(input)
}

function getReplicateClient() {
  if (!replicate) throw new AppError('Replicate not configured.', 500, 'REPLICATE_NOT_CONFIGURED')
  return replicate
}

export async function createTryOnPrediction(input: CreateTryOnPredictionInput) {
  const client = getReplicateClient()
  const identifier = getPredictionIdentifier()
  const family = getModelFamily()
  const tryOnInput = buildTryOnInput(input)

  console.log(`[replicate] Creating prediction. family=${family}`)

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

    console.error(`[replicate] Prediction creation failed (Status: ${status}):`, details)

    if (status === 401) throw new AppError('Auth failed.', 401, 'REPLICATE_AUTH_FAILED')
    if (status === 429) throw new AppError('Replicate capacity reached.', 429, 'REPLICATE_RATE_LIMIT')

    throw error
  }
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
