import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import {
  getColorToken,
  getNumericToken,
  getStringToken,
  getCurrentTheme,
} from '../lib/token-bridge';

describe('Token Bridge', () => {
  beforeEach(() => {
    // Reset document state
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Color token parsing', () => {
    it('converts HSL string to THREE.Color', () => {
      const color = getColorToken('--color-primary', 'hsl(226 71% 55%)');
      expect(color).toBeInstanceOf(THREE.Color);
      // Verify it's a valid color (not black/white fallback)
      expect(color.r + color.g + color.b).toBeGreaterThan(0);
    });

    it('converts RGB string to THREE.Color', () => {
      const color = getColorToken('--color-primary-rgb', '99 102 241');
      expect(color).toBeInstanceOf(THREE.Color);
      // RGB(99, 102, 241) normalized
      expect(Math.round(color.r * 255)).toBe(99);
      expect(Math.round(color.g * 255)).toBe(102);
      expect(Math.round(color.b * 255)).toBe(241);
    });

    it('converts hex color string', () => {
      const color = getColorToken('--color-primary', '#6366f1');
      expect(color).toBeInstanceOf(THREE.Color);
      expect(color.getHexString()).toBe('6366f1');
    });

    it('falls back to provided fallback color', () => {
      const color = getColorToken('--nonexistent-token', '#ffffff');
      expect(color).toBeInstanceOf(THREE.Color);
      expect(color.getHexString()).toBe('ffffff');
    });
  });

  describe('Numeric token parsing', () => {
    it('parses numeric values', () => {
      // Mock CSS property
      vi.spyOn(global, 'getComputedStyle').mockReturnValue({
        getPropertyValue: vi.fn((name: string) => {
          if (name === '--space-8') return '1rem';
          return '';
        }),
      } as any);

      const value = getNumericToken('--space-8', 16);
      expect(parseFloat(String(value))).toBeGreaterThan(0);
    });

    it('returns fallback for invalid numeric value', () => {
      vi.spyOn(global, 'getComputedStyle').mockReturnValue({
        getPropertyValue: vi.fn(() => 'not-a-number'),
      } as any);

      const value = getNumericToken('--space-8', 16);
      expect(value).toBe(16);
    });
  });

  describe('String token parsing', () => {
    it('returns string token value', () => {
      vi.spyOn(global, 'getComputedStyle').mockReturnValue({
        getPropertyValue: vi.fn((name: string) => {
          if (name === '--font-sans') {
            return 'system-ui, -apple-system, sans-serif';
          }
          return '';
        }),
      } as any);

      const font = getStringToken('--font-sans', 'Arial');
      expect(font).toBe('system-ui, -apple-system, sans-serif');
    });

    it('returns fallback for missing string token', () => {
      vi.spyOn(global, 'getComputedStyle').mockReturnValue({
        getPropertyValue: vi.fn(() => ''),
      } as any);

      const font = getStringToken('--font-sans', 'Arial');
      expect(font).toBe('Arial');
    });
  });

  describe('Theme detection', () => {
    it('detects dark theme from data-theme attribute', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const theme = getCurrentTheme();
      expect(theme).toBe('dark');
    });

    it('detects light theme from data-theme attribute', () => {
      document.documentElement.setAttribute('data-theme', 'light');
      const theme = getCurrentTheme();
      expect(theme).toBe('light');
    });

    it('falls back to system preference', () => {
      // Mock system preference
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as any);

      const theme = getCurrentTheme();
      expect(theme).toBe('dark');
    });
  });

  describe('HSL to Color conversion', () => {
    it('correctly converts HSL values to RGB', () => {
      // HSL(0, 100%, 50%) = pure red
      const red = getColorToken('--color-red', 'hsl(0 100% 50%)');
      expect(red.r).toBeGreaterThan(0.9);
      expect(red.g).toBeLessThan(0.1);
      expect(red.b).toBeLessThan(0.1);
    });

    it('handles grayscale HSL values', () => {
      // HSL(0, 0%, 50%) = gray
      const gray = getColorToken('--color-gray', 'hsl(0 0% 50%)');
      expect(Math.abs(gray.r - gray.g)).toBeLessThan(0.01);
      expect(Math.abs(gray.g - gray.b)).toBeLessThan(0.01);
    });

    it('handles various saturation and lightness values', () => {
      const color1 = getColorToken('--color-light', 'hsl(200 100% 90%)');
      const color2 = getColorToken('--color-dark', 'hsl(200 100% 10%)');

      // Light color should have higher brightness
      const brightness1 = color1.r + color1.g + color1.b;
      const brightness2 = color2.r + color2.g + color2.b;
      expect(brightness1).toBeGreaterThan(brightness2);
    });
  });

  describe('Server-side safety', () => {
    it('gracefully handles missing document object', () => {
      const originalDocument = global.document;
      // @ts-ignore
      delete global.document;

      const color = getColorToken('--color-primary', '#ffffff');
      expect(color).toBeInstanceOf(THREE.Color);
      expect(color.getHexString()).toBe('ffffff');

      global.document = originalDocument;
    });
  });
});
