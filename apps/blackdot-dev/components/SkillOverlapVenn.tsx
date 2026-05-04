'use client';

/**
 * Skill Overlap Venn Diagram
 *
 * Visualizes which skills are shared across:
 * - Multiple umbrellas within a vertical
 * - Multiple verticals
 * - Shows skill pervasiveness (core vs. specialized)
 *
 * Interactive: hover for skill details, click to see full requirements
 */

import React, { useMemo, useState } from 'react';
import { BusinessVerticalConfig } from '@/lib/types/businessVertical.types';
import { buildVerticalGraph, buildMultiVerticalGraph } from '@/lib/utils/verticalGraphBuilder';
import { GraphNode } from '@/lib/types/verticalGraph.types';

export interface SkillOverlapVennProps {
  vertical?: BusinessVerticalConfig;
  verticals?: BusinessVerticalConfig[];
  width?: number;
  height?: number;
  onSkillClick?: (skill: { name: string; umbrellas: string[]; verticals: string[] }) => void;
}

interface SkillIntersection {
  umbrellas: Set<string>;
  verticals: Set<string>;
  skills: GraphNode[];
  size: number;
}

export function SkillOverlapVenn({ vertical, verticals, width = 600, height = 600, onSkillClick }: SkillOverlapVennProps) {
  const [hoveredIntersection, setHoveredIntersection] = useState<SkillIntersection | null>(null);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  // Calculate skill overlaps
  const skillIntersections = useMemo(() => {
    if (vertical) {
      return calculateUmbrellaOverlaps(vertical);
    } else if (verticals && verticals.length > 0) {
      return calculateVerticalOverlaps(verticals);
    }
    return [];
  }, [vertical, verticals]);

  // Group by intersection pattern
  const regionsByPattern = useMemo(() => {
    const patterns = new Map<string, SkillIntersection>();

    for (const intersection of skillIntersections) {
      const pattern = Array.from(intersection.umbrellas).sort().join('|');
      if (!patterns.has(pattern)) {
        patterns.set(pattern, {
          umbrellas: intersection.umbrellas,
          verticals: intersection.verticals,
          skills: [],
          size: 0
        });
      }
      const region = patterns.get(pattern)!;
      region.skills.push(...intersection.skills);
      region.size += intersection.skills.length;
    }

    return Array.from(patterns.values());
  }, [skillIntersections]);

  // Create visualization regions
  const regions = useMemo(() => {
    const umbrellaNames = vertical ? (vertical.expertiseUmbrellas || []).map((u) => (u as any).name) : verticals?.map((v) => v.name) || [];
    const uniqueUmbrellas = [...new Set(umbrellaNames)];

    // SVG circle positions for Venn diagram
    // For 3-4 circles, use centered layout
    const positions = generateCirclePositions(uniqueUmbrellas.length, width, height);

    return uniqueUmbrellas.map((name, idx) => ({
      name,
      position: positions[idx],
      color: getColorForUmbrella(idx)
    }));
  }, [vertical, verticals, width, height]);

  return (
    <div className="space-y-4">
      {/* SVG Venn Diagram */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <svg width={width} height={height} className="w-full">
          {/* Background */}
          <rect width={width} height={height} fill="#fafafa" />

          {/* Circles for each umbrella */}
          {regions.map((region, idx) => (
            <circle
              key={`circle-${idx}`}
              cx={region.position.x}
              cy={region.position.y}
              r={120}
              fill={region.color}
              fillOpacity={0.1}
              stroke={region.color}
              strokeWidth={2}
            />
          ))}

          {/* Labels for each circle */}
          {regions.map((region, idx) => (
            <g key={`label-${idx}`}>
              <text x={region.position.x} y={region.position.y - 140} textAnchor="middle" className="font-bold text-sm" fill="#333">
                {String(region.name ?? '')}
              </text>
            </g>
          ))}

          {/* Skill dots in regions */}
          {regionsByPattern.map((region, idx) => {
            const position = calculateIntersectionCenter(
              Array.from(region.umbrellas),
              regions
            );

            return (
              <g
                key={`region-${idx}`}
                onMouseEnter={() => setHoveredIntersection(region)}
                onMouseLeave={() => setHoveredIntersection(null)}
                onClick={() => {
                  onSkillClick?.({
                    name: `${Array.from(region.umbrellas).join(' + ')}`,
                    umbrellas: Array.from(region.umbrellas),
                    verticals: Array.from(region.verticals)
                  });
                  setExpandedRegion(`${Array.from(region.umbrellas).join('|')}`);
                }}
                className="cursor-pointer"
              >
                {/* Cluster dot */}
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={region.size * 2 + 10}
                  fill="#8b5cf6"
                  fillOpacity={hoveredIntersection === region ? 0.3 : 0.15}
                  stroke="#8b5cf6"
                  strokeWidth={hoveredIntersection === region ? 2 : 1}
                />

                {/* Count */}
                <text
                  x={position.x}
                  y={position.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-bold text-sm"
                  fill="#6d28d9"
                >
                  {region.size}
                </text>

                {/* Tooltip on hover */}
                {hoveredIntersection === region && (
                  <g>
                    <rect
                      x={position.x - 80}
                      y={position.y - 60}
                      width={160}
                      height={55}
                      fill="white"
                      stroke="#999"
                      strokeWidth={1}
                      rx={4}
                    />
                    <text x={position.x} y={position.y - 45} textAnchor="middle" className="text-xs font-bold" fill="#333">
                      {Array.from(region.umbrellas).join(' + ')}
                    </text>
                    <text x={position.x} y={position.y - 28} textAnchor="middle" className="text-xs" fill="#666">
                      {region.size} shared skills
                    </text>
                    <text x={position.x} y={position.y - 15} textAnchor="middle" className="text-xs text-blue-600" fill="#2563eb">
                      Click to expand
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Expanded region details */}
      {expandedRegion && (
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-purple-900">Shared Skills</h3>
            <button
              onClick={() => setExpandedRegion(null)}
              className="text-sm px-2 py-1 bg-purple-200 text-purple-900 rounded hover:bg-purple-300"
            >
              Close
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {regionsByPattern.find((r) => Array.from(r.umbrellas).join('|') === expandedRegion)?.skills.map((skill) => (
              <div key={skill.id} className="p-2 bg-white rounded border border-purple-100">
                <div className="font-semibold text-sm text-purple-900">{skill.label}</div>
                <div className="text-xs text-purple-700 mt-1">{skill.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary statistics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50 rounded">
          <div className="text-xs text-slate-600">Core Skills</div>
          <div className="text-xl font-bold text-slate-900">
            {regionsByPattern.filter((r) => r.umbrellas.size > 1).reduce((sum, r) => sum + r.size, 0)}
          </div>
          <div className="text-xs text-slate-500">Shared across umbrellas</div>
        </div>
        <div className="p-3 bg-slate-50 rounded">
          <div className="text-xs text-slate-600">Specialized Skills</div>
          <div className="text-xl font-bold text-slate-900">
            {regionsByPattern.filter((r) => r.umbrellas.size === 1).reduce((sum, r) => sum + r.size, 0)}
          </div>
          <div className="text-xs text-slate-500">Unique to one umbrella</div>
        </div>
        <div className="p-3 bg-slate-50 rounded">
          <div className="text-xs text-slate-600">Total Skills</div>
          <div className="text-xl font-bold text-slate-900">{regionsByPattern.reduce((sum, r) => sum + r.size, 0)}</div>
          <div className="text-xs text-slate-500">Across all umbrellas</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Calculate overlaps within a single vertical (umbrella-based)
 */
function calculateUmbrellaOverlaps(vertical: BusinessVerticalConfig): SkillIntersection[] {
  const skillsByUmbrella = new Map<string, Set<string>>();

  for (const umbrella of vertical.expertiseUmbrellas || []) {
    const typedUmbrella = umbrella as any;
    const skillSet = new Set<string>((typedUmbrella.requiredSkills?.map((s: any) => s.name) || []) as string[]);
    skillsByUmbrella.set(typedUmbrella.name, skillSet);
  }

  const intersections: SkillIntersection[] = [];

  // Find overlaps
  const umbrellas = Array.from(skillsByUmbrella.keys());
  for (let i = 0; i < umbrellas.length; i++) {
    for (let j = i + 1; j < umbrellas.length; j++) {
      const overlap = [...skillsByUmbrella.get(umbrellas[i])!].filter((s) =>
        skillsByUmbrella.get(umbrellas[j])!.has(s)
      );

      if (overlap.length > 0) {
        intersections.push({
          umbrellas: new Set([umbrellas[i], umbrellas[j]]),
          verticals: new Set([vertical.name]),
          skills: overlap.map((name) => ({
            id: name,
            label: name,
            type: 'skill' as const
          })),
          size: overlap.length
        });
      }
    }
  }

  return intersections;
}

/**
 * Calculate overlaps across verticals
 */
function calculateVerticalOverlaps(verticals: BusinessVerticalConfig[]): SkillIntersection[] {
  const multiGraph = buildMultiVerticalGraph(verticals);
  const intersections: SkillIntersection[] = [];

  for (const overlap of multiGraph.sharedSkills) {
    intersections.push({
      umbrellas: new Set(overlap.umbrellas),
      verticals: new Set(overlap.verticals),
      skills: [
        {
          id: overlap.skill.id,
          label: overlap.skill.name,
          type: 'skill'
        }
      ],
      size: 1
    });
  }

  return intersections;
}

/**
 * Generate circle positions for Venn diagram
 */
function generateCirclePositions(count: number, width: number, height: number) {
  const positions = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }

  return positions;
}

/**
 * Calculate center of intersection region
 */
function calculateIntersectionCenter(
  umbrellaNames: string[],
  regions: Array<{ name: string; position: { x: number; y: number }; color: string }>
): { x: number; y: number } {
  const positions = regions.filter((r) => umbrellaNames.includes(r.name)).map((r) => r.position);

  if (positions.length === 0) return { x: 0, y: 0 };

  const avgX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
  const avgY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;

  return { x: avgX, y: avgY };
}

/**
 * Get color for umbrella
 */
function getColorForUmbrella(index: number): string {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  return colors[index % colors.length];
}

export default SkillOverlapVenn;
