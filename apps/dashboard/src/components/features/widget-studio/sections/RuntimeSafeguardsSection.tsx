/**
 * Runtime Safeguards Section
 *
 * Configures behaviors for zero credits, requirement for product images,
 * and diagnostic features.
 */

import {
  Shield,
  AlertTriangle,
  ImageIcon,
  Activity,
  MessageSquare,
  Zap,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, Toggle } from '@/components/animate-ui/components/base/toggle-group'

import type { RuntimeSafeguards, ZeroCreditBehavior } from '@virtual-tryon/shared-types'

interface RuntimeSafeguardsSectionProps {
  settings: RuntimeSafeguards
  onUpdate: (patch: Partial<RuntimeSafeguards>) => void
}

export function RuntimeSafeguardsSection({ settings, onUpdate }: RuntimeSafeguardsSectionProps) {
  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
      <CardHeader className="p-3 border-b border-border/10">
        <div className="flex items-center gap-2 text-foreground/80">
          <Shield className="size-4 text-primary/70" />
          <CardTitle className="text-sm font-black">إجراءات الأمان والحماية</CardTitle>
        </div>
        <CardDescription className="text-[9px] font-bold opacity-60 mt-1">
          حدد كيف تتعامل الخدمة مع الحالات الخارجة عن الإرادة
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        {/* Zero Credit Behavior */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            ماذا نفعل إذا انتهى رصيد العمليات؟
            <AlertTriangle className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[settings.zero_credit_behavior]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ zero_credit_behavior: v[0] as ZeroCreditBehavior })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="hide" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              إخفاء الخدمة تماماً
            </Toggle>
            <Toggle value="disabled-with-message" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              عرض رسالة تنبيه
            </Toggle>
            <Toggle value="show-with-limit" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              محاولة العرض بحد محدود
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Zero Credit Message */}
        {settings.zero_credit_behavior === 'disabled-with-message' && (
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
              اكتب النص الذي سيظهر للعميل عند نفاذ الرصيد
              <MessageSquare className="size-3.5" />
            </Label>
            <Input
              value={settings.zero_credit_message || ''}
              onChange={(e) => onUpdate({ zero_credit_message: e.target.value })}
              className="h-9 rounded-lg bg-background border-border/60 font-bold text-[10px] text-right"
              placeholder="مثال: يرجى شحن الرصيد للاستمرار"
            />
          </div>
        )}

        {/* Max Daily Requests */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            الحد الأقصى للتجربة لكل عميل يومياً
            <Zap className="size-3.5" />
          </Label>
          <Input
            type="number"
            value={settings.max_daily_requests || ''}
            onChange={(e) => onUpdate({ max_daily_requests: e.target.value ? parseInt(e.target.value) : undefined })}
            className="h-9 rounded-lg bg-background border-border/60 font-bold text-[10px] text-right"
            placeholder="اتركه فارغاً لعدم التقييد"
          />
        </div>

        {/* Switches */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/5">
            <Switch
              checked={settings.require_product_image}
              onCheckedChange={(val) => onUpdate({ require_product_image: val })}
              className="scale-90"
            />
            <div className="text-right">
              <Label className="text-[10px] font-black text-foreground/80 block">التأكد من وجود صورة للمنتج</Label>
              <p className="text-[8px] text-muted-foreground">لن يظهر الزر إذا لم يرفع التاجر صورة واضحة للملابس</p>
            </div>
            <ImageIcon className="size-3.5 text-muted-foreground/60 mr-2" />
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/5">
            <Switch
              checked={settings.enable_diagnostics}
              onCheckedChange={(val) => onUpdate({ enable_diagnostics: val })}
              className="scale-90"
            />
            <div className="text-right">
              <Label className="text-[10px] font-black text-foreground/80 block">تفعيل سجل الفحص الفني</Label>
              <p className="text-[8px] text-muted-foreground">يساعد فريق الدعم في حل أي مشكلة تظهر في متجرك بسرعة</p>
            </div>
            <Activity className="size-3.5 text-muted-foreground/60 mr-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
