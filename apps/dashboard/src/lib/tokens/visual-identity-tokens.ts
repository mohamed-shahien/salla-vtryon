/**
 * Visual Identity Token System
 *
 * Defines CSS variables and design tokens for the visual identity system.
 * Maps visual identity settings to actual CSS properties.
 */

import type {
  SurfaceStyle,
  CornerRadius,
  SpacingDensity,
  TypographyTone,
  VisualIntensity,
  IconStyle,
  BackdropStyle,
  MotionEnergy,
  StateEmphasis,
} from '@virtual-tryon/shared-types'

// ============================================================================
// Visual Identity CSS Variables
// ============================================================================

export interface VisualIdentityCSSVariables {
  // Brand color derivatives
  '--brand-primary': string
  '--brand-primary-light': string
  '--brand-primary-dark': string
  '--brand-primary-soft': string
  '--brand-primary-glow': string

  // Surface
  '--surface-bg': string
  '--surface-bg-hover': string
  '--surface-border': string
  '--surface-shadow': string

  // Corner radius
  '--radius-sm': string
  '--radius-md': string
  '--radius-lg': string
  '--radius-full': string

  // Spacing
  '--space-xs': string
  '--space-sm': string
  '--space-md': string
  '--space-lg': string
  '--space-xl': string

  // Typography
  '--font-family': string
  '--font-weight-normal': string
  '--font-weight-bold': string
  '--font-size-sm': string
  '--font-size-base': string
  '--font-size-lg': string
  '--line-height': string
  '--letter-spacing': string

  // Icon style
  '--icon-stroke-width': string
  '--icon-fill': string

  // Motion
  '--transition-fast': string
  '--transition-normal': string
  '--transition-slow': string
  '--easing-bounce': string
  '--easing-smooth': string

  // Visual intensity
  '--intensity-shadow': string
  '--intensity-border-opacity': number
  '--intensity-contrast': number

  // Backdrop
  '--backdrop-filter': string
  '--backdrop-bg': string

  // State emphasis
  '--state-upload-weight': number
  '--state-result-weight': number
}

// ============================================================================
// Token Mappers
// ============================================================================

export function mapSurfaceStyleToCSS(style: SurfaceStyle, brandColor: string): {
  bg: string
  border: string
  shadow: string
} {
  const brand10 = adjustColorOpacity(brandColor, 0.1)
  const brand20 = adjustColorOpacity(brandColor, 0.2)

  switch (style) {
    case 'solid':
      return {
        bg: brandColor,
        border: 'transparent',
        shadow: `0 4px 12px ${adjustColorOpacity(brandColor, 0.3)}`,
      }

    case 'soft':
      return {
        bg: brand20,
        border: brand10,
        shadow: `0 2px 8px ${adjustColorOpacity(brandColor, 0.15)}`,
      }

    case 'elevated':
      return {
        bg: '#ffffff',
        border: brand10,
        shadow: `0 8px 24px ${adjustColorOpacity(brandColor, 0.2)}`,
      }

    case 'glass':
      return {
        bg: brand10,
        border: brand20,
        shadow: `0 4px 16px ${adjustColorOpacity(brandColor, 0.1)}`,
      }

    case 'outline':
      return {
        bg: 'transparent',
        border: brandColor,
        shadow: 'none',
      }
  }
}

export function mapCornerRadiusToCSS(radius: CornerRadius): {
  sm: string
  md: string
  lg: string
  full: string
} {
  switch (radius) {
    case 'compact':
      return { sm: '2px', md: '4px', lg: '6px', full: '9999px' }
    case 'balanced':
      return { sm: '4px', md: '8px', lg: '12px', full: '9999px' }
    case 'rounded':
      return { sm: '8px', md: '12px', lg: '16px', full: '9999px' }
    case 'pill-heavy':
      return { sm: '9999px', md: '9999px', lg: '9999px', full: '9999px' }
  }
}

export function mapSpacingDensityToCSS(density: SpacingDensity): {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
} {
  switch (density) {
    case 'compact':
      return { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' }
    case 'comfortable':
      return { xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '32px' }
    case 'spacious':
      return { xs: '12px', sm: '16px', md: '24px', lg: '32px', xl: '48px' }
  }
}

export function mapTypographyToneToCSS(tone: TypographyTone): {
  fontFamily: string
  fontWeightNormal: string
  fontWeightBold: string
  letterSpacing: string
} {
  switch (tone) {
    case 'neutral':
      return {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeightNormal: '400',
        fontWeightBold: '600',
        letterSpacing: '0',
      }

    case 'modern':
      return {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeightNormal: '400',
        fontWeightBold: '700',
        letterSpacing: '-0.01em',
      }

    case 'premium':
      return {
        fontFamily: 'Playfair Display, Georgia, serif',
        fontWeightNormal: '400',
        fontWeightBold: '500',
        letterSpacing: '0.01em',
      }

    case 'bold':
      return {
        fontFamily: 'Montserrat, system-ui, sans-serif',
        fontWeightNormal: '600',
        fontWeightBold: '800',
        letterSpacing: '-0.02em',
      }
    default:
      return {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeightNormal: '400',
        fontWeightBold: '600',
        letterSpacing: '0',
      }
  }
}

export function mapVisualIntensityToCSS(intensity: VisualIntensity): {
  shadow: string
  borderOpacity: number
  contrast: number
} {
  switch (intensity) {
    case 'quiet':
      return {
        shadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        borderOpacity: 0.1,
        contrast: 0.9,
      }

    case 'balanced':
      return {
        shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        borderOpacity: 0.2,
        contrast: 1,
      }

    case 'expressive':
      return {
        shadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        borderOpacity: 0.3,
        contrast: 1.1,
      }

    case 'bold':
      return {
        shadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
        borderOpacity: 0.4,
        contrast: 1.2,
      }
  }
}

export function mapIconStyleToCSS(style: IconStyle): {
  strokeWidth: string
  fill: string
} {
  switch (style) {
    case 'line':
      return { strokeWidth: '2px', fill: 'none' }
    case 'duotone':
      return { strokeWidth: '1.5px', fill: 'currentColor' }
    case 'filled':
      return { strokeWidth: '0', fill: 'currentColor' }
    default:
      return { strokeWidth: '1.5px', fill: 'none' }
  }
}
export function mapBackdropStyleToCSS(style: BackdropStyle): {
  filter: string
  bg: string
} {
  switch (style) {
    case 'dim':
      return { filter: 'none', bg: 'rgba(0, 0, 0, 0.6)' }
    case 'blur-dark':
      return { filter: 'blur(12px)', bg: 'rgba(0, 0, 0, 0.4)' }
    case 'blur-light':
      return { filter: 'blur(8px)', bg: 'rgba(255, 255, 255, 0.4)' }
    case 'gradient':
      return { filter: 'none', bg: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8))' }
    case 'none':
      return { filter: 'none', bg: 'transparent' }
  }
}

export function mapMotionEnergyToCSS(energy: MotionEnergy): {
  fast: string
  normal: string
  slow: string
  easingBounce: string
  easingSmooth: string
} {
  switch (energy) {
    case 'minimal':
      return {
        fast: '100ms',
        normal: '200ms',
        slow: '300ms',
        easingBounce: 'ease-out',
        easingSmooth: 'ease-in-out',
      }

    case 'smooth':
      return {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
        easingBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        easingSmooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }

    case 'lively':
      return {
        fast: '200ms',
        normal: '300ms',
        slow: '500ms',
        easingBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        easingSmooth: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
      }

    case 'dynamic':
      return {
        fast: '250ms',
        normal: '400ms',
        slow: '600ms',
        easingBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        easingSmooth: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      }
  }
}

export function mapStateEmphasisToCSS(emphasis: StateEmphasis): {
  uploadWeight: number
  resultWeight: number
} {
  switch (emphasis) {
    case 'upload-first':
      return { uploadWeight: 2, resultWeight: 1 }
    case 'result-first':
      return { uploadWeight: 1, resultWeight: 2 }
    case 'balanced':
      return { uploadWeight: 1, resultWeight: 1 }
  }
}

// ============================================================================
// Generate CSS Variables
// ============================================================================

export function generateVisualIdentityCSSVariables(options: {
  brandColor: string
  surfaceStyle: SurfaceStyle
  cornerRadius: CornerRadius
  spacingDensity: SpacingDensity
  typographyTone: TypographyTone
  visualIntensity: VisualIntensity
  iconStyle: IconStyle
  backdropStyle: BackdropStyle
  motionEnergy: MotionEnergy
  stateEmphasis: StateEmphasis
}): VisualIdentityCSSVariables {
  const {
    brandColor,
    surfaceStyle,
    cornerRadius,
    spacingDensity,
    typographyTone,
    visualIntensity,
    iconStyle,
    backdropStyle,
    motionEnergy,
    stateEmphasis,
  } = options

  // Brand color derivatives
  const brandPrimary = brandColor
  const brandPrimaryLight = adjustColor(brandColor, 20)
  const brandPrimaryDark = adjustColor(brandColor, -20)
  const brandPrimarySoft = adjustColorOpacity(brandColor, 0.1)
  const brandPrimaryGlow = adjustColorOpacity(brandColor, 0.3)

  // Surface
  const surface = mapSurfaceStyleToCSS(surfaceStyle, brandColor)

  // Corner radius
  const radius = mapCornerRadiusToCSS(cornerRadius)

  // Spacing
  const spacing = mapSpacingDensityToCSS(spacingDensity)

  // Typography
  const typography = mapTypographyToneToCSS(typographyTone)

  // Icon
  const icon = mapIconStyleToCSS(iconStyle)

  // Motion
  const motion = mapMotionEnergyToCSS(motionEnergy)

  // State emphasis
  const state = mapStateEmphasisToCSS(stateEmphasis)
 
  // Visual intensity
  const intensity = mapVisualIntensityToCSS(visualIntensity)
 
  // Backdrop
  const backdrop = mapBackdropStyleToCSS(backdropStyle)
 
  return {
    '--brand-primary': brandPrimary,
    '--brand-primary-light': brandPrimaryLight,
    '--brand-primary-dark': brandPrimaryDark,
    '--brand-primary-soft': brandPrimarySoft,
    '--brand-primary-glow': brandPrimaryGlow,
 
    '--surface-bg': surface.bg,
    '--surface-bg-hover': adjustColorOpacity(surface.bg, 0.8),
    '--surface-border': surface.border,
    '--surface-shadow': surface.shadow,
 
    '--radius-sm': radius.sm,
    '--radius-md': radius.md,
    '--radius-lg': radius.lg,
    '--radius-full': radius.full,
 
    '--space-xs': spacing.xs,
    '--space-sm': spacing.sm,
    '--space-md': spacing.md,
    '--space-lg': spacing.lg,
    '--space-xl': spacing.xl,
 
    '--font-family': typography.fontFamily,
    '--font-weight-normal': typography.fontWeightNormal,
    '--font-weight-bold': typography.fontWeightBold,
    '--font-size-sm': '14px',
    '--font-size-base': '16px',
    '--font-size-lg': '18px',
    '--line-height': '1.5',
    '--letter-spacing': typography.letterSpacing,
 
    '--icon-stroke-width': icon.strokeWidth,
    '--icon-fill': icon.fill,
 
    '--transition-fast': motion.fast,
    '--transition-normal': motion.normal,
    '--transition-slow': motion.slow,
    '--easing-bounce': motion.easingBounce,
    '--easing-smooth': motion.easingSmooth,
 
    '--state-upload-weight': state.uploadWeight,
    '--state-result-weight': state.resultWeight,
 
    '--intensity-shadow': intensity.shadow,
    '--intensity-border-opacity': intensity.borderOpacity,
    '--intensity-contrast': intensity.contrast,
 
    '--backdrop-filter': backdrop.filter,
    '--backdrop-bg': backdrop.bg,
  }
}

// ============================================================================
// Color Utilities
// ============================================================================

function adjustColor(hex: string, amount: number): string {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount))
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount))
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function adjustColorOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// ============================================================================
// CSS Rule Generator
// ============================================================================

export function generateVisualIdentityCSSRules(variables: VisualIdentityCSSVariables): string {
  return `
:root {
  ${Object.entries(variables).map(([key, value]) => `${key}: ${value};`).join('\n  ')}
}

/* State-based styles using visual identity tokens */
.widget-button {
  background: var(--surface-bg);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-family);
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-normal) var(--easing-smooth);
  box-shadow: var(--surface-shadow);
}

.widget-button:hover {
  background: var(--surface-bg-hover);
  box-shadow: 0 8px 16px var(--brand-primary-glow);
}

.widget-modal {
  background: var(--surface-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  font-family: var(--font-family);
  line-height: var(--line-height);
}

.widget-icon {
  stroke-width: var(--icon-stroke-width);
  fill: var(--icon-fill);
}

/* State emphasis styles */
.state-upload {
  flex-grow: var(--state-upload-weight);
}

.state-result {
  flex-grow: var(--state-result-weight);
}
`.trim()
}
