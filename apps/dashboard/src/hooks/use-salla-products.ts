import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { fetchMerchantProducts } from '@/lib/api'
import type { SallaProduct, ApiPagination } from '@/lib/api'

export function useSallaProducts(page = 1) {
  const [products, setProducts] = useState<SallaProduct[]>([])
  const [pagination, setPagination] = useState<ApiPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const hasEmittedReady = useRef(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const startTime = performance.now()
      const res = await fetchMerchantProducts(page)
      const queryDuration = performance.now() - startTime

      // Track query duration in dev mode
      if (import.meta.env.DEV) {
        window.dispatchEvent(new CustomEvent('query-complete', {
          detail: { name: 'fetchMerchantProducts', duration: queryDuration }
        }))
      }

      setProducts(res.data)
      setPagination(res.pagination || null)
      setError(null)

      // Emit data-ready event once when data is loaded
      if (!hasEmittedReady.current) {
        hasEmittedReady.current = true
        window.dispatchEvent(new CustomEvent('data-ready'))
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load products'))
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  return useMemo(() => ({
    products,
    pagination,
    isLoading,
    error,
    mutate: load,
  }), [products, pagination, isLoading, error, load])
}
