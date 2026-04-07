import React from 'react'
import { ShieldCheck, Monitor, Smartphone, Globe } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ToggleGroup, Toggle } from '@/components/animate-ui/components/base/toggle-group'

import type { WidgetStudioConfig, DeviceVisibility } from '../schema/widget-studio.schema'

interface WidgetAccessSectionProps {
  config: WidgetStudioConfig
  onUpdate: (patch: Partial<WidgetStudioConfig['access']>) => void
}

const DEVICE_OPTIONS: Array<{ value: DeviceVisibility; label: string; icon: React.ElementType }> = [
  { value: 'all', label: 'الكل', icon: Globe },
  { value: 'desktop_only', label: 'سطح المكتب', icon: Monitor },
  { value: 'mobile_only', label: 'الجوال فقط', icon: Smartphone },
]

export const WidgetAccessSection = React.memo(function WidgetAccessSection({
  config,
  onUpdate,
}: WidgetAccessSectionProps) {
  const access = config.access

  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
      <CardHeader className="p-3 border-b border-border/10">
        <CardTitle className="text-sm font-black flex items-center gap-2 justify-end">
          قواعد الوصول
          <ShieldCheck className="size-4 text-primary" />
        </CardTitle>
        <CardDescription className="text-[9px] font-bold opacity-60">
          تحكم في من يمكنه استخدام الويدجت وعلى أي أجهزة
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        {/* -- Require Login -- */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/10 space-y-3">
          <div className="flex items-center justify-between">
            <Switch
              checked={access.require_login}
              onCheckedChange={(val) => onUpdate({ require_login: val })}
              className="scale-85"
            />
            <Label className="text-[10px] font-black">تسجيل الدخول مطلوب</Label>
          </div>
          <p className="text-[8px] font-bold text-muted-foreground leading-relaxed opacity-70">
            عند التفعيل، سيُطلب من الزائر تسجيل الدخول قبل فتح تجربة القياس
          </p>

          {access.require_login && (
            <div className="space-y-2 pt-1">
              <Label className="text-[10px] font-black text-muted-foreground/70 justify-end">رسالة تسجيل الدخول</Label>
              <Input
                value={access.login_helper_text}
                onChange={(e) => onUpdate({ login_helper_text: e.target.value })}
                className="h-8 rounded-lg bg-background border-border/60 font-bold text-[10px] text-right focus-visible:ring-primary/20"
                placeholder="يرجى تسجيل الدخول أولاً"
                maxLength={120}
              />
            </div>
          )}
        </div>

        {/* -- Device Visibility -- */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70">الأجهزة المدعومة</Label>
          <ToggleGroup
            multiple={false}
            value={[access.device_visibility]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ device_visibility: v[0] as any })}
            className="w-full bg-muted/40 p-1 rounded-lg gap-1 border border-border/10 shadow-inner"
            variant="default"
            size="sm"
          >
            {DEVICE_OPTIONS.map((opt) => {
              const Icon = opt.icon
              return (
                <Toggle
                  key={opt.value}
                  value={opt.value}
                  className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg"
                >
                  <Icon className="size-3.5" />
                  {opt.label}
                </Toggle>
              )
            })}
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  )
})
