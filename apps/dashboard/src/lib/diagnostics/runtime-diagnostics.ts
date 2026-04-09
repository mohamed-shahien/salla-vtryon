/**
 * Runtime Diagnostics & Status Indicators
 *
 * Provides status indicators and diagnostics for widget runtime health.
 */

export interface DiagnosticStatus {
  healthy: boolean
  lastChecked: Date
  checks: DiagnosticCheck[]
}

export interface DiagnosticCheck {
  name: string
  status: 'pass' | 'fail' | 'warn' | 'unknown'
  message: string
  details?: string
  lastUpdated: Date
}

// ============================================================================
// Store Connection Status
// ============================================================================

export interface StoreConnectionStatus {
  connected: boolean
  storeName: string | null
  lastSync: Date | null
  apiEndpoint: string
  latency: number | null // ms
}

export async function checkStoreConnection(apiUrl: string): Promise<DiagnosticCheck> {
  const startTime = Date.now()

  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })

    const latency = Date.now() - startTime

    if (response.ok) {
      return {
        name: 'store_connection',
        status: 'pass',
        message: 'الاتصال بنظام متجرك يعمل بنجاح',
        details: `سرعة الاستجابة ممتازة (${latency}ms)`,
        lastUpdated: new Date(),
      }
    }

    return {
      name: 'store_connection',
      status: 'fail',
      message: 'تعذر الاتصال بسلة',
      details: `HTTP ${response.status}`,
      lastUpdated: new Date(),
    }
  } catch (error) {
    return {
      name: 'store_connection',
      status: 'fail',
      message: 'فشل الاتصال',
      details: error instanceof Error ? error.message : 'Unknown error',
      lastUpdated: new Date(),
    }
  }
}

// ============================================================================
// Widget Runtime Status
// ============================================================================

export interface WidgetRuntimeStatus {
  loaded: boolean
  scriptInjected: boolean
  initialized: boolean
  errors: string[]
  version: string | null
}

export function checkWidgetRuntime(): DiagnosticCheck {
  const errors: string[] = []

  // Check if script is loaded
  const script = document.querySelector('script[data-merchant-id]')
  if (!script) {
    errors.push('Widget script not found')
  }

  // Check if widget container exists
  const container = document.querySelector('[data-widget-container]')
  if (!container) {
    errors.push('Widget container not initialized')
  }

  // Check for widget errors
  const widgetErrors = (window as any).__widgetErrors || []
  if (widgetErrors.length > 0) {
    errors.push(...widgetErrors)
  }

  return {
    name: 'widget_runtime',
    status: errors.length === 0 ? 'pass' : 'fail',
    message: errors.length === 0 ? 'نظام تجربة القياس جاهز للعمل تماماً' : 'تنبيه: توجد صعوبة في تشغيل الخدمة حالياً',
    details: errors.length === 0 ? 'لا توجد أي مشكلات تقنية مكتشفة' : `الأسباب المكتشفة: ${errors.join(', ')}`,
    lastUpdated: new Date(),
  }
}

// ============================================================================
// Config Status
// ============================================================================

export interface ConfigStatus {
  version: number
  lastPublished: Date | null
  isStale: boolean
  staleReason: string | null
}

export function checkConfigStatus(configVersion: number, lastPublished: Date | null): DiagnosticCheck {
  const now = new Date()
  const isStale = lastPublished
    ? (now.getTime() - lastPublished.getTime()) > 5 * 60 * 1000 // 5 minutes
    : true

  return {
    name: 'config_status',
    status: isStale ? 'warn' : 'pass',
    message: isStale ? 'الإعدادات الحالية قديمة، ننصح بحفظ التعديلات مجدداً' : 'جميع إعداداتك محدثة ومنشورة في المتجر',
    details: lastPublished
      ? `Version: ${configVersion}, Published: ${lastPublished.toLocaleTimeString('ar-SA')}`
      : `Version: ${configVersion}, Never published`,
    lastUpdated: now,
  }
}

// ============================================================================
// Storefront Render Status
// ============================================================================

export interface StorefrontRenderStatus {
  rendered: boolean
  placement: string | null
  visible: boolean
  viewport: { width: number; height: number } | null
}

export function checkStorefrontRenderStatus(): DiagnosticCheck {
  const widget = document.querySelector('[data-widget-container]')

  if (!widget) {
    return {
      name: 'storefront_render',
      status: 'fail',
      message: 'الويدجت لم يتم عرضه',
      details: 'Widget container not found in DOM',
      lastUpdated: new Date(),
    }
  }

  const isVisible = widget.checkVisibility({ checkOpacity: true })
  const placement = widget.getAttribute('data-placement')
  const rect = widget.getBoundingClientRect()

  return {
    name: 'storefront_render',
    status: isVisible ? 'pass' : 'warn',
    message: isVisible ? 'الويدجت ظاهر في المتجر' : 'الويدجت مخفي',
    details: `Placement: ${placement || 'unknown'}, Visible: ${isVisible}, Size: ${rect.width}x${rect.height}`,
    lastUpdated: new Date(),
  }
}

// ============================================================================
// Salla Token Verification Status
// ============================================================================

export interface TokenStatus {
  valid: boolean
  expiresAt: Date | null
  scopes: string[]
}

export function checkSallaTokenStatus(tokenData: {
  valid: boolean
  expiresAt: string | null
  scopes: string[]
}): DiagnosticCheck {
  const now = new Date()
  const expiresAt = tokenData.expiresAt ? new Date(tokenData.expiresAt) : null
  const expiresSoon = expiresAt && (expiresAt.getTime() - now.getTime()) < 24 * 60 * 60 * 1000 // 24 hours

  if (!tokenData.valid) {
    return {
      name: 'salla_token',
      status: 'fail',
      message: 'رمز المصادقة غير صالح',
      details: 'Token invalid or expired',
      lastUpdated: now,
    }
  }

  if (expiresSoon) {
    return {
      name: 'salla_token',
      status: 'warn',
      message: 'رمز المصادقة ينتهق قريباً',
      details: `Expires: ${expiresAt?.toLocaleString('ar-SA')}, Scopes: ${tokenData.scopes.join(', ')}`,
      lastUpdated: now,
    }
  }

  return {
    name: 'salla_token',
    status: 'pass',
    message: 'رمز المصادقة ساري',
    details: `Expires: ${expiresAt?.toLocaleString('ar-SA')}, Scopes: ${tokenData.scopes.join(', ')}`,
    lastUpdated: now,
  }
}

// ============================================================================
// Subscription/Credits Status
// ============================================================================

export interface CreditsStatus {
  remaining: number
  used: number
  total: number
  plan: string | null
  planStatus: string | null
  resetAt: Date | null
}

export function checkCreditsStatus(credits: {
  remaining_credits: number
  used_credits: number
  total_credits: number | null
  reset_at: string | null
}, plan: { plan: string | null; plan_status: string | null }): DiagnosticCheck {
  const remaining = credits.remaining_credits
  const used = credits.used_credits
  const total = credits.total_credits ?? (remaining + used)
  const usagePercent = total > 0 ? (used / total) * 100 : 0

  if (plan.plan_status !== 'active') {
    return {
      name: 'subscription',
      status: 'fail',
      message: 'الباقة غير نشطة',
      details: `Plan: ${plan.plan}, Status: ${plan.plan_status}`,
      lastUpdated: new Date(),
    }
  }

  if (remaining === 0) {
    return {
      name: 'credits',
      status: 'fail',
      message: 'لا يوجد رصيد متاح',
      details: `Used: ${used}/${total}, Reset: ${credits.reset_at ? new Date(credits.reset_at).toLocaleDateString('ar-SA') : 'N/A'}`,
      lastUpdated: new Date(),
    }
  }

  if (remaining < total * 0.1) {
    return {
      name: 'credits',
      status: 'warn',
      message: 'الرصيد منخفض',
      details: `Remaining: ${remaining}/${total} (${Math.round(usagePercent)}% used)`,
      lastUpdated: new Date(),
    }
  }

  return {
    name: 'credits',
    status: 'pass',
    message: 'الرصيد متاح',
    details: `Remaining: ${remaining}/${total}, Plan: ${plan.plan}`,
    lastUpdated: new Date(),
  }
}

// ============================================================================
// Protected Features Availability
// ============================================================================

export interface ProtectedFeatures {
  premiumTemplates: boolean
  premiumAnimations: boolean
  advancedDisplayRules: boolean
  customBranding: boolean
  apiAccess: boolean
}

export function checkProtectedFeatures(subscription: {
  plan: string | null
  plan_status: string | null
}): ProtectedFeatures {
  const isPremium = ['pro', 'enterprise', 'premium'].includes(subscription.plan?.toLowerCase() || '')
  const isActive = subscription.plan_status === 'active'

  return {
    premiumTemplates: isPremium && isActive,
    premiumAnimations: isPremium && isActive,
    advancedDisplayRules: isPremium && isActive,
    customBranding: isActive,
    apiAccess: isPremium && isActive,
  }
}

// ============================================================================
// Full Diagnostic Check
// ============================================================================

export interface FullDiagnostics {
  overall: DiagnosticStatus
  storeConnection: StoreConnectionStatus
  widgetRuntime: WidgetRuntimeStatus
  config: ConfigStatus
  storefrontRender: StorefrontRenderStatus
  token: TokenStatus
  credits: CreditsStatus
  protectedFeatures: ProtectedFeatures
}

export async function runFullDiagnostics(context: {
  apiUrl: string
  configVersion: number
  configLastPublished: Date | null
  tokenData: { valid: boolean; expiresAt: string | null; scopes: string[] }
  credits: { remaining_credits: number; used_credits: number; total_credits: number | null; reset_at: string | null }
  plan: { plan: string | null; plan_status: string | null }
}): Promise<FullDiagnostics> {
  const [
    connectionCheck,
    runtimeCheck,
    configCheck,
    renderCheck,
    tokenCheck,
    creditsCheck,
  ] = await Promise.all([
    checkStoreConnection(context.apiUrl),
    Promise.resolve(checkWidgetRuntime()),
    Promise.resolve(checkConfigStatus(context.configVersion, context.configLastPublished)),
    Promise.resolve(checkStorefrontRenderStatus()),
    Promise.resolve(checkSallaTokenStatus(context.tokenData)),
    Promise.resolve(checkCreditsStatus(context.credits, context.plan)),
  ])

  const checks = [connectionCheck, runtimeCheck, configCheck, renderCheck, tokenCheck, creditsCheck]
  const hasFail = checks.some(c => c.status === 'fail')

  const storeConnection: StoreConnectionStatus = {
    connected: connectionCheck.status === 'pass',
    storeName: null, // Would need to fetch from API
    lastSync: connectionCheck.status === 'pass' ? new Date() : null,
    apiEndpoint: context.apiUrl,
    latency: null, // Extracted from connection check details
  }

  const widgetRuntime: WidgetRuntimeStatus = {
    loaded: document.querySelector('script[data-merchant-id]') !== null,
    scriptInjected: document.querySelector('script[data-merchant-id]') !== null,
    initialized: document.querySelector('[data-widget-container]') !== null,
    errors: runtimeCheck.details ? [runtimeCheck.details] : [],
    version: null, // Would need to fetch from widget
  }

  const config: ConfigStatus = {
    version: context.configVersion,
    lastPublished: context.configLastPublished,
    isStale: configCheck.status === 'warn',
    staleReason: configCheck.status === 'warn' ? (configCheck.details || null) : null,
  }

  const storefrontRender: StorefrontRenderStatus = {
    rendered: renderCheck.status !== 'fail',
    placement: document.querySelector('[data-widget-container]')?.getAttribute('data-placement') || null,
    visible: renderCheck.status === 'pass',
    viewport: renderCheck.status !== 'fail'
      ? { width: window.innerWidth, height: window.innerHeight }
      : null,
  }

  const token: TokenStatus = {
    valid: context.tokenData.valid,
    expiresAt: context.tokenData.expiresAt ? new Date(context.tokenData.expiresAt) : null,
    scopes: context.tokenData.scopes,
  }

  const creditsData: CreditsStatus = {
    remaining: context.credits.remaining_credits,
    used: context.credits.used_credits,
    total: context.credits.total_credits ?? (context.credits.remaining_credits + context.credits.used_credits),
    plan: context.plan.plan,
    planStatus: context.plan.plan_status,
    resetAt: context.credits.reset_at ? new Date(context.credits.reset_at) : null,
  }

  const protectedFeatures = checkProtectedFeatures(context.plan)

  return {
    overall: {
      healthy: !hasFail,
      lastChecked: new Date(),
      checks,
    },
    storeConnection,
    widgetRuntime,
    config,
    storefrontRender,
    token,
    credits: creditsData,
    protectedFeatures,
  }
}

// ============================================================================
// Dashboard Diagnostic UI Data
// ============================================================================

export interface DiagnosticStatusCard {
  id: string
  label: string
  labelAr: string
  status: 'healthy' | 'warning' | 'error'
  icon: string
  message: string
  details: string
  lastUpdated: string
  actionable: boolean
}

export function getDiagnosticStatusCards(diagnostics: FullDiagnostics): DiagnosticStatusCard[] {
  const cards: DiagnosticStatusCard[] = []

  // Store connection
  cards.push({
    id: 'store_connection',
    label: 'Store Connection',
    labelAr: 'جاهزية الاتصال',
    status: diagnostics.overall.checks[0].status === 'pass' ? 'healthy' : 'error',
    icon: 'store',
    message: diagnostics.overall.checks[0].message,
    details: diagnostics.overall.checks[0].details || '',
    lastUpdated: diagnostics.overall.checks[0].lastUpdated.toLocaleTimeString('ar-SA'),
    actionable: diagnostics.overall.checks[0].status !== 'pass',
  })

  // Widget runtime
  cards.push({
    id: 'widget_runtime',
    label: 'Widget Runtime',
    labelAr: 'عمل الخدمة بالمتجر',
    status: diagnostics.overall.checks[1].status === 'pass' ? 'healthy' : 'error',
    icon: 'widget',
    message: diagnostics.overall.checks[1].message,
    details: diagnostics.overall.checks[1].details || '',
    lastUpdated: diagnostics.overall.checks[1].lastUpdated.toLocaleTimeString('ar-SA'),
    actionable: diagnostics.overall.checks[1].status !== 'pass',
  })

  // Config
  cards.push({
    id: 'config_status',
    label: 'Config Status',
    labelAr: 'تحديث الإعدادات',
    status: diagnostics.overall.checks[2].status === 'pass' ? 'healthy' : diagnostics.overall.checks[2].status === 'warn' ? 'warning' : 'error',
    icon: 'settings',
    message: diagnostics.overall.checks[2].message,
    details: diagnostics.overall.checks[2].details || '',
    lastUpdated: diagnostics.overall.checks[2].lastUpdated.toLocaleTimeString('ar-SA'),
    actionable: diagnostics.overall.checks[2].status !== 'pass',
  })

  // Storefront render
  cards.push({
    id: 'storefront_render',
    label: 'Storefront Render',
    labelAr: 'ظهور الزر للعملاء',
    status: diagnostics.overall.checks[3].status === 'pass' ? 'healthy' : diagnostics.overall.checks[3].status === 'warn' ? 'warning' : 'error',
    icon: 'eye',
    message: diagnostics.overall.checks[3].message,
    details: diagnostics.overall.checks[3].details || '',
    lastUpdated: diagnostics.overall.checks[3].lastUpdated.toLocaleTimeString('ar-SA'),
    actionable: false,
  })

  // Token
  cards.push({
    id: 'salla_token',
    label: 'Salla Token',
    labelAr: 'الربط الأمني',
    status: diagnostics.overall.checks[4].status === 'pass' ? 'healthy' : diagnostics.overall.checks[4].status === 'warn' ? 'warning' : 'error',
    icon: 'key',
    message: diagnostics.overall.checks[4].message,
    details: diagnostics.overall.checks[4].details || '',
    lastUpdated: diagnostics.overall.checks[4].lastUpdated.toLocaleTimeString('ar-SA'),
    actionable: diagnostics.overall.checks[4].status !== 'pass',
  })

  // Credits
  cards.push({
    id: 'credits',
    label: 'Credits',
    labelAr: 'رصيد العمليات المتاح',
    status: diagnostics.overall.checks[5].status === 'pass' ? 'healthy' : diagnostics.overall.checks[5].status === 'warn' ? 'warning' : 'error',
    icon: 'credit-card',
    message: diagnostics.overall.checks[5].message,
    details: diagnostics.overall.checks[5].details || '',
    lastUpdated: diagnostics.overall.checks[5].lastUpdated.toLocaleTimeString('ar-SA'),
    actionable: diagnostics.overall.checks[5].status !== 'pass',
  })

  return cards
}
