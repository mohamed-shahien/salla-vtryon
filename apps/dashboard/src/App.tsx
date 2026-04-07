import { AuthGate } from '@/components/auth/auth-gate'
import { PerformanceMonitor } from '@/components/performance-monitor'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { startRouteMeasure, recordShellRender, recordDataReady } from '@/lib/performance'

import { AuthCallbackPage } from '@/components/auth/auth-callback-page'
import { AppShell } from '@/components/layout/app-shell'
import { CreditsPage } from '@/pages/credits-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { JobsPage } from '@/pages/jobs-page'
import { ProductsPage } from '@/pages/products-page'
import { DirectionProvider } from '@/components/ui/direction'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider } from '@/components/ui/sidebar'
import { SettingsPage } from '@/pages/settings-page'
import { WidgetStudioPage } from '@/components/features/widget-studio/WidgetStudioPage'
import { LoginPage } from '@/pages/auth/login-page'
import ForgotPasswordPage from '@/pages/auth/forgot-password-page'
import SetPasswordPage from '@/pages/auth/set-password-page'
import ResetPasswordPage from '@/pages/auth/reset-password-page'

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
        </BrowserRouter>
      </TooltipProvider>
    </DirectionProvider>
  )
}

export default App
