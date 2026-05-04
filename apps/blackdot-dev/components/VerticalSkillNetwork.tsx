'use client';

/**
 * Vertical Skill Network Visualization
 *
 * Interactive neural network / Venn diagram visualization showing:
 * - Umbrellas as nodes connected to vertical
 * - Skills as nodes connected to umbrellas
 * - Color-coding: green (founder-fillable), red (must-hire), amber (co-founder)
 * - Edge thickness based on skill criticality
 * - Interactive: hover for details, click to filter, drag to explore
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { BusinessVerticalConfig } from '@/lib/types/businessVertical.types';
import {
  buildVerticalGraph,
  buildMultiVerticalGraph,
  calculateGraphStatistics,
  getFounderReadySkills
} from '@/lib/utils/verticalGraphBuilder';
import { VerticalGraph, GraphNode, GraphEdge } from '@/lib/types/verticalGraph.types';

export interface VerticalSkillNetworkProps {
  vertical?: BusinessVerticalConfig;
  verticals?: BusinessVerticalConfig[];
  width?: number;
  height?: number;
  interactive?: boolean;
  layout?: 'force-directed' | 'hierarchical' | 'radial' | 'venn';
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  showLabels?: boolean;
  colorScheme?: 'category' | 'criticality' | 'vertical';
}

interface Position {
  x: number;
  y: number;
}

interface D3Node extends GraphNode, Position {
  vx?: number;
  vy?: number;
}

interface D3Edge {
  source: string | D3Node;
  target: string | D3Node;
  strength?: number;
  criticality?: number;
}

export function VerticalSkillNetwork({
  vertical,
  verticals,
  width = 1200,
  height = 800,
  interactive = true,
  layout = 'force-directed',
  onNodeClick,
  onNodeHover,
  showLabels = true,
  colorScheme = 'category'
}: VerticalSkillNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graph, setGraph] = useState<VerticalGraph | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Build graph from config
  useEffect(() => {
    if (vertical) {
      const g = buildVerticalGraph(vertical);
      setGraph(g);
      setStats(calculateGraphStatistics(g));
    } else if (verticals && verticals.length > 0) {
      const multiGraph = buildMultiVerticalGraph(verticals);
      // For now, use first vertical's graph; could be enhanced for multi-vertical view
      if (multiGraph.verticals.length > 0) {
        setGraph(multiGraph.verticals[0]);
        setStats(calculateGraphStatistics(multiGraph.verticals[0]));
      }
    }
  }, [vertical, verticals]);

  // Initialize force simulation
  const simulation = useMemo(() => {
    if (!graph) return null;

    // Simple force simulation
    const nodes: D3Node[] = graph.nodes.map((n) => ({
      ...n,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0
    }));

    const edges = graph.edges;

    return {
      nodes,
      edges,
      alpha: 1
    };
  }, [graph, width, height]);

  // Render loop with Canvas
  useEffect(() => {
    if (!graph || !simulation || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animating = true;

    const animate = () => {
      if (!ctx || !animating) return;

      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw edges first (behind nodes)
      for (const edge of simulation.edges) {
        const sourceId = typeof edge.source === 'string' ? edge.source : (edge.source as D3Node)?.id;
        const targetId = typeof edge.target === 'string' ? edge.target : (edge.target as D3Node)?.id;
        const sourceNode = simulation.nodes.find((n) => n.id === sourceId);
        const targetNode = simulation.nodes.find((n) => n.id === targetId);

        if (!sourceNode || !targetNode) continue;

        ctx.strokeStyle = edge.color || '#999';
        ctx.lineWidth = edge.strokeWidth || 1.5;
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();
      }

      // Draw nodes
      for (const node of simulation.nodes) {
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;

        // Node circle
        ctx.fillStyle = node.color || '#999';
        ctx.beginPath();
        ctx.arc(node.x, node.y, (node.size || 15) * (isHovered ? 1.5 : 1), 0, 2 * Math.PI);
        ctx.fill();

        // Highlight ring if hovered or selected
        if (isHovered || isSelected) {
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, (node.size || 15) * 1.3, 0, 2 * Math.PI);
          ctx.stroke();
        }

        // Label
        if (showLabels && node.type !== 'license' && node.type !== 'certification') {
          ctx.fillStyle = '#000';
          ctx.font = 'bold 11px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y + 4);
        }
      }

      // Update positions (simple Verlet integration)
      if (interactive && simulation.alpha > 0.01) {
        // Apply forces (simplified)
        for (const node of simulation.nodes) {
          // Damping
          node.vx = (node.vx || 0) * 0.9;
          node.vy = (node.vy || 0) * 0.9;

          // Update position
          node.x += node.vx || 0;
          node.y += node.vy || 0;

          // Boundary conditions
          if (node.x - (node.size || 15) < 0) node.x = node.size || 15;
          if (node.x + (node.size || 15) > width) node.x = width - (node.size || 15);
          if (node.y - (node.size || 15) < 0) node.y = node.size || 15;
          if (node.y + (node.size || 15) > height) node.y = height - (node.size || 15);
        }

        simulation.alpha *= 0.9999;
        animationRef.current = requestAnimationFrame(animate);
      } else if (interactive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      animating = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [graph, simulation, hoveredNode, selectedNode, width, height, showLabels, interactive]);

  // Mouse event handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!simulation) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find hovered node
    let hoveredNode: GraphNode | null = null;
    for (const node of simulation.nodes) {
      const dist = Math.hypot(node.x - x, node.y - y);
      if (dist < (node.size || 15) * 1.5) {
        hoveredNode = node;
        break;
      }
    }

    setHoveredNode(hoveredNode);
    onNodeHover?.(hoveredNode);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!simulation) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    for (const node of simulation.nodes) {
      const dist = Math.hypot(node.x - x, node.y - y);
      if (dist < (node.size || 15) * 1.5) {
        setSelectedNode(node);
        onNodeClick?.(node);
        break;
      }
    }
  };

  // Render stats panel
  const founderReadyStats = graph ? getFounderReadySkills(graph) : null;

  return (
    <div ref={containerRef} className="w-full space-y-4">
      {/* Statistics Panel */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <div className="text-sm text-slate-600">Total Skills</div>
            <div className="text-2xl font-bold text-blue-600">{stats.skillHubs.length}</div>
          </div>
          <div>
            <div className="text-sm text-slate-600 flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Founder-Ready
            </div>
            <div className="text-2xl font-bold text-green-600">{founderReadyStats?.founderReady.length || 0}</div>
          </div>
          <div>
            <div className="text-sm text-slate-600 flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Must-Hire
            </div>
            <div className="text-2xl font-bold text-red-600">{founderReadyStats?.mustHire.length || 0}</div>
          </div>
          <div>
            <div className="text-sm text-slate-600 flex items-center gap-1">
              <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
              Co-Founder Ideal
            </div>
            <div className="text-2xl font-bold text-amber-600">{founderReadyStats?.coFounderIdeal.length || 0}</div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
          className="w-full cursor-default"
          style={{ display: 'block' }}
        />
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="font-bold text-lg text-blue-900 mb-2">{selectedNode.label}</div>
          <div className="text-sm text-blue-800 space-y-1">
            <div>
              <span className="font-semibold">Type:</span> {selectedNode.type}
            </div>
            {selectedNode.description && (
              <div>
                <span className="font-semibold">Description:</span> {selectedNode.description}
              </div>
            )}
            {selectedNode.category && (
              <div>
                <span className="font-semibold">Category:</span>{' '}
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${
                    selectedNode.category === 'founder-fillable'
                      ? 'bg-green-600'
                      : selectedNode.category === 'must-hire'
                        ? 'bg-red-600'
                        : 'bg-amber-600'
                  }`}
                >
                  {selectedNode.category.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            )}
            {selectedNode.cost && (
              <div>
                <span className="font-semibold">Cost:</span> ${selectedNode.cost.min}K - ${selectedNode.cost.max}K
              </div>
            )}
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="mt-3 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 bg-slate-50 rounded-lg">
        <div className="font-semibold mb-2">Legend</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500"></div>
            <span>Founder-Fillable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-500"></div>
            <span>Must-Hire</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500"></div>
            <span>Co-Founder Ideal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500"></div>
            <span>Umbrella</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500"></div>
            <span>Vertical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500"></div>
            <span>Certification</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerticalSkillNetwork;
