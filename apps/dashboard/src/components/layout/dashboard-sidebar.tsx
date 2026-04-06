import { NavLink } from 'react-router-dom'
import { 
  Package, 
  History, 
  Wallet, 
  Settings,
  LayoutDashboard
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
} from '@/components/ui/sidebar'
import { navigationItems } from '@/lib/navigation'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  '/dashboard': LayoutDashboard,
  '/products': Package,
  '/jobs': History,
  '/credits': Wallet,
  '/settings': Settings,
}

export function DashboardSidebar() {
  return (
    <Sidebar className="border-border bg-sidebar" side="right">
      <SidebarHeader className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[10px] bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-black text-lg">VT</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-foreground leading-tight">قياس افتراضي</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-bold">تطبيق سلة</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3 mt-2">
            لوحة التحكم
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navigationItems.map((item) => {
                const Icon = ICON_MAP[item.to] || LayoutDashboard
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-[8px] transition-all duration-200 text-sm font-bold",
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )
                        }
                      >
                        <Icon className={cn("h-4.5 w-4.5 transition-transform", "group-hover:scale-110")} />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ms-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                            {item.badge}
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
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className="rounded-[10px] bg-primary/5 p-4 border border-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1 opacity-10">
             <LayoutDashboard className="h-12 w-12 text-primary" />
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">تزامن المطور</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed relative z-10">
            النظام يعمل بكفاءة عالية وهو متزامن مع سلة.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
