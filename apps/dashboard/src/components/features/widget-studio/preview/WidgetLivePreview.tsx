/**
 * Widget Live Preview
 *
 * Real-time premium preview component that uses the same rendering logic
 * as the storefront widget. Applies unified config CSS variables dynamically.
 */

import React, { useEffect, useMemo, useRef } from 'react'
import type { WidgetSettings } from '@virtual-tryon/shared-types'
import { generateAllCSSVariables, getWindowPreset } from '@/lib/widget-settings-runtime'
import { cn } from '@/lib/utils'
import type { PreviewDevice } from './PreviewDeviceToggle'

interface WidgetLivePreviewProps {
  config: WidgetSettings
  device: PreviewDevice
}

export const WidgetLivePreview = React.memo(function WidgetLivePreview({
  config,
  device,
}: WidgetLivePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  // Generate CSS variables from unified config
  const cssVariables = useMemo(() => {
    return generateAllCSSVariables(config)
  }, [config])

  // Apply CSS variables to preview container
  useEffect(() => {
    if (!previewRef.current) return

    const container = previewRef.current

    // Apply CSS variables
    Object.entries(cssVariables).forEach(([key, value]) => {
      container.style.setProperty(key, value)
    })

    return () => {
      // Cleanup CSS variables on unmount
      Object.keys(cssVariables).forEach((key) => {
        container.style.removeProperty(key)
      })
    }
  }, [cssVariables])

  // Device-specific dimensions
  const deviceDimensions = useMemo(() => {
    switch (device) {
      case 'mobile':
        return { width: '375px', height: '667px' }
      case 'tablet':
        return { width: '768px', height: '1024px' }
      case 'desktop':
      default:
        return { width: '100%', height: '100%' }
    }
  }, [device])

  return (
    <div className="flex-1 w-full h-full flex flex-col items-stretch overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute -inset-40 bg-linear-to-tr from-primary/10 via-transparent to-primary/5 rounded-full blur-[120px] opacity-20 pointer-events-none" />

      {/* Preview container with CSS variables applied */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-2">
        <div
          ref={previewRef}
          data-widget-container="true"
          data-placement={config.display_rules.placement_target}
          className={cn(
            "relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl transition-all duration-500 ease-in-out",
            "border border-border/40"
          )}
          style={device !== 'desktop' ? { width: deviceDimensions.width, height: deviceDimensions.height } : undefined}
        >
          {/* Diagnostic Script Anchor (Studio Mode) */}
          <script data-merchant-id="studio-preview" shadow-ignore="true" />

          {/* Simulated Store Content */}
          <div className="absolute inset-0 overflow-auto">
            {/* Store Header */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-border/20 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                  <div className="size-4 rounded-full bg-muted-foreground/20" />
                </div>
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-muted rounded-full" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>

            {/* Product Section */}
            <div className="p-4 space-y-4">
              {/* Product Image */}
              <div className="aspect-square bg-linear-to-br from-muted to-muted/50 rounded-xl relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="size-16 rounded-full bg-muted-foreground/10 mx-auto" />
                    <div className="h-3 w-20 bg-muted rounded mx-auto" />
                  </div>
                </div>
                {/* Add to Cart Button (simulated placement target) */}
                <div
                  id="simulated-add-to-cart"
                  className="absolute bottom-4 right-4 left-4"
                >
                  <button className="w-full h-10 bg-foreground text-white rounded-lg text-xs font-black">
                    أضف للسلة
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-2 text-right">
                <div className="h-6 w-3/4 bg-muted rounded mr-auto" />
                <div className="h-4 w-1/2 bg-muted/60 rounded mr-auto" />
                <div className="flex items-center gap-2 pt-2 justify-end">
                  <div className="h-5 w-12 bg-primary/20 rounded text-primary text-xs flex items-center justify-center font-black">
                    100 ر.س
                  </div>
                  <div className="h-4 w-16 bg-muted/40 rounded line-through" />
                </div>
              </div>

              {/* Try-On Widget Preview Overlay */}
              <div
                className={cn(
                  "relative group/preview transition-all duration-300",
                  config.display_rules.placement_target === 'floating-middle' && "fixed inset-0 z-50 flex items-center justify-center pointer-events-none",
                  config.display_rules.placement_target === 'floating-bottom' && "fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                )}
                style={{
                  marginTop: config.display_rules.placement_target === 'above-product-options' ? '0' : '12px',
                  position: config.display_rules.placement_target === 'on-product-image' ? 'absolute' : undefined,
                  top: config.display_rules.placement_target === 'on-product-image' ? '20px' : undefined,
                  right: config.display_rules.placement_target === 'on-product-image' ? '20px' : undefined,
                  zIndex: config.display_rules.placement_target === 'on-product-image' ? 20 : undefined,
                }}
              >
                {/* Widget Launch Button */}
                {/* Launch button itself */}
                <button
                  className={cn(
                    "vtryon-widget__launch inline-flex items-center gap-2 rounded-lg transition-all duration-300",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-black"
                  )}
                  style={{
                    background: 'var(--vtryon-btn-bg)',
                    color: 'var(--vtryon-btn-text)',
                    border: 'var(--vtryon-btn-border)',
                    padding: 'var(--vtryon-btn-padding)',
                    fontSize: 'var(--vtryon-btn-font-size)',
                    width: config.button.full_width ? '100%' : 'auto',
                  }}
                >
                  {/* Icon */}
                  {config.button.icon.enabled && (
                    <span
                      style={{
                        display: 'var(--vtryon-btn-icon-display)',
                        order: 'var(--vtryon-btn-icon-order)',
                      }}
                    >
                      <svg
                        className="size-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </span>
                  )}
                  {config.button.label}
                </button>
              </div>

              {/* Additional Product Details */}
              <div className="pt-4 space-y-3">
                <div className="h-px bg-border/20" />
                <div className="space-y-2 text-right">
                  <div className="h-3 w-1/3 bg-muted rounded mr-auto" />
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-muted/60 rounded" />
                    <div className="h-2 w-full bg-muted/60 rounded" />
                    <div className="h-2 w-2/3 bg-muted/60 rounded mr-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Widget Panel Preview (Always visible over the store in studio mode) */}
          <div
            key={config.window.preset}
            className={cn(
              "absolute inset-0 z-50 flex items-center justify-center p-4",
              "opacity-100 pointer-events-none",
              "transition-opacity duration-300 backdrop-blur-[2px]",
              getWindowPreset(config.window.preset).animationClasses.enter
            )}
            style={{
              background: 'var(--vtryon-backdrop-bg)',
              backdropFilter: 'var(--vtryon-backdrop-filter)',
            }}
          >
            <div
              className={cn(
                "relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden",
                "transform transition-all duration-300 border border-border/40"
              )}
              style={{
                borderRadius: 'var(--vtryon-radius)',
              }}
            >
              {/* Panel Header */}
              <div
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{
                  background: 'var(--vtryon-surface-bg)',
                  borderColor: 'var(--vtryon-surface-border)',
                }}
              >
                <div className="text-right flex-1">
                  <p
                    className="text-[8px] font-black uppercase tracking-widest mb-0.5"
                    style={{ color: 'var(--vtryon-brand-color)' }}
                  >
                    Virtual Try-On
                  </p>
                  <h3 className="text-xs font-black text-foreground">
                    جرّب المنتج على صورتك
                  </h3>
                </div>
                <button
                  className="size-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                  style={{ color: 'var(--vtryon-brand-color)' }}
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Panel Content */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="p-3 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2"
                    style={{ borderColor: 'var(--vtryon-surface-border)', background: 'var(--vtryon-surface-bg)' }}
                  >
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-black">صور نفسك</span>
                  </div>
                  <div
                    className="p-3 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2"
                    style={{ borderColor: 'var(--vtryon-surface-border)', background: 'var(--vtryon-surface-bg)' }}
                  >
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-black">ارفع صورة</span>
                  </div>
                </div>

                <div
                  className="aspect-square rounded-lg bg-muted/10 flex items-center justify-center border"
                  style={{ borderRadius: 'var(--vtryon-radius)', borderColor: 'var(--vtryon-surface-border)' }}
                >
                  <div className="text-center opacity-40">
                    <div className="size-10 rounded-full bg-muted mx-auto mb-2" />
                    <p className="text-[8px] font-black">المعاينة</p>
                  </div>
                </div>

                <button
                  disabled
                  className="w-full h-10 rounded-lg text-xs font-black"
                  style={{
                    background: 'var(--vtryon-brand-color)',
                    color: '#ffffff',
                    borderRadius: 'var(--vtryon-radius)',
                  }}
                >
                  توليد
                </button>
              </div>
            </div>
          </div>

          {/* Device Label */}

          {device !== 'desktop' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/80 text-white text-[10px] font-black backdrop-blur-sm">
              {device === 'mobile' ? 'Mobile Preview' : 'Tablet Preview'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

