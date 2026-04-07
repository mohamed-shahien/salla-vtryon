import { Palette, AlertCircle, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { useWidgetStudio } from './hooks/use-widget-studio'
import { WidgetSettingsActions } from './WidgetSettingsActions'
import { WidgetLaunchSection } from './sections/WidgetLaunchSection'
import { WidgetPlacementSection } from './sections/WidgetPlacementSection'
import { WidgetAccessSection } from './sections/WidgetAccessSection'
import { WidgetTemplateCarousel } from './sections/WidgetTemplateCarousel'
import { DialogTemplateCarousel } from './sections/DialogTemplateCarousel'
import { WidgetAppearanceSection } from './sections/WidgetAppearanceSection'
import { WidgetLivePreview } from './preview/WidgetLivePreview'

function LoadingSkeleton() {
  return (
    <div className="space-y-4 pb-20">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-border/40">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-4 w-32 ml-auto rounded-md" />
          <Skeleton className="h-8 w-56 ml-auto rounded-lg" />
          <Skeleton className="h-3 w-80 ml-auto rounded-md" />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-3">
          {/* Two Carousels Skeletons */}
          <Skeleton className="h-[180px] rounded-xl" />
          <Skeleton className="h-[180px] rounded-xl" />
          {/* Settings Section Skeletons */}
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            {/* Live Preview Skeleton */}
            <Skeleton className="h-[600px] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}



function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
      <div className="size-12 rounded-xl bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="size-5 text-destructive" />
      </div>
      <h3 className="text-sm font-black">تعذر تحميل الإعدادات</h3>
      <p className="text-[9px] text-muted-foreground max-w-xs font-bold">
        حدث خطأ أثناء تحميل إعدادات الويدجت. تأكد من اتصالك بالإنترنت وحاول مجدداً.
      </p>
      <Button onClick={onRetry} variant="outline" className="rounded-lg font-black text-[10px] h-8 gap-2">
        <RefreshCw className="size-3" />
        إعادة المحاولة
      </Button>
    </div>
  )
}

export function WidgetStudioPage() {
  const studio = useWidgetStudio()

  if (studio.status === 'loading' || studio.status === 'idle') {
    return <LoadingSkeleton />
  }

  if (studio.status === 'error') {
    return <ErrorState onRetry={studio.reload} />
  }

  return (
    <div className="space-y-3 pb-20">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-border/40 text-right">
        <div className="space-y-1 text-right">
          <Badge
            variant="outline"
            className="text-[9px] font-black px-2 py-0.5 bg-primary/5 text-primary border-primary/20 rounded-lg"
          >
            استوديو المصمم
          </Badge>
          <h1 className="text-xl font-black leading-tight flex items-center gap-2 justify-end">
            استوديو الويدجت
            <Palette className="size-5 text-primary" />
          </h1>
          <p className="text-muted-foreground font-bold text-[9px] max-w-xl opacity-70">
            صمّم مظهر ويدجت التجربة الافتراضية وطريقة ظهوره في متجرك
          </p>
        </div>

        <WidgetSettingsActions
          isDirty={studio.isDirty}
          saveStatus={studio.saveStatus}
          onSave={() => void studio.save()}
          onReset={studio.resetToDefaults}
          onDiscard={studio.discardChanges}
        />
      </div>

      {/* ── Unsaved Indicator ─────────────────────────────────────────────── */}
      {studio.isDirty && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200/50 text-right justify-end">
          <span className="text-[9px] font-black text-amber-700">لديك تغييرات غير محفوظة</span>
          <div className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        </div>
      )}

      {/* ── Main Layout: Settings + Preview ───────────────────────────────── */}
      <div className="grid gap-3 lg:grid-cols-5 relative">
        {/* Left: Settings Panels (RTL → actually right visually) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Templates */}
          <WidgetTemplateCarousel
            config={studio.config}
            onApplyTemplate={studio.setFullConfig}
          />

          <DialogTemplateCarousel
            config={studio.config}
            onApplyTemplate={studio.setFullConfig}
          />

          {/* Core Sections */}
          <WidgetLaunchSection
            config={studio.config}
            onUpdate={(patch) => studio.updateConfig('launch', patch)}
          />

          <WidgetPlacementSection
            config={studio.config}
            onUpdate={(patch) => studio.updateConfig('placement', patch)}
          />

          <WidgetAccessSection
            config={studio.config}
            onUpdate={(patch) => studio.updateConfig('access', patch)}
          />

          <WidgetAppearanceSection
            config={studio.config}
            onUpdateAppearance={(patch) => studio.updateConfig('appearance', patch)}
            onUpdateDialog={(patch) => studio.updateConfig('dialog', patch)}
          />
        </div>

        {/* Right: Live Preview (sticky) */}
        <div className="lg:col-span-2 relative">
          <div className="sticky top-10 space-y-3 h-fit z-20">
             <WidgetLivePreview config={studio.config} />
          </div>
        </div>
      </div>
    </div>
  )
}
