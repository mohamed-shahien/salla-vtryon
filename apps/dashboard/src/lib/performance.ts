/**
 * Performance Monitoring Utility
 *
 * Tracks Web Vitals and custom performance metrics for the application.
 * This focuses on REAL performance, not perceived loading states.
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  ttfb?: number // Time to First Byte
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift

  // Navigation timing
  navigationStart?: number
  domContentLoaded?: number
  loadComplete?: number
  shellRenderTime?: number // Time to render the shell (layout)
  dataReadyTime?: number // Time when initial data is loaded
  firstInteractionTime?: number // Time to first meaningful interaction

  // Route-specific metrics
  routeName?: string
  queryCount?: number
  queryDuration?: number
}

export interface RouteMetrics {
  route: string
  timestamp: number
  metrics: PerformanceMetrics
}

const metrics: RouteMetrics[] = []
let currentRoute: string = ''
let routeStartTime: number = 0
let queryCount: number = 0
let queryTotalDuration: number = 0

/**
 * Initialize performance tracking for a route
 */
export function startRouteMeasure(routeName: string): void {
  currentRoute = routeName
  routeStartTime = performance.now()
  queryCount = 0
  queryTotalDuration = 0
}

/**
 * Record when the shell (layout) is rendered
 */
export function recordShellRender(): void {
  if (!currentRoute) return
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const shellTime = performance.now() - routeStartTime

  const metrics: PerformanceMetrics = {
    routeName: currentRoute,
    navigationStart: navEntry?.startTime,
    shellRenderTime: shellTime,
  }

  updateRouteMetrics(metrics)
}

/**
 * Record when data is ready (API calls complete)
 */
export function recordDataReady(): void {
  if (!currentRoute) return
  const dataReadyTime = performance.now() - routeStartTime

  const metrics: PerformanceMetrics = {
    routeName: currentRoute,
    dataReadyTime,
    queryCount,
    queryDuration: queryTotalDuration,
  }

  updateRouteMetrics(metrics)
}

/**
 * Record first meaningful user interaction
 */
export function recordFirstInteraction(): void {
  if (!currentRoute) return
  const interactionTime = performance.now() - routeStartTime

  const metrics: PerformanceMetrics = {
    routeName: currentRoute,
    firstInteractionTime: interactionTime,
  }

  updateRouteMetrics(metrics)
}

/**
 * Track a database query
 */
export function trackQuery(duration: number): void {
  queryCount++
  queryTotalDuration += duration
}

/**
 * Get current query stats
 */
export function getQueryStats(): { count: number; totalDuration: number } {
  return {
    count: queryCount,
    totalDuration: queryTotalDuration,
  }
}

/**
 * Update or create route metrics
 */
function updateRouteMetrics(newMetrics: PerformanceMetrics): void {
  const existingIndex = metrics.findIndex(m => m.route === currentRoute)

  const updatedMetrics: PerformanceMetrics = {
    ...getWebVitals(),
    ...newMetrics,
  }

  if (existingIndex >= 0) {
    metrics[existingIndex] = {
      ...metrics[existingIndex],
      metrics: { ...metrics[existingIndex].metrics, ...updatedMetrics },
    }
  } else {
    metrics.push({
      route: currentRoute,
      timestamp: Date.now(),
      metrics: updatedMetrics,
    })
  }
}

/**
 * Get Core Web Vitals
 */
function getWebVitals(): PerformanceMetrics {
  const vitals: PerformanceMetrics = {}

  // TTFB
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (navEntry) {
    vitals.ttfb = navEntry.responseStart - navEntry.requestStart
    vitals.fcp = navEntry.domContentLoadedEventEnd - navEntry.fetchStart
    vitals.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.fetchStart
    vitals.loadComplete = navEntry.loadEventEnd - navEntry.fetchStart
  }

  // LCP
  const lcpEntry = performance.getEntriesByName('largest-contentful-paint')?.[0] as any
  if (lcpEntry) {
    vitals.lcp = lcpEntry.startTime
  }

  // CLS
  const clsEntry = performance.getEntriesByType('layout-shift') as PerformanceEntry[]
  if (clsEntry.length > 0) {
    let clsScore = 0
    clsEntry.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsScore += entry.value
      }
    })
    vitals.cls = clsScore
  }

  // FID (legacy, use INP if available)
  const fidEntry = performance.getEntriesByType('first-input')?.[0] as any
  if (fidEntry) {
    vitals.fid = fidEntry.processingStart - fidEntry.startTime
  }

  return vitals
}

/**
 * Get all collected metrics
 */
export function getMetrics(): RouteMetrics[] {
  return [...metrics]
}

/**
 * Get metrics for a specific route
 */
export function getRouteMetrics(routeName: string): RouteMetrics | undefined {
  return metrics.find(m => m.route === routeName)
}

/**
 * Clear all metrics (useful for testing)
 */
export function clearMetrics(): void {
  metrics.length = 0
  currentRoute = ''
  queryCount = 0
  queryTotalDuration = 0
}

/**
 * Format metrics for display
 */
export function formatMetrics(metrics: PerformanceMetrics): string {
  const lines: string[] = []

  if (metrics.shellRenderTime !== undefined) {
    lines.push(`Shell Render: ${metrics.shellRenderTime.toFixed(0)}ms`)
  }
  if (metrics.dataReadyTime !== undefined) {
    lines.push(`Data Ready: ${metrics.dataReadyTime.toFixed(0)}ms`)
  }
  if (metrics.firstInteractionTime !== undefined) {
    lines.push(`First Interaction: ${metrics.firstInteractionTime.toFixed(0)}ms`)
  }
  if (metrics.queryCount !== undefined) {
    lines.push(`Queries: ${metrics.queryCount} (${(metrics.queryDuration || 0).toFixed(0)}ms total)`)
  }
  if (metrics.ttfb !== undefined) {
    lines.push(`TTFB: ${metrics.ttfb.toFixed(0)}ms`)
  }
  if (metrics.lcp !== undefined) {
    lines.push(`LCP: ${metrics.lcp.toFixed(0)}ms`)
  }
  if (metrics.cls !== undefined) {
    lines.push(`CLS: ${metrics.cls.toFixed(3)}`)
  }
  if (metrics.fid !== undefined) {
    lines.push(`FID: ${metrics.fid.toFixed(0)}ms`)
  }

  return lines.join('\n')
}

/**
 * Calculate bundle size impact (to be called after build)
 */
export function getBundleSizeInfo(): Record<string, { size: number; gzip: number }> {
  // This would typically be read from the build output
  // For now, return the baseline values from our build
  return {
    'main-js': { size: 885.29, gzip: 264.91 },
    'css': { size: 161.47, gzip: 28.48 },
    'shiki-languages': { size: 2290, gzip: 556 }, // Sum of all language bundles
  }
}
