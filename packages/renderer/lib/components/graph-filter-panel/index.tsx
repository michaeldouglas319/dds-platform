'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useGraphView, useGraphViewFilter } from '../../graph-utils/context';
import { applyGraphFilter } from '../../graph-utils/filtering';
import type { GraphFilter, GraphNode } from '../../graph-utils/types';
import styles from './graph-filter-panel.module.css';

/**
 * Props for FilterPanel component
 */
export interface FilterPanelProps {
  /** Array of all available nodes for filtering */
  nodes?: GraphNode[];
  /** Optional CSS class for container */
  className?: string;
  /** Show/hide the panel (default: true) */
  isOpen?: boolean;
}

/**
 * Available node types for filtering
 */
const NODE_TYPES = ['entry', 'signal', 'person', 'organization', 'concept', 'event'] as const;

/**
 * Available tags for filtering
 */
const AVAILABLE_TAGS = ['disease', 'lethal', 'disaster', 'famine'] as const;

/**
 * FilterPanel - Advanced filtering UI for knowledge graph
 *
 * Provides search input, type filters, tag filters, and live node count.
 * Uses debounced search and updates GraphView context on filter changes.
 * Shows live count of visible nodes based on current filters.
 *
 * @example
 * ```tsx
 * <FilterPanel
 *   nodes={allNodes}
 *   isOpen={showFilters}
 * />
 * ```
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  nodes = [],
  className = '',
  isOpen = true,
}) => {
  const { state, setFilter, clearFilter } = useGraphView();
  const filter = state.filter;

  // Debounced search state
  const [searchInput, setSearchInput] = useState(filter.searchQuery || '');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  /**
   * Handle search input change with debounce
   */
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);

      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set new timeout for debounced search (300ms)
      const timeout = setTimeout(() => {
        setFilter({ ...filter, searchQuery: value });
      }, 300);

      setSearchTimeout(timeout);
    },
    [filter, setFilter, searchTimeout]
  );

  /**
   * Toggle a node type filter
   */
  const handleTypeToggle = useCallback(
    (type: typeof NODE_TYPES[number]) => {
      const currentTypes = filter.nodeTypes || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];

      setFilter({ ...filter, nodeTypes: newTypes });
    },
    [filter, setFilter]
  );

  /**
   * Toggle a tag filter
   */
  const handleTagToggle = useCallback(
    (tag: typeof AVAILABLE_TAGS[number]) => {
      const currentTags = filter.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];

      setFilter({ ...filter, tags: newTags });
    },
    [filter, setFilter]
  );

  /**
   * Clear all filters
   */
  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    clearFilter();
  }, [clearFilter]);

  /**
   * Calculate visible node count based on current filters
   */
  const visibleNodeCount = useMemo(() => {
    if (nodes.length === 0) return 0;

    const filtered = applyGraphFilter(
      { nodes, edges: [] },
      filter
    );

    return filtered.nodes.length;
  }, [nodes, filter]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      (filter.searchQuery && filter.searchQuery.trim().length > 0) ||
      (filter.nodeTypes && filter.nodeTypes.length > 0) ||
      (filter.tags && filter.tags.length > 0) ||
      (filter.sources && filter.sources.length > 0)
    );
  }, [filter]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Filter Nodes</h3>
        {hasActiveFilters && (
          <button
            className={styles.clearButton}
            onClick={handleClearFilters}
            aria-label="Clear all filters"
            title="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className={styles.section}>
        <label htmlFor="graph-search" className={styles.sectionLabel}>
          Search
        </label>
        <div className={styles.searchContainer}>
          <input
            id="graph-search"
            type="text"
            placeholder="Search by name, description, or tags..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={styles.searchInput}
            aria-label="Search graph nodes"
          />
          {searchInput && (
            <button
              className={styles.clearSearchButton}
              onClick={() => handleSearchChange('')}
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Node Type Filter */}
      <div className={styles.section}>
        <label className={styles.sectionLabel}>Node Type</label>
        <div className={styles.checkboxGroup}>
          {NODE_TYPES.map((type) => (
            <label key={type} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filter.nodeTypes?.includes(type) ?? false}
                onChange={() => handleTypeToggle(type)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Tag Filter */}
      <div className={styles.section}>
        <label className={styles.sectionLabel}>Tags</label>
        <div className={styles.checkboxGroup}>
          {AVAILABLE_TAGS.map((tag) => (
            <label key={tag} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filter.tags?.includes(tag) ?? false}
                onChange={() => handleTagToggle(tag)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Node Count */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Visible Nodes:</span>
          <span className={styles.statValue}>
            {visibleNodeCount} / {nodes.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export type { GraphFilter };
