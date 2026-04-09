/**
 * Diagnostics Section
 *
 * Status indicators for widget runtime health and configuration.
 */

import { useEffect, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import type { DiagnosticStatusCard } from '@/lib/diagnostics/runtime-diagnostics'
import {
  getDiagnosticStatusCards,
  runFullDiagnostics,
} from '@/lib/diagnostics/runtime-diagnostics'
import { useAuthStore } from '@/stores/auth-store'

interface DiagnosticsSectionProps {
  apiUrl: string
}

export function DiagnosticsSection({ apiUrl }: DiagnosticsSectionProps) {
  const identity = useAuthStore((state) => state.identity)
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [cards, setCards] = useState<DiagnosticStatusCard[]>([])

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const diagnostics = await runFullDiagnostics({
        apiUrl,
        configVersion: 1, // Unified System
        configLastPublished: identity?.merchant?.installed_at ? new Date(identity.merchant.installed_at) : null,
        tokenData: {
          valid: identity?.exp ? new Date(identity.exp) > new Date() : false,
          expiresAt: identity?.exp || null,
          scopes: ['read', 'write'],
        },
        credits: {
          remaining_credits: identity?.credits?.remaining_credits ?? 0,
          used_credits: identity?.credits?.used_credits ?? 0,
          total_credits: identity?.credits?.total_credits ?? null,
          reset_at: identity?.credits?.reset_at || null,
        },
        plan: {
          plan: identity?.merchant?.plan || null,
          plan_status: identity?.merchant?.plan_status || null,
        },
      })

      setCards(getDiagnosticStatusCards(diagnostics))
      setLastChecked(new Date())

      if (diagnostics.overall.healthy) {
        toast.success('جميع الفحوصات ناجحة')
      } else {
        toast.warning('بعض الفحوصات تحتاج انتباه')
      }
    } catch (error) {
      console.error('Diagnostics error:', error)
      toast.error('فشل في تشغيل التشخيص')
    } finally {
      setLoading(false)
    }
  }

  // Run diagnostics on mount
  useEffect(() => {
    if (identity) {
      void runDiagnostics()
    }
  }, [identity])

  const getStatusIcon = (status: DiagnosticStatusCard['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="size-4 text-emerald-500" />
      case 'warning':
        return <AlertTriangle className="size-4 text-amber-500" />
      case 'error':
        return <XCircle className="size-4 text-destructive" />
    }
  }

  const getStatusColor = (status: DiagnosticStatusCard['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20'
    }
  }

  return (
    <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg text-right">
      <CardHeader className="p-3 border-b border-border/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground/80">
            <Activity className="size-4 text-primary/70" />
            <div>
              <CardTitle className="text-sm font-black">فحص حالة وسلامة الخدمة</CardTitle>
              <CardDescription className="text-[9px] font-bold opacity-60">
                تقرير مباشر عن جاهزية الخدمة في متجرك
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void runDiagnostics()}
            disabled={loading}
            className="rounded-lg font-black text-[10px] h-8 gap-2 bg-card/50 backdrop-blur-sm"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            تحديث
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        {loading && cards.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Skeleton className="size-4 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24 rounded-lg" />
                  <Skeleton className="h-2 w-32 rounded-lg" />
                </div>
                <Skeleton className="w-16 h-6 rounded-lg" />
              </div>
            ))}
          </div>
        ) : cards.length > 0 ? (
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all duration-300",
                    getStatusColor(card.status)
                  )}
                >
                  {/* Icon */}
                  <div className="shrink-0">{getStatusIcon(card.status)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-black truncate">{card.labelAr}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[8px] font-black px-2 py-0 rounded-full border-0",
                          card.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-600' :
                          card.status === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-destructive/10 text-destructive'
                        )}
                      >
                        {card.status === 'healthy' ? 'منظم وجاهز' : card.status === 'warning' ? 'يحتاج انتباه' : 'يوجد مشكلة'}
                      </Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground truncate">{card.message}</p>
                    <p className="text-[8px] text-muted-foreground/60 truncate">{card.details}</p>
                  </div>

                  {/* Time */}
                  <div className="shrink-0 text-left">
                    <p className="text-[8px] text-muted-foreground">
                      {lastChecked ? `${lastChecked.toLocaleTimeString('ar-SA')}` : '--:--'}
                    </p>
                  </div>

                  {/* Action */}
                  {card.actionable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg hover:bg-white/10"
                      onClick={() => {
                        toast.info(`الإجراء: ${card.id}`)
                      }}
                    >
                      <AlertCircle className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-[10px] text-muted-foreground">اضغط على زر التحديث بالأعلى لبدء الفحص</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
