/**
 * Unified Widget Settings Schema
 * 
 * Centralized source of truth for all widget configuration.
 * Consumed by: Dashboard (Studio), API (Validation), Storefront Widget (Runtime).
 */

import { z } from 'zod'

// ============================================================================
// Button Preset System
// ============================================================================

export const BUTTON_PRESET_IDS = [
  'core-solid',
  'soft-glow',
  'glass-air',
  'outline-pulse',
  'premium-gold',
  'mono-sharp',
  'rounded-soft',
  'floating-fab',
  'neon-edge',
  'ghost-highlight',
  'split-icon',
  'elevated-card-cta',
  'badge-trigger',
  'underline-motion',
  'shimmer-strip',
  'gradient-aura',
  'editorial-minimal',
  'tech-panel',
  'soft-outline-fill',
  'mobile-sticky-cta',
] as const
export type ButtonPresetId = (typeof BUTTON_PRESET_IDS)[number]

export const BUTTON_SIZE_OPTIONS = ['sm', 'md', 'lg'] as const
export type ButtonSize = (typeof BUTTON_SIZE_OPTIONS)[number]

export const ICON_POSITION_OPTIONS = ['start', 'end'] as const
export type IconPosition = (typeof ICON_POSITION_OPTIONS)[number]

export const BUTTON_PLACEMENT_MODE_OPTIONS = ['inline', 'floating'] as const
export type ButtonPlacementMode = (typeof BUTTON_PLACEMENT_MODE_OPTIONS)[number]

export const BUTTON_MOBILE_MODE_OPTIONS = ['inline', 'sticky'] as const
export type ButtonMobileMode = (typeof BUTTON_MOBILE_MODE_OPTIONS)[number]

export const buttonSettingsSchema = z.object({
  preset: z.enum(BUTTON_PRESET_IDS),
  label: z.string().min(1).max(40),
  icon: z.object({
    enabled: z.boolean(),
    name: z.string().optional(),
    position: z.enum(ICON_POSITION_OPTIONS),
  }),
  size: z.enum(BUTTON_SIZE_OPTIONS),
  placement_mode: z.enum(BUTTON_PLACEMENT_MODE_OPTIONS),
  mobile_mode: z.enum(BUTTON_MOBILE_MODE_OPTIONS),
  full_width: z.boolean(),
})

export type ButtonSettings = z.infer<typeof buttonSettingsSchema>

// ============================================================================
// Window/Modal Preset System
// ============================================================================
export const WINDOW_PRESET_IDS = [
  'one',
  'two',
  'three',
  'four',
  'classic-center-modal',
  'soft-scale-dialog',
  'slide-up-sheet',
  'side-panel-right',
  'premium-lightbox',
  'focus-frame',
  'card-stack-modal',
  'split-preview-modal',
  'progressive-wizard',
  'cinematic-overlay',
] as const
export type WindowPresetId = (typeof WINDOW_PRESET_IDS)[number]

export const MOTION_PROFILE_OPTIONS = [
  'cinematic',
  'soft-scale',
  'slide-up',
  'side-drawer',
  'zoom-in',
  'fade-scale',
  'minimal',
  'lively',
] as const
export type MotionProfile = (typeof MOTION_PROFILE_OPTIONS)[number]

export const BACKDROP_STYLE_OPTIONS = ['dim', 'blur-dark', 'blur-light', 'gradient', 'none'] as const
export type BackdropStyle = (typeof BACKDROP_STYLE_OPTIONS)[number]

export const CLOSE_STYLE_OPTIONS = [
  'icon-top-inline',
  'icon-top-corner',
  'icon-bottom-right',
  'text-only',
] as const
export type CloseStyle = (typeof CLOSE_STYLE_OPTIONS)[number]

export const RESULT_LAYOUT_OPTIONS = [
  'before-after-prominent',
  'side-by-side',
  'stacked',
  'result-first',
  'upload-first',
] as const
export type ResultLayout = (typeof RESULT_LAYOUT_OPTIONS)[number]

export const windowSettingsSchema = z.object({
  preset: z.enum(WINDOW_PRESET_IDS),
  motion_profile: z.enum(MOTION_PROFILE_OPTIONS),
  backdrop: z.enum(BACKDROP_STYLE_OPTIONS),
  close_style: z.enum(CLOSE_STYLE_OPTIONS),
  result_layout: z.enum(RESULT_LAYOUT_OPTIONS),
})

export type WindowSettings = z.infer<typeof windowSettingsSchema>

// ============================================================================
// Visual Identity Token System
// ============================================================================

export const SURFACE_STYLE_OPTIONS = ['solid', 'soft', 'elevated', 'glass', 'outline'] as const
export type SurfaceStyle = (typeof SURFACE_STYLE_OPTIONS)[number]

export const CORNER_RADIUS_OPTIONS = ['compact', 'balanced', 'rounded', 'pill-heavy'] as const
export type CornerRadius = (typeof CORNER_RADIUS_OPTIONS)[number]

export const SPACING_DENSITY_OPTIONS = ['compact', 'comfortable', 'spacious'] as const
export type SpacingDensity = (typeof SPACING_DENSITY_OPTIONS)[number]

export const TYPOGRAPHY_TONE_OPTIONS = ['neutral', 'modern', 'premium', 'bold'] as const
export type TypographyTone = (typeof TYPOGRAPHY_TONE_OPTIONS)[number]

export const VISUAL_INTENSITY_OPTIONS = ['quiet', 'balanced', 'expressive', 'bold'] as const
export type VisualIntensity = (typeof VISUAL_INTENSITY_OPTIONS)[number]

export const ICON_STYLE_OPTIONS = ['line', 'duotone', 'filled', 'bold'] as const
export type IconStyle = (typeof ICON_STYLE_OPTIONS)[number]

export const MOTION_ENERGY_OPTIONS = ['minimal', 'smooth', 'lively', 'dynamic'] as const
export type MotionEnergy = (typeof MOTION_ENERGY_OPTIONS)[number]

export const STATE_EMPHASIS_OPTIONS = ['result-first', 'upload-first', 'balanced'] as const
export type StateEmphasis = (typeof STATE_EMPHASIS_OPTIONS)[number]

export const WATERMARK_POSITION_OPTIONS = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'center',
] as const
export type WatermarkPosition = (typeof WATERMARK_POSITION_OPTIONS)[number]

export const watermarkSettingsSchema = z.object({
  enabled: z.boolean(),
  logo_url: z.string().max(2048).default(''),
  opacity: z.number().min(0).max(1),
  position: z.enum(WATERMARK_POSITION_OPTIONS),
  size: z.number().int().min(24).max(600),
})

export type WatermarkSettings = z.infer<typeof watermarkSettingsSchema>

export const visualIdentitySchema = z.object({
  brand_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid HEX color'),
  surface_style: z.enum(SURFACE_STYLE_OPTIONS),
  corner_radius: z.enum(CORNER_RADIUS_OPTIONS),
  spacing_density: z.enum(SPACING_DENSITY_OPTIONS),
  typography_tone: z.enum(TYPOGRAPHY_TONE_OPTIONS),
  visual_intensity: z.enum(VISUAL_INTENSITY_OPTIONS),
  icon_style: z.enum(ICON_STYLE_OPTIONS),
  backdrop_style: z.enum(BACKDROP_STYLE_OPTIONS),
  motion_energy: z.enum(MOTION_ENERGY_OPTIONS),
  state_emphasis: z.enum(STATE_EMPHASIS_OPTIONS),
  watermark: watermarkSettingsSchema.default({
    enabled: false,
    logo_url: '',
    opacity: 0.72,
    position: 'bottom-right',
    size: 120,
  }),
})

export type VisualIdentity = z.infer<typeof visualIdentitySchema>

// ============================================================================
// Display Rules System
// ============================================================================

export const ELIGIBILITY_MODE_OPTIONS = ['all', 'selected', 'selected-categories'] as const
export type EligibilityMode = (typeof ELIGIBILITY_MODE_OPTIONS)[number]

export const PLACEMENT_TARGET_OPTIONS = [
  'on-product-image',
  'above-product-options',
  'floating-bottom',
  'floating-middle',
  'description-section',
  'under-add-to-cart',
] as const
export type PlacementTarget = (typeof PLACEMENT_TARGET_OPTIONS)[number]

export const DISPLAY_TIMING_OPTIONS = [
  'immediate',
  'after-page-stable',
  'after-image-gallery-ready',
  'after-cta-block-detected',
] as const
export type DisplayTiming = (typeof DISPLAY_TIMING_OPTIONS)[number]

export const TRIGGER_BEHAVIOR_OPTIONS = ['auto-render', 'user-intent-only'] as const
export type TriggerBehavior = (typeof TRIGGER_BEHAVIOR_OPTIONS)[number]

export const AVAILABILITY_CONDITIONS_SCHEMA = z.object({
  hide_on_out_of_stock: z.boolean(),
  hide_on_missing_product_image: z.boolean(),
  hide_on_unsupported_product_type: z.boolean(),
  hide_when_merchant_inactive: z.boolean(),
  hide_when_no_credits: z.boolean(),
})

export type AvailabilityConditions = z.infer<typeof AVAILABILITY_CONDITIONS_SCHEMA>

export const FALLBACK_STRATEGY_OPTIONS = ['chained', 'floating-only', 'disabled'] as const
export type FallbackStrategy = (typeof FALLBACK_STRATEGY_OPTIONS)[number]

export const DEVICE_VARIANT_OPTIONS = ['same', 'dedicated-mobile', 'dedicated-desktop'] as const
export type DeviceVariant = (typeof DEVICE_VARIANT_OPTIONS)[number]

export const LOCALIZATION_MODE_OPTIONS = ['arabic-only', 'english-only', 'auto-by-storefront'] as const
export type LocalizationMode = (typeof LOCALIZATION_MODE_OPTIONS)[number]

export const STATE_MESSAGING_POLICY_OPTIONS = ['concise', 'guided', 'conversion-focused'] as const
export type StateMessagingPolicy = (typeof STATE_MESSAGING_POLICY_OPTIONS)[number]

export const displayRulesSchema = z.object({
  eligibility_mode: z.enum(ELIGIBILITY_MODE_OPTIONS),
  selected_product_ids: z.array(z.number().int().positive()).max(1000).default([]),
  selected_category_ids: z.array(z.string()).max(50).default([]),
  placement_target: z.enum(PLACEMENT_TARGET_OPTIONS),
  placement_side: z.enum(['left', 'right', 'center']),
  vertical_offset: z.number().int().min(0).max(200).default(0),
  horizontal_offset: z.number().int().min(0).max(200).default(0),
  display_timing: z.enum(DISPLAY_TIMING_OPTIONS),
  trigger_behavior: z.enum(TRIGGER_BEHAVIOR_OPTIONS),
  availability_conditions: AVAILABILITY_CONDITIONS_SCHEMA,
  fallback_strategy: z.enum(FALLBACK_STRATEGY_OPTIONS),
  fallback_selectors: z.array(z.string()).max(5).default([]),
  device_variant: z.enum(DEVICE_VARIANT_OPTIONS),
  mobile_placement_target: z.enum(PLACEMENT_TARGET_OPTIONS).optional(),
  localization_mode: z.enum(LOCALIZATION_MODE_OPTIONS),
  state_messaging_policy: z.enum(STATE_MESSAGING_POLICY_OPTIONS),
})

export type DisplayRules = z.infer<typeof displayRulesSchema>

// ============================================================================
// Access & Runtime Safeguards
// ============================================================================

export const ZERO_CREDIT_BEHAVIOR_OPTIONS = ['hide', 'disabled-with-message', 'show-with-limit'] as const
export type ZeroCreditBehavior = (typeof ZERO_CREDIT_BEHAVIOR_OPTIONS)[number]

export const runtimeSafeguardsSchema = z.object({
  zero_credit_behavior: z.enum(ZERO_CREDIT_BEHAVIOR_OPTIONS),
  zero_credit_message: z.string().max(200).optional(),
  max_daily_requests: z.number().int().positive().optional(),
  require_product_image: z.boolean().default(true),
  enable_diagnostics: z.boolean().default(false),
})

export type RuntimeSafeguards = z.infer<typeof runtimeSafeguardsSchema>

// ============================================================================
// UX Feature Flags
// ============================================================================

export const uxFeaturesSchema = z.object({
  compare_mode: z.boolean(),
  session_gallery: z.boolean(),
  allow_download: z.boolean(),
})

export type UxFeatures = z.infer<typeof uxFeaturesSchema>

// ============================================================================
// Widget Settings - Unified Schema
// ============================================================================

export const WIDGET_SETTINGS_SCHEMA_VERSION = 2

export const widgetSettingsSchema = z.object({
  schema_version: z.literal(WIDGET_SETTINGS_SCHEMA_VERSION),
  widget_enabled: z.boolean().default(true),
  button: buttonSettingsSchema,
  window: windowSettingsSchema,
  visual_identity: visualIdentitySchema,
  display_rules: displayRulesSchema,
  runtime_safeguards: runtimeSafeguardsSchema,
  ux_features: uxFeaturesSchema.default({
    compare_mode: true,
    session_gallery: true,
    allow_download: true,
  }),
})

export type WidgetSettings = z.infer<typeof widgetSettingsSchema>

// ============================================================================
// Default Values
// ============================================================================

export function createDefaultWidgetSettings(): WidgetSettings {
  return {
    schema_version: WIDGET_SETTINGS_SCHEMA_VERSION,
    widget_enabled: true,
    button: {
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
    },
    window: {
      preset: 'classic-center-modal',
      motion_profile: 'soft-scale',
      backdrop: 'blur-dark',
      close_style: 'icon-top-inline',
      result_layout: 'before-after-prominent',
    },
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
      watermark: {
        enabled: false,
        logo_url: '',
        opacity: 0.72,
        position: 'bottom-right',
        size: 120,
      },
    },
    display_rules: {
      eligibility_mode: 'all',
      selected_product_ids: [],
      selected_category_ids: [],
      placement_target: 'above-product-options',
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
      mobile_placement_target: undefined,
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
    ux_features: {
      compare_mode: true,
      session_gallery: true,
      allow_download: true,
    },
  }
}

/**
 * Parses and validates widget settings.
 * Removed legacy migration logic for clean slate unification.
 */
export function parseWidgetSettings(input: unknown): WidgetSettings {
  const result = widgetSettingsSchema.safeParse(input)
  if (result.success) {
    return result.data
  }
  return createDefaultWidgetSettings()
}
