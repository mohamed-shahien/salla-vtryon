import React from 'react'
import { Wand2 } from 'lucide-react'
import { Check } from 'lucide-react'

import type { WidgetStudioConfig } from '../schema/widget-studio.schema'
import { WIDGET_TEMPLATES, type WidgetTemplate } from '../schema/widget-studio.defaults'
import { createDefaultWidgetStudioConfig } from '../schema/widget-studio.defaults'
import { StudioTemplateCarousel } from './shared/StudioTemplateCarousel'

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
    <div className="w-full h-20 rounded-lg bg-muted/40 border border-border/20 flex items-center justify-center relative overflow-hidden">
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
    <StudioTemplateCarousel<WidgetTemplate>
      title="قوالب الويدجت"
      description="اختر قالب جاهز كنقطة انطلاق ثم خصّصه"
      icon={<Wand2 className="size-4 text-primary" />}
      items={WIDGET_TEMPLATES}
      activeId={config.active_widget_template || ''}
      onSelect={applyTemplate}
      getItemId={(t) => t.id}
      getItemName={(t) => t.nameAr}
      getItemDescription={(t) => t.description}
      renderVisual={(t, isActive) => <TemplateVisual template={t} isActive={isActive} />}
    />
  )
})

