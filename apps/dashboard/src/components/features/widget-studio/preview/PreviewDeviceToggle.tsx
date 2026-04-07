import React from 'react'
import { Monitor, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreviewDeviceToggleProps {
  device: 'desktop' | 'mobile'
  onChange: (device: 'desktop' | 'mobile') => void
}

export const PreviewDeviceToggle = React.memo(function PreviewDeviceToggle({
  device,
  onChange,
}: PreviewDeviceToggleProps) {
  return (
    <div className="flex gap-1 p-0.5 rounded-lg bg-muted/40 border border-border/30">
      <button
        onClick={() => onChange('desktop')}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black transition-all",
          device === 'desktop'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Monitor className="size-3" />
        سطح المكتب
      </button>
      <button
        onClick={() => onChange('mobile')}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black transition-all",
          device === 'mobile'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Smartphone className="size-3" />
        جوال
      </button>
    </div>
  )
})
