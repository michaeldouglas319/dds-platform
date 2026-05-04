/**
 * Dashboard Layout Component
 *
 * Main container for dashboard layouts with grid support and responsive design.
 * Combines a main content area with optional sidebar for controls.
 *
 * @category dashboard
 * @layer 2
 * @example
 * ```tsx
 * <DashboardLayout
 *   title="Model Dashboard"
 *   mainContent={<ModelViewer />}
 *   sidebar={<ModelControls />}
 * />
 * ```
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  mainContent: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'narrow' | 'normal' | 'wide';
  className?: string;
}

const SidebarWidthMap = {
  narrow: 'w-80',
  normal: 'w-96',
  wide: 'w-[28rem]'
};

export function DashboardLayout({
  title,
  subtitle,
  mainContent,
  sidebar,
  footer,
  sidebarPosition = 'right',
  sidebarWidth = 'normal',
  className
}: DashboardLayoutProps) {
  const mainElement = (
    <div className="flex-1 overflow-hidden">
      {mainContent}
    </div>
  );

  const sidebarElement = sidebar && (
    <div className={cn(
      'bg-muted/50 border-l overflow-y-auto',
      SidebarWidthMap[sidebarWidth],
      'h-full'
    )}>
      {sidebar}
    </div>
  );

  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {sidebarPosition === 'left' && sidebarElement}
        {mainElement}
        {sidebarPosition === 'right' && sidebarElement}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t bg-card px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}
