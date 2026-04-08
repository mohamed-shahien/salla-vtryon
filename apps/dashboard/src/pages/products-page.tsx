import { useState, useMemo, useDeferredValue, memo, useCallback, useTransition, useOptimistic } from "react"
import { useNavigate } from "react-router-dom"
import {
  Package,
  Search,
  XCircle,
  Loader2,
  Trash2,
  LayoutGrid,
  List,
  Filter,
  Settings2,
  MoreVertical,
  RefreshCcw,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useSallaProducts } from "@/hooks/use-salla-products"
import { useWidgetSettings } from "@/hooks/use-widget-settings"
import { enableMerchantProducts, disableMerchantProducts, type SallaProduct } from "@/lib/api"
import { cn } from "@/lib/utils"

type FilterStatus = "all" | "enabled" | "disabled"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
  }
}

const itemTransitions = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

// --- Memoized Components ---

const ProductListItem = memo(({
  product,
  isSelected,
  isUpdating,
  onToggle,
  onSelect
}: {
  product: SallaProduct,
  isSelected: boolean,
  isUpdating: boolean,
  onToggle: (id: number, val: boolean) => void,
  onSelect: (id: number) => void
}) => {
  const isEnabled = product.widget_enabled
  const isAvailable = product.is_available

  return (
    <motion.div
      variants={itemTransitions}
      className={cn(
        "group relative flex items-center gap-3 p-2.5 rounded-lg border bg-card/40 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-primary/40",
        isSelected && "border-primary/40 bg-primary/5 shadow-md",
        !isAvailable && "opacity-60 grayscale-[0.3]"
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelect(product.id)}
        className="size-4.5 rounded-lg border-muted-foreground/30 data-[state=checked]:bg-primary transition-all duration-300 group-hover:border-primary/50"
      />

      <div className="relative size-12 shrink-0 rounded-lg overflow-hidden border border-border/20 shadow-inner group-hover:scale-105 transition-transform duration-500">
        <img
          src={product.main_image || ""}
          alt={product.name}
          className="size-full object-cover"
          loading="lazy"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[8px] font-black text-white px-1.5 py-0.5 rounded-lg bg-destructive/80">نفذ</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 text-right pr-1">
        <h4 className="text-[11px] font-black text-foreground group-hover:text-primary transition-colors truncate mb-0.5">{product.name}</h4>
        <div className="flex items-center gap-2 justify-end">
          <span className={cn(
            "text-[8px] font-black flex items-center gap-1 px-1.5 py-0.5 rounded-lg",
            isAvailable ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
          )}>
            <div className={cn("size-1 rounded-full", isAvailable ? "bg-emerald-500" : "bg-destructive")} />
            {isAvailable ? "متوفر" : "غير متوفر"}
          </span>
          <span className="text-[8px] font-bold text-muted-foreground/40 tabular-nums">#{product.id}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 border-r border-border/10 ps-3">
        <div className="hidden sm:flex flex-col items-end gap-0.5 me-2">
          <span className="text-[8px] font-black text-foreground/80">
            {product.price?.amount} {product.price?.currency}
          </span>
          {product.sale_price && (
            <span className="text-[7px] font-black text-emerald-600/70 bg-emerald-500/10 px-1 rounded-lg line-through decoration-emerald-500/40">
              {product.sale_price.amount} {product.sale_price.currency}
            </span>
          )}
        </div>

        <div className="relative flex items-center">
          {isUpdating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -left-6"
            >
              <Loader2 className="size-3 animate-spin text-primary" />
            </motion.div>
          )}
          <Switch
            checked={isEnabled}
            onCheckedChange={(val) => onToggle(product.id, val)}
            disabled={isUpdating}
            className="scale-[0.85] data-[state=checked]:bg-emerald-500 shadow-sm"
          />
        </div>

        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-90 transition-all">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-lg border-border/40 p-1 font-black text-[10px] w-44 shadow-2xl backdrop-blur-2xl bg-card/90" align="end">
            <DropdownMenuItem className="h-9 rounded-lg gap-2 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer">
              <Eye className="size-3.5 opacity-60" /> عرض التفاصيل
            </DropdownMenuItem>
            {product.urls?.customer && (
              <DropdownMenuItem asChild className="h-9 rounded-lg gap-2 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer">
                <a href={product.urls.customer} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5 opacity-60" /> المتجر
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="h-9 rounded-lg gap-2 text-destructive focus:bg-destructive/5 focus:text-destructive transition-colors cursor-pointer">
              <Trash2 className="size-3.5 opacity-60" /> حذف البيانات
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
})

const ProductCard = memo(({
  product,
  isSelected,
  isUpdating,
  onToggle,
  onSelect
}: {
  product: SallaProduct,
  isSelected: boolean,
  isUpdating: boolean,
  onToggle: (id: number, val: boolean) => void,
  onSelect: (id: number) => void
}) => {
  const isEnabled = product.widget_enabled
  const isAvailable = product.is_available
  const hasPromo = !!product.sale_price

  return (
    <motion.div
      variants={itemTransitions}
      className={cn(
        "group relative flex flex-col rounded-lg border bg-card/60 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:border-primary/40 overflow-hidden h-full ring-0 hover:ring-1 hover:ring-primary/20",
        isSelected && "border-primary/50 bg-primary/5 shadow-xl ring-1 ring-primary/30",
        !isAvailable && "opacity-80 grayscale-[0.4]"
      )}
    >
      {/* Dynamic Header Overlay */}
      <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-start justify-between pointer-events-none">
        <Badge className={cn(
          "rounded-lg px-2.5 py-0.5 text-[8px] font-black border-0 shadow-2xl backdrop-blur-2xl transition-all duration-500",
          isEnabled
            ? "bg-emerald-500 text-white shadow-emerald-500/20"
            : "bg-slate-900/80 text-white shadow-black/20"
        )}>
          {isEnabled ? "منشور ومفعل" : "معطل مؤقتاً"}
        </Badge>

        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(product.id)}
          className={cn(
            "size-4.5 rounded-lg border-white/40 bg-black/30 backdrop-blur-xl shadow-2xl transition-all pointer-events-auto",
            isSelected ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
          )}
        />
      </div>

      <div className="aspect-3/4 relative overflow-hidden bg-muted/20">
        <img
          src={product.main_image || ""}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          loading="lazy"
        />

        {/* Floating Price Tag */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-1">
          {hasPromo && (
            <motion.span
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-[7px] font-black bg-white/90 backdrop-blur-sm text-muted-foreground line-through px-1.5 rounded-lg shadow-sm"
            >
              {product.price?.amount} {product.price?.currency}
            </motion.span>
          )}
          <span className={cn(
            "text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xl backdrop-blur-xl border border-white/20",
            hasPromo ? "bg-primary text-white shadow-primary/20" : "bg-white/90 text-foreground"
          )}>
            {hasPromo ? product.sale_price?.amount : product.price?.amount} {(hasPromo ? product.sale_price : product.price)?.currency}
          </span>
        </div>

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <Badge variant="destructive" className="rounded-lg px-4 py-1 font-black text-[10px] shadow-2xl border-0">نفذ من المخزن</Badge>
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-3">
          <Button asChild variant="secondary" className="w-full h-8 rounded-lg font-black text-[9px] bg-white text-black hover:bg-white/90 shadow-2xl">
            <a href={product.urls?.customer} target="_blank" rel="noreferrer">
              <ExternalLink className="me-2 size-3" /> عرض في المتجر
            </a>
          </Button>
        </div>
      </div>

      <div className="flex flex-col p-4 text-right gap-3 grow">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[8px] font-black text-muted-foreground/40 tabular-nums">ID: #{product.id}</span>
            <Badge variant="outline" className={cn(
              "h-4 px-1.5 text-[7px] font-black rounded-lg border-0",
              product.status === 'active' ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"
            )}>
              {product.status === 'active' ? "نشط" : "مخفي"}
            </Badge>
          </div>
          <h4 className="text-[11px] font-black text-foreground group-hover:text-primary transition-colors leading-relaxed line-clamp-2 min-h-[32px]">
            {product.name}
          </h4>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/10">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[8px] font-black text-muted-foreground      leading-none">الحالة بالموقع</span>
            <span className={cn("text-[8px] font-black", isEnabled ? "text-emerald-600" : "text-muted-foreground/60")}>
              {isEnabled ? "منشور حالياً" : "معطل مؤقتاً"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isUpdating && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
                <Loader2 className="size-3 animate-spin text-primary" />
              </motion.div>
            )}
            <Switch
              checked={isEnabled}
              onCheckedChange={(val) => onToggle(product.id, val)}
              disabled={isUpdating}
              className="scale-[0.85] data-[state=checked]:bg-emerald-500 shadow-sm"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
})

ProductListItem.displayName = "ProductListItem"
ProductCard.displayName = "ProductCard"

// --- Main Page Component ---

export function ProductsPage() {
  const navigate = useNavigate()
  const { products, isLoading, mutate: refreshProducts, error: productsError } = useSallaProducts()
  const { mutate: refreshSettings } = useWidgetSettings()

  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isUpdating, setIsUpdating] = useState<number | "bulk" | "sync" | null>(null)

  // React 19 Optimistic State for product IDs that are being toggled
  const [optimisticToggles, addOptimisticToggle] = useOptimistic(
    new Map<number, boolean>(),
    (state, { id, enabled }: { id: number; enabled: boolean }) => {
      const next = new Map(state)
      next.set(id, enabled)
      return next
    }
  )

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12 // Increased for higher density

  const deferredSearch = useDeferredValue(search)

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.map(p => ({
      ...p,
      // Apply optimistic toggle state if present
      widget_enabled: optimisticToggles.has(p.id) ? optimisticToggles.get(p.id)! : p.widget_enabled
    })).filter((p: SallaProduct) => {
      const matchesSearch = p.name.toLowerCase().includes(deferredSearch.toLowerCase()) || p.id.toString().includes(deferredSearch)
      const isEnabled = p.widget_enabled
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "enabled" && isEnabled) ||
        (statusFilter === "disabled" && !isEnabled)
      return matchesSearch && matchesStatus
    })
  }, [products, deferredSearch, statusFilter, optimisticToggles])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage])

  const handleSync = useCallback(async () => {
    setIsUpdating("sync")
    try {
      await refreshProducts()
      await refreshSettings()
    } catch (err) {
      console.error("Sync failed:", err)
    } finally {
      setIsUpdating(null)
    }
  }, [refreshProducts, refreshSettings])

  const toggleProduct = useCallback(async (productId: number, enabled: boolean) => {
    setIsUpdating(productId)
    // React 19 Optimistic Update
    startTransition(() => {
      addOptimisticToggle({ id: productId, enabled })
    })

    try {
      if (enabled) await enableMerchantProducts([productId])
      else await disableMerchantProducts([productId])

      // Background refresh to sync with server truth
      await Promise.all([refreshSettings(), refreshProducts()])
    } catch (error) {
      console.error("Failed to toggle product:", error)
    } finally {
      setIsUpdating(null)
    }
  }, [refreshProducts, refreshSettings, addOptimisticToggle])

  const handleBulkAction = useCallback(async (enabled: boolean) => {
    const ids = Array.from(selectedIds)
    setIsUpdating("bulk")
    try {
      if (enabled) await enableMerchantProducts(ids)
      else await disableMerchantProducts(ids)
      await Promise.all([refreshSettings(), refreshProducts()])
      setSelectedIds(new Set())
    } catch (error) {
      console.error("Bulk action failed:", error)
    } finally {
      setIsUpdating(null)
    }
  }, [selectedIds, refreshProducts, refreshSettings])

  const toggleSelection = useCallback((productId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }, [])

  return (
    <TooltipProvider>
      <div className="space-y-3 animate-in fade-in duration-700 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-border/40 text-right">
          <div className="space-y-1">
            <Badge variant="outline" className="text-[9px] font-black   px-2 py-0.5 bg-primary/5 text-primary border-primary/20 rounded-lg">
              إدارة المحتوى
            </Badge>
            <h1 className="text-xl font-black  leading-tight">كتالوج المنتجات النشط</h1>
            <p className="text-muted-foreground font-bold text-[9px] max-w-xl opacity-70">
              تحكم في ظهور ميزة القياس لكل منتج، قم بالمزامنة مع متجر سلة، وتابع حالة التفعيل.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => void handleSync()}
              disabled={isUpdating === "sync"}
              className="rounded-lg font-black text-[10px] h-9 px-4 shadow-xs bg-card/50 backdrop-blur-sm border-border/60"
            >
              <RefreshCcw className={cn("me-2 size-3.5", isUpdating === "sync" && "animate-spin")} />
              مزامنة سلة
            </Button>
            <Button
              onClick={() => navigate("/settings")}
              className="rounded-lg font-black text-[10px] h-9 px-5 shadow-lg shadow-primary/20 bg-primary transition-all active:scale-95"
            >
              <Settings2 className="me-2 size-3.5" />
              إعدادات الظهور
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col md:flex-row md:items-center gap-2">
            <div className="relative flex-1 group">
              <Search className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors",
                isPending && "animate-pulse text-primary"
              )} />
              <Input
                value={search}
                onChange={(e) => {
                  const val = e.target.value
                  setSearch(val)
                  startTransition(() => {
                    // The deferredSearch handles the actual filtering, 
                    // but startTransition tells React this is a low-priority update
                  })
                }}
                placeholder="ابحث بالاسم، السعر، أو معرف المنتج..."
                className="ps-9 h-10 bg-white shadow-xs border-border/50 focus:ring-primary/20 rounded-lg font-black text-[10px] text-right"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(val) => {
                startTransition(() => {
                  setStatusFilter(val as FilterStatus)
                })
              }}>
                <SelectTrigger className="w-[130px] h-10 rounded-lg font-black text-[10px] bg-white border-border/50 shadow-xs">
                  <Filter className="me-2 size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="حالة الظهور" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-border/40" dir="rtl">
                  <SelectItem value="all" className="font-black text-[10px]">الكل</SelectItem>
                  <SelectItem value="enabled" className="font-black text-[10px]">النشطة</SelectItem>
                  <SelectItem value="disabled" className="font-black text-[10px]">المعطلة</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center bg-muted/40 p-1 rounded-lg border border-border/40 gap-1 h-9">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={cn("size-7 rounded-lg transition-all", viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}
                >
                  <LayoutGrid className="size-3.5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={cn("size-7 rounded-lg transition-all", viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}
                >
                  <List className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-r lg:border-r border-border/20 ps-0 lg:ps-4">
            <div className="flex  items-center gap-3">
              <span className="text-[8px] font-black text-muted-foreground  leading-none">الإجمالي</span>
              <span className="text-xs font-black tabular-nums">{filteredProducts.length}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg size-8"
              onClick={() => { setSearch(""); setStatusFilter("all"); }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className={cn(
            "grid gap-3",
            viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
          )}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Card key={i} className="rounded-lg border-border/40 overflow-hidden bg-card/40 relative">
                <Skeleton className="aspect-3/4 w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-1/4 rounded-lg" />
                    <Skeleton className="h-3 w-1/3 rounded-lg" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <div className="flex justify-between items-center pt-2 border-t">
                    <Skeleton className="h-4 w-1/4 rounded-lg" />
                    <Skeleton className="h-5 w-1/3 rounded-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : productsError ? (
          <Card className="border-destructive/20 bg-destructive/5 rounded-lg p-10 text-center">
            <AlertCircle className="size-12 text-destructive mx-auto mb-4 opacity-40" />
            <h3 className="text-base font-black text-destructive mb-1 ">خطأ في المزامنة</h3>
            <p className="text-[9px] font-black text-destructive/70 mb-6">{productsError.message}</p>
            <Button onClick={() => void handleSync()} variant="outline" className="rounded-lg font-black border-destructive/20 text-destructive h-10 px-8">إعادة مزامنة</Button>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-muted/20 rounded-lg p-16 text-center opacity-60">
            <Package className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-4" />
            <h3 className="text-base font-black text-foreground mb-1">لا توجد منتجات</h3>
            <p className="text-[9px] font-black text-muted-foreground max-w-sm mx-auto">لم نجد أي منتج يطابق خيارات البحث الحالية.</p>
          </Card>
        ) : (
          <div className="space-y-4 text-right">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className={cn(
                "grid gap-2",
                viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
              )}>
              {paginatedProducts.map((product) => (
                viewMode === "list" ? (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    isSelected={selectedIds.has(product.id)}
                    isUpdating={isUpdating === product.id}
                    onToggle={toggleProduct}
                    onSelect={toggleSelection}
                  />
                ) : (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedIds.has(product.id)}
                    isUpdating={isUpdating === product.id}
                    onToggle={toggleProduct}
                    onSelect={toggleSelection}
                  />
                )
              ))}
            </motion.div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/20">
              <div className="text-[9px] font-black text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40  ">
                عرض <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> من <span className="text-primary">{filteredProducts.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="h-8 px-3 rounded-lg font-black text-[9px] bg-background shadow-xs"
                >
                  السابق
                </Button>
                <div className="flex items-center gap-1 bg-muted/20 p-0.5 rounded-lg border border-border/40">
                  {[...Array(Math.min(3, totalPages))].map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === (i + 1) ? "default" : "ghost"}
                      size="icon"
                      onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={cn("size-7 rounded-lg font-black text-[9px]", currentPage === (i + 1) ? "bg-primary text-white" : "")}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  {totalPages > 3 && <span className="px-1 text-[9px] opacity-30">...</span>}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="h-8 px-3 rounded-lg font-black text-[9px] bg-background shadow-xs transition-all"
                >
                  التالي
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Action Bar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0, x: "-50%" }}
              animate={{ y: 0, opacity: 1, x: "-50%" }}
              exit={{ y: 100, opacity: 0, x: "-50%" }}
              className="fixed bottom-6 left-1/2 z-50 rounded-lg border border-primary/20 bg-card/90 p-2 shadow-2xl backdrop-blur-2xl w-[95%] max-w-[420px] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between px-3 h-8">
                <div className="flex items-center gap-2 bg-primary/20 text-primary py-0.5 px-3 rounded-lg border border-primary/10">
                  <Package className="size-3.5" />
                  <span className="text-[10px] font-black">{selectedIds.size} منتجات مختارة</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedIds(new Set())} className="size-8 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                  <XCircle className="size-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => void handleBulkAction(true)}
                  disabled={isUpdating === "bulk"}
                  className="h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] shadow-lg shadow-emerald-600/20"
                >
                  {isUpdating === "bulk" ? <Loader2 className="animate-spin size-3.5 me-2" /> : <CheckCircle2 className="me-2 size-3.5" />}
                  تفعيل الميزة لـ {selectedIds.size}
                </Button>

                <Button
                  onClick={() => void handleBulkAction(false)}
                  disabled={isUpdating === "bulk"}
                  variant="secondary"
                  className="h-10 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-black text-[10px] shadow-lg"
                >
                  {isUpdating === "bulk" ? <Loader2 className="animate-spin size-3.5 me-2" /> : <XCircle className="me-2 size-3.5" />}
                  تعطيل المؤقت
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
