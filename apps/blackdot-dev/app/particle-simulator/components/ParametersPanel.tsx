'use client';

import React, { useState } from 'react';
import { ModelSelector } from './ModelSelector';

interface ParametersPanelProps {
  onParameterChange: (param: string, value: unknown) => void;
  mode?: 'coulomb' | 'windTunnel';
  selectedModelPath?: string;
  onModelPathChange?: (path: string) => void;
  useBoundingBoxSDF?: boolean;
  onSDFModeChange?: (useBoundingBox: boolean) => void;
  obstacleType?: string; // Only show model selector for drone
  particleSize?: number; // Granular particles verification
  useObjectAwareSpawning?: boolean; // Object-aware spawning toggle
  spawnAreaPosition?: { x: number; y: number; z: number }; // Manual spawn area position
  spawnAreaSize?: { width: number; height: number }; // Manual spawn area size
}

const NUCLEAR_POTENTIALS = [
  'Hooks Law',
  'Lennard-Jones',
  'Yukawa',
  'Power Law',
  'Exponential',
];

const FRICTION_MODELS = [
  'Linear',
  'Quadratic',
  'None',
];

export function ParametersPanel({
  onParameterChange,
  mode = 'coulomb',
  selectedModelPath,
  onModelPathChange,
  useBoundingBoxSDF = false, // Default to exact mesh geometry
  onSDFModeChange,
  obstacleType,
  particleSize,
  useObjectAwareSpawning,
  spawnAreaPosition,
  spawnAreaSize,
}: ParametersPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [parameters, setParameters] = useState({
    // Coulomb parameters
    gravityConstant: 100,
    chargeConstant: 100,
    nuclearConstant: 100,
    timeStep: 0.01,
    frictionCoefficient: 0.1,
    maxSpeed: 100,
    nuclearPotential: 'Hooks Law',
    frictionModel: 'Linear',
    enableCollisions: true,
    enableBoundary: true,
    // Wind tunnel parameters
    flowSpeed: 10,
    turbulenceIntensity: 0,
    showTrails: false,
    colorByVelocity: true,
    // Visualization toggles
    showVelocityVectors: false,
    showVelocityHeatmap: false,
    showStreamlines: false,
    // Aerodynamic parameters
    dragCoefficient: 0.5,
    boundaryLayerThickness: 5.0,
    separationZoneSize: 10.0,
  });

  const handleParameterChange = (param: string, value: unknown) => {
    setParameters((prev) => ({
      ...prev,
      [param]: value,
    }));
    onParameterChange(param, value);
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border min-w-[280px] flex flex-col max-h-[calc(100vh-120px)] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors flex-shrink-0"
      >
        <h3 className="text-lg font-semibold text-card-foreground">
          {mode === 'windTunnel' ? 'Wind Tunnel Parameters' : 'Physics Parameters'}
        </h3>
        <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {mode === 'windTunnel' && (
            <>
              {/* Granular Particles - Dynamic Wind Tunnel */}
              <div className="space-y-4 pt-2 border-t border-border">
                <h4 className="text-sm font-semibold text-muted-foreground">Dynamic Wind Tunnel</h4>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Particle Size</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="5.0"
                      step="0.1"
                      value={particleSize || 2.0}
                      onChange={(e) => onParameterChange('particleSize', parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground min-w-[60px]">
                      {particleSize?.toFixed(1) || '2.0'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Smaller = more granular (current: {particleSize?.toFixed(1) || '2.0'})
                  </p>
                </div>
                {obstacleType !== 'none' && (
                  <>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useObjectAwareSpawning || false}
                          onChange={(e) => onParameterChange('useObjectAwareSpawning', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-card-foreground">
                          Dynamic Source Area (matches object's two largest dimensions)
                        </span>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Particle source area adapts to object shape for maximum interaction
                      </p>
                    </div>
                    
                    {/* Manual Spawn Area Controls */}
                    <div className="space-y-3 pt-2 border-t border-border">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase">Spawn Area Override</h5>
                      <p className="text-xs text-muted-foreground">
                        Manually control particle spawn area (values auto-populated from object)
                      </p>
                      
                      {/* Position */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-card-foreground">Position X</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="-200"
                            max="200"
                            step="1"
                            value={spawnAreaPosition?.x ?? -50}
                            onChange={(e) => onParameterChange('spawnAreaPositionX', parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground min-w-[50px]">
                            {spawnAreaPosition?.x.toFixed(1) ?? '-50.0'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-card-foreground">Position Y</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="-200"
                            max="200"
                            step="1"
                            value={spawnAreaPosition?.y ?? 0}
                            onChange={(e) => onParameterChange('spawnAreaPositionY', parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground min-w-[50px]">
                            {spawnAreaPosition?.y.toFixed(1) ?? '0.0'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-card-foreground">Position Z</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="-200"
                            max="200"
                            step="1"
                            value={spawnAreaPosition?.z ?? 0}
                            onChange={(e) => onParameterChange('spawnAreaPositionZ', parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground min-w-[50px]">
                            {spawnAreaPosition?.z.toFixed(1) ?? '0.0'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Size */}
                      <div className="space-y-2 pt-2 border-t border-border/50">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-card-foreground">Width (Z dimension)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="1"
                              max="200"
                              step="1"
                              value={spawnAreaSize?.width ?? 40}
                              onChange={(e) => onParameterChange('spawnAreaWidth', parseFloat(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground min-w-[50px]">
                              {spawnAreaSize?.width.toFixed(1) ?? '40.0'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-card-foreground">Height (Y dimension)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="1"
                              max="200"
                              step="1"
                              value={spawnAreaSize?.height ?? 40}
                              onChange={(e) => onParameterChange('spawnAreaHeight', parseFloat(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground min-w-[50px]">
                              {spawnAreaSize?.height.toFixed(1) ?? '40.0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Model Selection - Following MeshSDF Infrastructure gold standard */}
              {/* Only show when drone obstacle is selected */}
              {obstacleType === 'drone' && onModelPathChange && (
                <div className="space-y-4 pt-2 border-t border-border">
                  <h4 className="text-sm font-semibold text-muted-foreground">3D Model Configuration</h4>
                  <ModelSelector
                    selectedModel={selectedModelPath || '/assets/models/super_cam__-_rusian_reconnaissance_drone.glb'}
                    onModelChange={onModelPathChange}
                    modelType="drone"
                  />
                  {onSDFModeChange && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-card-foreground">SDF Mode</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sdfMode"
                            checked={!useBoundingBoxSDF}
                            onChange={(e) => {
                              if (e.target.checked) {
                                onSDFModeChange?.(false);
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-card-foreground">
                            ✅ Exact Mesh (Default) - Real geometry, accurate physics
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sdfMode"
                            checked={useBoundingBoxSDF}
                            onChange={(e) => {
                              if (e.target.checked) {
                                onSDFModeChange?.(true);
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-card-foreground">
                            📦 Bounding Box (Fast) - Approximation for performance
                          </span>
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        See MESHSDF_INFRASTRUCTURE.md for performance details
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Flow Speed */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-card-foreground">Flow Speed</label>
                  <span className="text-xs text-muted-foreground">{parameters.flowSpeed.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={0.5}
                  value={parameters.flowSpeed}
                  onChange={(e) => handleParameterChange('flowSpeed', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Turbulence Intensity */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-card-foreground">Turbulence</label>
                  <span className="text-xs text-muted-foreground">{parameters.turbulenceIntensity.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={parameters.turbulenceIntensity}
                  onChange={(e) => handleParameterChange('turbulenceIntensity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Wind Tunnel Toggles */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parameters.showTrails}
                    onChange={(e) => handleParameterChange('showTrails', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-card-foreground">Show Particle Trails</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parameters.colorByVelocity}
                    onChange={(e) => handleParameterChange('colorByVelocity', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-card-foreground">Color by Velocity</span>
                </label>
              </div>

              {/* Visualization Toggles */}
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-sm font-semibold text-muted-foreground">Visualizations</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parameters.showVelocityVectors}
                    onChange={(e) => handleParameterChange('showVelocityVectors', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-card-foreground">Velocity Vectors</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parameters.showVelocityHeatmap}
                    onChange={(e) => handleParameterChange('showVelocityHeatmap', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-card-foreground">Velocity Heatmap</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parameters.showStreamlines}
                    onChange={(e) => handleParameterChange('showStreamlines', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-card-foreground">Streamlines</span>
                </label>
              </div>

              {/* Aerodynamic Parameters */}
              <div className="space-y-4 pt-2 border-t border-border">
                <h4 className="text-sm font-semibold text-muted-foreground">Aerodynamics</h4>

                {/* Drag Coefficient */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-card-foreground">Drag Coefficient</label>
                    <span className="text-xs text-muted-foreground">{parameters.dragCoefficient.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2.0}
                    step={0.1}
                    value={parameters.dragCoefficient}
                    onChange={(e) => handleParameterChange('dragCoefficient', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Boundary Layer Thickness */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-card-foreground">Boundary Layer</label>
                    <span className="text-xs text-muted-foreground">{parameters.boundaryLayerThickness.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.5}
                    value={parameters.boundaryLayerThickness}
                    onChange={(e) => handleParameterChange('boundaryLayerThickness', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Separation Zone Size */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-card-foreground">Separation Zone</label>
                    <span className="text-xs text-muted-foreground">{parameters.separationZoneSize.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={1}
                    value={parameters.separationZoneSize}
                    onChange={(e) => handleParameterChange('separationZoneSize', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </>
          )}

          {mode === 'coulomb' && (
            <>
          {/* Gravity Constant */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-card-foreground">Gravity Constant</label>
              <span className="text-xs text-muted-foreground">{parameters.gravityConstant.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              step={1}
              value={parameters.gravityConstant}
              onChange={(e) => handleParameterChange('gravityConstant', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Charge Constant */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-card-foreground">Charge Constant</label>
              <span className="text-xs text-muted-foreground">{parameters.chargeConstant.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              step={1}
              value={parameters.chargeConstant}
              onChange={(e) => handleParameterChange('chargeConstant', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Nuclear Constant */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-card-foreground">Nuclear Constant</label>
              <span className="text-xs text-muted-foreground">{parameters.nuclearConstant.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              step={1}
              value={parameters.nuclearConstant}
              onChange={(e) => handleParameterChange('nuclearConstant', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Time Step */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-card-foreground">Time Step</label>
              <span className="text-xs text-muted-foreground">{parameters.timeStep.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={0.001}
              max={0.05}
              step={0.001}
              value={parameters.timeStep}
              onChange={(e) => handleParameterChange('timeStep', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Friction */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-card-foreground">Friction</label>
              <span className="text-xs text-muted-foreground">{parameters.frictionCoefficient.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={parameters.frictionCoefficient}
              onChange={(e) => handleParameterChange('frictionCoefficient', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Max Speed */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-card-foreground">Max Speed</label>
              <span className="text-xs text-muted-foreground">{parameters.maxSpeed.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={parameters.maxSpeed}
              onChange={(e) => handleParameterChange('maxSpeed', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Nuclear Potential */}
          <div>
            <label className="text-sm font-medium block mb-2 text-card-foreground">Nuclear Potential</label>
            <select
              value={parameters.nuclearPotential}
              onChange={(e) => handleParameterChange('nuclearPotential', e.target.value)}
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground text-sm"
            >
              {NUCLEAR_POTENTIALS.map((potential) => (
                <option key={potential} value={potential}>
                  {potential}
                </option>
              ))}
            </select>
          </div>

          {/* Friction Model */}
          <div>
            <label className="text-sm font-medium block mb-2 text-card-foreground">Friction Model</label>
            <select
              value={parameters.frictionModel}
              onChange={(e) => handleParameterChange('frictionModel', e.target.value)}
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground text-sm"
            >
              {FRICTION_MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Options */}
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={parameters.enableCollisions}
                onChange={(e) => handleParameterChange('enableCollisions', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-card-foreground">Enable Collisions</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={parameters.enableBoundary}
                onChange={(e) => handleParameterChange('enableBoundary', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-card-foreground">Enable Boundary</span>
            </label>
          </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
