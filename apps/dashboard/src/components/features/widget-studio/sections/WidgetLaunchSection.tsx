import React from 'react'
import {
  Power,
  MousePointer2,
  Sparkles,
  Timer,
  Eye,
  Type,
  Maximize2,
  Ban,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { ToggleGroup, Toggle } from '@/components/animate-ui/components/base/toggle-group'

import type { WidgetStudioConfig, LaunchMode, ButtonSize } from '../schema/widget-studio.schema'

interface WidgetLaunchSectionProps {
  config: WidgetStudioConfig
  onUpdate: (patch: Partial<WidgetStudioConfig['launch']>) => void
}

const LAUNCH_MODE_OPTIONS: Array<{
  value: LaunchMode
  label: string
  description: string
  icon: React.ElementType
}> = [
    { value: 'button', label: 'زر تفاعلي', description: 'يظهر كزر بجانب صور المنتج', icon: MousePointer2 },
    { value: 'floating', label: 'زر عائم', description: 'زر ثابت على جانب الشاشة', icon: Sparkles },
    { value: 'auto_open', label: 'فتح تلقائي', description: 'يفتح النافذة تلقائياً عند تحميل الصفحة', icon: Eye },
    { value: 'disabled', label: 'معطّل', description: 'إيقاف الويدجت تماماً', icon: Ban },
  ]

const BUTTON_SIZE_OPTIONS: Array<{ value: ButtonSize; label: string }> = [
  { value: 'sm', label: 'صغير' },
  { value: 'md', label: 'متوسط' },
  { value: 'lg', label: 'كبير' },
]

export const WidgetLaunchSection = React.memo(function WidgetLaunchSection({
  config,
  onUpdate,
}: WidgetLaunchSectionProps) {
  const launch = config.launch
  const isEnabled = launch.mode !== 'disabled'
  const showAutoOpenControls = launch.mode === 'auto_open'
  const showButtonControls = launch.mode === 'button' || launch.mode === 'floating'

  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
      <CardHeader className="p-3 border-b border-border/10">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 text-right">
            <CardTitle className="text-sm font-black flex items-center gap-2 justify-end">
              تفعيل ووضع الإطلاق
              <Power className="size-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-[9px] font-bold opacity-60">
              كيف يظهر ويبدأ الويدجت للعملاء
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/10">
            <span className={cn("text-[9px] font-black", isEnabled ? "text-emerald-600" : "text-muted-foreground opacity-60")}>
              {isEnabled ? "نشط" : "معطل"}
            </span>
            <Switch
              checked={isEnabled}
              onCheckedChange={(val) => onUpdate({ mode: val ? 'button' : 'disabled' })}
              className="data-[state=checked]:bg-emerald-500 scale-90"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        {/* -- Launch Mode Cards -- */}
        <div className="grid grid-cols-2 gap-2">
          {LAUNCH_MODE_OPTIONS.map((option) => {
            const Icon = option.icon
            const isActive = launch.mode === option.value
            return (
              <button
                key={option.value}
                onClick={() => onUpdate({ mode: option.value })}
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
                  <p className="text-[8px] font-bold text-muted-foreground leading-tight opacity-70">{option.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* -- Auto Open Controls -- */}
        {showAutoOpenControls && (
          <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/10">
            <div className="space-y-2">
              <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
                تأخير الفتح (ثانية)
                <Timer className="size-3" />
              </Label>
              <Slider
                value={[launch.auto_open_delay / 1000]}
                onValueChange={([v]) => onUpdate({ auto_open_delay: v * 1000 })}
                min={0}
                max={10}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-primary">
                  {launch.auto_open_delay / 1000} ثانية
                </span>
                <span className="text-[8px] text-muted-foreground font-bold">
                  {launch.auto_open_delay === 0 ? 'فوري' : 'تأخير مخصص'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Switch
                checked={launch.auto_open_once_per_session}
                onCheckedChange={(val) => onUpdate({ auto_open_once_per_session: val })}
                className="scale-85"
              />
              <Label className="text-[9px] font-bold text-muted-foreground">عرض مرة واحدة فقط لكل جلسة</Label>
            </div>
          </div>
        )}

        {/* -- Button Controls -- */}
        {showButtonControls && (
          <div className="space-y-4 p-3 rounded-lg bg-muted/30 border border-border/10">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
                نص الزر
                <Type className="size-3" />
              </Label>
              <Input
                value={launch.button_label}
                onChange={(e) => onUpdate({ button_label: e.target.value })}
                className="h-8 rounded-lg bg-background border-border/60 font-bold text-[10px] text-right focus-visible:ring-primary/20"
                placeholder="مثال: جرّب الآن"
                maxLength={40}
              />
            </div>

            <div className="flex items-center justify-between">
              <Switch
                checked={launch.button_icon}
                onCheckedChange={(val) => onUpdate({ button_icon: val })}
                className="scale-85"
              />
              <Label className="text-[10px] font-bold text-muted-foreground">إظهار أيقونة بجانب النص</Label>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
                حجم الزر
                <Maximize2 className="size-3" />
              </Label>
              <ToggleGroup
                multiple={false}
                value={[launch.button_size]}
                onValueChange={(v: string[]) => v[0] && onUpdate({ button_size: v[0] as any })}
                className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
                variant="default"
                size="sm"
              >
                {BUTTON_SIZE_OPTIONS.map((opt) => (
                  <Toggle
                    key={opt.value}
                    value={opt.value}
                    className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg"
                  >
                    {opt.label}
                  </Toggle>
                ))}
              </ToggleGroup>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
