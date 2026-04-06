import { useState, useEffect } from 'react'
import { fetchWidgetSettings } from '@/lib/api'

export function useWidgetSettings() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const load = async () => {
    setIsLoading(true)
    try {
      const res = await fetchWidgetSettings()
      setData(res.data)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return {
    settings: data,
    isLoading,
    error,
    mutate: load,
  }
}
