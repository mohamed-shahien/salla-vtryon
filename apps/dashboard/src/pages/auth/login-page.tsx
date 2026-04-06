import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuthStore } from '@/stores/auth-store'
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground font-sans" dir="rtl">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-inner">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">تسجيل الدخول</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            أهلاً بك مجدداً في منصة القياس الافتراضي
          </p>
        </div>

        <Card className="border border-border bg-card p-8 shadow-2xl relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative">
            {error && (
              <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/5 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium mr-2">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-foreground/80">البريد الإلكتروني</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Mail className="size-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary transition-all text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-bold text-foreground/80">كلمة المرور</Label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs font-bold text-primary hover:underline hover:opacity-80 transition-all"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock className="size-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary transition-all text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'دخول'
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          هل تريد العودة؟{' '}
          <Link to="/" className="font-bold text-primary hover:underline">
            تسجيل الدخول عبر سلة
          </Link>
        </p>
      </div>
    </div>
  )
}
