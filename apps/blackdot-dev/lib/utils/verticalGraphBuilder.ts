/**
 * Vertical Graph Builder - Convert configs to graph structure
 *
 * Transforms BusinessVerticalConfig objects into graph representations
 * for visualization as neural networks, Venn diagrams, and dependency graphs
 */

import { BusinessVerticalConfig } from '@/lib/types/businessVertical.types';
import {
  VerticalGraph,
  GraphNode,
  GraphEdge,
  MultiVerticalGraph,
  GraphStatistics,
  SkillOverlap,
  SkillCluster,
  GraphFilter
} from '@/lib/types/verticalGraph.types';

/**
 * Build graph from single vertical
 */
export function buildVerticalGraph(vertical: BusinessVerticalConfig): VerticalGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let edgeId = 0;

  // 1. Add vertical node
  const verticalNode: GraphNode = {
    id: `vertical-${vertical.id}`,
    label: vertical.name,
    type: 'vertical',
    description: vertical.description,
    color: '#2563eb', // Blue for verticals
    size: 40
  };
  nodes.push(verticalNode);

  // 2. Add umbrella nodes and connect to vertical
  const umbrellaNodeMap = new Map<string, GraphNode>();

  for (const umbrella of vertical.expertiseUmbrellas || []) {
    const umbrellaData = umbrella as any;
    const umbrellaNode: GraphNode = {
      id: `umbrella-${umbrellaData.id}`,
      label: umbrellaData.name,
      type: 'umbrella',
      description: umbrellaData.covers,
      parentId: `vertical-${vertical.id}`,
      color: '#7c3aed', // Purple
      size: 30,
      cost: umbrellaData.budgetRange
    };
    nodes.push(umbrellaNode);
    umbrellaNodeMap.set(umbrellaData.id, umbrellaNode);

    // Edge: Vertical includes Umbrella
    edges.push({
      id: `edge-${edgeId++}`,
      source: `vertical-${vertical.id}`,
      target: `umbrella-${umbrellaData.id}`,
      type: 'includes',
      strength: 1,
      color: '#9333ea'
    });

    // 3. Add skill nodes and connect to umbrella
    const skillNodeMap = new Map<string, GraphNode>();

    for (const skill of umbrellaData.requiredSkills || []) {
      const skillData = skill as any;
      const skillNode: GraphNode = {
        id: `skill-${skillData.id}`,
        label: skillData.name,
        type: 'skill',
        description: skillData.description,
        parentId: `umbrella-${umbrellaData.id}`,
        criticality: skillData.criticality,
        category:
          skillData.founderSuitability === 'founder-fillable'
            ? 'founder-fillable'
            : skillData.founderSuitability === 'must-hire'
              ? 'must-hire'
              : 'co-founder-ideal',
        founderFillable: skillData.founderSuitability === 'founder-fillable',
        governmentCredentialRequired: skillData.governmentCredentialRequired,
        color:
          skillData.founderSuitability === 'founder-fillable'
            ? '#10b981' // Green for founder-fillable
            : skillData.founderSuitability === 'must-hire'
              ? '#ef4444' // Red for must-hire
              : '#f59e0b', // Amber for co-founder
        size: skillData.criticality === 'critical' ? 25 : 18
      };
      nodes.push(skillNode);
      skillNodeMap.set(skillData.id, skillNode);

      // Edge: Umbrella requires Skill
      edges.push({
        id: `edge-${edgeId++}`,
        source: `umbrella-${umbrellaData.id}`,
        target: `skill-${skillData.id}`,
        type: 'requires',
        strength: skillData.criticality === 'critical' ? 1 : 0.7,
        color: skillData.criticality === 'critical' ? '#dc2626' : '#fbbf24',
        strokeWidth: skillData.criticality === 'critical' ? 3 : 1
      });

      // 4. Add certification nodes
      for (const cert of skillData.certifications || []) {
        const certData = cert as any;
        const certNode: GraphNode = {
          id: `cert-${certData.name.replace(/\s+/g, '-').toLowerCase()}`,
          label: certData.name,
          type: 'certification',
          description: `Issued by ${certData.issuingBody}`,
          parentId: `skill-${skillData.id}`,
          color: '#06b6d4', // Cyan
          size: 12
        };

        // Only add if not already added
        if (!nodes.find((n) => n.id === certNode.id)) {
          nodes.push(certNode);

          // Edge: Skill requires Certification
          edges.push({
            id: `edge-${edgeId++}`,
            source: `skill-${skillData.id}`,
            target: certNode.id,
            type: 'certifies',
            strength: 0.8,
            color: '#06b6d4',
            dashed: true
          });
        }
      }

      // 5. Add license nodes
      for (const license of skill.licenses || []) {
        const licenseNode: GraphNode = {
          id: `license-${license.name.replace(/\s+/g, '-').toLowerCase()}`,
          label: license.name,
          type: 'license',
          description: `Issued by ${license.issuingAuthority} (${license.jurisdiction})`,
          parentId: `skill-${skill.id}`,
          color: '#f472b6', // Pink
          size: 12,
          founderFillable: license.founderCanObtain
        };

        // Only add if not already added
        if (!nodes.find((n) => n.id === licenseNode.id)) {
          nodes.push(licenseNode);

          // Edge: Skill requires License
          edges.push({
            id: `edge-${edgeId++}`,
            source: `skill-${skill.id}`,
            target: licenseNode.id,
            type: 'licenses',
            strength: 0.8,
            color: '#f472b6',
            dashed: true
          });
        }
      }
    }

    // 6. Add role nodes from supporting hires
    for (const hire of umbrellaData.supportingHires || []) {
      const hireData = hire as any;
      const roleNode: GraphNode = {
        id: `role-${hireData.title.replace(/\s+/g, '-').toLowerCase()}-${umbrellaData.id}`,
        label: hireData.title,
        type: 'role',
        description: hireData.purpose,
        parentId: `umbrella-${umbrellaData.id}`,
        color: '#a855f7', // Violet
        size: 14
      };

      // Only add if not already added globally
      if (!nodes.find((n) => n.id === roleNode.id)) {
        nodes.push(roleNode);

        // Edge: Umbrella requires Role
        edges.push({
          id: `edge-${edgeId++}`,
          source: `umbrella-${umbrellaData.id}`,
          target: roleNode.id,
          type: 'enables',
          strength: 0.9,
          color: '#a855f7'
        });
      }
    }
  }

  return {
    id: `graph-${vertical.id}`,
    name: `${vertical.name} - Skill Network`,
    nodes,
    edges,
    metadata: {
      verticalCount: 1,
      umbrellaCount: vertical.expertiseUmbrellas?.length || 0,
      skillCount: nodes.filter((n) => n.type === 'skill').length,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      avgConnectivity: edges.length / nodes.length,
      lastUpdated: new Date().toISOString()
    }
  };
}

/**
 * Build multi-vertical comparison graph
 */
export function buildMultiVerticalGraph(verticals: BusinessVerticalConfig[]): MultiVerticalGraph {
  // Build individual graphs
  const graphs = verticals.map((v) => buildVerticalGraph(v));

  // Combine all nodes and edges
  const allNodes: GraphNode[] = [];
  const allEdges: GraphEdge[] = [];
  let edgeId = 0;

  for (const graph of graphs) {
    allNodes.push(...graph.nodes);
    allEdges.push(...graph.edges);
  }

  // Find skill overlaps across verticals
  const skillMap = new Map<string, { skill: GraphNode; verticals: Set<string>; umbrellas: Set<string> }>();

  for (const node of allNodes.filter((n) => n.type === 'skill')) {
    const skillName = node.label.toLowerCase();

    if (!skillMap.has(skillName)) {
      skillMap.set(skillName, {
        skill: node,
        verticals: new Set(),
        umbrellas: new Set()
      });
    }

    // Find which vertical and umbrella this skill belongs to
    const parentUmbrella = allNodes.find((n) => n.id === node.parentId);
    if (parentUmbrella?.parentId) {
      const verticalMatch = verticals.find((v) => v.id === parentUmbrella.parentId?.split('-')[1]);
      if (verticalMatch) {
        skillMap.get(skillName)?.verticals.add(verticalMatch.name);
        skillMap.get(skillName)?.umbrellas.add(parentUmbrella.label);
      }
    }
  }

  // Create skill overlap entries
  const sharedSkills: SkillOverlap[] = Array.from(skillMap.entries())
    .filter(([_, data]) => data.verticals.size > 1) // Only shared skills
    .map(([skillName, data]) => ({
      verticals: Array.from(data.verticals),
      umbrellas: Array.from(data.umbrellas),
      skill: {
        id: data.skill.id,
        name: data.skill.label,
        criticality: data.skill.criticality || 'important'
      },
      count: data.verticals.size,
      pervasiveness:
        data.verticals.size === verticals.length
          ? 'core'
          : data.verticals.size >= 2
            ? 'common'
            : 'specialized'
    }));

  // Build occurrence maps
  const skillOccurrences = new Map<string, number>();
  const umbrellaOccurrences = new Map<string, number>();

  for (const [skillName, data] of skillMap.entries()) {
    skillOccurrences.set(skillName, data.verticals.size);
  }

  for (const node of allNodes.filter((n) => n.type === 'umbrella')) {
    const umbrellaType = node.label;
    umbrellaOccurrences.set(umbrellaType, (umbrellaOccurrences.get(umbrellaType) || 0) + 1);
  }

  return {
    verticals: graphs,
    sharedSkills,
    skillOccurrences,
    umbrellaOccurrences,
    crossVerticalEdges: []
  };
}

/**
 * Calculate graph statistics
 */
export function calculateGraphStatistics(graph: VerticalGraph): GraphStatistics {
  const nodeCount = graph.nodes.length;
  const edgeCount = graph.edges.length;
  const density = edgeCount / (nodeCount * (nodeCount - 1) / 2);

  // Calculate degree for each node
  const degrees = new Map<string, number>();
  for (const node of graph.nodes) {
    degrees.set(
      node.id,
      graph.edges.filter((e) => e.source === node.id || e.target === node.id).length
    );
  }

  const mostConnectedNodes = Array.from(degrees.entries())
    .map(([nodeId, degree]) => {
      const node = graph.nodes.find((n) => n.id === nodeId);
      return {
        nodeId,
        label: node?.label || 'Unknown',
        degree
      };
    })
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 10);

  // Find skill hubs
  const skillHubs = graph.nodes
    .filter((n) => n.type === 'skill')
    .map((skillNode) => {
      const umbrellaCount = graph.nodes.filter((n) => n.type === 'umbrella' && degrees.get(n.id)! > 0).length;
      return {
        skillId: skillNode.id,
        skillName: skillNode.label,
        appearsInUmbrellas: graph.edges.filter((e) => e.target === skillNode.id || e.source === skillNode.id).length,
        appearsInVerticals: 1 // Single vertical
      };
    })
    .sort((a, b) => b.appearsInUmbrellas - a.appearsInUmbrellas)
    .slice(0, 10);

  const founderFillable = graph.nodes.filter((n) => n.founderFillable).length;
  const mustHire = graph.nodes.filter((n) => n.category === 'must-hire').length;

  return {
    nodeCount,
    edgeCount,
    density,
    clustering: Math.min(1, edgeCount / (nodeCount * 0.3)), // Rough estimate
    avgShortestPath: 2.5, // Simplified
    mostConnectedNodes,
    skillHubs,
    founderFillablePercentage: (founderFillable / graph.nodes.filter((n) => n.type === 'skill').length) * 100,
    mustHirePercentage: (mustHire / graph.nodes.filter((n) => n.type === 'skill').length) * 100
  };
}

/**
 * Query graph for skills matching criteria
 */
export function queryGraph(graph: VerticalGraph, filter: GraphFilter): GraphNode[] {
  let results = [...graph.nodes];

  if (filter.nodeTypes && filter.nodeTypes.length > 0) {
    results = results.filter((n) => filter.nodeTypes!.includes(n.type));
  }

  if (filter.categories && filter.categories.length > 0) {
    results = results.filter((n) => n.category && filter.categories!.includes(n.category));
  }

  if (filter.criticalities && filter.criticalities.length > 0) {
    results = results.filter((n) => n.criticality && filter.criticalities!.includes(n.criticality));
  }

  if (filter.includeFounderFillable !== undefined) {
    results = results.filter((n) => n.founderFillable === filter.includeFounderFillable);
  }

  if (filter.excludeMustHire) {
    results = results.filter((n) => n.category !== 'must-hire');
  }

  return results;
}

/**
 * Find skill clusters in graph
 */
export function findSkillClusters(graph: VerticalGraph): SkillCluster[] {
  const clusters: SkillCluster[] = [];
  const skillNodes = graph.nodes.filter((n) => n.type === 'skill');

  // Simple clustering: group by umbrella
  const byUmbrella = new Map<string, GraphNode[]>();

  for (const skillNode of skillNodes) {
    const parentUmbrella = skillNode.parentId;
    if (!byUmbrella.has(parentUmbrella!)) {
      byUmbrella.set(parentUmbrella!, []);
    }
    byUmbrella.get(parentUmbrella!)!.push(skillNode);
  }

  for (const [umbrellaId, skills] of byUmbrella.entries()) {
    const umbrellaNode = graph.nodes.find((n) => n.id === umbrellaId);
    if (umbrellaNode) {
      clusters.push({
        id: `cluster-${umbrellaId}`,
        name: umbrellaNode.label,
        skills,
        umbrellas: [umbrellaId],
        verticals: graph.metadata.verticalCount === 1 ? ['single'] : ['multi'],
        cohesion: 0.8, // Simplified
        description: umbrellaNode.description
      });
    }
  }

  return clusters;
}

/**
 * Get skills needed for founder to fill vs. must-hire
 */
export function getFounderReadySkills(graph: VerticalGraph): {
  founderReady: GraphNode[];
  mustHire: GraphNode[];
  coFounderIdeal: GraphNode[];
} {
  const skillNodes = graph.nodes.filter((n) => n.type === 'skill');

  return {
    founderReady: skillNodes.filter((n) => n.category === 'founder-fillable'),
    mustHire: skillNodes.filter((n) => n.category === 'must-hire'),
    coFounderIdeal: skillNodes.filter((n) => n.category === 'co-founder-ideal')
  };
}
