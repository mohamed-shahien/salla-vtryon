import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Key, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { setPassword as apiSetPassword } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

export default function SetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuthenticated } = useAuthStore()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('رابط غير صالح. يرجى التحقق من بريدك الإلكتروني أو طلب رابط جديد.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (password.length < 8) {
      setError('يجب أن تكون كلمة المرور 8 أحرف على الأقل')
      return
    }

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiSetPassword(token, password)
      setIsSuccess(true)
      if (response.data) {
        setAuthenticated(response.data)
      }
      // Redirect after a short delay
      setTimeout(() => navigate('/'), 3000)
    } catch (err: any) {
      setError(err.message || 'فشل تعيين كلمة المرور. قد يكون الرابط منتهي الصلاحية.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6" dir="rtl">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <Card className="p-8 border-border/50 shadow-2xl rounded-3xl bg-card/50 backdrop-blur-xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">تم التعيين بنجاح!</h1>
              <p className="text-muted-foreground">
                لقد قمت بتعيين كلمة المرور الخاصة بك بنجاح. سيتم توجيهك إلى لوحة التحكم الآن...
              </p>
            </div>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6" dir="rtl">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 -rotate-3 transition-transform hover:rotate-0">
            <Key className="w-8 h-8 text-white" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-foreground">تعيين كلمة المرور</h1>
            <p className="text-muted-foreground">أهلاً بك! يرجى تعيين كلمة مرور قوية لحسابك</p>
          </div>
        </div>

        <Card className="p-8 border-border/50 shadow-2xl rounded-3xl bg-card/50 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative">
            {error && (
              <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/5">
                <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 text-right">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mr-1">كلمة المرور الجديدة</label>
              <div className="relative group/input">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary transition-all text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mr-1">تأكيد كلمة المرور</label>
              <div className="relative group/input">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary transition-all text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading || !token} className="w-full h-12 rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
              {isLoading ? (
                <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جاري الحفظ...</>
              ) : (
                'تأكيد كلمة المرور'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
