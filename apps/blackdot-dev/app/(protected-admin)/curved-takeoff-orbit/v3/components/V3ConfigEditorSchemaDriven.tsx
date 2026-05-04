/**
 * V3 Schema-Driven Config Editor
 *
 * Migrated version using auto-generated schema sections.
 * Preserves all existing features: presets, import/export, collapsible sections.
 *
 * Key Changes:
 * - 80% of parameters auto-generated from Zod schemas
 * - 20% manual UI for complex types (Vector3, arrays)
 * - Runtime validation with Zod
 * - Single source of truth for types and UI
 */

'use client';

import { useState } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, Upload, Settings, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import type { V3Config } from '../config/v3.config';
import { V3_CONFIG } from '../config/v3.config';

// Import schema-driven components
import { SchemaSection } from './SchemaSection';
import { SchemaFormField } from './SchemaFormField';

// Import schemas
import {
  DebugSchema,
  DisplaySchema,
  OrientationSchema,
  OrbitPhysicsSchema,
  BlueGateSchema,
  VerticalWaveSchema,
  CollisionSchema,
  SoftGuidanceSchema,
  TrajectorySchema,
  ExitRequirementsSchema,
  LandingTransitionSchema,
  ModelOrientationSchema,
  OrbitSettingsSchema,
  V3ConfigSchema,
} from '../config/v3-config.schema';

// Import presets
import { GENTLE_DRIFT_CONFIG } from '../config/presets/gentle-drift';
import { CHAOTIC_SWARM_CONFIG } from '../config/presets/chaotic-swarm';
import { SYNCHRONIZED_FORMATION_CONFIG } from '../config/presets/synchronized-formation';

interface V3ConfigEditorSchemaProps {
  config: V3Config;
  onConfigChange: (config: V3Config) => void;
}

type PresetName = 'default' | 'gentle-drift' | 'chaotic-swarm' | 'synchronized-formation';

interface Preset {
  name: string;
  id: PresetName;
  description: string;
  config: Partial<V3Config>;
}

const PRESETS: Preset[] = [
  {
    name: 'Default',
    id: 'default',
    description: 'Base configuration with standard physics',
    config: {},
  },
  {
    name: 'Gentle Drift',
    id: 'gentle-drift',
    description: 'Loose, flowing motion with organic feel',
    config: GENTLE_DRIFT_CONFIG,
  },
  {
    name: 'Chaotic Swarm',
    id: 'chaotic-swarm',
    description: 'High freedom, turbulent emergent patterns',
    config: CHAOTIC_SWARM_CONFIG,
  },
  {
    name: 'Synchronized Formation',
    id: 'synchronized-formation',
    description: 'Tight choreography with minimal deviation',
    config: SYNCHRONIZED_FORMATION_CONFIG,
  },
];

export function V3ConfigEditorSchemaDriven({ config, onConfigChange }: V3ConfigEditorSchemaProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activePreset, setActivePreset] = useState<PresetName>('default');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['scene', 'display', 'debug', 'orientation'])
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const loadPreset = (presetId: PresetName) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      // Merge preset with base config (deep merge)
      const newConfig = { ...V3_CONFIG, ...preset.config };

      // Deep merge nested objects
      if (preset.config.physics) {
        newConfig.physics = { ...V3_CONFIG.physics, ...preset.config.physics };
      }
      if (preset.config.verticalWave) {
        newConfig.verticalWave = { ...V3_CONFIG.verticalWave, ...preset.config.verticalWave };
      }
      if (preset.config.collision) {
        newConfig.collision = { ...V3_CONFIG.collision, ...preset.config.collision };
      }
      if (preset.config.softGuidance) {
        newConfig.softGuidance = { ...V3_CONFIG.softGuidance, ...preset.config.softGuidance };
      }
      if (preset.config.orientation) {
        newConfig.orientation = { ...V3_CONFIG.orientation, ...preset.config.orientation };
      }

      onConfigChange(newConfig);
      setActivePreset(presetId);
      setValidationErrors([]);
    }
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `v3-config-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string);

            // Reconstruct THREE.Vector3 objects
            if (imported.orbit?.center) {
              imported.orbit.center = new THREE.Vector3(
                imported.orbit.center.x,
                imported.orbit.center.y,
                imported.orbit.center.z
              );
            }
            imported.sources?.forEach((source: any) => {
              if (source.gatePosition) {
                source.gatePosition = new THREE.Vector3(
                  source.gatePosition.x,
                  source.gatePosition.y,
                  source.gatePosition.z
                );
              }
            });
            // Reconstruct staging zone positions
            imported.taxiStaging?.stagingZones?.forEach((zone: any) => {
              if (zone.position) {
                zone.position = new THREE.Vector3(
                  zone.position.x,
                  zone.position.y,
                  zone.position.z
                );
              }
            });

            // Validate imported config (optional but recommended)
            const result = V3ConfigSchema.partial().safeParse(imported);
            if (!result.success) {
              console.warn('Config validation warnings:', result.error.issues);
              setValidationErrors(result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
            } else {
              setValidationErrors([]);
            }

            onConfigChange(imported);
            setActivePreset('default'); // Mark as custom
          } catch (error) {
            console.error('Failed to import config:', error);
            alert('Failed to import configuration. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const updateConfig = (updates: Partial<V3Config>) => {
    const newConfig = { ...config, ...updates };
    onConfigChange(newConfig);
    setActivePreset('default'); // Mark as modified
  };

  const updateNested = <T extends keyof V3Config>(
    key: T,
    updates: Partial<V3Config[T]>
  ) => {
    const currentValue = config[key];
    if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
      updateConfig({ [key]: { ...currentValue, ...updates } } as Partial<V3Config>);
    } else {
      updateConfig({ [key]: updates } as Partial<V3Config>);
    }
  };

  const radToDeg = (rad: number) => (rad * 180) / Math.PI;
  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-50 bg-slate-800/95 backdrop-blur-sm flex items-center gap-2"
      >
        <Settings size={16} />
        {isOpen ? 'Hide' : 'Show'} Config
      </Button>

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed right-4 top-32 z-40 w-96 max-h-[calc(100vh-140px)] overflow-y-auto bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 shadow-lg">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="border-b border-slate-700 pb-3">
              <h3 className="text-white font-bold text-lg">V3 Configuration</h3>
              <p className="text-slate-400 text-xs">Schema-driven config editor with runtime validation</p>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="p-3 bg-red-900/20 border border-red-700/50 rounded space-y-1">
                <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                  <AlertCircle size={14} />
                  Validation Warnings
                </div>
                {validationErrors.map((error, idx) => (
                  <p key={idx} className="text-red-300 text-[10px] font-mono">
                    {error}
                  </p>
                ))}
              </div>
            )}

            {/* Preset Selection */}
            <div className="space-y-2 border-b border-slate-700 pb-3">
              <Label className="text-white text-sm font-semibold">Load Preset</Label>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => loadPreset(preset.id)}
                    className={`p-2 rounded text-xs transition-all ${
                      activePreset === preset.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title={preset.description}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Import/Export */}
            <div className="flex gap-2 border-b border-slate-700 pb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={exportConfig}
                className="flex-1 text-xs"
              >
                <Download size={14} className="mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={importConfig}
                className="flex-1 text-xs"
              >
                <Upload size={14} className="mr-1" />
                Import
              </Button>
            </div>

            {/* ===== SCENE SETTINGS ===== */}
            <div className="space-y-3">
              {/* Particle Count - Manual (simple field) */}
              <div className="space-y-2">
                <Label className="text-white text-sm font-semibold">Scene Settings</Label>
                <SchemaFormField
                  schema={V3ConfigSchema.shape.particleCount}
                  value={config.particleCount}
                  onChange={(val) => updateConfig({ particleCount: val })}
                />
              </div>

              {/* Orbit Center - Manual (Vector3) */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs font-medium">Orbit Center (Vector3)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    value={config.orbit.center.x}
                    onChange={(e) =>
                      updateNested('orbit', {
                        center: new THREE.Vector3(
                          parseFloat(e.target.value),
                          config.orbit.center.y,
                          config.orbit.center.z
                        ),
                      })
                    }
                    placeholder="X"
                    className="h-8 text-xs bg-slate-700/50"
                  />
                  <Input
                    type="number"
                    value={config.orbit.center.y}
                    onChange={(e) =>
                      updateNested('orbit', {
                        center: new THREE.Vector3(
                          config.orbit.center.x,
                          parseFloat(e.target.value),
                          config.orbit.center.z
                        ),
                      })
                    }
                    placeholder="Y"
                    className="h-8 text-xs bg-slate-700/50"
                  />
                  <Input
                    type="number"
                    value={config.orbit.center.z}
                    onChange={(e) =>
                      updateNested('orbit', {
                        center: new THREE.Vector3(
                          config.orbit.center.x,
                          config.orbit.center.y,
                          parseFloat(e.target.value)
                        ),
                      })
                    }
                    placeholder="Z"
                    className="h-8 text-xs bg-slate-700/50"
                  />
                </div>
              </div>

              {/* Orbit Settings - Auto-generated (radius, nominalSpeed) */}
              <div className="space-y-2">
                <SchemaFormField
                  schema={OrbitSettingsSchema.shape.radius}
                  value={config.orbit.radius}
                  onChange={(val) => updateNested('orbit', { radius: val })}
                />
                <SchemaFormField
                  schema={OrbitSettingsSchema.shape.nominalSpeed}
                  value={config.orbit.nominalSpeed}
                  onChange={(val) => updateNested('orbit', { nominalSpeed: val })}
                />
              </div>
            </div>

            {/* ===== DISPLAY - FULLY AUTO-GENERATED ===== */}
            <SchemaSection
              title="Display & Visibility"
              description="Show/hide particles, models, and static objects"
              schema={DisplaySchema}
              value={config.display}
              onChange={(val) => updateConfig({ display: val })}
              isExpanded={expandedSections.has('display')}
              onToggleExpanded={() => toggleSection('display')}
            />

            {/* ===== DEBUG - FULLY AUTO-GENERATED ===== */}
            <SchemaSection
              title="Debug Visualizations"
              description="Toggle debug overlays and visual guides"
              schema={DebugSchema}
              value={config.debug}
              onChange={(val) => updateConfig({ debug: val })}
              isExpanded={expandedSections.has('debug')}
              onToggleExpanded={() => toggleSection('debug')}
            />

            {/* ===== ORIENTATION - FULLY AUTO-GENERATED ===== */}
            <SchemaSection
              title="Orientation"
              description="Control particle rotation behavior"
              schema={OrientationSchema}
              value={config.orientation}
              onChange={(val) => updateConfig({ orientation: val })}
              isExpanded={expandedSections.has('orientation')}
              onToggleExpanded={() => toggleSection('orientation')}
            />

            {/* ===== PHYSICS - FULLY AUTO-GENERATED ===== */}
            <SchemaSection
              title="Physics (Rapier)"
              description="Orbital mechanics and particle dynamics"
              schema={OrbitPhysicsSchema}
              value={config.physics}
              onChange={(val) => updateConfig({ physics: val })}
              isExpanded={expandedSections.has('physics')}
              onToggleExpanded={() => toggleSection('physics')}
            />

            {/* ===== BLUE GATE - FULLY AUTO-GENERATED ===== */}
            <SchemaSection
              title="Blue Gate Attraction"
              description="State-based attraction zones"
              schema={BlueGateSchema}
              value={config.blueGate}
              onChange={(val) => updateConfig({ blueGate: val })}
              isExpanded={expandedSections.has('bluegate')}
              onToggleExpanded={() => toggleSection('bluegate')}
            />

            {/* ===== VERTICAL WAVE - FULLY AUTO-GENERATED ===== */}
            <SchemaSection
              title="Vertical Wave"
              description="3D orbital wave motion"
              schema={VerticalWaveSchema}
              value={config.verticalWave}
              onChange={(val) => updateConfig({ verticalWave: val })}
              isExpanded={expandedSections.has('verticalwave')}
              onToggleExpanded={() => toggleSection('verticalwave')}
            />

            {/* ===== COLLISION - FULLY AUTO-GENERATED ===== */}
            <SchemaSection
              title="Collision & Repulsion"
              description="Particle collision avoidance"
              schema={CollisionSchema}
              value={config.collision}
              onChange={(val) => updateConfig({ collision: val })}
              isExpanded={expandedSections.has('collision')}
              onToggleExpanded={() => toggleSection('collision')}
            />

            {/* ===== SOFT GUIDANCE - FULLY AUTO-GENERATED ===== */}
            <SchemaSection
              title="Soft Guidance"
              description="Physics-based soft constraints"
              schema={SoftGuidanceSchema}
              value={config.softGuidance}
              onChange={(val) => updateConfig({ softGuidance: val })}
              isExpanded={expandedSections.has('softguidance')}
              onToggleExpanded={() => toggleSection('softguidance')}
            />

            {/* ===== TRAJECTORY - FULLY AUTO-GENERATED ===== */}
            <SchemaSection
              title="Trajectory Curves"
              description="Takeoff and landing paths"
              schema={TrajectorySchema}
              value={config.trajectorySettings}
              onChange={(val) => updateConfig({ trajectorySettings: val })}
              isExpanded={expandedSections.has('trajectory')}
              onToggleExpanded={() => toggleSection('trajectory')}
            />

            {/* ===== EXIT REQUIREMENTS - FULLY AUTO-GENERATED ===== */}
            <SchemaSection
              title="Exit Requirements"
              description="When particles can leave orbit"
              schema={ExitRequirementsSchema}
              value={config.exitRequirements}
              onChange={(val) => updateConfig({ exitRequirements: val })}
              isExpanded={expandedSections.has('exit')}
              onToggleExpanded={() => toggleSection('exit')}
            />

            {/* ===== LANDING TRANSITION - FULLY AUTO-GENERATED ===== */}
            <SchemaSection
              title="Landing Transition"
              description="Orbit to landing curve blend"
              schema={LandingTransitionSchema}
              value={config.landingTransition}
              onChange={(val) => updateConfig({ landingTransition: val })}
              isExpanded={expandedSections.has('landing')}
              onToggleExpanded={() => toggleSection('landing')}
            />

            {/* ===== MODEL ORIENTATION - FULLY AUTO-GENERATED ===== */}
            <SchemaSection
              title="Model Orientation"
              description="3D model scale and rotation"
              schema={ModelOrientationSchema}
              value={config.modelOrientation}
              onChange={(val) => updateConfig({ modelOrientation: val })}
              isExpanded={expandedSections.has('model')}
              onToggleExpanded={() => toggleSection('model')}
            />

            {/* ===== SOURCES - MANUAL (Vector3 + dynamic array) ===== */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <button
                onClick={() => toggleSection('sources')}
                className="w-full flex items-center gap-2 text-white text-sm font-semibold hover:text-blue-400 transition-colors"
              >
                {expandedSections.has('sources') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                Sources ({config.sources.length})
              </button>

              {expandedSections.has('sources') && (
                <div className="space-y-3">
                  {/* Generate McLaren Circuit Source Button */}
                  {!config.sources.find((s) => s.id === 'mclaren-circuit') && (
                    <Button
                      onClick={() => {
                        // Generate McLaren F1 circuit around scene edge (larger radius)
                        const edgeRadius = 70; // Larger radius to circle scene edge
                        const waypoints = [];

                        for (let i = 0; i < 8; i++) {
                          const angle = (i / 8) * Math.PI * 2;
                          const x = Math.cos(angle) * edgeRadius;
                          const z = Math.sin(angle) * edgeRadius;
                          waypoints.push(new THREE.Vector3(x, 1, z)); // Slightly elevated (y=1)
                        }

                        const mclarenSource = {
                          id: 'mclaren-circuit',
                          gatePosition: waypoints[0], // Start at first checkpoint
                          flightPattern: {
                            groundWaypoints: waypoints, // Store circuit waypoints
                            isGroundSource: true,
                            modelPath: '/assets/models/mclaren_f1lm_-_low_poly.glb', // McLaren F1 model
                            verticalWave: { springConstant: 0, frequency: 0 }, // No vertical wave
                            physics: { donutThickness: 2 } // Small vertical tolerance
                          },
                          spawnRate: 3.0,
                          orbitEntryAngle: 0,
                          particleColor: '#ff6600ff', // Orange for McLaren
                          modelScale: 0.08 // Larger for visibility
                        };

                        updateConfig({ sources: [...config.sources, mclarenSource] });
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs bg-orange-900/20 hover:bg-orange-900/40 border-orange-700/50"
                    >
                      + McLaren Circuit (8 checkpoints, scene edge)
                    </Button>
                  )}

                  {/* Generate Ground Source Button */}
                  {!config.sources.find((s) => s.id === 'ground-source') && (
                    <Button
                      onClick={() => {
                        // Generate ground source with 6 checkpoint waypoints
                        const radius = 50;
                        const waypoints = [];

                        for (let i = 0; i < 6; i++) {
                          const angle = (i / 6) * Math.PI * 2;
                          const x = Math.cos(angle) * radius;
                          const z = Math.sin(angle) * radius;
                          waypoints.push(new THREE.Vector3(x, 0, z));
                        }

                        const groundSource = {
                          id: 'ground-source',
                          gatePosition: waypoints[0], // Start at first checkpoint
                          flightPattern: {
                            groundWaypoints: waypoints, // Store circuit waypoints
                            isGroundSource: true,
                            verticalWave: { springConstant: 0, frequency: 0 }, // No vertical wave for ground
                            physics: { donutThickness: 0 } // Ground level only
                          },
                          spawnRate: 2.0,
                          orbitEntryAngle: 0,
                          particleColor: '#ffffff', // Green for ground vehicles
                          modelScale: 0.04
                        };

                        updateConfig({ sources: [...config.sources, groundSource] });
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs bg-green-900/20 hover:bg-green-900/40 border-green-700/50"
                    >
                      + Generate Ground Source (6 checkpoints)
                    </Button>
                  )}

                  {config.sources.map((source, idx) => (
                    <div key={source.id} className="pl-4 bg-slate-800/30 rounded p-3 space-y-2">
                      <Label className="text-slate-200 text-xs font-semibold">{source.id}</Label>

                      {/* Gate Position - Vector3 */}
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">Gate Position</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-slate-400 text-[10px]">X</Label>
                            <Input
                              type="number"
                              value={source.gatePosition.x}
                              onChange={(e) => {
                                const newSources = [...config.sources];
                                newSources[idx] = {
                                  ...source,
                                  gatePosition: new THREE.Vector3(
                                    parseFloat(e.target.value),
                                    source.gatePosition.y,
                                    source.gatePosition.z
                                  ),
                                };
                                updateConfig({ sources: newSources });
                              }}
                              className="h-7 text-xs bg-slate-700/50"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-400 text-[10px]">Y</Label>
                            <Input
                              type="number"
                              value={source.gatePosition.y}
                              onChange={(e) => {
                                const newSources = [...config.sources];
                                newSources[idx] = {
                                  ...source,
                                  gatePosition: new THREE.Vector3(
                                    source.gatePosition.x,
                                    parseFloat(e.target.value),
                                    source.gatePosition.z
                                  ),
                                };
                                updateConfig({ sources: newSources });
                              }}
                              className="h-7 text-xs bg-slate-700/50"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-400 text-[10px]">Z</Label>
                            <Input
                              type="number"
                              value={source.gatePosition.z}
                              onChange={(e) => {
                                const newSources = [...config.sources];
                                newSources[idx] = {
                                  ...source,
                                  gatePosition: new THREE.Vector3(
                                    source.gatePosition.x,
                                    source.gatePosition.y,
                                    parseFloat(e.target.value)
                                  ),
                                };
                                updateConfig({ sources: newSources });
                              }}
                              className="h-7 text-xs bg-slate-700/50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Other source fields (could be schema-driven but manual for now) */}
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Spawn Rate: {source.spawnRate.toFixed(1)}s
                        </Label>
                        <Input
                          type="number"
                          value={source.spawnRate}
                          onChange={(e) => {
                            const newSources = [...config.sources];
                            newSources[idx] = { ...source, spawnRate: parseFloat(e.target.value) };
                            updateConfig({ sources: newSources });
                          }}
                          className="h-7 text-xs bg-slate-700/50"
                          step={0.1}
                          min={0.1}
                          max={5}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Orbit Entry Angle: {radToDeg(source.orbitEntryAngle).toFixed(0)}°
                        </Label>
                        <Input
                          type="number"
                          value={radToDeg(source.orbitEntryAngle)}
                          onChange={(e) => {
                            const newSources = [...config.sources];
                            newSources[idx] = { ...source, orbitEntryAngle: degToRad(parseFloat(e.target.value)) };
                            updateConfig({ sources: newSources });
                          }}
                          className="h-7 text-xs bg-slate-700/50"
                          step={5}
                          min={0}
                          max={360}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">Particle Color</Label>
                        <input
                          type="color"
                          value={source.particleColor.slice(0, 7)}
                          onChange={(e) => {
                            const newSources = [...config.sources];
                            newSources[idx] = { ...source, particleColor: e.target.value + 'ff' };
                            updateConfig({ sources: newSources });
                          }}
                          className="w-full h-8 rounded border border-slate-600 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Model Scale: {source.modelScale.toFixed(2)}
                        </Label>
                        <Input
                          type="number"
                          value={source.modelScale}
                          onChange={(e) => {
                            const newSources = [...config.sources];
                            newSources[idx] = { ...source, modelScale: parseFloat(e.target.value) };
                            updateConfig({ sources: newSources });
                          }}
                          className="h-7 text-xs bg-slate-700/50"
                          step={0.01}
                          min={0.01}
                          max={1}
                        />
                      </div>

                      {/* Ground/Circuit Waypoints Display */}
                      {source.flightPattern?.groundWaypoints && (
                        <div className="space-y-2 pt-2 border-t border-slate-600/50">
                          <Label className="text-slate-300 text-xs font-medium">
                            Circuit Checkpoints ({source.flightPattern.groundWaypoints.length})
                          </Label>

                          {/* Show model path if specified */}
                          {source.flightPattern.modelPath && (
                            <div className="bg-slate-700/40 px-2 py-1.5 rounded">
                              <Label className="text-slate-400 text-[10px]">Model:</Label>
                              <p className="text-slate-300 text-[10px] font-mono break-all">
                                {source.flightPattern.modelPath.split('/').pop()}
                              </p>
                            </div>
                          )}

                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {source.flightPattern.groundWaypoints.map((waypoint: THREE.Vector3, wpIdx: number) => (
                              <div key={wpIdx} className="flex items-center justify-between bg-slate-700/30 px-2 py-1 rounded text-[10px]">
                                <span className="text-slate-300">Checkpoint {wpIdx + 1}</span>
                                <span className="text-slate-500 font-mono">
                                  ({waypoint.x.toFixed(1)}, {waypoint.y.toFixed(1)}, {waypoint.z.toFixed(1)})
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-slate-500 text-[10px] italic">
                            {source.id === 'mclaren-circuit'
                              ? 'McLaren F1 will circle the scene edge'
                              : 'Particles will follow this circuit at ground level'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== TAXI & STAGING - MANUAL (complex arrays + Vector3) ===== */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <button
                onClick={() => toggleSection('taxistaging')}
                className="w-full flex items-center gap-2 text-white text-sm font-semibold hover:text-blue-400 transition-colors"
              >
                {expandedSections.has('taxistaging') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                Taxi & Staging
              </button>

              {expandedSections.has('taxistaging') && (
                <div className="pl-4 space-y-3">
                  <Label className="text-slate-300 text-xs flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.taxiStaging.enabled}
                      onChange={(e) => updateNested('taxiStaging', { enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Enable Taxi & Staging
                  </Label>

                  {config.taxiStaging.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Ground Speed: {config.taxiStaging.groundSpeed.toFixed(1)} units/s
                        </Label>
                        <Input
                          type="number"
                          value={config.taxiStaging.groundSpeed}
                          onChange={(e) =>
                            updateNested('taxiStaging', { groundSpeed: parseFloat(e.target.value) })
                          }
                          className="h-7 text-xs bg-slate-700/50"
                          step={0.5}
                          min={1}
                          max={10}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Queue Spacing: {config.taxiStaging.queueSpacing.toFixed(1)} units
                        </Label>
                        <Input
                          type="number"
                          value={config.taxiStaging.queueSpacing}
                          onChange={(e) =>
                            updateNested('taxiStaging', { queueSpacing: parseFloat(e.target.value) })
                          }
                          className="h-7 text-xs bg-slate-700/50"
                          step={0.5}
                          min={2}
                          max={10}
                        />
                      </div>

                      {/* Generate Ground Circuit Button */}
                      <div className="space-y-2 pt-2 border-t border-slate-600/50">
                        <Label className="text-slate-300 text-xs font-medium">
                          Staging Zones ({config.taxiStaging.stagingZones.length})
                        </Label>

                        {config.taxiStaging.stagingZones.length < 5 && (
                          <Button
                            onClick={() => {
                              // Generate 6 staging zones in a circuit pattern
                              const radius = 45; // Distance from orbit center
                              const zones = [];
                              const purposes: Array<'loading' | 'preparation' | 'repair' | 'inspection'> =
                                ['loading', 'preparation', 'repair', 'inspection', 'loading', 'preparation'];

                              for (let i = 0; i < 6; i++) {
                                const angle = (i / 6) * Math.PI * 2;
                                const x = Math.cos(angle) * radius;
                                const z = Math.sin(angle) * radius;

                                zones.push({
                                  id: `staging-${i + 1}`,
                                  position: new THREE.Vector3(x, 0, z),
                                  capacity: i === 0 ? 2 : 1, // First zone has higher capacity
                                  waitTime: 2.0 + Math.random() * 2, // 2-4 seconds
                                  purpose: purposes[i]
                                });
                              }

                              updateNested('taxiStaging', { stagingZones: zones });
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs bg-blue-900/20 hover:bg-blue-900/40 border-blue-700/50"
                          >
                            Generate Ground Circuit (6 checkpoints)
                          </Button>
                        )}

                        {config.taxiStaging.stagingZones.length >= 5 && (
                          <div className="space-y-1">
                            {config.taxiStaging.stagingZones.map((zone, idx) => (
                              <div key={zone.id} className="flex items-center justify-between bg-slate-700/30 px-2 py-1 rounded text-[10px]">
                                <span className="text-slate-300">{zone.id}</span>
                                <span className="text-slate-500">{zone.purpose}</span>
                                <Button
                                  onClick={() => {
                                    const newZones = config.taxiStaging.stagingZones.filter((_, i) => i !== idx);
                                    updateNested('taxiStaging', { stagingZones: newZones });
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-red-400 hover:text-red-300"
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ===== ASSEMBLY & HEALTH - MANUAL (complex systems) ===== */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <button
                onClick={() => toggleSection('extended')}
                className="w-full flex items-center gap-2 text-white text-sm font-semibold hover:text-blue-400 transition-colors"
              >
                {expandedSections.has('extended') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                Extended Systems (Assembly & Health)
              </button>

              {expandedSections.has('extended') && (
                <div className="pl-4 space-y-3">
                  <Label className="text-slate-300 text-xs flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.assembly.enabled}
                      onChange={(e) => updateNested('assembly', { enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Enable Assembly System
                  </Label>

                  <Label className="text-slate-300 text-xs flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.health.enabled}
                      onChange={(e) => updateNested('health', { enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Enable Health System
                  </Label>

                  <p className="text-slate-500 text-[10px] italic">
                    Note: Full assembly & health controls coming soon
                  </p>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-3 border-t border-slate-700">
              <p className="text-slate-500 text-[10px] leading-relaxed">
                ✨ Schema-driven UI with runtime validation.
                <br />
                80%+ parameters auto-generated from Zod schemas.
                <br />
                {activePreset !== 'default' && `Active preset: ${PRESETS.find((p) => p.id === activePreset)?.name}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
