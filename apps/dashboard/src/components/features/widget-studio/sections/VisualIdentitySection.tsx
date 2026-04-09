/**
 * Visual Identity Section
 *
 * Token-based visual identity settings for consistent styling.
 */

import {
  Palette,
  Layers,
  SquareRoundCorner,
  Grid3x3,
  Type,
  Zap,
  Sparkles,
  Eye,
  RefreshCw,
  FileText,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ToggleGroup, Toggle } from '@/components/animate-ui/components/base/toggle-group'

import type { 
  VisualIdentity, 
  SurfaceStyle, 
  CornerRadius, 
  SpacingDensity, 
  TypographyTone, 
  VisualIntensity, 
  IconStyle, 
  BackdropStyle, 
  MotionEnergy, 
  StateEmphasis 
} from '@virtual-tryon/shared-types'

interface VisualIdentitySectionProps {
  settings: VisualIdentity
  onUpdate: (patch: Partial<VisualIdentity>) => void
}

export function VisualIdentitySection({ settings, onUpdate }: VisualIdentitySectionProps) {
  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
      <CardHeader className="p-3 border-b border-border/10">
        <div className="flex items-center gap-2 text-foreground/80">
          <Palette className="size-4 text-primary/70" />
          <CardTitle className="text-sm font-black">طريقة العرض والألوان</CardTitle>
        </div>
        <CardDescription className="text-[9px] font-bold opacity-60 mt-1">
          تحكم في الألوان والخطوط لتناسب هوية متجرك
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        {/* Brand Color */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            لون علامتك التجارية الأساسي
            <Palette className="size-3.5" />
          </Label>
          <div className="flex items-center gap-2">
            <div
              className="size-8 rounded-lg border-2 border-border/40"
              style={{ backgroundColor: settings.brand_color }}
            />
            <Input
              type="color"
              value={settings.brand_color}
              onChange={(e) => onUpdate({ brand_color: e.target.value })}
              className="flex-1 h-9 rounded-lg bg-background border-border/60 font-bold text-[10px] text-right"
            />
            <Input
              type="text"
              value={settings.brand_color}
              onChange={(e) => onUpdate({ brand_color: e.target.value })}
              className="w-24 h-9 rounded-lg bg-background border-border/60 font-mono text-[10px] text-center"
              placeholder="#7c3aed"
              maxLength={7}
            />
          </div>
        </div>

        {/* Surface Style */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            شكل خلفية العناصر
            <Layers className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[settings.surface_style]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ surface_style: v[0] as SurfaceStyle })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="solid" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              لون كامل
            </Toggle>
            <Toggle value="soft" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              ناعم
            </Toggle>
            <Toggle value="elevated" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              بارز قليلاً
            </Toggle>
            <Toggle value="glass" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              زجاجي
            </Toggle>
            <Toggle value="outline" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              إطار فقط
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Corner Radius */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            درجة انحناء الزوايا
            <SquareRoundCorner  className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[settings.corner_radius]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ corner_radius: v[0] as CornerRadius })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="compact" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              حادة (مربعة)
            </Toggle>
            <Toggle value="balanced" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              متوازنة
            </Toggle>
            <Toggle value="rounded" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              دائرية
            </Toggle>
            <Toggle value="pill-heavy" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              مستديرة جداً
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Spacing Density */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            توزيع المسافات بين العناصر
            <Grid3x3 className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[settings.spacing_density]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ spacing_density: v[0] as SpacingDensity })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="compact" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              متراص (ضيق)
            </Toggle>
            <Toggle value="comfortable" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              مريح (عادي)
            </Toggle>
            <Toggle value="spacious" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              واسع وفضفاض
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Typography Tone */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            ستايل الخط المستخدم
            <Type className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[settings.typography_tone]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ typography_tone: v[0] as TypographyTone })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="neutral" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              رسمي بسيط
            </Toggle>
            <Toggle value="modern" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              عصري وجذاب
            </Toggle>
            <Toggle value="premium" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              فاخر واحترافي
            </Toggle>
            <Toggle value="bold" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              تجاري جريء
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Visual Intensity */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            قوة وبروز التصميم
            <Zap className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[settings.visual_intensity]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ visual_intensity: v[0] as VisualIntensity })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="quiet" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              هادئ جداً
            </Toggle>
            <Toggle value="balanced" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              متوازن
            </Toggle>
            <Toggle value="expressive" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              ملفت للعين
            </Toggle>
            <Toggle value="bold" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              قوي وجريء
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Icon Style */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            شكل الأيقونات بداخل الويدجت
            <Sparkles className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[settings.icon_style]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ icon_style: v[0] as IconStyle })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="line" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              خطوط نحيفة
            </Toggle>
            <Toggle value="duotone" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              لونين (ثنائي)
            </Toggle>
            <Toggle value="filled" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              ممتلئ (بارز)
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Backdrop Style */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            خلفية العرض
            <Eye className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[settings.backdrop_style]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ backdrop_style: v[0] as BackdropStyle })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="dim" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              تعتيم هادئ
            </Toggle>
            <Toggle value="blur-dark" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              تغبيش ضبابي
            </Toggle>
            <Toggle value="gradient" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              تدرج لوني
            </Toggle>
            <Toggle value="none" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              بدون تأثير
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Motion Energy */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            توقيت وحالة العرض الافتراضية
            <RefreshCw className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[settings.motion_energy]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ motion_energy: v[0] as MotionEnergy })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="minimal" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              النتيجة أولاً
            </Toggle>
            <Toggle value="smooth" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              الرفع أولاً
            </Toggle>
            <Toggle value="lively" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              مخصص
            </Toggle>
            <Toggle value="dynamic" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              ديناميكي
            </Toggle>
          </ToggleGroup>
        </div>

        {/* State Emphasis */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            أول ما يراه العميل عند البدء
            <FileText className="size-3.5" />
          </Label>
          <ToggleGroup
            multiple={false}
            value={[settings.state_emphasis]}
            onValueChange={(v: string[]) => v[0] && onUpdate({ state_emphasis: v[0] as StateEmphasis })}
            className="w-full bg-background/50 p-1 rounded-lg gap-1 border border-border/5"
            variant="default"
            size="sm"
          >
            <Toggle value="result-first" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              النتيجة أولاً
            </Toggle>
            <Toggle value="upload-first" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              الرفع أولاً
            </Toggle>
            <Toggle value="balanced" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              متوازن
            </Toggle>
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  )
}
