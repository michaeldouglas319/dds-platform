'use client';

import React, { Suspense, useReducer } from 'react';
import type { RendererProps, UniversalSection } from '@dds/types';
import { GraphViewContext } from '../lib/graph-utils/context';
import { createGraphViewContextValue } from '../lib/graph-utils/context';
import { graphViewReducer, createInitialGraphViewState } from '../lib/graph-utils/reducer';
import type { GraphNode, GraphEdge, GraphViewState } from '../lib/graph-utils/types';
import { EntryGridView } from '../lib/graph-views/entry-grid-view/index';
import { ForceDirectedGraphView } from '../lib/graph-views/force-graph-view/index';
import { GlobeView } from '../lib/graph-views/globe-view/index';
import styles from './knowledge-graph-section.module.css';

/**
 * UnifiedGraphSection extends UniversalSection with graph-specific data
 * content.nodes: GraphNode[] - array of graph nodes
 * content.edges: GraphEdge[] - array of graph edges
 * display.graphView?: 'globe' | 'force-graph' | 'grid' | 'layered' - default view to show
 */
interface UnifiedGraphSection extends UniversalSection {
  content?: {
    nodes?: GraphNode[];
    edges?: GraphEdge[];
    [key: string]: unknown;
  };
  display?: {
    graphView?: 'globe' | 'force-graph' | 'grid' | 'layered';
    [key: string]: unknown;
  };
}

interface KnowledgeGraphSectionProps extends RendererProps {
  section: UnifiedGraphSection;
}

/**
 * View Switcher Component - UI controls for switching between graph views
 */
function ViewSwitcher({
  currentView,
  onViewChange,
}: {
  currentView: string;
  onViewChange: (view: string) => void;
}) {
  const views = [
    { id: 'grid', label: 'Grid', icon: '⊞' },
    { id: 'globe', label: 'Globe', icon: '🌍' },
    { id: 'force-graph', label: 'Force Graph', icon: '⊗' },
    { id: 'layered', label: 'Layered', icon: '≡' },
  ];

  return (
    <div className={styles.viewSwitcher}>
      <div className={styles.viewSwitcherLabel}>View:</div>
      <div className={styles.viewSwitcherButtons}>
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`${styles.viewButton} ${
              currentView === view.id ? styles.viewButtonActive : ''
            }`}
            aria-pressed={currentView === view.id}
            title={view.label}
          >
            <span className={styles.viewButtonIcon}>{view.icon}</span>
            <span className={styles.viewButtonLabel}>{view.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Loading Spinner Component
 */
function LoadingSpinner() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} aria-busy="true" role="status">
        <span className={styles.spinnerDot} />
        <span className={styles.spinnerDot} />
        <span className={styles.spinnerDot} />
      </div>
      <p>Loading graph view...</p>
    </div>
  );
}

/**
 * KnowledgeGraphSection - Main renderer component
 *
 * Manages knowledge graph state and view switching.
 * Initializes context with nodes/edges from section.content.
 * Renders the active graph view based on display.graphView or user selection.
 */
export function KnowledgeGraphSection({ section }: KnowledgeGraphSectionProps) {
  const nodes = (section.content?.nodes ?? []) as GraphNode[];
  const edges = (section.content?.edges ?? []) as GraphEdge[];
  const defaultView = section.display?.graphView ?? 'grid';
  const title = section.subject?.title;
  const subtitle = section.subject?.subtitle;

  // Initialize graph view state with nodes and edges
  const [state, dispatch] = useReducer(
    graphViewReducer,
    {
      nodes,
      edges,
    },
    (initialState) => {
      const initial = createInitialGraphViewState();
      return {
        ...initial,
        nodes: initialState.nodes,
        edges: initialState.edges,
      };
    }
  );

  // Create context value with state and dispatch
  const contextValue = createGraphViewContextValue(state, dispatch);

  // Track current view - start with default from section or 'grid'
  const [currentView, setCurrentView] = React.useState(defaultView);

  if (nodes.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <div className={styles.emptyState}>
            <p>No graph data available.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <GraphViewContext.Provider value={contextValue}>
      <section className={styles.section}>
        <div className={styles.container}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

          <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />

          <div className={styles.viewContainer}>
            <Suspense fallback={<LoadingSpinner />}>
              {currentView === 'grid' && (
                <EntryGridView nodes={nodes} edges={edges} />
              )}
              {currentView === 'globe' && (
                <GlobeView nodes={nodes} edges={edges} />
              )}
              {currentView === 'force-graph' && (
                <ForceDirectedGraphView nodes={nodes} edges={edges} />
              )}
              {currentView === 'layered' && (
                <div className={styles.placeholder}>
                  Layered Universe View coming soon...
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </section>
    </GraphViewContext.Provider>
  );
}

/**
 * Metadata registration for the renderer
 * Describes the data structure and capabilities
 */
export const metadata = {
  name: 'knowledge-graph',
  displayName: 'Interactive Knowledge Graph',
  description:
    'Multi-view graph visualization with globe, force-directed, grid, and layered layouts. Supports node selection, filtering, and interactive exploration.',
  required: {
    content: ['nodes', 'edges'] as const,
  },
  optional: {
    subject: ['title', 'subtitle'] as const,
    display: ['graphView'] as const,
  },
  layouts: ['knowledge-graph'],
  composable: true,
  themeAware: false,
};
