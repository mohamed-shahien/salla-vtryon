export interface NavigationItem {
  to: string
  label: string
  badge?: string
}

export const navigationItems: NavigationItem[] = [
  { to: '/dashboard', label: 'نظرة عامة' },
  { to: '/products', label: 'إدارة المنتجات' },
  { to: '/jobs', label: 'سجل العمليات' },
  { to: '/credits', label: 'الرصيد والاشتراك' },
  { to: '/profile', label: 'الملف الشخصي' },
  { to: '/settings', label: 'الإعدادات' },
]
