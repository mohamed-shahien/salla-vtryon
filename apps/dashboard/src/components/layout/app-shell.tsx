import { Outlet } from "react-router-dom"

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/auth-store"
import { Toaster } from "@/components/ui/sonner"

export function AppShell() {
  const identity = useAuthStore((state) => state.identity)
  const showOnboarding = identity?.merchant?.settings?.onboarding_completed === false

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/10 selection:text-primary" dir="rtl">
        {showOnboarding && <OnboardingWizard />}

        <DashboardSidebar />

        <SidebarInset className="flex flex-col flex-1 min-w-0 bg-background/50">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto">
            {/* Ambient Background Decoration - Subtle & Premium */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
              <div className="absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
              <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
            </div>

            <div className="mx-auto px-3 md:p-3">
              <Outlet />
            </div>
          </main>


        </SidebarInset>

        {/* Global Notifications */}
        <Toaster position="bottom-left" closeButton richColors dir="rtl" />
      </div>
    </SidebarProvider>
  )
}
