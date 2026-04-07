import { z } from 'zod'

// ── Launch Mode ──────────────────────────────────────────────────────────────

export const LAUNCH_MODES = ['button', 'floating', 'auto_open', 'disabled'] as const
export type LaunchMode = (typeof LAUNCH_MODES)[number]

export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const
export type ButtonSize = (typeof BUTTON_SIZES)[number]

export const launchConfigSchema = z.object({
  mode: z.enum(LAUNCH_MODES),
  auto_open_delay: z.number().min(0).max(10000),
  auto_open_once_per_session: z.boolean(),
  button_label: z.string().min(1).max(40),
  button_icon: z.boolean(),
  button_size: z.enum(BUTTON_SIZES),
})

export type LaunchConfig = z.infer<typeof launchConfigSchema>

// ── Placement ────────────────────────────────────────────────────────────────

export const PLACEMENT_TYPES = ['below_gallery', 'over_image', 'sticky_side', 'bottom_float'] as const
export type PlacementType = (typeof PLACEMENT_TYPES)[number]

export const PLACEMENT_SIDES = ['left', 'right'] as const
export type PlacementSide = (typeof PLACEMENT_SIDES)[number]

export const IMAGE_ANCHORS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] as const
export type ImageAnchor = (typeof IMAGE_ANCHORS)[number]

export const MOBILE_PLACEMENTS = ['bottom_float', 'below_gallery', 'same'] as const
export type MobilePlacement = (typeof MOBILE_PLACEMENTS)[number]

export const placementConfigSchema = z.object({
  type: z.enum(PLACEMENT_TYPES),
  side: z.enum(PLACEMENT_SIDES),
  image_anchor: z.enum(IMAGE_ANCHORS),
  vertical_offset: z.number().min(0).max(200),
  mobile_placement: z.enum(MOBILE_PLACEMENTS),
})

export type PlacementConfig = z.infer<typeof placementConfigSchema>

// ── Access & Usage ───────────────────────────────────────────────────────────

export const DEVICE_VISIBILITY = ['all', 'desktop_only', 'mobile_only'] as const
export type DeviceVisibility = (typeof DEVICE_VISIBILITY)[number]

export const accessConfigSchema = z.object({
  require_login: z.boolean(),
  login_helper_text: z.string().max(120),
  device_visibility: z.enum(DEVICE_VISIBILITY),
})

export type AccessConfig = z.infer<typeof accessConfigSchema>

// ── Appearance ───────────────────────────────────────────────────────────────

export const CORNER_STYLES = ['compact', 'medium', 'soft'] as const
export type CornerStyle = (typeof CORNER_STYLES)[number]

export const SPACING_DENSITIES = ['compact', 'comfortable', 'spacious'] as const
export type SpacingDensity = (typeof SPACING_DENSITIES)[number]

export const BUTTON_STYLES = ['filled', 'outline', 'ghost'] as const
export type ButtonStylePreset = (typeof BUTTON_STYLES)[number]

export const SHADOW_INTENSITIES = ['none', 'subtle', 'medium', 'strong'] as const
export type ShadowIntensity = (typeof SHADOW_INTENSITIES)[number]

export const appearanceConfigSchema = z.object({
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'يجب أن يكون لون HEX صالح'),
  corner_style: z.enum(CORNER_STYLES),
  spacing_density: z.enum(SPACING_DENSITIES),
  button_style: z.enum(BUTTON_STYLES),
  shadow_intensity: z.enum(SHADOW_INTENSITIES),
})

export type AppearanceConfig = z.infer<typeof appearanceConfigSchema>

// ── Dialog ───────────────────────────────────────────────────────────────────

export const DIALOG_WIDTHS = ['sm', 'md', 'lg', 'full'] as const
export type DialogWidth = (typeof DIALOG_WIDTHS)[number]

export const dialogConfigSchema = z.object({
  template: z.string().min(1).max(50),
  width: z.enum(DIALOG_WIDTHS),
})

export type DialogConfig = z.infer<typeof dialogConfigSchema>

// ── Full Widget Studio Config ────────────────────────────────────────────────

export const widgetStudioConfigSchema = z.object({
  launch: launchConfigSchema,
  placement: placementConfigSchema,
  access: accessConfigSchema,
  appearance: appearanceConfigSchema,
  dialog: dialogConfigSchema,
  active_widget_template: z.string().nullable(),
  active_dialog_template: z.string().nullable(),
})

export type WidgetStudioConfig = z.infer<typeof widgetStudioConfigSchema>
