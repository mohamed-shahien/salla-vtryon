import { useRef, useState } from 'react'
import {
  Download,
  GalleryHorizontalEnd,
  ImagePlus,
  Layers2,
  type LucideIcon,
  Loader2,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { uploadMerchantImage } from '@/lib/api'

import {
  WATERMARK_POSITION_OPTIONS,
  type UxFeatures,
  type VisualIdentity,
  type WatermarkPosition,
  type WatermarkSettings,
} from '@virtual-tryon/shared-types'

const WATERMARK_POSITION_LABELS: Record<WatermarkPosition, string> = {
  'top-left': 'Top left',
  'top-right': 'Top right',
  'bottom-left': 'Bottom left',
  'bottom-right': 'Bottom right',
  center: 'Center',
}

interface BrandingUxSectionProps {
  visualIdentity: VisualIdentity
  uxFeatures: UxFeatures
  onUpdateVisualIdentity: (patch: Partial<VisualIdentity>) => void
  onUpdateUxFeatures: (patch: Partial<UxFeatures>) => void
}

function FeatureToggle({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: LucideIcon
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/10 bg-muted/20 p-3">
      <Switch checked={checked} onCheckedChange={onCheckedChange} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col items-end gap-1 text-right">
        <Label className="text-[10px] font-black text-foreground/80">{title}</Label>
        <p className="text-[8px] font-bold leading-4 text-muted-foreground">{description}</p>
      </div>
      <Icon className="size-4 shrink-0 text-muted-foreground" />
    </div>
  )
}

export function BrandingUxSection({
  visualIdentity,
  uxFeatures,
  onUpdateVisualIdentity,
  onUpdateUxFeatures,
}: BrandingUxSectionProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const watermark = visualIdentity.watermark

  const updateWatermark = (patch: Partial<WatermarkSettings>) => {
    onUpdateVisualIdentity({
      watermark: {
        ...watermark,
        ...patch,
      },
    })
  }

  const handleLogoUpload = async (file: File | undefined) => {
    if (!file) {
      return
    }

    setIsUploading(true)

    try {
      const response = await uploadMerchantImage(file)
      updateWatermark({ logo_url: response.data.url })
      toast.success('Watermark logo uploaded.')
    } catch (error) {
      console.error('[WidgetStudio] Watermark upload failed:', error)
      toast.error('Logo upload failed.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Card className="rounded-lg border-border/40 bg-card/60 text-right shadow-sm backdrop-blur-md">
      <CardHeader className="border-b border-border/10 p-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="h-5 rounded-lg px-2 text-[9px] font-black">
            Premium
          </Badge>
          <div className="flex items-center gap-2 text-foreground/80">
            <CardTitle className="text-sm font-black">Branding & UX</CardTitle>
            <Sparkles className="size-4 text-primary/70" />
          </div>
        </div>
        <CardDescription className="mt-1 text-[9px] font-bold opacity-60">
          Control branded downloads and shopper result interactions.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 p-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/10 bg-muted/20 p-3">
          <Switch
            checked={watermark.enabled}
            onCheckedChange={(enabled) => updateWatermark({ enabled })}
            size="sm"
          />
          <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
            <Label className="text-[10px] font-black text-foreground/80">Watermark result images</Label>
            <p className="text-[8px] font-bold leading-4 text-muted-foreground">
              Use your store logo on branded result previews and downloads.
            </p>
          </div>
          <Layers2 className="size-4 shrink-0 text-muted-foreground" />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="flex items-center justify-end gap-1.5 text-[10px] font-black text-muted-foreground/70">
            Logo source
            <ImagePlus className="size-3.5" />
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={watermark.logo_url}
              onChange={(event) => updateWatermark({ logo_url: event.target.value })}
              className="h-9 rounded-lg border-border/60 bg-background text-left font-mono text-[10px]"
              placeholder="https://cdn.example.com/logo.png"
              dir="ltr"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 rounded-lg text-[10px] font-black"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? <Loader2 className="size-3 animate-spin" /> : <ImagePlus className="size-3" />}
              Upload
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(event) => void handleLogoUpload(event.target.files?.[0])}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label className="text-right text-[10px] font-black text-muted-foreground/70">Position</Label>
            <Select
              value={watermark.position}
              onValueChange={(value) => updateWatermark({ position: value as WatermarkPosition })}
            >
              <SelectTrigger className="h-9 w-full rounded-lg text-[10px] font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {WATERMARK_POSITION_OPTIONS.map((position) => (
                    <SelectItem key={position} value={position} className="text-[10px] font-bold">
                      {WATERMARK_POSITION_LABELS[position]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-right text-[10px] font-black text-muted-foreground/70">
              Size {watermark.size}px
            </Label>
            <Slider
              min={48}
              max={280}
              step={4}
              value={[watermark.size]}
              onValueChange={(value) => updateWatermark({ size: value[0] ?? watermark.size })}
              className="h-9"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-right text-[10px] font-black text-muted-foreground/70">
            Opacity {Math.round(watermark.opacity * 100)}%
          </Label>
          <Slider
            min={10}
            max={100}
            step={5}
            value={[Math.round(watermark.opacity * 100)]}
            onValueChange={(value) => updateWatermark({ opacity: (value[0] ?? 72) / 100 })}
          />
        </div>

        <Separator className="opacity-50" />

        <div className="flex flex-col gap-3">
          <FeatureToggle
            icon={SlidersHorizontal}
            title="Before/after comparison"
            description="Show the interactive slider in the result state."
            checked={uxFeatures.compare_mode}
            onCheckedChange={(compare_mode) => onUpdateUxFeatures({ compare_mode })}
          />
          <FeatureToggle
            icon={GalleryHorizontalEnd}
            title="Session gallery"
            description="Keep recent successful try-ons in this shopper session."
            checked={uxFeatures.session_gallery}
            onCheckedChange={(session_gallery) => onUpdateUxFeatures({ session_gallery })}
          />
          <FeatureToggle
            icon={Download}
            title="Allow result download"
            description="Show the download action for completed results."
            checked={uxFeatures.allow_download}
            onCheckedChange={(allow_download) => onUpdateUxFeatures({ allow_download })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
