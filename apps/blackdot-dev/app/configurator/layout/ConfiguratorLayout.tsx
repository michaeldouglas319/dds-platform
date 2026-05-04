'use client';

import { useEffect, useState, ReactNode } from 'react';
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';
import { useMobileDetection } from '@/hooks';

interface ConfiguratorLayoutProps {
  viewport: ReactNode;
  controls: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  defaultViewportSize?: number;
  minViewportSize?: number;
  minControlSize?: number;
  enableResize?: boolean;
  mobileLayout?: 'stacked' | 'tabs';
  onViewportSizeChange?: (size: number) => void;
}

const STORAGE_KEY = 'configurator-layout-sizes';

/**
 * Main configurator layout component
 * Provides resizable viewport + control panel split with responsive behavior
 *
 * @category layout
 * @layer 3
 */
export function ConfiguratorLayout({
  viewport,
  controls,
  header,
  footer,
  defaultViewportSize = 70,
  minViewportSize = 50,
  minControlSize = 25,
  enableResize = true,
  mobileLayout = 'stacked',
  onViewportSizeChange,
}: ConfiguratorLayoutProps) {
  const isMobile = useMobileDetection(1024);
  const [viewportSize, setViewportSize] = useState(defaultViewportSize);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved sizes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const sizes = JSON.parse(saved);
        setViewportSize(sizes.viewport);
      } catch (e) {
        console.error('Failed to load layout sizes:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save sizes to localStorage
  const handleResize = (sizes: number[]) => {
    const newViewportSize = sizes[0];
    setViewportSize(newViewportSize);
    onViewportSizeChange?.(newViewportSize);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ viewport: newViewportSize })
    );
  };

  if (!isHydrated) {
    return null;
  }

  // Mobile stacked layout
  if (isMobile && mobileLayout === 'stacked') {
    return (
      <div className="w-full h-screen flex flex-col bg-background">
        {header && (
          <div className="border-b border-border shrink-0">
            {header}
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Viewport - top (60% on mobile) */}
          <div className="flex-[0.6] overflow-hidden border-b border-border">
            {viewport}
          </div>

          {/* Control panel - bottom (40% on mobile) */}
          <div className="flex-[0.4] overflow-hidden">
            {controls}
          </div>
        </div>

        {footer && (
          <div className="border-t border-border shrink-0">
            {footer}
          </div>
        )}
      </div>
    );
  }

  // Desktop side-by-side layout with resizable panels
  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {header && (
        <div className="border-b border-border shrink-0">
          {header}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <PanelGroup
          direction="horizontal"
          onLayout={handleResize}
          autoSaveId={enableResize ? 'configurator-layout' : undefined}
        >
          {/* Viewport panel */}
          <Panel
            defaultSize={viewportSize}
            minSize={minViewportSize}
            maxSize={100 - minControlSize}
          >
            <div className="w-full h-full overflow-hidden">
              {viewport}
            </div>
          </Panel>

          {/* Resize handle */}
          {enableResize && (
            <PanelResizeHandle className="w-1 bg-border hover:bg-blue-500/50 transition-colors duration-200 group relative">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-blue-500" />
              </div>
            </PanelResizeHandle>
          )}

          {/* Control panel */}
          <Panel
            defaultSize={100 - viewportSize}
            minSize={minControlSize}
            maxSize={100 - minViewportSize}
          >
            <div className="w-full h-full overflow-hidden flex flex-col">
              {controls}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {footer && (
        <div className="border-t border-border shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}
