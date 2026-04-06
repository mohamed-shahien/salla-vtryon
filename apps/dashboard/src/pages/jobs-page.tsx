import { useEffect, useState } from "react"
import {
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  RefreshCcw,
  Zap,
  Package,
  History
} from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  fetchMerchantJob,
  fetchMerchantJobs,
  type VirtualTryOnJob,
} from "@/lib/api"
import { cn } from "@/lib/utils"

export function JobsPage() {
  const [jobs, setJobs] = useState<VirtualTryOnJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<VirtualTryOnJob | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadJobs = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const response = await fetchMerchantJobs()
      setJobs(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل تاريخ العمليات")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void loadJobs()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    void loadJobs(true)
  }

  const handleViewJob = async (id: string) => {
    try {
      const response = await fetchMerchantJob(id)
      setSelectedJob(response.data)
    } catch (err) {
      console.error("Failed to fetch job details:", err)
    }
  }

  const getStatusInfo = (status: VirtualTryOnJob["status"]) => {
    switch (status) {
      case "completed":
        return { label: "مكتمل", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: Zap }
      case "failed":
        return { label: "فشل", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle }
      case "processing":
        return { label: "جاري المعالجة", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock }
      default:
        return { label: "قيد الانتظار", color: "bg-muted text-muted-foreground border-muted-foreground/20", icon: Clock }
    }
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-border/40">
        <div className="space-y-1">
          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/5 text-primary border-primary/20 rounded-lg">
            تاريخ العمليات
          </Badge>
          <h1 className="text-2xl font-black tracking-tight leading-tight">سجل القياس الافتراضي</h1>
          <p className="text-muted-foreground font-medium text-xs max-w-xl text-right">
            استعرض جميع عمليات القياس الافتراضي التي تمت في متجرك وتتبع حالتها.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-lg font-black text-xs h-10 px-4 shadow-xs"
          >
            <RefreshCcw className={cn("me-2 size-4", isRefreshing && "animate-spin")} />
            تحديث
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border/40 shadow-sm rounded-lg overflow-hidden">
              <CardContent className="p-3 space-y-3 text-right">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-20 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Skeleton className="size-10 rounded-lg" />
                  <Skeleton className="size-10 rounded-lg" />
                  <Skeleton className="size-10 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5 rounded-lg p-12 text-right">
          <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-black text-destructive mb-2 uppercase tracking-widest">خطأ في التحميل</h3>
          <p className="text-sm font-medium text-destructive/80 mb-6">{error}</p>
          <Button onClick={() => void loadJobs()} variant="outline" className="rounded-lg font-black border-destructive/20 hover:bg-destructive/10 text-destructive mx-auto">
            إعادة المحاولة
          </Button>
        </Card>
      ) : jobs.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-muted/20 rounded-lg p-12 text-right opacity-60">
          <History className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-black text-foreground mb-1">لا توجد عمليات بعد</h3>
          <p className="text-sm font-medium text-muted-foreground">عندما يبدأ عملاؤك باستخدام القياس الافتراضي، ستظهر العمليات هنا.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {jobs.map((job) => {
            const status = getStatusInfo(job.status)
            return (
              <Card 
                key={job.id} 
                className="group border-border/40 shadow-xs hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm rounded-lg overflow-hidden hover:border-primary/20 relative"
              >
                <CardContent className="p-3 space-y-3 text-right">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className={cn("text-[9px] font-black py-0 px-2 rounded-lg border", status.color)}>
                      <status.icon className="me-1 size-2.5" />
                      {status.label}
                    </Badge>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      {new Date(job.created_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black tracking-tight flex-1 truncate">عملية #{job.id.slice(0, 8)}</h3>
                      {job.status === "processing" && <div className="size-1.5 rounded-full bg-amber-500 animate-pulse" />}
                    </div>
                    <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 justify-start">
                      <span className="flex items-center gap-1"><Package className="size-2.5" /> المنتج: {job.product_id?.slice(0, 8) || "N/A"}</span>
                      {job.category && (
                        <>
                          <span className="opacity-20">|</span>
                          <span className="font-bold text-primary/80">{job.category}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tiny Previews */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                      {job.person_image_url && (
                        <div className="size-8 rounded-lg border-2 border-white shadow-xs overflow-hidden bg-muted">
                          <img src={job.person_image_url} alt="Person" className="size-full object-cover" />
                        </div>
                      )}
                      {job.garment_image_url && (
                        <div className="size-8 rounded-lg border-2 border-white shadow-xs overflow-hidden bg-muted">
                          <img src={job.garment_image_url} alt="Garment" className="size-full object-cover" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 h-px bg-border/20 mx-1" />
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleViewJob(job.id)}
                      className="size-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="max-w-3xl border-border/40 shadow-2xl rounded-lg bg-card/90 backdrop-blur-xl p-0 overflow-hidden" dir="rtl">
          {selectedJob && (
            <>
              <DialogHeader className="p-6 border-b border-border/10 bg-muted/20 text-right">
                <div className="flex justify-between items-center w-full">
                  <div className="space-y-1">
                    <Badge variant="outline" className={cn("text-[10px] font-black px-2 py-0.5 rounded-lg", getStatusInfo(selectedJob.status).color)}>
                      {getStatusInfo(selectedJob.status).label}
                    </Badge>
                    <DialogTitle className="text-xl font-black tracking-tight">تفاصيل عملية القياس</DialogTitle>
                    <DialogDescription className="text-xs font-medium text-muted-foreground">#{selectedJob.id}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">صورة العميل</h4>
                  <div className="aspect-3/4 rounded-lg overflow-hidden border-2 border-white shadow-md bg-muted/20">
                    <img src={selectedJob.person_image_url} className="size-full object-cover" alt="Customer" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">المنتج المستخدم</h4>
                  <div className="aspect-3/4 rounded-lg overflow-hidden border-2 border-white shadow-md bg-muted/20">
                    <img src={selectedJob.garment_image_url} className="size-full object-cover" alt="Product" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">النتيجة النهائية</h4>
                  <div className="aspect-3/4 rounded-lg overflow-hidden border-2 border-white shadow-md bg-primary/5 flex items-center justify-center">
                    {selectedJob.result_image_url ? (
                      <img src={selectedJob.result_image_url} className="size-full object-cover shadow-2xl" alt="Result" />
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        {selectedJob.status === 'failed' ? (
                          <XCircle className="size-10 text-destructive mx-auto opacity-40" />
                        ) : (
                          <Loader2 className="size-10 text-primary mx-auto opacity-40 animate-spin" />
                        )}
                        <p className="text-[10px] font-black text-muted-foreground leading-relaxed">
                          {selectedJob.status === 'failed' ? 'فشلت المعالجة' : 'النتيجة قيد التحضير...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="p-4 bg-muted/20 border-t border-border/10 justify-start flex-row-reverse">
                <Button onClick={() => setSelectedJob(null)} className="rounded-lg font-black text-xs px-6 h-10 bg-primary">إغلاق</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
