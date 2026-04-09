/**
 * Unified Widget Config Parser & Runtime
 *
 * Parses and applies unified widget settings in the storefront widget.
 * Includes preset resolvers, visual identity tokens, and display rules.
 */

import type {
  WidgetSettings,
  ButtonSettings,
  WindowSettings,
  VisualIdentity,
  DisplayRules,
  RuntimeSafeguards,
  AvailabilityConditions,
  ButtonPresetId,
  WindowPresetId,
  ButtonSize,
  IconPosition,
  ButtonPlacementMode,
  ButtonMobileMode,
  MotionProfile,
  BackdropStyle as WindowBackdropStyle,
  BackdropStyle,
  SurfaceStyle,
  CornerRadius,
  SpacingDensity,
  TypographyTone,
  VisualIntensity,
  IconStyle,
  MotionEnergy,
  StateEmphasis,
  CloseStyle,
  ResultLayout,
  EligibilityMode,
  PlacementTarget,
  DisplayTiming,
  TriggerBehavior,
  FallbackStrategy,
  DeviceVariant,
  LocalizationMode,
  StateMessagingPolicy,
  ZeroCreditBehavior,
} from '@virtual-tryon/shared-types'

export type {
  WidgetSettings,
  ButtonSettings,
  WindowSettings,
  VisualIdentity,
  DisplayRules,
  RuntimeSafeguards,
  AvailabilityConditions,
  ButtonPresetId,
  WindowPresetId,
  ButtonSize,
  IconPosition,
  ButtonPlacementMode,
  ButtonMobileMode,
  MotionProfile,
  WindowBackdropStyle,
  BackdropStyle,
  SurfaceStyle,
  CornerRadius,
  SpacingDensity,
  TypographyTone,
  VisualIntensity,
  IconStyle,
  MotionEnergy,
  StateEmphasis,
  CloseStyle,
  ResultLayout,
  EligibilityMode,
  PlacementTarget,
  DisplayTiming,
  TriggerBehavior,
  FallbackStrategy,
  DeviceVariant,
  LocalizationMode,
  StateMessagingPolicy,
  ZeroCreditBehavior,
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_BUTTON_SETTINGS: ButtonSettings = {
  preset: 'core-solid',
  label: 'جرّب الآن',
  icon: {
    enabled: true,
    name: 'sparkles',
    position: 'start',
  },
  size: 'md',
  placement_mode: 'inline',
  mobile_mode: 'sticky',
  full_width: false,
}

const DEFAULT_WINDOW_SETTINGS: WindowSettings = {
  preset: 'classic-center-modal',
  motion_profile: 'soft-scale',
  backdrop: 'blur-dark',
  close_style: 'icon-top-inline',
  result_layout: 'before-after-prominent',
}

export const createDefaultWidgetSettings = (): WidgetSettings => ({
  schema_version: 2,
  widget_enabled: true,
  button: DEFAULT_BUTTON_SETTINGS,
  window: DEFAULT_WINDOW_SETTINGS,
  visual_identity: {
    brand_color: '#7c3aed',
    surface_style: 'glass',
    corner_radius: 'balanced',
    spacing_density: 'comfortable',
    typography_tone: 'modern',
    visual_intensity: 'balanced',
    icon_style: 'line',
    backdrop_style: 'blur-dark',
    motion_energy: 'smooth',
    state_emphasis: 'result-first',
  },
  display_rules: {
    eligibility_mode: 'all',
    selected_product_ids: [],
    selected_category_ids: [],
    placement_target: 'under-add-to-cart',
    placement_side: 'center',
    vertical_offset: 0,
    horizontal_offset: 0,
    display_timing: 'immediate',
    trigger_behavior: 'auto-render',
    availability_conditions: {
      hide_on_out_of_stock: true,
      hide_on_missing_product_image: true,
      hide_on_unsupported_product_type: false,
      hide_when_merchant_inactive: true,
      hide_when_no_credits: false,
    },
    fallback_strategy: 'chained',
    fallback_selectors: [],
    device_variant: 'same',
    localization_mode: 'auto-by-storefront',
    state_messaging_policy: 'guided',
  },
  runtime_safeguards: {
    zero_credit_behavior: 'disabled-with-message',
    zero_credit_message: 'لقد استهلكت رصيدك. تواصل مع الدعم لشحن إضافي.',
    max_daily_requests: undefined,
    require_product_image: true,
    enable_diagnostics: false,
  },
})

// ============================================================================
// Config Parser
// ============================================================================

export interface UnifiedWidgetConfigResponse {
  schema_version: 2
  settings: WidgetSettings
  current_product_enabled: boolean
  widget_token: string | null
  reason: string | null
}

export function parseWidgetConfigResponse(response: unknown): WidgetSettings | null {
  if (!response || typeof response !== 'object') return null
  const res = response as UnifiedWidgetConfigResponse
  return res.schema_version === 2 && res.settings ? res.settings : null
}

export function isWidgetEnabled(response: unknown): boolean {
  if (!response || typeof response !== 'object') return false
  const res = response as UnifiedWidgetConfigResponse
  return res.current_product_enabled && !!res.widget_token
}

export function getWidgetToken(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null
  return (response as UnifiedWidgetConfigResponse).widget_token
}

export function getConfigReason(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null
  return (response as UnifiedWidgetConfigResponse).reason
}

// ============================================================================
// Button Presets
// ============================================================================

export interface ButtonPreset {
  id: ButtonPresetId
  nameAr: string
  description: string
  styles: {
    background: string
    text: string
    border: string
    hover: {
      background: string
      text: string
      border: string
      shadow: string
    }
    disabled: { opacity: number; grayscale: number }
  }
}

const BUTTON_PRESETS: Record<ButtonPresetId, ButtonPreset> = {
  'core-solid': {
    id: 'core-solid',
    nameAr: 'أساسي صلب',
    description: 'لون أساسي مع رفع خفيف',
    styles: {
      background: '#7c3aed',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: '#6d28d9',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'soft-glow': {
    id: 'soft-glow',
    nameAr: 'توهج ناعم',
    description: 'تدرج لوني مع توهج عند التحويم',
    styles: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 0 20px rgba(102, 126, 234, 0.5)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'glass-air': {
    id: 'glass-air',
    nameAr: 'زجاج هوائي',
    description: 'زجاج شفاف مع ضبابية',
    styles: {
      background: 'rgba(124, 58, 237, 0.1)',
      text: '#7c3aed',
      border: '1px solid rgba(124, 58, 237, 0.2)',
      hover: {
        background: 'rgba(124, 58, 237, 0.2)',
        text: '#6d28d9',
        border: '1px solid rgba(124, 58, 237, 0.4)',
        shadow: '0 8px 32px rgba(124, 58, 237, 0.15)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'outline-pulse': {
    id: 'outline-pulse',
    nameAr: 'حدود نبض',
    description: 'حدود مع حلقة نبض متحركة',
    styles: {
      background: 'transparent',
      text: '#7c3aed',
      border: '2px solid #7c3aed',
      hover: {
        background: '#7c3aed',
        text: '#ffffff',
        border: '2px solid #7c3aed',
        shadow: '0 0 0 3px rgba(124, 58, 237, 0.2)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'premium-gold': {
    id: 'premium-gold',
    nameAr: 'ذهبي فاخر',
    description: 'تدرج ذهبي مع لمعان',
    styles: {
      background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      text: '#1a1a1a',
      border: 'transparent',
      hover: {
        background: 'linear-gradient(135deg, #f5c542 0%, #f89657 100%)',
        text: '#1a1a1a',
        border: 'transparent',
        shadow: '0 4px 15px rgba(246, 211, 101, 0.4)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'mono-sharp': {
    id: 'mono-sharp',
    nameAr: 'أحادي حاد',
    description: 'أبيض وأسود نظيف',
    styles: {
      background: '#1a1a1a',
      text: '#ffffff',
      border: '1px solid #1a1a1a',
      hover: {
        background: '#333333',
        text: '#ffffff',
        border: '1px solid #333333',
        shadow: 'none',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'rounded-soft': {
    id: 'rounded-soft',
    nameAr: 'دائري ناعم',
    description: 'زر حبة مع ظل ناعم',
    styles: {
      background: '#7c3aed',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: '#6d28d9',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 6px 20px rgba(124, 58, 237, 0.25)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'floating-fab': {
    id: 'floating-fab',
    nameAr: 'زر عائم',
    description: 'دائري بارز مع عمق',
    styles: {
      background: '#7c3aed',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: '#6d28d9',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 8px 25px rgba(124, 58, 237, 0.4)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'neon-edge': {
    id: 'neon-edge',
    nameAr: 'حافة نيون',
    description: 'سطح داكن مع حدود مضيئة',
    styles: {
      background: '#0f0f0f',
      text: '#00ff88',
      border: '1px solid #00ff88',
      hover: {
        background: '#1a1a1a',
        text: '#00ff88',
        border: '1px solid #00ff88',
        shadow: '0 0 15px rgba(0, 255, 136, 0.5)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'ghost-highlight': {
    id: 'ghost-highlight',
    nameAr: 'شبح مميز',
    description: 'خفيف مع ملء عند النشاط',
    styles: {
      background: 'rgba(124, 58, 237, 0.05)',
      text: '#7c3aed',
      border: '1px solid transparent',
      hover: {
        background: 'rgba(124, 58, 237, 0.15)',
        text: '#6d28d9',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        shadow: 'none',
      },
      disabled: { opacity: 0.4, grayscale: 0.6 },
    },
  },
  'split-icon': {
    id: 'split-icon',
    nameAr: 'أيقونة منفصلة',
    description: 'كبسولة أيقونة منفصلة مع نص',
    styles: {
      background: '#f3f4f6',
      text: '#1f2937',
      border: '1px solid #e5e7eb',
      hover: {
        background: '#e5e7eb',
        text: '#111827',
        border: '1px solid #d1d5db',
        shadow: 'none',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'elevated-card-cta': {
    id: 'elevated-card-cta',
    nameAr: 'بطاقة مرتفعة',
    description: 'نمط بطاقة مصغرة',
    styles: {
      background: '#ffffff',
      text: '#7c3aed',
      border: '1px solid #e5e7eb',
      hover: {
        background: '#f9fafb',
        text: '#6d28d9',
        border: '1px solid #d1d5db',
        shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'badge-trigger': {
    id: 'badge-trigger',
    nameAr: 'شارة مشغل',
    description: 'شارة أو شريحة صغيرة',
    styles: {
      background: '#7c3aed',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: '#6d28d9',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'underline-motion': {
    id: 'underline-motion',
    nameAr: 'تحت خط متحرك',
    description: 'نص أولاً مع تسطير متحرك',
    styles: {
      background: 'transparent',
      text: '#7c3aed',
      border: 'none',
      hover: {
        background: 'transparent',
        text: '#6d28d9',
        border: 'none',
        shadow: 'none',
      },
      disabled: { opacity: 0.4, grayscale: 0.6 },
    },
  },
  'shimmer-strip': {
    id: 'shimmer-strip',
    nameAr: 'شريط لامع',
    description: 'مرور لامع عند التحويم',
    styles: {
      background: '#7c3aed',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: '#6d28d9',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'gradient-aura': {
    id: 'gradient-aura',
    nameAr: 'هالة متدرجة',
    description: 'تدرج غني مع هالة',
    styles: {
      background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
      text: '#1a1a1a',
      border: 'transparent',
      hover: {
        background: 'linear-gradient(135deg, #ff5252 0%, #ffbd3f 50%, #0abde3 100%)',
        text: '#1a1a1a',
        border: 'transparent',
        shadow: '0 0 25px rgba(255, 107, 107, 0.4)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
  'editorial-minimal': {
    id: 'editorial-minimal',
    nameAr: 'تحريري بسيط',
    description: 'نص أولاً فاخر',
    styles: {
      background: 'transparent',
      text: '#1a1a1a',
      border: '1px solid #1a1a1a',
      hover: {
        background: '#1a1a1a',
        text: '#ffffff',
        border: '1px solid #1a1a1a',
        shadow: 'none',
      },
      disabled: { opacity: 0.4, grayscale: 0.6 },
    },
  },
  'tech-panel': {
    id: 'tech-panel',
    nameAr: 'لوحة تقنية',
    description: 'حدود زاوية مع عمق لوحة',
    styles: {
      background: '#0a0a0a',
      text: '#00f0ff',
      border: '1px solid #00f0ff',
      hover: {
        background: '#111111',
        text: '#00d0e0',
        border: '1px solid #00d0e0',
        shadow: '0 0 15px rgba(0, 240, 255, 0.3)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'soft-outline-fill': {
    id: 'soft-outline-fill',
    nameAr: 'حدود ناعمة ممتلئة',
    description: 'حدود عند الخمول، ممتلئ عند التحويم',
    styles: {
      background: 'transparent',
      text: '#7c3aed',
      border: '1px solid #7c3aed',
      hover: {
        background: '#7c3aed',
        text: '#ffffff',
        border: '1px solid #7c3aed',
        shadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
      },
      disabled: { opacity: 0.5, grayscale: 0.7 },
    },
  },
  'mobile-sticky-cta': {
    id: 'mobile-sticky-cta',
    nameAr: 'زر ثابت للجوال',
    description: 'حبة مثالية للجوال',
    styles: {
      background: '#7c3aed',
      text: '#ffffff',
      border: 'transparent',
      hover: {
        background: '#6d28d9',
        text: '#ffffff',
        border: 'transparent',
        shadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
      },
      disabled: { opacity: 0.6, grayscale: 0.5 },
    },
  },
}

export const getButtonPreset = (presetId: ButtonPresetId): ButtonPreset =>
  BUTTON_PRESETS[presetId] || BUTTON_PRESETS['core-solid']

export const generateButtonCSSVariables = (settings: ButtonSettings): Record<string, string> => {
  const preset = getButtonPreset(settings.preset)
  const sizeMap: Record<ButtonSize, { padding: string; fontSize: string }> = {
    sm: { padding: '8px 16px', fontSize: '13px' },
    md: { padding: '12px 24px', fontSize: '15px' },
    lg: { padding: '16px 32px', fontSize: '17px' },
  }
  return {
    '--vtryon-btn-bg': preset.styles.background,
    '--vtryon-btn-text': preset.styles.text,
    '--vtryon-btn-border': preset.styles.border,
    '--vtryon-btn-hover-bg': preset.styles.hover.background,
    '--vtryon-btn-hover-text': preset.styles.hover.text,
    '--vtryon-btn-hover-border': preset.styles.hover.border,
    '--vtryon-btn-hover-shadow': preset.styles.hover.shadow,
    '--vtryon-btn-disabled-opacity': String(preset.styles.disabled.opacity),
    '--vtryon-btn-disabled-grayscale': String(preset.styles.disabled.grayscale),
    '--vtryon-btn-padding': sizeMap[settings.size].padding,
    '--vtryon-btn-font-size': sizeMap[settings.size].fontSize,
    '--vtryon-btn-full-width': settings.full_width ? '100%' : 'auto',
    '--vtryon-btn-icon-display': settings.icon.enabled ? 'inline-flex' : 'none',
    '--vtryon-btn-icon-order': settings.icon.position === 'start' ? '-1' : '1',
  }
}

// ============================================================================
// Window Presets
// ============================================================================

export interface WindowPreset {
  id: WindowPresetId
  nameAr: string
  description: string
  animationRef: string
  animationClasses: { enter: string; enterActive: string; exit: string; exitActive: string }
}

const WINDOW_PRESETS: Record<WindowPresetId, WindowPreset> = {
  'classic-center-modal': {
    id: 'classic-center-modal',
    nameAr: 'نافذة مركزية كلاسيكية',
    description: 'مركزية، متوازنة، تلاشي وتكبير قياسي',
    animationRef: 'two',
    animationClasses: { enter: 'vtryon-anim--two', enterActive: '', exit: 'is-out', exitActive: '' },
  },
  'soft-scale-dialog': {
    id: 'soft-scale-dialog',
    nameAr: 'حوار ناعم',
    description: 'حوار مدمج مع تكوين ناعم',
    animationRef: 'four',
    animationClasses: { enter: 'vtryon-anim--four', enterActive: '', exit: 'is-out', exitActive: '' },
  },
  'slide-up-sheet': {
    id: 'slide-up-sheet',
    nameAr: 'شريط من الأسفل',
    description: 'ورقة من الأسفل للجوال',
    animationRef: 'three',
    animationClasses: { enter: 'vtryon-anim--three', enterActive: '', exit: 'is-out', exitActive: '' },
  },
  'side-panel-right': {
    id: 'side-panel-right',
    nameAr: 'لوحة جانبية',
    description: 'درج يمين لتدفق منتج حديث',
    animationRef: 'five',
    animationClasses: { enter: 'vtryon-anim--five', enterActive: '', exit: 'is-out', exitActive: '' },
  },
  'premium-lightbox': {
    id: 'premium-lightbox',
    nameAr: 'لوحة فاخرة',
    description: 'وسائط أولاً غامرة',
    animationRef: 'eight',
    animationClasses: { enter: 'vtryon-anim--eight', enterActive: '', exit: 'is-out', exitActive: '' },
  },
  'focus-frame': {
    id: 'focus-frame',
    nameAr: 'إطار التركيز',
    description: 'كروم أقل، تركيز صورة أقوى',
    animationRef: 'six',
    animationClasses: { enter: 'vtryon-anim--six', enterActive: '', exit: 'is-out', exitActive: '' },
  },
  'card-stack-modal': {
    id: 'card-stack-modal',
    nameAr: 'تكديس البطاقات',
    description: 'نمط مدرج متعدد للخطوات',
    animationRef: 'seven',
    animationClasses: { enter: 'vtryon-anim--seven', enterActive: '', exit: 'is-out', exitActive: '' },
  },
  'split-preview-modal': {
    id: 'split-preview-modal',
    nameAr: 'معاينة مقسمة',
    description: 'تقسيم شاشة للمقارنة الجانبية',
    animationRef: 'nine',
    animationClasses: { enter: 'vtryon-anim--nine', enterActive: '', exit: 'is-out', exitActive: '' },
  },
  'progressive-wizard': {
    id: 'progressive-wizard',
    nameAr: 'معالج تصاعدي',
    description: 'تدفق خطوة بخطوة',
    animationRef: 'one',
    animationClasses: { enter: 'vtryon-anim--one', enterActive: '', exit: 'is-out', exitActive: '' },
  },
  'cinematic-overlay': {
    id: 'cinematic-overlay',
    nameAr: 'تراكب سينمائي',
    description: 'كامل الشاشة مع حركات درامية',
    animationRef: 'eight',
    animationClasses: { enter: 'vtryon-anim--eight', enterActive: '', exit: 'is-out', exitActive: '' },
  },
}

export const getWindowPreset = (presetId: WindowPresetId): WindowPreset =>
  WINDOW_PRESETS[presetId] || WINDOW_PRESETS['classic-center-modal']

export const ANIMATION_DURATIONS: Record<string, number> = {
  one: 2000, two: 500, three: 500, four: 500, five: 500, six: 500, seven: 1000, eight: 650, nine: 750,
}

export const getWindowBackdropClass = (backdrop: WindowBackdropStyle): string => {
  const map: Record<WindowBackdropStyle, string> = {
    dim: 'bg-black/60',
    'blur-dark': 'bg-black/40 backdrop-blur-md',
    'blur-light': 'bg-white/50 backdrop-blur-sm',
    gradient: 'bg-gradient-to-b from-black/50 to-black/80',
    none: 'bg-transparent',
  }
  return map[backdrop] || map.dim
}

// ============================================================================
// Visual Identity Generator
// ============================================================================

export const generateVisualIdentityCSSVariables = (settings: VisualIdentity): Record<string, string> => {
  const radiusMap: Record<CornerRadius, string> = { compact: '8px', balanced: '12px', rounded: '16px', 'pill-heavy': '24px' }
  const spacingMap: Record<SpacingDensity, string> = { compact: '12px', comfortable: '16px', spacious: '24px' }
  const backdropFilterMap: Record<BackdropStyle, string> = { dim: 'none', 'blur-dark': 'blur(12px)', 'blur-light': 'blur(8px)', gradient: 'none', none: 'none' }
  const backdropBgMap: Record<BackdropStyle, string> = { dim: 'rgba(0, 0, 0, 0.6)', 'blur-dark': 'rgba(0, 0, 0, 0.4)', 'blur-light': 'rgba(255, 255, 255, 0.4)', gradient: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8))', none: 'transparent' }

  return {
    '--vtryon-brand-color': settings.brand_color,
    '--vtryon-radius': radiusMap[settings.corner_radius],
    '--vtryon-spacing': spacingMap[settings.spacing_density],
    '--vtryon-backdrop-filter': backdropFilterMap[settings.backdrop_style],
    '--vtryon-backdrop-bg': backdropBgMap[settings.backdrop_style],
  }
}

// ============================================================================
// Display Rules Engine
// ============================================================================

export function createDisplayRulesEngine(rules: DisplayRules) {
  const isMobile = window.innerWidth < 768
  const target = isMobile && rules.mobile_placement_target ? rules.mobile_placement_target : rules.placement_target

  const placementSelectors: Record<PlacementTarget, string[]> = {
    'under-add-to-cart': [
      '.btn--add-to-cart',
      'button[data-test="add-to-cart"]',
      '[onclick*="cart.add"]',
      'form[action*="cart"] button[type="submit"]',
      'button:has(.fa-cart-plus)',
    ],
    'above-add-to-cart': [
      '.btn--add-to-cart',
      'button[data-test="add-to-cart"]',
    ],
    'inside-product-actions': [
      '.product-actions',
      '.product__actions',
      '[data-test="product-actions"]',
      '.s-product-actions',
    ],
    'floating-corner': ['body'],
    'sticky-mobile-footer': ['body'],
    'auto-best-fit': [
      '.btn--add-to-cart',
      'button[data-test="add-to-cart"]',
      '[onclick*="cart.add"]',
      'form[action*="cart"] button[type="submit"]',
    ],
  }

  return {
    isEligible: (productId: string) => {
      const id = Number.parseInt(productId, 10)
      return rules.eligibility_mode === 'all' ? true : rules.selected_product_ids.includes(id)
    },
    getPlacementTarget: () => target,
    getPlacementSelectors: () => {
      const selectors = placementSelectors[target] || placementSelectors['under-add-to-cart']
      return [...selectors, ...(rules.fallback_selectors || [])]
    },
    shouldDisplayNow: () => true,
  }
}

// ============================================================================
// Central Var Generator
// ============================================================================

export const generateAllCSSVariables = (settings: WidgetSettings): Record<string, string> => ({
  ...generateButtonCSSVariables(settings.button),
  ...generateVisualIdentityCSSVariables(settings.visual_identity),
  '--vtryon-window-backdrop': getWindowBackdropClass(settings.window.backdrop),
})
