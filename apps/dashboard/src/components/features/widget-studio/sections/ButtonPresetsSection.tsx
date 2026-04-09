/**
 * Button Presets Section
 *
 * Allows merchants to select from 20 distinct button presets.
 */

import {
  Sparkles,
  Type,
  LayoutTemplate,
  Settings2,
  Maximize2,
  Smartphone,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, Toggle } from '@/components/animate-ui/components/base/toggle-group'

import { cn } from '@/lib/utils'

import { BUTTON_PRESETS, type ButtonPreset } from '@/lib/presets/button-preset-registry'
import type { 
  ButtonSettings, 
  IconPosition, 
  ButtonPresetId,
  ButtonSize,
  ButtonPlacementMode,
  ButtonMobileMode
} from '@virtual-tryon/shared-types'

interface ButtonPresetsSectionProps {
  settings: ButtonSettings
  onUpdate: (patch: Partial<ButtonSettings>) => void
  onApplyPreset: (presetId: ButtonPresetId) => void
}

export function ButtonPresetsSection({ settings, onUpdate, onApplyPreset }: ButtonPresetsSectionProps) {
  const selectedPreset = BUTTON_PRESETS.find((p) => p.id === settings.preset)

  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
      <CardHeader className="p-3 border-b border-border/10">
        <div className="flex items-center gap-2 text-foreground/80">
          <LayoutTemplate className="size-4 text-primary/70" />
          <CardTitle className="text-sm font-black">أشكال أزرار تجربة القياس</CardTitle>
        </div>
        <CardDescription className="text-[9px] font-bold opacity-60 mt-1">
          اختر التصميم الذي يظهر لعملائك لبدء التجربة الافتراضية
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        {/* Preset Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {BUTTON_PRESETS.map((preset) => {
            const isSelected = settings.preset === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => onApplyPreset(preset.id)}
                className={cn(
                  "relative p-3 rounded-lg border-2 transition-all duration-300 text-right group overflow-hidden",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/10"
                    : "border-border/40 hover:border-border/60 hover:bg-muted/20"
                )}
              >
                {/* Preset Preview */}
                <div className="h-8 rounded-md mb-2 flex items-center justify-center transition-all duration-300"
                  style={getPresetPreviewStyles(preset, isSelected)}>
                  {settings.icon.enabled && (
                    <Sparkles className={cn("size-4", isSelected ? "text-white" : "text-primary")} />
                  )}
                </div>

                {/* Preset Name */}
                <p className="text-[9px] font-black truncate">{preset.nameAr}</p>
                <p className="text-[8px] text-muted-foreground leading-tight">{preset.description}</p>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-1 left-1 p-0.5 bg-primary rounded-full">
                    <div className="size-1.5 rounded-full bg-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Customization Options */}
        {selectedPreset && (
          <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/10">
            {/* Button Label */}
            <div className="space-y-2">
              <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
                نص الزر
                <Type className="size-3" />
              </Label>
              <Input
                value={settings.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="h-8 rounded-lg bg-background border-border/60 font-bold text-[10px] text-right"
                placeholder="مثال: جرّب الآن"
                maxLength={40}
              />
            </div>

            {/* Icon Settings */}
            <div className="flex items-center justify-between">
              <Switch
                checked={settings.icon.enabled}
                onCheckedChange={(val) => onUpdate({ icon: { ...settings.icon, enabled: val } })}
                className="scale-85"
              />
              <Label className="text-[9px] font-bold text-muted-foreground">إظهار أيقونة</Label>
            </div>

            {settings.icon.enabled && (
              <div className="space-y-2">
                <Label className="text-[9px] font-black text-muted-foreground opacity-70">
                  موقع الأيقونة
                </Label>
                <ToggleGroup
                  multiple={false}
                  value={[settings.icon.position]}
                  onValueChange={(v: string[]) => v[0] && onUpdate({ icon: { ...settings.icon, position: v[0] as IconPosition } })}
                  className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
                  variant="default"
                  size="sm"
                >
                  <Toggle value="start" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                    الجهة اليمنى (أول النص)
                  </Toggle>
                  <Toggle value="end" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                    الجهة اليسرى (آخر النص)
                  </Toggle>
                </ToggleGroup>
              </div>
            )}

            {/* Size */}
            <div className="space-y-2">
              <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
                الحجم
                <Maximize2 className="size-3" />
              </Label>
              <ToggleGroup
                multiple={false}
                value={[settings.size]}
                onValueChange={(v: string[]) => v[0] && onUpdate({ size: v[0] as ButtonSize })}
                className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
                variant="default"
                size="sm"
              >
                <Toggle value="sm" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  صغير وأنيق
                </Toggle>
                <Toggle value="md" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  متوسط (مناسب للكل)
                </Toggle>
                <Toggle value="lg" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  كبير وواضح
                </Toggle>
              </ToggleGroup>
            </div>

            {/* Placement Mode */}
            <div className="space-y-2">
              <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
                طريقة التثبيت في الصفحة
                <Settings2 className="size-3" />
              </Label>
              <ToggleGroup
                multiple={false}
                value={[settings.placement_mode]}
                onValueChange={(v: string[]) => v[0] && onUpdate({ placement_mode: v[0] as ButtonPlacementMode })}
                className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
                variant="default"
                size="sm"
              >
                <Toggle value="inline" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  دمج في الصفحة
                </Toggle>
                <Toggle value="floating" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  زر عائم مستقل
                </Toggle>
              </ToggleGroup>
            </div>

            {/* Mobile Mode */}
            <div className="space-y-2">
              <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
                شكل الظهور لمستخدمي الجوال
                <Smartphone className="size-3" />
              </Label>
              <ToggleGroup
                multiple={false}
                value={[settings.mobile_mode]}
                onValueChange={(v: string[]) => v[0] && onUpdate({ mobile_mode: v[0] as ButtonMobileMode })}
                className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
                variant="default"
                size="sm"
              >
                <Toggle value="inline" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  نفس ترتيب الموقع
                </Toggle>
                <Toggle value="sticky" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
                  شريط ثابت بالأسفل
                </Toggle>
              </ToggleGroup>
            </div>

            {/* Full Width */}
            <div className="flex items-center justify-between">
                <Switch
                checked={settings.full_width}
                onCheckedChange={(val) => onUpdate({ full_width: val })}
                className="scale-85"
              />
              <Label className="text-[9px] font-bold text-muted-foreground">جعل الزر يأخذ عرض الشاشة بالكامل</Label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to get preview styles for a preset
function getPresetPreviewStyles(preset: ButtonPreset, isSelected: boolean): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    background: '#7c3aed',
    color: 'white',
    borderRadius: '8px',
  }

  switch (preset.borderRadius) {
    case 'none':
      baseStyles.borderRadius = '0'
      break
    case 'compact':
      baseStyles.borderRadius = '4px'
      break
    case 'balanced':
      baseStyles.borderRadius = '8px'
      break
    case 'rounded':
      baseStyles.borderRadius = '12px'
      break
    case 'pill':
      baseStyles.borderRadius = '9999px'
      break
  }

  if (preset.backgroundRecipe === 'outline' || preset.backgroundRecipe === 'ghost') {
    baseStyles.background = isSelected ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)'
    baseStyles.color = '#7c3aed'
    baseStyles.border = '2px solid #7c3aed'
  }

  if (preset.backgroundRecipe === 'glass') {
    baseStyles.background = 'rgba(124, 58, 237, 0.15)'
    baseStyles.backdropFilter = 'blur(4px)'
  }

  return baseStyles
}
