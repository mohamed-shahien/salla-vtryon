import { create } from 'zustand'

type AppShellMode = 'standalone-dev' | 'embedded-ready'

interface AppShellState {
  mode: AppShellMode
  setMode: (mode: AppShellMode) => void
}

export const useAppShellStore = create<AppShellState>((set) => ({
  mode: 'standalone-dev',
  setMode: (mode) => set({ mode }),
}))
