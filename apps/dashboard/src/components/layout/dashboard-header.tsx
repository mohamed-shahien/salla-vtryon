import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  User,
  Wallet
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/stores/auth-store"
import { navigationItems } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const location = useLocation()
  const identity = useAuthStore((state) => state.identity)
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const merchantName = identity?.salla_profile?.merchant?.name || "التاجر"
  const credits = identity?.credits?.remaining_credits ?? 0

  const currentPath = location.pathname
  const currentItem = navigationItems.find(item => item.to === currentPath) || navigationItems[0]

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 md:h-16 w-full items-center justify-between border-b border-border bg-card/90 px-3 backdrop-blur-xl transition-all duration-300",
        scrolled && "h-12 md:h-14 shadow-sm"
      )}
    >
      {/* Right Side (Breadcrumbs & Trigger) */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ms-1 md:ms-0" />
        <Separator orientation="vertical" className="mx-2 h-4 hidden md:block" />

        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard" className="flex items-center gap-3">
                  <LayoutDashboard className="size-3.5" />
                  <span>الرئيسية</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold flex items-center gap-1">
                {currentItem.label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Left Side (Credits, Notifications, User) */}
      <div className="flex items-center gap-3 md:gap-3">
        {/* Credits Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-xl border border-border transition-colors hover:bg-muted/50 group">
          <Badge variant="outline" className="h-6 gap-3 bg-background/50 border-primary/20 text-primary font-black py-0 px-2 rounded-full">
            <RefreshCw className="size-3 transition-transform group-hover:rotate-180 duration-500" />
            {credits}
          </Badge>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">رصيد القياس</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10 text-muted-foreground hover:bg-muted hover:text-foreground transition-all rounded-xl">
          <Bell className="size-5" />
          <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-11 gap-3 px-2 hover:bg-muted transition-all rounded-xl group">
              <div className="h-8 w-8 rounded-xl bg-linear-to-br from-primary to-primary-foreground flex items-center justify-center text-white font-black text-xs shadow-lg transition-transform group-hover:scale-105">
                {merchantName.substring(0, 1).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col items-start gap-0.5">
                <span className="text-xs font-black text-foreground leading-none">{merchantName}</span>
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">إدارة المتجر</span>
              </div>
              <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 border-border/40 shadow-2xl backdrop-blur-xl">
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">صاحب المتجر</span>
                <span className="text-xs font-bold truncate">{identity?.salla_profile?.email || "merchant@salla.sa"}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/20 mx-1" />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="rounded-xl py-2 px-3 text-xs font-black uppercase tracking-widest group cursor-pointer">
                <User className="me-3 size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span>الملف الشخصي</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/credits" className="rounded-xl py-2 px-3 text-xs font-black uppercase tracking-widest group cursor-pointer">
                <Wallet className="me-3 size-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                <span>الرصيد والاشتراك</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/20 mx-1" />
            <DropdownMenuItem
              onClick={() => setUnauthenticated()}
              className="rounded-xl py-2 px-3 text-xs font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 group cursor-pointer transition-all"
            >
              <LogOut className="me-3 size-4 group-hover:translate-x-0.5 transition-transform" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
