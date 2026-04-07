import React, { useRef } from 'react'
import { Layers, ChevronLeft, ChevronRight, Check } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { WidgetStudioConfig } from '../schema/widget-studio.schema'
import { DIALOG_TEMPLATES, type DialogTemplate } from '../schema/widget-studio.defaults'

interface DialogTemplateCarouselProps {
  config: WidgetStudioConfig
  onApplyTemplate: (config: WidgetStudioConfig) => void
}

function DialogVisual({ template, isActive }: { template: DialogTemplate; isActive: boolean }) {
  const corner = template.overrides.appearance?.corner_style ?? 'medium'
  const radius = corner === 'compact' ? '4px' : corner === 'soft' ? '14px' : '8px'
  const shadow = template.overrides.appearance?.shadow_intensity ?? 'subtle'
  const boxShadow =
    shadow === 'none' ? 'none'
    : shadow === 'subtle' ? '0 2px 8px rgba(0,0,0,0.08)'
    : shadow === 'medium' ? '0 4px 16px rgba(0,0,0,0.12)'
    : '0 8px 32px rgba(0,0,0,0.18)'
  const w = template.overrides.dialog?.width ?? 'md'
  const dialogW = w === 'sm' ? '60%' : w === 'lg' ? '88%' : w === 'full' ? '96%' : '75%'

  return (
    <div className="w-full h-20 rounded-md bg-linear-to-b from-muted/30 to-muted/10 flex items-center justify-center relative overflow-hidden">
      {/* Dimmed overlay */}
      <div className="absolute inset-0 bg-foreground/5" />
      {/* Modal card */}
      <div
        className="relative z-10 bg-card border border-border/30"
        style={{
          width: dialogW,
          height: '52px',
          borderRadius: radius,
          boxShadow,
        }}
      >
        <div className="h-2 rounded-t-inherit bg-muted/40 mx-2 mt-1.5 rounded" />
        <div className="h-1.5 bg-muted/25 mx-2 mt-1 rounded w-2/3" />
        <div className="h-1.5 bg-muted/20 mx-2 mt-1 rounded w-1/2" />
      </div>
      {isActive && (
        <div className="absolute top-1 left-1 size-4 rounded-full bg-primary flex items-center justify-center z-20">
          <Check className="size-2.5 text-white" />
        </div>
      )}
    </div>
  )
}

export const DialogTemplateCarousel = React.memo(function DialogTemplateCarousel({
  config,
  onApplyTemplate,
}: DialogTemplateCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    const amount = dir === 'left' ? -160 : 160
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  function applyTemplate(template: DialogTemplate) {
    const next: WidgetStudioConfig = {
      ...config,
      dialog: { ...config.dialog, ...template.overrides.dialog },
      appearance: { ...config.appearance, ...template.overrides.appearance },
      active_dialog_template: template.id,
    }
    onApplyTemplate(next)
  }

  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
      <CardHeader className="p-3 border-b border-border/10">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => scroll('right')} className="size-6 rounded-md">
              <ChevronRight className="size-3" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => scroll('left')} className="size-6 rounded-md">
              <ChevronLeft className="size-3" />
            </Button>
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-black flex items-center gap-2 justify-end">
              قوالب النافذة
              <Layers className="size-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-[9px] font-bold opacity-60">
              اختر شكل نافذة التجربة الافتراضية
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {DIALOG_TEMPLATES.map((template) => {
            const isActive = config.active_dialog_template === template.id
            return (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className={cn(
                  "shrink-0 w-[130px] rounded-lg border p-2 transition-all duration-200 text-right space-y-1.5 snap-start",
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/10 shadow-sm"
                    : "border-border/40 hover:bg-muted/20 opacity-80 hover:opacity-100"
                )}
              >
                <DialogVisual template={template} isActive={isActive} />
                <p className="text-[9px] font-black truncate">{template.nameAr}</p>
                <p className="text-[7px] font-bold text-muted-foreground truncate">{template.description}</p>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
})
