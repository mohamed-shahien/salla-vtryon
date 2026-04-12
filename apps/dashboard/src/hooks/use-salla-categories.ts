import { useCallback, useEffect, useMemo, useState } from 'react'

import { fetchMerchantCategories } from '@/lib/api'
import type { ApiPagination, SallaCategory } from '@/lib/api'

export function useSallaCategories(page = 1) {
  const [categories, setCategories] = useState<SallaCategory[]>([])
  const [pagination, setPagination] = useState<ApiPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetchMerchantCategories(page)
      setCategories(response.data)
      setPagination(response.pagination ?? null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load categories'))
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  return useMemo(
    () => ({
      categories,
      pagination,
      isLoading,
      error,
      mutate: load,
    }),
    [categories, pagination, isLoading, error, load],
  )
}
