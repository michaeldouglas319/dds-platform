/**
 * Global Typography Scale
 * Based on Tailwind CSS default font scale and Material Design typography
 * https://tailwindcss.com/docs/font-size
 * https://material.io/design/typography/the-type-system.html
 * https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/config.full.js
 */

export const TYPOGRAPHY = {
  // Tailwind standard scale
  xs: {
    fontSize: '0.75rem',   // 12px
    lineHeight: '1rem',    // 16px
    fontWeight: 400,
  },
  sm: {
    fontSize: '0.875rem',  // 14px
    lineHeight: '1.25rem', // 20px
    fontWeight: 400,
  },
  base: {
    fontSize: '1rem',      // 16px
    lineHeight: '1.5rem',  // 24px
    fontWeight: 400,
  },
  lg: {
    fontSize: '1.125rem',  // 18px
    lineHeight: '1.75rem', // 28px
    fontWeight: 400,
  },
  xl: {
    fontSize: '1.25rem',   // 20px
    lineHeight: '1.75rem', // 28px
    fontWeight: 600,
  },
  '2xl': {
    fontSize: '1.5rem',    // 24px
    lineHeight: '2rem',    // 32px
    fontWeight: 700,
  },
  '3xl': {
    fontSize: '1.875rem',  // 30px
    lineHeight: '2.25rem', // 36px
    fontWeight: 700,
  },
  '4xl': {
    fontSize: '2.25rem',   // 36px
    lineHeight: '2.5rem',  // 40px
    fontWeight: 700,
  },
  '5xl': {
    fontSize: '3rem',      // 48px
    lineHeight: '1',
    fontWeight: 700,
  },
} as const;

export type TypographyKey = keyof typeof TYPOGRAPHY;

export function getTypography(key: TypographyKey) {
  return TYPOGRAPHY[key];
}
