import React from 'react'
import {
  AlertCircle,
  RefreshCw,
  Settings2,
  Settings,
  X,
  Palette,
  LayoutPanelTop,
  MousePointer2,
  ArrowRightLeft
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSidebar } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

import { useWidgetStudio } from './hooks/use-widget-studio'
import { WidgetSettingsActions } from './WidgetSettingsActions'
import { VisualIdentitySection } from './sections/VisualIdentitySection'
import { ButtonPresetsSection } from './sections/ButtonPresetsSection'
import { WindowPresetsSection } from './sections/WindowPresetsSection'
import { DisplayRulesSection } from './sections/DisplayRulesSection'
import { DiagnosticsSection } from './sections/DiagnosticsSection'
import { RuntimeSafeguardsSection } from './sections/RuntimeSafeguardsSection'
import { WidgetLivePreview } from './preview/WidgetLivePreview'
import { PreviewDeviceToggle, type PreviewDevice } from './preview/PreviewDeviceToggle'

function LoadingSkeleton() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex items-stretch overflow-hidden bg-background">

      <div className="w-12 border-l border-border/40 bg-card/50" />

      <div className="w-80 border-l border-border/40 bg-card/30 flex flex-col p-6 gap-6">
        <Skeleton className="h-6 w-1/3 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>

      <div className="flex-1 bg-muted/5 flex items-center justify-center p-12">
        <Skeleton className="h-[600px] w-full max-w-4xl rounded-lg shadow-2xl" />
      </div>
    </div>
  )
}



function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
      <div className="size-12 rounded-lg bg-destructive/10 flex items-center justify-center">
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
  const bootstrapConfig = (window as any).__VTRYON_CONFIG__ || { apiBaseUrl: '' }
  const studio = useWidgetStudio({
    apiUrl: bootstrapConfig.apiBaseUrl,
  })
  const dashboardSidebar = useSidebar()
  const [device, setDevice] = React.useState<PreviewDevice>('desktop')
  const [showSettings, setShowSettings] = React.useState(true)

  // Auto-collapse dashboard sidebar on mount
  React.useEffect(() => {
    dashboardSidebar.setOpen(false)
  }, []) // Empty dependency to only run on mount

  if (studio.status === 'loading' || studio.status === 'idle') {
    return <LoadingSkeleton />
  }

  if (studio.status === 'error') {
    return <ErrorState onRetry={studio.reload} />
  }

  return (
    <div className="h-[calc(100vh-3.5rem-1px)] -mx-3 -mt-3 flex overflow-hidden bg-background rtl select-none relative" dir="rtl">

      <motion.aside
        layout
        className={cn(
          "h-full bg-card border-l border-border/40 transition-[width] duration-300 ease-in-out flex flex-col shrink-0 relative z-30 shadow-[-10px_0_30px_-5px_rgba(0,0,0,0.05)]",
          showSettings ? "w-[440px]" : "w-0"
        )}
      >
        <div className={cn(
          "w-[440px] h-full flex flex-col transition-opacity duration-300",
          showSettings ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>

          <div className="border-b border-border/40 space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 h-12">
              <div className="flex items-center gap-2 px-2">
                <div className="size-9 rounded-lg bg-primary/20 flex items-center justify-center transition-transform hover:rotate-3">
                  <Settings2 className="size-5 text-primary" />
                </div>
                <h2 className="text-xs font-black text-foreground tracking-tight">إعدادات التصميم</h2>
              </div>
              <Badge variant="outline" className="text-[9px] mx-2 font-black bg-emerald-500/5 text-emerald-600 border-emerald-500/20 rounded-lg h-5 px-1.5 flex items-center gap-1">
                <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                وضع الاستوديو
              </Badge>
            </div>

            <WidgetSettingsActions
              isDirty={studio.isDirty}
              saveStatus={studio.saveStatus}
              onSave={() => void studio.save()}
              onReset={studio.resetToDefaults}
              onDiscard={studio.discardChanges}
            />

            {studio.isDirty && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-in slide-in-from-top-1 duration-300">
                <div className="size-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" />
                <span className="text-[10px] font-black text-amber-600">لديك تغييرات لم يتم حفظها</span>
              </div>
            )}
          </div>


          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-5 pb-24">

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-foreground/80 px-1">
                    <Palette className="size-4 text-primary/70" />
                    <span className="text-[10px] font-black">الهوية والتصميم (Visual Tokens)</span>
                  </div>
                  <VisualIdentitySection
                    settings={studio.config.visual_identity}
                    onUpdate={studio.updateVisualIdentity}
                  />
                </div>

                <Separator className="bg-border/40 opacity-50" />


                <Accordion type="multiple" defaultValue={["presets", "rules"]} className="w-full">

                  <AccordionItem value="presets" className="border-b-0 mb-3 bg-muted/20 rounded-lg overflow-hidden border border-border/5">
                    <AccordionTrigger className="hover:no-underline py-3 px-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-primary/20 flex items-center justify-center">
                          <MousePointer2 className="size-4.5 text-primary" />
                        </div>
                        <div className="flex flex-col items-start text-right">
                          <span className="text-[11px] font-black tracking-tight">القوالب والأزرار</span>
                          <span className="text-[9px] font-medium text-muted-foreground opacity-70">اختر من القوالب المعدة مسبقاً لمشغل الويدجت</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-1 space-y-4">
                      <ButtonPresetsSection
                        settings={studio.config.button}
                        onUpdate={studio.updateButtonSettings}
                        onApplyPreset={studio.applyButtonPreset}
                      />
                      <WindowPresetsSection
                        settings={studio.config.window}
                        onUpdate={studio.updateWindowSettings}
                        onApplyPreset={studio.applyWindowPreset}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="rules" className="border-b-0 mb-3 bg-muted/20 rounded-lg overflow-hidden border border-border/5">
                    <AccordionTrigger className="hover:no-underline py-3 px-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Settings className="size-4.5 text-primary" />
                        </div>
                        <div className="flex flex-col items-start text-right">
                          <span className="text-[11px] font-black tracking-tight">قواعد الظهور والذكاء</span>
                          <span className="text-[9px] font-medium text-muted-foreground opacity-70">متى وأين يظهر الويدجت وتجربة المستخدم</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-1">
                      <DisplayRulesSection
                        rules={studio.config.display_rules}
                        onUpdate={studio.updateDisplayRules}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="diagnostics" className="border-b-0 mb-3 bg-muted/20 rounded-lg overflow-hidden border border-border/5">
                    <AccordionTrigger className="hover:no-underline py-3 px-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-primary/20 flex items-center justify-center">
                          <LayoutPanelTop className="size-4.5 text-primary" />
                        </div>
                        <div className="flex flex-col items-start text-right">
                          <span className="text-[11px] font-black tracking-tight">التشخيص والأمان</span>
                          <span className="text-[9px] font-medium text-muted-foreground opacity-70">أدوات المطورين وقيود التشغيل</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-1 space-y-4">
                      <RuntimeSafeguardsSection
                        settings={studio.config.runtime_safeguards}
                        onUpdate={studio.updateRuntimeSafeguards}
                      />
                      <Separator className="bg-border/40 opacity-50" />
                      <DiagnosticsSection
                        apiUrl={bootstrapConfig.apiBaseUrl}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </ScrollArea>
          </div>
        </div>
      </motion.aside>


      <main className="flex-1 min-w-0 bg-linear-to-br from-muted/30 via-background to-muted/20 relative flex flex-col items-stretch">

        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_70%_70%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <nav className="h-12 border-b border-border/10 bg-background/50 backdrop-blur-xl flex items-center justify-between px-4 z-40 relative">
          <div className="flex items-center gap-3">
            <TooltipProvider delayDuration={100}>
              <div className="flex items-center gap-1.5 p-1 bg-muted/30 rounded-lg border border-border/5">

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-8 rounded-lg transition-all duration-200",
                        showSettings ? "text-primary bg-primary/20 shadow-xs" : "text-muted-foreground hover:bg-muted"
                      )}
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      <Settings2 className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] font-bold">إعدادات التصميم</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            <div className="h-4 w-px bg-border/20 mx-1" />

            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse-slow" />
              <span className="text-[10px] font-bold text-muted-foreground tracking-tight">معاينة المتجر المباشرة</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <PreviewDeviceToggle device={device} onChange={setDevice} />

            <div className="h-8 w-px bg-border/10" />

            <div className="hidden sm:flex flex-col items-end gap-0.5">
              <span className="text-[9px] font-black text-foreground opacity-80 leading-none">متصل بنظام سلة</span>
              <span className="text-[7px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest font-mono">Synced V2</span>
            </div>

            <Button variant="ghost" size="icon" className="size-8 rounded-lg opacity-40 hover:opacity-100 transition-opacity">
              <X className="size-4" />
            </Button>
          </div>
        </nav>


        <div className="flex-1 w-full h-full flex flex-col items-stretch relative z-10 overflow-hidden isolate">
          <div className="w-full h-full flex flex-col animate-in fade-in duration-700">
            <WidgetLivePreview config={studio.config as any} device={device} />
          </div>
        </div>


        <footer className="p-3 border-t border-border/10 bg-background/20 backdrop-blur-sm flex items-center justify-center gap-10 z-20">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="size-3.5 text-muted-foreground opacity-40" />
            <span className="text-[8px] font-black text-muted-foreground/50 tracking-widest uppercase">مزامنة نشطة</span>
          </div>
          <div className="flex items-center gap-2">
            <MousePointer2 className="size-3.5 text-muted-foreground opacity-40" />
            <span className="text-[8px] font-black text-muted-foreground/50 tracking-widest uppercase">معاينة تفاعلية</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
