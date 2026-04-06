import { 
  Plus, 
  Sparkles, 
  CreditCard, 
  Zap, 
  Monitor, 
  Clock, 
  Package,
  Gamepad2,
  TrendingUp,
  Activity,
  History
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Panel } from '@/components/ui/panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

/**
 * Premium Arabic Overview Dashboard for Merchants.
 * Tailored for Saudi market with high readability and modern aesthetics.
 */
export function DashboardPage() {
  const identity = useAuthStore((state) => state.identity)
  const merchantName = identity?.salla_profile?.merchant.name || 'عزيزي التاجر'
  const credits = identity?.credits?.remaining_credits ?? 0

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
    { label: 'عمليات القياس', value: '1,284', trend: '+12%', icon: Gamepad2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'الرصيد المتبقي', value: credits.toString(), trend: 'تحديث تلقائي', icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'المنتجات النشطة', value: '42', trend: '+5 جـدد', icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'معدل التحويل', value: '3.4%', trend: '+0.8%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-20 pt-2 animate-in fade-in duration-700"
    >
      {/* Hero Header Section */}
      <motion.div variants={item} className="relative overflow-hidden rounded-[24px] bg-linear-to-br from-indigo-950 via-slate-900 to-primary p-9 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="space-y-4">
              <Badge variant="secondary" className="bg-white/10 text-white backdrop-blur-md border-0 rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="me-2 h-3 w-3 inline" />
                ميزة توفير الوقت والمال
              </Badge>
              <div className="space-y-2">
                 <h1 className="text-4xl font-black tracking-tight leading-tight">أهلاً بك، {merchantName}</h1>
                 <p className="text-indigo-100/70 text-lg font-medium max-w-lg">مستعد لرفع مبيعاتك؟ قم بتفعيل القياس الافتراضي على منتجاتك الجديدة الآن.</p>
              </div>
           </div>
           
           <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-14 rounded-[14px] bg-white text-indigo-950 hover:bg-indigo-50 text-md font-black shadow-lg hover:scale-105 transition-all">
                <Link to="/products">
                  تفعيل المنتجات
                  <Zap className="ms-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 rounded-[14px] border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 text-md font-black">
                كيف يعمل؟
              </Button>
           </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Panel 
              title={stat.value} 
              description={stat.label}
              className="group relative overflow-hidden transition-all hover:translate-y-[-4px] hover:shadow-xl hover:border-primary/20"
            >
              <div className="flex items-start justify-between absolute top-4 right-4 left-4">
                <div className={cn("p-4 rounded-[16px] transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="rounded-full bg-muted/50 text-[10px] font-black py-1">
                  {stat.trend}
                </Badge>
              </div>
              <div className="mt-20 px-2">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3>
                </div>
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
         {/* Recent Jobs */}
         <motion.div variants={item} className="lg:col-span-2">
            <Panel 
              title="آخر عمليات القياس" 
              description="أحدث العمليات التي تمت بنجاح لعملائك مؤخراً."
              className="h-full"
            >
              <div className="mt-8 space-y-2">
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="group relative flex items-center justify-between py-4 transition-all overflow-hidden p-4 rounded-[14px] hover:bg-muted/10">
                     <div className="flex items-center gap-5">
                        <div className="h-12 w-12 flex items-center justify-center rounded-[12px] bg-linear-to-br from-primary/20 to-primary/5 text-primary">
                           <Package className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-foreground">تحديث ظهور المنتج #1205634</span>
                           <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                              <Clock className="h-3 w-3" />
                              منذ 3 ساعات
                           </div>
                        </div>
                     </div>
                     <Badge variant="outline" className="h-7 px-4 rounded-full border-border/60 text-[9px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        مكتمل بنجاح
                     </Badge>
                  </div>
                ))}
              </div>
              <Button asChild variant="ghost" className="w-full mt-6 h-12 text-xs font-black uppercase tracking-[0.2em] hover:bg-primary/5 text-primary rounded-[10px]">
                 <Link to="/jobs">
                    عرض جميع العمليات
                    <History className="ms-2 h-4 w-4" />
                 </Link>
              </Button>
            </Panel>
         </motion.div>

         {/* Quick Actions & Status */}
         <div className="space-y-8">
            <motion.div variants={item}>
              <Panel 
                title="نظرة سريعة" 
                description="حالة النظام والإجراءات السريعة"
                className="bg-primary/5 border-primary/20"
              >
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-card rounded-[14px] border border-border/50">
                       <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-primary" />
                          <span className="text-[11px] font-black uppercase tracking-widest">حالة النظام</span>
                       </div>
                       <Badge className="bg-emerald-500 text-white border-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">مستقر</Badge>
                    </div>

                    <div className="space-y-3">
                       <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">إجراءات سريعة</h4>
                       <div className="grid grid-cols-2 gap-3">
                          <Button variant="secondary" className="h-20 flex-col gap-2 rounded-[14px] bg-card border border-border/50 transition-all hover:translate-y-[-2px] hover:shadow-lg">
                             <Monitor className="h-5 w-5 text-indigo-500" />
                             <span className="text-[9px] font-black uppercase tracking-widest">دليل المتجر</span>
                          </Button>
                          <Button variant="secondary" className="h-20 flex-col gap-2 rounded-[14px] bg-card border border-border/50 transition-all hover:translate-y-[-2px] hover:shadow-lg">
                             <Plus className="h-5 w-5 text-emerald-500" />
                             <span className="text-[9px] font-black uppercase tracking-widest">شحن رصيد</span>
                          </Button>
                       </div>
                    </div>
                 </div>
              </Panel>
            </motion.div>

            <motion.div variants={item}>
              <Panel 
                title="الدعم الفني" 
                description="نحن هنا لمساعدتكم دائماً"
                className="bg-linear-to-br from-indigo-600 to-indigo-900 border-none text-white overflow-hidden relative"
              >
                 <div className="absolute -right-4 -top-4 opacity-10">
                    <Zap className="h-32 w-32 rotate-12" />
                 </div>
                 <h4 className="text-xl font-black leading-tight">هل تحتاج إلى مساعدة؟</h4>
                 <p className="text-indigo-100/60 text-[10px] font-black uppercase tracking-widest mt-2 leading-relaxed">
                    فريق الدعم الفني لدينا جاهز لمساعدتك في أي وقت على مدار الساعة.
                 </p>
                 <Button className="w-full mt-6 h-11 bg-white text-indigo-950 font-black text-[10px] hover:bg-white/90 rounded-[10px]">
                    تواصل معنا الآن
                 </Button>
              </Panel>
            </motion.div>
         </div>
      </div>
    </motion.div>
  )
}
