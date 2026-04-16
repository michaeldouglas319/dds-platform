'use client';

import React, { useCallback } from 'react';
import type { GraphNode } from '../../graph-utils/types';
import type { EntryGridViewConfig } from './index';
import styles from './entry-grid-view.module.css';

/**
 * Props for GridCard component
 */
interface GridCardProps {
  /** The graph node to display */
  node: GraphNode;
  /** Whether this card is currently selected */
  isSelected: boolean;
  /** Whether this card is currently hovered */
  isHovered: boolean;
  /** Number of edges connected to this node */
  edgeCount: number;
  /** Callback when card is clicked */
  onSelect: () => void;
  /** Callback when card is hovered */
  onHover: () => void;
  /** Callback when hover ends */
  onHoverEnd: () => void;
  /** Configuration options */
  config: Required<EntryGridViewConfig>;
}

/**
 * GridCard - Individual card component for graph node display
 *
 * Shows:
 * - Node label as title
 * - Node description (truncated)
 * - Node tags as badges
 * - Node image (if available)
 * - Color indicator based on node type
 * - Edge count badge
 *
 * Supports keyboard navigation and accessibility features.
 */
const GridCard: React.FC<GridCardProps> = ({
  node,
  isSelected,
  isHovered,
  edgeCount,
  onSelect,
  onHover,
  onHoverEnd,
  config,
}) => {
  // Get type color mapping
  const getTypeColor = useCallback((): string => {
    const typeColorMap: Record<GraphNode['type'], string> = {
      entry: '#3b82f6',      // blue
      signal: '#ef4444',      // red
      person: '#8b5cf6',      // purple
      organization: '#06b6d4', // cyan
      concept: '#14b8a6',     // teal
      event: '#f59e0b',       // amber
    };
    return node.metadata?.color ?? typeColorMap[node.type] ?? '#6b7280';
  }, [node]);

  // Truncate description to specified number of lines
  const truncateDescription = (text: string, lines: number): string => {
    const lineArray = text.split('\n').slice(0, lines).join('\n');
    if (text.split('\n').length > lines) {
      return lineArray + '...';
    }
    return lineArray;
  };

  const displayDescription = node.description
    ? truncateDescription(node.description, config.descriptionLines)
    : '';

  // Get ARIA label
  const ariaLabel = `${node.label}${node.description ? ': ' + node.description.substring(0, 50) : ''}${
    edgeCount > 0 ? `, ${edgeCount} connections` : ''
  }`;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <article
      className={`${styles.card} ${isSelected ? styles.cardSelected : ''} ${isHovered ? styles.cardHovered : ''}`}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={ariaLabel}
    >
      {/* Type color indicator */}
      {config.showTypeIndicator && (
        <div
          className={styles.typeIndicator}
          style={{ backgroundColor: getTypeColor() } as React.CSSProperties}
          aria-hidden="true"
        />
      )}

      {/* Background image (if available) */}
      {node.metadata && typeof node.metadata.imageUrl === 'string' && node.metadata.imageUrl && (
        <div
          className={styles.backgroundImage}
          style={{
            backgroundImage: `url(${node.metadata.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } as React.CSSProperties}
          aria-hidden="true"
        />
      )}

      {/* Content wrapper */}
      <div className={styles.cardContent}>
        {/* Title */}
        <h3 className={styles.cardTitle}>{node.label}</h3>

        {/* Description */}
        {displayDescription && (
          <p className={styles.cardDescription}>{displayDescription}</p>
        )}

        {/* Tags */}
        {node.tags && node.tags.length > 0 && (
          <div className={styles.tagsBadges}>
            {node.tags.slice(0, 3).map((tag, idx) => (
              <span key={`${node.id}-tag-${idx}`} className={styles.tagBadge}>
                {tag}
              </span>
            ))}
            {node.tags.length > 3 && (
              <span className={styles.tagBadge} title={`+${node.tags.length - 3} more`}>
                +{node.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: edge count + read link */}
        <div className={styles.cardFooter}>
          {config.showEdgeCount && edgeCount > 0 && (
            <span className={styles.edgeCountBadge} title={`${edgeCount} connected nodes`}>
              {edgeCount} connection{edgeCount !== 1 ? 's' : ''}
            </span>
          )}

          {/* Read link if URL exists */}
          {node.metadata && typeof node.metadata.url === 'string' && node.metadata.url && (
            <a
              href={node.metadata.url}
              className={styles.readLink}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read more about ${node.label}`}
            >
              Read
            </a>
          )}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && <div className={styles.selectionIndicator} aria-hidden="true" />}
    </article>
  );
};

export default GridCard;
