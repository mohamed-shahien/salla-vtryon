import { create } from 'zustand'

type AppShellMode = 'standalone-dev' | 'external-oauth'

interface AppShellState {
  mode: AppShellMode
  setMode: (mode: AppShellMode) => void
}

export const useAppShellStore = create<AppShellState>((set) => ({
  mode: 'external-oauth',
  setMode: (mode) => set({ mode }),
}))
