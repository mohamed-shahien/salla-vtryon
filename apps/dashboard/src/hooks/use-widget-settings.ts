import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchWidgetSettings } from '@/lib/api'
import type { MerchantWidgetSettings } from '@/lib/api'

export function useWidgetSettings() {
  const [data, setData] = useState<MerchantWidgetSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchWidgetSettings()
      setData(res.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch widget settings'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return useMemo(() => ({
    settings: data,
    isLoading,
    error,
    mutate: load,
  }), [data, isLoading, error, load])
}
