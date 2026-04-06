import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Zap,
  Package
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { updateWidgetSettings } from '@/lib/api'

/**
 * OnboardingWizard component provides a premium Arabic-first welcome experience
 * for new merchants, explaining the AI try-on system and credit mechanics.
 */
export function OnboardingWizard() {
  const identity = useAuthStore((state) => state.identity)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [isFinishing, setIsFinishing] = useState(false)

  // Trigger onboarding if not completed
  useEffect(() => {
    if (identity && identity.merchant.settings?.onboarding_completed === false) {
      setOpen(true)
    }
  }, [identity])

  const handleFinish = async () => {
    if (!identity) return
    setIsFinishing(true)
    try {
      const updatedSettings = await updateWidgetSettings({ onboarding_completed: true })
      setAuthenticated({
        ...identity,
        merchant: {
          ...identity.merchant,
          settings: updatedSettings.data,
        },
      })
      setOpen(false)
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    } finally {
      setIsFinishing(false)
    }
  }

  const steps = [
    {
      title: 'أهلاً بك في ثورة القياس الافتراضي',
      description: 'حول متجرك إلى تجربة تفاعلية تتيح لعملائك تجربة الملابس باستخدام الذكاء الاصطناعي بكل سهولة.',
      icon: Sparkles,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'كيف يعمل النظام؟',
      description: 'يقوم العميل برفع صورته الشخصية، ويقوم نظامنا بتركيب قطعة الملابس عليها بشكل واقعي تماماً خلال ثوانٍ.',
      icon: Zap,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'إدارة المنتجات والرصيد',
      description: 'يمكنك اختيار المنتجات التي تريد تفعيل الخدمة عليها. كل عملية قياس ناجحة تستهلك رصيداً واحداً من باقتك.',
      icon: Package,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'أنت جاهز للانطلاق!',
      description: 'ابدأ الآن بتفعيل منتجاتك واستمتع بزيادة مبيعاتك وتفاعل عملائك مع متجرك على سلة.',
      icon: CheckCircle2,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-0 rounded-lg bg-card shadow-2xl" showCloseButton={false}>
        {/* Progress Bar */}
        <div className="relative h-2 bg-muted w-full overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / steps.length) * 100}%` }}
            transition={{ type: 'spring', damping: 20 }}
          />
        </div>

        {/* Content Area */}
        <div className="p-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3 text-center"
            >
              <div className="flex justify-center">
                <div className={`p-6 rounded-lg ${steps[step - 1].bg} ${steps[step - 1].color} shadow-inner`}>
                  {(() => {
                    const Icon = steps[step - 1].icon
                    return <Icon className="h-12 w-12" />
                  })()}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-black text-foreground tracking-tight">{steps[step - 1].title}</h2>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-[340px] mx-auto">
                  {steps[step - 1].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Indicators */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 transition-all duration-300 rounded-full ${i + 1 === step ? 'w-8 bg-primary' : 'w-1.5 bg-muted'}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-muted/30 border-t border-border flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button
              variant="ghost"
              onClick={() => setStep(s => s - 1)}
              className="rounded-xl font-black text-xs h-11 px-3 hover:bg-muted/50 transition-transform"
            >
              <ChevronRight className="me-2 h-4 w-4" />
              السابق
            </Button>
          ) : <div />}

          {step < steps.length ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              className="rounded-xl font-black text-xs h-11 px-3 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              التالي
              <ChevronLeft className="ms-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={isFinishing}
              className="rounded-xl font-black text-xs h-11 px-3 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              {isFinishing ? 'جاري الحفظ...' : 'ابدأ الآن'}
              {!isFinishing && <Zap className="ms-2 h-4 w-4" />}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
