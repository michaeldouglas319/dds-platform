'use client';

import React, { useMemo } from 'react';
import type { ReactNode } from 'react';
import styles from './graph-view-switcher.module.css';

/**
 * View type identifier
 */
export type ViewType = 'globe' | 'force-graph' | 'grid' | 'layered';

/**
 * View definition with display properties
 */
interface ViewOption {
  id: ViewType;
  label: string;
  icon: ReactNode;
  ariaLabel: string;
}

/**
 * Props for ViewSwitcher component
 */
export interface ViewSwitcherProps {
  /** Currently active view ID */
  activeView: ViewType;
  /** Callback when view is changed */
  onViewChange?: (view: ViewType) => void;
  /** Optional CSS class for container */
  className?: string;
}

/**
 * View options with icons and labels
 */
const VIEW_OPTIONS: ViewOption[] = [
  {
    id: 'globe',
    label: 'Globe',
    icon: '🌍',
    ariaLabel: 'Switch to globe view',
  },
  {
    id: 'force-graph',
    label: 'Network',
    icon: '🕸️',
    ariaLabel: 'Switch to force-directed network view',
  },
  {
    id: 'grid',
    label: 'Grid',
    icon: '⊞',
    ariaLabel: 'Switch to grid view',
  },
  {
    id: 'layered',
    label: 'Layers',
    icon: '⟿',
    ariaLabel: 'Switch to layered view',
  },
];

/**
 * ViewSwitcher - Segmented control for switching between graph view types
 *
 * Displays 4 view options (Globe, Network, Grid, Layers) as a segmented control.
 * Shows visual feedback for the active view and handles view changes.
 * Supports keyboard navigation and accessibility.
 *
 * @example
 * ```tsx
 * const [view, setView] = useState<ViewType>('grid');
 *
 * <ViewSwitcher
 *   activeView={view}
 *   onViewChange={setView}
 * />
 * ```
 */
export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  activeView,
  onViewChange,
  className = '',
}) => {
  // Memoize view options to prevent unnecessary re-renders
  const viewOptions = useMemo(() => VIEW_OPTIONS, []);

  /**
   * Handle button click to change view
   */
  const handleViewClick = (viewId: ViewType) => {
    if (viewId !== activeView && onViewChange) {
      onViewChange(viewId);
    }
  };

  /**
   * Handle keyboard navigation (arrow keys)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % viewOptions.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + viewOptions.length) % viewOptions.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = viewOptions.length - 1;
    }

    if (nextIndex !== index) {
      const nextView = viewOptions[nextIndex];
      handleViewClick(nextView.id);

      // Focus the new button
      const buttons = document.querySelectorAll(
        `.${styles.button}`
      ) as NodeListOf<HTMLButtonElement>;
      if (buttons[nextIndex]) {
        buttons[nextIndex].focus();
      }
    }
  };

  return (
    <div className={`${styles.container} ${className}`.trim()} role="group" aria-label="Graph view options">
      {viewOptions.map((option, index) => (
        <button
          key={option.id}
          className={`${styles.button} ${activeView === option.id ? styles.active : ''}`}
          onClick={() => handleViewClick(option.id)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          aria-label={option.ariaLabel}
          aria-pressed={activeView === option.id}
          title={option.label}
        >
          <span className={styles.icon}>{option.icon}</span>
          <span className={styles.label}>{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export type { ViewOption };
