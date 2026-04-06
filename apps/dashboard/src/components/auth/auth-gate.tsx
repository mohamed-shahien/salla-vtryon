import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  RefreshCw, 
  UserCheck, 
  LayoutDashboard
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Card } from "@/components/ui/card"

interface AuthGateProps {
  children: React.ReactNode
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { status, checkAuth } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth()
      setIsChecking(false)
    }
    void initAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isChecking && status === 'unauthenticated') {
      // Auth is handled by the backend OAuth flow
    }
  }, [status, isChecking, navigate, location])

  if (isChecking || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-3 text-foreground font-sans" dir="rtl">
        <Card className="max-w-lg w-full rounded-lg border border-border bg-card p-12 text-center shadow-2xl shadow-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="relative animate-pulse">
            <div className="size-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-8">
              <RefreshCw className="size-8 text-primary animate-spin" />
            </div>
            <p className="text-xs uppercase tracking-widest text-primary font-black mb-4">
              لوحة التحكم الخارجية
            </p>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              يرجى الانتظار بينما نقوم بتسجيل دخولك الآمن إلى منصة القياس الافتراضي.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-3 text-foreground font-sans" dir="rtl">
        <Card className="max-w-lg w-full rounded-lg border border-border bg-card p-12 text-center shadow-2xl shadow-primary/5 relative overflow-hidden">
          <div className="rounded-lg bg-linear-to-br from-card to-muted/40 px-3 border border-border/50 relative overflow-hidden group shadow-sm mb-8">
            <div className="absolute top-[-20%] right-[-10%] opacity-5 rotate-12 transition-transform group-hover:rotate-24 duration-500">
              <LayoutDashboard className="size-20 text-primary" />
            </div>
            <div className="flex items-center gap-3 relative z-10 pt-4">
              <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">حالة النظام</span>
            </div>
            <div className="mt-2 relative z-10 pb-4">
              <p className="text-xs font-black text-foreground">جميع الأنظمة تعمل بكفاءة</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="size-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-8 shadow-inner">
              <UserCheck className="size-8 text-primary" />
            </div>
            <h2 className="text-2xl font-black mb-2 tracking-tight">مرحباً بك مجدداً</h2>
            <p className="text-muted-foreground text-sm font-medium mb-8">
              للوصول إلى لوحة التحكم، يرجى تسجيل الدخول عبر متجر سلة الخاص بك.
            </p>
            <a 
              href="/api/auth/salla/start" 
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-3 h-12 text-sm font-black text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              تسجيل الدخول عبر سلة
            </a>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
