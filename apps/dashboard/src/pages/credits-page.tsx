import { useEffect, useState } from "react"
import {
   Wallet,
   CreditCard,
   History,
   ArrowUpRight,
   ArrowDownLeft,
   RefreshCcw,
   Plus,
   Calendar,
   AlertCircle,
   TrendingUp,
} from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchMerchantCredits, type MerchantCreditsSummary } from "@/lib/api"
import { cn } from "@/lib/utils"

function formatSignedAmount(amount: number) {
   return amount > 0 ? `+${amount}` : String(amount)
}

const TRANSACTION_TYPES: Record<string, { label: string, icon: React.ElementType, color: string }> = {
   debit: { label: "استهلاك", icon: ArrowDownLeft, color: "text-amber-500 bg-amber-50" },
   credit: { label: "شحن رصيد", icon: Plus, color: "text-emerald-500 bg-emerald-50" },
   refund: { label: "استرجاع", icon: RefreshCcw, color: "text-blue-500 bg-blue-50" },
   reset: { label: "إعادة ضبط", icon: RefreshCcw, color: "text-purple-500 bg-purple-50" },
}

export function CreditsPage() {
   const [status, setStatus] = useState<"idle" | "loading" | "ready" | "failed">("idle")
   const [summary, setSummary] = useState<MerchantCreditsSummary | null>(null)
   const [error, setError] = useState<string | null>(null)
   const [refreshTick, setRefreshTick] = useState(0)

   useEffect(() => {
      let active = true

      async function loadCredits() {
         setStatus("loading")
         setError(null)

         try {
            const response = await fetchMerchantCredits(30)
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
   }, [refreshTick])

   const credits = summary?.balance?.remaining_credits ?? 0
   const usedCredits = summary?.balance?.used_credits ?? 0
   const totalCredits = summary?.balance?.total_credits ?? (credits + usedCredits)
   const usagePercent = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0

   const item = {
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0 }
   }

   return (
      <div className="space-y-3 animate-in fade-in duration-700 pb-20">
         
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-border/40">
            <div className="space-y-1">
               <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/5 text-primary border-primary/20 rounded-lg">
                  النظام المالي
               </Badge>
               <h1 className="text-2xl font-black tracking-tight leading-tight">الرصيد والاشتراك</h1>
               <p className="text-muted-foreground font-medium text-xs max-w-xl text-right">
                  إدارة رصيد العمليات، مراجعة الفواتير، والتحكم في باقة الاشتراك.
               </p>
            </div>

            <div className="flex items-center gap-3">
               <Button
                  variant="outline"
                  onClick={() => setRefreshTick(t => t + 1)}
                  className="rounded-lg font-black text-xs h-10 px-4 shadow-xs"
               >
                  <RefreshCcw className={cn("me-2 size-4", status === 'loading' && "animate-spin")} />
                  تحديث
               </Button>
               <Button className="rounded-lg font-black text-xs h-10 px-4 shadow-lg shadow-primary/20 bg-primary">
                  <Plus className="me-2 size-4" />
                  شحن رصيد
               </Button>
            </div>
         </div>

         
         <div className="grid gap-3 lg:grid-cols-3">
            <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-2">
               <Card className="border-primary/20 shadow-sm bg-linear-to-br from-card to-primary/2 overflow-hidden relative rounded-lg">
                  <div className="absolute top-[-20%] right-[-10%] opacity-5 -rotate-12 pointer-events-none">
                     <Wallet className="size-40 text-primary" />
                  </div>
                  <CardHeader className="p-3 pb-4">
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                           <CardTitle className="text-xl font-black flex items-center gap-3">
                              <CreditCard className="size-5 text-primary" />
                              ملخص الرصيد
                           </CardTitle>
                           <CardDescription className="text-xs font-medium">استهلاك العمليات في باقتك الحالية</CardDescription>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 rounded-lg px-2 py-0.5 font-black text-[9px] uppercase tracking-widest border">
                           الخطة نشطة
                        </Badge>
                     </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-4 space-y-3">
                     <div className="grid sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                           <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">إجمالي الرصيد</span>
                           <div className="text-3xl font-black text-foreground tracking-tighter">{totalCredits.toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">المستهلك</span>
                           <div className="text-3xl font-black text-amber-500 tracking-tighter">{usedCredits.toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[9px] font-black text-primary uppercase tracking-widest block">المتبقي حالياً</span>
                           <div className="text-3xl font-black text-primary tracking-tighter">{credits.toLocaleString()}</div>
                        </div>
                     </div>

                     <div className="space-y-3 relative z-10">
                        <div className="flex justify-between items-end">
                           <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-black">نسبة الاستهلاك</span>
                              <span className="text-[10px] font-bold text-muted-foreground">استهلكت {usagePercent.toFixed(1)}% من رصيدك</span>
                           </div>
                           <span className="text-base font-black text-primary">{Math.round(usagePercent)}%</span>
                        </div>
                        <Progress value={usagePercent} className="h-2 rounded-full bg-primary/10" />
                     </div>

                     <div className="p-2 rounded-lg bg-muted/40 border border-border/40 flex items-center gap-3 relative z-10">
                        <Calendar className="size-4 text-muted-foreground" />
                        <div className="flex-1 text-[10px] font-bold text-muted-foreground">
                           تاريخ التجديد القادم: <span className="text-foreground font-black">
                              {summary?.balance?.reset_at
                                 ? new Date(summary.balance.reset_at).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' })
                                 : "غير محدد"}
                           </span>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </motion.div>

            <motion.div variants={item} initial="hidden" animate="show">
               <Card className="h-full border-indigo-600/20 bg-indigo-600 shadow-lg text-white overflow-hidden relative rounded-lg">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                     <TrendingUp className="size-24 text-white" />
                  </div>
                  <CardContent className="p-3 flex flex-col h-full justify-between space-y-3">
                     <div className="space-y-3">
                        <Badge className="bg-white/10 text-white border-0 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 backdrop-blur-md rounded-lg">
                           ترقية مقترحة
                        </Badge>
                        <h3 className="text-lg font-black leading-tight">هل تحتاج للمزيد؟</h3>
                        <p className="text-indigo-100/70 text-[11px] font-medium leading-relaxed">
                           بناءً على نشاط متجرك، قد تحتاج لشحن رصيد إضافي لضمان استمرار الخدمة.
                        </p>
                     </div>

                     <div className="space-y-2">
                        <Button className="w-full h-10 bg-white text-indigo-950 font-black text-xs hover:bg-white/90 rounded-lg shadow-md active:scale-95 transition-all">
                           ترقية الخطة
                        </Button>
                        <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10 font-bold text-[10px] uppercase tracking-widest h-8">
                           عرض الباقات
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </motion.div>
         </div>

         
         <motion.div variants={item} initial="hidden" animate="show" className="space-y-3">
            <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm rounded-lg overflow-hidden border-b-primary/20">
               <CardHeader className="p-3 border-b border-border/10">
                  <CardTitle className="text-sm font-black flex items-center gap-2">
                     <History className="size-4 text-primary" />
                     سجل الشحن
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="flex items-center justify-between p-3">
                     <p className="text-xs font-medium text-muted-foreground">كشف حساب مفصل لحركات الرصيد</p>
                     <Button variant="outline" size="sm" className="rounded-lg h-9 px-3 font-black text-[10px] uppercase tracking-widest">
                        تحميل (Excel)
                     </Button>
                  </div>

                  {status === "loading" ? (
                     <div className="p-3 space-y-3">
                        {[1, 2, 3].map((i) => (
                           <div key={i} className="flex items-center justify-between gap-3">
                              <Skeleton className="size-10 rounded-lg" />
                              <div className="space-y-2 flex-1">
                                 <Skeleton className="h-4 w-1/3" />
                                 <Skeleton className="h-3 w-1/4" />
                              </div>
                              <Skeleton className="h-5 w-16 rounded-full" />
                           </div>
                        ))}
                     </div>
                  ) : error ? (
                     <div className="p-6 text-center flex flex-col items-center gap-3">
                        <AlertCircle className="size-8 text-destructive mb-1" />
                        <p className="text-xs font-black text-destructive">{error}</p>
                        <Button onClick={() => setRefreshTick(t => t + 1)} variant="outline" className="rounded-lg font-bold h-8 text-[11px] mt-2">إعادة المحاولة</Button>
                     </div>
                  ) : !summary?.transactions.length ? (
                     <div className="p-12 text-center flex flex-col items-center gap-2 opacity-30">
                        <History className="size-10 text-muted-foreground mb-1" />
                        <p className="text-xs font-black">لا توجد معاملات بعد</p>
                     </div>
                  ) : (
                     <div className="divide-y divide-border/20">
                        {summary.transactions.map((transaction) => {
                           const typeInfo = TRANSACTION_TYPES[transaction.type] || { label: transaction.type, icon: History, color: "text-muted-foreground bg-muted" }
                           const Icon = typeInfo.icon

                           return (
                              <div key={transaction.id} className="group p-3 hover:bg-muted/5 transition-all flex items-center justify-between gap-3 text-right">
                                 <div className="flex items-center gap-3">
                                    <div className={cn("size-10 rounded-lg flex items-center justify-center", typeInfo.color)}>
                                       <Icon className="size-4.5" />
                                    </div>
                                    <div className="space-y-0.5">
                                       <div className="flex items-center gap-3">
                                          <span className="text-xs font-black text-foreground">{transaction.reason || typeInfo.label}</span>
                                          <Badge variant="outline" className="text-[8px] font-black py-0 px-1 border-0 bg-muted/20 text-muted-foreground">
                                             {transaction.id.slice(0, 8)}
                                          </Badge>
                                       </div>
                                       <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                                          <Calendar className="size-3" />
                                          {new Date(transaction.created_at).toLocaleString("ar-SA", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end">
                                       <div className={cn(
                                          "text-sm font-black tracking-tight",
                                          transaction.amount > 0 ? "text-emerald-600" : "text-amber-600"
                                       )}>
                                          {formatSignedAmount(transaction.amount)}
                                       </div>
                                       <span className="text-[8px] font-black text-muted-foreground uppercase opacity-60">عملية</span>
                                    </div>
                                    <ArrowUpRight className="size-3.5 text-muted-foreground/30" />
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  )}
               </CardContent>
            </Card>
         </motion.div>
      </div>
   )
}
