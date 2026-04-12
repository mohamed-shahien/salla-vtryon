import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { fetchRoiStats, type RoiStats } from '@/lib/api'

export function useRoiStats() {
  const [stats, setStats] = useState<RoiStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const status = useAuthStore((state) => state.status)

  useEffect(() => {
    async function getStats() {
      if (status !== 'authenticated') {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetchRoiStats()
        setStats(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    void getStats()
  }, [status])

  return { stats, loading, error }
}
