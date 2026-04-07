import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
   Monitor,
   Check,
   Save,
   ShieldCheck,
   Globe,
   Layout,
   MousePointer2,
   Loader2,
   Terminal,
   Settings2,
   AlertCircle,
   User,
} from "lucide-react"
import { motion } from "framer-motion"
import {
   Code,
   CodeHeader,
   CodeBlock,
} from "@/components/animate-ui/components/animate/code"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
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
import { fetchCurrentMerchant, fetchEmbedScript, fetchWidgetSettings, updateWidgetSettings, type EmbedScriptData, type MerchantWidgetSettings, type TryOnCategory, type WidgetMode } from "@/lib/api"
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

   // Profile states
   const identity = useAuthStore((state) => state.identity)

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
            <p className="text-[10px] font-black text-muted-foreground">تجهيز الإعدادات المتقدمة...</p>
         </div>
      )
   }

   const draftChanged = JSON.stringify(draft) !== JSON.stringify(settings)

   return (
      <TooltipProvider>
         <div className="space-y-4 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
               <div className="space-y-1">
                  <h1 className="text-2xl font-black tracking-tight">الإعدادات والربط</h1>
                  <p className="text-muted-foreground font-medium text-xs opacity-80">
                     إدارة خصائص العرض الفني، معلومات المتجر، وأدوات الربط البرمجي.
                  </p>
               </div>

               <div className="flex items-center gap-3">
                  <Button
                     onClick={() => void handleSave()}
                     disabled={!draftChanged || saveStatus === 'saving'}
                     className="rounded-lg font-black text-xs h-11 px-6 shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                     {saveStatus === 'saving' ? <Loader2 className="me-2 size-4 animate-spin" /> : <Save className="me-2 size-4" />}
                     {saveStatus === 'saving' ? "جاري الحفظ..." : "حفظ الإعدادات"}
                  </Button>
               </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
               <div className="lg:col-span-2 space-y-3">
                  {/* General Configuration */}
                  <motion.div variants={item} initial="hidden" animate="show">
                     <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
                        <CardHeader className="p-3 border-b border-border/10">
                           <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                 <CardTitle className="text-base font-black flex items-center gap-2 justify-end">
                                    حالة العرض العام
                                    <Monitor className="size-4 text-primary" />
                                 </CardTitle>
                                 <CardDescription className="text-[9px] font-black opacity-60">تفعيل أو تعطيل الإضافة تماماً من المتجر</CardDescription>
                              </div>
                              <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
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
                                 <Label className="text-[9px] font-black text-muted-foreground opacity-70 px-1">نص الزر في المتجر</Label>
                                 <Input
                                    value={draft?.widget_button_text}
                                    onChange={(e) => setDraft(c => c ? { ...c, widget_button_text: e.target.value } : null)}
                                    className="h-9 rounded-lg bg-background border-border/60 font-bold text-[10px] text-right"
                                    placeholder="مثال: قياس افتراضي"
                                 />
                              </div>
                              <div className="space-y-1.5 text-right">
                                 <Label className="text-[9px] font-black text-muted-foreground opacity-70 px-1">التصنيف الافتراضي</Label>
                                 <Select
                                    value={draft?.default_category}
                                    onValueChange={(val) => setDraft(c => c ? { ...c, default_category: val as TryOnCategory } : null)}
                                 >
                                    <SelectTrigger className="h-9 rounded-lg font-bold text-[10px] bg-background border-border/60">
                                       <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-border/40" dir="rtl">
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
                     <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
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
                                    "relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 text-right group",
                                    draft?.widget_mode === option.value
                                       ? "border-primary bg-primary/5 ring-1 ring-primary/10 shadow-sm"
                                       : "border-border/40 hover:bg-muted/30 opacity-70"
                                 )}
                              >
                                 <div className={cn(
                                    "size-8 rounded-lg flex items-center justify-center transition-colors",
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
                     <motion.div variants={item} initial="hidden" animate="show" className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                           <Terminal className="size-4 text-primary" />
                           <h3 className="font-black text-sm">كود الربط التقني</h3>
                        </div>
                        <Card className="border-border/40 shadow-2xl bg-card/40 backdrop-blur-2xl rounded-lg overflow-hidden text-left" dir="ltr">
                           <Code code={embedScript.script_tag} className="border-none bg-transparent">
                              <CodeHeader copyButton icon={Settings2} className="bg-muted/50 border-border/20 text-[10px] font-bold">
                                 Integration Script (Salla Storefront)
                              </CodeHeader>
                              <CodeBlock lang="html" className="text-xs p-6" />
                           </Code>
                        </Card>

                        <div className="flex items-center justify-between px-4 py-3 bg-primary/5 rounded-lg border border-primary/10">
                           <div className="flex items-center gap-2">
                              <ShieldCheck className="size-4 text-emerald-500" />
                              <span className="text-[10px] font-black text-foreground/70">معرف السحابة الآمنة:</span>
                           </div>
                           <span className="text-xs font-black text-primary font-mono select-all">
                              {embedScript.merchant_id}
                           </span>
                        </div>
                     </motion.div>
                  )}
               </div>

               {/* Right Sidebar - General Info */}
               <div className="space-y-4">
                  <Card className="border-border/40 shadow-sm bg-card/60 rounded-lg overflow-hidden">
                     <div className="p-5 space-y-4">
                        <div className="flex justify-center">
                           <div className="size-20 rounded-lg bg-primary/20 flex items-center justify-center border-4 border-background shadow-inner">
                              <User className="size-10 text-primary" />
                           </div>
                        </div>
                        <div className="text-center space-y-1">
                           <h3 className="font-black text-sm">{identity?.user?.full_name}</h3>
                           <p className="text-[10px] font-bold text-muted-foreground">{identity?.user?.email}</p>
                        </div>
                     </div>
                     <div className="px-3 pb-3">
                        <Button
                           variant="secondary"
                           onClick={() => navigate('/profile')}
                           className="w-full h-10 rounded-lg font-black text-[10px] gap-2 border border-border/40"
                        >
                           <Settings2 className="size-3.5" />
                           إدارة الحساب الشخصي
                        </Button>
                     </div>
                  </Card>

                  <Card className="border-border/40 shadow-sm bg-muted/20 rounded-lg p-5 space-y-2">
                     <div className="flex items-center gap-2 text-primary">
                        <AlertCircle className="size-4" />
                        <h4 className="text-[10px] font-black">تحتاج مساعدة؟</h4>
                     </div>
                     <p className="text-[10px] leading-relaxed font-bold text-muted-foreground">
                        إذا كنت تواجه صعوبة في دمج الكود في متجرك، يمكنك دائماً التواصل مع فريق الدعم الفني الخاص بنا.
                     </p>
                  </Card>
               </div>
            </div>
         </div>
      </TooltipProvider>
   )
}
