/**
 * Design Tokens Configuration
 *
 * Complete documentation of all design tokens available in the DDS V3 system.
 * These tokens are defined in app/globals.css and accessible via CSS custom properties.
 *
 * All tokens can be used in components via:
 * - CSS: `var(--token-name)`
 * - Tailwind: Custom color/spacing utilities
 *
 * @category documentation
 */

/**
 * Spacing Scale
 * Used for consistent spacing across layouts, cards, and sections
 *
 * CSS Variables:
 * - --space-xs: 0.25rem (4px)
 * - --space-sm: 0.5rem (8px)
 * - --space-md: 1rem (16px)
 * - --space-lg: 1.5rem (24px)
 * - --space-xl: 2rem (32px)
 * - --space-2xl: 2.5rem (40px)
 * - --space-3xl: 3rem (48px)
 * - --space-4xl: 4rem (64px)
 *
 * Semantic Spacing:
 * - --space-sidebar-width: 18rem (288px)
 * - --space-card-padding: 1.5rem (24px)
 * - --space-grid-gap-standard: 1.5rem (24px)
 * - --space-grid-gap-compact: 1rem (16px)
 * - --space-grid-gap-generous: 2rem (32px)
 */
export const SPACING_TOKENS = {
  xs: 'var(--space-xs)',
  sm: 'var(--space-sm)',
  md: 'var(--space-md)',
  lg: 'var(--space-lg)',
  xl: 'var(--space-xl)',
  '2xl': 'var(--space-2xl)',
  '3xl': 'var(--space-3xl)',
  '4xl': 'var(--space-4xl)',
  sidebarWidth: 'var(--space-sidebar-width)',
  cardPadding: 'var(--space-card-padding)',
  gridGapStandard: 'var(--space-grid-gap-standard)',
  gridGapCompact: 'var(--space-grid-gap-compact)',
  gridGapGenerous: 'var(--space-grid-gap-generous)',
}

/**
 * Typography Scale
 * Font sizes for consistent text hierarchy
 *
 * CSS Variables:
 * - --text-xs: 0.75rem (12px)
 * - --text-sm: 0.875rem (14px)
 * - --text-base: 1rem (16px)
 * - --text-lg: 1.125rem (18px)
 * - --text-xl: 1.25rem (20px)
 * - --text-2xl: 1.5rem (24px)
 * - --text-3xl: 1.875rem (30px)
 * - --text-4xl: 2.25rem (36px)
 */
export const TYPOGRAPHY_TOKENS = {
  xs: 'var(--text-xs)',
  sm: 'var(--text-sm)',
  base: 'var(--text-base)',
  lg: 'var(--text-lg)',
  xl: 'var(--text-xl)',
  '2xl': 'var(--text-2xl)',
  '3xl': 'var(--text-3xl)',
  '4xl': 'var(--text-4xl)',
}

/**
 * Font Weights
 * Weight definitions for typography
 *
 * CSS Variables:
 * - --font-normal: 400
 * - --font-medium: 500
 * - --font-semibold: 600
 * - --font-bold: 700
 * - --font-black: 900
 */
export const FONT_WEIGHT_TOKENS = {
  normal: 'var(--font-normal)',
  medium: 'var(--font-medium)',
  semibold: 'var(--font-semibold)',
  bold: 'var(--font-bold)',
  black: 'var(--font-black)',
}

/**
 * Line Heights
 * Line height scale for readability
 *
 * CSS Variables:
 * - --leading-tight: 1.25
 * - --leading-snug: 1.375
 * - --leading-normal: 1.5
 * - --leading-relaxed: 1.625
 * - --leading-loose: 2
 */
export const LINE_HEIGHT_TOKENS = {
  tight: 'var(--leading-tight)',
  snug: 'var(--leading-snug)',
  normal: 'var(--leading-normal)',
  relaxed: 'var(--leading-relaxed)',
  loose: 'var(--leading-loose)',
}

/**
 * Shadow Scale
 * Elevation and depth through shadows
 *
 * CSS Variables:
 * - --shadow-xs: smallest shadow
 * - --shadow-sm: small shadow
 * - --shadow-md: medium shadow
 * - --shadow-lg: large shadow
 * - --shadow-xl: extra large shadow
 * - --shadow-2xl: 2x extra large shadow
 * - --shadow-glass: special glass-morphism shadow
 *
 * Used for:
 * - Cards and elevation
 * - Floating elements
 * - Depth perception
 */
export const SHADOW_TOKENS = {
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  '2xl': 'var(--shadow-2xl)',
  glass: 'var(--shadow-glass)',
}

/**
 * Blur Scale
 * Backdrop filter and blur effects
 *
 * CSS Variables:
 * - --blur-none: 0
 * - --blur-sm: 4px
 * - --blur-base: 8px
 * - --blur-md: 12px
 * - --blur-lg: 16px
 * - --blur-xl: 20px
 * - --blur-glass: 12px (special)
 *
 * Used for:
 * - Glass-morphism effects
 * - Backdrop filters
 * - Visual depth
 */
export const BLUR_TOKENS = {
  none: 'var(--blur-none)',
  sm: 'var(--blur-sm)',
  base: 'var(--blur-base)',
  md: 'var(--blur-md)',
  lg: 'var(--blur-lg)',
  xl: 'var(--blur-xl)',
  glass: 'var(--blur-glass)',
}

/**
 * Role Colors
 * Semantic colors for user roles and access levels
 *
 * CSS Variables (OKLCH format):
 * - --color-role-member: oklch(0.646 0.172 240.5) - Blue
 * - --color-role-member-plus: oklch(0.7 0.19 191.8) - Cyan
 * - --color-role-partner: oklch(0.646 0.194 276.3) - Purple
 * - --color-role-admin: oklch(0.637 0.237 25.331) - Red/Orange
 *
 * Used for:
 * - Badge colors
 * - Role indicators
 * - Access level visualization
 */
export const ROLE_COLOR_TOKENS = {
  member: 'var(--color-role-member)',
  memberPlus: 'var(--color-role-member-plus)',
  partner: 'var(--color-role-partner)',
  admin: 'var(--color-role-admin)',
}

/**
 * Status Colors
 * Semantic colors for status states and feedback
 *
 * CSS Variables (OKLCH format):
 * - --color-status-success: oklch(0.646 0.222 41.116) - Green
 * - --color-status-warning: oklch(0.769 0.188 70.08) - Yellow
 * - --color-status-error: oklch(0.577 0.245 27.325) - Red
 * - --color-status-info: oklch(0.708 0 0) - Gray
 *
 * Used for:
 * - Status badges
 * - Feedback messages
 * - Alert states
 */
export const STATUS_COLOR_TOKENS = {
  success: 'var(--color-status-success)',
  warning: 'var(--color-status-warning)',
  error: 'var(--color-status-error)',
  info: 'var(--color-status-info)',
}

/**
 * Glass Variants
 * Pre-configured glass-morphism effects
 *
 * CSS Variables:
 * - --glass-bg-light: rgba(255, 255, 255, 0.15) - Light background
 * - --glass-bg-medium: rgba(255, 255, 255, 0.08) - Medium background
 * - --glass-bg-strong: rgba(255, 255, 255, 0.05) - Strong background
 * - --glass-border: rgba(255, 255, 255, 0.2) - Standard border
 * - --glass-border-light: rgba(255, 255, 255, 0.3) - Light border
 * - --glass-border-subtle: rgba(255, 255, 255, 0.1) - Subtle border
 *
 * Dark mode variants provided in :root .dark
 *
 * Used for:
 * - Glass card effects
 * - Navigation headers
 * - Floating action buttons
 */
export const GLASS_TOKENS = {
  bgLight: 'var(--glass-bg-light)',
  bgMedium: 'var(--glass-bg-medium)',
  bgStrong: 'var(--glass-bg-strong)',
  border: 'var(--glass-border)',
  borderLight: 'var(--glass-border-light)',
  borderSubtle: 'var(--glass-border-subtle)',
}

/**
 * CSS Utility Classes for Design Tokens
 *
 * Available in @layer components:
 * - .glass-light, .glass-medium, .glass-strong - Glass variants
 * - .interactive-card, .interactive-card-* - Interactive states
 * - .floating-base, .floating-base-sm - Floating elements
 * - .badge-member, .badge-member-plus, .badge-partner, .badge-admin - Role badges
 * - .badge-success, .badge-warning, .badge-error, .badge-info - Status badges
 */

/**
 * Token Usage Examples
 *
 * CSS:
 * ```css
 * .my-component {
 *   padding: var(--space-card-padding);
 *   font-size: var(--text-lg);
 *   font-weight: var(--font-semibold);
 *   box-shadow: var(--shadow-lg);
 *   background-color: var(--glass-bg-medium);
 *   border: 1px solid var(--glass-border);
 *   backdrop-filter: blur(var(--blur-glass));
 * }
 * ```
 *
 * Tailwind:
 * ```tsx
 * <div className="bg-blue-500 text-lg font-semibold shadow-lg">
 *   Content with design tokens
 * </div>
 * ```
 *
 * Components (using primitives):
 * ```tsx
 * import { GlassCard, StatusBadge } from '@/components/primitives'
 *
 * <GlassCard variant="medium" padding="spacious" shadow="glass">
 *   <StatusBadge role="admin">Admin User</StatusBadge>
 * </GlassCard>
 * ```
 */

export const DESIGN_TOKENS = {
  spacing: SPACING_TOKENS,
  typography: TYPOGRAPHY_TOKENS,
  fontWeight: FONT_WEIGHT_TOKENS,
  lineHeight: LINE_HEIGHT_TOKENS,
  shadow: SHADOW_TOKENS,
  blur: BLUR_TOKENS,
  roles: ROLE_COLOR_TOKENS,
  status: STATUS_COLOR_TOKENS,
  glass: GLASS_TOKENS,
}

export default DESIGN_TOKENS
