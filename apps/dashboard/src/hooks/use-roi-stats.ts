import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { fetchRoiStats, type RoiStats } from '@/lib/api'

export function useRoiStats() {
  const [stats, setStats] = useState<RoiStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const session = useAuthStore((state) => state.session)

  useEffect(() => {
    async function getStats() {
      if (!session) return

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

    getStats()
  }, [session])

  return { stats, loading, error }
}
