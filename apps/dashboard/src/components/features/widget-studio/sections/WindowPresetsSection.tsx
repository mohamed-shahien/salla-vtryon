/**
 * Window Presets Section
 *
 * Allows merchants to select from 10 distinct window/modal presets.
 */

import React from 'react'
import {
  Maximize2,
  Play,
  Sparkles,
  Eye,
  Layout,
  X,
  Layers,
  Monitor,
  Film,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ToggleGroup, Toggle } from '@/components/animate-ui/components/base/toggle-group'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

import { WINDOW_PRESETS } from '@/lib/presets/window-preset-registry'
import type { WindowSettings, MotionProfile, BackdropStyle, CloseStyle, ResultLayout, WindowPresetId } from '@virtual-tryon/shared-types'

interface WindowPresetsSectionProps {
  settings: WindowSettings
  onUpdate: (patch: Partial<WindowSettings>) => void
  onApplyPreset: (presetId: WindowPresetId) => void
}

export function WindowPresetsSection({ settings, onUpdate, onApplyPreset }: WindowPresetsSectionProps) {
  const selectedPreset = WINDOW_PRESETS.find((p) => p.id === settings.preset)

  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
      <CardHeader className="p-3 border-b border-border/10">
        <div className="flex items-center gap-2 text-foreground/80">
          <Maximize2 className="size-4 text-primary/70" />
          <CardTitle className="text-sm font-black">خيارات نافذة تجربة القياس</CardTitle>
        </div>
        <CardDescription className="text-[9px] font-bold opacity-60 mt-1">
          حدد كيف تظهر النافذة لعملائك ونوع الرسوم المتحركة
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        {/* Preset Slider - Width Constrained */}
        <div className="w-full overflow-hidden">
          <Carousel
            opts={{
              direction: 'rtl',
              align: 'start',
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {WINDOW_PRESETS.map((preset) => {
                const isSelected = settings.preset === preset.id
                return (
                  <CarouselItem key={preset.id} className="pl-4 basis-1/2 min-w-0 shrink-0">
                    <button
                      onClick={() => onApplyPreset(preset.id)}
                      className={cn(
                        "relative w-full p-2.5 rounded-xl border-2 transition-all duration-300 text-right group h-full flex flex-col",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/10 shadow-sm"
                          : "border-border/40 hover:border-border/60 hover:bg-muted/30"
                      )}
                    >
                      {/* Animation Icon */}
                      <div className="flex items-center justify-center mb-2">
                        <div className={cn(
                          "size-9 rounded-lg flex items-center justify-center transition-all duration-300",
                          isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-muted-80"
                        )}>
                          {getPresetIcon(preset.animationRef)}
                        </div>
                      </div>

                      {/* Preset Name */}
                      <p className="text-[10px] font-black truncate mb-0.5">{preset.nameAr}</p>
                      <p className="text-[8px] text-muted-foreground leading-tight line-clamp-1 opacity-70">{preset.description}</p>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-1 left-1 p-0.5 bg-primary rounded-full ring-2 ring-background">
                          <div className="size-1 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Customization Options */}
        {selectedPreset && (
          <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/10">
            {/* Motion Profile */}
            <div className="space-y-2">
              <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
                سرعة وانسيابية الحركة
                <Play className="size-3" />
              </Label>
              <ToggleGroup
                multiple={false}
                value={[settings.motion_profile]}
                onValueChange={(v: string[]) => v[0] && onUpdate({ motion_profile: v[0] as MotionProfile })}
                className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5 flex-wrap"
                variant="default"
                size="sm"
              >
                <Toggle value="cinematic" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
                  إخراج سينمائي
                </Toggle>
                <Toggle value="soft-scale" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
                  تكبير ناعم
                </Toggle>
                <Toggle value="slide-up" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
                  ظهور من الأسفل
                </Toggle>
                <Toggle value="side-drawer" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
                  انسحاب جانبي
                </Toggle>
              </ToggleGroup>
            </div>

            {/* Backdrop Style */}
            <div className="space-y-2">
              <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
                تأثير خلفية الصفحة عند فتح النافذة
                <Eye className="size-3" />
              </Label>
              <ToggleGroup
                multiple={false}
                value={[settings.backdrop]}
                onValueChange={(v: string[]) => v[0] && onUpdate({ backdrop: v[0] as BackdropStyle })}
                className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
                variant="default"
                size="sm"
              >
                <Toggle value="dim" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  تعتيم بسيط
                </Toggle>
                <Toggle value="blur-dark" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  ضبابي داكن
                </Toggle>
                <Toggle value="blur-light" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  ضبابي فاتح
                </Toggle>
                <Toggle value="gradient" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  ألوان متدرجة
                </Toggle>
              </ToggleGroup>
            </div>

            {/* Close Style */}
            <div className="space-y-2">
              <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
                شكل وموقع زر الإغلاق
                <X className="size-3" />
              </Label>
              <ToggleGroup
                multiple={false}
                value={[settings.close_style]}
                onValueChange={(v: string[]) => v[0] && onUpdate({ close_style: v[0] as CloseStyle })}
                className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
                variant="default"
                size="sm"
              >
                <Toggle value="icon-top-inline" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  أعلى داخلي
                </Toggle>
                <Toggle value="icon-top-corner" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  أعلى زاوية
                </Toggle>
                <Toggle value="icon-bottom-right" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  أسفل يمين
                </Toggle>
                <Toggle value="text-only" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  نص فقط
                </Toggle>
              </ToggleGroup>
            </div>

            {/* Result Layout */}
            <div className="space-y-2">
              <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
                طريقة عرض صورة النتيجة
                <Layers className="size-3" />
              </Label>
              <ToggleGroup
                multiple={false}
                value={[settings.result_layout]}
                onValueChange={(v: string[]) => v[0] && onUpdate({ result_layout: v[0] as ResultLayout })}
                className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
                variant="default"
                size="sm"
              >
                <Toggle value="before-after-prominent" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  مقارنة (قبل وبعد)
                </Toggle>
                <Toggle value="side-by-side" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  صورتين بجانب بعض
                </Toggle>
                <Toggle value="stacked" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  صورة فوق الأخرى
                </Toggle>
                <Toggle value="result-first" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  النتيجة فقط أولاً
                </Toggle>
              </ToggleGroup>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to get icon for animation reference
function getPresetIcon(animationRef: string): React.ReactElement {
  switch (animationRef) {
    case 'one': // Unfolding
      return <Play className="size-4" />
    case 'two': // Revealing / Soft Scale
      return <Maximize2 className="size-4" />
    case 'three': // Uncovering
      return <Layout className="size-4" />
    case 'four': // Blow Up
      return <Sparkles className="size-4" />
    case 'five': // Meep Meep
      return <Play className="size-4 -rotate-45" />
    case 'six': // Sketch
      return <Monitor className="size-4" />
    case 'seven': // Bond
      return <Film className="size-4" />
    case 'eight': // Aurora
      return <Sparkles className="size-4" />
    case 'nine': // Cyber Pulse
      return <Play className="size-4" />
    default:
      return <Maximize2 className="size-4" />
  }
}
