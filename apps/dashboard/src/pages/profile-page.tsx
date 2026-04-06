import { useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Lock, Save, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { updateProfile, changePassword } from "@/lib/api"
import { cn } from "@/lib/utils"

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
        // Update local identity state
        if (identity) {
          setIdentity({
            ...identity,
            user: identity.user ? {
              ...identity.user,
              full_name: fullName
            } : {
              id: '',
              email: '',
              full_name: fullName
            }
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
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-black tracking-tight flex items-center gap-3">
          <User className="size-8 text-primary" />
          الملف الشخصي
        </h1>
        <p className="text-muted-foreground font-bold">إدارة معلوماتك الشخصية وإعدادات الأمان</p>
      </div>

      <Separator className="opacity-50" />

      <div className="grid gap-8">
        {/* Profile Information */}
        <Card className="border-border/40 shadow-sm overflow-hidden group hover:border-primary/20 transition-all duration-300">
          <CardHeader className="bg-muted/30 border-b border-border/40">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <User className="size-5 text-primary" />
              المعلومات الشخصية
            </CardTitle>
            <CardDescription className="font-bold">تحديث اسمك الظاهر في المتجر</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-xs font-black">الاسم الكامل</Label>
                <Input
                  id="full_name"
                  placeholder="أدخل اسمك الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl h-11 font-bold border-border/60 focus:border-primary/40 focus:ring-primary/10 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black">البريد الإلكتروني</Label>
                <Input
                  value={identity?.user?.email || identity?.salla_profile?.email || ""}
                  disabled
                  className="rounded-xl h-11 font-bold bg-muted/50 border-border/20 cursor-not-allowed opacity-70"
                />
                <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  لا يمكن تغيير البريد الإلكتروني حالياً.
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isUpdatingProfile || fullName === identity?.user?.full_name}
                  className="rounded-xl px-8 h-11 font-black gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save className="size-4" />
                  {isUpdatingProfile ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security / Password */}
        <Card className="border-border/40 shadow-sm overflow-hidden group hover:border-primary/20 transition-all duration-300">
          <CardHeader className="bg-muted/30 border-b border-border/40">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Lock className="size-5 text-primary" />
              الأمان وكلمة المرور
            </CardTitle>
            <CardDescription className="font-bold">تغيير كلمة المرور الخاصة بك</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current_password" className="text-xs font-black">كلمة المرور الحالية</Label>
                <Input
                  id="current_password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="rounded-xl h-11 font-bold border-border/60 focus:border-primary/40 focus:ring-primary/10 transition-all"
                  required
                />
              </div>
              <Separator className="opacity-30" />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="new_password" className="text-xs font-black">كلمة المرور الجديدة</Label>
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-xl h-11 font-bold border-border/60 focus:border-primary/40 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="text-xs font-black">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-xl h-11 font-bold border-border/60 focus:border-primary/40 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isChangingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="rounded-xl px-8 h-11 font-black gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RefreshCw className={cn("size-4", isChangingPassword && "animate-spin")} />
                  {isChangingPassword ? "جاري التغيير..." : "تغيير كلمة المرور"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
