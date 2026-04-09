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
          <CardTitle className="text-sm font-black">أين وكيف تظهر الخدمة</CardTitle>
        </div>
        <CardDescription className="text-[9px] font-bold opacity-60 mt-1">
          متى وأين يظهر الويدجت في المتجر
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        {/* Eligibility Mode */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            اختيار المنتجات المدعومة لتجربة الملابس
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
              جميع منتجات المتجر
            </Toggle>
            <Toggle value="selected" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              منتجات أختارها بنفسي
            </Toggle>
            <Toggle value="selected-categories" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              تصنيفات محددة فقط
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Placement Target */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            موضع زر "تجربة القياس" في صفحة المنتج
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
            <Toggle value="on-product-image" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
              على صورة المنتج
            </Toggle>
            <Toggle value="above-product-options" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
              فوق خيارات المنتج
            </Toggle>
            <Toggle value="description-section" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
              سيكشن تعريفي بداخل بيانات المنتج
            </Toggle>
            <Toggle value="floating-bottom" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
              عائم أسفل الصفحة
            </Toggle>
            <Toggle value="floating-middle" className="px-2 py-1 h-7 text-[9px] font-black rounded-lg whitespace-nowrap">
              عائم في منتصف الصفحة
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Placement Side & Offsets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
              جهة الظهور (يمين/يسار)
              <ArrowRightLeft className="size-3.5" />
            </Label>
            <ToggleGroup
              multiple={false}
              value={[rules.placement_side]}
              onValueChange={(v: string[]) => v[0] && onUpdate({ placement_side: v[0] as any })}
              className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
              variant="default"
              size="sm"
            >
              <Toggle value="right" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg transition-all">
                يمين
              </Toggle>
              <Toggle value="center" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg transition-all">
                منتصف
              </Toggle>
              <Toggle value="left" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg transition-all">
                يسار
              </Toggle>
            </ToggleGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
              هوامش وإزاحة الموضع (بكسل)
              <Layout className="size-3.5" />
            </Label>
            <div className="flex gap-2 items-center">
              <div className="flex-1 space-y-1">
                <p className="text-[8px] font-bold text-muted-foreground/60 text-right">رأسي</p>
                <input
                  type="number"
                  value={rules.vertical_offset}
                  onChange={(e) => onUpdate({ vertical_offset: Number(e.target.value) })}
                  className="w-full h-8 bg-background border border-border/40 rounded-md text-[10px] font-black text-center"
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[8px] font-bold text-muted-foreground/60 text-right">أفقي</p>
                <input
                  type="number"
                  value={rules.horizontal_offset}
                  onChange={(e) => onUpdate({ horizontal_offset: Number(e.target.value) })}
                  className="w-full h-8 bg-background border border-border/40 rounded-md text-[10px] font-black text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Display Timing */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            متى يظهر الزر للعميل
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
              عرض فوري سريع
            </Toggle>
            <Toggle value="after-page-stable" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              بعد اكتمال تحميل الصفحة
            </Toggle>
            <Toggle value="after-image-gallery-ready" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              بعد ظهور صور المنتج
            </Toggle>
            <Toggle value="after-cta-block-detected" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              بجانب زر الإضافة للسلة
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Trigger Behavior */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            ذكاء تشغيل الخدمة
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
              عرض الزر تلقائياً
            </Toggle>
            <Toggle value="user-intent-only" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              دعه يظهر عند الحاجة فقط
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Availability Conditions */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/10">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            شروط ذكية لإخفاء الزر
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
              <Label className="text-[9px] font-bold text-muted-foreground">إخفاء إذا توقف الاشتراك أو الخدمة</Label>
            </div>
            <div className="flex items-center justify-between">
              <Switch
                checked={rules.availability_conditions.hide_when_no_credits}
                onCheckedChange={(val) => onUpdate({
                  availability_conditions: { ...rules.availability_conditions, hide_when_no_credits: val },
                })}
                className="scale-85"
              />
              <Label className="text-[9px] font-bold text-muted-foreground">إخفاء عندما ينتهي رصيد العمليات</Label>
            </div>
          </div>
        </div>

        {/* Fallback Strategy */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            خطة بديلة في حال تعذر الظهور
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
              تغيير المكان تلقائياً
            </Toggle>
            <Toggle value="floating-only" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              عرضه كزر عائم فقط
            </Toggle>
            <Toggle value="disabled" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              عدم الإظهار نهائياً
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Device Variant */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            التوافق مع أجهزة العملاء
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
              نفس الشكل للكل
            </Toggle>
            <Toggle value="dedicated-mobile" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              شكل خاص للجوال
            </Toggle>
            <Toggle value="dedicated-desktop" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              شكل خاص للكمبيوتر
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Localization Mode */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            لغة واجهة الخدمة
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
              اللغة العربية
            </Toggle>
            <Toggle value="english-only" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              اللغة الإنجليزية
            </Toggle>
            <Toggle value="auto-by-storefront" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              حسب لغة متجرك
            </Toggle>
          </ToggleGroup>
        </div>

        {/* State Messaging Policy */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            أسلوب التواصل مع العميل
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
              رسائل قصيرة ومختصرة
            </Toggle>
            <Toggle value="guided" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              رسائل إرشادية مفصلة
            </Toggle>
            <Toggle value="conversion-focused" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              رسائل تشجيعية للطلب
            </Toggle>
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  )
}
