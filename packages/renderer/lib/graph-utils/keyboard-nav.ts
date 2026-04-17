/**
 * Keyboard Navigation Utilities
 *
 * Utilities for implementing accessible keyboard navigation patterns in graphs.
 * Supports arrow keys, Home/End, Enter/Space, and Escape.
 *
 * @module @dds/renderer/lib/graph-utils/keyboard-nav
 */

import type { GraphNode } from './types';

/**
 * Handle keyboard navigation in a list of items
 * Supports:
 * - ArrowUp/ArrowLeft: previous item
 * - ArrowDown/ArrowRight: next item
 * - Home: first item
 * - End: last item
 * - Enter/Space: select item
 * - Escape: deselect
 */
export function handleKeyboardNavigation(
  e: KeyboardEvent | React.KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  onNavigate: (index: number) => void,
  onSelect: () => void,
  onDeselect: () => void
): boolean {
  let handled = false;
  let nextIndex = currentIndex;

  switch (e.key) {
    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault();
      nextIndex = (currentIndex - 1 + itemCount) % itemCount;
      handled = true;
      break;

    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault();
      nextIndex = (currentIndex + 1) % itemCount;
      handled = true;
      break;

    case 'Home':
      e.preventDefault();
      nextIndex = 0;
      handled = true;
      break;

    case 'End':
      e.preventDefault();
      nextIndex = itemCount - 1;
      handled = true;
      break;

    case 'Enter':
    case ' ':
      e.preventDefault();
      onSelect();
      handled = true;
      break;

    case 'Escape':
      e.preventDefault();
      onDeselect();
      handled = true;
      break;
  }

  if (handled && nextIndex !== currentIndex) {
    onNavigate(nextIndex);
  }

  return handled;
}

/**
 * Get grid position (row, col) from flat index
 * Useful for grid-based keyboard navigation
 */
export function getGridPosition(index: number, columns: number): { row: number; col: number } {
  return {
    row: Math.floor(index / columns),
    col: index % columns,
  };
}

/**
 * Get flat index from grid position
 */
export function getIndexFromGridPosition(row: number, col: number, columns: number): number {
  return row * columns + col;
}

/**
 * Handle grid keyboard navigation (arrow keys navigate in 2D)
 */
export function handleGridKeyboardNavigation(
  e: KeyboardEvent | React.KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  columns: number,
  onNavigate: (index: number) => void,
  onSelect: () => void,
  onDeselect: () => void
): boolean {
  let handled = false;
  let nextIndex = currentIndex;

  const { row, col } = getGridPosition(currentIndex, columns);
  const maxRows = Math.ceil(itemCount / columns);

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      if (row > 0) {
        nextIndex = getIndexFromGridPosition(row - 1, col, columns);
        if (nextIndex < itemCount) {
          handled = true;
        }
      }
      break;

    case 'ArrowDown':
      e.preventDefault();
      if (row < maxRows - 1) {
        nextIndex = getIndexFromGridPosition(row + 1, col, columns);
        if (nextIndex < itemCount) {
          handled = true;
        }
      }
      break;

    case 'ArrowLeft':
      e.preventDefault();
      if (col > 0) {
        nextIndex = getIndexFromGridPosition(row, col - 1, columns);
        handled = true;
      }
      break;

    case 'ArrowRight':
      e.preventDefault();
      if (col < columns - 1 && currentIndex + 1 < itemCount) {
        nextIndex = getIndexFromGridPosition(row, col + 1, columns);
        handled = true;
      }
      break;

    case 'Home':
      e.preventDefault();
      nextIndex = 0;
      handled = true;
      break;

    case 'End':
      e.preventDefault();
      nextIndex = itemCount - 1;
      handled = true;
      break;

    case 'Enter':
    case ' ':
      e.preventDefault();
      onSelect();
      handled = true;
      break;

    case 'Escape':
      e.preventDefault();
      onDeselect();
      handled = true;
      break;
  }

  if (handled && nextIndex !== currentIndex) {
    onNavigate(nextIndex);
  }

  return handled;
}

/**
 * Generate ARIA label for a node
 */
export function generateAriaLabel(
  node: GraphNode,
  connectionCount?: number,
  isSelected?: boolean
): string {
  const parts: string[] = [node.label];

  if (node.description) {
    parts.push(node.description.substring(0, 50));
  }

  if (connectionCount && connectionCount > 0) {
    parts.push(`${connectionCount} connection${connectionCount !== 1 ? 's' : ''}`);
  }

  if (isSelected) {
    parts.push('selected');
  }

  if (node.tags && node.tags.length > 0) {
    parts.push(`tags: ${node.tags.join(', ')}`);
  }

  return parts.join('. ');
}
