import { useState, useEffect } from 'react'
import { Bell, RefreshCw, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Premium Arabic Dashboard Header.
 * Handles merchant identity, credits display, and notifications.
 */
export function DashboardHeader() {
  const identity = useAuthStore((state) => state.identity)
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const merchantName = identity?.salla_profile?.merchant.name || 'التاجر'
  const storeName = identity?.merchant.store_name || 'متجري'
  const credits = identity?.credits?.remaining_credits ?? 0

  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/90 px-6 backdrop-blur-xl transition-all duration-300",
      scrolled && "h-14 shadow-sm"
    )}>
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-muted" />
        <div className="h-8 w-px bg-border mx-2 hidden md:block" />
        
        <div className="flex flex-col">
          <span className="text-xs font-black text-foreground uppercase tracking-widest">{storeName}</span>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">متصل ومفعل</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center gap-3 bg-muted/30 px-4 py-1.5 rounded-[10px] border border-border transition-colors hover:bg-muted/50">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">الرصيد المتاح</span>
              <span className="text-xs font-black text-primary">{credits} عملية قياس</span>
           </div>
           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[8px] text-muted-foreground hover:text-primary transition-all active:rotate-180">
              <RefreshCw className="h-3.5 w-3.5" />
           </Button>
        </div>

        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-[12px] text-muted-foreground hover:bg-muted transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary border-2 border-card" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-2 h-11 hover:bg-muted transition-all rounded-[12px]">
              <div className="h-8 w-8 rounded-[10px] bg-linear-to-br from-primary to-primary-foreground flex items-center justify-center text-white font-black text-xs shadow-lg">
                {merchantName.substring(0, 1).toUpperCase()}
              </div>
              <div className="flex flex-col items-start hidden lg:flex">
                <span className="text-xs font-black text-foreground leading-none">{merchantName}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">مدير المتجر</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-[14px] p-2 border-border/40 shadow-2xl backdrop-blur-xl">
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider">حسابي</span>
                <span className="text-[10px] text-muted-foreground font-medium truncate">{identity?.salla_profile?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/20 mx-1" />
            <DropdownMenuItem className="rounded-[10px] py-2.5 px-3 text-xs font-black uppercase tracking-widest group cursor-pointer transition-all hover:translate-x-1">
              <User className="me-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/20 mx-1" />
            <DropdownMenuItem 
              onClick={() => setUnauthenticated()}
              className="rounded-[10px] py-2.5 px-3 text-xs font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 group cursor-pointer transition-all"
            >
              <LogOut className="me-3 h-4 w-4 group-hover:rotate-12 transition-transform" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
