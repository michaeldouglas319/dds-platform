'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { FluidModel } from '@/app/business/scene/components/FluidModel';
import type { ModelConfig } from '@/lib/config/content';
import { getFluidConfig, type FluidQuality } from '@/lib/threejs/physics/fluidConfig';
import { detectDeviceCapabilities } from '@/lib/threejs/optimization/deviceCapability';
import { usePathnameBreadcrumbs, useNavigationVisibility } from '@/lib/contexts';

// Available models for simulation
const AVAILABLE_MODELS: { label: string; path: string; scale: number }[] = [
  { label: 'Golden Globe', path: '/assets/models/golden_globe_decoration.glb', scale: 1.0 },
  { label: 'Chess Set', path: '/assets/models/chess_set.glb', scale: 0.5 },
  { label: 'Plane', path: '/assets/models/2_plane.glb', scale: 0.8 },
  { label: 'Dron Low Poly', path: '/assets/models/dron_low_poly_3d_model_gltf/scene.gltf', scale: 1.0 },
  { label: 'Carbon Fiber Texture', path: '/assets/models/carbon_fiber_texture.glb', scale: 0.5 },
  { label: 'Black Honey Robotic Arm', path: '/assets/models/black_honey_robotic_arm_gltf/scene.gltf', scale: 1.0 },
  { label: 'Assembly Line', path: '/assets/models/assembly_line_gltf/scene.gltf', scale: 0.5 },
  { label: 'Drone UAV Wing', path: '/assets/models/drone_uav_wing_desert_camo_gltf/scene.gltf', scale: 0.5 },
];

interface ForceData {
  force: THREE.Vector3;
  velocity: number;
  pressure: number;
}

interface SimulationState {
  isRunning: boolean;
  frameCount: number;
  time: number;
}

interface ModelDimensions {
  width: number;
  height: number;
  depth: number;
  center: THREE.Vector3;
}

export default function DynamicForcesPage() {
  const { setVariant, setShowBreadcrumbs } = useNavigationVisibility();

  // Set breadcrumbs for forces page
  usePathnameBreadcrumbs();

  // Use hidden navigation for full-screen 3D showcase
  useEffect(() => {
    setVariant('hidden');
    setShowBreadcrumbs(false);

    return () => {
      setVariant('full');
      setShowBreadcrumbs(true);
    };
  }, [setVariant, setShowBreadcrumbs]);

  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [fluidQuality, setFluidQuality] = useState<FluidQuality>('low');
  const [forceData, setForceData] = useState<ForceData | null>(null);
  const [simulationState, setSimulationState] = useState<SimulationState>({ isRunning: false, frameCount: 0, time: 0 });
  const [viscosity, setViscosity] = useState(0.00001);
  const [density, setDensity] = useState(1.225);
  const [solverIterations, setSolverIterations] = useState(5);
  const [particleCount, setParticleCount] = useState(10);
  const [visualizationType, setVisualizationType] = useState<'particles' | 'streamlines' | 'velocity' | 'pressure' | 'none'>('particles');
  const [boundaryType, setBoundaryType] = useState<'closed' | 'open' | 'periodic'>('open');
  const [enableVorticity, setEnableVorticity] = useState(false);
  const [updateRate, setUpdateRate] = useState(3);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [modelDimensions, setModelDimensions] = useState<ModelDimensions | null>(null);
  const [modelScaleMultiplier, setModelScaleMultiplier] = useState(1);

  const deviceCapabilities = useMemo(() => detectDeviceCapabilities(), []);

  // Set initial expanded section after mount (avoids hydration mismatch)
  React.useEffect(() => {
    setIsMounted(true);
    setExpandedSection('model');
  }, []);

  // Build fluid config from parameters
  const fluidConfig = useMemo(() => {
    const baseConfig = getFluidConfig(fluidQuality);
    return {
      ...baseConfig,
      viscosity,
      density,
      solverIterations,
      particleCount,
      visualizationType,
      boundaryType,
      enableVorticity,
      updateRate,
    };
  }, [fluidQuality, viscosity, density, solverIterations, particleCount, visualizationType, boundaryType, enableVorticity, updateRate]);

  const modelConfig: ModelConfig = {
    path: selectedModel.path,
    scale: selectedModel.scale * modelScaleMultiplier,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* 3D Canvas */}
      <div className="flex-1 md:w-2/3 w-full h-1/2 md:h-full bg-gradient-to-b from-slate-900 to-slate-950 relative">
        <Canvas
          shadows
          camera={{ position: [3, 3, 3], fov: 75 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 10]} intensity={0.8} castShadow />
          <Environment preset="studio" />

          <FluidModel
            modelConfig={modelConfig}
            fluidConfig={fluidConfig}
            onForceUpdate={setForceData}
            onSimulationStateChange={setSimulationState}
            onModelDimensionsChange={(dims) => setModelDimensions(dims as ModelDimensions | null)}
            // Note: onModelDimensionsChange is optional in FluidModelProps
          />

          <OrbitControls enableZoom enablePan enableRotate />
        </Canvas>

        {/* Status Badge */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg px-4 py-2 text-sm">
          <div className="text-slate-300">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Simulation Active
          </div>
          <div className="text-slate-400 text-xs mt-1">FPS: {simulationState.frameCount}</div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="md:w-1/3 w-full h-1/2 md:h-full bg-slate-900/50 backdrop-blur border-l border-slate-700 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Dynamic Forces</h1>

          {/* Model Selection */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('model')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition"
            >
              <span className="font-semibold text-white">Model Selection</span>
              <span className="text-slate-400">{expandedSection === 'model' ? '▼' : '▶'}</span>
            </button>

            {expandedSection === 'model' && (
              <div className="px-4 py-3 border-t border-slate-700 space-y-3">
                <select
                  value={selectedModel.path}
                  onChange={(e) => {
                    const model = AVAILABLE_MODELS.find((m) => m.path === e.target.value);
                    if (model) {
                      setSelectedModel(model);
                      setModelScaleMultiplier(1); // Reset scale when changing model
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model.path} value={model.path}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">Currently: {selectedModel.label}</p>
              </div>
            )}
          </div>

          {/* Model Dimensions & Scaling */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('scaling')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition"
            >
              <span className="font-semibold text-white">Model Size & Scale</span>
              <span className="text-slate-400">{expandedSection === 'scaling' ? '▼' : '▶'}</span>
            </button>

            {expandedSection === 'scaling' && (
              <div className="px-4 py-3 border-t border-slate-700 space-y-4">
                {modelDimensions ? (
                  <>
                    <div className="bg-slate-700/30 rounded p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Width:</span>
                        <span className="text-blue-400 font-mono">{modelDimensions.width.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Height:</span>
                        <span className="text-green-400 font-mono">{modelDimensions.height.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Depth:</span>
                        <span className="text-purple-400 font-mono">{modelDimensions.depth.toFixed(3)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Scale Multiplier: {modelScaleMultiplier.toFixed(2)}x
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={modelScaleMultiplier}
                        onChange={(e) => setModelScaleMultiplier(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                      />
                      <p className="text-xs text-slate-400 mt-1">Adjust model size relative to base scale</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setModelScaleMultiplier(0.5)}
                        className="flex-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded border border-slate-600 transition"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => setModelScaleMultiplier(1)}
                        className="flex-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded border border-blue-500 transition"
                      >
                        100%
                      </button>
                      <button
                        onClick={() => setModelScaleMultiplier(2)}
                        className="flex-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded border border-slate-600 transition"
                      >
                        200%
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 py-2">Loading model dimensions...</p>
                )}
              </div>
            )}
          </div>

          {/* Quality Presets */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('quality')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition"
            >
              <span className="font-semibold text-white">Quality Preset</span>
              <span className="text-slate-400">{expandedSection === 'quality' ? '▼' : '▶'}</span>
            </button>

            {expandedSection === 'quality' && (
              <div className="px-4 py-3 border-t border-slate-700 space-y-2">
                {(['low', 'medium', 'high', 'ultra'] as const).map((quality) => (
                  <button
                    key={quality}
                    onClick={() => setFluidQuality(quality)}
                    className={`w-full px-3 py-2 rounded border text-sm font-medium transition ${
                      fluidQuality === quality
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Physics Parameters */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('physics')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition"
            >
              <span className="font-semibold text-white">Physics Parameters</span>
              <span className="text-slate-400">{expandedSection === 'physics' ? '▼' : '▶'}</span>
            </button>

            {expandedSection === 'physics' && (
              <div className="px-4 py-3 border-t border-slate-700 space-y-4">
                {/* Viscosity */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Viscosity: {viscosity.toFixed(7)}
                  </label>
                  <input
                    type="range"
                    min="0.000001"
                    max="0.0001"
                    step="0.000001"
                    value={viscosity}
                    onChange={(e) => setViscosity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                  <p className="text-xs text-slate-400 mt-1">Air viscosity ~0.000015 m²/s</p>
                </div>

                {/* Density */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Density: {density.toFixed(3)} kg/m³
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={density}
                    onChange={(e) => setDensity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                  <p className="text-xs text-slate-400 mt-1">Air ~1.225 kg/m³ at sea level</p>
                </div>

                {/* Solver Iterations */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Solver Iterations: {solverIterations}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    value={solverIterations}
                    onChange={(e) => setSolverIterations(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                  <p className="text-xs text-slate-400 mt-1">Higher = more stable, slower</p>
                </div>

                {/* Update Rate */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Update Rate: Every {updateRate} frame(s)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={updateRate}
                    onChange={(e) => setUpdateRate(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                  <p className="text-xs text-slate-400 mt-1">1 = every frame (higher FPS cost)</p>
                </div>
              </div>
            )}
          </div>

          {/* Visualization Settings */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('visualization')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition"
            >
              <span className="font-semibold text-white">Visualization</span>
              <span className="text-slate-400">{expandedSection === 'visualization' ? '▼' : '▶'}</span>
            </button>

            {expandedSection === 'visualization' && (
              <div className="px-4 py-3 border-t border-slate-700 space-y-4">
                {/* Visualization Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Display Mode</label>
                  <select
                    value={visualizationType}
                    onChange={(e) => setVisualizationType(e.target.value as 'particles' | 'streamlines' | 'velocity' | 'pressure' | 'none')}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="particles">Particles</option>
                    <option value="streamlines">Streamlines</option>
                    <option value="velocity">Velocity Field</option>
                    <option value="pressure">Pressure Heatmap</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Particle Count */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Particle Count: {particleCount}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={particleCount}
                    onChange={(e) => setParticleCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded cursor-pointer"
                  />
                  <p className="text-xs text-slate-400 mt-1">More particles = better visualization, higher cost</p>
                </div>

                {/* Enable Vorticity */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableVorticity}
                    onChange={(e) => setEnableVorticity(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-sm font-medium text-slate-300">Show Vorticity</span>
                </label>

                {/* Boundary Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Boundary Conditions</label>
                  <select
                    value={boundaryType}
                    onChange={(e) => setBoundaryType(e.target.value as 'closed' | 'open' | 'periodic')}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="closed">Closed (reflective)</option>
                    <option value="open">Open (absorptive)</option>
                    <option value="periodic">Periodic (wrap-around)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Force Readout */}
          {forceData && (
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-blue-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Current Forces</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Force Magnitude:</span>
                  <span className="text-blue-400 font-mono">{forceData.force.length().toFixed(4)} N</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Velocity:</span>
                  <span className="text-green-400 font-mono">{forceData.velocity.toFixed(4)} m/s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Pressure:</span>
                  <span className="text-orange-400 font-mono">{forceData.pressure.toFixed(2)} Pa</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">X Force:</span>
                    <span className="text-cyan-400 font-mono text-xs">{forceData.force.x.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">Y Force:</span>
                    <span className="text-cyan-400 font-mono text-xs">{forceData.force.y.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Z Force:</span>
                    <span className="text-cyan-400 font-mono text-xs">{forceData.force.z.toFixed(5)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Device Info */}
          {isMounted && (
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 text-xs text-slate-400 space-y-1">
              <div>Device: {deviceCapabilities.isMobile ? 'Mobile' : 'Desktop'}</div>
              <div>GPU Tier: {deviceCapabilities.gpuTier}</div>
              <div>Max Texture: {deviceCapabilities.maxTextureSize}px</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
