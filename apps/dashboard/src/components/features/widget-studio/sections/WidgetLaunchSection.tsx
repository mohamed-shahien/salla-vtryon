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
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-black flex items-center gap-2 justify-end">
              تفعيل ووضع الإطلاق
              <Power className="size-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-[9px] font-bold opacity-60">
              كيف يظهر ويبدأ الويدجت للعملاء
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
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

      <CardContent className="p-3 space-y-3">
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

        {/* -- Auto Open Controls -- */}
        {showAutoOpenControls && (
          <div className="space-y-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
            <div className="space-y-1.5">
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
              <span className="text-[8px] text-muted-foreground font-bold">
                {launch.auto_open_delay === 0 ? 'فوري' : `${launch.auto_open_delay / 1000} ثانية`}
              </span>
            </div>

            <div className="flex items-center justify-between">
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
          <div className="space-y-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
                نص الزر
                <Type className="size-3" />
              </Label>
              <Input
                value={launch.button_label}
                onChange={(e) => onUpdate({ button_label: e.target.value })}
                className="h-8 rounded-lg bg-background border-border/60 font-bold text-[10px] text-right"
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
              <Label className="text-[9px] font-bold text-muted-foreground">إظهار أيقونة بجانب النص</Label>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-muted-foreground opacity-70 flex items-center gap-1.5 justify-end">
                حجم الزر
                <Maximize2 className="size-3" />
              </Label>
              <div className="flex gap-1.5">
                {BUTTON_SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdate({ button_size: opt.value })}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg border text-[9px] font-black transition-all",
                      launch.button_size === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/40 text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
