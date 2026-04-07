import React from 'react'
import {
  LayoutGrid,
  Image,
  PanelRight,
  Smartphone,
  ArrowUpDown,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { ToggleGroup, Toggle } from '@/components/animate-ui/components/base/toggle-group'

import type { WidgetStudioConfig, PlacementType, PlacementSide, ImageAnchor, MobilePlacement } from '../schema/widget-studio.schema'

interface WidgetPlacementSectionProps {
  config: WidgetStudioConfig
  onUpdate: (patch: Partial<WidgetStudioConfig['placement']>) => void
}

const PLACEMENT_TYPE_OPTIONS: Array<{
  value: PlacementType
  label: string
  description: string
  icon: React.ElementType
}> = [
    { value: 'below_gallery', label: 'أسفل المعرض', description: 'تحت صور المنتج مباشرة', icon: LayoutGrid },
    { value: 'over_image', label: 'فوق الصورة', description: 'على زاوية صورة المنتج', icon: Image },
    { value: 'sticky_side', label: 'ثابت جانبي', description: 'على جانب الصفحة', icon: PanelRight },
    { value: 'bottom_float', label: 'عائم سفلي', description: 'شريط ثابت في أسفل الشاشة', icon: Smartphone },
  ]

const SIDE_OPTIONS: Array<{ value: PlacementSide; label: string }> = [
  { value: 'right', label: 'يمين' },
  { value: 'left', label: 'يسار' },
]

const ANCHOR_OPTIONS: Array<{ value: ImageAnchor; label: string }> = [
  { value: 'top-right', label: '↗ أعلى يمين' },
  { value: 'top-left', label: '↖ أعلى يسار' },
  { value: 'bottom-right', label: '↘ أسفل يمين' },
  { value: 'bottom-left', label: '↙ أسفل يسار' },
  { value: 'center', label: '● مركز' },
]

const MOBILE_OPTIONS: Array<{ value: MobilePlacement; label: string }> = [
  { value: 'same', label: 'نفس الموقع' },
  { value: 'bottom_float', label: 'عائم سفلي' },
  { value: 'below_gallery', label: 'أسفل المعرض' },
]

export const WidgetPlacementSection = React.memo(function WidgetPlacementSection({
  config,
  onUpdate,
}: WidgetPlacementSectionProps) {
  const placement = config.placement

  const showSide = placement.type === 'sticky_side'
  const showAnchor = placement.type === 'over_image'
  const showOffset = placement.type === 'sticky_side' || placement.type === 'over_image'

  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
      <CardHeader className="p-3 border-b border-border/10">
        <CardTitle className="text-sm font-black flex items-center gap-2 justify-end">
          موقع الويدجت
          <LayoutGrid className="size-4 text-primary" />
        </CardTitle>
        <CardDescription className="text-[9px] font-bold opacity-60">
          تحكم في مكان ظهور زر القياس الافتراضي
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        {/* -- Position Selector -- */}
        <div className="grid grid-cols-2 gap-2">
          {PLACEMENT_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon
            const isActive = placement.type === option.value
            return (
              <button
                key={option.value}
                onClick={() => onUpdate({ type: option.value })}
                className={cn(
                  "relative flex items-center gap-2.5 p-3 rounded-lg border transition-all duration-300 text-right group isolate",
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/10 shadow-sm"
                    : "border-border/40 hover:bg-muted/30 opacity-70"
                )}
              >
                <div className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                  isActive ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="size-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="font-black text-[10px] truncate">{option.label}</p>
                  <p className="text-[8px] font-bold text-muted-foreground leading-tight">{option.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* -- Side Selector -- */}
        {showSide && (
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground/70">الأجهزة المدعومة</Label>
            <ToggleGroup
              multiple={false}
              value={[placement.side]}
              onValueChange={(v: string[]) => v[0] && onUpdate({ side: v[0] as any })}
              className="w-full bg-muted/40 p-1 rounded-lg gap-1 border border-border/10 shadow-inner"
              variant="default"
              size="sm"
            >
              {SIDE_OPTIONS.map((opt) => (
                <Toggle
                  key={opt.value}
                  value={opt.value}
                  className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg transition-all"
                >
                  {opt.label}
                </Toggle>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* -- Image Anchor -- */}
        {showAnchor && (
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground/70">موقع على الصورة</Label>
            <ToggleGroup
              multiple={false}
              value={[placement.image_anchor]}
              onValueChange={(v: string[]) => v[0] && onUpdate({ image_anchor: v[0] as any })}
              className="grid grid-cols-3 bg-muted/40 p-1 rounded-lg gap-1 border border-border/5 shadow-inner"
              variant="default"
              size="sm"
            >
              {ANCHOR_OPTIONS.map((opt) => (
                <Toggle
                  key={opt.value}
                  value={opt.value}
                  className="py-1 h-7 text-[8px] font-black rounded-lg transition-all"
                >
                  {opt.label}
                </Toggle>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* -- Vertical Offset -- */}
        {showOffset && (
          <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/10">
            <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
              الإزاحة العمودية ({placement.vertical_offset}px)
              <ArrowUpDown className="size-3" />
            </Label>
            <Slider
              value={[placement.vertical_offset]}
              onValueChange={([v]) => onUpdate({ vertical_offset: v })}
              min={0}
              max={200}
              step={4}
              className="w-full"
            />
          </div>
        )}

        {/* -- Mobile Placement -- */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/10">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            موقع الجوال
            <Smartphone className="size-3" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[placement.mobile_placement]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ mobile_placement: v[0] as any })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            {MOBILE_OPTIONS.map((opt) => (
              <Toggle
                key={opt.value}
                value={opt.value}
                className="flex-1 py-1 h-7 text-[8px] font-black rounded-lg transition-all"
              >
                {opt.label}
              </Toggle>
            ))}
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  )
})
