import type { PropsWithChildren, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PanelProps extends PropsWithChildren {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function Panel({
  eyebrow,
  title,
  description,
  action,
  className,
  children,
}: PanelProps) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20',
        className,
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">
              {eyebrow}
            </p>
          ) : null}
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}
