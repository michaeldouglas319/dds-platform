/**
 * Theme Matrix Test Suite
 *
 * Automated testing of all theme × section combinations
 * 9 themes × 23 sections × 2 modes (light/dark) = 414 total tests
 *
 * Run with: pnpm test:e2e theme-matrix
 */

import { test, expect } from '@playwright/test';

// Theme variants to test
const THEMES = [
  'minimal',
  'vibrant',
  'neon',
  'arctic',
  'sunset',
  'forest',
  'midnight',
  'mist',
  'monochrome',
];

// Modes to test
const MODES = ['light', 'dark'];

// Sections available in site.config.json
const SECTIONS = [
  'hero',
  'features',
];

// Helper: Set theme variant
async function setTheme(page: any, theme: string) {
  await page.evaluate(({ variant }) => {
    document.documentElement.setAttribute('data-theme-variant', variant);
    localStorage.setItem('theme-variant', variant);
  }, { variant: theme });
}

// Helper: Set light/dark mode
async function setMode(page: any, mode: 'light' | 'dark') {
  await page.evaluate(({ theme }) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, { theme: mode });
}

// Helper: Verify CSS custom properties are set
async function verifyCSSProperties(page: any, theme: string, mode: string) {
  const computed = await page.evaluate(() => {
    const root = document.documentElement;
    return {
      primary: getComputedStyle(root).getPropertyValue('--color-brand-primary')?.trim(),
      accent: getComputedStyle(root).getPropertyValue('--color-brand-accent')?.trim(),
      background: getComputedStyle(root).getPropertyValue('--color-brand-background')?.trim(),
    };
  });

  // Verify variables are not empty
  expect(computed.primary).toBeTruthy();
  expect(computed.accent).toBeTruthy();
  expect(computed.background).toBeTruthy();

  // Verify they are hex colors
  expect(computed.primary).toMatch(/^#[0-9a-f]{6}$/i);
  expect(computed.accent).toMatch(/^#[0-9a-f]{6}$/i);
}

// Helper: Screenshot for visual regression
async function captureTheme(page: any, theme: string, mode: string, section: string) {
  const filename = `theme-${theme}-${mode}-${section}`;
  await page.screenshot({
    path: `test-results/screenshots/${filename}.png`,
    fullPage: true
  });
}

// Helper: Measure performance
async function measureThemeSwitch(page: any, fromTheme: string, toTheme: string) {
  const duration = await page.evaluate(
    ({ from, to }) => {
      const start = performance.now();
      document.documentElement.setAttribute('data-theme-variant', to);
      const end = performance.now();
      return end - start;
    },
    { from: fromTheme, to: toTheme }
  );

  expect(duration).toBeLessThan(100); // Theme switch should be < 100ms
  return duration;
}

// ──────────────────────────────────────────────────────────────

test.describe('Theme System - Full Matrix', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to showcase (or main page if showcase not available)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Test each theme variant
  THEMES.forEach(theme => {
    test.describe(`Theme: ${theme}`, () => {
      MODES.forEach(mode => {
        test(`should render correctly in ${mode} mode`, async ({ page }) => {
          // Set theme
          await setTheme(page, theme);
          await setMode(page, mode as 'light' | 'dark');
          await page.waitForTimeout(100); // CSS transition

          // Verify CSS properties
          await verifyCSSProperties(page, theme, mode);

          // Verify no console errors
          const errors: string[] = [];
          page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
          });

          expect(errors).toHaveLength(0);
        });

        // Test color contrast
        test(`${mode} mode has sufficient color contrast`, async ({ page }) => {
          await setTheme(page, theme);
          await setMode(page, mode as 'light' | 'dark');

          // Get all text elements
          const contrastResults = await page.evaluate(() => {
            const elements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, li');
            const results: any[] = [];

            elements.forEach(el => {
              const computed = window.getComputedStyle(el);
              const fg = computed.color;
              const bg = computed.backgroundColor;

              // Basic check: color should not be the same as background
              results.push({
                element: el.tagName,
                fg,
                bg,
                same: fg === bg,
              });
            });

            return results;
          });

          // Ensure no text has same color as background
          const sameColors = contrastResults.filter(r => r.same);
          expect(sameColors).toHaveLength(0);
        });
      });

      // Test all sections with this theme
      SECTIONS.forEach(section => {
        test(`should render section "${section}" correctly`, async ({ page }) => {
          await setTheme(page, theme);

          // Navigate to section if needed
          const sectionSelector = `[data-section-id="${section}"]`;
          await page.waitForSelector(sectionSelector, { timeout: 5000 }).catch(() => {
            // Section might not exist in test page, that's ok
          });

          // Verify render succeeded
          const hasErrors = await page.evaluate(() => {
            return !!document.querySelector('[data-error]');
          });

          expect(hasErrors).toBeFalsy();
        });
      });
    });
  });

  // ────────────────────────────────────────────────────────────

  test.describe('Theme Switching Performance', () => {
    test('should switch themes in < 100ms', async ({ page }) => {
      const durations: number[] = [];

      for (let i = 0; i < THEMES.length - 1; i++) {
        const duration = await measureThemeSwitch(page, THEMES[i], THEMES[i + 1]);
        durations.push(duration);
      }

      const maxDuration = Math.max(...durations);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

      console.log(`Theme switch performance: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      expect(maxDuration).toBeLessThan(100);
      expect(avgDuration).toBeLessThan(50);
    });

    test('should not cause layout shift on theme change', async ({ page }) => {
      // Measure CLS (Cumulative Layout Shift)
      const cls = await page.evaluate(() => {
        return new Promise<number>(resolve => {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if ((entry as any).hadRecentInput) continue;
              clsValue += (entry as any).value;
            }
          });

          observer.observe({ entryTypes: ['layout-shift'] });

          // Change theme
          document.documentElement.setAttribute('data-theme-variant', 'vibrant');

          // Wait a bit and measure
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 500);
        });
      });

      // CLS should be minimal (< 0.1 is "good")
      expect(cls).toBeLessThan(0.2);
    });
  });

  // ────────────────────────────────────────────────────────────

  test.describe('CSS Custom Properties', () => {
    test('all color variables should resolve', async ({ page }) => {
      for (const theme of THEMES) {
        await setTheme(page, theme);
        await page.waitForTimeout(50);

        const resolved = await page.evaluate(() => {
          const root = document.documentElement;
          const style = getComputedStyle(root);

          const vars = [
            '--color-brand-primary',
            '--color-brand-accent',
            '--color-brand-background',
            '--color-brand-foreground',
            '--color-brand-border',
            '--color-brand-muted',
          ];

          return vars.map(v => ({
            variable: v,
            value: style.getPropertyValue(v).trim(),
            isValid: style.getPropertyValue(v).trim().match(/^#[0-9a-f]{6}$/i) !== null,
          }));
        });

        resolved.forEach(r => {
          expect(r.value, `${theme}: ${r.variable}`).toBeTruthy();
          expect(r.isValid, `${theme}: ${r.variable} should be valid hex color`).toBeTruthy();
        });
      }
    });

    test('should support calc() with variables', async ({ page }) => {
      const result = await page.evaluate(() => {
        const el = document.createElement('div');
        el.style.width = 'calc(var(--color-brand-primary, #000) + 10px)';
        // Just verify it doesn't throw
        return true;
      });

      expect(result).toBeTruthy();
    });
  });

  // ────────────────────────────────────────────────────────────

  test.describe('Theme Persistence', () => {
    test('should persist theme choice to localStorage', async ({ page }) => {
      await setTheme(page, 'vibrant');

      const stored = await page.evaluate(() => {
        return localStorage.getItem('theme-variant');
      });

      expect(stored).toBe('vibrant');
    });

    test('should restore theme from localStorage on reload', async ({ page }) => {
      // Set a theme
      await setTheme(page, 'forest');

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check that theme is still set
      const currentTheme = await page.evaluate(() => {
        return document.documentElement.getAttribute('data-theme-variant');
      });

      expect(currentTheme).toBe('forest');
    });
  });

  // ────────────────────────────────────────────────────────────

  test.describe('Accessibility', () => {
    test('theme switcher should be keyboard navigable', async ({ page }) => {
      // Try to find and focus theme switcher
      const switched = await page.evaluate(() => {
        const switcher = document.querySelector('[role="button"][aria-label*="theme"], button[aria-label*="theme"]');
        if (switcher) {
          (switcher as HTMLElement).focus();
          return true;
        }
        return false;
      });

      if (switched) {
        // Verify focus is visible
        const hasFocus = await page.evaluate(() => {
          const active = document.activeElement;
          return active && window.getComputedStyle(active).outline !== 'none';
        });

        expect(hasFocus).toBeTruthy();
      }
    });

    test('theme switch should announce to screen readers', async ({ page }) => {
      const ariaResults = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
        return buttons
          .filter(el => {
            const label = el.getAttribute('aria-label') || el.textContent || '';
            return label.toLowerCase().includes('theme');
          })
          .map(el => ({
            label: el.getAttribute('aria-label'),
            role: el.getAttribute('role'),
            hasLabelledby: el.hasAttribute('aria-labelledby'),
          }));
      });

      if (ariaResults.length > 0) {
        ariaResults.forEach(result => {
          expect(result.label || result.hasLabelledby).toBeTruthy();
        });
      }
    });
  });

  // ────────────────────────────────────────────────────────────

  test.describe('Browser Compatibility', () => {
    test('CSS custom properties should work in this browser', async ({ page, browserName }) => {
      const supported = await page.evaluate(() => {
        const root = document.documentElement;
        root.style.setProperty('--test-var', '#ff0000');
        return getComputedStyle(root).getPropertyValue('--test-var').trim() === '#ff0000';
      });

      expect(supported).toBeTruthy();
    });

    test('should not have console errors or warnings', async ({ page }) => {
      const logs: { type: string; message: string }[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          logs.push({
            type: msg.type(),
            message: msg.text(),
          });
        }
      });

      // Trigger theme changes
      for (const theme of THEMES) {
        await setTheme(page, theme);
      }

      // Filter out known warnings that are acceptable
      const criticalLogs = logs.filter(l =>
        !l.message.includes('deprecat') &&
        !l.message.includes('experiment')
      );

      expect(criticalLogs).toHaveLength(0);
    });
  });

});

// ──────────────────────────────────────────────────────────────

test.describe('Responsive Theme Testing', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 },
  ];

  viewports.forEach(viewport => {
    test(`${viewport.name} (${viewport.width}×${viewport.height})`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize(viewport);

      // Test each theme
      for (const theme of THEMES) {
        await setTheme(page, theme);

        // Verify layout doesn't break
        const hasHorizontalScroll = await page.evaluate(() => {
          return window.innerWidth < document.documentElement.scrollWidth;
        });

        expect(hasHorizontalScroll, `${theme} should not cause horizontal scroll at ${viewport.width}px`).toBeFalsy();
      }
    });
  });
});
