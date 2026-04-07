import React from 'react'
import { Layers } from 'lucide-react'
import { Check } from 'lucide-react'

import type { WidgetStudioConfig } from '../schema/widget-studio.schema'
import { DIALOG_TEMPLATES, type DialogTemplate } from '../schema/widget-studio.defaults'
import { StudioTemplateCarousel } from './shared/StudioTemplateCarousel'

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
    <div className="w-full h-20 rounded-lg bg-linear-to-b from-muted/30 to-muted/10 flex items-center justify-center relative overflow-hidden">
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
    <StudioTemplateCarousel<DialogTemplate>
      title="قوالب النافذة"
      description="اختر شكل نافذة التجربة الافتراضية"
      icon={<Layers className="size-4 text-primary" />}
      items={DIALOG_TEMPLATES}
      activeId={config.active_dialog_template || ''}
      onSelect={applyTemplate}
      getItemId={(t) => t.id}
      getItemName={(t) => t.nameAr}
      getItemDescription={(t) => t.description}
      renderVisual={(t, isActive) => <DialogVisual template={t} isActive={isActive} />}
    />
  )
})

