import { useState, useEffect, useCallback } from 'react'
import { fetchMerchantProducts } from '@/lib/api'
import type { SallaProduct, ApiPagination } from '@/lib/api'

export function useSallaProducts(page = 1) {
  const [products, setProducts] = useState<SallaProduct[]>([])
  const [pagination, setPagination] = useState<ApiPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchMerchantProducts(page)
      setProducts(res.data)
      setPagination(res.pagination || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load products'))
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [page])

  return {
    products,
    pagination,
    isLoading,
    error,
    mutate: load,
  }
}
