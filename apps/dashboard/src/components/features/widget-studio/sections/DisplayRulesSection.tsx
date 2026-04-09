/**
 * Display Rules Section
 *
 * Runtime-enforced display rules for widget visibility and placement.
 */

import {
  Target,
  Clock,
  MousePointer2,
  Shield,
  Layout,
  Smartphone,
  Globe,
  MessageSquare,
  Users,
  ArrowRightLeft
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, Toggle } from '@/components/animate-ui/components/base/toggle-group'

import type { 
  DisplayRules,
  EligibilityMode,
  PlacementTarget,
  DisplayTiming,
  TriggerBehavior,
  FallbackStrategy,
  DeviceVariant,
  LocalizationMode,
  StateMessagingPolicy
} from '@virtual-tryon/shared-types'

interface DisplayRulesSectionProps {
  rules: DisplayRules
  onUpdate: (patch: Partial<DisplayRules>) => void
}

export function DisplayRulesSection({ rules, onUpdate }: DisplayRulesSectionProps) {
  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
      <CardHeader className="p-3 border-b border-border/10">
        <div className="flex items-center gap-2 text-foreground/80">
          <Target className="size-4 text-primary/70" />
          <CardTitle className="text-sm font-black">قواعد العرض</CardTitle>
        </div>
        <CardDescription className="text-[9px] font-bold opacity-60 mt-1">
          متى وأين يظهر الويدجت في المتجر
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        {/* Eligibility Mode */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            طريقة الأهلية
            <Users className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[rules.eligibility_mode]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ eligibility_mode: v[0] as EligibilityMode })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="all" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              كل المنتجات
            </Toggle>
            <Toggle value="selected" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              محددة
            </Toggle>
            <Toggle value="selected-categories" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              فئات محددة
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Placement Target */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            مكان الظهور
            <Layout className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[rules.placement_target]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ placement_target: v[0] as PlacementTarget })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5 flex-wrap"
            variant="default"
            size="sm"
          >
            <Toggle value="under-add-to-cart" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
              أسفل "أضف للسلة"
            </Toggle>
            <Toggle value="above-add-to-cart" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
              أعلى "أضف للسلة"
            </Toggle>
            <Toggle value="inside-product-actions" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
              داخل أزرار المنتج
            </Toggle>
            <Toggle value="floating-corner" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
              زاوية عائمة
            </Toggle>
            <Toggle value="sticky-mobile-footer" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
              شريط ثابت
            </Toggle>
            <Toggle value="auto-best-fit" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
              تلقائي
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Display Timing */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            توقيت العرض
            <Clock className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[rules.display_timing]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ display_timing: v[0] as DisplayTiming })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="immediate" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              فوري
            </Toggle>
            <Toggle value="after-page-stable" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              بعد استقرار الصفحة
            </Toggle>
            <Toggle value="after-image-gallery-ready" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              بعد جاهزية الصور
            </Toggle>
            <Toggle value="after-cta-block-detected" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              بعد اكتشاف CTA
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Trigger Behavior */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            سلوك التشغيل
            <MousePointer2 className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[rules.trigger_behavior]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ trigger_behavior: v[0] as TriggerBehavior })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="auto-render" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              تلقائي
            </Toggle>
            <Toggle value="user-intent-only" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              عند التفاعل
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Availability Conditions */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/10">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            شروط التوفر
            <Shield className="size-3.5" />
          </Label>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between">
              <Switch
                checked={rules.availability_conditions.hide_on_out_of_stock}
                onCheckedChange={(val) => onUpdate({
                  availability_conditions: { ...rules.availability_conditions, hide_on_out_of_stock: val },
                })}
                className="scale-85"
              />
              <Label className="text-[9px] font-bold text-muted-foreground">إخفاء عند نفاذ المخزون</Label>
            </div>
            <div className="flex items-center justify-between">
              <Switch
                checked={rules.availability_conditions.hide_on_missing_product_image}
                onCheckedChange={(val) => onUpdate({
                  availability_conditions: { ...rules.availability_conditions, hide_on_missing_product_image: val },
                })}
                className="scale-85"
              />
              <Label className="text-[9px] font-bold text-muted-foreground">إخفاء عند عدم وجود صورة</Label>
            </div>
            <div className="flex items-center justify-between">
              <Switch
                checked={rules.availability_conditions.hide_on_unsupported_product_type}
                onCheckedChange={(val) => onUpdate({
                  availability_conditions: { ...rules.availability_conditions, hide_on_unsupported_product_type: val },
                })}
                className="scale-85"
              />
              <Label className="text-[9px] font-bold text-muted-foreground">إخفاء للأنواع غير المدعومة</Label>
            </div>
            <div className="flex items-center justify-between">
              <Switch
                checked={rules.availability_conditions.hide_when_merchant_inactive}
                onCheckedChange={(val) => onUpdate({
                  availability_conditions: { ...rules.availability_conditions, hide_when_merchant_inactive: val },
                })}
                className="scale-85"
              />
              <Label className="text-[9px] font-bold text-muted-foreground">إخفاء عند تعطل التاجر</Label>
            </div>
            <div className="flex items-center justify-between">
              <Switch
                checked={rules.availability_conditions.hide_when_no_credits}
                onCheckedChange={(val) => onUpdate({
                  availability_conditions: { ...rules.availability_conditions, hide_when_no_credits: val },
                })}
                className="scale-85"
              />
              <Label className="text-[9px] font-bold text-muted-foreground">إخفاء عند نفاذ الرصيد</Label>
            </div>
          </div>
        </div>

        {/* Fallback Strategy */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            استراتيجية البديل
            <ArrowRightLeft className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[rules.fallback_strategy]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ fallback_strategy: v[0] as FallbackStrategy })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="chained" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              متسلسل
            </Toggle>
            <Toggle value="floating-only" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              عائم فقط
            </Toggle>
            <Toggle value="disabled" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              معطل
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Device Variant */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            متغيرات الأجهزة
            <Smartphone className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[rules.device_variant]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ device_variant: v[0] as DeviceVariant })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="same" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              نفسه
            </Toggle>
            <Toggle value="dedicated-mobile" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              جوال مخصص
            </Toggle>
            <Toggle value="dedicated-desktop" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              سطح مكتبي مخصص
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Localization Mode */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            وضع الترجمة
            <Globe className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[rules.localization_mode]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ localization_mode: v[0] as LocalizationMode })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="arabic-only" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              عربي فقط
            </Toggle>
            <Toggle value="english-only" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              إنجليزي فقط
            </Toggle>
            <Toggle value="auto-by-storefront" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              حسب المتجر
            </Toggle>
          </ToggleGroup>
        </div>

        {/* State Messaging Policy */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            سياسة رسائل الحالة
            <MessageSquare className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[rules.state_messaging_policy]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ state_messaging_policy: v[0] as StateMessagingPolicy })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="concise" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              موجز
            </Toggle>
            <Toggle value="guided" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              موجه
            </Toggle>
            <Toggle value="conversion-focused" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              للتحويل
            </Toggle>
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  )
}
