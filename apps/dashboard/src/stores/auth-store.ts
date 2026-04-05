import { create } from 'zustand'

import type { DashboardMerchantIdentity } from '@/lib/api'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'

interface AuthState {
  status: AuthStatus
  identity: DashboardMerchantIdentity | null
  error: string | null
  setLoading: () => void
  setAuthenticated: (identity: DashboardMerchantIdentity) => void
  setUnauthenticated: () => void
  setError: (message: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  identity: null,
  error: null,
  setLoading: () =>
    set({
      status: 'loading',
      error: null,
    }),
  setAuthenticated: (identity) =>
    set({
      status: 'authenticated',
      identity,
      error: null,
    }),
  setUnauthenticated: () =>
    set({
      status: 'unauthenticated',
      identity: null,
      error: null,
    }),
  setError: (message) =>
    set({
      status: 'error',
      identity: null,
      error: message,
    }),
}))
