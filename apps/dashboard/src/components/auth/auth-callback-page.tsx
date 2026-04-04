import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { verifyAuthHandoff } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setLoading = useAuthStore((state) => state.setLoading)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const setError = useAuthStore((state) => state.setError)

  useEffect(() => {
    const handoff = searchParams.get('handoff')

    async function completeAuth() {
      if (!handoff) {
        setError('OAuth callback did not include a usable auth handoff token.')
        return
      }

      try {
        setLoading()
        const response = await verifyAuthHandoff(handoff)
        setAuthenticated(response.data)
        navigate('/dashboard', { replace: true })
      } catch (error) {
        setError(error instanceof Error ? error.message : 'OAuth callback verification failed.')
      }
    }

    void completeAuth()
  }, [navigate, searchParams, setAuthenticated, setError, setLoading])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-sky-300/80">
          OAuth Callback
        </p>
        <h1 className="mt-4 text-3xl font-semibold">Finalizing the Salla login</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          The backend is exchanging the callback handoff for a local dashboard session.
        </p>
      </div>
    </div>
  )
}
