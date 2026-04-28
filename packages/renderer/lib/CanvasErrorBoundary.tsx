'use client';

import React from 'react';
import { Skeleton } from '@dds/ui';

interface CanvasErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  height?: string | number;
}

/**
 * CanvasErrorBoundary - Error boundary for Canvas/WebGL components.
 * Shows a skeleton loader when Canvas fails to initialize.
 * @param children - Canvas or 3D content
 * @param fallback - Custom fallback UI (defaults to Skeleton)
 * @param height - Canvas container height
 */
export class CanvasErrorBoundary extends React.Component<
  CanvasErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: CanvasErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Canvas error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div
          style={{
            height: this.props.height ?? '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Skeleton className="h-full w-full" />
        </div>
      );
    }

    return this.props.children;
  }
}
