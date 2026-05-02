/**
 * Token Bridge + Three.js Material Integration Tests
 *
 * Verifies that CSS design tokens can be reliably used with Three.js materials
 * and that theme changes propagate correctly.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import {
  getColorToken,
  getNumericToken,
  applyColorTokens,
  bridgeColorUniform,
  subscribeToThemeChanges,
  getCurrentTheme,
} from '../lib/token-bridge';

describe('Token Bridge + Three.js Integration', () => {
  beforeEach(() => {
    // Reset document state
    document.documentElement.removeAttribute('data-theme');

    // Mock window.matchMedia if not available (jsdom doesn't have it by default)
    if (typeof window.matchMedia === 'undefined') {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    }
  });

  describe('Creating tokenized materials', () => {
    it('creates a shader material with color tokens', () => {
      const primaryColor = getColorToken('--color-primary', '#6366f1');
      const secondaryColor = getColorToken('--color-secondary', '#10b981');

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uPrimaryColor: { value: primaryColor },
          uSecondaryColor: { value: secondaryColor },
        },
        vertexShader: 'void main() {}',
        fragmentShader: 'void main() {}',
      });

      expect(material.uniforms.uPrimaryColor.value).toBeInstanceOf(
        THREE.Color,
      );
      expect(material.uniforms.uSecondaryColor.value).toBeInstanceOf(
        THREE.Color,
      );
    });

    it('creates a shader material with numeric tokens', () => {
      const duration = getNumericToken('--animation-duration', 1.0);
      const intensity = getNumericToken('--glow-intensity', 1.5);

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uDuration: { value: duration },
          uIntensity: { value: intensity },
        },
        vertexShader: 'void main() {}',
        fragmentShader: 'void main() {}',
      });

      expect(typeof material.uniforms.uDuration.value).toBe('number');
      expect(typeof material.uniforms.uIntensity.value).toBe('number');
    });
  });

  describe('Bridging tokens to uniforms', () => {
    it('applies a single color token to a uniform', () => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(0x000000) },
        },
        vertexShader: 'void main() {}',
        fragmentShader: 'void main() {}',
      });

      const originalColor = material.uniforms.uColor.value.getHexString();

      // Apply token
      bridgeColorUniform(material.uniforms.uColor, '--color-primary', '#ffffff');

      const newColor = material.uniforms.uColor.value.getHexString();

      // Should change from black (even if fallback)
      expect(newColor).not.toBe(originalColor);
    });

    it('applies multiple color tokens via applyColorTokens', () => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uPrimaryColor: { value: new THREE.Color(0x000000) },
          uAccentColor: { value: new THREE.Color(0x000000) },
          uNeutralColor: { value: new THREE.Color(0x000000) },
        },
        vertexShader: 'void main() {}',
        fragmentShader: 'void main() {}',
      });

      applyColorTokens(material, {
        uPrimaryColor: '--color-primary',
        uAccentColor: '--color-accent',
        uNeutralColor: '--color-neutral',
      });

      // All should be updated (not black anymore)
      expect(material.uniforms.uPrimaryColor.value.getHexString()).not.toBe(
        '000000',
      );
      expect(material.uniforms.uAccentColor.value.getHexString()).not.toBe(
        '000000',
      );
      expect(material.uniforms.uNeutralColor.value.getHexString()).not.toBe(
        '000000',
      );
    });

    it('skips non-Color uniforms safely', () => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(0xffffff) },
          uTime: { value: 0 },
          uScale: { value: 1.0 },
        },
        vertexShader: 'void main() {}',
        fragmentShader: 'void main() {}',
      });

      // Should only update uColor, not uTime or uScale
      applyColorTokens(material, {
        uColor: '--color-primary',
      });

      // uColor should be updated (will use fallback color in getColorToken)
      expect(material.uniforms.uColor.value).toBeInstanceOf(THREE.Color);
      // uTime and uScale should be unchanged
      expect(material.uniforms.uTime.value).toBe(0);
      expect(material.uniforms.uScale.value).toBe(1.0);
    });

    it('handles undefined uniforms gracefully', () => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(0xffffff) },
        },
        vertexShader: 'void main() {}',
        fragmentShader: 'void main() {}',
      });

      // Should not throw when requested uniform doesn't exist
      expect(() => {
        applyColorTokens(material, {
          uColor: '--color-primary',
          uMissing: '--color-missing',
        });
      }).not.toThrow();
    });

    it('ignores non-ShaderMaterial types', () => {
      const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

      // Should not throw and should return early
      expect(() => {
        applyColorTokens(material, {
          uColor: '--color-primary',
        });
      }).not.toThrow();
    });
  });

  describe('Theme changes and token updates', () => {
    it('subscribes to theme changes and executes callback', async () => {
      return new Promise<void>((resolve) => {
        let callCount = 0;

        const unsubscribe = subscribeToThemeChanges(() => {
          callCount++;
        });

        // Simulate theme change
        setTimeout(() => {
          document.documentElement.setAttribute('data-theme', 'dark');
          // Trigger mutation observer
          document.documentElement.dispatchEvent(new Event('change'));

          setTimeout(() => {
            expect(callCount).toBeGreaterThanOrEqual(1);
            unsubscribe();
            resolve();
          }, 50);
        }, 50);
      });
    });

    it('unsubscribe stops listening to theme changes', async () => {
      return new Promise<void>((resolve) => {
        let callCount = 0;

        const unsubscribe = subscribeToThemeChanges(() => {
          callCount++;
        });

        // Unsubscribe immediately
        unsubscribe();

        // Change theme
        setTimeout(() => {
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.dispatchEvent(new Event('change'));

          setTimeout(() => {
            // Should not have called callback since we unsubscribed
            expect(callCount).toBe(0);
            resolve();
          }, 50);
        }, 50);
      });
    });

    it('updates material uniforms after theme change', async () => {
      return new Promise<void>((resolve) => {
        const material = new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: new THREE.Color(0xffffff) },
          },
          vertexShader: 'void main() {}',
          fragmentShader: 'void main() {}',
        });

        const unsubscribe = subscribeToThemeChanges(() => {
          // Re-apply tokens after theme change
          applyColorTokens(material, {
            uColor: '--color-primary',
          });

          const colorAfter = material.uniforms.uColor.value.getHexString();
          expect(colorAfter).not.toBe('000000');

          unsubscribe();
          resolve();
        });

        // Trigger theme change
        document.documentElement.setAttribute('data-theme', 'dark');
      });
    });
  });

  describe('Getting current theme', () => {
    it('returns current theme from data-theme attribute', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      expect(getCurrentTheme()).toBe('dark');

      document.documentElement.setAttribute('data-theme', 'light');
      expect(getCurrentTheme()).toBe('light');
    });

    it('falls back to system preference when no data-theme', () => {
      document.documentElement.removeAttribute('data-theme');

      // window.matchMedia is mocked in beforeEach, just call it
      const theme = getCurrentTheme();
      expect(theme).toBe('dark');
    });

    it('defaults to dark during SSR', () => {
      const originalDocument = global.document;
      // @ts-ignore
      delete global.document;

      expect(getCurrentTheme()).toBe('dark');

      global.document = originalDocument;
    });
  });

  describe('Integration: Theme switching updates all materials', () => {
    it('re-applies tokens to multiple materials after theme change', async () => {
      return new Promise<void>((resolve) => {
        const material1 = new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: new THREE.Color(0x000000) },
          },
          vertexShader: 'void main() {}',
          fragmentShader: 'void main() {}',
        });

        const material2 = new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: new THREE.Color(0x000000) },
          },
          vertexShader: 'void main() {}',
          fragmentShader: 'void main() {}',
        });

        const materials = [material1, material2];
        const tokenMap = { uColor: '--color-primary' };

        const unsubscribe = subscribeToThemeChanges(() => {
          // Update all materials
          materials.forEach((material) => {
            applyColorTokens(material, tokenMap);
          });

          // Verify all updated
          expect(material1.uniforms.uColor.value.getHexString()).not.toBe(
            '000000',
          );
          expect(material2.uniforms.uColor.value.getHexString()).not.toBe(
            '000000',
          );

          unsubscribe();
          resolve();
        });

        // Trigger change
        document.documentElement.setAttribute('data-theme', 'dark');
      });
    });
  });
});
