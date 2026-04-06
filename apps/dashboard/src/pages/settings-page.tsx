import { useEffect, useRef, useState } from "react"
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
   CheckCircle2,
   AlertCircle,
   Loader2,
   Sparkles
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
      description: 'جميع المنتجات المتوافقة تلقائياً.',
   },
   {
      value: 'selected',
      label: 'محدد',
      description: 'المنتجات المختارة يدوياً فقط.',
   },
]

export function SettingsPage() {
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
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs font-black text-muted-foreground animate-pulse uppercase tracking-widest">تحميل الإعدادات...</p>
         </div>
      )
   }

   const draftChanged = JSON.stringify(draft) !== JSON.stringify(settings)
   const item = { hidden: { opacity: 0, y: 5 }, show: { opacity: 1, y: 0 } }

   return (
      <div className="space-y-3 animate-in fade-in duration-700 pb-20">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-border/40">
            <div className="space-y-1">
               <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/5 text-primary border-primary/20 rounded-lg">
                  الإعدادات
               </Badge>
               <h1 className="text-2xl font-black tracking-tight leading-tight">تخصيص الواجهة</h1>
               <p className="text-muted-foreground font-medium text-xs max-w-xl text-right">تعرف على مظهر الإضافة في متجرك وتحكم في خياراتها.</p>
            </div>

            <Button
               onClick={() => void handleSave()}
               disabled={!draftChanged || saveStatus === 'saving'}
               className="rounded-lg font-black text-xs h-10 px-4 shadow-lg shadow-primary/20 bg-primary"
            >
               {saveStatus === 'saving' ? <Loader2 className="me-2 size-4 animate-spin" /> : <Save className="me-2 size-4" />}
               حفظ التغييرات
            </Button>
         </div>

         <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
               {/* General Settings */}
               <motion.div variants={item} initial="hidden" animate="show">
                  <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm rounded-lg">
                     <CardHeader className="p-3 border-b border-border/10">
                        <div className="flex items-center justify-between">
                           <div className="space-y-0.5 text-right">
                              <CardTitle className="text-xl font-black flex items-center gap-3">
                                 <Monitor className="size-5 text-primary" />
                                 تفعيل الميزة
                              </CardTitle>
                              <CardDescription className="text-[11px] font-medium">حالة الظهور في المتجر</CardDescription>
                           </div>
                           <div className="flex items-center gap-3 bg-muted/20 px-3 py-2 rounded-lg border border-border/40">
                              <span className={cn("text-[10px] font-black transition-all", draft?.widget_enabled ? "text-emerald-600" : "text-muted-foreground")}>
                                 {draft?.widget_enabled ? "نشط" : "معطل"}
                              </span>
                              <Switch
                                 checked={draft?.widget_enabled}
                                 onCheckedChange={(val) => setDraft(c => c ? { ...c, widget_enabled: val } : null)}
                              />
                           </div>
                        </div>
                     </CardHeader>
                     <CardContent className="p-3 space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                           <div className="space-y-1.5 text-right">
                              <Label className="text-[10px] font-black text-muted-foreground uppercase px-1">نص زر القياس</Label>
                              <Input
                                 value={draft?.widget_button_text}
                                 onChange={(e) => setDraft(c => c ? { ...c, widget_button_text: e.target.value } : null)}
                                 className="h-10 rounded-lg bg-background border-border/60 font-bold text-xs"
                              />
                           </div>
                           <div className="space-y-1.5 text-right">
                              <Label className="text-[10px] font-black text-muted-foreground uppercase px-1">التصنيف الافتراضي</Label>
                              <Select
                                 value={draft?.default_category}
                                 onValueChange={(val) => setDraft(c => c ? { ...c, default_category: val as TryOnCategory } : null)}
                              >
                                 <SelectTrigger className="h-10 rounded-lg font-bold text-xs bg-background">
                                    <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent className="rounded-lg" dir="rtl">
                                    {CATEGORY_OPTIONS.map(opt => (
                                       <SelectItem key={opt.value} value={opt.value} className="text-xs font-bold">
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

               {/* Mode Selection */}
               <motion.div variants={item} initial="hidden" animate="show">
                  <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm rounded-lg">
                     <CardHeader className="p-3">
                        <CardTitle className="text-xl font-black flex items-center gap-3">
                           <Layout className="size-5 text-primary" />
                           نطاق التفعيل
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-3 pt-0 grid sm:grid-cols-2 gap-3">
                        {MODE_OPTIONS.map((option) => (
                           <button
                              key={option.value}
                              onClick={() => setDraft(c => c ? { ...c, widget_mode: option.value } : null)}
                              className={cn(
                                 "relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-right",
                                 draft?.widget_mode === option.value ? "border-primary bg-primary/5" : "border-border/40 hover:bg-muted/5"
                              )}
                           >
                              <div className={cn(
                                 "size-8 rounded-lg flex items-center justify-center",
                                 draft?.widget_mode === option.value ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                              )}>
                                 {option.value === 'all' ? <Globe className="size-4" /> : <MousePointer2 className="size-4" />}
                              </div>
                              <div className="space-y-0.5">
                                 <p className="font-black text-sm">{option.label}</p>
                                 <p className="text-[10px] font-medium text-muted-foreground">{option.description}</p>
                              </div>
                              {draft?.widget_mode === option.value && <CheckCircle2 className="absolute top-2 left-2 size-4 text-primary" />}
                           </button>
                        ))}
                     </CardContent>
                  </Card>
               </motion.div>

               {/* Embed Script */}
               {embedScript && (
                  <motion.div variants={item} initial="hidden" animate="show">
                     <Card className="border-indigo-600/20 bg-indigo-50/5 rounded-lg overflow-hidden">
                        <CardHeader className="p-3 bg-indigo-600 text-white text-right">
                           <CardTitle className="text-xl font-black flex items-center gap-3">
                              <Code2 className="size-5" />
                              كود الربط
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3">
                           <div className="rounded-lg bg-slate-900 p-4 border border-slate-800 relative group">
                              <pre className="overflow-x-auto font-mono text-[9px] leading-relaxed text-indigo-300">
                                 {embedScript.script_tag}
                              </pre>
                              <Button
                                 onClick={handleCopy}
                                 variant="secondary"
                                 className="absolute top-2 left-2 size-8 rounded-lg bg-white/10 hover:bg-white/20 text-white border-0 shadow-lg"
                              >
                                 {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                              </Button>
                           </div>
                           <div className="p-2 rounded-lg bg-indigo-600/5 border border-indigo-600/10 flex items-center gap-3">
                              <ShieldCheck className="size-4 text-indigo-600 shrink-0" />
                              <p className="text-[10px] font-bold text-indigo-900 leading-none">معرف المتجر: <span className="font-black">{embedScript.merchant_id}</span></p>
                           </div>
                        </CardContent>
                     </Card>
                  </motion.div>
               )}
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-3">
               <motion.div variants={item} initial="hidden" animate="show">
                  <Card className="border-primary/20 bg-primary/3 p-3 rounded-lg relative overflow-hidden">
                     <Sparkles className="absolute -top-4 -right-4 size-16 text-primary opacity-5 rotate-12" />
                     <CardTitle className="text-sm font-black flex items-center gap-3 mb-4">
                        <Zap className="size-4 text-primary" />
                        نطاق القياس
                     </CardTitle>
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-[11px] font-bold p-2 bg-white/50 rounded-lg border border-border/10">
                           <span className="text-muted-foreground">المنتجات المختارة</span>
                           <span className="font-black text-primary">{draft?.widget_products.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold p-2 bg-white/50 rounded-lg border border-border/10">
                           <span className="text-muted-foreground">حالة الملحق</span>
                           <span className="font-black text-emerald-600">يعمل بكفاءة</span>
                        </div>
                     </div>
                  </Card>
               </motion.div>

               <motion.div variants={item} initial="hidden" animate="show">
                  <Card className="bg-slate-900 border-none text-white rounded-lg shadow-lg">
                     <CardContent className="p-3 space-y-3 text-right">
                        <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center">
                           <AlertCircle className="size-5 text-indigo-300" />
                        </div>
                        <div className="space-y-1">
                           <h4 className="text-sm font-black">تحتاج مساعدة؟</h4>
                           <p className="text-white/50 text-[10px] leading-relaxed">تواصل مع الدعم الفني لمساعدتك في تثبيت كود الربط بمتجرك.</p>
                        </div>
                        <Button className="w-full h-9 bg-white text-slate-900 font-black text-xs hover:bg-white/90 rounded-lg">
                           مركز المساعدة
                        </Button>
                     </CardContent>
                  </Card>
               </motion.div>
            </div>
         </div>
      </div>
   )
}
