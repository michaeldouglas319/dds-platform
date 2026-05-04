/**
 * Error Boundary for Orbital System
 *
 * Catches React errors in the 3D scene and provides graceful error handling.
 * Prevents full page crashes when the Canvas or components fail.
 *
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class OrbitErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details to console
    console.error('🔴 OrbitScene Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // Store error info in state for debugging
    this.setState({ errorInfo });

    // TODO: Send error to monitoring service (Sentry, DataDog, etc.)
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-950">
          <div className="max-w-2xl mx-auto p-8 bg-slate-900/50 border-2 border-red-500/30 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-500">Scene Failed to Load</h2>
            </div>

            <p className="text-slate-300 mb-4">
              The 3D orbital scene encountered an error and could not render. This may be due to:
            </p>

            <ul className="list-disc list-inside space-y-2 text-sm text-slate-400 mb-6">
              <li>WebGL compatibility issues with your browser</li>
              <li>Invalid 3D model or geometry data</li>
              <li>GPU resource exhaustion</li>
              <li>Runtime errors in particle physics</li>
            </ul>

            {this.state.error && (
              <details className="mb-6 p-4 bg-slate-800/50 rounded border border-slate-700">
                <summary className="cursor-pointer text-sm font-semibold text-red-400 mb-2">
                  Error Details
                </summary>
                <div className="text-xs font-mono text-slate-300 space-y-2">
                  <div>
                    <strong className="text-red-400">Message:</strong>{' '}
                    {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong className="text-red-400">Stack:</strong>
                      <pre className="mt-1 p-2 bg-slate-900 rounded overflow-x-auto whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong className="text-red-400">Component Stack:</strong>
                      <pre className="mt-1 p-2 bg-slate-900 rounded overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors"
              >
                Reload Page
              </button>
            </div>

            <p className="text-slate-500 text-xs mt-6">
              If this error persists, please check the browser console for more details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
