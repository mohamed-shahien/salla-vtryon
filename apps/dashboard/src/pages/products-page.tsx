import { useState, useMemo, useDeferredValue } from "react"
import {
  Package,
  Search,
  XCircle,
  Loader2,
  Trash2,
  LayoutGrid,
  List,
  Filter,
  ArrowLeft,
  Settings2,
  ChevronRight,
  MoreVertical,
  Plus
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"
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
  Pagination,
  PaginationContent,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSallaProducts } from "@/hooks/use-salla-products"
import { useWidgetSettings } from "@/hooks/use-widget-settings"
import { enableMerchantProducts, disableMerchantProducts, type SallaProduct } from "@/lib/api"
import { cn } from "@/lib/utils"

type FilterStatus = "all" | "enabled" | "disabled"

export function ProductsPage() {
  const { products, isLoading } = useSallaProducts()
  const { settings, mutate: refreshSettings } = useWidgetSettings()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isUpdating, setIsUpdating] = useState<number | "bulk" | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const deferredSearch = useDeferredValue(search)

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter((p: SallaProduct) => {
      const matchesSearch = p.name.toLowerCase().includes(deferredSearch.toLowerCase())
      const isEnabled = settings?.widget_products?.includes(p.id) || false
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "enabled" && isEnabled) ||
        (statusFilter === "disabled" && !isEnabled)
      return matchesSearch && matchesStatus
    })
  }, [products, deferredSearch, statusFilter, settings])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage])

  const toggleProduct = async (productId: number, enabled: boolean) => {
    setIsUpdating(productId)
    try {
      if (enabled) await enableMerchantProducts([productId])
      else await disableMerchantProducts([productId])
      await refreshSettings()
    } catch (error) {
      console.error("Failed to toggle product:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleBulkAction = async (enabled: boolean) => {
    const ids = Array.from(selectedIds)
    setIsUpdating("bulk")
    try {
      if (enabled) await enableMerchantProducts(ids)
      else await disableMerchantProducts(ids)
      await refreshSettings()
      setSelectedIds(new Set())
    } catch (error) {
      console.error("Bulk action failed:", error)
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
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs font-black text-muted-foreground animate-pulse uppercase tracking-widest">جاري تحميل المنتجات...</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-border/40">
        <div className="space-y-1">
          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/5 text-primary border-primary/20 rounded-lg">
            إدارة المتجر
          </Badge>
          <h1 className="text-2xl font-black tracking-tight leading-tight">المنتجات والمخزون</h1>
          <p className="text-muted-foreground font-medium text-xs max-w-xl text-right">
            تحكم في ظهور ميزة القياس الافتراضي على منتجات متجرك.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-lg font-black text-xs h-10 px-4 shadow-xs">
            <Settings2 className="me-2 size-4" />
            الإعدادات
          </Button>
          <Button className="rounded-lg font-black text-xs h-10 px-4 shadow-lg shadow-primary/20 bg-primary">
            <Plus className="me-2 size-4" />
            تفعيل سريع
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-md rounded-lg">
        <CardContent className="p-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-1 flex-col md:flex-row md:items-center gap-3 max-w-3xl">
              <div className="relative flex-1 group min-w-[300px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن منتج..."
                  className="ps-10 h-10 bg-background border-border/60 focus:ring-primary/20 rounded-lg font-bold text-xs shadow-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as FilterStatus)}>
                  <SelectTrigger className="w-[140px] h-10 rounded-lg font-black text-xs bg-background shadow-xs border-border/60">
                    <Filter className="me-2 size-3.5 text-muted-foreground" />
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-border/40 shadow-xl" dir="rtl">
                    <SelectItem value="all" className="font-bold">جميع المنتجات</SelectItem>
                    <SelectItem value="enabled" className="font-bold">المفعلة</SelectItem>
                    <SelectItem value="disabled" className="font-bold">المعطلة</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center bg-muted/20 p-1 rounded-lg border border-border/40 gap-1 h-10">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={cn("size-8 rounded-lg transition-all", viewMode === "grid" ? "bg-white text-primary shadow-xs" : "text-muted-foreground")}
                  >
                    <LayoutGrid className="size-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={cn("size-8 rounded-lg transition-all", viewMode === "list" ? "bg-white text-primary shadow-xs" : "text-muted-foreground")}
                  >
                    <List className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest me-2">
                {filteredProducts.length} منتج
              </span>
              <Button variant="ghost" size="icon" className="text-muted-foreground rounded-lg size-8" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid/List */}
      {filteredProducts.length === 0 ? (
        <Card className="border-border/40 bg-card/30 backdrop-blur-md rounded-lg">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center p-3">
            <Package className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
            <h3 className="text-base font-black text-foreground">لم يتم العثور على أي منتجات</h3>
            <Button variant="link" className="text-primary font-black mt-2 h-auto p-0 text-xs" onClick={() => { setSearch(""); setStatusFilter("all"); }}>إعادة ضبط الفلاتر</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 text-right">
          <div className={cn(
            "grid gap-3",
            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}>
            {paginatedProducts.map((product) => {
              const isEnabled = settings?.widget_products?.includes(product.id) || false
              const isSelected = selectedIds.has(product.id)
              const isCurrentlyUpdating = isUpdating === product.id

              if (viewMode === "list") {
                return (
                  <motion.div
                    layout key={product.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "group relative flex items-center gap-3 p-3 rounded-lg border bg-card transition-all hover:bg-muted/5",
                      isSelected && "border-primary/40 bg-primary/3"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(product.id)}
                      className="size-4 rounded-sm"
                    />
                    <div className="h-10 w-10 rounded-lg bg-muted border border-border/40 overflow-hidden shrink-0 shadow-xs">
                      {product.main_image ? (
                        <img src={product.main_image} alt={product.name} className="h-full w-full object-cover" />
                      ) : <Package className="h-full w-full p-2 text-muted-foreground/20" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-foreground truncate">{product.name}</h4>
                      <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 justify-start">
                        <span className="text-emerald-600">متوفر</span>
                        <span className="opacity-20">|</span>
                        <span>{product.price?.amount || 0} {product.price?.currency || "ر.س"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-2">
                      <Badge variant={isEnabled ? "default" : "secondary"} className={cn(
                        "rounded-full px-2 text-[8px] font-black h-4",
                        isEnabled ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : ""
                      )}>
                        {isEnabled ? "نشط" : "معطل"}
                      </Badge>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(val) => toggleProduct(product.id, val)}
                        disabled={isCurrentlyUpdating}
                        className="scale-75"
                      />
                      <DropdownMenu dir="rtl">
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 rounded-sm text-muted-foreground">
                            <MoreVertical className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-lg">
                          <DropdownMenuItem className="text-xs font-bold">معاينة</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-xs font-bold text-destructive">تعطيل</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                )
              }

              return (
                <motion.div
                  layout key={product.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "group relative flex flex-col rounded-lg border bg-card transition-all hover:border-primary/30",
                    isSelected && "border-primary bg-primary/2"
                  )}
                >
                  <div className="aspect-3/4 relative overflow-hidden rounded-t-[7px] bg-muted/20">
                    {product.main_image ? (
                      <img
                        src={product.main_image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center opacity-10">
                        <Package className="size-8" />
                      </div>
                    )}

                    <div className="absolute top-2 right-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelection(product.id)}
                        className={cn("size-5 rounded-lg", isSelected ? "" : "opacity-0 group-hover:opacity-100")}
                      />
                    </div>

                    <div className="absolute top-2 left-2">
                      <Badge className={cn(
                        "rounded-lg px-2 py-0.5 text-[8px] font-black",
                        isEnabled ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300"
                      )}>
                        {isEnabled ? "نشط" : "معطل"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-3 text-right">
                    <h4 className="text-xs font-black text-foreground truncate ">{product.name}</h4>
                    <div className="flex items-center gap-3 mt-0.5 justify-start">
                      <span className="text-[9px] font-bold text-muted-foreground opacity-60">#{product.id}</span>
                      <span className="text-[9px] font-black text-primary">{product.price?.amount} {product.price?.currency}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
                      <span className="text-[9px] font-black text-foreground uppercase tracking-widest">ميزة القياس</span>
                      <div className="flex items-center gap-3">
                        {isCurrentlyUpdating && <Loader2 className="size-3 animate-spin text-primary" />}
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(val) => toggleProduct(product.id, val)}
                          disabled={isCurrentlyUpdating}
                          className="scale-90"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 border-t border-border/40">
            <div className="text-[10px] font-bold text-muted-foreground">
              عرض {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} من {filteredProducts.length}
            </div>

            <Pagination>
              <PaginationContent className="gap-1">
                <Button
                  variant="ghost" size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="size-8 rounded-lg"
                >
                  <ChevronRight className="size-3.5" />
                </Button>
                <span className="text-[10px] font-black px-2">{currentPage} / {totalPages || 1}</span>
                <Button
                  variant="ghost" size="icon"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="size-8 rounded-lg"
                >
                  <ArrowLeft className="size-3.5" />
                </Button>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 50, opacity: 0, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 rounded-lg border border-primary/20 bg-background/95 p-1.5 shadow-2xl backdrop-blur-md w-[320px]"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-primary text-white py-1 px-3 rounded-lg shadow-lg">
                <Package className="size-3.5" />
                <span className="text-[10px] font-black">{selectedIds.size}</span>
              </div>

              <div className="h-6 w-px bg-border/40" />

              <Button
                onClick={() => handleBulkAction(true)}
                disabled={isUpdating === "bulk"}
                size="sm"
                className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px]"
              >
                تفعيل
              </Button>

              <Button
                onClick={() => handleBulkAction(false)}
                disabled={isUpdating === "bulk"}
                size="sm"
                className="flex-1 h-8 rounded-lg bg-destructive hover:bg-destructive/90 text-white font-black text-[10px]"
              >
                تعطيل
              </Button>

              <Button
                variant="ghost" size="icon"
                onClick={() => setSelectedIds(new Set())}
                className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-lg"
              >
                <XCircle className="size-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
