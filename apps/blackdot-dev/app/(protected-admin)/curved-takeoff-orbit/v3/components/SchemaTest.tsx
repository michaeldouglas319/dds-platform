/**
 * Schema-Driven UI Test Component
 *
 * Demonstrates auto-generated UI from Zod schemas.
 * Tests Debug and Orientation sections as proof of concept.
 */

'use client';

import React, { useState } from 'react';
import { SchemaSection } from './SchemaSection';
import {
  DebugSchema,
  DEFAULT_DEBUG_CONFIG,
  OrientationSchema,
  DEFAULT_ORIENTATION_CONFIG,
  OrbitPhysicsSchema,
  DEFAULT_ORBIT_PHYSICS_CONFIG
} from '../config/schemas';

export function SchemaTest() {
  const [debugConfig, setDebugConfig] = useState(DEFAULT_DEBUG_CONFIG);
  const [orientationConfig, setOrientationConfig] = useState(DEFAULT_ORIENTATION_CONFIG);
  const [physicsConfig, setPhysicsConfig] = useState(DEFAULT_ORBIT_PHYSICS_CONFIG);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['debug', 'orientation', 'physics'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-4 bg-slate-900 rounded-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Schema-Driven UI Test
        </h1>
        <p className="text-slate-400 text-sm">
          Auto-generated configuration UI from Zod schemas with metadata.
          All controls below are generated automatically from schema definitions.
        </p>
      </div>

      {/* Debug Section - 11 Checkboxes */}
      <SchemaSection
        title="Debug Visualizations"
        description="Toggle debug overlays and visual guides"
        schema={DebugSchema}
        value={debugConfig}
        onChange={setDebugConfig}
        isExpanded={expandedSections.has('debug')}
        onToggleExpanded={() => toggleSection('debug')}
      />

      {/* Orientation Section - 1 Select + 3 Sliders */}
      <SchemaSection
        title="Orientation"
        description="Control particle rotation behavior during flight"
        schema={OrientationSchema}
        value={orientationConfig}
        onChange={setOrientationConfig}
        isExpanded={expandedSections.has('orientation')}
        onToggleExpanded={() => toggleSection('orientation')}
      />

      {/* Physics Section - 12 Sliders */}
      <SchemaSection
        title="Physics (Rapier)"
        description="Orbital mechanics and particle dynamics"
        schema={OrbitPhysicsSchema}
        value={physicsConfig}
        onChange={setPhysicsConfig}
        isExpanded={expandedSections.has('physics')}
        onToggleExpanded={() => toggleSection('physics')}
      />

      {/* JSON Output for Verification */}
      <div className="mt-8 p-4 bg-slate-800 rounded border border-slate-700">
        <h3 className="text-white text-sm font-semibold mb-2">
          Current Configuration (JSON)
        </h3>
        <pre className="text-slate-300 text-xs font-mono overflow-x-auto">
          {JSON.stringify(
            {
              debug: debugConfig,
              orientation: orientationConfig,
              physics: physicsConfig
            },
            null,
            2
          )}
        </pre>
      </div>

      {/* Success Message */}
      <div className="mt-4 p-3 bg-green-900/20 border border-green-700/50 rounded">
        <p className="text-green-400 text-xs">
          ✓ Schema-driven UI working! All controls auto-generated from Zod schemas.
        </p>
      </div>
    </div>
  );
}
