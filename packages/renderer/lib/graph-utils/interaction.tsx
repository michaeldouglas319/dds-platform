/**
 * Interaction & Tooltip Utilities
 *
 * Pure functions and components for handling hover, tooltip display,
 * and general UI interaction with graph nodes and edges.
 *
 * @module @dds/renderer/lib/graph-utils/interaction
 */

import type { ReactNode } from 'react';
import type { GraphNode, GraphEdge, GraphTooltip } from './types';

// ─── Tooltip Configuration & Helpers ──────────────────────────────

/**
 * Extract displayable content from a node for tooltip.
 */
export function getNodeTooltipContent(node: GraphNode): {
  label: string;
  description?: string;
  tags?: string[];
  source?: string;
  publishedAt?: string;
} {
  return {
    label: node.label,
    description: node.description,
    tags: node.tags,
    source: node.metadata?.source,
    publishedAt: node.metadata?.published_at,
  };
}

/**
 * Extract displayable content from an edge for tooltip.
 */
export function getEdgeTooltipContent(edge: GraphEdge): {
  type: string;
  label?: string;
  weight?: number;
} {
  return {
    type: edge.type,
    label: edge.label,
    weight: edge.weight,
  };
}

/**
 * Format tooltip content into a readable string.
 */
export function formatTooltipText(node: GraphNode): string {
  const lines: string[] = [node.label];

  if (node.description) {
    lines.push(node.description);
  }

  if (node.tags && node.tags.length > 0) {
    lines.push(`Tags: ${node.tags.join(', ')}`);
  }

  if (node.metadata?.source) {
    lines.push(`Source: ${node.metadata.source}`);
  }

  if (node.metadata?.published_at) {
    const date = new Date(node.metadata.published_at);
    lines.push(`Published: ${date.toLocaleDateString()}`);
  }

  return lines.join('\n');
}

/**
 * Calculate optimal tooltip position to avoid going off-screen.
 */
export function calculateTooltipPosition(
  targetX: number,
  targetY: number,
  tooltipWidth: number = 250,
  tooltipHeight: number = 100,
  viewportWidth: number = 800,
  viewportHeight: number = 600,
  offset: number = 10
): { x: number; y: number } {
  let x = targetX + offset;
  let y = targetY + offset;

  // Check if tooltip would go off right edge
  if (x + tooltipWidth > viewportWidth) {
    x = targetX - tooltipWidth - offset;
  }

  // Check if tooltip would go off bottom edge
  if (y + tooltipHeight > viewportHeight) {
    y = targetY - tooltipHeight - offset;
  }

  // Clamp to viewport bounds
  x = Math.max(0, Math.min(x, viewportWidth - tooltipWidth));
  y = Math.max(0, Math.min(y, viewportHeight - tooltipHeight));

  return { x, y };
}

/**
 * Determine if a point is within a certain distance of a node position.
 * Used for hit testing on hover.
 */
export function isPointNearNode(
  nodePosition: { x: number; y: number; z?: number } | undefined,
  pointX: number,
  pointY: number,
  radius: number = 20
): boolean {
  if (!nodePosition) return false;

  const dx = nodePosition.x - pointX;
  const dy = nodePosition.y - pointY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= radius;
}

// ─── Delay & Debouncing for Tooltips ──────────────────────────────

/**
 * Schedule tooltip to show after a delay.
 * Returns a cancel function to clear the timeout if needed.
 */
export function scheduleTooltipShow(
  callback: () => void,
  delayMs: number = 300
): () => void {
  const timeoutId = setTimeout(callback, delayMs);
  return () => clearTimeout(timeoutId);
}

/**
 * Debounce function for smooth tooltip hide delays.
 */
export function createTooltipDebounce(delayMs: number = 200) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    clear: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
    schedule: (callback: () => void) => {
      this.clear();
      timeoutId = setTimeout(callback, delayMs);
    },
  };
}

// ─── Hover State Management ───────────────────────────────────────

/**
 * Data structure for tracking hover state over multiple interactive elements.
 */
export interface HoverState {
  elementId?: string;
  elementType?: 'node' | 'edge';
  hoveredAt: number; // timestamp
}

/**
 * Check if hover has been held for minimum duration (for showing tooltips).
 */
export function hasHeldLongEnough(
  hoverState: HoverState | undefined,
  minimumMs: number = 300
): boolean {
  if (!hoverState) return false;
  return Date.now() - hoverState.hoveredAt >= minimumMs;
}

// ─── Tooltip Component ────────────────────────────────────────────

/**
 * Configuration for rendering a tooltip.
 */
export interface GraphTooltipComponentProps {
  /** Whether tooltip is visible */
  visible: boolean;
  /** X position in viewport (pixels) */
  x: number;
  /** Y position in viewport (pixels) */
  y: number;
  /** Tooltip content */
  title: string;
  description?: string;
  /** Optional additional content/tags */
  children?: ReactNode;
  /** CSS class for styling */
  className?: string;
  /** Tooltip offset from target (pixels) */
  offset?: number;
  /** Delay before fade-in (ms) */
  fadeInDelay?: number;
}

/**
 * Pure presentational GraphTooltip component.
 *
 * Displays a floating tooltip with node/edge information.
 * No state, no hooks — receives all props from parent.
 *
 * Usage:
 * ```tsx
 * <GraphTooltip
 *   visible={showTooltip}
 *   x={tooltipX}
 *   y={tooltipY}
 *   title="Node Label"
 *   description="Optional description"
 * />
 * ```
 */
export function GraphTooltip({
  visible,
  x,
  y,
  title,
  description,
  children,
  className = '',
  offset = 10,
  fadeInDelay = 0,
}: GraphTooltipComponentProps): JSX.Element | null {
  if (!visible) {
    return null;
  }

  return (
    <div
      className={`graph-tooltip ${className}`}
      style={{
        position: 'fixed',
        left: `${x + offset}px`,
        top: `${y + offset}px`,
        pointerEvents: 'none',
        zIndex: 1000,
        opacity: fadeInDelay > 0 ? 0 : 1,
        animation: fadeInDelay > 0 ? `fadeIn 0.3s ease-in forwards` : undefined,
        animationDelay: `${fadeInDelay}ms`,
        // Default styling (can be overridden via CSS)
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        lineHeight: '1.4',
        maxWidth: '250px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="graph-tooltip__title" style={{ fontWeight: 'bold' }}>
        {title}
      </div>
      {description && (
        <div className="graph-tooltip__description" style={{ marginTop: '4px' }}>
          {description}
        </div>
      )}
      {children && (
        <div className="graph-tooltip__content" style={{ marginTop: '8px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Keyboard Navigation Helpers ──────────────────────────────────

/**
 * Handle keyboard navigation within graph (arrow keys, Enter, etc).
 */
export function handleGraphKeyDown(
  event: KeyboardEvent,
  callbacks: {
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onEnter?: () => void;
    onEscape?: () => void;
  }
): void {
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      callbacks.onArrowUp?.();
      break;
    case 'ArrowDown':
      event.preventDefault();
      callbacks.onArrowDown?.();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      callbacks.onArrowLeft?.();
      break;
    case 'ArrowRight':
      event.preventDefault();
      callbacks.onArrowRight?.();
      break;
    case 'Enter':
      event.preventDefault();
      callbacks.onEnter?.();
      break;
    case 'Escape':
      event.preventDefault();
      callbacks.onEscape?.();
      break;
    default:
      break;
  }
}

// ─── Animation & Visual Feedback ──────────────────────────────────

/**
 * Generate CSS animation name for node highlight.
 */
export function getHighlightAnimationName(
  intensity: 'low' | 'medium' | 'high' = 'medium'
): string {
  const map = {
    low: 'pulse-low',
    medium: 'pulse-medium',
    high: 'pulse-high',
  };
  return map[intensity];
}

/**
 * Generate inline style for animating node selection.
 */
export function getSelectionAnimationStyle(
  isSelected: boolean,
  animationDuration: number = 300
): Record<string, string | number> {
  if (!isSelected) {
    return {};
  }

  return {
    animation: `nodeSelect ${animationDuration}ms ease-out`,
  };
}

// ─── Accessibility Helpers ───────────────────────────────────────

/**
 * Generate ARIA label for a node.
 */
export function getNodeAriaLabel(node: GraphNode): string {
  const parts = [node.label];

  if (node.type) {
    parts.push(`(${node.type})`);
  }

  if (node.tags && node.tags.length > 0) {
    parts.push(`tagged ${node.tags.join(', ')}`);
  }

  return parts.join(', ');
}

/**
 * Generate ARIA label for an edge.
 */
export function getEdgeAriaLabel(edge: GraphEdge, nodes: Map<string, GraphNode>): string {
  const source = nodes.get(edge.source);
  const target = nodes.get(edge.target);

  if (!source || !target) {
    return `${edge.type} connection`;
  }

  return `${source.label} ${edge.label || edge.type} ${target.label}`;
}
