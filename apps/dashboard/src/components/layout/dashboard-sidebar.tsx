import { NavLink } from "react-router-dom"
import {
  Package,
  History,
  Wallet,
  Settings,
  LayoutDashboard,
  ExternalLink,
  LifeBuoy
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
  SidebarSeparator
} from "@/components/ui/sidebar"
import { navigationItems } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { useDirection } from "@/components/ui/direction"

const ICON_MAP = {
  "/dashboard": LayoutDashboard,
  "/products": Package,
  "/jobs": History,
  "/credits": Wallet,
  "/settings": Settings,
}

export function DashboardSidebar() {
  const dir = useDirection()
  const isRTL = dir === "rtl"

  return (
    <Sidebar variant="sidebar" collapsible="icon" side="right" className="border-border">
      {/* Sidebar Header / Logo */}
      <SidebarHeader className="h-14 p-3 border-b border-border/40">
        <div className="flex items-center gap-3 py-1">
          <div className="h-9 w-9 rounded-lg bg-linear-to-br from-primary to-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 scale-110">
            <span className="text-white font-black text-sm tracking-tighter">VT</span>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <h2 className="text-sm font-black text-foreground leading-tight tracking-tight">القياس الافتراضي</h2>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-0.5">تطبيق سلة المعتمد</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 scrollbar-hide overflow-x-hidden justify-between">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-black group-data-[collapsible=icon]:hidden">
            القائمة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navigationItems.map((item) => {
                const Icon = ICON_MAP[item.to as keyof typeof ICON_MAP] || LayoutDashboard
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild tooltip={item.label} className="h-10 hover:bg-transparent">
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-black relative overflow-hidden group",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                          )
                        }
                      >
                        <Icon className={cn("size-4.5 transition-colors group-hover:scale-105")} />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        
                        {/* Active Indicator */}
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              "absolute top-0 bottom-0 w-1 bg-primary rounded-full transition-opacity",
                              isRTL ? "right-0" : "left-0",
                              isActive ? "opacity-100" : "opacity-0"
                            )
                          }
                        />

                        {item.badge && (
                          <span className="ms-auto group-data-[collapsible=icon]:hidden">
                            <div className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-[9px] font-black group-data-[active=true]:bg-white/20 group-data-[active=true]:text-white">
                              {item.badge}
                            </div>
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-6 opacity-30" />

        {/* Secondary Links Group */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-black mb-3 mt-2">
            خيارات إضافية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-9 hover:bg-transparent">
                  <a href="https://salla.sa" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all">
                    <ExternalLink className="size-4" />
                    <span className="text-sm font-bold">مركز مساعدة سلة</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-9 hover:bg-transparent">
                  <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all">
                    <LifeBuoy className="size-4" />
                    <span className="text-sm font-bold">الدعم الفني للتطبيق</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer - System Status */}
      <SidebarFooter className="p-3 mt-auto border-t border-border/40 bg-muted/10 group-data-[collapsible=icon]:hidden">
        <div className="rounded-lg bg-linear-to-br from-card to-muted/20 p-3 border border-border/40 relative overflow-hidden group shadow-sm transition-all hover:border-primary/20">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center transition-transform group-hover:rotate-6 duration-500 mb-3">
            <LayoutDashboard className="size-5 text-primary" />
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">متزامن ومستقر</span>
          </div>
          <div className="mt-2 space-y-1 relative z-10">
            <p className="text-[11px] font-bold text-foreground leading-tight">الربط مع سلة فعال</p>
            <p className="text-[9px] text-muted-foreground leading-relaxed mt-1 opacity-70">
              يتم تحديث البيانات لحظياً لضمان تجربة مستخدم مثالية.
            </p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
