import React from 'react'
import { Paintbrush } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import Blossom from '@dayflow/blossom-color-picker-react'
import { ToggleGroup, Toggle } from '@/components/animate-ui/components/base/toggle-group'

import type {
  WidgetStudioConfig,
  CornerStyle,
  SpacingDensity,
  ButtonStylePreset,
  ShadowIntensity,
  DialogWidth,
} from '../schema/widget-studio.schema'

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

function SettingRow<T extends string>({
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
    <div className="space-y-2">
      <Label className="text-[10px] font-black text-muted-foreground/70">{label}</Label>
      <ToggleGroup
        multiple={false}
        value={[value]}
        onValueChange={(v: string[]) => v[0] && onChange(v[0] as T)}
        className="w-full bg-muted/40 p-1 rounded-lg gap-1 border border-border/5 shadow-inner"
        variant="default"
        size="sm"
      >
        {options.map((opt) => (
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

      <CardContent className="p-3 space-y-4">


        <div className="p-2 bg-muted/40 rounded-lg border border-border/5 flex items-center gap-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 w-full">لون العلامة التجارية</Label>
          <Blossom
            value={appearance.accent_color as any}
            onChange={(color: any) => {
              const hex = typeof color === 'string' ? color : color?.hex;
              if (hex) onUpdateAppearance({ accent_color: hex });
            }}
            petalSize={32}
            coreSize={32}
            openOnHover
            sliderPosition="right"
            showAlphaSlider={false}
            animationDuration={300}
          />
        </div>

        <SettingRow
          label="نمط الحواف"
          value={appearance.corner_style}
          options={CORNER_OPTIONS}
          onChange={(v) => onUpdateAppearance({ corner_style: v })}
        />

        {/* -- Spacing Density -- */}
        <SettingRow
          label="كثافة التباعد"
          value={appearance.spacing_density}
          options={SPACING_OPTIONS}
          onChange={(v) => onUpdateAppearance({ spacing_density: v })}
        />

        {/* -- Button Style -- */}
        <SettingRow
          label="نمط الأزرار"
          value={appearance.button_style}
          options={BUTTON_STYLE_OPTIONS}
          onChange={(v) => onUpdateAppearance({ button_style: v })}
        />

        {/* -- Shadow Intensity -- */}
        <SettingRow
          label="شدة الظل"
          value={appearance.shadow_intensity}
          options={SHADOW_OPTIONS}
          onChange={(v) => onUpdateAppearance({ shadow_intensity: v })}
        />

        {/* -- Dialog Width -- */}
        <SettingRow
          label="عرض النافذة"
          value={config.dialog.width}
          options={WIDTH_OPTIONS}
          onChange={(v) => onUpdateDialog({ width: v })}
        />
      </CardContent>
    </Card>
  )
})
