import { useState, useEffect } from 'react'
import { fetchMerchantJobs, type TryOnJob } from '@/lib/api'

export function useMerchantJobs(limit = 10) {
  const [jobs, setJobs] = useState<TryOnJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
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
  }

  useEffect(() => {
    refresh()
  }, [limit])

  return { jobs, loading, error, refresh }
}
