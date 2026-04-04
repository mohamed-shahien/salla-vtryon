import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { fetchCurrentMerchant } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

export function AuthGate({ children }: PropsWithChildren) {
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)
  const setLoading = useAuthStore((state) => state.setLoading)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated)
  const setError = useAuthStore((state) => state.setError)

  useEffect(() => {
    if (status !== 'idle') {
      return
    }

    async function bootstrap() {
      try {
        setLoading()
        const response = await fetchCurrentMerchant()

        if (!response) {
          setUnauthenticated()
          return
        }

        setAuthenticated(response.data)
      } catch (bootstrapError) {
        setError(
          bootstrapError instanceof Error
            ? bootstrapError.message
            : 'Failed to initialize the external dashboard session.',
        )
      }
    }

    void bootstrap()
  }, [setAuthenticated, setError, setLoading, setUnauthenticated, status])

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-sky-300/80">
            External Dashboard
          </p>
          <h1 className="mt-4 text-3xl font-semibold">Checking the current dashboard session</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            The React dashboard runs outside the Salla iframe and waits for a local
            app session that was created after Salla OAuth completed on the backend.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-sky-300/80">
            Sign In
          </p>
          <h1 className="mt-4 text-3xl font-semibold">Start Salla OAuth from the external dashboard</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            This dashboard no longer depends on embedded pages or `embedded.auth.getToken()`.
            Use the backend OAuth entrypoint, finish approval on Salla, then return here.
          </p>
          <a
            href="/api/auth/salla/start"
            className="mt-6 inline-flex rounded-full border border-sky-300/30 bg-sky-400/15 px-5 py-2.5 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
          >
            Continue with Salla
          </a>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="max-w-lg rounded-3xl border border-amber-300/20 bg-amber-300/10 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-200/80">
            Authentication Failed
          </p>
          <h1 className="mt-4 text-3xl font-semibold">Dashboard authentication did not complete</h1>
          <p className="mt-3 text-sm leading-7 text-amber-50/90">{error}</p>
          <a
            href="/api/auth/salla/start"
            className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15"
          >
            Retry with Salla
          </a>
        </div>
      </div>
    )
  }

  return children
}
