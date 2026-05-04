/**
 * V3 Enhanced Config Editor - Scalable Config Management
 *
 * Features:
 * - Side navigation with preset selection
 * - All config values editable
 * - Export/Import configuration
 * - Collapsible sections for scalability
 * - Live preview updates
 */

'use client';

import { useState } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Download, Upload, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import type { V3Config } from '../config/v3.config';
import { V3_CONFIG } from '../config/v3.config';

// Import presets
import { GENTLE_DRIFT_CONFIG } from '../config/presets/gentle-drift';
import { CHAOTIC_SWARM_CONFIG } from '../config/presets/chaotic-swarm';
import { SYNCHRONIZED_FORMATION_CONFIG } from '../config/presets/synchronized-formation';

interface V3ConfigEditorEnhancedProps {
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

export function V3ConfigEditorEnhanced({ config, onConfigChange }: V3ConfigEditorEnhancedProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activePreset, setActivePreset] = useState<PresetName>('default');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['scene', 'orbit'])
  );

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
      // Merge preset with base config
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

      onConfigChange(newConfig);
      setActivePreset(presetId);
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
    onConfigChange({ ...config, ...updates });
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

  const SectionHeader = ({ title, section }: { title: string; section: string }) => {
    const isExpanded = expandedSections.has(section);
    return (
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center gap-2 text-white text-sm font-semibold hover:text-blue-400 transition-colors"
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {title}
      </button>
    );
  };

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
              <p className="text-slate-400 text-xs">Live parameter tuning & preset management</p>
            </div>

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

            {/* Scene Settings */}
            <div className="space-y-3">
              <SectionHeader title="Scene Settings" section="scene" />
              {expandedSections.has('scene') && (
                <div className="pl-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Particle Count: {config.particleCount}
                    </Label>
                    <Slider
                      value={[config.particleCount]}
                      onValueChange={([val]) => updateConfig({ particleCount: val })}
                      min={10}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Orbit Settings */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Orbit Settings" section="orbit" />
              {expandedSections.has('orbit') && (
                <div className="pl-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Center X: {config.orbit.center.x.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.orbit.center.x]}
                      onValueChange={([val]) =>
                        updateNested('orbit', {
                          center: new THREE.Vector3(val, config.orbit.center.y, config.orbit.center.z),
                        })
                      }
                      min={-20}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Center Y (Height): {config.orbit.center.y.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.orbit.center.y]}
                      onValueChange={([val]) =>
                        updateNested('orbit', {
                          center: new THREE.Vector3(config.orbit.center.x, val, config.orbit.center.z),
                        })
                      }
                      min={5}
                      max={60}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Center Z: {config.orbit.center.z.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.orbit.center.z]}
                      onValueChange={([val]) =>
                        updateNested('orbit', {
                          center: new THREE.Vector3(config.orbit.center.x, config.orbit.center.y, val),
                        })
                      }
                      min={-20}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Orbit Radius: {config.orbit.radius.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.orbit.radius]}
                      onValueChange={([val]) => updateNested('orbit', { radius: val })}
                      min={10}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Nominal Speed: {config.orbit.nominalSpeed.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.orbit.nominalSpeed]}
                      onValueChange={([val]) => {
                        updateConfig({
                          orbit: { ...config.orbit, nominalSpeed: val },
                          physics: { ...config.physics, nominalOrbitSpeed: val },
                        });
                      }}
                      min={0.5}
                      max={30.0}
                      step={0.5}
                      className="w-full"
                    />
                    <p className="text-slate-500 text-[10px]">Units per second</p>
                  </div>
                </div>
              )}
            </div>

            {/* Physics Settings */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Physics" section="physics" />
              {expandedSections.has('physics') && (
                <div className="pl-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Donut Thickness: {config.physics.donutThickness.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.physics.donutThickness]}
                      onValueChange={([val]) => updateNested('physics', { donutThickness: val })}
                      min={2}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Gravitational Constant: {config.physics.gravitationalConstant.toFixed(0)}
                    </Label>
                    <Slider
                      value={[config.physics.gravitationalConstant]}
                      onValueChange={([val]) => updateNested('physics', { gravitationalConstant: val })}
                      min={10}
                      max={500}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Tangential Boost: {config.physics.tangentialBoost.toFixed(0)}
                    </Label>
                    <Slider
                      value={[config.physics.tangentialBoost]}
                      onValueChange={([val]) => updateNested('physics', { tangentialBoost: val })}
                      min={0}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                    <p className="text-slate-500 text-[10px]">Force to maintain speed</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Radial Confinement: {config.physics.radialConfinement.toFixed(0)}
                    </Label>
                    <Slider
                      value={[config.physics.radialConfinement]}
                      onValueChange={([val]) => updateNested('physics', { radialConfinement: val })}
                      min={0}
                      max={300}
                      step={10}
                      className="w-full"
                    />
                    <p className="text-slate-500 text-[10px]">Force keeping particles in donut</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Linear Damping: {(config.physics.dampingLinear * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[config.physics.dampingLinear]}
                      onValueChange={([val]) => updateNested('physics', { dampingLinear: val })}
                      min={0}
                      max={0.5}
                      step={0.01}
                      className="w-full"
                    />
                    <p className="text-slate-500 text-[10px]">Air resistance</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Angular Damping: {(config.physics.dampingAngular * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[config.physics.dampingAngular]}
                      onValueChange={([val]) => updateNested('physics', { dampingAngular: val })}
                      min={0}
                      max={0.5}
                      step={0.01}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Particle Mass: {config.physics.particleMass.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.physics.particleMass]}
                      onValueChange={([val]) => updateNested('physics', { particleMass: val })}
                      min={0.1}
                      max={5.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Collision Radius: {config.physics.collisionRadius.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.physics.collisionRadius]}
                      onValueChange={([val]) => updateNested('physics', { collisionRadius: val })}
                      min={0.5}
                      max={5.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Restitution (Bounciness): {(config.physics.restitution * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[config.physics.restitution]}
                      onValueChange={([val]) => updateNested('physics', { restitution: val })}
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Friction: {(config.physics.friction * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[config.physics.friction]}
                      onValueChange={([val]) => updateNested('physics', { friction: val })}
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sources */}
            {config.sources.map((source, idx) => (
              <div key={source.id} className="space-y-3 border-t border-slate-700 pt-3">
                <SectionHeader title={`Source: ${source.id}`} section={`source-${idx}`} />
                {expandedSections.has(`source-${idx}`) && (
                  <div className="pl-4 space-y-3">
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Gate Position X: {source.gatePosition.x.toFixed(1)}
                      </Label>
                      <Slider
                        value={[source.gatePosition.x]}
                        onValueChange={([val]) => {
                          const newSources = [...config.sources];
                          newSources[idx] = {
                            ...source,
                            gatePosition: new THREE.Vector3(val, source.gatePosition.y, source.gatePosition.z),
                          };
                          updateConfig({ sources: newSources });
                        }}
                        min={-60}
                        max={60}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Gate Position Y: {source.gatePosition.y.toFixed(1)}
                      </Label>
                      <Slider
                        value={[source.gatePosition.y]}
                        onValueChange={([val]) => {
                          const newSources = [...config.sources];
                          newSources[idx] = {
                            ...source,
                            gatePosition: new THREE.Vector3(source.gatePosition.x, val, source.gatePosition.z),
                          };
                          updateConfig({ sources: newSources });
                        }}
                        min={-10}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Gate Position Z: {source.gatePosition.z.toFixed(1)}
                      </Label>
                      <Slider
                        value={[source.gatePosition.z]}
                        onValueChange={([val]) => {
                          const newSources = [...config.sources];
                          newSources[idx] = {
                            ...source,
                            gatePosition: new THREE.Vector3(source.gatePosition.x, source.gatePosition.y, val),
                          };
                          updateConfig({ sources: newSources });
                        }}
                        min={-60}
                        max={60}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Spawn Rate: {source.spawnRate.toFixed(1)}s
                      </Label>
                      <Slider
                        value={[source.spawnRate]}
                        onValueChange={([val]) => {
                          const newSources = [...config.sources];
                          newSources[idx] = { ...source, spawnRate: val };
                          updateConfig({ sources: newSources });
                        }}
                        min={0.1}
                        max={5.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Orbit Entry Angle: {radToDeg(source.orbitEntryAngle).toFixed(0)}°
                      </Label>
                      <Slider
                        value={[radToDeg(source.orbitEntryAngle)]}
                        onValueChange={([val]) => {
                          const newSources = [...config.sources];
                          newSources[idx] = { ...source, orbitEntryAngle: degToRad(val) };
                          updateConfig({ sources: newSources });
                        }}
                        min={0}
                        max={360}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Model Scale: {source.modelScale.toFixed(2)}
                      </Label>
                      <Slider
                        value={[source.modelScale]}
                        onValueChange={([val]) => {
                          const newSources = [...config.sources];
                          newSources[idx] = { ...source, modelScale: val };
                          updateConfig({ sources: newSources });
                        }}
                        min={0.01}
                        max={1.0}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">Particle Color</Label>
                      <input
                        type="color"
                        value={source.particleColor}
                        onChange={(e) => {
                          const newSources = [...config.sources];
                          newSources[idx] = { ...source, particleColor: e.target.value };
                          updateConfig({ sources: newSources });
                        }}
                        className="w-full h-8 rounded border border-slate-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Blue Gate Settings */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Blue Gate Attraction" section="bluegate" />
              {expandedSections.has('bluegate') && (
                <div className="pl-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Gate Radius: {config.blueGate.radius.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.blueGate.radius]}
                      onValueChange={([val]) => updateNested('blueGate', { radius: val })}
                      min={2}
                      max={30}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2 border-t border-slate-600 pt-2">
                    <Label className="text-slate-300 text-xs flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.blueGate.entryAttraction.enabled}
                        onChange={(e) =>
                          updateNested('blueGate', {
                            entryAttraction: {
                              ...config.blueGate.entryAttraction,
                              enabled: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4"
                      />
                      Entry Attraction Enabled
                    </Label>
                  </div>

                  {config.blueGate.entryAttraction.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Entry Max Strength: {config.blueGate.entryAttraction.maxStrength.toFixed(1)}
                        </Label>
                        <Slider
                          value={[config.blueGate.entryAttraction.maxStrength]}
                          onValueChange={([val]) =>
                            updateNested('blueGate', {
                              entryAttraction: {
                                ...config.blueGate.entryAttraction,
                                maxStrength: val,
                              },
                            })
                          }
                          min={0}
                          max={10}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Entry Activation Progress: {(config.blueGate.entryAttraction.activationProgress * 100).toFixed(0)}%
                        </Label>
                        <Slider
                          value={[config.blueGate.entryAttraction.activationProgress]}
                          onValueChange={([val]) =>
                            updateNested('blueGate', {
                              entryAttraction: {
                                ...config.blueGate.entryAttraction,
                                activationProgress: val,
                              },
                            })
                          }
                          min={0}
                          max={1}
                          step={0.01}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Entry Falloff Power: {config.blueGate.entryAttraction.falloffPower.toFixed(1)}
                        </Label>
                        <Slider
                          value={[config.blueGate.entryAttraction.falloffPower]}
                          onValueChange={([val]) =>
                            updateNested('blueGate', {
                              entryAttraction: {
                                ...config.blueGate.entryAttraction,
                                falloffPower: val,
                              },
                            })
                          }
                          min={0.5}
                          max={5}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2 border-t border-slate-600 pt-2">
                    <Label className="text-slate-300 text-xs flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.blueGate.exitAttraction.enabled}
                        onChange={(e) =>
                          updateNested('blueGate', {
                            exitAttraction: {
                              ...config.blueGate.exitAttraction,
                              enabled: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4"
                      />
                      Exit Attraction Enabled
                    </Label>
                  </div>

                  {config.blueGate.exitAttraction.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Exit Max Strength: {config.blueGate.exitAttraction.maxStrength.toFixed(1)}
                        </Label>
                        <Slider
                          value={[config.blueGate.exitAttraction.maxStrength]}
                          onValueChange={([val]) =>
                            updateNested('blueGate', {
                              exitAttraction: {
                                ...config.blueGate.exitAttraction,
                                maxStrength: val,
                              },
                            })
                          }
                          min={0}
                          max={20}
                          step={0.5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Min Angle Traveled: {(config.blueGate.exitAttraction.minAngleTraveled / (Math.PI * 2)).toFixed(1)} orbits
                        </Label>
                        <Slider
                          value={[config.blueGate.exitAttraction.minAngleTraveled / (Math.PI * 2)]}
                          onValueChange={([val]) =>
                            updateNested('blueGate', {
                              exitAttraction: {
                                ...config.blueGate.exitAttraction,
                                minAngleTraveled: val * Math.PI * 2,
                              },
                            })
                          }
                          min={0.5}
                          max={5}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Min Time in Orbit: {config.blueGate.exitAttraction.minTimeInOrbit.toFixed(1)}s
                        </Label>
                        <Slider
                          value={[config.blueGate.exitAttraction.minTimeInOrbit]}
                          onValueChange={([val]) =>
                            updateNested('blueGate', {
                              exitAttraction: {
                                ...config.blueGate.exitAttraction,
                                minTimeInOrbit: val,
                              },
                            })
                          }
                          min={1}
                          max={30}
                          step={0.5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Exit Falloff Power: {config.blueGate.exitAttraction.falloffPower.toFixed(1)}
                        </Label>
                        <Slider
                          value={[config.blueGate.exitAttraction.falloffPower]}
                          onValueChange={([val]) =>
                            updateNested('blueGate', {
                              exitAttraction: {
                                ...config.blueGate.exitAttraction,
                                falloffPower: val,
                              },
                            })
                          }
                          min={0.5}
                          max={5}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Transition Blend Time: {config.blueGate.transitionBlendTime.toFixed(1)}s
                    </Label>
                    <Slider
                      value={[config.blueGate.transitionBlendTime]}
                      onValueChange={([val]) => updateNested('blueGate', { transitionBlendTime: val })}
                      min={0}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Exit Requirements */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Exit Requirements" section="exit" />
              {expandedSections.has('exit') && (
                <div className="pl-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Min Angle Traveled: {(config.exitRequirements.minAngleTraveled / (Math.PI * 2)).toFixed(1)} orbits
                    </Label>
                    <Slider
                      value={[config.exitRequirements.minAngleTraveled / (Math.PI * 2)]}
                      onValueChange={([val]) =>
                        updateNested('exitRequirements', { minAngleTraveled: val * Math.PI * 2 })
                      }
                      min={0.5}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Min Time in Orbit: {config.exitRequirements.minTimeInOrbit.toFixed(1)}s
                    </Label>
                    <Slider
                      value={[config.exitRequirements.minTimeInOrbit]}
                      onValueChange={([val]) => updateNested('exitRequirements', { minTimeInOrbit: val })}
                      min={1}
                      max={30}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Landing Transition */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Landing Transition (Orbit → Exit)" section="landingtransition" />
              {expandedSections.has('landingtransition') && (
                <div className="pl-4 space-y-3">
                  <p className="text-slate-400 text-[10px]">Smooth blend from orbit physics to landing curve</p>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Blend Duration: {config.landingTransition.blendDuration.toFixed(2)}s
                    </Label>
                    <Slider
                      value={[config.landingTransition.blendDuration]}
                      onValueChange={([val]) => updateNested('landingTransition', { blendDuration: val })}
                      min={0.1}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-slate-500 text-[10px]">Time to smoothly blend position (prevents warp)</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Capture Distance: {config.landingTransition.captureDistance.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.landingTransition.captureDistance]}
                      onValueChange={([val]) => updateNested('landingTransition', { captureDistance: val })}
                      min={3}
                      max={15}
                      step={0.5}
                      className="w-full"
                    />
                    <p className="text-slate-500 text-[10px]">Distance to gate to trigger landing phase</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Position Blend Mode</Label>
                    <select
                      value={config.landingTransition.positionBlendMode}
                      onChange={(e) =>
                        updateNested('landingTransition', { positionBlendMode: e.target.value as 'lerp' | 'physics' })
                      }
                      className="w-full bg-slate-800 text-white text-xs p-2 rounded border border-slate-600"
                    >
                      <option value="lerp">Lerp (Smooth)</option>
                      <option value="physics">Physics (Natural)</option>
                    </select>
                    <p className="text-slate-500 text-[10px]">How position transitions from orbit to curve</p>
                  </div>

                  <div className="border-t border-slate-600 pt-3 space-y-3">
                    <h5 className="text-slate-300 text-xs font-semibold">Pre-Landing Zone</h5>
                    <p className="text-slate-400 text-[10px]">Gradual slowdown BEFORE reaching gate (prevents sudden warp)</p>

                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Pre-Landing Distance: {config.landingTransition.preLandingDistance.toFixed(1)}
                      </Label>
                      <Slider
                        value={[config.landingTransition.preLandingDistance]}
                        onValueChange={([val]) => updateNested('landingTransition', { preLandingDistance: val })}
                        min={8}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-slate-500 text-[10px]">Distance to start slowing down (must be greater than capture distance)</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Pre-Landing Slowdown: {(config.landingTransition.preLandingSlowdown * 100).toFixed(0)}%
                      </Label>
                      <Slider
                        value={[config.landingTransition.preLandingSlowdown]}
                        onValueChange={([val]) => updateNested('landingTransition', { preLandingSlowdown: val })}
                        min={0}
                        max={0.8}
                        step={0.05}
                        className="w-full"
                      />
                      <p className="text-slate-500 text-[10px]">Speed reduction during pre-landing (0% = no slowdown, 80% = very slow)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Wave (3D Orbit) */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="3D Orbit (Vertical Wave)" section="verticalwave" />
              {expandedSections.has('verticalwave') && (
                <div className="pl-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.verticalWave.enabled}
                        onChange={(e) => updateNested('verticalWave', { enabled: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Enable Vertical Wave
                    </Label>
                  </div>

                  {config.verticalWave.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Amplitude: {(config.verticalWave.amplitudeMultiplier * 100).toFixed(0)}%
                        </Label>
                        <Slider
                          value={[config.verticalWave.amplitudeMultiplier]}
                          onValueChange={([val]) =>
                            updateNested('verticalWave', { amplitudeMultiplier: val })
                          }
                          min={0}
                          max={1}
                          step={0.05}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Frequency: {config.verticalWave.frequency.toFixed(1)} waves/orbit
                        </Label>
                        <Slider
                          value={[config.verticalWave.frequency]}
                          onValueChange={([val]) => updateNested('verticalWave', { frequency: val })}
                          min={0}
                          max={10}
                          step={0.5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Spring Constant: {config.verticalWave.springConstant.toFixed(1)}
                        </Label>
                        <Slider
                          value={[config.verticalWave.springConstant]}
                          onValueChange={([val]) => updateNested('verticalWave', { springConstant: val })}
                          min={0}
                          max={20}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Orientation */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Orientation" section="orientation" />
              {expandedSections.has('orientation') && (
                <div className="pl-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Mode</Label>
                    <select
                      value={config.orientation.mode}
                      onChange={(e) =>
                        updateNested('orientation', { mode: e.target.value as any })
                      }
                      className="w-full bg-slate-800 text-white text-xs p-2 rounded border border-slate-600"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="tangent">Tangent (Face Velocity)</option>
                      <option value="radial">Radial</option>
                      <option value="banking">Banking</option>
                      <option value="combo">Combo</option>
                      <option value="tumble">Tumble</option>
                    </select>
                  </div>

                  {(config.orientation.mode === 'tangent' || config.orientation.mode === 'combo') && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Tangent Smoothing: {(config.orientation.tangentSmoothing * 100).toFixed(0)}%
                      </Label>
                      <Slider
                        value={[config.orientation.tangentSmoothing]}
                        onValueChange={([val]) => updateNested('orientation', { tangentSmoothing: val })}
                        min={0}
                        max={0.95}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                  )}

                  {config.orientation.mode === 'combo' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Bank Multiplier: {config.orientation.bankMultiplier.toFixed(1)}x
                        </Label>
                        <Slider
                          value={[config.orientation.bankMultiplier]}
                          onValueChange={([val]) => updateNested('orientation', { bankMultiplier: val })}
                          min={0}
                          max={3}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Max Bank Angle: {config.orientation.maxBankAngle.toFixed(0)}°
                        </Label>
                        <Slider
                          value={[config.orientation.maxBankAngle]}
                          onValueChange={([val]) => updateNested('orientation', { maxBankAngle: val })}
                          min={0}
                          max={90}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Model Orientation */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Model Orientation" section="modelorientation" />
              {expandedSections.has('modelorientation') && (
                <div className="pl-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Scale: {config.modelOrientation.scale.toFixed(2)}
                    </Label>
                    <Slider
                      value={[config.modelOrientation.scale]}
                      onValueChange={([val]) => updateNested('modelOrientation', { scale: val })}
                      min={0.1}
                      max={2}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Rotation X (Pitch): {radToDeg(config.modelOrientation.rotationX).toFixed(0)}°
                    </Label>
                    <Slider
                      value={[radToDeg(config.modelOrientation.rotationX)]}
                      onValueChange={([val]) => updateNested('modelOrientation', { rotationX: degToRad(val) })}
                      min={0}
                      max={360}
                      step={15}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Rotation Y (Yaw): {radToDeg(config.modelOrientation.rotationY).toFixed(0)}°
                    </Label>
                    <Slider
                      value={[radToDeg(config.modelOrientation.rotationY)]}
                      onValueChange={([val]) => updateNested('modelOrientation', { rotationY: degToRad(val) })}
                      min={0}
                      max={360}
                      step={15}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Rotation Z (Roll): {radToDeg(config.modelOrientation.rotationZ).toFixed(0)}°
                    </Label>
                    <Slider
                      value={[radToDeg(config.modelOrientation.rotationZ)]}
                      onValueChange={([val]) => updateNested('modelOrientation', { rotationZ: degToRad(val) })}
                      min={0}
                      max={360}
                      step={15}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Collision */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Collision Avoidance" section="collision" />
              {expandedSections.has('collision') && (
                <div className="pl-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.collision.enabled}
                        onChange={(e) => updateNested('collision', { enabled: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Enable Collision Repulsion
                    </Label>
                  </div>

                  {config.collision.enabled && (
                    <>
                      {/* Shape Selector */}
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">Collision Shape</Label>
                        <select
                          value={config.collision.shape}
                          onChange={(e) => updateNested('collision', {
                            shape: e.target.value as 'sphere' | 'ellipsoid' | 'squircle' | 'box'
                          })}
                          className="w-full h-6 px-2 text-xs bg-slate-700 text-white rounded border border-slate-600"
                        >
                          <option value="sphere">Sphere (Legacy)</option>
                          <option value="ellipsoid">Ellipsoid (Stretched)</option>
                          <option value="squircle">Squircle (Soft Corners)</option>
                          <option value="box">Box (Sharp Corners)</option>
                        </select>
                      </div>

                      {/* Dimensions */}
                      <div className="border-t border-slate-600 pt-2 space-y-2">
                        <Label className="text-slate-300 text-xs font-semibold">Dimensions</Label>

                        <div>
                          <Label className="text-slate-400 text-xs">
                            Width (X): {config.collision.dimensions.width.toFixed(1)}
                          </Label>
                          <Slider
                            value={[config.collision.dimensions.width]}
                            onValueChange={([val]) => updateNested('collision', {
                              dimensions: { ...config.collision.dimensions, width: val }
                            })}
                            min={1}
                            max={10}
                            step={0.5}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <Label className="text-slate-400 text-xs">
                            Height (Y): {config.collision.dimensions.height.toFixed(1)}
                          </Label>
                          <Slider
                            value={[config.collision.dimensions.height]}
                            onValueChange={([val]) => updateNested('collision', {
                              dimensions: { ...config.collision.dimensions, height: val }
                            })}
                            min={1}
                            max={10}
                            step={0.5}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <Label className="text-slate-400 text-xs">
                            Depth (Z): {config.collision.dimensions.depth.toFixed(1)}
                          </Label>
                          <Slider
                            value={[config.collision.dimensions.depth]}
                            onValueChange={([val]) => updateNested('collision', {
                              dimensions: { ...config.collision.dimensions, depth: val }
                            })}
                            min={1}
                            max={10}
                            step={0.5}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Offset Controls */}
                      <div className="border-t border-slate-600 pt-2 space-y-2">
                        <Label className="text-slate-300 text-xs font-semibold">Offset</Label>

                        <div>
                          <Label className="text-slate-400 text-xs">
                            X Offset: {config.collision.offset.x.toFixed(1)}
                          </Label>
                          <Slider
                            value={[config.collision.offset.x]}
                            onValueChange={([val]) => updateNested('collision', {
                              offset: { ...config.collision.offset, x: val }
                            })}
                            min={-5}
                            max={5}
                            step={0.1}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <Label className="text-slate-400 text-xs">
                            Y Offset: {config.collision.offset.y.toFixed(1)}
                          </Label>
                          <Slider
                            value={[config.collision.offset.y]}
                            onValueChange={([val]) => updateNested('collision', {
                              offset: { ...config.collision.offset, y: val }
                            })}
                            min={-5}
                            max={5}
                            step={0.1}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <Label className="text-slate-400 text-xs">
                            Z Offset: {config.collision.offset.z.toFixed(1)}
                          </Label>
                          <Slider
                            value={[config.collision.offset.z]}
                            onValueChange={([val]) => updateNested('collision', {
                              offset: { ...config.collision.offset, z: val }
                            })}
                            min={-5}
                            max={5}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Squircle Exponent (only shown when shape = squircle) */}
                      {config.collision.shape === 'squircle' && (
                        <div className="space-y-2 border-t border-slate-600 pt-2">
                          <Label className="text-slate-400 text-xs">
                            Corner Sharpness: {(config.collision.squircleExponent ?? 4).toFixed(1)}
                          </Label>
                          <Slider
                            value={[config.collision.squircleExponent ?? 4]}
                            onValueChange={([val]) => updateNested('collision', {
                              squircleExponent: val
                            })}
                            min={2}
                            max={12}
                            step={0.5}
                            className="w-full"
                          />
                          <p className="text-slate-500 text-[10px]">
                            2 = ellipse, 4 = squircle, 8+ = box
                          </p>
                        </div>
                      )}

                      {/* Strength and Damping */}
                      <div className="border-t border-slate-600 pt-2 space-y-2">
                        <Label className="text-slate-300 text-xs font-semibold">Force Parameters</Label>

                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">
                            Strength: {config.collision.strength.toFixed(1)}
                          </Label>
                          <Slider
                            value={[config.collision.strength]}
                            onValueChange={([val]) => updateNested('collision', { strength: val })}
                            min={0}
                            max={20}
                            step={0.5}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">
                            Damping: {(config.collision.damping * 100).toFixed(0)}%
                          </Label>
                          <Slider
                            value={[config.collision.damping]}
                            onValueChange={([val]) => updateNested('collision', { damping: val })}
                            min={0}
                            max={1}
                            step={0.05}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Soft Guidance */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Soft Guidance (Advanced)" section="softguidance" />
              {expandedSections.has('softguidance') && (
                <div className="pl-4 space-y-3">
                  <p className="text-slate-400 text-[10px]">Gentle forces instead of hard rules for natural motion</p>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.softGuidance.enabled}
                        onChange={(e) => updateNested('softGuidance', { enabled: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Enable Soft Guidance
                    </Label>
                  </div>

                  {config.softGuidance.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Speed Variation Tolerance: {(config.softGuidance.speedVariationTolerance * 100).toFixed(0)}%
                        </Label>
                        <Slider
                          value={[config.softGuidance.speedVariationTolerance]}
                          onValueChange={([val]) => updateNested('softGuidance', { speedVariationTolerance: val })}
                          min={0}
                          max={0.3}
                          step={0.05}
                          className="w-full"
                        />
                        <p className="text-slate-500 text-[10px]">How much speed can vary from nominal (0-30%)</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Vertical Softness: {(config.softGuidance.verticalSoftness * 100).toFixed(0)}%
                        </Label>
                        <Slider
                          value={[config.softGuidance.verticalSoftness]}
                          onValueChange={([val]) => updateNested('softGuidance', { verticalSoftness: val })}
                          min={0}
                          max={1}
                          step={0.05}
                          className="w-full"
                        />
                        <p className="text-slate-500 text-[10px]">How loosely particles follow wave pattern (0% = strict, 100% = free)</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Radial Comfort Zone: {(config.softGuidance.radialComfortZone * 100).toFixed(0)}%
                        </Label>
                        <Slider
                          value={[config.softGuidance.radialComfortZone]}
                          onValueChange={([val]) => updateNested('softGuidance', { radialComfortZone: val })}
                          min={0}
                          max={0.5}
                          step={0.05}
                          className="w-full"
                        />
                        <p className="text-slate-500 text-[10px]">Portion of donut with no correction (0-50%)</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.softGuidance.individualVariation}
                            onChange={(e) => updateNested('softGuidance', { individualVariation: e.target.checked })}
                            className="w-4 h-4"
                          />
                          Individual Variation
                        </Label>
                        <p className="text-slate-500 text-[10px]">Give each particle unique behavior preferences</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Trajectory Settings */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Trajectory Curves" section="trajectory" />
              {expandedSections.has('trajectory') && (
                <div className="pl-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Curve Tension: {config.trajectorySettings.curveTension.toFixed(2)}
                    </Label>
                    <Slider
                      value={[config.trajectorySettings.curveTension]}
                      onValueChange={([val]) => updateNested('trajectorySettings', { curveTension: val })}
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Midpoint Height: {config.trajectorySettings.midpointHeightMultiplier.toFixed(1)}x
                    </Label>
                    <Slider
                      value={[config.trajectorySettings.midpointHeightMultiplier]}
                      onValueChange={([val]) =>
                        updateNested('trajectorySettings', { midpointHeightMultiplier: val })
                      }
                      min={0.2}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Approach Angle: {config.trajectorySettings.approachAngle.toFixed(0)}°
                    </Label>
                    <Slider
                      value={[config.trajectorySettings.approachAngle]}
                      onValueChange={([val]) => updateNested('trajectorySettings', { approachAngle: val })}
                      min={0}
                      max={90}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Landing Speed: {(config.trajectorySettings.landingSpeed * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[config.trajectorySettings.landingSpeed]}
                      onValueChange={([val]) => updateNested('trajectorySettings', { landingSpeed: val })}
                      min={0.1}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">
                      Pre-Orbit Distance: {config.trajectorySettings.preOrbitDistance.toFixed(1)}
                    </Label>
                    <Slider
                      value={[config.trajectorySettings.preOrbitDistance]}
                      onValueChange={([val]) => updateNested('trajectorySettings', { preOrbitDistance: val })}
                      min={3}
                      max={30}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="border-t border-slate-600 pt-2 space-y-3">
                    <h5 className="text-slate-300 text-xs font-semibold">Exit Path</h5>

                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Exit Curve Tension: {config.trajectorySettings.exitCurveTension.toFixed(2)}
                      </Label>
                      <Slider
                        value={[config.trajectorySettings.exitCurveTension]}
                        onValueChange={([val]) => updateNested('trajectorySettings', { exitCurveTension: val })}
                        min={0}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Exit Midpoint Height: {config.trajectorySettings.exitMidpointHeightMultiplier.toFixed(1)}x
                      </Label>
                      <Slider
                        value={[config.trajectorySettings.exitMidpointHeightMultiplier]}
                        onValueChange={([val]) =>
                          updateNested('trajectorySettings', { exitMidpointHeightMultiplier: val })
                        }
                        min={0.2}
                        max={3}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Exit Pre-Orbit Distance: {config.trajectorySettings.exitPreOrbitDistance.toFixed(1)}
                      </Label>
                      <Slider
                        value={[config.trajectorySettings.exitPreOrbitDistance]}
                        onValueChange={([val]) =>
                          updateNested('trajectorySettings', { exitPreOrbitDistance: val })
                        }
                        min={3}
                        max={30}
                        step={0.5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Exit Landing Speed: {(config.trajectorySettings.exitLandingSpeed * 100).toFixed(0)}%
                      </Label>
                      <Slider
                        value={[config.trajectorySettings.exitLandingSpeed]}
                        onValueChange={([val]) =>
                          updateNested('trajectorySettings', { exitLandingSpeed: val })
                        }
                        min={0.1}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Debug Visuals */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Debug Visuals" section="debug" />
              {expandedSections.has('debug') && (
                <div className="pl-4 space-y-2">
                  {Object.entries(config.debug).map(([key, value]) => (
                    <Label key={key} className="text-slate-300 text-xs flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) => updateNested('debug', { [key]: e.target.checked })}
                        className="w-4 h-4"
                      />
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                  ))}
                </div>
              )}
            </div>

            {/* Taxi & Staging */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Taxi & Staging" section="taxistaging" />
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
                          Ground Speed: {config.taxiStaging.groundSpeed.toFixed(1)}
                        </Label>
                        <Slider
                          value={[config.taxiStaging.groundSpeed]}
                          onValueChange={([val]) => updateNested('taxiStaging', { groundSpeed: val })}
                          min={1}
                          max={10}
                          step={0.5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Queue Spacing: {config.taxiStaging.queueSpacing.toFixed(1)}
                        </Label>
                        <Slider
                          value={[config.taxiStaging.queueSpacing]}
                          onValueChange={([val]) => updateNested('taxiStaging', { queueSpacing: val })}
                          min={2}
                          max={10}
                          step={0.5}
                          className="w-full"
                        />
                      </div>

                      {/* Staging Zones Management */}
                      <div className="border-t border-slate-600 pt-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-300 text-xs font-semibold">
                            Staging Zones ({config.taxiStaging.stagingZones.length})
                          </Label>
                          <Button
                            onClick={() => {
                              const newZones = [
                                ...config.taxiStaging.stagingZones,
                                {
                                  id: `staging-${Date.now()}`,
                                  position: new THREE.Vector3(0, 0, 0),
                                  capacity: 5,
                                  waitTime: 3.0,
                                  purpose: 'loading' as const,
                                },
                              ];
                              updateNested('taxiStaging', { stagingZones: newZones });
                            }}
                            className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                          >
                            + Add Zone
                          </Button>
                        </div>

                        {config.taxiStaging.stagingZones.map((zone, zoneIndex) => (
                          <div
                            key={zone.id}
                            className="bg-slate-800 rounded p-3 space-y-2 border border-slate-600"
                          >
                            <div className="flex items-center justify-between">
                              <Label className="text-slate-200 text-xs font-semibold">
                                {zone.id}
                              </Label>
                              <Button
                                onClick={() => {
                                  const newZones = config.taxiStaging.stagingZones.filter(
                                    (_, i) => i !== zoneIndex
                                  );
                                  updateNested('taxiStaging', { stagingZones: newZones });
                                }}
                                className="h-5 px-2 text-xs bg-red-600 hover:bg-red-700"
                              >
                                Remove
                              </Button>
                            </div>

                            {/* Position Controls */}
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-slate-400 text-[10px]">
                                  X: {zone.position.x.toFixed(1)}
                                </Label>
                                <input
                                  type="number"
                                  value={zone.position.x}
                                  onChange={(e) => {
                                    const newZones = [...config.taxiStaging.stagingZones];
                                    newZones[zoneIndex] = {
                                      ...newZones[zoneIndex],
                                      position: new THREE.Vector3(
                                        parseFloat(e.target.value) || 0,
                                        zone.position.y,
                                        zone.position.z
                                      ),
                                    };
                                    updateNested('taxiStaging', { stagingZones: newZones });
                                  }}
                                  className="w-full h-6 px-2 text-xs bg-slate-700 text-white rounded"
                                  step="1"
                                />
                              </div>
                              <div>
                                <Label className="text-slate-400 text-[10px]">
                                  Y: {zone.position.y.toFixed(1)}
                                </Label>
                                <input
                                  type="number"
                                  value={zone.position.y}
                                  onChange={(e) => {
                                    const newZones = [...config.taxiStaging.stagingZones];
                                    newZones[zoneIndex] = {
                                      ...newZones[zoneIndex],
                                      position: new THREE.Vector3(
                                        zone.position.x,
                                        parseFloat(e.target.value) || 0,
                                        zone.position.z
                                      ),
                                    };
                                    updateNested('taxiStaging', { stagingZones: newZones });
                                  }}
                                  className="w-full h-6 px-2 text-xs bg-slate-700 text-white rounded"
                                  step="1"
                                />
                              </div>
                              <div>
                                <Label className="text-slate-400 text-[10px]">
                                  Z: {zone.position.z.toFixed(1)}
                                </Label>
                                <input
                                  type="number"
                                  value={zone.position.z}
                                  onChange={(e) => {
                                    const newZones = [...config.taxiStaging.stagingZones];
                                    newZones[zoneIndex] = {
                                      ...newZones[zoneIndex],
                                      position: new THREE.Vector3(
                                        zone.position.x,
                                        zone.position.y,
                                        parseFloat(e.target.value) || 0
                                      ),
                                    };
                                    updateNested('taxiStaging', { stagingZones: newZones });
                                  }}
                                  className="w-full h-6 px-2 text-xs bg-slate-700 text-white rounded"
                                  step="1"
                                />
                              </div>
                            </div>

                            {/* Capacity */}
                            <div>
                              <Label className="text-slate-400 text-[10px]">
                                Capacity: {zone.capacity}
                              </Label>
                              <Slider
                                value={[zone.capacity]}
                                onValueChange={([val]) => {
                                  const newZones = [...config.taxiStaging.stagingZones];
                                  newZones[zoneIndex] = { ...newZones[zoneIndex], capacity: val };
                                  updateNested('taxiStaging', { stagingZones: newZones });
                                }}
                                min={1}
                                max={20}
                                step={1}
                                className="w-full"
                              />
                            </div>

                            {/* Wait Time */}
                            <div>
                              <Label className="text-slate-400 text-[10px]">
                                Wait Time: {zone.waitTime.toFixed(1)}s
                              </Label>
                              <Slider
                                value={[zone.waitTime]}
                                onValueChange={([val]) => {
                                  const newZones = [...config.taxiStaging.stagingZones];
                                  newZones[zoneIndex] = { ...newZones[zoneIndex], waitTime: val };
                                  updateNested('taxiStaging', { stagingZones: newZones });
                                }}
                                min={0.5}
                                max={10}
                                step={0.5}
                                className="w-full"
                              />
                            </div>

                            {/* Purpose */}
                            <div>
                              <Label className="text-slate-400 text-[10px]">Purpose</Label>
                              <select
                                value={zone.purpose}
                                onChange={(e) => {
                                  const newZones = [...config.taxiStaging.stagingZones];
                                  newZones[zoneIndex] = {
                                    ...newZones[zoneIndex],
                                    purpose: e.target.value as 'loading' | 'preparation' | 'repair' | 'inspection',
                                  };
                                  updateNested('taxiStaging', { stagingZones: newZones });
                                }}
                                className="w-full h-6 px-2 text-xs bg-slate-700 text-white rounded"
                              >
                                <option value="loading">Loading</option>
                                <option value="preparation">Preparation</option>
                                <option value="repair">Repair</option>
                                <option value="inspection">Inspection</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Assembly Progression */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Assembly Progression" section="assembly" />
              {expandedSections.has('assembly') && (
                <div className="pl-4 space-y-3">
                  <Label className="text-slate-300 text-xs flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.assembly.enabled}
                      onChange={(e) => updateNested('assembly', { enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Enable Assembly Steps
                  </Label>

                  {config.assembly.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Max Steps: {config.assembly.maxSteps}
                        </Label>
                        <Slider
                          value={[config.assembly.maxSteps]}
                          onValueChange={([val]) => updateNested('assembly', { maxSteps: val })}
                          min={3}
                          max={20}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Advancement Mode */}
                      <div className="space-y-2">
                        <Label className="text-slate-400 text-xs">Advancement Mode</Label>
                        <select
                          value={config.assembly.advancementMode}
                          onChange={(e) => updateNested('assembly', {
                            advancementMode: e.target.value as 'time' | 'location' | 'orbit' | 'manual'
                          })}
                          className="w-full h-6 px-2 text-xs bg-slate-700 text-white rounded"
                        >
                          <option value="time">Time-based</option>
                          <option value="orbit">Orbit-based</option>
                          <option value="location">Location-based</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Time Per Step: {config.assembly.timePerStep.toFixed(1)}s
                        </Label>
                        <Slider
                          value={[config.assembly.timePerStep]}
                          onValueChange={([val]) => updateNested('assembly', { timePerStep: val })}
                          min={1}
                          max={20}
                          step={0.5}
                          className="w-full"
                        />
                      </div>

                      {/* Orbits Per Step (if orbit mode) */}
                      {config.assembly.advancementMode === 'orbit' && (
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-xs">
                            Orbits Per Step: {config.assembly.orbitsPerStep.toFixed(1)}
                          </Label>
                          <Slider
                            value={[config.assembly.orbitsPerStep]}
                            onValueChange={([val]) => updateNested('assembly', { orbitsPerStep: val })}
                            min={0.5}
                            max={5}
                            step={0.5}
                            className="w-full"
                          />
                        </div>
                      )}

                      {/* Visual Settings */}
                      <div className="border-t border-slate-600 pt-3 space-y-3">
                        <h5 className="text-slate-300 text-xs font-semibold">Visual Settings</h5>

                        {/* Visual Mode */}
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">Visual Mode</Label>
                          <select
                            value={config.assembly.visual.mode}
                            onChange={(e) => updateNested('assembly', {
                              visual: { ...config.assembly.visual, mode: e.target.value as 'color' | 'scale' | 'glow' | 'combined' }
                            })}
                            className="w-full h-6 px-2 text-xs bg-slate-700 text-white rounded"
                          >
                            <option value="color">Color Only</option>
                            <option value="scale">Scale Only</option>
                            <option value="glow">Glow Only</option>
                            <option value="combined">Combined</option>
                          </select>
                        </div>

                        {/* Scale Start/End */}
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">
                            Scale Start: {config.assembly.visual.scaleStart.toFixed(2)}
                          </Label>
                          <Slider
                            value={[config.assembly.visual.scaleStart]}
                            onValueChange={([val]) => updateNested('assembly', {
                              visual: { ...config.assembly.visual, scaleStart: val }
                            })}
                            min={0.1}
                            max={2}
                            step={0.1}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">
                            Scale End: {config.assembly.visual.scaleEnd.toFixed(2)}
                          </Label>
                          <Slider
                            value={[config.assembly.visual.scaleEnd]}
                            onValueChange={([val]) => updateNested('assembly', {
                              visual: { ...config.assembly.visual, scaleEnd: val }
                            })}
                            min={0.1}
                            max={2}
                            step={0.1}
                            className="w-full"
                          />
                        </div>

                        {/* Glow Intensity */}
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">
                            Glow Intensity: {config.assembly.visual.glowIntensity.toFixed(2)}
                          </Label>
                          <Slider
                            value={[config.assembly.visual.glowIntensity]}
                            onValueChange={([val]) => updateNested('assembly', {
                              visual: { ...config.assembly.visual, glowIntensity: val }
                            })}
                            min={0}
                            max={2}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Health System */}
            <div className="space-y-3 border-t border-slate-700 pt-3">
              <SectionHeader title="Health System" section="health" />
              {expandedSections.has('health') && (
                <div className="pl-4 space-y-3">
                  <Label className="text-slate-300 text-xs flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.health.enabled}
                      onChange={(e) => updateNested('health', { enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Enable Health System
                  </Label>

                  {config.health.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Starting Health: {config.health.startingHealth}
                        </Label>
                        <Slider
                          value={[config.health.startingHealth]}
                          onValueChange={([val]) => updateNested('health', { startingHealth: val })}
                          min={50}
                          max={200}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      {/* Damage Section */}
                      <div className="border-t border-slate-600 pt-3 space-y-3">
                        <h5 className="text-slate-300 text-xs font-semibold">Damage Settings</h5>

                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">
                            Decay Rate: {config.health.damage.decayRate.toFixed(1)} HP/s
                          </Label>
                          <Slider
                            value={[config.health.damage.decayRate]}
                            onValueChange={([val]) =>
                              updateNested('health', {
                                damage: { ...config.health.damage, decayRate: val }
                              })
                            }
                            min={0}
                            max={5}
                            step={0.1}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">
                            Collision Damage: {config.health.damage.collisionDamage} HP
                          </Label>
                          <Slider
                            value={[config.health.damage.collisionDamage]}
                            onValueChange={([val]) =>
                              updateNested('health', {
                                damage: { ...config.health.damage, collisionDamage: val }
                              })
                            }
                            min={0}
                            max={50}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">
                            Environmental Damage: {config.health.damage.environmentalDamage} HP
                          </Label>
                          <Slider
                            value={[config.health.damage.environmentalDamage]}
                            onValueChange={([val]) =>
                              updateNested('health', {
                                damage: { ...config.health.damage, environmentalDamage: val }
                              })
                            }
                            min={0}
                            max={50}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">
                            Overcrowding Damage: {config.health.damage.overcrowdingDamage.toFixed(1)} HP/s
                          </Label>
                          <Slider
                            value={[config.health.damage.overcrowdingDamage]}
                            onValueChange={([val]) =>
                              updateNested('health', {
                                damage: { ...config.health.damage, overcrowdingDamage: val }
                              })
                            }
                            min={0}
                            max={10}
                            step={0.5}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">
                            Overcrowding Distance: {config.health.damage.overcrowdingDistance.toFixed(1)}
                          </Label>
                          <Slider
                            value={[config.health.damage.overcrowdingDistance]}
                            onValueChange={([val]) =>
                              updateNested('health', {
                                damage: { ...config.health.damage, overcrowdingDistance: val }
                              })
                            }
                            min={1}
                            max={20}
                            step={0.5}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Regeneration Section */}
                      <div className="border-t border-slate-600 pt-3 space-y-3">
                        <Label className="text-slate-300 text-xs flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.health.regeneration.enabled}
                            onChange={(e) =>
                              updateNested('health', {
                                regeneration: { ...config.health.regeneration, enabled: e.target.checked }
                              })
                            }
                            className="w-4 h-4"
                          />
                          Enable Regeneration
                        </Label>

                        {config.health.regeneration.enabled && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-slate-400 text-xs">
                                Staging Regen: {config.health.regeneration.stagingRegen.toFixed(1)} HP/s
                              </Label>
                              <Slider
                                value={[config.health.regeneration.stagingRegen]}
                                onValueChange={([val]) =>
                                  updateNested('health', {
                                    regeneration: { ...config.health.regeneration, stagingRegen: val }
                                  })
                                }
                                min={0}
                                max={50}
                                step={1}
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-slate-400 text-xs">
                                Repair Zone Regen: {config.health.regeneration.repairZoneRegen.toFixed(1)} HP/s
                              </Label>
                              <Slider
                                value={[config.health.regeneration.repairZoneRegen]}
                                onValueChange={([val]) =>
                                  updateNested('health', {
                                    regeneration: { ...config.health.regeneration, repairZoneRegen: val }
                                  })
                                }
                                min={0}
                                max={50}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Death Behavior Section */}
                      <div className="border-t border-slate-600 pt-3 space-y-3">
                        <h5 className="text-slate-300 text-xs font-semibold">Death Behavior</h5>

                        <div className="space-y-2">
                          <Label className="text-slate-400 text-xs">Death Behavior</Label>
                          <select
                            value={config.health.death.behavior}
                            onChange={(e) =>
                              updateNested('health', {
                                death: { ...config.health.death, behavior: e.target.value as 'remove' | 'respawn' | 'fade' }
                              })
                            }
                            className="w-full h-6 px-2 text-xs bg-slate-700 text-white rounded"
                          >
                            <option value="remove">Remove</option>
                            <option value="respawn">Respawn</option>
                            <option value="fade">Fade</option>
                          </select>
                        </div>

                        {config.health.death.behavior === 'respawn' && (
                          <div className="space-y-2">
                            <Label className="text-slate-400 text-xs">
                              Respawn Delay: {config.health.death.respawnDelay.toFixed(1)}s
                            </Label>
                            <Slider
                              value={[config.health.death.respawnDelay]}
                              onValueChange={([val]) =>
                                updateNested('health', {
                                  death: { ...config.health.death, respawnDelay: val }
                                })
                              }
                              min={0}
                              max={30}
                              step={0.5}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>

                      {/* Visual Settings Section */}
                      <div className="border-t border-slate-600 pt-3 space-y-3">
                        <h5 className="text-slate-300 text-xs font-semibold">Visual Settings</h5>

                        <Label className="text-slate-400 text-xs flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.health.visual.colorHealthIndicator}
                            onChange={(e) =>
                              updateNested('health', {
                                visual: { ...config.health.visual, colorHealthIndicator: e.target.checked }
                              })
                            }
                            className="w-4 h-4"
                          />
                          Color Health Indicator
                        </Label>

                        <Label className="text-slate-400 text-xs flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.health.visual.particleEffects}
                            onChange={(e) =>
                              updateNested('health', {
                                visual: { ...config.health.visual, particleEffects: e.target.checked }
                              })
                            }
                            className="w-4 h-4"
                          />
                          Particle Effects (smoke/sparks)
                        </Label>

                        <Label className="text-slate-400 text-xs flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.health.visual.healthBars}
                            onChange={(e) =>
                              updateNested('health', {
                                visual: { ...config.health.visual, healthBars: e.target.checked }
                              })
                            }
                            className="w-4 h-4"
                          />
                          Health Bars (debug)
                        </Label>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
