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
          <CardTitle className="text-sm font-black">الهوية البصرية</CardTitle>
        </div>
        <CardDescription className="text-[9px] font-bold opacity-60 mt-1">
          الألوان، الزوايا، المسافات، والخطوط
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        {/* Brand Color */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            اللون الأساسي
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
            نمط السطح
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
              صلب
            </Toggle>
            <Toggle value="soft" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              ناعم
            </Toggle>
            <Toggle value="elevated" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              مرتفع
            </Toggle>
            <Toggle value="glass" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              زجاجي
            </Toggle>
            <Toggle value="outline" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              حدود
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Corner Radius */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            الزوايا
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
              مضغوط
            </Toggle>
            <Toggle value="balanced" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              متوازن
            </Toggle>
            <Toggle value="rounded" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              مستدير
            </Toggle>
            <Toggle value="pill-heavy" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              حبة
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Spacing Density */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            كثافة المسافات
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
              مضغوط
            </Toggle>
            <Toggle value="comfortable" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              مريح
            </Toggle>
            <Toggle value="spacious" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              واسع
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Typography Tone */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            نبرة الخط
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
              محايد
            </Toggle>
            <Toggle value="modern" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              حديث
            </Toggle>
            <Toggle value="premium" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              فاخر
            </Toggle>
            <Toggle value="bold-commerce" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              تجاري جريء
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Visual Intensity */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            الشدة البصرية
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
              هادئ
            </Toggle>
            <Toggle value="balanced" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              متوازن
            </Toggle>
            <Toggle value="expressive" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              معبر
            </Toggle>
            <Toggle value="bold" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              جريء
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Icon Style */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            نمط الأيقونات
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
              خطي
            </Toggle>
            <Toggle value="duotone" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              ثنائي
            </Toggle>
            <Toggle value="filled" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              ممتلئ
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
              معتم
            </Toggle>
            <Toggle value="blur" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              ضبابي
            </Toggle>
            <Toggle value="gradient" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              متدرج
            </Toggle>
            <Toggle value="none" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              بدون
            </Toggle>
          </ToggleGroup>
        </div>

        {/* Motion Energy */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            طاقة الحركة
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
              بسيط
            </Toggle>
            <Toggle value="smooth" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              ناعم
            </Toggle>
            <Toggle value="lively" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              حيوي
            </Toggle>
            <Toggle value="dynamic" className="flex-1 py-1 h-7 text-[9px] font-black rounded-lg">
              ديناميكي
            </Toggle>
          </ToggleGroup>
        </div>

        {/* State Emphasis */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/70 flex items-center gap-1.5 justify-end">
            التركيز على الحالة
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
