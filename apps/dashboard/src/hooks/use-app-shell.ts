import { useAppShellStore } from '@/stores/app-shell-store'

export function useAppShell() {
  const mode = useAppShellStore((state) => state.mode)
  const setMode = useAppShellStore((state) => state.setMode)

  return { mode, setMode }
}
