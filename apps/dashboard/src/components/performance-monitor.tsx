/**
 * Development-Only Performance Monitor
 *
 * Displays real-time performance metrics for the current route.
 * Only shown in development mode.
 */

'use client'

import { useEffect, useState } from 'react'
import { getMetrics, formatMetrics, getQueryStats, type PerformanceMetrics } from '@/lib/performance'

if (import.meta.env.DEV) {
  // Expose performance API to window for debugging
  ;(window as any).__PERF__ = {
    getMetrics,
    formatMetrics,
    getQueryStats,
  }
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [queryStats, setQueryStats] = useState({ count: 0, totalDuration: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (import.meta.env.PROD) return

    const updateMetrics = () => {
      const allMetrics = getMetrics()
      const currentRouteMetrics = allMetrics[allMetrics.length - 1]
      if (currentRouteMetrics) {
        setMetrics(currentRouteMetrics.metrics)
      }
      setQueryStats(getQueryStats())
    }

    // Update metrics every second
    const interval = setInterval(updateMetrics, 1000)

    // Update on route changes (custom event)
    const handleRouteChange = () => {
      setTimeout(updateMetrics, 100)
    }
    window.addEventListener('routechange', handleRouteChange)

    // Initial update
    updateMetrics()

    // Keyboard shortcut to toggle
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(v => !v)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearInterval(interval)
      window.removeEventListener('routechange', handleRouteChange)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (import.meta.env.PROD || !isVisible) return null

  if (!metrics) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] bg-black/90 text-green-400 font-mono text-xs p-3 rounded-lg shadow-2xl max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          <span className="font-bold">No metrics yet</span>
        </div>
        <p className="text-gray-400">Navigate to a route to see performance data</p>
        <p className="text-gray-500 mt-2 text-[10px]">Press Ctrl+Shift+P to toggle</p>
      </div>
    )
  }

  const getScoreColor = (value: number, thresholds: { good: number; poor: number }): string => {
    if (value <= thresholds.good) return 'text-green-400'
    if (value <= thresholds.poor) return 'text-yellow-400'
    return 'text-red-400'
  }

  const lcpColor = metrics.lcp !== undefined ? getScoreColor(metrics.lcp, { good: 2500, poor: 4000 }) : 'text-gray-400'
  const fidColor = metrics.fid !== undefined ? getScoreColor(metrics.fid, { good: 100, poor: 300 }) : 'text-gray-400'
  const clsColor = metrics.cls !== undefined ? getScoreColor(metrics.cls * 1000, { good: 100, poor: 250 }) : 'text-gray-400'
  const shellColor = metrics.shellRenderTime !== undefined ? getScoreColor(metrics.shellRenderTime, { good: 100, poor: 300 }) : 'text-gray-400'
  const dataColor = metrics.dataReadyTime !== undefined ? getScoreColor(metrics.dataReadyTime, { good: 500, poor: 1500 }) : 'text-gray-400'

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-black/95 text-white font-mono text-xs p-4 rounded-lg shadow-2xl max-w-sm backdrop-blur-md border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="font-bold text-sm">Performance Monitor</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-1.5 mb-3 pb-3 border-b border-gray-800">
        <div className="flex justify-between">
          <span className="text-gray-400">Route:</span>
          <span className="font-bold text-blue-400">{metrics.routeName || 'unknown'}</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-3 pb-3 border-b border-gray-800">
        <div className="flex justify-between">
          <span className="text-gray-400">Shell Render:</span>
          <span className={shellColor}>
            {metrics.shellRenderTime?.toFixed(0)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Data Ready:</span>
          <span className={dataColor}>
            {metrics.dataReadyTime?.toFixed(0)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">First Interaction:</span>
          <span className="text-gray-300">
            {metrics.firstInteractionTime?.toFixed(0)}ms
          </span>
        </div>
      </div>

      <div className="space-y-1.5 mb-3 pb-3 border-b border-gray-800">
        <div className="flex justify-between">
          <span className="text-gray-400">Queries:</span>
          <span className="text-purple-400 font-bold">
            {queryStats.count}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Query Duration:</span>
          <span className="text-gray-300">
            {queryStats.totalDuration.toFixed(0)}ms
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-gray-400">LCP:</span>
          <span className={lcpColor}>
            {metrics.lcp?.toFixed(0)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">FID:</span>
          <span className={fidColor}>
            {metrics.fid?.toFixed(0)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">CLS:</span>
          <span className={clsColor}>
            {metrics.cls?.toFixed(3)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">TTFB:</span>
          <span className="text-gray-300">
            {metrics.ttfb?.toFixed(0)}ms
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-800">
        <p className="text-gray-500 text-[10px]">
          Press Ctrl+Shift+P to toggle • Access via window.__PERF__
        </p>
      </div>
    </div>
  )
}
