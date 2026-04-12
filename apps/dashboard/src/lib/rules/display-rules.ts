/**
 * Display Rules System
 *
 * Runtime-enforced display rules for widget visibility and placement.
 * Maps display rule settings to actual DOM insertion and visibility logic.
 */

import type {
  DisplayRules,
  PlacementTarget,
  DisplayTiming,
  TriggerBehavior,
  FallbackStrategy,
  LocalizationMode,
  StateMessagingPolicy,
  AvailabilityConditions,
} from "@virtual-tryon/shared-types"

// ============================================================================
// Placement Selector Strategy
// ============================================================================

export interface PlacementSelector {
  primary: string
  fallbacks: string[]
  position: 'before' | 'after' | 'prepend' | 'append'
  container: string | null
}

export const PLACEMENT_SELECTOR_MAP: Record<PlacementTarget, PlacementSelector> = {
  'on-product-image': {
    primary: '.product-single salla-slider.details-slider .s-slider-container',
    fallbacks: [],
    position: 'prepend',
    container: null,
  },
  'above-product-options': {
    primary: '.product-single form.form.product-form',
    fallbacks: [],
    position: 'prepend',
    container: null,
  },
  'description-section': {
    primary: '.product-single .product__description',
    fallbacks: [],
    position: 'before',
    container: null,
  },
  'under-add-to-cart': {
    primary: '.s-product-options-wrapper-add-to-cart',
    fallbacks: ['.s-add-to-cart-container', '[data-add-to-cart-button]', 'button[type="submit"].s-button-primary'],
    position: 'after',
    container: null,
  },
  'floating-bottom': {
    primary: 'body',
    fallbacks: [],
    position: 'append',
    container: 'body',
  },
  'floating-middle': {
    primary: 'body',
    fallbacks: [],
    position: 'append',
    container: 'body',
  },
}

export function getPlacementSelector(target: PlacementTarget, fallbackSelectors: string[] = []): PlacementSelector {
  const base = PLACEMENT_SELECTOR_MAP[target]

  // Merge custom fallback selectors with base fallbacks
  const mergedFallbacks = fallbackSelectors.length > 0
    ? [...new Set([...fallbackSelectors, ...base.fallbacks])]
    : base.fallbacks

  return {
    ...base,
    fallbacks: mergedFallbacks,
  }
}

// ============================================================================
// Display Timing Strategy
// ============================================================================

export interface TimingStrategy {
  method: 'immediate' | 'delayed' | 'event' | 'observer'
  delay?: number
  event?: string
  observerTarget?: string
}

export function getTimingStrategy(timing: DisplayTiming): TimingStrategy {
  switch (timing) {
    case 'immediate':
      return { method: 'immediate' }

    case 'after-page-stable':
      return { method: 'delayed', delay: 300 }

    case 'after-image-gallery-ready':
      return {
        method: 'observer',
        observerTarget: '.product-gallery, .product-images, [data-component="gallery"]',
      }

    case 'after-cta-block-detected':
      return {
        method: 'observer',
        observerTarget: '.product-actions, .add-to-cart, [data-component="add-to-cart"]',
      }
  }
}

// ============================================================================
// Trigger Behavior Strategy
// ============================================================================

export interface TriggerStrategy {
  renderOnLoad: boolean
  renderOnInteraction: boolean
  interactionEvents: string[]
}

export function getTriggerStrategy(behavior: TriggerBehavior): TriggerStrategy {
  switch (behavior) {
    case 'auto-render':
      return {
        renderOnLoad: true,
        renderOnInteraction: false,
        interactionEvents: [],
      }

    case 'user-intent-only':
      return {
        renderOnLoad: false,
        renderOnInteraction: true,
        interactionEvents: ['click', 'hover', 'scroll'],
      }
  }
}

// ============================================================================
// Availability Check Strategy
// ============================================================================

export interface AvailabilityCheck {
  conditions: AvailabilityConditions
  check: (context: AvailabilityContext) => boolean
}

export interface AvailabilityContext {
  productStock?: 'in_stock' | 'out_of_stock' | 'unknown'
  productImage?: string | null
  productType?: string
  merchantActive?: boolean
  creditsRemaining?: number
  locale?: string
}

export function checkAvailability(
  conditions: AvailabilityConditions,
  context: AvailabilityContext
): { eligible: boolean; reason?: string } {
  // Check merchant active status
  if (conditions.hide_when_merchant_inactive && !context.merchantActive) {
    return { eligible: false, reason: 'merchant_inactive' }
  }

  // Check credits
  if (conditions.hide_when_no_credits && (context.creditsRemaining ?? 0) <= 0) {
    return { eligible: false, reason: 'no_credits' }
  }

  // Check product stock
  if (conditions.hide_on_out_of_stock && context.productStock === 'out_of_stock') {
    return { eligible: false, reason: 'out_of_stock' }
  }

  // Check product image
  if (conditions.hide_on_missing_product_image && !context.productImage) {
    return { eligible: false, reason: 'missing_image' }
  }

  // Check unsupported product type (simplified - would need actual type mapping)
  if (conditions.hide_on_unsupported_product_type && context.productType) {
    const unsupportedTypes = ['gift-card', 'digital-download', 'service']
    if (unsupportedTypes.includes(context.productType)) {
      return { eligible: false, reason: 'unsupported_type' }
    }
  }

  return { eligible: true }
}

// ============================================================================
// Fallback Strategy
// ============================================================================

export interface FallbackPlan {
  strategy: FallbackStrategy
  fallbackSelectors: string[]
  floatingConfig?: {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    offset: { x: number; y: number }
  }
}

export function getFallbackPlan(strategy: FallbackStrategy, customSelectors: string[] = []): FallbackPlan {
  return {
    strategy,
    fallbackSelectors: customSelectors,
    floatingConfig: {
      position: 'bottom-right',
      offset: { x: 24, y: 24 },
    },
  }
}

export function tryFallbackInsertion(
  widget: HTMLElement,
  plan: FallbackPlan
): { success: boolean; method?: string } {
  // Try each fallback selector
  for (const selector of plan.fallbackSelectors) {
    const target = document.querySelector(selector)
    if (target) {
      target.insertAdjacentElement('afterend', widget)
      return { success: true, method: `fallback_selector:${selector}` }
    }
  }

  // If chained strategy, try floating
  if (plan.strategy === 'chained' || plan.strategy === 'floating-only') {
    const { floatingConfig } = plan
    if (floatingConfig) {
      widget.style.position = 'fixed'
      widget.style.zIndex = '9999'

      switch (floatingConfig.position) {
        case 'top-left':
          widget.style.top = `${floatingConfig.offset.y}px`
          widget.style.left = `${floatingConfig.offset.x}px`
          break
        case 'top-right':
          widget.style.top = `${floatingConfig.offset.y}px`
          widget.style.right = `${floatingConfig.offset.x}px`
          break
        case 'bottom-left':
          widget.style.bottom = `${floatingConfig.offset.y}px`
          widget.style.left = `${floatingConfig.offset.x}px`
          break
        case 'bottom-right':
          widget.style.bottom = `${floatingConfig.offset.y}px`
          widget.style.right = `${floatingConfig.offset.x}px`
          break
      }

      document.body.appendChild(widget)
      return { success: true, method: 'floating' }
    }
  }

  return { success: false }
}

// ============================================================================
// Device Variant Strategy
// ============================================================================

export interface DeviceConfig {
  isMobile: boolean
  isDesktop: boolean
}

export function getEffectivePlacement(
  rules: DisplayRules,
  device: DeviceConfig
): PlacementTarget {
  const { device_variant, mobile_placement_target, placement_target } = rules

  switch (device_variant) {
    case 'same':
      return placement_target

    case 'dedicated-mobile':
      return device.isMobile ? mobile_placement_target || placement_target : placement_target

    case 'dedicated-desktop':
      return device.isDesktop ? placement_target : mobile_placement_target || placement_target
  }
}

// ============================================================================
// Localization Strategy
// ============================================================================

export interface LocalizationConfig {
  mode: LocalizationMode
  defaultLocale: 'ar' | 'en'
  supportedLocales: ('ar' | 'en')[]
}

export function getEffectiveLocale(
  config: LocalizationConfig,
  storefrontLocale?: string
): 'ar' | 'en' {
  switch (config.mode) {
    case 'arabic-only':
      return 'ar'

    case 'english-only':
      return 'en'

    case 'auto-by-storefront':
      if (storefrontLocale) {
        const locale = storefrontLocale.toLowerCase().slice(0, 2)
        if (locale === 'ar' || locale === 'en') {
          return locale as 'ar' | 'en'
        }
      }
      return config.defaultLocale
  }
}

// ============================================================================
// State Messaging Strategy
// ============================================================================

export const STATE_MESSAGES: Record<StateMessagingPolicy, Record<string, string>> = {
  concise: {
    idle: 'جرّب الآن',
    upload: 'صوّر صورك',
    processing: 'جاري المعالجة...',
    result: 'النتيجة',
    error: 'حدث خطأ',
    no_credits: 'لا يوجد رصيد',
  },

  guided: {
    idle: 'جرّب الملابس افتراضياً',
    upload: 'التقط صورة كاملة لجسمك واضحة الإضاءة',
    processing: 'نستخدم الذكاء الاصطناعي لإنشاء صورتك...',
    result: 'هكذا ستبدو عليه! يمكنك حفظ الصورة.',
    error: 'عذراً، حدث خطأ أثناء المعالجة. حاول مرة أخرى.',
    no_credits: 'لقد استهلكت رصيدك. تواصل مع الدعم لشحن إضافي.',
  },

  'conversion-focused': {
    idle: 'شكّل مظهرك الجديد الآن! ✨',
    upload: 'القط صورة واكتشف جمالك 📸',
    processing: 'نصنع لك تجربة فريدة... ⏳',
    result: 'مذهل! احفظ صورتك الآن 👇',
    error: 'عذراً، لم نتمكن من إكمال التجربة. جرب مرة أخرى.',
    no_credits: 'اشحن رصيدك واستمتع بالتجربة! 💳',
  },
}

export function getStateMessage(policy: StateMessagingPolicy, state: string): string {
  const messages = STATE_MESSAGES[policy]
  return messages[state as keyof typeof messages] || state
}

// ============================================================================
// Runtime Display Rules Engine
// ============================================================================

export interface DisplayRulesEngine {
  shouldDisplay(context: AvailabilityContext): boolean
  getPlacement(device: DeviceConfig): PlacementSelector
  getTiming(): TimingStrategy
  getTrigger(): TriggerStrategy
  getFallbackPlan(): FallbackPlan
  getEffectiveLocale(storefrontLocale?: string): 'ar' | 'en'
  getStateMessage(state: string, locale?: 'ar' | 'en'): string
}

export function createDisplayRulesEngine(rules: DisplayRules): DisplayRulesEngine {
  return {
    shouldDisplay(context: AvailabilityContext): boolean {
      return checkAvailability(rules.availability_conditions, context).eligible
    },

    getPlacement(device: DeviceConfig): PlacementSelector {
      const target = getEffectivePlacement(rules, device)
      return getPlacementSelector(target, rules.fallback_selectors)
    },

    getTiming(): TimingStrategy {
      return getTimingStrategy(rules.display_timing)
    },

    getTrigger(): TriggerStrategy {
      return getTriggerStrategy(rules.trigger_behavior)
    },

    getFallbackPlan(): FallbackPlan {
      return getFallbackPlan(rules.fallback_strategy, rules.fallback_selectors)
    },

    getEffectiveLocale(storefrontLocale?: string): 'ar' | 'en' {
      const config: LocalizationConfig = {
        mode: rules.localization_mode,
        defaultLocale: 'ar',
        supportedLocales: ['ar', 'en'],
      }
      return getEffectiveLocale(config, storefrontLocale)
    },

    getStateMessage(state: string): string {
      return getStateMessage(rules.state_messaging_policy, state)
    },
  }
}

// ============================================================================
// Device Detection
// ============================================================================

export function detectDevice(): DeviceConfig {
  const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  return {
    isMobile,
    isDesktop: !isMobile,
  }
}

// ============================================================================
// Eligibility Check
// ============================================================================

export function checkProductEligibility(
  rules: DisplayRules,
  productId: string,
  productCategories: string[]
): { eligible: boolean; reason?: string } {
  switch (rules.eligibility_mode) {
    case 'all':
      return { eligible: true }

    case 'selected':
      if (rules.selected_product_ids.length === 0) {
        return { eligible: false, reason: 'no_products_selected' }
      }
      const idNum = parseInt(productId, 10)
      if (isNaN(idNum)) {
        return { eligible: false, reason: 'invalid_product_id' }
      }
      const isEligible = rules.selected_product_ids.includes(idNum)
      return {
        eligible: isEligible,
        reason: isEligible ? undefined : 'product_not_selected',
      }

    case 'selected-categories':
      if (rules.selected_category_ids.length === 0) {
        return { eligible: false, reason: 'no_categories_selected' }
      }
      const hasMatchingCategory = productCategories.some(cat =>
        rules.selected_category_ids.includes(cat)
      )
      return {
        eligible: hasMatchingCategory,
        reason: hasMatchingCategory ? undefined : 'category_not_selected',
      }
  }
}
