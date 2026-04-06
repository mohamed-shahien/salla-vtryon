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
            <p className="text-xs   text-primary font-black mb-4">
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
    // For the hybrid model, if they are unauthenticated and not on an auth-related page,
    // we should redirect them to the local login page after a brief delay or immediately.
    // However, since we want to support both, we'll show a "Welcome Back" screen
    // with BOTH "Login with Password" and "Login via Salla" options.
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground font-sans" dir="rtl">
        <Card className="max-w-md w-full rounded-xl border border-border bg-card p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div className="relative">
            <div className="size-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
              <UserCheck className="size-8 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2 tracking-tight">مرحباً بك مجدداً</h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              للوصول إلى لوحة التحكم الخاصة بك، اختر طريقة الدخول المناسبة لك.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/auth/login')}
                className="flex w-full items-center justify-center rounded-xl bg-primary px-4 h-12 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                الدخول ببريدك الإلكتروني
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">أو</span>
                </div>
              </div>

              <a
                href="/api/auth/salla/start"
                className="flex w-full items-center justify-center rounded-xl border border-border bg-background px-4 h-12 text-sm font-bold text-foreground transition-all hover:bg-muted/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <img src="https://cdn.salla.sa/images/logo/logo-square.png" alt="Salla" className="size-5 ml-2" />
                تسجيل الدخول عبر سلة
              </a>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
