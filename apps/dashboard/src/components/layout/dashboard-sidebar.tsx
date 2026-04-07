import { NavLink } from "react-router-dom"
import {
  Package,
  History,
  Wallet,
  Settings,
  LayoutDashboard,
  User,
  ExternalLink,
  LifeBuoy,
  Palette
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
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { navigationItems } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const ICON_MAP = {
  "/dashboard": LayoutDashboard,
  "/products": Package,
  "/jobs": History,
  "/credits": Wallet,
  "/profile": User,
  "/widget-studio": Palette,
  "/settings": Settings,
}

export function DashboardSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="icon" side="right" className="border-border">

      <SidebarHeader className="h-14 p-3 border-b border-border/40">
        <div className="flex items-center gap-3 py-1">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20 shadow-lg shadow-primary/20 transition-transform hover:scale-105">
            <AvatarFallback className="bg-linear-to-br from-primary to-primary-foreground text-white font-black text-xs er rounded-lg">
              VT
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <h2 className="text-xs font-black text-foreground leading-tight ">القياس الافتراضي</h2>
            <p className="text-[8px] text-muted-foreground font-bold  mt-0.5">تطبيق سلة المعتمد</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 scrollbar-hide overflow-x-hidden justify-between">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[9px]  text-muted-foreground font-black group-data-[collapsible=icon]:hidden mb-1">
            القائمة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigationItems.map((item) => {
                const Icon = ICON_MAP[item.to as keyof typeof ICON_MAP] || LayoutDashboard
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild tooltip={item.label} className="h-9 hover:bg-transparent">
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 text-[11px] font-black overflow-hidden isolate hover:bg-primary/20",
                            isActive ? "text-primary bg-primary/20" : "text-muted-foreground hover:text-foreground"
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Premium Background Layer */}
                            {isActive && (
                              <motion.div
                                layoutId="sidebar-active"
                                className="absolute inset-0 bg-primary/20 -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}

                            <Icon className={cn(
                              "size-4 z-10 transition-all duration-300 group-hover:scale-110",
                              isActive ? "text-primary" : "opacity-70 group-hover:opacity-100"
                            )} />

                            <span className="z-10 group-data-[collapsible=icon]:hidden whitespace-nowrap">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="ms-auto z-10 group-data-[collapsible=icon]:hidden">
                                <div className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-[8px] font-black border border-primary/20">
                                  {item.badge}
                                </div>
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 opacity-30" />


        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="px-3 text-[9px]  text-muted-foreground font-black mb-2 opacity-50">
            الدعم والمساعدة
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-8 hover:bg-transparent">
                  <a href="https://salla.sa" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all">
                    <ExternalLink className="size-3.5 opacity-60" />
                    <span className="text-[10px] font-bold">مركز مساعدة سلة</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-8 hover:bg-transparent">
                  <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all">
                    <LifeBuoy className="size-3.5 opacity-60" />
                    <span className="text-[10px] font-bold">الدعم الفني للتطبيق</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>


      <SidebarFooter className="p-3 mt-auto border-t border-border/40 bg-muted/5 group-data-[collapsible=icon]:hidden">
        <div className="rounded-lg bg-card p-3 border border-border/40 relative overflow-hidden group shadow-xs hover:border-primary/20 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-600  ">متصل</span>
          </div>
          <p className="text-[10px] font-black text-foreground leading-tight">حالة النظام فعالة</p>
          <p className="text-[8px] font-bold text-muted-foreground leading-relaxed mt-1 opacity-60">تحديث البيانات مستمر</p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
