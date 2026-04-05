import { getMerchantProduct, listMerchantProducts } from './salla-api.service.js'

const CACHE_TTL_MS = 1000 * 60 * 5

interface CacheEntry<TValue> {
  expiresAt: number
  value: TValue
}

const productCache = new Map<string, CacheEntry<unknown>>()

function getCacheKey(kind: 'list' | 'detail', merchantId: number, suffix: string | number) {
  return `${kind}:${merchantId}:${suffix}`
}

function getCachedValue<TValue>(key: string) {
  const existing = productCache.get(key)
  if (!existing) {
    return null
  }

  if (existing.expiresAt <= Date.now()) {
    productCache.delete(key)
    return null
  }

  return existing.value as TValue
}

function setCachedValue(key: string, value: unknown) {
  productCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
}

export async function getMerchantProductsPage(merchantId: number, page: number) {
  const key = getCacheKey('list', merchantId, page)
  const cached = getCachedValue<Awaited<ReturnType<typeof listMerchantProducts>>>(key)

  if (cached) {
    return cached
  }

  const payload = await listMerchantProducts(merchantId, page)
  setCachedValue(key, payload)

  return payload
}

export async function getMerchantProductDetail(merchantId: number, productId: string) {
  const key = getCacheKey('detail', merchantId, productId)
  const cached = getCachedValue<Awaited<ReturnType<typeof getMerchantProduct>>>(key)

  if (cached) {
    return cached
  }

  const payload = await getMerchantProduct(merchantId, productId)
  setCachedValue(key, payload)

  return payload
}
