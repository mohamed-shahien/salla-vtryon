import { useEffect, useState } from "react"
import {
   Wallet,
   History,
   Plus,
   RefreshCcw,
   ArrowDownLeft,
   Calendar,
   ShieldCheck,
   Gem,
   Rocket,
   Zap,
   CreditCard,
   Check,
   AlertCircle,
   Clock,
   ArrowUpRight
} from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
   TooltipProvider,
} from "@/components/ui/tooltip"
import { fetchMerchantCredits, type MerchantCreditsSummary } from "@/lib/api"
import { cn } from "@/lib/utils"

function formatSignedAmount(amount: number) {
   return amount > 0 ? `+${amount}` : String(amount)
}

const TRANSACTION_TYPES: Record<string, { label: string, icon: React.ElementType, color: string }> = {
   debit: { label: "استهلاك", icon: ArrowDownLeft, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
   credit: { label: "شحن رصيد", icon: Plus, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
   refund: { label: "استرجاع", icon: RefreshCcw, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
   reset: { label: "إعادة ضبط", icon: RefreshCcw, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
}

const item = {
   hidden: { opacity: 0, y: 10 },
   show: { opacity: 1, y: 0 }
}



export function CreditsPage() {
   const [status, setStatus] = useState<"idle" | "loading" | "ready" | "failed">("idle")
   const [summary, setSummary] = useState<MerchantCreditsSummary | null>(null)
   const [error, setError] = useState<string | null>(null)
   const [refreshTick, setRefreshTick] = useState(0)
   const [limit, setLimit] = useState(20)

   useEffect(() => {
      let active = true

      async function loadCredits() {
         setStatus("loading")
         setError(null)

         try {
            const response = await fetchMerchantCredits(limit)
            if (!active) return
            setSummary(response.data)
            setStatus("ready")
         } catch (_loadError) {
            if (!active) return
            setStatus("failed")
            setError(_loadError instanceof Error ? _loadError.message : "تعذر تحميل بيانات الرصيد")
         }
      }

      void loadCredits()
      return () => { active = false }
   }, [refreshTick, limit])

   const credits = summary?.balance?.remaining_credits ?? 0
   const usedCredits = summary?.balance?.used_credits ?? 0
   const totalCredits = summary?.balance?.total_credits ?? (credits + usedCredits)
   const usagePercent = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0

   return (
      <TooltipProvider>
         <div className="space-y-4 animate-in fade-in duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-border/40 text-right">
               <div className="space-y-1">
                  <Badge variant="outline" className="text-[9px] font-black   px-2 py-0.5 bg-primary/5 text-primary border-primary/20 rounded-xl">
                     النظام المالي
                  </Badge>
                  <h1 className="text-2xl font-black  leading-tight">الرصيد والاشتراك</h1>
                  <p className="text-muted-foreground font-bold text-[10px] max-w-xl opacity-70">
                     إدارة موارد المتجر، تتبع الاستهلاك، وترقية باقتك الحالية لزيادة الإنتاجية.
                  </p>
               </div>

               <div className="flex items-center gap-2">
                  <Button
                     variant="outline"
                     onClick={() => setRefreshTick(t => t + 1)}
                     disabled={status === 'loading'}
                     className="rounded-xl font-black text-[10px] h-9 px-4 shadow-xs bg-card/50 backdrop-blur-sm"
                  >
                     <RefreshCcw className={cn("me-2 size-3.5 transition-transform", status === 'loading' && "animate-spin")} />
                     تحديث البيانات
                  </Button>
                  <Button className="rounded-xl font-black text-[10px] h-9 px-5 shadow-lg shadow-primary/20 bg-primary group overflow-hidden relative">
                     <Plus className="me-2 size-3.5" />
                     شحن الرصيد
                  </Button>
               </div>
            </div>

            {/* Main Cards Row */}
            <div className="grid gap-3 lg:grid-cols-3">
               <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-2">
                  <Card className="border-primary/20 shadow-xl bg-linear-to-br from-indigo-800 via-indigo-900 to-primary overflow-hidden relative rounded-xl text-white h-full group">
                     <div className="absolute top-[-10%] right-[-5%] opacity-10 -rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-1000">
                        <Wallet className="size-48 text-white" />
                     </div>

                     <CardHeader className="p-4 pb-2 relative z-10">
                        <div className="flex items-center justify-between">
                           <div className="space-y-0.5 text-right">
                              <CardTitle className="text-lg font-black flex items-center gap-2 justify-end">
                                 <CreditCard className="size-5 text-white/80" />
                                 ملخص المحفظة
                              </CardTitle>
                              <CardDescription className="text-white/60 text-[9px] font-black">العمليات المتاحة والمستهلكة في الدورة الحالية</CardDescription>
                           </div>
                           <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full px-3 py-0.5 font-black text-[8px]   backdrop-blur-md">
                              نشط
                           </Badge>
                        </div>
                     </CardHeader>

                     <CardContent className="p-4 pt-4 space-y-5 relative z-10">
                        <div className="grid grid-cols-3 gap-3 text-right">
                           <div className="space-y-0.5">
                              <span className="text-[8px] font-black text-white/50  ">الإجمالي</span>
                              <div className="text-xl font-black text-white ">{totalCredits.toLocaleString()}</div>
                           </div>
                           <div className="space-y-0.5">
                              <span className="text-[8px] font-black text-white/50  ">المستنفذ</span>
                              <div className="text-xl font-black text-amber-300 ">{usedCredits.toLocaleString()}</div>
                           </div>
                           <div className="space-y-0.5 bg-white/10 p-2 px-3 rounded-xl border border-white/10 backdrop-blur-sm">
                              <span className="text-[8px] font-black text-white/80  ">المتبقي</span>
                              <div className="text-2xl font-black text-emerald-300 ">{credits.toLocaleString()}</div>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between items-end flex-row-reverse text-right">
                              <span className="text-[10px] font-black">استهلاك الباقة</span>
                              <span className="text-[10px] font-black text-white/80">{Math.round(usagePercent)}%</span>
                           </div>
                           <div className="h-2 rounded-full bg-black/20 overflow-hidden ring-1 ring-white/10">
                              <motion.div
                                 initial={{ width: 0 }}
                                 animate={{ width: `${usagePercent}%` }}
                                 transition={{ duration: 1, ease: "easeOut" }}
                                 className="h-full bg-linear-to-r from-emerald-400 to-emerald-200"
                              />
                           </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/10 border border-white/5 flex items-center justify-between gap-3 text-right">
                           <div className="flex items-center gap-2 flex-row-reverse">
                              <Calendar className="size-3.5 text-white/60" />
                              <span className="text-[9px] font-bold text-white/70 truncate">
                                 التجديد القادم: <span className="text-white font-black">
                                    {summary?.balance?.reset_at
                                       ? new Date(summary.balance.reset_at).toLocaleDateString("ar-SA", { month: 'long', day: 'numeric' })
                                       : "بانتظار دورة التجديد"}
                                 </span>
                              </span>
                           </div>
                           <ShieldCheck className="size-3.5 text-emerald-400" />
                        </div>
                     </CardContent>
                  </Card>
               </motion.div>

               <motion.div variants={item} initial="hidden" animate="show">
                  <Card className="h-full border-indigo-600/20 bg-card shadow-xl overflow-hidden relative rounded-xl flex flex-col group">
                     <CardHeader className="p-4 pb-2">
                        <Badge className="bg-primary/10 text-primary border-0 font-black text-[8px]   px-2 py-0.5 rounded-full w-fit mb-2">
                           تحسين الخطة
                        </Badge>
                        <CardTitle className="text-base font-black text-right">نصيحة الخبراء</CardTitle>
                     </CardHeader>
                     <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4 text-right">
                        <p className="text-muted-foreground text-[10px] font-bold leading-relaxed">
                           بناءً على استهلاكك، الترقية لـ <span className="text-emerald-600 font-black">الباقة الاحترافية</span> ستوفر لك مزايا أكثر وتكلفة أقل لكل عملية.
                        </p>

                        <div className="space-y-2">
                           {[
                              "معالجة أسرع للصور",
                              "دعم فني خاص",
                              "تقارير متقدمة"
                           ].map((feat, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-[9px] font-black justify-end">
                                 {feat}
                                 <div className="size-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <Zap className="size-2.5" />
                                 </div>
                              </div>
                           ))}
                        </div>

                        <Button className="w-full h-9 bg-primary text-white font-black text-xs rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                           تغيير الباقة
                        </Button>
                     </CardContent>
                  </Card>
               </motion.div>
            </div>

            {/* Plans Section */}
            <div className="space-y-3 pt-2 text-right">
               <h2 className="text-lg font-black flex items-center gap-2 justify-end">
                  خطط الاشتراك المتوفرة
                  <Gem className="size-5 text-primary" />
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                     { name: "الباقة الأساسية", price: "مجاني", jobs: "50", icon: ShieldCheck, color: "bg-slate-500", active: true },
                     { name: "الباقة الاحترافية", price: "99 ريال", jobs: "500", icon: Rocket, color: "bg-primary", premium: true },
                     { name: "الباقة اللامحدودة", price: "249 ريال", jobs: "∞", icon: Gem, color: "bg-indigo-600" },
                  ].map((plan, i) => (
                     <Card key={i} className={cn(
                        "border-border/40 hover:border-primary/40 transition-all duration-300 rounded-xl overflow-hidden group",
                        plan.premium && "ring-1 ring-primary ring-offset-2"
                     )}>
                        <CardHeader className="p-3 pb-2 text-center">
                           <div className={cn("size-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-white shadow-md", plan.color)}>
                              <plan.icon className="size-5" />
                           </div>
                           <CardTitle className="text-sm font-black">{plan.name}</CardTitle>
                           <div className="mt-1 text-xl font-black ">{plan.price} <span className="text-[9px] text-muted-foreground font-bold">/شهرياً</span></div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2 text-right">
                           <ul className="space-y-1.5">
                              {[
                                 `${plan.jobs} عملية قياس`,
                                 "دعم فني قياسي",
                                 "تكامل مع سلة"
                              ].map((item, idx) => (
                                 <li key={idx} className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground justify-end">
                                    {item} <Check className="size-3 text-emerald-500" />
                                 </li>
                              ))}
                           </ul>
                        </CardContent>
                        <CardFooter className="p-3 pt-0">
                           <Button disabled={plan.active} variant={plan.active ? "secondary" : plan.premium ? "default" : "outline"} className="w-full h-8 rounded-xl font-black text-[10px]">
                              {plan.active ? "الخطة الحالية" : "اختيار الباقة"}
                           </Button>
                        </CardFooter>
                     </Card>
                  ))}
               </div>
            </div>

            {/* Transactions Ledger */}
            <motion.div variants={item} initial="hidden" animate="show" className="space-y-3 pt-2">
               <Card className="border-border/40 shadow-xl bg-card/60 backdrop-blur-md rounded-xl overflow-hidden">
                  <CardHeader className="p-3 border-b border-border/10 flex flex-row items-center justify-between gap-3 text-right">
                     <div className="space-y-0.5">
                        <CardTitle className="text-base font-black flex items-center gap-2 justify-end">
                           سجل الحركات المالية
                           <History className="size-5 text-primary" />
                        </CardTitle>
                        <p className="text-[9px] font-bold text-muted-foreground opacity-60">كشف حساب مفصل لجميع العمليات</p>
                     </div>
                     <Button variant="outline" size="sm" className="rounded-xl h-8 px-4 font-black text-[9px] bg-background">
                        تصدير (CSV)
                     </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                     {status === "loading" ? (
                        <div className="p-3 space-y-3">
                           {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="flex items-center justify-between gap-3">
                                 <Skeleton className="size-10 rounded-xl" />
                                 <div className="space-y-1 flex-1">
                                    <Skeleton className="h-4 w-1/4 rounded-xl" />
                                    <Skeleton className="h-3 w-1/5 rounded-xl" />
                                 </div>
                                 <Skeleton className="h-5 w-16 rounded-full" />
                              </div>
                           ))}
                        </div>
                     ) : error ? (
                        <div className="p-10 text-center flex flex-col items-center gap-3">
                           <AlertCircle className="size-10 text-destructive mb-1 opacity-50" />
                           <p className="text-[10px] font-black text-destructive">{error}</p>
                           <Button onClick={() => setRefreshTick(t => t + 1)} variant="outline" className="rounded-xl font-black h-8 text-[10px] px-5 mt-1">إعادة المحاولة</Button>
                        </div>
                     ) : !summary?.transactions.length ? (
                        <div className="p-16 text-center flex flex-col items-center gap-3 opacity-40">
                           <History className="size-12 text-muted-foreground mb-1 opacity-30" />
                           <p className="text-[10px] font-black">لا توجد حركات مسجلة</p>
                        </div>
                     ) : (
                        <>
                           <div className="divide-y divide-border/20">
                              {summary.transactions.map((transaction) => {
                                 const typeInfo = TRANSACTION_TYPES[transaction.type] || { label: transaction.type, icon: History, color: "text-muted-foreground bg-muted border-border" }
                                 const Icon = typeInfo.icon

                                 return (
                                    <div key={transaction.id} className="group p-3 px-4 hover:bg-primary/5 transition-all flex items-center justify-between gap-3 text-right">
                                       <div className="flex items-center gap-4 flex-row-reverse">
                                          <div className={cn("size-10 rounded-xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-105", typeInfo.color)}>
                                             <Icon className="size-4" />
                                          </div>
                                          <div className="space-y-0.5">
                                             <div className="flex items-center gap-2 justify-end">
                                                <Badge variant="outline" className="text-[8px] font-black py-0 px-1 border-0 bg-muted/50 text-muted-foreground rounded-md opacity-60">
                                                   #{transaction.id.slice(0, 6).toUpperCase()}
                                                </Badge>
                                                <span className="text-xs font-black text-foreground truncate max-w-[120px]">{transaction.reason || typeInfo.label}</span>
                                             </div>
                                             <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-black  justify-end opacity-60">
                                                <div className="flex items-center gap-1.5 flex-row-reverse">
                                                   <Calendar className="size-3" />
                                                   {new Date(transaction.created_at).toLocaleString("ar-SA", { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-row-reverse">
                                                   <Clock className="size-3" />
                                                   {new Date(transaction.created_at).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="flex items-center gap-4">
                                          <div className="flex flex-col items-end">
                                             <div className={cn(
                                                "text-sm font-black  tabular-nums",
                                                transaction.amount > 0 ? "text-emerald-600" : "text-amber-600"
                                             )}>
                                                {formatSignedAmount(transaction.amount)}
                                             </div>
                                          </div>
                                          <ArrowUpRight className="size-4 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                                       </div>
                                    </div>
                                 )
                              })}
                           </div>

                           {/* Pagination / Load More */}
                           <div className="p-3 border-t border-border/10 flex justify-center">
                              <Button
                                 variant="ghost"
                                 className="text-[10px] font-black h-8 hover:bg-muted/50 rounded-xl px-10"
                                 onClick={() => setLimit(prev => prev + 20)}
                              >
                                 مشاهدة المزيد من العمليات
                              </Button>
                           </div>
                        </>
                     )}
                  </CardContent>
               </Card>
            </motion.div>
         </div>
      </TooltipProvider>
   )
}
