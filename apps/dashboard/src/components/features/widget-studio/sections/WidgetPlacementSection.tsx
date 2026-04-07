import React from 'react'
import {
  LayoutGrid,
  Image,
  PanelRight,
  Smartphone,
  ArrowUpDown,
  AlignVerticalSpaceAround,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

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
  const showAnchor = placement.type === 'over_image'
  const showSide = placement.type === 'sticky_side'
  const showOffset = placement.type === 'sticky_side' || placement.type === 'over_image'

  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
      <CardHeader className="p-3 border-b border-border/10">
        <CardTitle className="text-sm font-black flex items-center gap-2 justify-end">
          الموقع والتمركز
          <AlignVerticalSpaceAround className="size-4 text-primary" />
        </CardTitle>
        <CardDescription className="text-[9px] font-bold opacity-60">
          اختر أين يظهر زر التجربة بالنسبة لصور المنتج
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        {/* -- Placement Type -- */}
        <div className="grid grid-cols-2 gap-2">
          {PLACEMENT_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon
            const isActive = placement.type === option.value
            return (
              <button
                key={option.value}
                onClick={() => onUpdate({ type: option.value })}
                className={cn(
                  "relative flex items-center gap-2.5 p-2.5 rounded-lg border transition-all duration-200 text-right group",
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/10 shadow-sm"
                    : "border-border/40 hover:bg-muted/30 opacity-70"
                )}
              >
                <div className={cn(
                  "size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="size-3.5" />
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
          <div className="space-y-1.5">
            <Label className="text-[9px] font-black text-muted-foreground opacity-70">الجانب</Label>
            <div className="flex gap-1.5">
              {SIDE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onUpdate({ side: opt.value })}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg border text-[9px] font-black transition-all",
                    placement.side === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/40 text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* -- Image Anchor -- */}
        {showAnchor && (
          <div className="space-y-1.5">
            <Label className="text-[9px] font-black text-muted-foreground opacity-70">موقع على الصورة</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {ANCHOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onUpdate({ image_anchor: opt.value })}
                  className={cn(
                    "py-1.5 rounded-lg border text-[8px] font-black transition-all",
                    placement.image_anchor === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/40 text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* -- Vertical Offset -- */}
        {showOffset && (
          <div className="space-y-1.5">
            <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
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
        <div className="space-y-1.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
          <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
            موقع الجوال
            <Smartphone className="size-3" />
          </Label>
          <div className="flex gap-1.5">
            {MOBILE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUpdate({ mobile_placement: opt.value })}
                className={cn(
                  "flex-1 py-1.5 rounded-lg border text-[8px] font-black transition-all",
                  placement.mobile_placement === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/40 text-muted-foreground hover:bg-muted/30"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
