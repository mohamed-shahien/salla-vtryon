import { AuthGate } from '@/components/auth/auth-gate'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthCallbackPage } from '@/components/auth/auth-callback-page'
import { AppShell } from '@/components/layout/app-shell'
import { CreditsPage } from '@/pages/credits-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { JobsPage } from '@/pages/jobs-page'
import { ProductsPage } from '@/pages/products-page'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider } from '@/components/ui/sidebar'
import { SettingsPage } from '@/pages/settings-page'

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  )
}

export default App
