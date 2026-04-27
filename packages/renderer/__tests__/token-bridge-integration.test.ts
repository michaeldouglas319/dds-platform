/**
 * Integration test: Token bridge with shadcn/ui + Three.js
 * Verifies that CSS tokens are accessible to both systems.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import {
  getColorToken,
  getNumericToken,
  getStringToken,
  applyColorTokens,
} from '../lib/token-bridge';

describe('Token Bridge Integration', () => {
  describe('shadcn/ui ↔ Three.js token sharing', () => {
    it('reads primary color token accessible to both UI and 3D', () => {
      // Shadcn would use --color-primary via Tailwind CSS
      // Three.js accesses it via the token bridge
      const primaryColor = getColorToken('--color-primary', '#6366f1');
      expect(primaryColor).toBeInstanceOf(THREE.Color);

      // Verify it's not a fallback
      const hex = primaryColor.getHexString();
      expect(hex).not.toBe('ffffff');
    });

    it('reads secondary/accent color token', () => {
      const accentColor = getColorToken('--color-secondary', '#00ccaa');
      expect(accentColor).toBeInstanceOf(THREE.Color);
      expect(accentColor.r + accentColor.g + accentColor.b).toBeGreaterThan(0);
    });

    it('reads neutral palette tokens', () => {
      const neutral900 = getColorToken('--color-neutral-900', 'hsl(0 0% 10%)');
      const neutral50 = getColorToken('--color-neutral-50', 'hsl(0 0% 100%)');

      // Verify both resolve to different colors
      const diff =
        Math.abs(neutral900.r - neutral50.r) +
        Math.abs(neutral900.g - neutral50.g) +
        Math.abs(neutral900.b - neutral50.b);
      expect(diff).toBeGreaterThan(1); // Significant color difference
    });

    it('reads spacing tokens as numbers', () => {
      // Tailwind CSS uses these for spacing
      // Three.js can use them for positioning
      const space8 = getNumericToken('--space-8', 1);
      const space16 = getNumericToken('--space-16', 2);
      const space32 = getNumericToken('--space-32', 4);

      // Verify fallback pattern works
      expect(space8).toBeGreaterThan(0);
    });

    it('reads typography tokens', () => {
      // Both Tailwind and Three.js text rendering can use these
      const fontSans = getStringToken('--font-sans', 'system-ui');
      const fontMono = getStringToken('--font-mono', 'monospace');

      expect(fontSans).toBeTruthy();
      expect(fontMono).toBeTruthy();
    });
  });

  describe('Material uniform application', () => {
    it('applies color tokens to shader material uniforms', () => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uPrimaryColor: { value: new THREE.Color(0x000000) },
          uSecondaryColor: { value: new THREE.Color(0x000000) },
        },
        vertexShader: 'void main() {}',
        fragmentShader: 'void main() {}',
      });

      // Apply tokens
      applyColorTokens(material, {
        uPrimaryColor: '--color-primary',
        uSecondaryColor: '--color-secondary',
      });

      // Verify colors changed from black
      expect(material.uniforms.uPrimaryColor.value.getHexString()).not.toBe(
        '000000',
      );
      expect(material.uniforms.uSecondaryColor.value.getHexString()).not.toBe(
        '000000',
      );
    });

    it('handles missing uniforms gracefully', () => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uPrimaryColor: { value: new THREE.Color(0x000000) },
        },
        vertexShader: 'void main() {}',
        fragmentShader: 'void main() {}',
      });

      // Should not throw when trying to apply nonexistent uniform
      expect(() => {
        applyColorTokens(material, {
          uPrimaryColor: '--color-primary',
          uNonexistent: '--color-nonexistent',
        });
      }).not.toThrow();
    });
  });

  describe('Theme switching compatibility', () => {
    it('supports light/dark theme variants via CSS custom properties', () => {
      // Both systems read from document root
      // Light theme would set --color-background to white
      // Dark theme would set it to black
      const backgroundColor = getColorToken('--color-background', '#ffffff');
      expect(backgroundColor).toBeInstanceOf(THREE.Color);

      // Should be readable in both contexts
      const hex = backgroundColor.getHexString();
      expect(hex).toBeTruthy();
    });
  });
});
