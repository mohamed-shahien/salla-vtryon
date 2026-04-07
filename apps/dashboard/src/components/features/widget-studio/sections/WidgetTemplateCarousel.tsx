import React, { useRef } from 'react'
import { Wand2, ChevronLeft, ChevronRight, Check } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { WidgetStudioConfig } from '../schema/widget-studio.schema'
import { WIDGET_TEMPLATES, type WidgetTemplate } from '../schema/widget-studio.defaults'
import { createDefaultWidgetStudioConfig } from '../schema/widget-studio.defaults'

interface WidgetTemplateCarouselProps {
  config: WidgetStudioConfig
  onApplyTemplate: (config: WidgetStudioConfig) => void
}

/** Build an accent-colored mini visual for each template */
function TemplateVisual({ template, isActive }: { template: WidgetTemplate; isActive: boolean }) {
  const accent = template.overrides.appearance?.accent_color ?? '#34a853'
  const corner = template.overrides.appearance?.corner_style ?? 'medium'
  const radius = corner === 'compact' ? '4px' : corner === 'soft' ? '12px' : '8px'
  const btnStyle = template.overrides.appearance?.button_style ?? 'filled'
  const size = template.overrides.launch?.button_size ?? 'md'
  const btnW = size === 'sm' ? 32 : size === 'lg' ? 56 : 44
  const btnH = size === 'sm' ? 12 : size === 'lg' ? 18 : 14

  return (
    <div className="w-full h-20 rounded-md bg-muted/40 border border-border/20 flex items-center justify-center relative overflow-hidden">
      {/* Mock product image placeholder */}
      <div className="absolute inset-1 rounded bg-linear-to-br from-muted/60 to-muted/30 flex items-end justify-end p-1.5">
        <div
          style={{
            width: btnW,
            height: btnH,
            borderRadius: radius,
            backgroundColor: btnStyle === 'filled' ? accent : 'transparent',
            border: btnStyle !== 'filled' ? `1.5px solid ${accent}` : 'none',
          }}
          className="transition-all"
        />
      </div>
      {isActive && (
        <div className="absolute top-1 left-1 size-4 rounded-full bg-primary flex items-center justify-center">
          <Check className="size-2.5 text-white" />
        </div>
      )}
    </div>
  )
}

export const WidgetTemplateCarousel = React.memo(function WidgetTemplateCarousel({
  config,
  onApplyTemplate,
}: WidgetTemplateCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    const amount = dir === 'left' ? -160 : 160
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  function applyTemplate(template: WidgetTemplate) {
    const defaults = createDefaultWidgetStudioConfig()
    const next: WidgetStudioConfig = {
      ...config,
      launch: { ...defaults.launch, ...config.launch, ...template.overrides.launch },
      placement: { ...config.placement, ...template.overrides.placement },
      appearance: { ...defaults.appearance, ...template.overrides.appearance },
      active_widget_template: template.id,
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
              قوالب الويدجت
              <Wand2 className="size-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-[9px] font-bold opacity-60">
              اختر قالب جاهز كنقطة انطلاق ثم خصّصه
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
          {WIDGET_TEMPLATES.map((template) => {
            const isActive = config.active_widget_template === template.id
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
                <TemplateVisual template={template} isActive={isActive} />
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
