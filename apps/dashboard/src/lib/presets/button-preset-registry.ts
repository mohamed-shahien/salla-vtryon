/**
 * Button Preset Registry
 *
 * Defines 20 distinct button presets with unique visual identities.
 * Each preset includes tokenized CSS properties for consistent rendering.
 */

import type { ButtonPresetId } from "@virtual-tryon/shared-types"

// ============================================================================
// Button Preset Definition
// ============================================================================

export interface ButtonPreset {
  id: ButtonPresetId
  name: string
  nameAr: string
  description: string

  // Visual tokens
  iconStyle: 'line' | 'duotone' | 'filled'
  backgroundRecipe: 'solid-primary' | 'gradient' | 'glass' | 'outline' | 'ghost'
  borderRecipe: 'none' | 'thin' | 'medium' | 'thick'
  borderRadius: 'none' | 'compact' | 'balanced' | 'rounded' | 'pill'

  // Colors (can use brand color reference)
  backgroundColor?: string
  textColor?: string
  borderColor?: string

  // Hover behavior
  hoverBackground?: string
  hoverTransform?: 'none' | 'lift' | 'scale' | 'shrink'
  hoverGlow?: boolean

  // Motion behavior
  motionEnergy: 'minimal' | 'smooth' | 'lively' | 'dynamic'
  transitionDuration: number // ms

  // Emphasis level
  emphasis: 'subtle' | 'balanced' | 'bold'

  // Compact/mobile behavior
  mobileCompact?: boolean
  mobileIconOnly?: boolean

  // Shadow
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong'
}

// ============================================================================
// Button Preset Registry
// ============================================================================

export const BUTTON_PRESETS: ButtonPreset[] = [
  // 1. Core Solid - solid primary + subtle lift
  {
    id: 'core-solid',
    name: 'Core Solid',
    nameAr: 'أساسي صلب',
    description: 'زر أساسي مع تأثير رفع خفيف',
    iconStyle: 'filled',
    backgroundRecipe: 'solid-primary',
    borderRecipe: 'none',
    borderRadius: 'balanced',
    hoverTransform: 'lift',
    motionEnergy: 'smooth',
    transitionDuration: 200,
    emphasis: 'balanced',
    shadowIntensity: 'medium',
  },

  // 2. Soft Glow - soft gradient + glow hover
  {
    id: 'soft-glow',
    name: 'Soft Glow',
    nameAr: 'توهج ناعم',
    description: 'تدرج لوني ناعم مع توهج عند التمرير',
    iconStyle: 'duotone',
    backgroundRecipe: 'gradient',
    borderRecipe: 'none',
    borderRadius: 'rounded',
    hoverTransform: 'scale',
    hoverGlow: true,
    motionEnergy: 'smooth',
    transitionDuration: 300,
    emphasis: 'balanced',
    shadowIntensity: 'medium',
  },

  // 3. Glass Air - translucent glass + blur
  {
    id: 'glass-air',
    name: 'Glass Air',
    nameAr: 'زجاج هوائي',
    description: 'تأثير زجاجي شفاف مع ضبابية',
    iconStyle: 'line',
    backgroundRecipe: 'glass',
    borderRecipe: 'thin',
    borderRadius: 'balanced',
    hoverTransform: 'lift',
    motionEnergy: 'smooth',
    transitionDuration: 250,
    emphasis: 'subtle',
    shadowIntensity: 'subtle',
  },

  // 4. Outline Pulse - outline + pulse ring
  {
    id: 'outline-pulse',
    name: 'Outline Pulse',
    nameAr: 'حافة نابض',
    description: 'حدود مع حلقة نابضة عند التمرير',
    iconStyle: 'line',
    backgroundRecipe: 'outline',
    borderRecipe: 'medium',
    borderRadius: 'balanced',
    hoverBackground: 'brand-10',
    hoverTransform: 'scale',
    hoverGlow: true,
    motionEnergy: 'lively',
    transitionDuration: 300,
    emphasis: 'balanced',
    shadowIntensity: 'subtle',
  },

  // 5. Premium Gold - luxury gradient + shine sweep
  {
    id: 'premium-gold',
    name: 'Premium Gold',
    nameAr: 'ذهبي فاخر',
    description: 'تدرج ذهبي فاخر مع لمعة سريعة',
    iconStyle: 'filled',
    backgroundRecipe: 'gradient',
    borderRecipe: 'medium',
    borderRadius: 'rounded',
    backgroundColor: 'linear-gradient(135deg, #D4AF37 0%, #F4E4BC 50%, #D4AF37 100%)',
    textColor: '#1a1a2e',
    borderColor: '#B8860B',
    hoverTransform: 'lift',
    motionEnergy: 'dynamic',
    transitionDuration: 400,
    emphasis: 'bold',
    shadowIntensity: 'strong',
  },

  // 6. Mono Sharp - clean monochrome + crisp border
  {
    id: 'mono-sharp',
    name: 'Mono Sharp',
    nameAr: 'أحادي حاد',
    description: 'تصميم أحادي بحدود حادة',
    iconStyle: 'line',
    backgroundRecipe: 'outline',
    borderRecipe: 'thick',
    borderRadius: 'compact',
    hoverBackground: '#1a1a1a',
    hoverTransform: 'none',
    motionEnergy: 'minimal',
    transitionDuration: 150,
    emphasis: 'balanced',
    shadowIntensity: 'none',
  },

  // 7. Rounded Soft - friendly rounded pill + soft shadow
  {
    id: 'rounded-soft',
    name: 'Rounded Soft',
    nameAr: 'ناعم مستدير',
    description: 'حافة ناعمة مستديرة مع ظل خفيف',
    iconStyle: 'duotone',
    backgroundRecipe: 'solid-primary',
    borderRecipe: 'none',
    borderRadius: 'pill',
    hoverTransform: 'lift',
    motionEnergy: 'smooth',
    transitionDuration: 200,
    emphasis: 'subtle',
    shadowIntensity: 'subtle',
  },

  // 8. Floating Fab - floating action feel + depth hover
  {
    id: 'floating-fab',
    name: 'Floating Fab',
    nameAr: 'عائم متحرك',
    description: 'زر عائم مع عمق عند التمرير',
    iconStyle: 'filled',
    backgroundRecipe: 'solid-primary',
    borderRecipe: 'none',
    borderRadius: 'rounded',
    hoverTransform: 'lift',
    hoverGlow: true,
    motionEnergy: 'dynamic',
    transitionDuration: 300,
    emphasis: 'bold',
    shadowIntensity: 'strong',
    mobileCompact: true,
    mobileIconOnly: true,
  },

  // 9. Neon Edge - dark surface + bright outline
  {
    id: 'neon-edge',
    name: 'Neon Edge',
    nameAr: 'حافة نيون',
    description: 'خلفية داكنة مع حدود مشعة',
    iconStyle: 'duotone',
    backgroundRecipe: 'solid-primary',
    borderRecipe: 'thick',
    borderRadius: 'compact',
    backgroundColor: '#1a1a2e',
    textColor: '#00f5d4',
    borderColor: '#00f5d4',
    hoverTransform: 'scale',
    hoverGlow: true,
    motionEnergy: 'lively',
    transitionDuration: 250,
    emphasis: 'bold',
    shadowIntensity: 'strong',
  },

  // 10. Ghost Highlight - low-emphasis ghost + active fill
  {
    id: 'ghost-highlight',
    name: 'Ghost Highlight',
    nameAr: 'شبح مميز',
    description: 'خلفية شفافة مع ملء عند التفعيل',
    iconStyle: 'line',
    backgroundRecipe: 'ghost',
    borderRecipe: 'none',
    borderRadius: 'balanced',
    hoverBackground: 'brand-10',
    hoverTransform: 'none',
    motionEnergy: 'minimal',
    transitionDuration: 150,
    emphasis: 'subtle',
    shadowIntensity: 'none',
  },

  // 11. Split Icon - separated icon capsule + label block
  {
    id: 'split-icon',
    name: 'Split Icon',
    nameAr: 'أيقونة منفصلة',
    description: 'أيقونة في كبسولة منفصلة عن النص',
    iconStyle: 'filled',
    backgroundRecipe: 'outline',
    borderRecipe: 'medium',
    borderRadius: 'balanced',
    hoverBackground: 'brand-10',
    hoverTransform: 'lift',
    motionEnergy: 'smooth',
    transitionDuration: 200,
    emphasis: 'balanced',
    shadowIntensity: 'subtle',
  },

  // 12. Elevated Card CTA - mini card style with micro copy area
  {
    id: 'elevated-card-cta',
    name: 'Elevated Card CTA',
    nameAr: 'بطاقة مرتفعة',
    description: 'نمط بطاقة صغيرة مع منطقة نص',
    iconStyle: 'duotone',
    backgroundRecipe: 'solid-primary',
    borderRecipe: 'none',
    borderRadius: 'rounded',
    hoverTransform: 'lift',
    motionEnergy: 'smooth',
    transitionDuration: 250,
    emphasis: 'balanced',
    shadowIntensity: 'strong',
  },

  // 13. Badge Trigger - compact badge / chip style
  {
    id: 'badge-trigger',
    name: 'Badge Trigger',
    nameAr: 'شارة نشاط',
    description: 'نمط شارة صغيرة مضغوطة',
    iconStyle: 'filled',
    backgroundRecipe: 'solid-primary',
    borderRecipe: 'none',
    borderRadius: 'pill',
    hoverTransform: 'scale',
    motionEnergy: 'lively',
    transitionDuration: 150,
    emphasis: 'subtle',
    shadowIntensity: 'subtle',
    mobileCompact: true,
  },

  // 14. Underline Motion - text-first CTA + animated underline
  {
    id: 'underline-motion',
    name: 'Underline Motion',
    nameAr: 'خط متحرك',
    description: 'تركيز على النص مع خط سفلي متحرك',
    iconStyle: 'line',
    backgroundRecipe: 'ghost',
    borderRecipe: 'none',
    borderRadius: 'none',
    hoverBackground: 'transparent',
    hoverTransform: 'none',
    motionEnergy: 'lively',
    transitionDuration: 300,
    emphasis: 'subtle',
    shadowIntensity: 'none',
  },

  // 15. Shimmer Strip - shimmer pass on hover
  {
    id: 'shimmer-strip',
    name: 'Shimmer Strip',
    nameAr: 'شريط لامع',
    description: 'تأثير لمعان يمر عند التمرير',
    iconStyle: 'duotone',
    backgroundRecipe: 'gradient',
    borderRecipe: 'none',
    borderRadius: 'balanced',
    hoverTransform: 'none',
    hoverGlow: true,
    motionEnergy: 'dynamic',
    transitionDuration: 600,
    emphasis: 'balanced',
    shadowIntensity: 'subtle',
  },

  // 16. Gradient Aura - rich gradient with aura shadow
  {
    id: 'gradient-aura',
    name: 'Gradient Aura',
    nameAr: 'هالة متدرجة',
    description: 'تدرج غني مع ظل هالته',
    iconStyle: 'filled',
    backgroundRecipe: 'gradient',
    borderRecipe: 'none',
    borderRadius: 'rounded',
    hoverTransform: 'scale',
    hoverGlow: true,
    motionEnergy: 'dynamic',
    transitionDuration: 350,
    emphasis: 'bold',
    shadowIntensity: 'strong',
  },

  // 17. Editorial Minimal - premium text-first editorial feel
  {
    id: 'editorial-minimal',
    name: 'Editorial Minimal',
    nameAr: 'تحريري بسيط',
    description: 'تركيز على النص بأسلوب تحريري',
    iconStyle: 'line',
    backgroundRecipe: 'outline',
    borderRecipe: 'thin',
    borderRadius: 'none',
    hoverBackground: 'brand-5',
    hoverTransform: 'none',
    motionEnergy: 'minimal',
    transitionDuration: 200,
    emphasis: 'subtle',
    shadowIntensity: 'none',
  },

  // 18. Tech Panel - angular border + panel depth
  {
    id: 'tech-panel',
    name: 'Tech Panel',
    nameAr: 'لوحة تقنية',
    description: 'حدود زاوية مع عمق لوحة',
    iconStyle: 'line',
    backgroundRecipe: 'solid-primary',
    borderRecipe: 'thick',
    borderRadius: 'compact',
    hoverTransform: 'lift',
    motionEnergy: 'smooth',
    transitionDuration: 200,
    emphasis: 'balanced',
    shadowIntensity: 'medium',
  },

  // 19. Soft Outline Fill - outline idle, filled on hover
  {
    id: 'soft-outline-fill',
    name: 'Soft Outline Fill',
    nameAr: 'حافة تمتلئ',
    description: 'حدود تتحول إلى ملء عند التمرير',
    iconStyle: 'duotone',
    backgroundRecipe: 'outline',
    borderRecipe: 'medium',
    borderRadius: 'balanced',
    hoverBackground: 'brand',
    hoverTransform: 'scale',
    motionEnergy: 'smooth',
    transitionDuration: 250,
    emphasis: 'balanced',
    shadowIntensity: 'subtle',
  },

  // 20. Mobile Sticky CTA - optimized fixed mobile pill
  {
    id: 'mobile-sticky-cta',
    name: 'Mobile Sticky CTA',
    nameAr: 'زر ثابت للجوال',
    description: 'مُحسّن للشاشات الصغيرة كزر ثابت',
    iconStyle: 'filled',
    backgroundRecipe: 'solid-primary',
    borderRecipe: 'none',
    borderRadius: 'pill',
    hoverTransform: 'scale',
    motionEnergy: 'lively',
    transitionDuration: 200,
    emphasis: 'bold',
    shadowIntensity: 'strong',
    mobileCompact: false,
    mobileIconOnly: false,
  },
]

// ============================================================================
// Preset Lookup
// ============================================================================

const BUTTON_PRESET_MAP = new Map<ButtonPresetId, ButtonPreset>(
  BUTTON_PRESETS.map((preset) => [preset.id, preset])
)

export function getButtonPreset(id: ButtonPresetId): ButtonPreset | undefined {
  return BUTTON_PRESET_MAP.get(id)
}

export function getAllButtonPresets(): ButtonPreset[] {
  return BUTTON_PRESETS
}

// ============================================================================
// CSS Variable Generator
// ============================================================================

export interface ButtonPresetCSSVariables {
  '--btn-bg': string
  '--btn-text': string
  '--btn-border': string
  '--btn-hover-bg': string
  '--btn-hover-text': string
  '--btn-hover-border': string
  '--btn-radius': string
  '--btn-shadow': string
  '--btn-border-width': string
  '--btn-transition': string
}

export function getPresetCSSVariables(
  preset: ButtonPreset,
  brandColor: string
): ButtonPresetCSSVariables {
  // Helper to get color value
  const getColor = (color: string | undefined, defaultColor: string) => color || defaultColor

  // Brand color derivatives
  const brand10 = adjustColorOpacity(brandColor, 0.1)
  const brand20 = adjustColorOpacity(brandColor, 0.2)
  const brand = brandColor
  const white = '#ffffff'
  const black = '#000000'

  // Map background recipe to colors
  let bg = black
  let text = white
  let border = 'transparent'
  let hoverBg = brand20
  let hoverText = white
  let hoverBorder = 'transparent'

  switch (preset.backgroundRecipe) {
    case 'solid-primary':
      bg = brand
      text = white
      hoverBg = adjustColor(brand, 10)
      break
    case 'gradient':
      bg = brand
      text = white
      hoverBg = adjustColor(brand, 15)
      break
    case 'glass':
      bg = brand10
      text = brand
      border = brand20
      hoverBg = brand20
      break
    case 'outline':
      bg = 'transparent'
      text = brand
      border = brand
      hoverBg = brand10
      break
    case 'ghost':
      bg = 'transparent'
      text = brand
      hoverBg = brand10
      break
  }

  // Apply preset color overrides
  bg = getColor(preset.backgroundColor, bg)
  text = getColor(preset.textColor, text)
  border = getColor(preset.borderColor, border)
  hoverBg = getColor(preset.hoverBackground, hoverBg)

  // Map border recipe to width
  const getBorderWidth = () => {
    switch (preset.borderRecipe) {
      case 'none':
        return '0'
      case 'thin':
        return '1px'
      case 'medium':
        return '2px'
      case 'thick':
        return '3px'
    }
  }

  // Map border radius
  const getRadius = () => {
    switch (preset.borderRadius) {
      case 'none':
        return '0'
      case 'compact':
        return '4px'
      case 'balanced':
        return '8px'
      case 'rounded':
        return '12px'
      case 'pill':
        return '9999px'
    }
  }

  // Map shadow intensity
  const getShadow = () => {
    if (preset.shadowIntensity === 'none') return 'none'
    const opacity = preset.shadowIntensity === 'subtle' ? 0.1 : preset.shadowIntensity === 'medium' ? 0.2 : 0.3
    return `0 ${preset.shadowIntensity === 'strong' ? '8px' : '4px'} ${preset.shadowIntensity === 'strong' ? '16px' : '8px'} rgba(0, 0, 0, ${opacity})`
  }

  return {
    '--btn-bg': bg,
    '--btn-text': text,
    '--btn-border': border,
    '--btn-hover-bg': hoverBg,
    '--btn-hover-text': hoverText,
    '--btn-hover-border': hoverBorder,
    '--btn-radius': getRadius(),
    '--btn-shadow': getShadow(),
    '--btn-border-width': getBorderWidth(),
    '--btn-transition': `all ${preset.transitionDuration}ms ${preset.motionEnergy === 'dynamic' ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'ease-in-out'}`,
  }
}

// ============================================================================
// Color Utilities
// ============================================================================

function adjustColorOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function adjustColor(hex: string, amount: number): string {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount))
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount))
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
