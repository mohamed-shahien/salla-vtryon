import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
   Monitor,
   Code2,
   Copy,
   Check,
   Save,
   ShieldCheck,
   Globe,
   Zap,
   Layout,
   MousePointer2,
   AlertCircle,
   Loader2,
   Sparkles,
   ArrowLeft,
} from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select"
import {
   TooltipProvider,
} from "@/components/ui/tooltip"
import {
   fetchCurrentMerchant,
   fetchEmbedScript,
   fetchWidgetSettings,
   updateWidgetSettings,
   type EmbedScriptData,
   type MerchantWidgetSettings,
   type TryOnCategory,
   type WidgetMode,
} from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const CATEGORY_OPTIONS: Array<{ value: TryOnCategory; label: string; description: string }> = [
   { value: 'upper_body', label: 'ملابس علوية', description: 'قمصان، تيشيرتات، جاكيتات' },
   { value: 'lower_body', label: 'ملابس سفلية', description: 'بناطيل، تنانير' },
   { value: 'dresses', label: 'فساتين وأطقم', description: 'فساتين كاملة' },
]

const MODE_OPTIONS: Array<{ value: WidgetMode; label: string; description: string }> = [
   {
      value: 'all',
      label: 'شامل',
      description: 'تلقائياً لكافة المنتجات.',
   },
   {
      value: 'selected',
      label: 'محدد',
      description: 'المنتجات المختارة يدوياً.',
   },
]

const item = {
   hidden: { opacity: 0, y: 10 },
   show: { opacity: 1, y: 0 }
}

export function SettingsPage() {
   const navigate = useNavigate()
   const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
   const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle')
   const [settings, setSettings] = useState<MerchantWidgetSettings | null>(null)
   const [draft, setDraft] = useState<MerchantWidgetSettings | null>(null)
   const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'ready' | 'failed'>('idle')
   const [embedScript, setEmbedScript] = useState<EmbedScriptData | null>(null)
   const [copied, setCopied] = useState(false)
   const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

   useEffect(() => {
      let active = true

      async function loadAll() {
         setStatus('loading')
         try {
            const [settingsResponse, scriptResponse] = await Promise.all([
               fetchWidgetSettings(),
               fetchEmbedScript().catch(() => null),
            ])

            if (!active) return

            setSettings(settingsResponse.data)
            setDraft(settingsResponse.data)
            if (scriptResponse) setEmbedScript(scriptResponse.data)
            setStatus('ready')
         } catch {
            if (!active) return
            setStatus('failed')
            toast.error('تعذر تحميل الإعدادات')
         }
      }

      void loadAll()
      return () => { active = false }
   }, [])

   function handleCopy() {
      if (!embedScript) return
      void navigator.clipboard.writeText(embedScript.script_tag).then(() => {
         setCopied(true)
         toast.success("تم نسخ الكود")
         if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
         copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
      })
   }

   async function handleSave() {
      if (!draft) return
      setSaveStatus('saving')
      try {
         const response = await updateWidgetSettings({
            widget_enabled: draft.widget_enabled,
            widget_mode: draft.widget_mode,
            widget_button_text: draft.widget_button_text,
            default_category: draft.default_category,
         })

         setSettings(response.data)
         setDraft(response.data)
         setSaveStatus('ready')
         toast.success("تم الحفظ بنجاح")

         const merchant = await fetchCurrentMerchant()
         if (merchant) setAuthenticated(merchant.data)
      } catch {
         setSaveStatus('failed')
         toast.error('فشل في حفظ الإعدادات')
      }
   }

   if (status === 'loading') {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="size-6 animate-spin text-primary opacity-50" />
            <p className="text-[10px] font-black text-muted-foreground  ">تجهيز الإعدادات المتقدمة...</p>
         </div>
      )
   }

   const draftChanged = JSON.stringify(draft) !== JSON.stringify(settings)

   return (
      <TooltipProvider>
         <div className="space-y-4 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-border/40 text-right">
               <div className="space-y-1 text-right">
                  <Badge variant="outline" className="text-[9px] font-black   px-2 py-0.5 bg-primary/5 text-primary border-primary/20 rounded-xl">
                     النظام الأساسي
                  </Badge>
                  <h1 className="text-2xl font-black  leading-tight">تخصيص واجهة المتجر</h1>
                  <p className="text-muted-foreground font-bold text-[10px] max-w-xl opacity-70">
                     تحكم في كيفية ظهور زر القياس الافتراضي وتخصيص النصوص والربط التقني.
                  </p>
               </div>

                <div className="flex items-center gap-2">
                   <Button
                      variant="outline"
                      onClick={() => navigate('/products')}
                      className="rounded-xl font-black text-[10px] h-9 px-4 shadow-xs bg-card/50 backdrop-blur-sm border-border/60"
                   >
                      <ArrowLeft className="me-2 size-3.5" />
                      العودة للمنتجات
                   </Button>
                   <Button
                      onClick={() => void handleSave()}
                      disabled={!draftChanged || saveStatus === 'saving'}
                      className="rounded-xl font-black text-[10px] h-9 px-5 shadow-lg shadow-primary/20 bg-primary transition-all active:scale-95"
                   >
                      {saveStatus === 'saving' ? <Loader2 className="me-2 size-3.5 animate-spin" /> : <Save className="me-2 size-3.5" />}
                      حفظ التغييرات
                   </Button>
                </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
               <div className="lg:col-span-2 space-y-3">
                  {/* General Configuration */}
                  <motion.div variants={item} initial="hidden" animate="show">
                     <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-xl text-right">
                        <CardHeader className="p-3 border-b border-border/10">
                           <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                 <CardTitle className="text-base font-black flex items-center gap-2 justify-end">
                                    حالة العرض العام
                                    <Monitor className="size-4 text-primary" />
                                 </CardTitle>
                                 <CardDescription className="text-[9px] font-black opacity-60">تفعيل أو تعطيل الإضافة تماماً من المتجر</CardDescription>
                              </div>
                              <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-xl border border-border/40">
                                 <span className={cn("text-[9px] font-black", draft?.widget_enabled ? "text-emerald-600" : "text-muted-foreground opacity-60")}>
                                    {draft?.widget_enabled ? "نشط" : "معطل"}
                                 </span>
                                 <Switch
                                    checked={draft?.widget_enabled}
                                    onCheckedChange={(val) => setDraft(c => c ? { ...c, widget_enabled: val } : null)}
                                    className="data-[state=checked]:bg-emerald-500 scale-90"
                                 />
                              </div>
                           </div>
                        </CardHeader>
                        <CardContent className="p-3 space-y-4">
                           <div className="grid md:grid-cols-2 gap-3">
                              <div className="space-y-1.5 text-right">
                                 <Label className="text-[9px] font-black text-muted-foreground  opacity-70 px-1">نص الزر في المتجر</Label>
                                 <Input
                                    value={draft?.widget_button_text}
                                    onChange={(e) => setDraft(c => c ? { ...c, widget_button_text: e.target.value } : null)}
                                    className="h-9 rounded-xl bg-background border-border/60 font-bold text-[10px] text-right"
                                    placeholder="مثال: قياس افتراضي"
                                 />
                              </div>
                              <div className="space-y-1.5 text-right">
                                 <Label className="text-[9px] font-black text-muted-foreground  opacity-70 px-1">التصنيف الافتراضي</Label>
                                 <Select
                                    value={draft?.default_category}
                                    onValueChange={(val) => setDraft(c => c ? { ...c, default_category: val as TryOnCategory } : null)}
                                 >
                                    <SelectTrigger className="h-9 rounded-xl font-bold text-[10px] bg-background border-border/60">
                                       <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/40" dir="rtl">
                                       {CATEGORY_OPTIONS.map(opt => (
                                          <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-black">
                                             {opt.label}
                                          </SelectItem>
                                       ))}
                                    </SelectContent>
                                 </Select>
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </motion.div>

                  {/* Mode & Target Section */}
                  <motion.div variants={item} initial="hidden" animate="show">
                     <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-xl text-right">
                        <CardHeader className="p-3 border-b border-border/10 pb-2">
                           <CardTitle className="text-base font-black flex items-center gap-2 justify-end">
                              نطاق تفعيل الميزة
                              <Layout className="size-4 text-primary" />
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 grid sm:grid-cols-2 gap-2">
                           {MODE_OPTIONS.map((option) => (
                              <button
                                 key={option.value}
                                 onClick={() => setDraft(c => c ? { ...c, widget_mode: option.value } : null)}
                                 className={cn(
                                    "relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-right group",
                                    draft?.widget_mode === option.value
                                       ? "border-primary bg-primary/5 ring-1 ring-primary/10 shadow-sm"
                                       : "border-border/40 hover:bg-muted/30 opacity-70"
                                 )}
                              >
                                 <div className={cn(
                                    "size-8 rounded-xl flex items-center justify-center transition-colors",
                                    draft?.widget_mode === option.value ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                                 )}>
                                    {option.value === 'all' ? <Globe className="size-4" /> : <MousePointer2 className="size-4" />}
                                 </div>
                                 <div className="space-y-0.5">
                                    <p className="font-black text-xs">{option.label}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground leading-none">{option.description}</p>
                                 </div>
                                 {draft?.widget_mode === option.value && (
                                    <div className="absolute top-2 left-2 p-0.5 bg-primary rounded-full">
                                       <Check className="size-2 text-white" />
                                    </div>
                                 )}
                              </button>
                           ))}
                        </CardContent>
                     </Card>
                  </motion.div>

                  {/* Integration Snippet */}
                  {embedScript && (
                     <motion.div variants={item} initial="hidden" animate="show">
                        <Card className="border-primary/20 bg-linear-to-br from-slate-900 to-slate-950 rounded-xl overflow-hidden shadow-xl text-right">
                           <CardHeader className="p-3 border-b border-white/5 flex flex-row items-center justify-between gap-3 bg-white/5">
                              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-black text-[8px]  px-2 py-0.5 rounded-full">جاهز للربط</Badge>
                              <CardTitle className="text-base font-black flex items-center gap-2 text-white">
                                 كود الربط التقني
                                 <Code2 className="size-4 text-indigo-400" />
                              </CardTitle>
                           </CardHeader>
                           <CardContent className="p-3 space-y-3">
                              <div className="rounded-xl bg-black/40 p-4 border border-white/5 relative group overflow-hidden">
                                 <div className="absolute inset-0 bg-indigo-500/5 blur-3xl opacity-20 pointer-events-none" />
                                 <pre className="overflow-x-auto font-mono text-[9px] leading-relaxed text-indigo-200/80 scrollbar-hide relative z-10">
                                    {embedScript.script_tag}
                                 </pre>
                                 <Button
                                    onClick={handleCopy}
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 left-2 size-7 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                 >
                                    {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                                 </Button>
                              </div>

                              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5 justify-end">
                                 <span className="text-[9px] font-black text-white/40  ">معرف السحابة:</span>
                                 <span className="text-[10px] font-black text-indigo-300 font-mono tabular-nums">{embedScript.merchant_id}</span>
                                 <ShieldCheck className="size-3 text-emerald-400 opacity-50" />
                              </div>
                           </CardContent>
                        </Card>
                     </motion.div>
                  )}
               </div>

               {/* Right Sidebar */}
               <div className="space-y-3">
                  <motion.div variants={item} initial="hidden" animate="show">
                     <Card className="border-primary/10 bg-primary/2 p-3 rounded-xl relative overflow-hidden text-right border-dashed">
                        <Sparkles className="absolute -top-3 -right-3 size-12 text-primary opacity-5 rotate-12" />
                        <CardTitle className="text-[10px] font-black flex items-center gap-2 mb-3 justify-end   text-primary/60">
                           إحصائيات الإضافة
                           <Zap className="size-3 text-primary animate-pulse" />
                        </CardTitle>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-[10px] font-black p-2 bg-card rounded-xl border border-border/40">
                              <span className="text-muted-foreground font-bold">المنتجات النشطة</span>
                              <span className="text-primary tabular-nums">{draft?.widget_products.length || 0}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] font-black p-2 bg-card rounded-xl border border-border/40">
                              <span className="text-muted-foreground font-bold">زمن الاستجابة</span>
                              <span className="text-emerald-600 font-black ">40ms</span>
                           </div>
                        </div>
                     </Card>
                  </motion.div>

                  <motion.div variants={item} initial="hidden" animate="show">
                     <Card className="bg-slate-900 border-0 text-white rounded-xl shadow-xl p-0.5 overflow-hidden group">
                        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent opacity-50" />
                        <CardContent className="p-3 space-y-4 text-right relative z-10">
                           <div className="size-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <AlertCircle className="size-4 text-indigo-300" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-xs font-black">الدعم التقني</h4>
                              <p className="text-white/40 text-[9px] font-bold leading-relaxed">
                                 تواجه صعوبة في تثبيت الكود؟ فريقنا جاهز لمساعدتك في أي وقت عبر الدردشة المباشرة.
                              </p>
                           </div>
                           <Button className="w-full h-8 bg-white text-slate-900 font-black text-[10px] rounded-xl hover:bg-white/90 active:scale-95 transition-all">
                              افتح تذكرة دعم
                           </Button>
                        </CardContent>
                     </Card>
                  </motion.div>

                   <Button 
                     variant="ghost" 
                     onClick={() => navigate('/products')}
                     className="w-full text-muted-foreground hover:text-primary font-bold text-[9px] h-8 justify-end gap-2 group"
                   >
                      العودة لقائمة المنتجات
                      <ArrowLeft className="size-3 transition-transform group-hover:translate-x-1" />
                   </Button>
               </div>
            </div>
         </div>
      </TooltipProvider>
   )
}
