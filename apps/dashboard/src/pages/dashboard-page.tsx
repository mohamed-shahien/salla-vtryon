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
  Loader2,
  ExternalLink
} from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
} from "@/components/ui/avatar"
import { useAuthStore } from "@/stores/auth-store"
import { useMerchantJobs } from "@/hooks/use-merchant-jobs"
import { useSallaProducts } from "@/hooks/use-salla-products"
import { cn } from "@/lib/utils"

export function DashboardPage() {
  const identity = useAuthStore((state) => state.identity)
  const { jobs, loading: jobsLoading } = useMerchantJobs(5)
  const { products } = useSallaProducts()

  const merchantName = identity?.salla_profile?.merchant?.name || "عزيزي التاجر"
  const credits = identity?.credits?.remaining_credits ?? 0
  const usedCredits = identity?.credits?.used_credits ?? 0
  const totalCredits = identity?.credits?.total_credits ?? (credits + usedCredits)
  const creditUsagePercent = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0

  // Create products lookup map
  const productMap = (products || []).reduce((acc: Record<string, any>, p) => {
    acc[p.id.toString()] = p
    return acc
  }, {})

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
      <TooltipProvider>
        {/* Welcome Hero Section */}
        <motion.div variants={item}>
          <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-indigo-950 via-slate-900 to-primary p-6 text-white shadow-2xl">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse" />
            <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-right">
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-white/10 text-white backdrop-blur-md border-0 rounded-lg px-2 py-0.5 text-[9px] font-black   leading-none">
                  <Sparkles className="me-2 size-3 inline text-amber-400" />
                  أهـلاً بك في مستقبل التجارة الإلكترونية
                </Badge>
                <div className="space-y-1">
                  <h1 className="text-xl font-black  leading-tight">
                    طـورت مبيعاتك، {merchantName}
                  </h1>
                  <p className="text-indigo-100/70 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
                    استخدم تقنيات الذكاء الاصطناعي لتقليل نسبة المرتجعات وزيادة ثقة عملائك عبر ميزة القياس الافتراضي.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="h-10 px-5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 text-xs font-black shadow-xl hover:scale-105 transition-all">
                  <Link to="/products">
                    ابدأ تفعيل المنتجات
                    <Zap className="ms-2 size-3.5 text-amber-500 fill-amber-500" />
                  </Link>
                </Button>
                <Button variant="outline" className="h-10 px-5 rounded-xl border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 text-xs font-black">
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
              <Card className="relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 border-border/40 group rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 text-right">
                  <CardTitle className="text-[10px] font-black text-muted-foreground   leading-none">
                    {stat.label}
                  </CardTitle>
                  <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm", stat.bg, stat.color)}>
                    <stat.icon className="size-4" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 p-3 text-right">
                  <div className="text-lg font-black er text-foreground">{stat.value}</div>
                  <div className="mt-1 flex items-center justify-end gap-2 text-[9px]">
                    <span className="text-muted-foreground font-bold order-2">مقارنة بالشهر الماضي</span>
                    <Badge variant={stat.trend.includes("+") ? "default" : "secondary"} className={cn(
                      "text-[9px] font-black py-0 px-2 rounded-full order-1",
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
            <Card className="border-border/40 shadow-sm overflow-hidden min-h-[400px] rounded-xl flex flex-col">
              <CardHeader className="border-b border-border/30 bg-muted/5 p-3 text-right">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 text-right">
                    <CardTitle className="text-sm font-black flex items-center gap-2 justify-end">
                      <History className="size-4 text-primary" />
                      أحدث عمليات القياس
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold opacity-60">أحدث 5 محاولات قياس افتراضي تمت مؤخراً</CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl h-8 font-black text-[9px]   gap-2 bg-background shadow-xs px-3">
                    <Link to="/jobs">
                      عرض سجل العمليات
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {jobsLoading ? (
                  <div className="p-3 space-y-2">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-xl" />
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
                      <h3 className="font-black text-sm">لا توجد عمليات قياس نشطة</h3>
                      <p className="text-muted-foreground text-[10px] max-w-xs mx-auto">سيظهر نشاط العملاء ونتائج القياس هنا فور البدء.</p>
                    </div>
                    <Button asChild variant="link" className="text-primary font-black h-auto p-0 text-xs">
                      <Link to="/products">تفعيل ميزة القياس للمنتجات</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/20">
                    {jobs.map((job) => {
                      const product = job.product_id ? productMap[job.product_id] : null
                      const productName = product?.name || "منتج غير مسجل"
                      const productImage = job.product_image_url || product?.main_image

                      return (
                        <div key={job.id} className="group relative flex items-center justify-between p-3 hover:bg-muted/10 transition-all cursor-default text-right">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-10 overflow-visible">
                              <AvatarImage src={productImage} alt={productName} className="rounded-full object-cover border border-border shadow-xs transition-transform group-hover:scale-105" />
                              <AvatarFallback className="rounded-full bg-muted text-muted-foreground text-[10px] font-black">
                                {productName.substring(0, 1)}
                              </AvatarFallback>
                              <AvatarBadge className={cn(
                                "border-2 border-background shadow-sm",
                                job.status === 'completed' ? "bg-emerald-500" : job.status === 'failed' ? "bg-destructive" : "bg-amber-500"
                              )}>
                                {job.status === 'completed' ? (
                                  <CheckCircle2 className="size-2 text-white" />
                                ) : job.status === 'failed' ? (
                                  <XCircle className="size-2 text-white" />
                                ) : (
                                  <Loader2 className="size-2 animate-spin text-white" />
                                )}
                              </AvatarBadge>
                            </Avatar>
                            <div className="flex flex-col gap-0.5 text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-foreground truncate max-w-[150px]">{productName}</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-[9px] font-bold text-muted-foreground/40 cursor-help">#{job.product_id?.toString().slice(-4)}</span>
                                  </TooltipTrigger>
                                  <TooltipContent className="font-black text-[10px]" side="bottom">
                                    ID: {job.product_id}
                                  </TooltipContent>
                                </Tooltip>
                                {job.category && (
                                  <Badge variant="outline" className="text-[8px] font-black py-0 px-1.5  opacity-60 rounded-lg">
                                    {job.category === 'upper_body' ? 'علوي' : job.category === 'lower_body' ? 'سفلي' : 'فستان'}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-black  leading-none">
                                <Clock className="size-3 opacity-60" />
                                <span>{new Date(job.created_at).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex flex-col items-end">
                              <span className={cn(
                                "text-[9px] font-black px-2.5 py-0.5 rounded-full",
                                job.status === 'completed' ? "bg-emerald-500/10 text-emerald-600" :
                                  job.status === 'failed' ? "bg-destructive/10 text-destructive" :
                                    "bg-amber-500/10 text-amber-600"
                              )}>
                                {job.status === 'completed' ? 'ناجحة' : job.status === 'failed' ? 'فشل' : 'معالجة'}
                              </span>
                            </div>
                            <Button asChild variant="ghost" size="icon" className="size-8 rounded-xl text-muted-foreground hover:text-primary transition-colors">
                              <Link to={`/jobs`}>
                                <ExternalLink className="size-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* System & Credit Status Section */}
          <div className="space-y-3 text-right">
            <motion.div variants={item}>
              <Card className="border-primary/20 bg-primary/5 shadow-inner-primary relative overflow-hidden rounded-xl">
                <div className="absolute top-0 right-0 p-3 opacity-10 rotate-12">
                  <CreditCard className="size-16 text-primary" />
                </div>
                <CardHeader className="p-3 pb-1 text-right">
                  <CardTitle className="text-sm font-black flex items-center gap-2 leading-none justify-start">
                    <Activity className="size-3.5 text-primary" />
                    حالة الرصيد المتاح
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end flex-row-reverse text-[10px] font-black">
                      <span>{usedCredits.toLocaleString()} <span className="opacity-40">تم استهلاكه</span></span>
                      <span>{credits.toLocaleString()} <span className="opacity-40">متبقي</span></span>
                    </div>
                    <Progress value={creditUsagePercent} className="h-1.5 rounded-full bg-primary/10" />
                    <p className="text-[8px] font-black text-muted-foreground text-center  ">
                      يتم التجديد تلقائياً مع الباقة
                    </p>
                  </div>

                  <Button className="w-full h-10 bg-primary text-primary-foreground font-black text-xs rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                    شحن رصيد إضافي
                    <Plus className="ms-2 size-3" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-linear-to-br from-indigo-700 to-indigo-950 border-none text-white overflow-hidden relative shadow-2xl rounded-xl">
                <div className="absolute -right-6 -top-6 opacity-10 flex">
                  <Zap className="h-24 w-24 rotate-12 fill-white" />
                </div>
                <CardContent className="p-5 space-y-3 text-right relative z-10">
                  <div className="space-y-1">
                    <h4 className="text-base font-black leading-tight">مركز المساعدة</h4>
                    <p className="text-indigo-100/60 text-[10px] font-bold leading-relaxed">
                      فريق الخبراء متاح لمساعدتك في ضبط إعدادات العرض وتحسين الأداء.
                    </p>
                  </div>
                  <Button className="w-full h-10 bg-white text-indigo-950 font-black text-xs hover:bg-white/90 rounded-xl transition-all shadow-lg active:scale-95">
                    تواصل معنا الآن
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </TooltipProvider>
    </motion.div>
  )
}
