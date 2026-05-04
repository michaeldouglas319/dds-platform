/**
 * Design System Tokens for Configurator
 * Centralized token definitions aligned with DDS V3 design system
 *
 * Uses semantic tokens from globals.css CSS variables
 */

export const configuratorTokens = {
  /**
   * Semantic color tokens (maps to CSS variables)
   * Automatically supports light/dark mode via CSS custom properties
   */
  colors: {
    // Primary states
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    card: 'var(--card)',
    border: 'var(--border)',

    // Interactive states
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    muted: 'var(--muted)',
    accent: 'var(--accent)',

    // Feedback states
    error: 'var(--destructive)',
    success: 'var(--chart-1)',
    warning: 'var(--chart-4)',
    info: 'var(--ring)',

    // Text hierarchy
    'text-primary': 'var(--foreground)',
    'text-secondary': 'var(--foreground) / 0.8',
    'text-tertiary': 'var(--muted-foreground)',
    'text-disabled': 'var(--muted-foreground) / 0.5',
  },

  /**
   * Spacing scale (Tailwind default with semantic names)
   */
  spacing: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  },

  /**
   * Radius tokens matching CSS variables
   */
  radius: {
    sm: 'var(--radius-sm)',      // 6px
    md: 'var(--radius-md)',      // 8px
    lg: 'var(--radius-lg)',      // 10px
    xl: 'var(--radius-xl)',      // 14px
  },

  /**
   * Glass morphism effect variations
   */
  glass: {
    standard: 'glass',
    subtle: 'glass-sm',
    overlay: 'bg-background/50 backdrop-blur-md',
  },

  /**
   * Focus/ring patterns
   */
  focus: {
    ring: 'focus-ring',
    ringDestructive: 'focus-visible:ring-destructive/50 focus-visible:ring-[3px]',
  },

  /**
   * Shadow patterns
   */
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    none: 'shadow-none',
  },

  /**
   * Transitions/animations
   */
  transitions: {
    fast: 'duration-150',
    base: 'duration-200',
    slow: 'duration-300',
  },

  /**
   * Component-specific tokens
   */
  components: {
    button: {
      base: 'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium',
      focusRing: 'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    },

    badge: {
      base: 'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
      focusRing: 'focus-visible:ring-ring/50 focus-visible:ring-[2px]',
    },

    input: {
      base: 'flex rounded-md border border-input bg-background px-3 py-2 text-sm',
      focusRing: 'focus-visible:ring-ring/50 focus-visible:ring-[2px]',
    },

    hud: {
      badge: 'viewport-hud',
      indicator: 'viewport-badge',
    },

    grid: {
      pattern: 'grid-pattern',
    },
  },

  /**
   * Layout breakpoints (mobile-first)
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /**
   * Z-index scale
   */
  zIndex: {
    background: '0',
    content: '10',
    sidebar: '50',
    hud: '20',
    modal: '100',
    tooltip: '110',
    notification: '120',
  },

  /**
   * Typography
   */
  typography: {
    fontSans: "'Geist', 'Geist Fallback', sans-serif",
    fontMono: "'Geist Mono', 'Geist Mono Fallback', monospace",

    sizes: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
    },

    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    },

    lineHeights: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },
} as const;

/**
 * Utility type for accessing token values
 */
export type ConfiguratorTokens = typeof configuratorTokens;

/**
 * Helper function to get nested token values with type safety
 *
 * @example
 * getToken('colors', 'primary')
 * getToken('components', 'button', 'focusRing')
 */
export function getToken<T extends readonly string[]>(...path: T): string {
  let current: any = configuratorTokens;
  for (const key of path) {
    current = current?.[key];
  }
  return current ?? '';
}

/**
 * Helper to create CSS variable reference
 *
 * @example
 * cssVar('background')
 * // Returns: var(--background)
 */
export function cssVar(name: string): string {
  return `var(--${name})`;
}

/**
 * Helper to apply color with opacity
 *
 * @example
 * colorWithOpacity('primary', 0.5)
 * // Returns: var(--primary) / 0.5
 */
export function colorWithOpacity(colorName: string, opacity: number): string {
  return `var(--${colorName}) / ${opacity}`;
}

/**
 * Tailwind class generator for tokens
 * Use with cn() utility function
 *
 * @example
 * cn(
 *   tokenClasses('button'),
 *   tokenClasses('focus')
 * )
 */
export function tokenClasses(...keys: string[]): string {
  // Map common token names to Tailwind classes
  const tokenMap: Record<string, string> = {
    glass: 'glass',
    'glass-sm': 'glass-sm',
    'focus-ring': 'focus-ring',
    'grid-pattern': 'grid-pattern',
    'viewport-hud': 'viewport-hud',
    'viewport-badge': 'viewport-badge',
  };

  return keys
    .map((key) => tokenMap[key] || '')
    .filter(Boolean)
    .join(' ');
}

export default configuratorTokens;
