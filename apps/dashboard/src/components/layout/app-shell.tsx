import { Outlet } from 'react-router-dom'

import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { OnboardingWizard } from '@/components/onboarding-wizard'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth-store'

export function AppShell() {
  const identity = useAuthStore((state) => state.identity)
  const showOnboarding = identity?.merchant?.settings?.onboarding_completed === false

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground" dir="rtl">
        {showOnboarding && <OnboardingWizard />}
        
        <DashboardSidebar />

        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <DashboardHeader />
          
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none opacity-50 z-[-1]">
              <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
              <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-secondary/10 blur-[120px]" />
            </div>

            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-3 duration-500">
               <Outlet />
            </div>
          </main>
          
          <footer className="h-12 border-t border-border px-6 flex items-center justify-between text-[11px] text-muted-foreground uppercase tracking-widest font-semibold bg-muted/50">
            <span>Virtual Try-On for Salla</span>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </footer>
        </SidebarInset>
        
        <div id="notifications-portal" />
      </div>
    </SidebarProvider>
  )
}
