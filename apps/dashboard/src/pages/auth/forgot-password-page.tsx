import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { forgotPassword } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await forgotPassword(email)
      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما، يرجى المحاولة مرة أخرى')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6" dir="rtl">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <Card className="p-8 border-border/50 shadow-2xl rounded-lg bg-card/50 backdrop-blur-xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">تم إرسال الرابط!</h1>
              <p className="text-muted-foreground">
                لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى <strong>{email}</strong>. يرجى التحقق من بريدك الإلكتروني.
              </p>
            </div>
            <Button asChild className="w-full h-12 rounded-lg">
              <Link to="/login">العودة لتسجيل الدخول</Link>
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6" dir="rtl">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center shadow-xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-xl font-black tracking-tight text-foreground">نسيت كلمة المرور؟</h1>
            <p className="text-muted-foreground">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادة حسابك</p>
          </div>
        </div>

        <Card className="p-8 border-border/50 shadow-2xl rounded-lg bg-card/50 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-colors" />

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            {error && (
              <Alert variant="destructive" className="rounded-lg border-destructive/20 bg-destructive/5">
                <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 text-right">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mr-1">البريد الإلكتروني</label>
              <div className="relative group/input">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="name@store.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 h-12 rounded-lg bg-muted/30 border-border/50 focus:border-primary transition-all text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-lg bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
              {isLoading ? (
                <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جاري الإرسال...</>
              ) : (
                'إرسال رابط الاستعادة'
              )}
            </Button>

            <Link to="/login" className="flex items-center justify-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors group/back">
              <ArrowRight className="ml-2 w-4 h-4 group-hover/back:translate-x-1 transition-transform" />
              العودة لتسجيل الدخول
            </Link>
          </form>
        </Card>
      </div>
    </div>
  )
}
