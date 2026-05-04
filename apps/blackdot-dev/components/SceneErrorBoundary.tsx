'use client'

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SceneErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Scene Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center w-full h-full bg-background">
            <div className="text-center p-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Scene Error
              </h2>
              <p className="text-sm text-muted-foreground">
                Failed to load 3D scene. Try refreshing the page.
              </p>
              {this.state.error && (
                <p className="text-xs text-muted-foreground/60 mt-2">
                  {this.state.error.message}
                </p>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
