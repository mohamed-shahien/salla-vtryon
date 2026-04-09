/**
 * Widget Live Preview
 *
 * Real-time premium preview component that uses the same rendering logic
 * as the storefront widget. Applies unified config CSS variables dynamically.
 */

import React, { useEffect, useMemo, useRef } from 'react'
import type { WidgetSettings } from '@virtual-tryon/shared-types'
import { generateAllCSSVariables } from '@/lib/widget-settings-runtime'
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
          className={cn(
            "relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl transition-all duration-500 ease-in-out",
            "border border-border/40"
          )}
          style={device !== 'desktop' ? { width: deviceDimensions.width, height: deviceDimensions.height } : undefined}
        >
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

              {/* Try-On Widget Preview */}
              <div
                className="relative group/preview"
                style={{
                  marginTop: config.display_rules.placement_target === 'under-add-to-cart' ? '12px' : '0',
                }}
              >
                {/* Widget Launch Button */}
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

                {/* Widget Panel Preview (always visible in studio mode) */}
                <div
                  className={cn(
                    "fixed inset-0 z-50 flex items-center justify-center",
                    "opacity-50 pointer-events-none",
                    "transition-opacity duration-300"
                  )}
                  style={{
                    background: 'var(--vtryon-backdrop-bg)',
                    backdropFilter: 'var(--vtryon-backdrop-filter)',
                  }}
                >
                  <div
                    className={cn(
                      "relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden",
                      "transform transition-all duration-300"
                    )}
                    style={{
                      borderRadius: 'var(--vtryon-radius)',
                      borderColor: 'var(--vtryon-surface-border)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }}
                  >
                    {/* Panel Header */}
                    <div
                      className="px-6 py-4 border-b"
                      style={{
                        background: 'var(--vtryon-surface-bg)',
                        borderColor: 'var(--vtryon-surface-border)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-right">
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: 'var(--vtryon-brand-color)' }}
                          >
                            Virtual Try-On
                          </p>
                          <h3 className="text-sm font-black text-foreground">
                            جرّب المنتج على صورتك
                          </h3>
                        </div>
                        <button
                          className="size-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                          style={{ color: 'var(--vtryon-brand-color)' }}
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Panel Content */}
                    <div className="p-6 space-y-4">
                      {/* Entry Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          className="p-4 rounded-xl border-2 border-dashed transition-all hover:border-primary/50"
                          style={{
                            borderColor: 'var(--vtryon-surface-border)',
                            background: 'var(--vtryon-surface-bg)',
                          }}
                        >
                          <div className="size-12 rounded-full bg-primary/10 mx-auto mb-2 flex items-center justify-center">
                            <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            </svg>
                          </div>
                          <p className="text-xs font-black text-foreground">صور نفسك</p>
                        </button>

                        <button
                          className="p-4 rounded-xl border-2 border-dashed transition-all hover:border-primary/50"
                          style={{
                            borderColor: 'var(--vtryon-surface-border)',
                            background: 'var(--vtryon-surface-bg)',
                          }}
                        >
                          <div className="size-12 rounded-full bg-primary/10 mx-auto mb-2 flex items-center justify-center">
                            <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </div>
                          <p className="text-xs font-black text-foreground">ارفع صورة</p>
                        </button>
                      </div>

                      {/* Preview Area */}
                      <div
                        className="aspect-square rounded-xl bg-muted/30 flex items-center justify-center"
                        style={{
                          borderRadius: 'var(--vtryon-radius)',
                          background: 'var(--vtryon-surface-bg)',
                        }}
                      >
                        <div className="text-center space-y-2">
                          <div className="size-16 rounded-full bg-muted-foreground/10 mx-auto" />
                          <p className="text-[10px] text-muted-foreground font-black">
                            ستظهر صورتك هنا قبل التوليد
                          </p>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        disabled
                        className="w-full h-12 rounded-xl text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
