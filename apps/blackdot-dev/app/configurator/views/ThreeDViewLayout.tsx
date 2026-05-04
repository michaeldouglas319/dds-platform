'use client';

import React from 'react';
import { ConfiguratorLayout } from '../layout/ConfiguratorLayout';
import { ViewportPanel } from '../layout/ViewportPanel';
import { ControlPanel } from '../layout/ControlPanel';

/**
 * Props for the ThreeDViewLayout component
 *
 * This is a generic, reusable layout for 3D visualization with side controls.
 * Abstracts the common pattern of viewport (left) + controls (right).
 *
 * @example
 * ```tsx
 * <ThreeDViewLayout
 *   viewport={<YourScene />}
 *   controls={<YourControls />}
 *   header={<Header />}
 *   title="Product Configurator"
 *   subtitle="Phase 2"
 * />
 * ```
 */
export interface ThreeDViewLayoutProps {
  // Content
  /**
   * The 3D viewport/scene component
   * Will be wrapped in ViewportPanel with error boundaries
   */
  viewport: React.ReactNode;

  /**
   * The control panel UI component
   * Will be wrapped in ControlPanel with optional title/subtitle
   */
  controls: React.ReactNode;

  /**
   * Title for the control panel
   * If provided, controls will be wrapped in ControlPanel
   * @default "Controls"
   */
  controlsTitle?: string;

  /**
   * Subtitle for the control panel
   */
  controlsSubtitle?: string;

  // Layout Configuration
  /**
   * Initial viewport width as percentage (0-100)
   * @default 70
   */
  defaultViewportSize?: number;

  /**
   * Minimum viewport size in percentage
   * @default 50
   */
  minViewportSize?: number;

  /**
   * Maximum viewport size in percentage
   * @default 90
   */
  maxViewportSize?: number;

  /**
   * Enable resizable divider between viewport and controls
   * @default true
   */
  enableResize?: boolean;

  /**
   * Callback when viewport size changes (triggered by user resizing)
   */
  onViewportSizeChange?: (size: number) => void;

  // Header & Footer
  /**
   * Custom header component or JSX
   * If not provided, no header is rendered
   */
  header?: React.ReactNode;

  /**
   * Custom footer component or JSX
   * If not provided, no footer is rendered
   */
  footer?: React.ReactNode;

  // Header Content (convenience props if header is a string)
  /**
   * Main title for the page
   * Used to build a default header if custom header not provided
   */
  title?: string;

  /**
   * Subtitle for the page
   * Used to build a default header if custom header not provided
   */
  subtitle?: string;

  // Styling
  /**
   * Custom className for the root wrapper
   */
  className?: string;

  /**
   * Custom className for the header
   */
  headerClassName?: string;

  /**
   * Custom className for the footer
   */
  footerClassName?: string;
}

/**
 * Generic 3D Viewport + Controls Layout
 *
 * A reusable, modular layout component for applications that need:
 * - A 3D scene/viewport on the left (resizable)
 * - Control UI on the right (scrollable)
 * - Optional header and footer
 *
 * This component is designed to be used across different parts of the application
 * while maintaining a consistent layout pattern.
 *
 * Features:
 * - ✅ Resizable viewport/controls split
 * - ✅ Error boundaries on viewport
 * - ✅ Scrollable control panel
 * - ✅ Optional header and footer
 * - ✅ Fully customizable
 * - ✅ Type-safe with TypeScript
 * - ✅ Works with any 3D library (Three.js, Babylon.js, etc.)
 *
 * @example
 * ```tsx
 * function ProductConfigurator() {
 *   const state = useConfiguratorState();
 *   const selectedProduct = getProductById(state.selectedProductId);
 *
 *   return (
 *     <ThreeDViewLayout
 *       // Content
 *       viewport={
 *         <ConfiguratorScene>
 *           <ProductModel product={selectedProduct} />
 *         </ConfiguratorScene>
 *       }
 *       controls={
 *         <>
 *           <ProductSelector products={products} />
 *           <MaterialEditor />
 *         </>
 *       }
 *       // Configuration
 *       defaultViewportSize={70}
 *       enableResize={true}
 *       onViewportSizeChange={state.setPanelSize}
 *       // Header & Footer
 *       title="Product Configurator"
 *       subtitle="Phase 2: Customization"
 *       footer={<CustomFooter />}
 *     />
 *   );
 * }
 * ```
 */
export function ThreeDViewLayout({
  viewport,
  controls,
  controlsTitle = 'Controls',
  controlsSubtitle,
  defaultViewportSize = 70,
  minViewportSize = 50,
  maxViewportSize = 90,
  enableResize = true,
  onViewportSizeChange,
  header,
  footer,
  title,
  subtitle,
  className,
  headerClassName,
  footerClassName,
}: ThreeDViewLayoutProps) {
  // Build default header if title/subtitle provided but no custom header
  const headerContent =
    header ??
    (title && (
      <div className={`px-6 py-4 bg-gradient-to-r from-primary via-blue-600 to-blue-500 dark:from-ring dark:via-blue-500 dark:to-cyan-400 ${headerClassName ?? ''}`}>
        <h1 className="text-2xl font-bold text-primary-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-primary-foreground/80 mt-1">{subtitle}</p>
        )}
      </div>
    ));

  // Wrap controls in ControlPanel if title is provided
  const controlsContent = controlsTitle ? (
    <ControlPanel title={controlsTitle} subtitle={controlsSubtitle}>
      {controls}
    </ControlPanel>
  ) : (
    controls
  );

  return (
    <ConfiguratorLayout
      viewport={<ViewportPanel>{viewport}</ViewportPanel>}
      controls={controlsContent}
      header={headerContent}
      footer={footer}
      defaultViewportSize={defaultViewportSize}
      minViewportSize={minViewportSize}
      enableResize={enableResize}
      onViewportSizeChange={onViewportSizeChange}
    />
  );
}

