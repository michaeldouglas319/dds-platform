/**
 * Comprehensive Configuration Editor
 *
 * Exposes ALL tunable parameters with auto/manual toggles.
 * Real-time editing, JSON import/export, organized sections.
 */

'use client';

import { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Upload,
  RotateCcw,
  Play,
  Pause,
  Eye,
  EyeOff,
  Settings,
  Sliders,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import * as THREE from 'three';
import type { DevTunableConfig, TunableSourceConfig } from '../config/dev-tunable.config';

// ============================================================================
// TYPES
// ============================================================================

interface ComprehensiveConfigEditorProps {
  config: DevTunableConfig;
  onConfigChange: (config: DevTunableConfig) => void;
  onExport?: () => void;
  onImport?: (json: string) => void;
  onReset?: () => void;
}

type ExpandedSections = Record<string, boolean>;

// ============================================================================
// REUSABLE CONTROLS
// ============================================================================

const ControlSection = ({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="border-b border-slate-700 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700 transition text-left"
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        <span className="text-sm font-semibold text-slate-200">{title}</span>
      </div>
      {expanded ? (
        <ChevronUp className="w-4 h-4 text-slate-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-slate-400" />
      )}
    </button>
    {expanded && (
      <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 space-y-4">
        {children}
      </div>
    )}
  </div>
);

const NumberControl = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  unit,
  description
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-xs text-slate-300">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value.toFixed(step < 1 ? 2 : 0)}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-20 h-7 text-xs bg-slate-900 border-slate-600"
        />
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
    </div>
    {(min !== undefined && max !== undefined) && (
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    )}
    {description && (
      <p className="text-xs text-slate-500 italic">{description}</p>
    )}
  </div>
);

const Vector3Control = ({
  label,
  value,
  onChange,
  min = -100,
  max = 100,
  step = 1,
  description
}: {
  label: string;
  value: THREE.Vector3;
  onChange: (value: THREE.Vector3) => void;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}) => (
  <div className="space-y-2">
    <Label className="text-xs text-slate-300">{label}</Label>
    <div className="grid grid-cols-3 gap-2">
      {(['x', 'y', 'z'] as const).map((axis) => (
        <div key={axis}>
          <Label className="text-xs text-slate-500 uppercase">{axis}</Label>
          <Input
            type="number"
            value={value[axis].toFixed(1)}
            onChange={(e) => {
              const newVec = value.clone();
              newVec[axis] = parseFloat(e.target.value) || 0;
              onChange(newVec);
            }}
            min={min}
            max={max}
            step={step}
            className="w-full h-8 text-xs bg-slate-900 border-slate-600"
          />
        </div>
      ))}
    </div>
    {description && (
      <p className="text-xs text-slate-500 italic">{description}</p>
    )}
  </div>
);

const EulerControl = ({
  label,
  value,
  onChange,
  description
}: {
  label: string;
  value: THREE.Euler;
  onChange: (value: THREE.Euler) => void;
  description?: string;
}) => {
  const toDegrees = (rad: number) => (rad * 180 / Math.PI).toFixed(0);
  const toRadians = (deg: number) => deg * Math.PI / 180;

  return (
    <div className="space-y-2">
      <Label className="text-xs text-slate-300">{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <div key={axis}>
            <Label className="text-xs text-slate-500 uppercase">{axis} (deg)</Label>
            <Input
              type="number"
              value={toDegrees(value[axis])}
              onChange={(e) => {
                const newEuler = value.clone();
                newEuler[axis] = toRadians(parseFloat(e.target.value) || 0);
                onChange(newEuler);
              }}
              step={1}
              className="w-full h-8 text-xs bg-slate-900 border-slate-600"
            />
          </div>
        ))}
      </div>
      {description && (
        <p className="text-xs text-slate-500 italic">{description}</p>
      )}
    </div>
  );
};

const ModeToggle = ({
  label,
  value,
  onChange,
  options,
  description
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  description?: string;
}) => (
  <div className="space-y-2">
    <Label className="text-xs text-slate-300">{label}</Label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-8 text-xs bg-slate-900 border border-slate-600 rounded px-2 text-slate-200"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {description && (
      <p className="text-xs text-slate-500 italic">{description}</p>
    )}
  </div>
);

const BooleanToggle = ({
  label,
  value,
  onChange,
  description
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}) => (
  <div className="flex items-center justify-between">
    <div>
      <Label className="text-xs text-slate-300">{label}</Label>
      {description && (
        <p className="text-xs text-slate-500 italic mt-1">{description}</p>
      )}
    </div>
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const ColorControl = ({
  label,
  value,
  onChange,
  description
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}) => (
  <div className="space-y-2">
    <Label className="text-xs text-slate-300">{label}</Label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-8 rounded border border-slate-600"
      />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-8 text-xs bg-slate-900 border-slate-600 font-mono"
      />
    </div>
    {description && (
      <p className="text-xs text-slate-500 italic">{description}</p>
    )}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ComprehensiveConfigEditor({
  config,
  onConfigChange,
  onExport,
  onImport,
  onReset
}: ComprehensiveConfigEditorProps) {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    global: true,
    orbit: false,
    sources: true,
    collision: false,
    exit: false,
    visual: false
  });

  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const updateConfig = useCallback(
    (updates: Partial<DevTunableConfig>) => {
      onConfigChange({ ...config, ...updates });
    },
    [config, onConfigChange]
  );

  const updateSource = useCallback(
    (index: number, updates: Partial<TunableSourceConfig>) => {
      const newSources = [...config.sources];
      newSources[index] = { ...newSources[index], ...updates };
      updateConfig({ sources: newSources });
    },
    [config.sources, updateConfig]
  );

  const currentSource = config.sources[selectedSourceIndex];

  const handleExportJSON = useCallback(() => {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const imported = JSON.parse(json);
          onImport?.(imported);
        } catch (error) {
          console.error('Failed to import config:', error);
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [onImport]);

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-slate-900 border-l border-slate-700 flex flex-col shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-100">Configuration Editor</h2>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateConfig({ global: { ...config.global, paused: !config.global.paused } })}
              className="h-8 w-8 p-0"
              title={config.global.paused ? 'Resume' : 'Pause'}
            >
              {config.global.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportJSON}
              className="h-8 w-8 p-0"
              title="Export JSON"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleImportJSON}
              className="h-8 w-8 p-0"
              title="Import JSON"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onReset}
              className="h-8 w-8 p-0"
              title="Reset to defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          <div>{config.name}</div>
          <div className="text-slate-500">v{config.version}</div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* GLOBAL SETTINGS */}
        <ControlSection
          title="Global Settings"
          icon={Settings}
          expanded={expandedSections.global}
          onToggle={() => toggleSection('global')}
        >
          <NumberControl
            label="Time Scale"
            value={config.global.timeScale}
            onChange={(v) => updateConfig({ global: { ...config.global, timeScale: v } })}
            min={0.1}
            max={5.0}
            step={0.1}
            description="Speed up or slow down entire simulation"
          />

          <BooleanToggle
            label="Paused"
            value={config.global.paused}
            onChange={(v) => updateConfig({ global: { ...config.global, paused: v } })}
          />

          <NumberControl
            label="FPS Cap"
            value={config.global.framerateCap || 60}
            onChange={(v) => updateConfig({ global: { ...config.global, framerateCap: v } })}
            min={30}
            max={144}
            step={1}
            unit="fps"
          />
        </ControlSection>

        {/* ORBIT CONFIGURATION */}
        <ControlSection
          title="Orbit Configuration"
          icon={Target}
          expanded={expandedSections.orbit}
          onToggle={() => toggleSection('orbit')}
        >
          <Vector3Control
            label="Orbit Center"
            value={config.orbit.center}
            onChange={(v) => updateConfig({ orbit: { ...config.orbit, center: v } })}
            description="Center point of circular orbit"
          />

          <NumberControl
            label="Orbit Radius"
            value={config.orbit.radius}
            onChange={(v) => updateConfig({ orbit: { ...config.orbit, radius: v } })}
            min={5}
            max={100}
            step={1}
            unit="units"
          />

          <NumberControl
            label="Nominal Speed"
            value={config.orbit.nominalSpeed}
            onChange={(v) => updateConfig({ orbit: { ...config.orbit, nominalSpeed: v } })}
            min={0.1}
            max={3.0}
            step={0.1}
            unit="u/s"
            description="Base tangential velocity in orbit"
          />

          <Vector3Control
            label="Orbit Normal"
            value={config.orbit.normal}
            onChange={(v) => updateConfig({ orbit: { ...config.orbit, normal: v.normalize() } })}
            min={-1}
            max={1}
            step={0.1}
            description="Orbit plane orientation (normalized)"
          />
        </ControlSection>

        {/* SOURCE CONFIGURATION */}
        <ControlSection
          title={`Source: ${currentSource?.label || currentSource?.id || 'Unknown'}`}
          icon={Sliders}
          expanded={expandedSections.sources}
          onToggle={() => toggleSection('sources')}
        >
          {/* Source Selector */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-300">Select Source</Label>
            <div className="flex gap-1">
              {config.sources.map((source, index) => (
                <Button
                  key={source.id}
                  size="sm"
                  variant={selectedSourceIndex === index ? 'default' : 'outline'}
                  onClick={() => setSelectedSourceIndex(index)}
                  className="flex-1 h-8 text-xs"
                >
                  {source.label || source.id}
                </Button>
              ))}
            </div>
          </div>

          {currentSource && (
            <>
              {/* Gate Position */}
              <Vector3Control
                label="Gate Position"
                value={currentSource.gatePosition}
                onChange={(v) => updateSource(selectedSourceIndex, { gatePosition: v })}
                description="Starting spawn location"
              />

              {/* Takeoff Section */}
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-xs font-semibold text-slate-300 mb-3">TAKEOFF</h4>

                <ModeToggle
                  label="Waypoints Mode"
                  value={currentSource.takeoff.waypointsMode}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    takeoff: { ...currentSource.takeoff, waypointsMode: v as 'auto' | 'manual' }
                  })}
                  options={[
                    { value: 'auto', label: 'Auto-Generate' },
                    { value: 'manual', label: 'Manual Control' }
                  ]}
                />

                {currentSource.takeoff.waypointsMode === 'auto' && (
                  <>
                    <NumberControl
                      label="Arc Height"
                      value={currentSource.takeoff.arcHeight || 40}
                      onChange={(v) => updateSource(selectedSourceIndex, {
                        takeoff: { ...currentSource.takeoff, arcHeight: v }
                      })}
                      min={10}
                      max={100}
                      step={1}
                      unit="units"
                      description="Peak height of takeoff arc"
                    />

                    <NumberControl
                      label="Intermediate Points"
                      value={currentSource.takeoff.intermediatePoints || 3}
                      onChange={(v) => updateSource(selectedSourceIndex, {
                        takeoff: { ...currentSource.takeoff, intermediatePoints: Math.round(v) }
                      })}
                      min={2}
                      max={10}
                      step={1}
                      description="Number of waypoints in curve"
                    />
                  </>
                )}

                <NumberControl
                  label="Takeoff Duration"
                  value={currentSource.takeoff.duration}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    takeoff: { ...currentSource.takeoff, duration: v }
                  })}
                  min={0.5}
                  max={10.0}
                  step={0.1}
                  unit="sec"
                />
              </div>

              {/* Orbit Entry Section */}
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-xs font-semibold text-slate-300 mb-3">ORBIT ENTRY</h4>

                <ModeToggle
                  label="Entry Angle Mode"
                  value={currentSource.orbitEntry.angleMode}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    orbitEntry: { ...currentSource.orbitEntry, angleMode: v as 'auto' | 'manual' }
                  })}
                  options={[
                    { value: 'auto', label: 'Auto-Calculate' },
                    { value: 'manual', label: 'Manual Override' }
                  ]}
                  description="Auto finds closest merge point"
                />

                {currentSource.orbitEntry.angleMode === 'manual' && (
                  <NumberControl
                    label="Manual Entry Angle"
                    value={(currentSource.orbitEntry.manualAngle || 0) * 180 / Math.PI}
                    onChange={(v) => updateSource(selectedSourceIndex, {
                      orbitEntry: { ...currentSource.orbitEntry, manualAngle: v * Math.PI / 180 }
                    })}
                    min={0}
                    max={360}
                    step={1}
                    unit="deg"
                    description="Manual fine-tuning of entry point"
                  />
                )}

                <NumberControl
                  label="Entry Velocity"
                  value={currentSource.orbitEntry.entryVelocity}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    orbitEntry: { ...currentSource.orbitEntry, entryVelocity: v }
                  })}
                  min={0.1}
                  max={2.0}
                  step={0.05}
                  unit="u/s"
                />
              </div>

              {/* Orientation Section */}
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-xs font-semibold text-slate-300 mb-3">ORIENTATION</h4>

                <ModeToggle
                  label="Orientation Mode"
                  value={currentSource.orientation.mode}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    orientation: { ...currentSource.orientation, mode: v as any }
                  })}
                  options={[
                    { value: 'orbit-lock', label: 'Orbit Lock (tangent)' },
                    { value: 'curve-tangent', label: 'Curve Tangent' },
                    { value: 'manual', label: 'Manual Control' }
                  ]}
                />

                <EulerControl
                  label="Additional Rotation"
                  value={currentSource.orientation.additionalRotation || new THREE.Euler()}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    orientation: { ...currentSource.orientation, additionalRotation: v }
                  })}
                  description="Applied after automatic orientation"
                />

                <NumberControl
                  label="Rotation Speed"
                  value={currentSource.orientation.rotationSpeed}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    orientation: { ...currentSource.orientation, rotationSpeed: v }
                  })}
                  min={0.1}
                  max={20}
                  step={0.1}
                  unit="rad/s"
                  description="Smoothing speed (higher = faster)"
                />

                <BooleanToggle
                  label="Instant Rotation"
                  value={currentSource.orientation.useInstantRotation}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    orientation: { ...currentSource.orientation, useInstantRotation: v }
                  })}
                  description="Skip smooth rotation (instant snap)"
                />
              </div>

              {/* Visual Section */}
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-xs font-semibold text-slate-300 mb-3">VISUAL</h4>

                <ColorControl
                  label="Particle Color"
                  value={currentSource.visual.color}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    visual: { ...currentSource.visual, color: v }
                  })}
                />

                <NumberControl
                  label="Model Scale"
                  value={currentSource.visual.modelScale}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    visual: { ...currentSource.visual, modelScale: v }
                  })}
                  min={0.1}
                  max={5.0}
                  step={0.1}
                />

                <BooleanToggle
                  label="Enable Trail"
                  value={currentSource.visual.enableTrail}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    visual: { ...currentSource.visual, enableTrail: v }
                  })}
                />
              </div>

              {/* Spawn Section */}
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-xs font-semibold text-slate-300 mb-3">SPAWN</h4>

                <BooleanToggle
                  label="Enabled"
                  value={currentSource.spawn.enabled}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    spawn: { ...currentSource.spawn, enabled: v }
                  })}
                />

                <NumberControl
                  label="Spawn Rate"
                  value={currentSource.spawn.spawnRate}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    spawn: { ...currentSource.spawn, spawnRate: v }
                  })}
                  min={0.05}
                  max={2.0}
                  step={0.05}
                  unit="sec"
                  description="Seconds between spawns"
                />

                <NumberControl
                  label="Max Particles"
                  value={currentSource.spawn.maxParticles}
                  onChange={(v) => updateSource(selectedSourceIndex, {
                    spawn: { ...currentSource.spawn, maxParticles: Math.round(v) }
                  })}
                  min={5}
                  max={100}
                  step={1}
                />
              </div>
            </>
          )}
        </ControlSection>

        {/* COLLISION AVOIDANCE */}
        <ControlSection
          title="Collision Avoidance"
          expanded={expandedSections.collision}
          onToggle={() => toggleSection('collision')}
        >
          <BooleanToggle
            label="Enabled"
            value={config.collision.enabled}
            onChange={(v) => updateConfig({ collision: { ...config.collision, enabled: v } })}
          />

          {config.collision.enabled && (
            <>
              <NumberControl
                label="Min Separation Distance"
                value={config.collision.minSeparationDistance}
                onChange={(v) => updateConfig({ collision: { ...config.collision, minSeparationDistance: v } })}
                min={1}
                max={20}
                step={0.5}
                unit="units"
              />

              <NumberControl
                label="Repulsion Strength"
                value={config.collision.repulsionStrength}
                onChange={(v) => updateConfig({ collision: { ...config.collision, repulsionStrength: v } })}
                min={0}
                max={2}
                step={0.1}
              />

              <BooleanToggle
                label="Tangential Speed Adjustment"
                value={config.collision.strategies.tangentialSpeed.enabled}
                onChange={(v) => updateConfig({
                  collision: {
                    ...config.collision,
                    strategies: {
                      ...config.collision.strategies,
                      tangentialSpeed: { ...config.collision.strategies.tangentialSpeed, enabled: v }
                    }
                  }
                })}
              />

              <BooleanToggle
                label="Radial Offset Adjustment"
                value={config.collision.strategies.radialOffset.enabled}
                onChange={(v) => updateConfig({
                  collision: {
                    ...config.collision,
                    strategies: {
                      ...config.collision.strategies,
                      radialOffset: { ...config.collision.strategies.radialOffset, enabled: v }
                    }
                  }
                })}
              />

              <BooleanToggle
                label="Vertical Adjustment"
                value={config.collision.strategies.verticalAdjustment.enabled}
                onChange={(v) => updateConfig({
                  collision: {
                    ...config.collision,
                    strategies: {
                      ...config.collision.strategies,
                      verticalAdjustment: { ...config.collision.strategies.verticalAdjustment, enabled: v }
                    }
                  }
                })}
              />
            </>
          )}
        </ControlSection>

        {/* VISUAL/DEBUG */}
        <ControlSection
          title="Visualization & Debug"
          icon={Eye}
          expanded={expandedSections.visual}
          onToggle={() => toggleSection('visual')}
        >
          <BooleanToggle
            label="Show Takeoff Paths"
            value={config.visual.paths.showTakeoff}
            onChange={(v) => updateConfig({
              visual: { ...config.visual, paths: { ...config.visual.paths, showTakeoff: v } }
            })}
          />

          <BooleanToggle
            label="Show Landing Paths"
            value={config.visual.paths.showLanding}
            onChange={(v) => updateConfig({
              visual: { ...config.visual, paths: { ...config.visual.paths, showLanding: v } }
            })}
          />

          <BooleanToggle
            label="Show Orbit Circle"
            value={config.visual.paths.showOrbitCircle}
            onChange={(v) => updateConfig({
              visual: { ...config.visual, paths: { ...config.visual.paths, showOrbitCircle: v } }
            })}
          />

          <BooleanToggle
            label="Show Entry/Exit Markers"
            value={config.visual.markers.showEntryPoints}
            onChange={(v) => updateConfig({
              visual: {
                ...config.visual,
                markers: {
                  ...config.visual.markers,
                  showEntryPoints: v,
                  showExitPoints: v
                }
              }
            })}
          />

          <BooleanToggle
            label="Show FPS"
            value={config.visual.debug.showFPS}
            onChange={(v) => updateConfig({
              visual: { ...config.visual, debug: { ...config.visual.debug, showFPS: v } }
            })}
          />

          <BooleanToggle
            label="Show Particle Count"
            value={config.visual.debug.showParticleCount}
            onChange={(v) => updateConfig({
              visual: { ...config.visual, debug: { ...config.visual.debug, showParticleCount: v } }
            })}
          />
        </ControlSection>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700 bg-slate-800 text-xs text-slate-500">
        <div className="flex justify-between">
          <span>Config v{config.version}</span>
          <span>{config.sources.length} sources</span>
        </div>
      </div>
    </div>
  );
}
