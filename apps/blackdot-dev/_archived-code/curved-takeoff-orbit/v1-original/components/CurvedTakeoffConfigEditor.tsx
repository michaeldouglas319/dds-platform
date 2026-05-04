'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Copy, RotateCcw, Plus, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import * as THREE from 'three';
import { ModelOrientationTester } from './ModelOrientationTester';

interface ExitZoneConfig {
  radius: number;
  attractionStrength: number;
  attractionMaxDistance: number;
  requireProximity: boolean;
}

interface CurvedTakeoffConfig {
  gatePosition: THREE.Vector3;
  orbitCenter: THREE.Vector3;
  orbitRadius: number;
  orbitEntryAngle: number;
  orbitExitAngle: number;
  takeoffDuration: number;
  orbitSpeed: number;
  spawnRate: number;
  bezierControl1: THREE.Vector3;
  bezierControl2: THREE.Vector3;
  particleCount: number;
  orbitHeightVariation: number;
  takeoffWaypoints: THREE.Vector3[];
  orbitDuration: number;
  landingDuration: number;
  landingWaypoints: THREE.Vector3[];
  defaultStartPhase: 'takeoff' | 'orbit' | 'landing';
  allowMixedPhases: boolean;
  orbitWaveFrequency: number;
  landingTransitionTolerance: number;
  landingTransitionBlendDuration: number;
  landingCurveStartOffset: THREE.Vector3;
  landingTransitionSmoothing: number;
  exitZone?: ExitZoneConfig;
}

interface CurvedTakeoffConfigEditorProps {
  config: CurvedTakeoffConfig;
  onConfigChange: (config: CurvedTakeoffConfig) => void;
}

type Section = 'spawn' | 'sourceFactory' | 'sourceTakeoff' | 'sourceLanding' | 'orbit' | 'exitZone' | 'particles';

const ControlSection = ({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="border-b border-slate-700 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700 transition text-left"
    >
      <span className="text-sm font-semibold text-slate-200">{title}</span>
      {expanded ? (
        <ChevronUp className="w-4 h-4 text-slate-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-slate-400" />
      )}
    </button>
    {expanded && (
      <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 space-y-3">
        {children}
      </div>
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
}: {
  label: string;
  value: THREE.Vector3;
  onChange: (value: THREE.Vector3) => void;
  min?: number;
  max?: number;
  step?: number;
}) => (
  <div className="space-y-2">
    <Label className="text-xs text-slate-300">{label}</Label>
    <div className="grid grid-cols-3 gap-2">
      {(['x', 'y', 'z'] as const).map((axis) => (
        <div key={axis} className="space-y-1">
          <Label className="text-xs text-slate-400 uppercase">{axis}</Label>
          <Input
            type="number"
            value={value[axis]}
            onChange={(e) => {
              const newValue = { ...value };
              newValue[axis] = parseFloat(e.target.value) || 0;
              onChange(new THREE.Vector3(newValue.x, newValue.y, newValue.z));
            }}
            min={min}
            max={max}
            step={step}
            className="h-8 text-xs bg-slate-700 border-slate-600"
          />
        </div>
      ))}
    </div>
  </div>
);

const SliderControl = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format = (v: number) => v.toFixed(2),
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-xs text-slate-300">{label}</Label>
      <span className="text-xs text-slate-400 font-mono">{format(value)}</span>
    </div>
    <Slider
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={([v]) => onChange(v)}
      className="flex-1"
    />
  </div>
);

const WaypointList = ({
  waypoints,
  onWaypointsChange,
  label,
}: {
  waypoints: THREE.Vector3[];
  onWaypointsChange: (waypoints: THREE.Vector3[]) => void;
  label: string;
}) => {
  const addWaypoint = useCallback(() => {
    const newWaypoints = [...waypoints, new THREE.Vector3(0, 0, 0)];
    onWaypointsChange(newWaypoints);
  }, [waypoints, onWaypointsChange]);

  const updateWaypoint = useCallback((index: number, value: THREE.Vector3) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = value;
    onWaypointsChange(newWaypoints);
  }, [waypoints, onWaypointsChange]);

  const removeWaypoint = useCallback((index: number) => {
    const newWaypoints = waypoints.filter((_, i) => i !== index);
    onWaypointsChange(newWaypoints);
  }, [waypoints, onWaypointsChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-slate-300">{label} ({waypoints.length})</Label>
        <Button
          onClick={addWaypoint}
          size="sm"
          variant="outline"
          className="h-6 px-2 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {waypoints.map((waypoint, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-slate-700 rounded">
            <span className="text-xs text-slate-400 w-16">#{index + 1}</span>
            <div className="flex-1 grid grid-cols-3 gap-1">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <Input
                  key={axis}
                  type="number"
                  value={waypoint[axis]}
                  onChange={(e) => {
                    const newValue = { ...waypoint };
                    newValue[axis] = parseFloat(e.target.value) || 0;
                    updateWaypoint(index, new THREE.Vector3(newValue.x, newValue.y, newValue.z));
                  }}
                  className="h-6 text-xs bg-slate-600 border-slate-500"
                  step={0.1}
                />
              ))}
            </div>
            <Button
              onClick={() => removeWaypoint(index)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export function CurvedTakeoffConfigEditor({
  config,
  onConfigChange,
}: CurvedTakeoffConfigEditorProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<string>(() =>
    (config as any).sources?.[0]?.id || 'north-gate'
  );

  const [modelTesterOpen, setModelTesterOpen] = useState(false);
  const [showTrails, setShowTrails] = useState(true);

  const [expandedSections, setExpandedSections] = useState<Record<Section, boolean>>({
    spawn: true,
    sourceFactory: false,
    sourceTakeoff: false,
    sourceLanding: false,
    orbit: false,
    exitZone: false,
    particles: false,
  });

  const toggleSection = (section: Section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Get sources from config (multi-source config)
  const sources = (config as any).sources || [];
  const selectedSource = sources.find((s: any) => s.id === selectedSourceId) || sources[0];

  const updateConfig = useCallback((updates: Partial<CurvedTakeoffConfig>) => {
    onConfigChange({ ...config, ...updates });
  }, [config, onConfigChange]);

  // Update a specific source
  const updateSource = useCallback((sourceId: string, updates: any) => {
    const updatedSources = sources.map((s: any) =>
      s.id === sourceId ? { ...s, ...updates } : s
    );
    onConfigChange({ ...config, sources: updatedSources } as any);
  }, [config, onConfigChange, sources]);

  const copyConfig = useCallback(() => {
    const configString = `export const CURVED_TAKEOFF_CONFIG = ${JSON.stringify({
      ...config,
      gatePosition: config.gatePosition.toArray(),
      orbitCenter: config.orbitCenter.toArray(),
      bezierControl1: config.bezierControl1.toArray(),
      bezierControl2: config.bezierControl2.toArray(),
      takeoffWaypoints: config.takeoffWaypoints.map(w => w.toArray()),
      landingWaypoints: config.landingWaypoints.map(w => w.toArray()),
    }, null, 2)};`;
    navigator.clipboard.writeText(configString);
  }, [config]);

  const resetConfig = useCallback(() => {
    // Reset to default values
    const defaultConfig: CurvedTakeoffConfig = {
      gatePosition: new THREE.Vector3(-40, 0, -40),
      orbitCenter: new THREE.Vector3(6, 30, 0),
      orbitRadius: 25,
      orbitEntryAngle: Math.PI / 2,
      orbitExitAngle: Math.PI / 2 + Math.PI,
      takeoffDuration: 2.0,
      orbitSpeed: 0.6,
      spawnRate: 0.15,
      bezierControl1: new THREE.Vector3(-100, 15, -30),
      bezierControl2: new THREE.Vector3(-10, 35, -10),
      particleCount: 80,
      orbitHeightVariation: 5,
      takeoffWaypoints: [
        new THREE.Vector3(-40, 0, -40),
        new THREE.Vector3(-30, 12, -37),
        new THREE.Vector3(46, 36, 19),
        new THREE.Vector3(6, 32.3, 25.5),
      ],
      orbitDuration: 8.0,
      landingDuration: 3.0,
      landingWaypoints: [
        new THREE.Vector3(20, 2, -20.5),
        new THREE.Vector3(20, -1, -29.7),
        new THREE.Vector3(10, 0.4, -50),
        new THREE.Vector3(-40, 0, -40),
      ],
      defaultStartPhase: 'takeoff',
      allowMixedPhases: false,
      orbitWaveFrequency: 0.3,
      landingTransitionTolerance: Math.PI / 12,
      landingTransitionBlendDuration: 0.2,
      landingCurveStartOffset: new THREE.Vector3(0, 0, 0),
      landingTransitionSmoothing: 0.8,
      exitZone: {
        radius: 4.0,
        attractionStrength: 0.15,
        attractionMaxDistance: 15.0,
        requireProximity: true,
      },
    };
    onConfigChange(defaultConfig);
  }, [onConfigChange]);

  return (
    <div className="absolute top-4 left-4 z-30 w-80 max-h-[calc(100vh-2rem)] flex flex-col bg-slate-900/95 backdrop-blur-md rounded-lg border border-slate-700 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50 flex-shrink-0">
        <h2 className="text-lg font-bold text-white">CONFIG EDITOR</h2>
        <div className="flex gap-2">
          <Button
            onClick={copyConfig}
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          <Button
            onClick={resetConfig}
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Trail Toggle */}
      <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/30 flex items-center justify-between flex-shrink-0">
        <span className="text-xs text-slate-300 font-semibold">Show Particle Trails</span>
        <Button
          onClick={() => setShowTrails(!showTrails)}
          size="sm"
          variant={showTrails ? "default" : "outline"}
          className="h-7 px-3 text-xs"
        >
          {showTrails ? 'ON' : 'OFF'}
        </Button>
      </div>

      {/* Source Selector - Prominent & Sticky */}
      {sources.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-b-2 border-blue-500/30 flex-shrink-0">
          <Label className="text-xs font-semibold text-blue-300 mb-2 block uppercase tracking-wide">
            📍 Select Source / Factory
          </Label>
          <select
            value={selectedSourceId}
            onChange={(e) => setSelectedSourceId(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-700 border-2 border-slate-600 hover:border-blue-500 rounded-lg text-sm text-white font-bold shadow-lg transition-all"
          >
            {sources.map((source: any) => (
              <option key={source.id} value={source.id}>
                🏭 {source.id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-slate-400 text-center">
            {sources.length} source{sources.length !== 1 ? 's' : ''} available
          </div>
        </div>
      )}

      {/* Content - Scrollable */}
      <div className="divide-y divide-slate-700 overflow-y-auto flex-1">

        {/* Spawn Behavior */}
        <ControlSection
          title="🎯 Global Spawn Settings"
          expanded={expandedSections.spawn}
          onToggle={() => toggleSection('spawn')}
        >
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-slate-300">Default Start Phase</Label>
              <select
                value={config.defaultStartPhase}
                onChange={(e) => updateConfig({ defaultStartPhase: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
              >
                <option value="takeoff">Takeoff (Gate to Orbit)</option>
                <option value="orbit">Orbit</option>
                <option value="landing">Landing</option>
              </select>
            </div>
          </div>
        </ControlSection>

        {/* Source Factory Config */}
        {selectedSource && (
          <ControlSection
            title="🏭 Factory Config"
            expanded={expandedSections.sourceFactory}
            onToggle={() => toggleSection('sourceFactory')}
          >
            <div className="space-y-3">
              <Vector3Control
                label="Gate Position (Origin)"
                value={selectedSource.gatePosition}
                onChange={(v) => updateSource(selectedSourceId, { gatePosition: v })}
              />

              <div>
                <Label className="text-xs text-slate-300 mb-2 block">Particle Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedSource.particleColor}
                    onChange={(e) => updateSource(selectedSourceId, { particleColor: e.target.value })}
                    className="w-12 h-8 rounded border border-slate-600 bg-slate-700"
                  />
                  <Input
                    type="text"
                    value={selectedSource.particleColor}
                    onChange={(e) => updateSource(selectedSourceId, { particleColor: e.target.value })}
                    className="flex-1 h-8 text-xs bg-slate-700 border-slate-600 font-mono"
                  />
                </div>
              </div>

              {/* Model Orientation Tester Button */}
              <div className="border-t border-slate-600 pt-3">
                <Button
                  onClick={() => setModelTesterOpen(true)}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Open Model Orientation Tester
                </Button>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  3D preview with sliders to test scale, rotation, and position
                </p>
              </div>

              <SliderControl
                label="Model Scale"
                value={
                  typeof selectedSource.modelOrientation?.scale === 'number'
                    ? selectedSource.modelOrientation.scale
                    : 1.0
                }
                onChange={(v) =>
                  updateSource(selectedSourceId, {
                    modelOrientation: {
                      ...(selectedSource.modelOrientation || {}),
                      scale: v,
                    },
                  })
                }
                min={0.1}
                max={2.0}
                step={0.1}
                format={(v) => `${v.toFixed(1)}x`}
              />

              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Model Position Offset</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['x', 'y', 'z'] as const).map((axis, idx) => (
                    <div key={axis}>
                      <Label className="text-xs text-slate-400 uppercase mb-1 block">{axis}</Label>
                      <Input
                        type="number"
                        value={selectedSource.modelOrientation?.positionOffset?.[idx] || 0}
                        onChange={(e) => {
                          const offset = selectedSource.modelOrientation?.positionOffset || [0, 0, 0];
                          const newOffset = [...offset] as [number, number, number];
                          newOffset[idx] = parseFloat(e.target.value) || 0;
                          updateSource(selectedSourceId, {
                            modelOrientation: {
                              ...(selectedSource.modelOrientation || {}),
                              positionOffset: newOffset,
                            },
                          });
                        }}
                        step={0.1}
                        className="h-8 text-xs bg-slate-700 border-slate-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Orientation Locking Controls */}
              <div className="space-y-3 pt-3 border-t border-slate-700">
                <Label className="text-xs text-blue-300 font-semibold">Orientation & Trail Alignment</Label>

                {/* Lock to Trail Toggle */}
                <div className="flex items-center justify-between p-2 bg-slate-800 rounded border border-slate-700">
                  <Label className="text-xs text-slate-300">Lock to Trail</Label>
                  <Button
                    onClick={() =>
                      updateSource(selectedSourceId, {
                        modelOrientation: {
                          ...(selectedSource.modelOrientation || {}),
                          lockToTrail: !selectedSource.modelOrientation?.lockToTrail,
                        },
                      })
                    }
                    size="sm"
                    variant={selectedSource.modelOrientation?.lockToTrail !== false ? "default" : "outline"}
                    className="h-7 px-3 text-xs"
                  >
                    {selectedSource.modelOrientation?.lockToTrail !== false ? 'ON' : 'OFF'}
                  </Button>
                </div>

                {/* Trail Alignment Mode */}
                {selectedSource.modelOrientation?.lockToTrail !== false && (
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-300">Alignment Mode</Label>
                    <select
                      value={selectedSource.modelOrientation?.trailAlignmentMode || 'horizontal'}
                      onChange={(e) =>
                        updateSource(selectedSourceId, {
                          modelOrientation: {
                            ...(selectedSource.modelOrientation || {}),
                            trailAlignmentMode: e.target.value as 'horizontal' | 'full-3d' | 'none',
                          },
                        })
                      }
                      className="w-full h-9 bg-slate-700 border border-slate-600 rounded px-2 text-xs text-white"
                    >
                      <option value="horizontal">Horizontal Only (No Pitch)</option>
                      <option value="full-3d">Full 3D (With Pitch)</option>
                      <option value="none">None (Static)</option>
                    </select>
                  </div>
                )}

                {/* Allow Banking Toggle */}
                {selectedSource.modelOrientation?.lockToTrail !== false && (
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded border border-slate-700">
                    <Label className="text-xs text-slate-300">Allow Banking</Label>
                    <Button
                      onClick={() =>
                        updateSource(selectedSourceId, {
                          modelOrientation: {
                            ...(selectedSource.modelOrientation || {}),
                            allowBanking: !selectedSource.modelOrientation?.allowBanking,
                          },
                        })
                      }
                      size="sm"
                      variant={selectedSource.modelOrientation?.allowBanking !== false ? "default" : "outline"}
                      className="h-7 px-3 text-xs"
                    >
                      {selectedSource.modelOrientation?.allowBanking !== false ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </ControlSection>
        )}

        {/* Source Takeoff Settings */}
        {selectedSource && (
          <ControlSection
            title="✈️ Takeoff Settings"
            expanded={expandedSections.sourceTakeoff}
            onToggle={() => toggleSection('sourceTakeoff')}
          >
            <div className="space-y-3">
              <SliderControl
                label="⏱️ Spawn Rate"
                value={selectedSource.spawnRate}
                onChange={(v) => updateSource(selectedSourceId, { spawnRate: v })}
                min={0.05}
                max={2.0}
                step={0.05}
                format={(v) => `${v.toFixed(2)} s`}
              />
              <SliderControl
                label="Takeoff Duration"
                value={selectedSource.takeoffDuration}
                onChange={(v) => updateSource(selectedSourceId, { takeoffDuration: v })}
                min={0.5}
                max={5.0}
                step={0.1}
                format={(v) => `${v.toFixed(2)} s`}
              />
              <SliderControl
                label="Orbit Entry Speed"
                value={selectedSource.orbitEntryVelocity}
                onChange={(v) => updateSource(selectedSourceId, { orbitEntryVelocity: v })}
                min={0.1}
                max={2.0}
                step={0.1}
                format={(v) => `${v.toFixed(2)} rad/s`}
              />
              <SliderControl
                label="Orbit Entry Angle"
                value={selectedSource.orbitEntryAngle}
                onChange={(v) => updateSource(selectedSourceId, { orbitEntryAngle: v })}
                min={0}
                max={Math.PI * 2}
                step={0.1}
                format={(v) => `${(v * 180 / Math.PI).toFixed(1)}°`}
              />

              <WaypointList
                waypoints={selectedSource.takeoffWaypoints || []}
                onWaypointsChange={(waypoints) =>
                  updateSource(selectedSourceId, { takeoffWaypoints: waypoints })
                }
                label="Takeoff Waypoints"
              />
            </div>
          </ControlSection>
        )}

        {/* Global Orbit Settings */}
        <ControlSection
          title="🔵 Global Orbit"
          expanded={expandedSections.orbit}
          onToggle={() => toggleSection('orbit')}
        >
          <div className="space-y-3">
            <Vector3Control
              label="Orbit Center"
              value={(config as any).orbit?.center || new THREE.Vector3(6, 30, 0)}
              onChange={(v) => {
                const orbit = (config as any).orbit || {};
                updateConfig({ ...config, orbit: { ...orbit, center: v } } as any);
              }}
            />
            <SliderControl
              label="Orbit Radius"
              value={(config as any).orbit?.radius || 25}
              onChange={(v) => {
                const orbit = (config as any).orbit || {};
                updateConfig({ ...config, orbit: { ...orbit, radius: v } } as any);
              }}
              min={5}
              max={50}
              step={1}
              format={(v) => `${v.toFixed(1)} u`}
            />
            <SliderControl
              label="Nominal Speed"
              value={(config as any).orbit?.nominalSpeed || 0.6}
              onChange={(v) => {
                const orbit = (config as any).orbit || {};
                updateConfig({ ...config, orbit: { ...orbit, nominalSpeed: v } } as any);
              }}
              min={0.1}
              max={2.0}
              step={0.1}
              format={(v) => `${v.toFixed(2)} rad/s`}
            />
            <SliderControl
              label="Height Variation"
              value={config.orbitHeightVariation}
              onChange={(v) => updateConfig({ orbitHeightVariation: v })}
              min={0}
              max={20}
              step={0.5}
              format={(v) => `${v.toFixed(1)} u`}
            />
            <SliderControl
              label="Orbit Duration"
              value={config.orbitDuration}
              onChange={(v) => updateConfig({ orbitDuration: v })}
              min={2}
              max={20}
              step={0.5}
              format={(v) => `${v.toFixed(1)} s`}
            />
          </div>
        </ControlSection>

        {/* Source Landing Settings */}
        {selectedSource && (
          <ControlSection
            title="🛬 Landing Settings"
            expanded={expandedSections.sourceLanding}
            onToggle={() => toggleSection('sourceLanding')}
          >
            <div className="space-y-3">
              <SliderControl
                label="Landing Duration"
                value={config.landingDuration}
                onChange={(v) => updateConfig({ landingDuration: v })}
                min={1}
                max={10}
                step={0.5}
                format={(v) => `${v.toFixed(1)} s`}
              />
              <p className="text-xs text-slate-500">
                Landing curves are auto-generated from orbit exit back to this source's gate position.
              </p>
            </div>
          </ControlSection>
        )}

        {/* Exit Zone */}
        <ControlSection
          title="🎯 Exit Zone (Area-Based)"
          expanded={expandedSections.exitZone}
          onToggle={() => toggleSection('exitZone')}
        >
          <div className="space-y-3">
            <SliderControl
              label="Zone Radius"
              value={config.exitZone?.radius ?? 4.0}
              onChange={(v) => updateConfig({
                exitZone: {
                  ...(config.exitZone || { attractionStrength: 0.15, attractionMaxDistance: 15.0, requireProximity: true }),
                  radius: v
                }
              })}
              min={1}
              max={15}
              step={0.5}
              format={(v) => `${v.toFixed(1)} u`}
            />
            <SliderControl
              label="Attraction Strength"
              value={config.exitZone?.attractionStrength ?? 0.15}
              onChange={(v) => updateConfig({
                exitZone: {
                  ...(config.exitZone || { radius: 4.0, attractionMaxDistance: 15.0, requireProximity: true }),
                  attractionStrength: v
                }
              })}
              min={0.05}
              max={0.5}
              step={0.05}
              format={(v) => `${v.toFixed(2)}`}
            />
            <SliderControl
              label="Attraction Max Distance"
              value={config.exitZone?.attractionMaxDistance ?? 15.0}
              onChange={(v) => updateConfig({
                exitZone: {
                  ...(config.exitZone || { radius: 4.0, attractionStrength: 0.15, requireProximity: true }),
                  attractionMaxDistance: v
                }
              })}
              min={5}
              max={30}
              step={1}
              format={(v) => `${v.toFixed(1)} u`}
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.exitZone?.requireProximity ?? true}
                  onChange={(e) => updateConfig({
                    exitZone: {
                      ...(config.exitZone || { radius: 4.0, attractionStrength: 0.15, attractionMaxDistance: 15.0 }),
                      requireProximity: e.target.checked
                    }
                  })}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                />
                <Label className="text-xs text-slate-300">Require Proximity to Exit</Label>
              </div>
              <p className="text-xs text-slate-500">
                When enabled, drones must enter the exit zone sphere to transition to landing.
              </p>
            </div>
          </div>
        </ControlSection>

        {/* Particles */}
        <ControlSection
          title="✨ Particles"
          expanded={expandedSections.particles}
          onToggle={() => toggleSection('particles')}
        >
          <SliderControl
            label="Particle Count"
            value={config.particleCount}
            onChange={(v) => updateConfig({ particleCount: v })}
            min={10}
            max={200}
            step={5}
            format={(v) => `${v.toFixed(0)}`}
          />
        </ControlSection>
      </div>

      {/* Status */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex-shrink-0">
        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>Status: <span className="text-green-400">Ready</span></span>
          {selectedSource && (
            <span className="text-xs text-blue-400 font-mono">
              {selectedSource.particleColor}
            </span>
          )}
        </div>
      </div>

      {/* Model Orientation Tester Modal */}
      {selectedSource && (
        <ModelOrientationTester
          open={modelTesterOpen}
          onOpenChange={setModelTesterOpen}
          modelPath="/assets/models/super_cam__-_rusian_reconnaissance_drone_draco.glb"
          currentScale={
            typeof selectedSource.modelOrientation?.scale === 'number'
              ? selectedSource.modelOrientation.scale
              : 1.0
          }
          currentRotation={
            selectedSource.modelOrientation?.rotationOffset || [0, Math.PI / 2, 0]
          }
          currentPosition={
            selectedSource.modelOrientation?.positionOffset || [0, 0, 0]
          }
          onApply={(modelConfig) => {
            updateSource(selectedSourceId, {
              modelOrientation: {
                scale: modelConfig.scale,
                rotationOffset: modelConfig.rotationOffset,
                positionOffset: modelConfig.positionOffset,
              },
            });
          }}
        />
      )}
    </div>
  );
}