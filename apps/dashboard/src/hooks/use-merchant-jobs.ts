import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { fetchMerchantJobs, type TryOnJob } from '@/lib/api'

export function useMerchantJobs(limit = 10) {
  const [jobs, setJobs] = useState<TryOnJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasEmittedReady = useRef(false)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const startTime = performance.now()
      const response = await fetchMerchantJobs({ limit })
      const queryDuration = performance.now() - startTime

      // Track query duration in dev mode
      if (import.meta.env.DEV) {
        window.dispatchEvent(new CustomEvent('query-complete', {
          detail: { name: 'fetchMerchantJobs', duration: queryDuration }
        }))
      }

      if (response.ok) {
        setJobs(response.data)
      }

      // Emit data-ready event once when data is loaded
      if (!hasEmittedReady.current) {
        hasEmittedReady.current = true
        window.dispatchEvent(new CustomEvent('data-ready'))
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
