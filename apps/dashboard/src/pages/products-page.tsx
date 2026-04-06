import { useState, useMemo, useDeferredValue } from 'react'
import { 
  Package, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Trash2,
  Power,
  LayoutGrid,
  List
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Panel } from '@/components/ui/panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useSallaProducts } from '@/hooks/use-salla-products'
import { useWidgetSettings } from '@/hooks/use-widget-settings'
import { enableMerchantProducts, disableMerchantProducts, type SallaProduct } from '@/lib/api'
import { cn } from '@/lib/utils'

type FilterStatus = 'all' | 'enabled' | 'disabled'

export function ProductsPage() {
  const { products, isLoading } = useSallaProducts()
  const { settings, mutate: refreshSettings } = useWidgetSettings()
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isUpdating, setIsUpdating] = useState<number | 'bulk' | null>(null)

  const deferredSearch = useDeferredValue(search)

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter((p: SallaProduct) => {
      const matchesSearch = p.name.toLowerCase().includes(deferredSearch.toLowerCase())
      
      const isEnabled = settings?.widget_products?.includes(p.id) || false
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'enabled' && isEnabled) || 
                           (statusFilter === 'disabled' && !isEnabled)
      
      return matchesSearch && matchesStatus
    })
  }, [products, deferredSearch, statusFilter, settings])

  const toggleProduct = async (productId: number, enabled: boolean) => {
    setIsUpdating(productId)
    try {
      if (enabled) {
        await enableMerchantProducts([productId])
      } else {
        await disableMerchantProducts([productId])
      }
      await refreshSettings()
    } catch (error) {
      console.error('Failed to toggle product:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleBulkAction = async (enabled: boolean) => {
    const ids = Array.from(selectedIds)
    setIsUpdating('bulk')
    try {
      if (enabled) {
        await enableMerchantProducts(ids)
      } else {
        await disableMerchantProducts(ids)
      }
      await refreshSettings()
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const toggleSelection = (productId: number) => {
    const next = new Set(selectedIds)
    if (next.has(productId)) next.delete(productId)
    else next.add(productId)
    setSelectedIds(next)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <Panel
        eyebrow="لوحة التحكم"
        title="إدارة المنتجات"
        description="تحكم في المنتجات التي تظهر عليها ميزة القياس الافتراضي في متجرك."
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mt-6">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن اسم المنتج..."
              className="ps-4 pe-10 h-11 bg-muted/20 border-border focus:ring-primary rounded-[8px] font-bold text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
             <div className="flex items-center bg-muted/30 p-1 rounded-[10px] border border-border">
                {(['all', 'enabled', 'disabled'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "px-4 py-1.5 rounded-[7px] text-[11px] font-black uppercase tracking-widest transition-all",
                      statusFilter === s 
                        ? "bg-card text-primary shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s === 'all' ? 'الكل' : s === 'enabled' ? 'مفعل' : 'معطل'}
                  </button>
                ))}
             </div>

             <div className="h-8 w-px bg-border mx-2" />

             <div className="flex items-center bg-muted/30 p-1 rounded-[10px] border border-border">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-1.5 rounded-[7px] transition-all", viewMode === 'grid' ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-1.5 rounded-[7px] transition-all", viewMode === 'list' ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}
                >
                  <List className="h-4 w-4" />
                </button>
             </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
             <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8" />
             </div>
             <h3 className="text-sm font-black text-foreground uppercase tracking-widest">لم يتم العثور على أي منتجات</h3>
             <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-wider">جرب مصطلح بحث مختلف أو قم بتغيير الفلتر.</p>
          </div>
        ) : (
          <div className={cn(
            "mt-8",
            viewMode === 'grid' ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-3"
          )}>
            {filteredProducts.map((product: SallaProduct) => {
              const isEnabled = settings?.widget_products?.includes(product.id) || false
              const isSelected = selectedIds.has(product.id)
              
              if (viewMode === 'list') {
                return (
                  <div key={product.id} className={cn(
                    "flex items-center gap-4 p-3 rounded-[10px] border border-border bg-muted/10 transition-all hover:bg-muted/20 group",
                    isSelected && "border-primary bg-primary/5"
                  )}>
                     <div className="h-12 w-12 rounded-[8px] bg-muted border border-border overflow-hidden shrink-0">
                        {product.main_image ? (
                          <img src={product.main_image} alt={product.name} className="h-full w-full object-cover" />
                        ) : <Package className="h-full w-full p-3 text-muted-foreground/30" />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-foreground truncate uppercase tracking-wider">{product.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">#{product.id}</p>
                     </div>
                     <div className="flex items-center gap-6">
                        <Badge variant={isEnabled ? 'default' : 'secondary'} className="rounded-full px-4 text-[9px] font-black uppercase tracking-widest">
                           {isEnabled ? 'مفعل' : 'معطل'}
                        </Badge>
                        <Switch 
                          checked={isEnabled} 
                          onCheckedChange={(val: boolean) => toggleProduct(product.id, val)}
                          disabled={isUpdating === product.id}
                        />
                        <button 
                          onClick={() => toggleSelection(product.id)}
                          className={cn("p-1.5 rounded-full transition-all", isSelected ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted")}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                     </div>
                  </div>
                )
              }

              return (
                <div 
                  key={product.id} 
                  className={cn(
                    "group relative flex flex-col rounded-[12px] border border-border bg-card transition-all hover:shadow-xl hover:border-primary/20",
                    isSelected && "border-primary ring-1 ring-primary"
                  )}
                >
                  <div className="aspect-3/4 relative overflow-hidden rounded-t-[11px] bg-muted/30">
                    {product.main_image ? (
                      <img 
                        src={product.main_image} 
                        alt={product.name} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center opacity-20">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                       <Button 
                         variant="secondary" 
                         size="sm" 
                         className="w-full text-[10px] h-8 font-black uppercase tracking-widest bg-white/10 text-white backdrop-blur-md border-0 hover:bg-white/20"
                       >
                         عرض التفاصيل
                       </Button>
                    </div>

                    <button 
                      onClick={() => toggleSelection(product.id)}
                      className={cn(
                        "absolute top-3 right-3 h-7 w-7 rounded-full shadow-lg transition-all flex items-center justify-center",
                        isSelected ? "bg-primary text-white scale-110" : "bg-white/90 text-slate-400 opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>

                    <div className="absolute top-3 left-3">
                       <Badge variant={isEnabled ? 'default' : 'secondary'} className="rounded-[6px] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest shadow-lg">
                         {isEnabled ? 'مفعل' : 'معطل'}
                       </Badge>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4 justify-between">
                    <div>
                      <h4 className="text-[11px] font-black text-foreground truncate uppercase tracking-widest">{product.name}</h4>
                      <p className="mt-1 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">#{product.id}</p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ظهور في المتجر</span>
                      <Switch 
                        checked={isEnabled}
                        onCheckedChange={(val: boolean) => toggleProduct(product.id, val)}
                        disabled={isUpdating === product.id}
                        className="scale-90"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 overflow-hidden rounded-[16px] border border-primary/30 bg-card/80 p-1.5 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-1.5 px-3 py-1">
              <div className="bg-primary/10 text-primary px-3 py-2 rounded-[10px] flex items-center gap-2">
                 <Package className="h-4 w-4" />
                 <span className="text-xs font-black uppercase tracking-widest">{selectedIds.size} مختار</span>
              </div>
              
              <div className="h-6 w-px bg-border mx-2" />
              
              <Button 
                onClick={() => handleBulkAction(true)} 
                disabled={isUpdating === 'bulk'}
                variant="ghost"
                className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all rounded-[10px]"
              >
                {isUpdating === 'bulk' ? <Loader2 className="h-3 w-3 animate-spin me-2" /> : <Power className="h-3 w-3 me-2" />}
                تفعيل المختار
              </Button>
              
              <Button 
                onClick={() => handleBulkAction(false)} 
                disabled={isUpdating === 'bulk'}
                variant="ghost"
                className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive transition-all rounded-[10px]"
              >
                {isUpdating === 'bulk' ? <Loader2 className="h-3 w-3 animate-spin me-2" /> : <Trash2 className="h-3 w-3 me-2" />}
                تعطيل المختار
              </Button>
              
              <div className="h-6 w-px bg-border mx-2" />

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedIds(new Set())}
                className="h-10 w-10 text-muted-foreground hover:bg-muted rounded-[10px]"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
