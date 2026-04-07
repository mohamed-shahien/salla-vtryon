import React from 'react'
import { Paintbrush } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import type {
  WidgetStudioConfig,
  CornerStyle,
  SpacingDensity,
  ButtonStylePreset,
  ShadowIntensity,
  DialogWidth,
} from '../schema/widget-studio.schema'
import { ACCENT_COLOR_PRESETS } from '../schema/widget-studio.defaults'

interface WidgetAppearanceSectionProps {
  config: WidgetStudioConfig
  onUpdateAppearance: (patch: Partial<WidgetStudioConfig['appearance']>) => void
  onUpdateDialog: (patch: Partial<WidgetStudioConfig['dialog']>) => void
}

const CORNER_OPTIONS: Array<{ value: CornerStyle; label: string }> = [
  { value: 'compact', label: 'حاد' },
  { value: 'medium', label: 'متوسط' },
  { value: 'soft', label: 'ناعم' },
]

const SPACING_OPTIONS: Array<{ value: SpacingDensity; label: string }> = [
  { value: 'compact', label: 'مضغوط' },
  { value: 'comfortable', label: 'مريح' },
  { value: 'spacious', label: 'واسع' },
]

const BUTTON_STYLE_OPTIONS: Array<{ value: ButtonStylePreset; label: string }> = [
  { value: 'filled', label: 'مملوء' },
  { value: 'outline', label: 'محيط' },
  { value: 'ghost', label: 'شفاف' },
]

const SHADOW_OPTIONS: Array<{ value: ShadowIntensity; label: string }> = [
  { value: 'none', label: 'بدون' },
  { value: 'subtle', label: 'خفيف' },
  { value: 'medium', label: 'متوسط' },
  { value: 'strong', label: 'قوي' },
]

const WIDTH_OPTIONS: Array<{ value: DialogWidth; label: string }> = [
  { value: 'sm', label: 'صغير' },
  { value: 'md', label: 'متوسط' },
  { value: 'lg', label: 'كبير' },
  { value: 'full', label: 'كامل' },
]

function SegmentedRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (v: T) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[9px] font-black text-muted-foreground opacity-70">{label}</Label>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 py-1.5 rounded-lg border text-[8px] font-black transition-all",
              value === opt.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:bg-muted/30"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export const WidgetAppearanceSection = React.memo(function WidgetAppearanceSection({
  config,
  onUpdateAppearance,
  onUpdateDialog,
}: WidgetAppearanceSectionProps) {
  const appearance = config.appearance

  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
      <CardHeader className="p-3 border-b border-border/10">
        <CardTitle className="text-sm font-black flex items-center gap-2 justify-end">
          المظهر البصري
          <Paintbrush className="size-4 text-primary" />
        </CardTitle>
        <CardDescription className="text-[9px] font-bold opacity-60">
          تحكم في ألوان الويدجت وكثافته وشكل عناصره
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        {/* -- Accent Color -- */}
        <div className="space-y-1.5">
          <Label className="text-[9px] font-black text-muted-foreground opacity-70">لون العلامة التجارية</Label>
          <div className="flex gap-1.5 items-center">
            {ACCENT_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onUpdateAppearance({ accent_color: preset.value })}
                title={preset.label}
                className={cn(
                  "size-6 rounded-full border-2 transition-all hover:scale-110 shrink-0",
                  appearance.accent_color === preset.value
                    ? "border-foreground ring-2 ring-offset-2 ring-primary/30 scale-110"
                    : "border-transparent"
                )}
                style={{ backgroundColor: preset.value }}
              />
            ))}
            <div className="flex-1 min-w-0">
              <Input
                value={appearance.accent_color}
                onChange={(e) => {
                  const v = e.target.value
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                    onUpdateAppearance({ accent_color: v })
                  }
                }}
                className="h-7 rounded-lg bg-background border-border/60 font-mono text-[9px] text-center w-full"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* -- Corner Style -- */}
        <SegmentedRow
          label="نمط الحواف"
          value={appearance.corner_style}
          options={CORNER_OPTIONS}
          onChange={(v) => onUpdateAppearance({ corner_style: v })}
        />

        {/* -- Spacing Density -- */}
        <SegmentedRow
          label="كثافة التباعد"
          value={appearance.spacing_density}
          options={SPACING_OPTIONS}
          onChange={(v) => onUpdateAppearance({ spacing_density: v })}
        />

        {/* -- Button Style -- */}
        <SegmentedRow
          label="نمط الأزرار"
          value={appearance.button_style}
          options={BUTTON_STYLE_OPTIONS}
          onChange={(v) => onUpdateAppearance({ button_style: v })}
        />

        {/* -- Shadow Intensity -- */}
        <SegmentedRow
          label="شدة الظل"
          value={appearance.shadow_intensity}
          options={SHADOW_OPTIONS}
          onChange={(v) => onUpdateAppearance({ shadow_intensity: v })}
        />

        {/* -- Dialog Width -- */}
        <SegmentedRow
          label="عرض النافذة"
          value={config.dialog.width}
          options={WIDTH_OPTIONS}
          onChange={(v) => onUpdateDialog({ width: v })}
        />
      </CardContent>
    </Card>
  )
})
