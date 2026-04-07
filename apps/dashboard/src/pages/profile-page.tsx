import { useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, Lock, Save, AlertCircle, RefreshCw, Mail, ArrowRight, Shield } from "lucide-react"
import { toast } from "sonner"
import { updateProfile, changePassword } from "@/lib/api"
import { motion } from "framer-motion"

export function ProfilePage() {
  const identity = useAuthStore((state) => state.identity)
  const setIdentity = useAuthStore((state) => state.setIdentity)

  const [fullName, setFullName] = useState(identity?.user?.full_name || "")
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    try {
      const response = await updateProfile(fullName)
      if (response.ok) {
        toast.success("تم تحديث الملف الشخصي بنجاح")
        if (identity) {
          setIdentity({
            ...identity,
            user: identity.user ? { ...identity.user, full_name: fullName } : { id: '', email: '', full_name: fullName }
          })
        }
      }
    } catch (error: any) {
      toast.error(error.message || "فشل تحديث الملف الشخصي")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة")
      return
    }
    setIsChangingPassword(true)
    try {
      const response = await changePassword(currentPassword, newPassword)
      if (response.ok) {
        toast.success("تم تغيير كلمة المرور بنجاح")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (error: any) {
      toast.error(error.message || "فشل تغيير كلمة المرور")
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-1 text-right">
        <h1 className="text-2xl font-black tracking-tight">إعدادات الحساب</h1>
        <p className="text-muted-foreground font-medium text-xs opacity-80">إدارة معلوماتك الشخصية وتأمين حسابك</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Info Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg overflow-hidden">
            <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="size-24 rounded-lg bg-primary/20 flex items-center justify-center border-4 border-background shadow-inner mx-auto md:mx-0">
                  <User className="size-12 text-primary" />
                </div>
                <div className="text-center md:text-right space-y-1">
                  <h3 className="font-black text-sm">بيانات الهوية</h3>
                  <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">هذه المعلومات تظهر لفريق الدعم التقني وتساعدنا في التواصل معك.</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-black text-foreground/70 mr-1">الاسم الكامل</Label>
                    <div className="relative group/input text-left" dir="ltr">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pr-10 h-12 rounded-lg bg-muted/30 border-border/50 focus:border-primary transition-all text-right font-bold"
                        placeholder="أدخل اسمك الكامل"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-right opacity-80">
                    <Label className="text-xs font-black text-foreground/70 mr-1">البريد الإلكتروني</Label>
                    <div className="relative group/input text-left" dir="ltr">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        value={identity?.user?.email || ""}
                        disabled
                        className="pr-10 h-12 rounded-lg bg-muted/10 border-border/20 text-right opacity-60 cursor-not-allowed font-mono"
                        dir="ltr"
                      />
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground mt-1 mr-1 flex items-center gap-1">
                      <AlertCircle className="size-3" /> لا يمكن تغيير البريد الإلكتروني للحسابات المرتبطة بسلة.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isUpdatingProfile || fullName === identity?.user?.full_name}
                      className="rounded-lg h-11 px-8 font-black text-xs gap-2 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isUpdatingProfile ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
                      {isUpdatingProfile ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Security Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-md rounded-lg overflow-hidden">
            <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="size-24 rounded-lg bg-amber-500/10 flex items-center justify-center border-4 border-background shadow-inner mx-auto md:mx-0">
                  <Shield className="size-12 text-amber-500" />
                </div>
                <div className="text-center md:text-right space-y-1">
                  <h3 className="font-black text-sm text-amber-600">الأمان والخصوصية</h3>
                  <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">تأكد من استخدام كلمة مرور قوية وغير مكررة في مواقع أخرى.</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div className="space-y-2 text-right">
                    <Label className="text-xs font-black text-foreground/70 mr-1">كلمة المرور الحالية</Label>
                    <div className="relative group/input" dir="ltr">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pr-10 h-12 rounded-lg bg-muted/30 border-border/50 focus:border-primary transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 text-right">
                      <Label className="text-xs font-black text-foreground/70 mr-1">كلمة المرور الجديدة</Label>
                      <div className="relative group/input" dir="ltr">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pr-10 h-12 rounded-lg bg-muted/30 border-border/50 focus:border-primary transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <Label className="text-xs font-black text-foreground/70 mr-1">تأكيد كلمة المرور</Label>
                      <div className="relative group/input" dir="ltr">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pr-10 h-12 rounded-lg bg-muted/30 border-border/50 focus:border-primary transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isChangingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                      variant="secondary"
                      className="rounded-lg h-11 px-8 font-black text-xs gap-2 border border-border/40 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isChangingPassword ? <RefreshCw className="size-4 animate-spin" /> : <Lock className="size-4" />}
                      {isChangingPassword ? "جاري التغيير..." : "تحديث كلمة المرور"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-center pt-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="rounded-lg font-bold text-xs text-muted-foreground hover:text-primary group"
        >
          <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
          العودة للتصحيح
        </Button>
      </div>
    </div>
  )
}
