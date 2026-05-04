/**
 * Vertical Graph Types - Neural Network & Venn Diagram Visualization
 *
 * Represents business verticals as a connected graph where:
 * - Nodes: Verticals, Umbrellas, Skills, Roles, Certifications
 * - Edges: Dependencies, requirements, skill overlaps
 *
 * Enables visualization as:
 * - Neural network (force-directed graph)
 * - Venn diagram (skill overlaps)
 * - Dependency graph (DAG)
 * - Skill coverage heatmap
 */

export type NodeType =
  | 'vertical'
  | 'umbrella'
  | 'skill'
  | 'role'
  | 'certification'
  | 'license'
  | 'phase';

export type EdgeType =
  | 'requires' // Umbrella requires skill
  | 'includes' // Vertical includes umbrella
  | 'depends_on' // Skill depends on another skill
  | 'enables' // Skill enables role
  | 'certifies' // Certification validates skill
  | 'licenses' // License required for role
  | 'shared' // Skill shared across umbrellas
  | 'alternative'; // Alternative to another skill

export type NodeCategory =
  | 'founder-fillable'
  | 'must-hire'
  | 'co-founder-ideal'
  | 'support'
  | 'optional';

export type SkillCriticality = 'critical' | 'important' | 'support';

/**
 * Graph Node - Represents a concept in the vertical landscape
 */
export interface GraphNode {
  id: string; // Unique identifier
  label: string; // Display name
  type: NodeType;
  category?: NodeCategory;
  criticality?: SkillCriticality;

  // Visual properties
  color?: string; // For visualization
  icon?: string; // Icon name
  size?: number; // Node size (based on importance)

  // Metadata
  description?: string;
  founderFillable?: boolean;
  governmentCredentialRequired?: boolean;
  cost?: { min: number; max: number }; // In thousands

  // Relationships
  parentId?: string; // Parent node (e.g., umbrella -> vertical)
  relatedVerticals?: string[]; // Which verticals need this
  relatedUmbrellas?: string[]; // Which umbrellas need this
  relatedSkills?: string[]; // Which skills related to this
}

/**
 * Graph Edge - Represents relationships between nodes
 */
export interface GraphEdge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  type: EdgeType;
  strength?: number; // 0-1, relationship strength
  description?: string;
  bidirectional?: boolean;

  // Visual properties
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
}

/**
 * Complete graph representation
 */
export interface VerticalGraph {
  id: string;
  name: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    verticalCount: number;
    umbrellaCount: number;
    skillCount: number;
    totalNodes: number;
    totalEdges: number;
    avgConnectivity: number; // Average edges per node
    lastUpdated: string; // ISO date
  };
}

/**
 * Skill Overlap - For Venn diagram visualization
 */
export interface SkillOverlap {
  verticals: string[]; // Which verticals share this skill
  umbrellas: string[]; // Which umbrellas
  skill: {
    id: string;
    name: string;
    criticality: SkillCriticality;
  };
  count: number; // How many entities share this skill
  pervasiveness: 'core' | 'common' | 'specialized'; // How widespread
}

/**
 * Vertical Comparison Graph - Multi-vertical view
 */
export interface MultiVerticalGraph {
  verticals: VerticalGraph[];
  sharedSkills: SkillOverlap[];
  skillOccurrences: Map<string, number>; // Skill ID -> count of appearances
  umbrellaOccurrences: Map<string, number>; // Umbrella type -> count
  crossVerticalEdges: GraphEdge[]; // Edges connecting skills across verticals
}

/**
 * Graph Statistics for Analysis
 */
export interface GraphStatistics {
  nodeCount: number;
  edgeCount: number;
  density: number; // Edges / possible connections
  clustering: number; // Tendency to form clusters (0-1)
  avgShortestPath: number; // Average distance between nodes
  mostConnectedNodes: Array<{
    nodeId: string;
    label: string;
    degree: number;
  }>;
  skillHubs: Array<{
    skillId: string;
    skillName: string;
    appearsInUmbrellas: number;
    appearsInVerticals: number;
  }>;
  founderFillablePercentage: number;
  mustHirePercentage: number;
}

/**
 * Path through graph - For showing skill dependencies
 */
export interface GraphPath {
  startNode: GraphNode;
  endNode: GraphNode;
  path: GraphNode[]; // Sequence of nodes
  edges: GraphEdge[]; // Connecting edges
  distance: number;
  description?: string;
}

/**
 * Filter for graph queries
 */
export interface GraphFilter {
  nodeTypes?: NodeType[];
  categories?: NodeCategory[];
  criticalities?: SkillCriticality[];
  verticalIds?: string[];
  umbrellaIds?: string[];
  includeFounderFillable?: boolean;
  excludeMustHire?: boolean;
  maxDepth?: number; // Max depth from root node
}

/**
 * Visualization Configuration
 */
export interface GraphVisualizationConfig {
  type: 'force-directed' | 'hierarchical' | 'radial' | 'venn';
  width: number;
  height: number;
  nodeSize: 'uniform' | 'weighted' | 'by-connections';
  edgeStyle: 'straight' | 'curved' | 'bezier';
  showLabels: boolean;
  colorScheme: 'vertical' | 'category' | 'criticality' | 'founder-fit';
  interactive: boolean;
  physics?: {
    gravity: number;
    repulsion: number;
    attraction: number;
    friction: number;
  };
}

/**
 * Graph Query Results
 */
export interface GraphQueryResult {
  query: string;
  results: GraphNode[];
  relatedEdges: GraphEdge[];
  statistics: {
    nodeCount: number;
    edgeCount: number;
    avgConnectivity: number;
  };
}

/**
 * Skill Network Cluster - Group of highly connected skills
 */
export interface SkillCluster {
  id: string;
  name: string;
  skills: GraphNode[];
  umbrellas: string[];
  verticals: string[];
  cohesion: number; // 0-1, how tightly clustered
  description?: string;
}
