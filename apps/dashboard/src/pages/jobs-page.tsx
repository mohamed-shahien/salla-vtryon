import { useEffect, useState, memo, useCallback, useMemo } from "react"
import {
  History,
  Construction,
  Trophy,
  PieChart,
  RefreshCcw,
  Search,
  Package,
  Eye,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
  Zap
} from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
  AvatarGroup,
} from "@/components/ui/avatar"
import {
  fetchMerchantJob,
  fetchMerchantJobs,
  type TryOnJob as VirtualTryOnJob,
  type TryOnJobStatus,
} from "@/lib/api"
import { useSallaProducts } from "@/hooks/use-salla-products"
import { cn } from "@/lib/utils"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

const getStatusInfo = (status: TryOnJobStatus) => {
  switch (status) {
    case "completed":
      return { label: "مكتمل", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: Zap }
    case "failed":
      return { label: "فشل", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle }
    case "processing":
      return { label: "جاري المعالجة", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock }
    case "pending":
      return { label: "قيد الانتظار", color: "bg-muted text-muted-foreground border-muted-foreground/20", icon: Clock }
    default:
      return { label: "غير معروف", color: "bg-muted text-muted-foreground border-muted-foreground/20", icon: Clock }
  }
}

const JobCard = memo(({ 
  job, 
  product, 
  onView 
}: { 
  job: VirtualTryOnJob, 
  product: any, 
  onView: (id: string) => void 
}) => {
  const status = getStatusInfo(job.status)
  const productName = product?.name || "منتج غير مسجل"
  const productImage = job.product_image_url || product?.main_image

  return (
    <motion.div variants={item}>
      <Card
        className="group border-border/40 shadow-xs hover:shadow-xl transition-all duration-500 bg-card/70 backdrop-blur-md rounded-xl overflow-hidden hover:border-primary/30 relative h-full flex flex-col"
      >
        <CardContent className="p-3 space-y-4 text-right flex-1 flex flex-col">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className={cn("text-[8px] font-black py-0 px-2 rounded-xl border-0 shadow-xs", status.color)}>
              <status.icon className="me-1.5 size-3" />
              {status.label}
            </Badge>
            <span className="text-[9px] font-black text-muted-foreground opacity-60">
              {new Date(job.created_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
            </span>
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 justify-end">
              {job.status === "processing" && <div className="size-2 rounded-full bg-amber-500 animate-pulse" />}
              <h3 className="text-xs font-black  text-foreground/90 truncate">{productName}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1.5 bg-muted/60 px-2 py-0.5 rounded-xl border border-border/10 text-[9px] font-bold cursor-help">
                    <Package className="size-3 opacity-60" /> #{job.product_id?.toString().slice(-6) || "N/A"}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-black text-[10px]">
                  معرف المنتج: {job.product_id}
                </TooltipContent>
              </Tooltip>
              {job.category && (
                <span className="font-black text-[9px] text-primary/80 bg-primary/10 px-2 py-0.5 rounded-xl border border-primary/10">
                  {job.category === 'upper_body' ? 'علوي' : job.category === 'lower_body' ? 'سفلي' : 'فستان'}
                </span>
              )}
            </div>
          </div>

          {/* Previews */}
          <div className="flex items-center gap-3 pt-3 border-t border-border/10 justify-between">
            <AvatarGroup>
              <Avatar className="size-11 border-2 border-background">
                <AvatarImage src={job.user_image_url} alt="Person" className="object-cover" />
                <AvatarFallback className="rounded-xl text-[8px] font-black">U</AvatarFallback>
              </Avatar>
              <Avatar className="size-11 border-2 border-background">
                <AvatarImage src={productImage} alt="Product" className="object-cover" />
                <AvatarFallback className="rounded-xl text-[8px] font-black">P</AvatarFallback>
              </Avatar>
              {job.result_image_url && (
                <Avatar className="size-11 border-2 border-background ring-1 ring-primary/20">
                  <AvatarImage src={job.result_image_url} alt="Result" className="object-cover" />
                  <AvatarFallback className="rounded-xl text-[8px] font-black">R</AvatarFallback>
                </Avatar>
              )}
            </AvatarGroup>

            <Button
              variant="secondary"
              size="icon"
              onClick={() => onView(job.id)}
              className="size-9 rounded-xl text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm active:scale-90"
            >
              <Eye className="size-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
JobCard.displayName = "JobCard"

export function JobsPage() {
  const [jobs, setJobs] = useState<VirtualTryOnJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<VirtualTryOnJob | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<TryOnJobStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { products } = useSallaProducts()

  const productMap = useMemo(() => {
    return (products || []).reduce((acc: Record<string, any>, p) => {
      acc[p.id.toString()] = p
      return acc
    }, {})
  }, [products])

  const loadJobs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const response = await fetchMerchantJobs({
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      setJobs(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل تاريخ العمليات")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [statusFilter])

  useEffect(() => {
    void loadJobs()
  }, [loadJobs])

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const product = job.product_id ? productMap[job.product_id] : null
      const productName = product?.name || ""

      return (
        job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.product_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        productName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [jobs, productMap, searchQuery])

  const stats = useMemo(() => ({
    total: jobs.length,
    success: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    processing: jobs.filter(j => j.status === 'processing').length,
  }), [jobs])

  const successRate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    void loadJobs(true)
  }, [loadJobs])

  const handleViewJob = useCallback(async (id: string) => {
    try {
      const response = await fetchMerchantJob(id)
      setSelectedJob(response.data)
    } catch (err) {
      console.error("Failed to fetch job details:", err)
    }
  }, [])

  return (
    <TooltipProvider>
      <div className="space-y-3 animate-in fade-in duration-700 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-border/40 text-right">
          <div className="space-y-1">
            <Badge variant="outline" className="text-[9px] font-black px-2 py-0.5 bg-primary/5 text-primary border-primary/20 rounded-xl">
              إحصائيات النظام
            </Badge>
            <h1 className="text-xl font-black leading-tight">سجل العمليات الذكي</h1>
            <p className="text-muted-foreground font-bold text-[10px] max-w-xl opacity-70">
              استعراض شامل لجميع تجارب القياس الافتراضي بتفاصيل المنتجات وحالات المعالجة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-xl font-black text-[10px] h-9 px-4 shadow-xs bg-card/50 backdrop-blur-sm"
            >
              <RefreshCcw className={cn("me-2 size-3.5 transition-transform", isRefreshing && "animate-spin")} />
              تحديث السجل
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "إجمالي العمليات", value: stats.total, icon: History, color: "primary", border: "primary" },
            { label: "نسبة النجاح", value: `${successRate}%`, icon: Trophy, color: "emerald-600", border: "emerald-500", bg: "emerald-500" },
            { label: "جاري المعالجة", value: stats.processing, icon: Construction, color: "amber-500", border: "amber-500", bg: "amber-500" },
            { label: "نشاط اليوم", value: jobs.filter(j => new Date(j.created_at).toDateString() === new Date().toDateString()).length, icon: PieChart, color: "indigo-500", border: "indigo-500", bg: "indigo-500" },
          ].map((stat, i) => (
            <Card key={i} className={cn("border-border/40 shadow-xs bg-card/50 backdrop-blur-md rounded-xl overflow-hidden relative group hover:border-primary/20 transition-all duration-300", stat.border && `hover:border-${stat.border}/20`)}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="space-y-0.5 text-right">
                  <p className="text-[9px] font-black text-muted-foreground">{stat.label}</p>
                  <h3 className={cn("text-lg font-black", stat.color && `text-${stat.color}`)}>{stat.value}</h3>
                </div>
                <div className={cn("size-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", stat.bg ? `bg-${stat.bg}/5 text-${stat.bg}` : "bg-primary/5 text-primary")}>
                  <stat.icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-card/40 backdrop-blur-md p-3 rounded-xl border border-border/40 shadow-xs">
          <Tabs value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)} className="w-full lg:w-auto">
            <TabsList className="bg-muted/50 p-1 h-9 rounded-xl border border-border/20 w-full lg:w-auto">
              {["all", "completed", "processing", "failed"].map((key) => (
                <TabsTrigger key={key} value={key} className={cn(
                  "text-[10px] font-black px-4 h-7 rounded-xl transition-all",
                  key === "all" ? "data-[state=active]:bg-white data-[state=active]:text-primary" :
                    key === "completed" ? "data-[state=active]:bg-emerald-500 data-[state=active]:text-white" :
                      key === "processing" ? "data-[state=active]:bg-amber-500 data-[state=active]:text-white" :
                        "data-[state=active]:bg-destructive data-[state=active]:text-white"
                )}>
                  {key === "all" ? "الكل" : key === "completed" ? "ناجح" : key === "processing" ? "معالجة" : "فشل"}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative w-full lg:w-72 group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج أو عملية..."
              className="ps-10 h-9 bg-background border-border/60 focus:ring-primary/20 rounded-xl font-bold text-[10px] shadow-sm transition-all text-right"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-card/40">
                <CardContent className="p-3 space-y-3 text-right">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-20 rounded-xl" />
                    <Skeleton className="h-3 w-24 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-full rounded-xl" />
                    <Skeleton className="h-3.5 w-2/3 rounded-xl" />
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-border/10">
                    <Skeleton className="size-10 rounded-xl" />
                    <Skeleton className="size-10 rounded-xl" />
                    <div className="flex-1" />
                    <Skeleton className="size-8 rounded-xl" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive/20 bg-destructive/5 rounded-xl p-10 text-center">
            <AlertCircle className="size-12 text-destructive mx-auto mb-4 opacity-80" />
            <h3 className="text-base font-black text-destructive mb-2">فشل تحميل البيانات</h3>
            <p className="text-[10px] font-bold text-destructive/70 mb-6 max-w-sm mx-auto leading-relaxed">{error}</p>
            <Button onClick={() => void loadJobs()} variant="outline" className="rounded-xl font-black border-destructive/20 hover:bg-destructive/10 text-destructive h-10 px-6 shadow-sm">
              إعادة المحاولة
            </Button>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-muted/20 rounded-xl p-16 text-center opacity-70">
            <History className="size-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-base font-black text-foreground mb-1">لا توجد سجلات</h3>
            <p className="text-[10px] font-bold text-muted-foreground max-w-sm mx-auto">لم نعثر على عمليات تطابق اختياراتك الحالية.</p>
          </Card>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                product={job.product_id ? productMap[job.product_id] : null} 
                onView={handleViewJob} 
              />
            ))}
          </motion.div>
        )}

        <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
          <DialogContent className="max-w-3xl border-border/40 shadow-2xl rounded-2xl bg-card/95 backdrop-blur-2xl p-0 overflow-hidden z-50 overflow-y-auto max-h-[90vh]" dir="rtl">
            {selectedJob && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <DialogHeader className="p-5 border-b border-border/10 bg-linear-to-br from-muted/30 to-card text-right">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-3">
                    <div className="space-y-1">
                      <Badge variant="outline" className={cn("text-[9px] font-black px-3 py-0.5 rounded-xl border-0 shadow-xs", getStatusInfo(selectedJob.status).color)}>
                        {getStatusInfo(selectedJob.status).label}
                      </Badge>
                      <DialogTitle className="text-lg font-black leading-tight">تفاصيل عملية القياس</DialogTitle>
                      <DialogDescription className="text-[9px] font-bold text-muted-foreground opacity-60">
                        سجل: {selectedJob.id.toUpperCase()}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { label: "صورة العميل", url: selectedJob.user_image_url, color: "primary" },
                    { label: "صورة المنتج", url: selectedJob.product_image_url || (selectedJob.product_id ? productMap[selectedJob.product_id]?.main_image : undefined), color: "indigo-500" },
                    { label: "النتيجة النهائية", url: selectedJob.result_image_url, color: "emerald-500", isResult: true }
                  ].map((img, idx) => (
                    <div key={idx} className="space-y-3 text-right">
                      <h4 className="text-[10px] font-black text-muted-foreground flex items-center gap-2 justify-end">
                        {img.label}
                        <div className={cn("size-1.5 rounded-full", idx === 0 ? "bg-primary" : idx === 1 ? "bg-indigo-500" : "bg-emerald-500")} />
                      </h4>
                      <div className="aspect-3/4 rounded-xl overflow-hidden border border-border shadow-xl bg-muted relative group">
                        {img.url ? (
                          <>
                            <img src={img.url} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" alt={img.label} />
                            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </>
                        ) : (
                          <div className="flex items-center justify-center size-full">
                            {selectedJob.status === 'failed' && img.isResult ? (
                              <XCircle className="size-10 text-destructive opacity-20" />
                            ) : (
                              <Loader2 className="size-10 text-primary opacity-20 animate-spin" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <DialogFooter className="p-4 bg-muted/60 border-t border-border/10 flex flex-row gap-3">
                  <Button onClick={() => setSelectedJob(null)} className="rounded-xl font-black text-xs px-8 h-10 bg-primary shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">إغلاق</Button>
                  {selectedJob.result_image_url && (
                    <a href={selectedJob.result_image_url} target="_blank" rel="noreferrer" className="flex-1">
                      <Button variant="outline" className="w-full rounded-xl font-black text-xs h-10 border-border/40 hover:bg-white transition-all">تحميل النتيجة</Button>
                    </a>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
