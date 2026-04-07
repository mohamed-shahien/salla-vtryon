import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchMerchantJobs, type TryOnJob } from '@/lib/api'

export function useMerchantJobs(limit = 10) {
  const [jobs, setJobs] = useState<TryOnJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchMerchantJobs({ limit })
      if (response.ok) {
        setJobs(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    refresh()
  }, [refresh])

  return useMemo(() => ({ 
    jobs, 
    loading, 
    error, 
    refresh 
  }), [jobs, loading, error, refresh])
}
