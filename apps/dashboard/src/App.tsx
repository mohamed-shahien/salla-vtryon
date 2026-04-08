import { lazy, Suspense } from 'react'
import { AuthGate } from '@/components/auth/auth-gate'
import { PerformanceMonitor } from '@/components/performance-monitor'
import { AppShell } from '@/components/layout/app-shell'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { startRouteMeasure, recordShellRender, recordDataReady } from '@/lib/performance'
import { DirectionProvider } from '@/components/ui/direction'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Loader2 } from 'lucide-react'

// Lazy load all page components for code splitting
// Note: Using named exports converted to default for React.lazy compatibility
const AuthCallbackPage = lazy(() =>
  import('@/components/auth/auth-callback-page').then(m => ({ default: m.AuthCallbackPage }))
)
const LoginPage = lazy(() =>
  import('@/pages/auth/login-page').then(m => ({ default: m.LoginPage }))
)
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/forgot-password-page').then(m => ({ default: m.default }))
)
const SetPasswordPage = lazy(() =>
  import('@/pages/auth/set-password-page').then(m => ({ default: m.default }))
)
const ResetPasswordPage = lazy(() =>
  import('@/pages/auth/reset-password-page').then(m => ({ default: m.default }))
)
const DashboardPage = lazy(() =>
  import('@/pages/dashboard-page').then(m => ({ default: m.DashboardPage }))
)
const ProductsPage = lazy(() =>
  import('@/pages/products-page').then(m => ({ default: m.ProductsPage }))
)
const JobsPage = lazy(() =>
  import('@/pages/jobs-page').then(m => ({ default: m.JobsPage }))
)
const CreditsPage = lazy(() =>
  import('@/pages/credits-page').then(m => ({ default: m.CreditsPage }))
)
const SettingsPage = lazy(() =>
  import('@/pages/settings-page').then(m => ({ default: m.SettingsPage }))
)
const WidgetStudioPage = lazy(() =>
  import('@/components/features/widget-studio/WidgetStudioPage').then(m => ({ default: m.WidgetStudioPage }))
)

// Minimal loading component for lazy-loaded routes
function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )
}

// Track route changes for performance monitoring
function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    const routeName = location.pathname
    startRouteMeasure(routeName)

    // Record shell render after a small delay to allow React to render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        recordShellRender()
      })
    })

    // Dispatch custom event for performance monitor
    window.dispatchEvent(new CustomEvent('routechange', { detail: { routeName } }))
  }, [location.pathname])

  // Record when data is ready (this should be called by data fetching hooks)
  useEffect(() => {
    const handleDataReady = () => recordDataReady()
    window.addEventListener('data-ready', handleDataReady)
    return () => window.removeEventListener('data-ready', handleDataReady)
  }, [])

  return null
}

function App() {
  return (
    <DirectionProvider dir="rtl">
      <TooltipProvider>
        <BrowserRouter>
          <RouteTracker />
          <PerformanceMonitor />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/set-password" element={<SetPasswordPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route
                element={
                  <AuthGate>
                    <SidebarProvider>
                      <AppShell />
                    </SidebarProvider>
                  </AuthGate>
                }
              >
                <Route index element={<Navigate replace to="/dashboard" />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/try-on" element={<Navigate replace to="/products" />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/credits" element={<CreditsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/widget-studio" element={<WidgetStudioPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </DirectionProvider>
  )
}

export default App
