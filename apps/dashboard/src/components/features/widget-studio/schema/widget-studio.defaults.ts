import type { WidgetStudioConfig, AppearanceConfig, LaunchConfig, PlacementConfig, DialogConfig } from './widget-studio.schema'

// ── Default Config ───────────────────────────────────────────────────────────

export function createDefaultWidgetStudioConfig(): WidgetStudioConfig {
  return {
    launch: {
      mode: 'button',
      auto_open_delay: 0,
      auto_open_once_per_session: true,
      button_label: 'جرّب الآن',
      button_icon: true,
      button_size: 'md',
    },
    placement: {
      type: 'below_gallery',
      side: 'right',
      image_anchor: 'bottom-right',
      vertical_offset: 0,
      mobile_placement: 'same',
    },
    access: {
      require_login: false,
      login_helper_text: 'يرجى تسجيل الدخول أولاً لتجربة القياس الافتراضي',
      device_visibility: 'all',
    },
    appearance: {
      accent_color: '#34a853',
      corner_style: 'medium',
      spacing_density: 'comfortable',
      button_style: 'filled',
      shadow_intensity: 'subtle',
    },
    dialog: {
      template: 'clean_modal',
      width: 'md',
    },
    active_widget_template: null,
    active_dialog_template: null,
  }
}

// ── Widget Templates ─────────────────────────────────────────────────────────

export interface WidgetTemplate {
  id: string
  name: string
  nameAr: string
  description: string
  overrides: {
    launch?: Partial<LaunchConfig>
    placement?: Partial<PlacementConfig>
    appearance?: Partial<AppearanceConfig>
  }
}

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    nameAr: 'بسيط',
    description: 'تصميم نظيف وبسيط',
    overrides: {
      launch: { button_size: 'sm', button_icon: false },
      appearance: { corner_style: 'compact', shadow_intensity: 'none', button_style: 'outline' },
    },
  },
  {
    id: 'bold_cta',
    name: 'Bold CTA',
    nameAr: 'زر بارز',
    description: 'زر كبير يلفت الانتباه',
    overrides: {
      launch: { button_size: 'lg', button_icon: true },
      appearance: { corner_style: 'medium', shadow_intensity: 'strong', button_style: 'filled' },
    },
  },
  {
    id: 'luxury',
    name: 'Luxury',
    nameAr: 'فاخر',
    description: 'مظهر أنيق وراقي',
    overrides: {
      launch: { button_size: 'md', button_icon: true },
      appearance: { accent_color: '#1a1a2e', corner_style: 'soft', shadow_intensity: 'medium', button_style: 'filled' },
    },
  },
  {
    id: 'soft_rounded',
    name: 'Soft Rounded',
    nameAr: 'ناعم مستدير',
    description: 'حواف ناعمة ومريحة',
    overrides: {
      launch: { button_size: 'md', button_icon: true },
      appearance: { corner_style: 'soft', shadow_intensity: 'subtle', button_style: 'filled', spacing_density: 'spacious' },
    },
  },
  {
    id: 'clean_floating',
    name: 'Clean Floating',
    nameAr: 'عائم نظيف',
    description: 'زر عائم في زاوية الشاشة',
    overrides: {
      launch: { mode: 'floating', button_size: 'md', button_icon: true },
      placement: { type: 'sticky_side', side: 'left' },
      appearance: { corner_style: 'soft', shadow_intensity: 'medium', button_style: 'filled' },
    },
  },
  {
    id: 'compact_corner',
    name: 'Compact Corner',
    nameAr: 'مضغوط في الزاوية',
    description: 'علامة صغيرة فوق الصورة',
    overrides: {
      launch: { button_size: 'sm', button_icon: true, button_label: 'جرّب' },
      placement: { type: 'over_image', image_anchor: 'top-left' },
      appearance: { corner_style: 'compact', shadow_intensity: 'subtle', button_style: 'filled', spacing_density: 'compact' },
    },
  },
]

// ── Dialog Templates ─────────────────────────────────────────────────────────

export interface DialogTemplate {
  id: string
  name: string
  nameAr: string
  description: string
  overrides: {
    dialog?: Partial<DialogConfig>
    appearance?: Partial<AppearanceConfig>
  }
}

export const DIALOG_TEMPLATES: DialogTemplate[] = [
  {
    id: 'clean_modal',
    name: 'Clean Modal',
    nameAr: 'نافذة نظيفة',
    description: 'نافذة حوار بسيطة ومركزة',
    overrides: {
      dialog: { width: 'md' },
      appearance: { corner_style: 'medium', shadow_intensity: 'subtle' },
    },
  },
  {
    id: 'bottom_sheet',
    name: 'Bottom Sheet',
    nameAr: 'ورقة سفلية',
    description: 'تنبثق من أسفل الشاشة',
    overrides: {
      dialog: { width: 'full' },
      appearance: { corner_style: 'soft', shadow_intensity: 'strong' },
    },
  },
  {
    id: 'premium_card',
    name: 'Premium Card',
    nameAr: 'بطاقة فاخرة',
    description: 'تصميم بطاقة متميز',
    overrides: {
      dialog: { width: 'md' },
      appearance: { corner_style: 'soft', shadow_intensity: 'medium', spacing_density: 'spacious' },
    },
  },
  {
    id: 'soft_glass',
    name: 'Soft Glass',
    nameAr: 'زجاج ناعم',
    description: 'تأثير شفافية زجاجية',
    overrides: {
      dialog: { width: 'lg' },
      appearance: { corner_style: 'soft', shadow_intensity: 'subtle', spacing_density: 'comfortable' },
    },
  },
  {
    id: 'compact_mobile',
    name: 'Compact Mobile',
    nameAr: 'مضغوط للجوال',
    description: 'محسّن لشاشات الجوال',
    overrides: {
      dialog: { width: 'sm' },
      appearance: { corner_style: 'medium', shadow_intensity: 'none', spacing_density: 'compact' },
    },
  },
  {
    id: 'focused_studio',
    name: 'Focused Studio',
    nameAr: 'استوديو مركّز',
    description: 'تجربة استوديو متكاملة',
    overrides: {
      dialog: { width: 'lg' },
      appearance: { corner_style: 'medium', shadow_intensity: 'strong', spacing_density: 'spacious' },
    },
  },
]

// ── Accent Color Presets ─────────────────────────────────────────────────────

export const ACCENT_COLOR_PRESETS = [
  { label: 'أخضر سلة', value: '#34a853' },
  { label: 'أزرق داكن', value: '#1a56db' },
  { label: 'بنفسجي', value: '#7c3aed' },
  { label: 'وردي', value: '#ec4899' },
  { label: 'برتقالي', value: '#ea580c' },
  { label: 'داكن', value: '#1a1a2e' },
  { label: 'ذهبي', value: '#d97706' },
  { label: 'تركوازي', value: '#0d9488' },
] as const
