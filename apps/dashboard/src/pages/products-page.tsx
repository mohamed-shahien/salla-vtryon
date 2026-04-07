import { useState, useMemo, useDeferredValue, memo, useCallback } from "react"
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useSallaProducts } from "@/hooks/use-salla-products"
import { useWidgetSettings } from "@/hooks/use-widget-settings"
import { enableMerchantProducts, disableMerchantProducts, type SallaProduct } from "@/lib/api"
import { cn } from "@/lib/utils"

type FilterStatus = "all" | "enabled" | "disabled"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
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
  return (
    <motion.div
      variants={itemTransitions}
      className={cn(
        "group relative flex items-center gap-3 p-2 rounded-xl border bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30",
        isSelected && "border-primary/40 bg-primary/5 shadow-md",
        !product.is_available && "opacity-60"
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelect(product.id)}
        className="size-4 rounded-xl border-muted-foreground/30 data-[state=checked]:bg-primary"
      />
      <Avatar className="size-10 shrink-0 border border-border/20 overflow-hidden">
        <AvatarImage src={product.main_image || ""} alt={product.name} className="object-cover" />
        <AvatarFallback className="rounded-xl bg-muted text-muted-foreground/30">
          <Package className="size-5" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 text-right">
        <h4 className="text-[10px] font-black text-foreground truncate">{product.name}</h4>
        <div className="flex items-center gap-2 justify-end mt-0.5">
          <span className={cn("text-[8px] font-black", product.is_available ? "text-emerald-600" : "text-destructive")}>
            {product.is_available ? "متوفر" : "نفذ"}
          </span>
          <span className="text-[8px] font-bold text-muted-foreground/40">#{product.id}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={isEnabled ? "default" : "secondary"} className={cn(
          "rounded-xl px-2 text-[8px] font-black h-4 border-0 hidden sm:flex",
          isEnabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
        )}>
          {isEnabled ? "مفعل" : "معطل"}
        </Badge>
        <div className="flex items-center gap-2">
          {isUpdating && <Loader2 className="size-3 animate-spin text-primary" />}
          <Switch
            checked={isEnabled}
            onCheckedChange={(val) => onToggle(product.id, val)}
            disabled={isUpdating}
            className="scale-75 data-[state=checked]:bg-emerald-500"
          />
        </div>
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 rounded-xl text-muted-foreground">
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-xl font-black text-[10px] w-40" align="end">
            <DropdownMenuItem className="h-8 rounded-xl"><Eye className="me-2 size-3" /> عرض التفاصيل</DropdownMenuItem>
            {product.urls?.customer && (
              <DropdownMenuItem asChild className="h-8 rounded-xl">
                <a href={product.urls.customer} target="_blank" rel="noreferrer"><ExternalLink className="me-2 size-3" /> المتجر</a>
              </DropdownMenuItem>
            )}
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
  return (
    <motion.div
      variants={itemTransitions}
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card/70 backdrop-blur-md transition-all duration-500 hover:shadow-xl hover:border-primary/40 overflow-hidden h-full",
        isSelected && "border-primary/40 bg-primary/5 shadow-md",
        !product.is_available && "opacity-75"
      )}
    >
      <div className="aspect-4/5 relative overflow-hidden bg-muted/30">
        <Avatar className="size-full rounded-none">
          <AvatarImage
            src={product.main_image || ""}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <AvatarFallback className="rounded-none bg-muted/30 flex items-center justify-center opacity-10">
            <Package className="size-10" />
          </AvatarFallback>
        </Avatar>

        <div className="absolute top-2 right-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(product.id)}
            className={cn(
              "size-4 rounded-xl border-white/40 bg-black/20 backdrop-blur-md shadow-lg transition-all",
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
            )}
          />
        </div>

        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
          <Badge className={cn(
            "rounded-xl px-2 py-0.5 text-[8px] font-black border-0 shadow-lg backdrop-blur-md",
            isEnabled ? "bg-emerald-500 text-white" : "bg-slate-900/80 text-white/50"
          )}>
            {isEnabled ? "منشور" : "مخفي"}
          </Badge>
          {!product.is_available && (
            <Badge className="bg-destructive text-white rounded-xl px-2 py-0.5 text-[8px] font-black border-0">نفذ</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 text-right">
        <h4 className="text-[10px] font-black text-foreground/90 truncate leading-tight mb-1">{product.name}</h4>
        <div className="flex items-center gap-2 justify-end opacity-60">
          <span className="text-[8px] font-black line-through scale-90">
            {product.price?.amount} {product.price?.currency}
          </span>
          {product.sale_price && (
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 rounded-lg border border-emerald-100">
              {product.sale_price.amount} {product.sale_price.currency}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/10">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-muted-foreground   leading-none mb-0.5">القياس</span>
            <span className="text-[8px] font-black text-foreground/70">{isEnabled ? "نشط" : "معطل"}</span>
          </div>
          <div className="flex items-center gap-2">
            {isUpdating && <Loader2 className="size-3 animate-spin text-primary" />}
            <Switch
              checked={isEnabled}
              onCheckedChange={(val) => onToggle(product.id, val)}
              disabled={isUpdating}
              className="scale-75 data-[state=checked]:bg-emerald-500"
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

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isUpdating, setIsUpdating] = useState<number | "bulk" | "sync" | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const deferredSearch = useDeferredValue(search)

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter((p: SallaProduct) => {
      const matchesSearch = p.name.toLowerCase().includes(deferredSearch.toLowerCase()) || p.id.toString().includes(deferredSearch)
      const isEnabled = p.widget_enabled
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "enabled" && isEnabled) ||
        (statusFilter === "disabled" && !isEnabled)
      return matchesSearch && matchesStatus
    })
  }, [products, deferredSearch, statusFilter])

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
    try {
      if (enabled) await enableMerchantProducts([productId])
      else await disableMerchantProducts([productId])
      await Promise.all([refreshSettings(), refreshProducts()])
    } catch (error) {
      console.error("Failed to toggle product:", error)
    } finally {
      setIsUpdating(null)
    }
  }, [refreshProducts, refreshSettings])

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
            <Badge variant="outline" className="text-[9px] font-black   px-2 py-0.5 bg-primary/5 text-primary border-primary/20 rounded-xl">
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
              className="rounded-xl font-black text-[10px] h-9 px-4 shadow-xs bg-card/50 backdrop-blur-sm border-border/60"
            >
              <RefreshCcw className={cn("me-2 size-3.5", isUpdating === "sync" && "animate-spin")} />
              مزامنة سلة
            </Button>
            <Button
              onClick={() => navigate("/settings")}
              className="rounded-xl font-black text-[10px] h-9 px-5 shadow-lg shadow-primary/20 bg-primary transition-all active:scale-95"
            >
              <Settings2 className="me-2 size-3.5" />
              إعدادات الظهور
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col md:flex-row md:items-center gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو المعرف..."
                className="ps-9 h-9 bg-background/50 border-border/60 focus:ring-primary/20 rounded-xl font-bold text-[10px] shadow-sm text-right"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as FilterStatus)}>
                <SelectTrigger className="w-[120px] h-9 rounded-xl font-black text-[10px] bg-background/50 border-border/60">
                  <Filter className="me-2 size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40" dir="rtl">
                  <SelectItem value="all" className="font-black text-[10px]">الكل</SelectItem>
                  <SelectItem value="enabled" className="font-black text-[10px]">النشطة</SelectItem>
                  <SelectItem value="disabled" className="font-black text-[10px]">المعطلة</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/40 gap-1 h-9">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={cn("size-7 rounded-xl transition-all", viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}
                >
                  <LayoutGrid className="size-3.5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={cn("size-7 rounded-xl transition-all", viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}
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
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl size-8"
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
              <Card key={i} className="rounded-xl border-border/40 overflow-hidden bg-card/40">
                <Skeleton className="aspect-4/5 w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-3/4 rounded-xl" />
                  <Skeleton className="h-2.5 w-1/2 rounded-xl" />
                </div>
              </Card>
            ))}
          </div>
        ) : productsError ? (
          <Card className="border-destructive/20 bg-destructive/5 rounded-xl p-10 text-center">
            <AlertCircle className="size-12 text-destructive mx-auto mb-4 opacity-40" />
            <h3 className="text-base font-black text-destructive mb-1 ">خطأ في المزامنة</h3>
            <p className="text-[9px] font-black text-destructive/70 mb-6">{productsError.message}</p>
            <Button onClick={() => void handleSync()} variant="outline" className="rounded-xl font-black border-destructive/20 text-destructive h-10 px-8">إعادة مزامنة</Button>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-muted/20 rounded-xl p-16 text-center opacity-60">
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
              <div className="text-[9px] font-black text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-xl border border-border/40  ">
                عرض <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> من <span className="text-primary">{filteredProducts.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="h-8 px-3 rounded-xl font-black text-[9px] bg-background shadow-xs"
                >
                  السابق
                </Button>
                <div className="flex items-center gap-1 bg-muted/20 p-0.5 rounded-xl border border-border/40">
                  {[...Array(Math.min(3, totalPages))].map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === (i + 1) ? "default" : "ghost"}
                      size="icon"
                      onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={cn("size-7 rounded-xl font-black text-[9px]", currentPage === (i + 1) ? "bg-primary text-white" : "")}
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
                  className="h-8 px-3 rounded-xl font-black text-[9px] bg-background shadow-xs transition-all"
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
              className="fixed bottom-6 left-1/2 z-50 rounded-2xl border border-primary/20 bg-card/90 p-2 shadow-2xl backdrop-blur-2xl w-[95%] max-w-[420px] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between px-3 h-8">
                <div className="flex items-center gap-2 bg-primary/10 text-primary py-0.5 px-3 rounded-xl border border-primary/10">
                  <Package className="size-3.5" />
                  <span className="text-[10px] font-black">{selectedIds.size} منتجات مختارة</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedIds(new Set())} className="size-8 rounded-xl text-muted-foreground hover:text-destructive transition-colors">
                  <XCircle className="size-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => void handleBulkAction(true)}
                  disabled={isUpdating === "bulk"}
                  className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] shadow-lg shadow-emerald-600/20"
                >
                  {isUpdating === "bulk" ? <Loader2 className="animate-spin size-3.5 me-2" /> : <CheckCircle2 className="me-2 size-3.5" />}
                  تفعيل الميزة لـ {selectedIds.size}
                </Button>

                <Button
                  onClick={() => void handleBulkAction(false)}
                  disabled={isUpdating === "bulk"}
                  variant="secondary"
                  className="h-10 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-black text-[10px] shadow-lg"
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
