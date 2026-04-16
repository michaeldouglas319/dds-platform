/**
 * Node & Edge Filtering Utilities
 *
 * Pure functions for filtering nodes and edges based on various criteria.
 * Supports multi-criteria filtering: types, tags, sources, dates, search queries.
 *
 * @module @dds/renderer/lib/graph-utils/filtering
 */

import type { GraphNode, GraphEdge, GraphFilter, FilteredGraphData, GraphData } from './types';

// ─── Filter Evaluation ────────────────────────────────────────────

/**
 * Determine if a node matches all active filters.
 * Uses AND logic for all filter criteria.
 */
export function nodeMatchesFilter(node: GraphNode, filter: GraphFilter): boolean {
  // Check node type filter
  if (filter.nodeTypes && filter.nodeTypes.length > 0) {
    if (!filter.nodeTypes.includes(node.type)) {
      return false;
    }
  }

  // Check tags filter (node must have at least one matching tag)
  if (filter.tags && filter.tags.length > 0) {
    const nodeTags = node.tags ?? [];
    const hasMatchingTag = filter.tags.some(tag => nodeTags.includes(tag));
    if (!hasMatchingTag) {
      return false;
    }
  }

  // Check sources filter
  if (filter.sources && filter.sources.length > 0) {
    const nodeSource = node.metadata?.source;
    if (!nodeSource || !filter.sources.includes(nodeSource)) {
      return false;
    }
  }

  // Check date range filter
  if (filter.dateRange) {
    const nodeDate = node.metadata?.published_at;
    if (nodeDate) {
      const nodeDateObj = new Date(nodeDate);
      const startDate = filter.dateRange.start ? new Date(filter.dateRange.start) : null;
      const endDate = filter.dateRange.end ? new Date(filter.dateRange.end) : null;

      if (startDate && nodeDateObj < startDate) {
        return false;
      }
      if (endDate && nodeDateObj > endDate) {
        return false;
      }
    }
  }

  // Check search query filter (case-insensitive substring search)
  if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
    const searchLower = filter.searchQuery.toLowerCase();
    const matchesLabel = node.label.toLowerCase().includes(searchLower);
    const matchesDescription = node.description
      ? node.description.toLowerCase().includes(searchLower)
      : false;
    const matchesTags = (node.tags ?? []).some(tag =>
      tag.toLowerCase().includes(searchLower)
    );

    if (!matchesLabel && !matchesDescription && !matchesTags) {
      return false;
    }
  }

  // Check custom predicate if provided
  if (filter.predicate && !filter.predicate(node)) {
    return false;
  }

  return true;
}

/**
 * Filter a list of nodes based on filter criteria.
 * Returns only nodes that match all active filters.
 */
export function filterNodes(nodes: GraphNode[], filter: GraphFilter): GraphNode[] {
  return nodes.filter(node => nodeMatchesFilter(node, filter));
}

/**
 * Filter edges based on visible nodes.
 * Returns only edges where both source and target nodes are in the visible set.
 */
export function filterEdges(
  edges: GraphEdge[],
  visibleNodeIds: Set<string> | string[]
): GraphEdge[] {
  const visibleSet = Array.isArray(visibleNodeIds)
    ? new Set(visibleNodeIds)
    : visibleNodeIds;

  return edges.filter(
    edge => visibleSet.has(edge.source) && visibleSet.has(edge.target)
  );
}

// ─── Complete Filtering Pipeline ──────────────────────────────────

/**
 * Apply filters to complete graph data, returning filtered nodes and edges.
 * This is the main entry point for filtering operations.
 */
export function applyGraphFilter(
  graphData: GraphData,
  filter: GraphFilter
): FilteredGraphData {
  const totalNodes = graphData.nodes.length;
  const totalEdges = graphData.edges.length;

  // Filter nodes based on all criteria
  const filteredNodes = filterNodes(graphData.nodes, filter);
  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));

  // Filter edges to only include those between visible nodes
  const filteredEdges = filterEdges(graphData.edges, visibleNodeIds);

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    totalNodes,
    totalEdges,
    resultCount: filteredNodes.length,
  };
}

// ─── Search-Specific Utilities ────────────────────────────────────

/**
 * Calculate search relevance score for a node given a query.
 * Used for ranking search results.
 *
 * Scoring logic:
 * - Label match: 10 points (highest priority)
 * - Tag match: 5 points
 * - Description match: 2 points
 * - Multiplier based on match position in string
 */
export function calculateSearchRelevance(
  node: GraphNode,
  query: string
): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Label match (highest priority)
  if (node.label.toLowerCase().includes(queryLower)) {
    score += 10;
    // Bonus for exact start match
    if (node.label.toLowerCase().startsWith(queryLower)) {
      score += 5;
    }
  }

  // Description match
  if (node.description) {
    const descLower = node.description.toLowerCase();
    if (descLower.includes(queryLower)) {
      score += 2;
      // Bonus for early position
      const position = descLower.indexOf(queryLower);
      if (position < 20) {
        score += 1;
      }
    }
  }

  // Tag matches
  if (node.tags) {
    for (const tag of node.tags) {
      if (tag.toLowerCase().includes(queryLower)) {
        score += 5;
      }
    }
  }

  return score;
}

/**
 * Search nodes by query, returning results sorted by relevance.
 */
export function searchNodes(
  nodes: GraphNode[],
  query: string,
  limit?: number
): GraphNode[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const scored = nodes.map(node => ({
    node,
    score: calculateSearchRelevance(node, query),
  }));

  // Filter out zero-score results and sort by score descending
  const results = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.node);

  if (limit && limit > 0) {
    return results.slice(0, limit);
  }

  return results;
}

// ─── Filter Builder (convenience for complex filters) ──────────────

/**
 * Build a filter object with convenient chaining.
 * Example: buildFilter().withTypes(['entry']).withTags(['disease']).build()
 */
export class FilterBuilder {
  private filter: GraphFilter = {};

  withTypes(...types: GraphNode['type'][]): FilterBuilder {
    this.filter.nodeTypes = types;
    return this;
  }

  withTags(...tags: string[]): FilterBuilder {
    this.filter.tags = tags;
    return this;
  }

  withSources(...sources: string[]): FilterBuilder {
    this.filter.sources = sources;
    return this;
  }

  withDateRange(start?: string, end?: string): FilterBuilder {
    this.filter.dateRange = { start, end };
    return this;
  }

  withSearchQuery(query: string): FilterBuilder {
    this.filter.searchQuery = query;
    return this;
  }

  withPredicate(predicate: (node: GraphNode) => boolean): FilterBuilder {
    this.filter.predicate = predicate;
    return this;
  }

  build(): GraphFilter {
    return this.filter;
  }
}

export function buildFilter(): FilterBuilder {
  return new FilterBuilder();
}

// ─── Validation & Helper Functions ────────────────────────────────

/**
 * Check if a filter is empty (no criteria set).
 */
export function isFilterEmpty(filter: GraphFilter): boolean {
  return (
    (!filter.nodeTypes || filter.nodeTypes.length === 0) &&
    (!filter.tags || filter.tags.length === 0) &&
    (!filter.sources || filter.sources.length === 0) &&
    !filter.dateRange &&
    !filter.searchQuery &&
    !filter.predicate
  );
}

/**
 * Merge multiple filters using AND logic.
 * All criteria from all filters must be satisfied.
 */
export function mergeFilters(...filters: GraphFilter[]): GraphFilter {
  const merged: GraphFilter = {};

  // Merge node types (union of all type arrays)
  const allTypes = new Set<GraphNode['type']>();
  for (const f of filters) {
    if (f.nodeTypes) {
      f.nodeTypes.forEach(t => allTypes.add(t));
    }
  }
  if (allTypes.size > 0) {
    merged.nodeTypes = Array.from(allTypes);
  }

  // Merge tags (union)
  const allTags = new Set<string>();
  for (const f of filters) {
    if (f.tags) {
      f.tags.forEach(t => allTags.add(t));
    }
  }
  if (allTags.size > 0) {
    merged.tags = Array.from(allTags);
  }

  // Merge sources (union)
  const allSources = new Set<string>();
  for (const f of filters) {
    if (f.sources) {
      f.sources.forEach(s => allSources.add(s));
    }
  }
  if (allSources.size > 0) {
    merged.sources = Array.from(allSources);
  }

  // Take the narrowest date range
  let minStart: Date | null = null;
  let maxEnd: Date | null = null;
  for (const f of filters) {
    if (f.dateRange) {
      if (f.dateRange.start) {
        const date = new Date(f.dateRange.start);
        if (!minStart || date > minStart) {
          minStart = date;
        }
      }
      if (f.dateRange.end) {
        const date = new Date(f.dateRange.end);
        if (!maxEnd || date < maxEnd) {
          maxEnd = date;
        }
      }
    }
  }
  if (minStart || maxEnd) {
    merged.dateRange = {
      start: minStart?.toISOString(),
      end: maxEnd?.toISOString(),
    };
  }

  // Use last search query
  const lastQuery = filters.reverse().find(f => f.searchQuery);
  if (lastQuery?.searchQuery) {
    merged.searchQuery = lastQuery.searchQuery;
  }

  // Combine predicates with AND logic
  const predicates = filters.map(f => f.predicate).filter(Boolean);
  if (predicates.length > 0) {
    merged.predicate = (node: GraphNode) =>
      predicates.every(pred => pred?.(node) ?? true);
  }

  return merged;
}
