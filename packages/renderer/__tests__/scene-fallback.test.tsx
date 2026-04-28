import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SceneWithFallback } from '../lib/SceneWithFallback';
import { checkWebGLSupport, useWebGLSupport } from '../lib/useWebGLSupport';
import { CanvasErrorBoundary } from '../lib/CanvasErrorBoundary';

describe('WebGL Fallback System', () => {
  beforeEach(() => {
    // Mock canvas.getContext to avoid jsdom "Not implemented" error
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      canvas: document.createElement('canvas'),
    })) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkWebGLSupport', () => {
    it('returns true when WebGL is available', () => {
      const result = checkWebGLSupport();
      expect(typeof result).toBe('boolean');
    });

    it('returns true in SSR environment (window undefined)', () => {
      const originalWindow = global.window;
      Object.defineProperty(global, 'window', { value: undefined, configurable: true });
      const result = checkWebGLSupport();
      expect(result).toBe(true);
      Object.defineProperty(global, 'window', { value: originalWindow, configurable: true });
    });

    it('handles canvas context creation errors gracefully', () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      // Should not throw
      expect(() => checkWebGLSupport()).not.toThrow();
    });
  });

  describe('CanvasErrorBoundary', () => {
    it('renders children without errors', () => {
      render(
        <CanvasErrorBoundary>
          <div data-testid="test-child">Content</div>
        </CanvasErrorBoundary>
      );
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('renders fallback when child throws error', () => {
      const ThrowComponent = () => {
        throw new Error('Canvas error');
      };

      const originalError = console.error;
      console.error = vi.fn(); // Suppress expected error

      render(
        <CanvasErrorBoundary fallback={<div data-testid="fallback">Fallback UI</div>}>
          <ThrowComponent />
        </CanvasErrorBoundary>
      );

      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      console.error = originalError;
    });

    it('renders default skeleton fallback when no custom fallback provided', () => {
      const ThrowComponent = () => {
        throw new Error('Canvas error');
      };

      const originalError = console.error;
      console.error = vi.fn(); // Suppress expected error

      render(
        <CanvasErrorBoundary>
          <ThrowComponent />
        </CanvasErrorBoundary>
      );

      // Skeleton should be rendered (has animate-pulse class)
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
      console.error = originalError;
    });

    it('respects custom height prop', () => {
      const ThrowComponent = () => {
        throw new Error('Canvas error');
      };

      const originalError = console.error;
      console.error = vi.fn(); // Suppress expected error

      const { container } = render(
        <CanvasErrorBoundary height={400}>
          <ThrowComponent />
        </CanvasErrorBoundary>
      );

      const fallbackDiv = container.querySelector('[style*="height"]');
      expect(fallbackDiv).toBeTruthy();
      console.error = originalError;
    });
  });

  describe('SceneWithFallback', () => {
    it('renders children without errors', () => {
      render(
        <SceneWithFallback>
          <div data-testid="test-scene">3D Scene</div>
        </SceneWithFallback>
      );
      expect(screen.getByTestId('test-scene')).toBeInTheDocument();
    });

    it('wraps content with Suspense and error boundary', () => {
      const { container } = render(
        <SceneWithFallback>
          <div data-testid="test-scene">3D Scene</div>
        </SceneWithFallback>
      );
      expect(container.querySelector('[style*="position"]')).toBeInTheDocument();
    });

    it('applies custom className to wrapper', () => {
      const { container } = render(
        <SceneWithFallback className="custom-class">
          <div>Content</div>
        </SceneWithFallback>
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('supports custom height as string', () => {
      const { container } = render(
        <SceneWithFallback height="400px">
          <div>Content</div>
        </SceneWithFallback>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.height).toBe('400px');
    });

    it('supports custom height as number (converts to px)', () => {
      const { container } = render(
        <SceneWithFallback height={400}>
          <div>Content</div>
        </SceneWithFallback>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.height).toBe('400px');
    });

    it('renders custom fallback when provided', () => {
      const ThrowComponent = () => {
        throw new Error('Canvas error');
      };

      const originalError = console.error;
      console.error = vi.fn(); // Suppress expected error

      render(
        <SceneWithFallback fallback={<div data-testid="custom-fallback">Loading...</div>}>
          <ThrowComponent />
        </SceneWithFallback>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      console.error = originalError;
    });

    it('renders default skeleton when no custom fallback', () => {
      const ThrowComponent = () => {
        throw new Error('Canvas error');
      };

      const originalError = console.error;
      console.error = vi.fn(); // Suppress expected error

      const { container } = render(
        <SceneWithFallback>
          <ThrowComponent />
        </SceneWithFallback>
      );

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
      console.error = originalError;
    });
  });
});
