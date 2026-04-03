import { cn } from '@/lib/utils'

interface StatusPillProps {
  ok: boolean
  label: string
}

export function StatusPill({ ok, label }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]',
        ok
          ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
          : 'border-amber-300/40 bg-amber-300/10 text-amber-100',
      )}
    >
      {label}
    </span>
  )
}
