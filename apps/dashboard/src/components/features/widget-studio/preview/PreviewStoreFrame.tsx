import React, { useState } from 'react'
import { ShoppingCart, Heart, Share2, Star, Camera, X, Shirt } from 'lucide-react'
import { cn } from '@/lib/utils'

import type { WidgetStudioConfig } from '../schema/widget-studio.schema'
import type { PreviewDevice } from './PreviewDeviceToggle'

interface PreviewStoreFrameProps {
  config: WidgetStudioConfig
  device: PreviewDevice
}

/** Resolve border-radius from corner_style */
function getRadius(style: string) {
  if (style === 'compact') return '4px'
  if (style === 'soft') return '14px'
  return '8px'
}

/** Resolve box-shadow from shadow_intensity */
function getShadow(intensity: string) {
  if (intensity === 'none') return 'none'
  if (intensity === 'subtle') return '0 2px 8px rgba(0,0,0,0.08)'
  if (intensity === 'medium') return '0 4px 20px rgba(0,0,0,0.12)'
  return '0 8px 32px rgba(0,0,0,0.2)'
}

/** Resolve padding from spacing_density */
function getPadding(density: string) {
  if (density === 'compact') return '8px'
  if (density === 'spacious') return '16px'
  return '12px'
}

/** Resolve button visual */
function getButtonSize(size: string) {
  if (size === 'sm') return { h: 28, px: 12, text: '9px' }
  if (size === 'lg') return { h: 40, px: 20, text: '12px' }
  return { h: 34, px: 16, text: '10px' }
}

export const PreviewStoreFrame = React.memo(function PreviewStoreFrame({
  config,
  device,
}: PreviewStoreFrameProps) {
  const [showDialog, setShowDialog] = useState(false)
  const { launch, placement, appearance, access } = config
  const isDisabled = launch.mode === 'disabled'

  const accent = appearance.accent_color
  const radius = getRadius(appearance.corner_style)
  const shadow = getShadow(appearance.shadow_intensity)
  const padding = getPadding(appearance.spacing_density)
  const btnSize = getButtonSize(launch.button_size)
  
  const isMobile = device === 'mobile'
  const isTablet = device === 'tablet'

  // Dimensions based on device
  const frameWidth = isMobile ? 310 : isTablet ? 580 : '100%'

  // Determine trigger position based on placement
  const triggerPosition: React.CSSProperties = (() => {
    if (placement.type === 'over_image') {
      const anchor = placement.image_anchor
      const pos: React.CSSProperties = { position: 'absolute', zIndex: 10 }
      if (anchor.includes('top')) pos.top = 8
      if (anchor.includes('bottom')) pos.bottom = 8
      if (anchor.includes('left')) pos.left = 8
      if (anchor.includes('right')) pos.right = 8
      if (anchor === 'center') {
        pos.top = '50%'
        pos.left = '50%'
        pos.transform = 'translate(-50%, -50%)'
      }
      return pos
    }
    if (placement.type === 'sticky_side') {
      return {
        position: 'absolute',
        [placement.side === 'right' ? 'right' : 'left']: -4,
        top: placement.vertical_offset || 80,
        zIndex: 20,
      }
    }
    if (placement.type === 'bottom_float') {
      return {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
      }
    }
    // below_gallery
    return {}
  })()

  const isOverlay = placement.type === 'over_image' || placement.type === 'sticky_side'
  const isFloat = placement.type === 'bottom_float'

  // Widget trigger button
  const TriggerButton = (
    <button
      onClick={() => !isDisabled && setShowDialog(true)}
      style={{
        backgroundColor: appearance.button_style === 'filled' ? accent : 'transparent',
        color: appearance.button_style === 'filled' ? '#fff' : accent,
        border: appearance.button_style === 'outline' ? `2px solid ${accent}` : appearance.button_style === 'ghost' ? 'none' : 'none',
        borderRadius: radius,
        height: btnSize.h,
        paddingInline: btnSize.px,
        fontSize: btnSize.text,
        boxShadow: shadow,
        padding: isFloat ? `${padding} 16px` : undefined,
        width: isFloat ? '100%' : undefined,
      }}
      className={cn(
        "font-black flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer whitespace-nowrap",
        isDisabled && "opacity-30 pointer-events-none"
      )}
    >
      {launch.button_icon && <Camera className="size-3" />}
      {launch.button_label}
    </button>
  )

  return (
    <div className="relative w-full flex justify-center">
      {/* Store Frame */}
      <div
        className={cn(
          "bg-white rounded-xl border border-border/40 overflow-hidden relative transition-all duration-500 shadow-xl",
          isMobile || isTablet ? "mx-auto" : "w-full"
        )}
        style={{ 
          width: frameWidth,
          minHeight: isMobile ? 420 : 360 
        }}
      >
        {/* -- Store Header -- */}
        <div className="h-9 bg-linear-to-l from-muted/60 to-muted/30 border-b border-border/20 flex items-center justify-between px-3">
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-red-400" />
            <div className="size-1.5 rounded-full bg-yellow-400" />
            <div className="size-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="h-4 w-32 bg-muted/50 rounded-md" />
          <ShoppingCart className="size-3.5 text-muted-foreground" />
        </div>

        <div className={cn("p-4", isMobile ? "space-y-4" : "grid grid-cols-2 gap-4 items-start")}>
          {/* -- Product Image Area -- */}
          <div className="relative">
            <div className={cn(
              "bg-linear-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden border border-border/20 flex items-center justify-center transition-all duration-500",
              isMobile ? "aspect-square" : "aspect-4/5"
            )}>
              {/* Product image placeholder */}
              <div className="text-center space-y-2 opacity-40">
                <Shirt className="size-16 mx-auto text-muted-foreground" />
                <p className="text-[10px] font-black text-muted-foreground">صورة المنتج التجريبية</p>
              </div>

              {/* Gallery dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                <div className="size-1.5 rounded-full bg-foreground/60" />
                <div className="size-1.5 rounded-full bg-foreground/20" />
                <div className="size-1.5 rounded-full bg-foreground/20" />
              </div>
            </div>

            {/* Over-image or sticky-side trigger */}
            {isOverlay && !isDisabled && (
              <div style={triggerPosition}>{TriggerButton}</div>
            )}
          </div>

          {/* -- Product Info -- */}
          <div className="space-y-3 text-right">
            <div className="flex items-center gap-1 justify-end">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="size-3 text-amber-400 fill-amber-400" />
              ))}
              <span className="text-[9px] text-muted-foreground font-black mr-1">(124 تقييم)</span>
            </div>
            <h3 className="font-black text-sm text-slate-800">فستان سهرة كلاسيكي</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">
              هذا عرض تجريبي لكيفية ظهور الويدجت على منتجاتك. التصميم متوافق مع كافة العناصر.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs font-black text-slate-800">٢٤٩ ر.س</span>
              <span className="text-[10px] text-muted-foreground line-through opacity-50">٣٤٩ ر.س</span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button className="size-8 rounded-lg border border-border/40 flex items-center justify-center hover:bg-muted/30 transition-colors">
                <Heart className="size-4 text-muted-foreground" />
              </button>
              <button className="size-8 rounded-lg border border-border/40 flex items-center justify-center hover:bg-muted/30 transition-colors">
                <Share2 className="size-4 text-muted-foreground" />
              </button>
              <button className="flex-1 h-8 rounded-lg bg-slate-800 text-white text-[10px] font-black flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
                <ShoppingCart className="size-4" />
                أضف للسلة
              </button>
            </div>

            {/* Below-gallery trigger */}
            {placement.type === 'below_gallery' && !isDisabled && (
              <div className="pt-2">{TriggerButton}</div>
            )}

            {/* Access rule hint */}
            {access.require_login && (
              <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/50 text-[9px] font-black text-amber-700 text-center animate-in fade-in zoom-in duration-300">
                🔒 {access.login_helper_text}
              </div>
            )}
          </div>
        </div>

        {/* Bottom float trigger */}
        {isFloat && !isDisabled && (
          <div style={triggerPosition} className="p-3 border-t border-border/20 bg-white">
            {TriggerButton}
          </div>
        )}

        {/* Sticky side trigger */}
        {placement.type === 'sticky_side' && !isDisabled && (
          <div style={triggerPosition}>{TriggerButton}</div>
        )}
      </div>

      {/* -- Dialog Preview Overlay -- */}
      {showDialog && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-xs rounded-xl overflow-hidden animate-in fade-in duration-300"
          onClick={() => setShowDialog(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-border/30 relative animate-in zoom-in-95 duration-300 shadow-2xl"
            style={{
              width: config.dialog.width === 'sm' ? (isMobile ? '80%' : '60%') : config.dialog.width === 'lg' ? '90%' : config.dialog.width === 'full' ? '95%' : '75%',
              borderRadius: radius,
              boxShadow: shadow,
              padding,
              maxHeight: '90%',
            }}
          >
            <button
              onClick={() => setShowDialog(false)}
              className="absolute top-2 left-2 size-6 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="size-3.5 text-muted-foreground" />
            </button>

            <div className="text-right space-y-3 pt-2">
              <div className="flex items-center gap-2 justify-end">
                <Camera className="size-5" style={{ color: accent }} />
                <h4 className="font-black text-sm text-slate-800">القياس الافتراضي</h4>
              </div>

              <div className="aspect-3/4 max-h-56 rounded-xl bg-linear-to-br from-slate-100 to-slate-50 border border-border/20 flex items-center justify-center shadow-inner">
                <div className="text-center space-y-2 opacity-40">
                  <Camera className="size-10 mx-auto text-muted-foreground" />
                  <p className="text-[9px] font-black text-muted-foreground">قم برفع صورتك لبدء التجربة</p>
                </div>
              </div>

              <button
                style={{
                  backgroundColor: accent,
                  borderRadius: radius,
                  boxShadow: shadow,
                }}
                className="w-full h-9 text-white font-black text-[11px] flex items-center justify-center gap-2 mt-2 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <Camera className="size-4" />
                ابدأ التجربة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})


