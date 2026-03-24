'use client';

import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[SectionErrorBoundary] Caught rendering error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.9rem',
        }}>
          <p>A rendering error occurred in this section.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '0.75rem',
              padding: '0.4rem 1.2rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
