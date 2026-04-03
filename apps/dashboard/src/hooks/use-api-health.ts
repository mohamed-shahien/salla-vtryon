import { useEffect, useState } from 'react'

interface ReadinessNode {
  configured: boolean
}

interface ApiHealthResponse {
  ok: boolean
  phase: string
  service: string
  timestamp: string
  readiness: {
    salla: ReadinessNode
    supabase: ReadinessNode
    replicate: ReadinessNode
    bunny: ReadinessNode
    app: ReadinessNode
  }
}

interface ApiHealthState {
  status: 'idle' | 'loading' | 'ready' | 'failed'
  data: ApiHealthResponse | null
  error: string | null
}

export function useApiHealth() {
  const [state, setState] = useState<ApiHealthState>({
    status: 'idle',
    data: null,
    error: null,
  })

  useEffect(() => {
    let active = true

    async function loadHealth() {
      setState({ status: 'loading', data: null, error: null })

      try {
        const response = await fetch('/health')
        if (!response.ok) {
          throw new Error(`Health request failed with status ${response.status}`)
        }

        const data = (await response.json()) as ApiHealthResponse
        if (!active) {
          return
        }

        setState({ status: 'ready', data, error: null })
      } catch (error) {
        if (!active) {
          return
        }

        setState({
          status: 'failed',
          data: null,
          error: error instanceof Error ? error.message : 'Unknown health error',
        })
      }
    }

    void loadHealth()

    return () => {
      active = false
    }
  }, [])

  return state
}
