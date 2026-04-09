import { createDefaultWidgetSettings, type WidgetSettings } from '@virtual-tryon/shared-types'

// ── Default Config ───────────────────────────────────────────────────────────

export function createDefaultWidgetStudioConfig(): WidgetSettings {
  return createDefaultWidgetSettings()
}

// ── Widget Templates ─────────────────────────────────────────────────────────

export interface WidgetTemplate {
  id: string
  name: string
  nameAr: string
  description: string
  overrides: {
    button?: Partial<WidgetSettings['button']>
    window?: Partial<WidgetSettings['window']>
    visual_identity?: Partial<WidgetSettings['visual_identity']>
    display_rules?: Partial<WidgetSettings['display_rules']>
  }
}

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    nameAr: 'بسيط',
    description: 'تصميم نظيف وبسيط',
    overrides: {
      button: { size: 'sm', icon: { enabled: false, position: 'start' } },
      visual_identity: { corner_radius: 'compact', visual_intensity: 'quiet', surface_style: 'outline' },
    },
  },
  {
    id: 'bold_cta',
    name: 'Bold CTA',
    nameAr: 'زر بارز',
    description: 'زر كبير يلفت الانتباه',
    overrides: {
      button: { size: 'lg', icon: { enabled: true, name: 'sparkles', position: 'start' } },
      visual_identity: { corner_radius: 'balanced', visual_intensity: 'bold', surface_style: 'solid' },
    },
  },
  {
    id: 'luxury',
    name: 'Luxury',
    nameAr: 'فاخر',
    description: 'مظهر أنيق وراقي',
    overrides: {
      button: { size: 'md', icon: { enabled: true, name: 'sparkles', position: 'start' } },
      visual_identity: { brand_color: '#1a1a2e', corner_radius: 'rounded', visual_intensity: 'expressive', surface_style: 'elevated' },
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
    window?: Partial<WidgetSettings['window']>
    visual_identity?: Partial<WidgetSettings['visual_identity']>
  }
}

export const DIALOG_TEMPLATES: DialogTemplate[] = [
  {
    id: 'clean_modal',
    name: 'Clean Modal',
    nameAr: 'نافذة نظيفة',
    description: 'نافذة حوار بسيطة ومركزة',
    overrides: {
      window: { preset: 'classic-center-modal' },
      visual_identity: { corner_radius: 'balanced', backdrop_style: 'blur-dark' },
    },
  },
  {
    id: 'bottom_sheet',
    name: 'Bottom Sheet',
    nameAr: 'ورقة سفلية',
    description: 'تنبثق من أسفل الشاشة',
    overrides: {
      window: { preset: 'slide-up-sheet' },
      visual_identity: { corner_radius: 'rounded', backdrop_style: 'blur-dark' },
    },
  },
]
