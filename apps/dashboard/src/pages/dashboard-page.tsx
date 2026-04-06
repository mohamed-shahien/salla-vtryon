import {
  Plus,
  Sparkles,
  CreditCard,
  Zap,
  Clock,
  Package,
  TrendingUp,
  Activity,
  History,
  ArrowUpRight,
  ShoppingCart,
  UserCheck,
  Wallet,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores/auth-store"
import { useMerchantJobs } from "@/hooks/use-merchant-jobs"
import { cn } from "@/lib/utils"

export function DashboardPage() {
  const identity = useAuthStore((state) => state.identity)
  const { jobs, loading: jobsLoading } = useMerchantJobs(5)

  const merchantName = identity?.salla_profile?.merchant?.name || "عزيزي التاجر"
  const credits = identity?.credits?.remaining_credits ?? 0
  const usedCredits = identity?.credits?.used_credits ?? 0
  const totalCredits = identity?.credits?.total_credits ?? (credits + usedCredits)
  const creditUsagePercent = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  const statCards = [
    {
      label: "عمليات التجربة",
      value: usedCredits.toLocaleString(),
      trend: "+12.5%",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "الرصيد المتبقي",
      value: credits.toLocaleString(),
      trend: "نشط الآن",
      icon: Wallet,
      color: "text-emerald-700",
      bg: "bg-emerald-50"
    },
    {
      label: "طلبات الشراء",
      value: "84",
      trend: "+5 جـدد",
      icon: ShoppingCart,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      label: "معدل التحويل",
      value: "4.2%",
      trend: "+0.8%",
      icon: UserCheck,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3 pb-3"
    >
      {/* Welcome Hero Section */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-lg bg-linear-to-br from-indigo-950 via-slate-900 to-primary p-6 text-white shadow-2xl">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-right">
            <div className="space-y-3">
              <Badge variant="secondary" className="bg-white/10 text-white backdrop-blur-md border-0 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest leading-none">
                <Sparkles className="me-2 size-3.5 inline text-amber-400" />
                أهـلاً بك في مستقبل التجارة الإلكترونية
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  طـورت مبيعاتك، {merchantName}
                </h1>
                <p className="text-indigo-100/70 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
                  استخدم تقنيات الذكاء الاصطناعي لتقليل نسبة المرتجعات وزيادة ثقة عملائك عبر ميزة القياس الافتراضي.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-6 rounded-lg bg-white text-indigo-950 hover:bg-indigo-50 text-sm font-black shadow-xl hover:scale-105 transition-all">
                <Link to="/products">
                  ابدأ تفعيل المنتجات
                  <Zap className="ms-3 size-4 text-amber-500 fill-amber-500" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-6 rounded-lg border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 text-sm font-black">
                دليل الاستخدام
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 border-border/40 group rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 text-right">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                  {stat.label}
                </CardTitle>
                <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm", stat.bg, stat.color)}>
                  <stat.icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 p-3 text-right">
                <div className="text-2xl font-black tracking-tighter text-foreground">{stat.value}</div>
                <div className="mt-2 flex items-center justify-end gap-3">
                  <span className="text-[9px] text-muted-foreground font-bold order-2">مقارنة بالشهر الماضي</span>
                  <Badge variant={stat.trend.includes("+") ? "default" : "secondary"} className={cn(
                    "text-[9px] font-black py-0.5 px-2 rounded-full order-1",
                    stat.trend.includes("+") ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground"
                  )}>
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Recent Activity Section */}
        <motion.div variants={item} className="lg:col-span-2 space-y-3">
          <Card className="border-border/40 shadow-sm overflow-hidden min-h-[400px] rounded-lg">
            <CardHeader className="border-b border-border/30 bg-muted/5 p-3 text-right">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base font-black flex items-center gap-3">
                    <History className="size-4 text-primary" />
                    أحدث عمليات القياس
                  </CardTitle>
                  <CardDescription className="text-[10px] font-medium leading-none">أحدث 5 محاولات قياس افتراضي قام بها عملاؤك</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-lg h-8 font-black text-[9px] uppercase tracking-widest gap-3 bg-background shadow-xs px-3">
                  <Link to="/jobs">
                    عرض الكل
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {jobsLoading ? (
                <div className="p-3 space-y-3">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-lg" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-[40%]" />
                        <Skeleton className="h-3 w-[20%]" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 px-3">
                  <div className="size-12 rounded-full bg-muted/30 flex items-center justify-center">
                    <Package className="size-6 text-muted-foreground opacity-40" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-base">لا توجد عمليات قياس بعد</h3>
                    <p className="text-muted-foreground text-[10px] max-w-xs mx-auto">عندما يبدأ عملاؤك في استخدام ميزة القياس الافتراضي، ستظهر النتائج هنا.</p>
                  </div>
                  <Button asChild variant="link" className="text-primary font-black h-auto p-0 text-xs">
                    <Link to="/products">قم بتفعيل المنتجات الآن</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/20">
                  {jobs.map((job) => (
                    <div key={job.id} className="group relative flex items-center justify-between p-3 hover:bg-muted/10 transition-all cursor-default text-right">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={job.person_image_url || job.garment_image_url}
                            alt="Product"
                            className="size-10 rounded-lg object-cover border border-border shadow-xs"
                          />
                          <div className={cn(
                            "absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white flex items-center justify-center text-white",
                            job.status === 'completed' ? "bg-emerald-500" : job.status === 'failed' ? "bg-destructive" : "bg-amber-500"
                          )}>
                            {job.status === 'completed' ? (
                              <CheckCircle2 className="size-2" />
                            ) : job.status === 'failed' ? (
                              <XCircle className="size-2" />
                            ) : (
                              <Loader2 className="size-2 animate-spin" />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-foreground">المنتج: #{job.product_id?.toString().slice(-6) || "مجهول"}</span>
                            {job.category && (
                              <Badge variant="outline" className="text-[8px] font-black py-0 px-1.5 uppercase opacity-60 rounded-lg">
                                {job.category === 'upper_body' ? 'علوي' : job.category === 'lower_body' ? 'سفلي' : 'فستان'}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold leading-tight">
                            <Clock className="size-3" />
                            <span>{new Date(job.created_at).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end gap-1">
                          <span className={cn(
                            "text-[9px] font-black px-2 py-0.5 rounded-full",
                            job.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                              job.status === 'failed' ? "bg-destructive/10 text-destructive" :
                                "bg-amber-100 text-amber-700"
                          )}>
                            {job.status === 'completed' ? 'ناجحة' : job.status === 'failed' ? 'فشل' : 'معالجة'}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="size-8 rounded-lg text-muted-foreground hover:text-primary transition-colors">
                          <ArrowUpRight className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* System & Credit Status Section */}
        <div className="space-y-3 text-right">
          <motion.div variants={item}>
            <Card className="border-primary/20 bg-primary/5 shadow-inner-primary relative overflow-hidden rounded-lg">
              <div className="absolute top-0 right-0 p-3 opacity-10 rotate-12">
                <CreditCard className="size-16 text-primary" />
              </div>
              <CardHeader className="p-3 pb-2 text-right">
                <CardTitle className="text-base font-black flex items-center gap-3 leading-none justify-start">
                  <Activity className="size-4 text-primary" />
                  حالة الرصيد
                </CardTitle>
                <CardDescription className="text-[10px]">استهلاك العمليات المخصصة لمتجرك</CardDescription>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-end flex-row-reverse">
                    <span className="text-xs font-black">{totalCredits - credits} <span className="text-[9px] text-muted-foreground">مستخدم</span></span>
                    <span className="text-xs font-black">{credits} <span className="text-[9px] text-muted-foreground">متبقي</span></span>
                  </div>
                  <Progress value={creditUsagePercent} className="h-2 rounded-full" />
                  <p className="text-[8px] font-bold text-muted-foreground text-center uppercase tracking-widest mt-1 leading-relaxed">
                    تلقائياً عند تجديد الباقة
                  </p>
                </div>

                <Button className="w-full h-10 bg-primary text-primary-foreground font-black text-xs rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  شحن رصيد إضافي
                  <Plus className="ms-2 size-3.5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-linear-to-br from-indigo-600 to-indigo-900 border-none text-white overflow-hidden relative shadow-2xl rounded-lg">
              <div className="absolute -right-6 -top-6 opacity-10">
                <Zap className="h-24 w-24 rotate-12 fill-white" />
              </div>
              <CardContent className="p-5 space-y-3 text-right">
                <div className="space-y-1">
                  <h4 className="text-xl font-black leading-tight">مركز المساعدة</h4>
                  <p className="text-indigo-100/60 text-xs font-medium leading-relaxed">
                    فريق الدعم متاح للمساعدة في ضبط إعدادات المنتج.
                  </p>
                </div>
                <Button className="w-full h-10 bg-white text-indigo-950 font-black text-xs hover:bg-white/90 rounded-lg transition-all shadow-lg">
                  تحدث مع خبير الآن
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
