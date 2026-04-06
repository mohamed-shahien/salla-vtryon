import { useState, useEffect } from 'react'
import { fetchMerchantProducts, SallaProduct, ApiPagination } from '@/lib/api'

export function useSallaProducts(page = 1) {
  const [products, setProducts] = useState<SallaProduct[]>([])
  const [pagination, setPagination] = useState<ApiPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const load = async () => {
    setIsLoading(true)
    try {
      const res = await fetchMerchantProducts(page)
      setProducts(res.data)
      setPagination(res.pagination || null)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

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
