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
        'rounded-[8px] border border-border bg-card p-6 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          {eyebrow ? (
            <p className="text-[10px] uppercase font-bold tracking-widest text-primary">
              {eyebrow}
            </p>
          ) : null}
          <div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            {description ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </section>
  )
}

