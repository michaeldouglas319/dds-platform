'use client';

import React from 'react';
import styles from './graph-loading-spinner.module.css';

/**
 * Props for LoadingSpinner component
 */
export interface GraphLoadingSpinnerProps {
  /** Loading text to display */
  message?: string;
  /** Optional CSS class for container */
  className?: string;
  /** Size of spinner in pixels (default: 40) */
  size?: number;
}

/**
 * GraphLoadingSpinner - Animated loading indicator for graph views
 *
 * Displays a smooth rotating spinner with optional loading message.
 * Used as a Suspense fallback while graph views are lazy-loading.
 * Fully accessible with aria-live for screen readers.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<GraphLoadingSpinner message="Loading graph..." />}>
 *   <GlobeView nodes={nodes} edges={edges} />
 * </Suspense>
 * ```
 */
export const GraphLoadingSpinner: React.FC<GraphLoadingSpinnerProps> = ({
  message = 'Loading graph...',
  className = '',
  size = 40,
}) => {
  return (
    <div
      className={`${styles.container} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Spinner SVG */}
      <svg
        className={styles.spinner}
        width={size}
        height={size}
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          className={styles.spinnerCircle}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="2"
        />

        {/* Animated progress circle */}
        <circle
          className={styles.spinnerProgress}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="2"
          strokeDasharray="125.6 125.6"
          strokeDashoffset="0"
        />
      </svg>

      {/* Loading message */}
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};
