import { getMerchantProduct, listMerchantCategories, listMerchantProducts } from './salla-api.service.js'

const CACHE_TTL_MS = 1000 * 60 * 5

interface CacheEntry<TValue> {
  expiresAt: number
  value: TValue
}

const productCache = new Map<string, CacheEntry<unknown>>()

function getCacheKey(kind: 'list' | 'detail' | 'categories', merchantId: number, suffix: string | number) {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

export async function getMerchantCategoriesPage(merchantId: number, page: number) {
  const key = getCacheKey('categories', merchantId, page)
  const cached = getCachedValue<Awaited<ReturnType<typeof listMerchantCategories>>>(key)

  if (cached) {
    return cached
  }

  const payload = await listMerchantCategories(merchantId, page)
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

function normalizeCategoryId(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim()
  }

  return null
}

function getCategoryIdFromObject(value: Record<string, unknown>) {
  return normalizeCategoryId(value.id ?? value.category_id ?? value.value)
}

export function extractSallaProductCategoryIds(product: unknown) {
  if (!product || typeof product !== 'object') {
    return []
  }

  const categoryIds = new Set<string>()
  const candidate = product as Record<string, unknown>

  for (const key of ['category_id', 'main_category_id']) {
    const categoryId = normalizeCategoryId(candidate[key])
    if (categoryId) {
      categoryIds.add(categoryId)
    }
  }

  for (const key of ['category', 'main_category']) {
    const value = candidate[key]
    const categoryId = isRecord(value) ? getCategoryIdFromObject(value) : normalizeCategoryId(value)
    if (categoryId) {
      categoryIds.add(categoryId)
    }
  }

  for (const key of ['categories', 'category_ids']) {
    const value = candidate[key]
    if (!Array.isArray(value)) {
      continue
    }

    for (const item of value) {
      const categoryId = isRecord(item) ? getCategoryIdFromObject(item) : normalizeCategoryId(item)
      if (categoryId) {
        categoryIds.add(categoryId)
      }
    }
  }

  return Array.from(categoryIds)
}

export function invalidateMerchantProductCache(merchantId: number) {
  const prefixList = `list:${merchantId}:`
  const prefixDetail = `detail:${merchantId}:`
  const prefixCategories = `categories:${merchantId}:`

  for (const key of productCache.keys()) {
    if (key.startsWith(prefixList) || key.startsWith(prefixDetail) || key.startsWith(prefixCategories)) {
      productCache.delete(key)
    }
  }
}
