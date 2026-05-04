'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';
import { WindTunnelRenderer } from './WindTunnelRenderer';
import { ObstacleVisualizer } from './ObstacleVisualizer';
import { SimulationControls } from './SimulationControls';
import { ParametersPanel } from './ParametersPanel';
import { InformationPanel } from './InformationPanel';
import { getBackgroundColor } from '@/lib/utils/themeColors';
import { FPSCounter } from './FPSCounter';

// Component to update scene background color dynamically
function SceneBackgroundUpdater({ color }: { color: string }) {
  const { scene } = useThree();
  const sceneRef = useRef(scene);
  
  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);
  
  useEffect(() => {
    const threeColor = new THREE.Color(color);
    sceneRef.current.background = threeColor;
  }, [color]);
  
  return null;
}

function ParticleContent() {
  const { theme, resolvedTheme } = useTheme();
  const [isRunning, setIsRunning] = useState(true);
  const [particleCount, setParticleCount] = useState(2000); // Reduced for better performance
  const [obstacleType] = useState<string>('drone');
  const [canvasBgColor, setCanvasBgColor] = useState('#000000');
  // Hardcoded to optimal model: Super Cam Reconnaissance
  const selectedModelPath = '/assets/models/super_cam__-_rusian_reconnaissance_drone.glb';
  const [useBoundingBoxSDF, setUseBoundingBoxSDF] = useState<boolean>(false); // Default to actual mesh geometry
  const [forceMetrics] = useState<{
    dragForce?: number;
    dragCoefficient?: number;
    liftForce?: number;
    liftCoefficient?: number;
    momentumDeficit?: number;
  } | null>(null);
  // Use refs for SDF and bounds to prevent unnecessary re-renders
  // Functions and objects are compared by reference, so state updates cause infinite loops
  // Also maintain state variables for render-time access (can't access refs.current during render)
  const droneSDFRef = useRef<((pos: THREE.Vector3) => number) | null>(null);
  const droneBoundsRef = useRef<THREE.Box3 | null>(null);
  const [droneSDF, setDroneSDF] = useState<((pos: THREE.Vector3) => number) | null>(null);
  const [droneBounds, setDroneBounds] = useState<THREE.Box3 | null>(null);
  const [droneSDFVersion, setDroneSDFVersion] = useState(0); // Version counter to trigger updates
  const [particleSize, setParticleSize] = useState(2.0); // Particle size for granular particles
  const [useObjectAwareSpawning, setUseObjectAwareSpawning] = useState(false); // Default: Disabled (user can enable via checkbox)
  const [_modelConfig, setModelConfig] = useState<{ dynamic_source_area?: boolean } | null>(null); // Store model config

  // Manual spawn area controls (can override calculated values)
  const [spawnAreaPosition, setSpawnAreaPosition] = useState({ x: -50, y: 0, z: 0 });
  const [spawnAreaSize, setSpawnAreaSize] = useState({ width: 40, height: 40 });

  const [_parameters, setParameters] = useState({
    gravityConstant: 100,
    chargeConstant: 100,
    nuclearConstant: 100,
    timeStep: 0.01,
    frictionCoefficient: 0.1,
    maxSpeed: 100,
  });
  const [windTunnelParams, setWindTunnelParams] = useState({
    flowSpeed: 10,
    turbulenceIntensity: 0,
    showTrails: false,
    colorByVelocity: true,
    particleLifetime: 30,
  });
  const [simulationParams, setSimulationParams] = useState({
    timeStep: 0.016,
    waveInterval: 0.05,
    particlesPerWave: 10,
    scenario: 'drone',
    integrationMethod: 'rk4' as 'euler' | 'rk2' | 'rk4',
    respawnDistance: 200,
    deflectionStrength: 1.0,
    accelerationFactor: 1.0,
    // CFD parameters
    gridResolution: 48,
    viscosity: 0.001,
    pressureIterations: 40,
    diffusionIterations: 20,
    vorticityScale: 1.0,
    updateEveryNFrames: 2,
  });
  const [statistics, setStatistics] = useState({
    fps: 0,
    totalEnergy: 0,
    collisions: 0,
    avgVelocity: 0,
  });
  const fpsRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  useEffect(() => {
    lastTimeRef.current = Date.now();
  }, []);

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleParameterChange = (param: string, value: string | number | boolean | object) => {
    // Wind tunnel parameters
    if (
      param === 'flowSpeed' ||
      param === 'turbulenceIntensity' ||
      param === 'showTrails' ||
      param === 'colorByVelocity'
    ) {
      setWindTunnelParams((prev) => ({
        ...prev,
        [param]: value,
      }));
    } else if (param === 'particleSize') {
      // Granular particles verification
      setParticleSize(typeof value === 'number' ? value : Number(value));
      console.log('🔬 Particle size changed to:', value);
    } else if (param === 'particleCount') {
      setParticleCount(typeof value === 'number' ? value : Number(value));
      console.log('🔢 Particle count changed to:', value);
    } else if (param === 'useObjectAwareSpawning') {
      // Object-aware spawning toggle
      setUseObjectAwareSpawning(typeof value === 'boolean' ? value : Boolean(value));
      console.log('🎯 Object-aware spawning:', value ? 'ENABLED' : 'DISABLED');
    } else if (param === 'spawnAreaPositionX') {
      setSpawnAreaPosition(prev => ({ ...prev, x: typeof value === 'number' ? value : Number(value) }));
    } else if (param === 'spawnAreaPositionY') {
      setSpawnAreaPosition(prev => ({ ...prev, y: typeof value === 'number' ? value : Number(value) }));
    } else if (param === 'spawnAreaPositionZ') {
      setSpawnAreaPosition(prev => ({ ...prev, z: typeof value === 'number' ? value : Number(value) }));
    } else if (param === 'spawnAreaWidth') {
      setSpawnAreaSize(prev => ({ ...prev, width: typeof value === 'number' ? value : Number(value) }));
    } else if (param === 'spawnAreaHeight') {
      setSpawnAreaSize(prev => ({ ...prev, height: typeof value === 'number' ? value : Number(value) }));
    } else if (
      param === 'timeStep' ||
      param === 'waveInterval' ||
      param === 'particlesPerWave' ||
      param === 'scenario' ||
      param === 'integrationMethod' ||
      param === 'respawnDistance' ||
      param === 'deflectionStrength' ||
      param === 'accelerationFactor' ||
      param === 'gridResolution' ||
      param === 'viscosity' ||
      param === 'pressureIterations' ||
      param === 'diffusionIterations' ||
      param === 'vorticityScale' ||
      param === 'updateEveryNFrames'
    ) {
      // Simulation parameters (including CFD)
      setSimulationParams((prev) => ({
        ...prev,
        [param]: value,
      }));
      console.log(`⚙️ ${param} changed to:`, value);
    } else if (param === 'sdfMode') {
      // SDF mode change (handled by onSDFModeChange callback)
      // This is handled separately via onSDFModeChange prop
      console.log('🔍 SDF mode change requested:', value);
    } else {
      // Coulomb parameters
      setParameters((prev) => {
        const updated = { ...prev };
        const numValue = typeof value === 'number' ? value : Number(value);
        if (param === 'gravityConstant') updated.gravityConstant = numValue;
        else if (param === 'chargeConstant') updated.chargeConstant = numValue;
        else if (param === 'nuclearConstant') updated.nuclearConstant = numValue;
        else if (param === 'timeStep') updated.timeStep = numValue;
        else if (param === 'frictionCoefficient') updated.frictionCoefficient = numValue;
        else if (param === 'maxSpeed') updated.maxSpeed = numValue;
        return updated;
      });
    }
  };

  // Update FPS counter
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastTimeRef.current) / 1000;
      const fps = frameCountRef.current / elapsed;
      fpsRef.current = fps;
      setStatistics((prev) => ({
        ...prev,
        fps: Math.round(fps),
      }));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update canvas background color based on theme
  useEffect(() => {
    const updateBgColor = () => {
      const bgColor = getBackgroundColor();
      setCanvasBgColor(bgColor);
    };
    
    updateBgColor();
    // Update on theme change
    const interval = setInterval(updateBgColor, 100);
    return () => clearInterval(interval);
  }, [theme, resolvedTheme]);

  // Memoize the SDF loaded callback - MUST be called unconditionally (Rules of Hooks)
  const handleSDFLoaded = useCallback((sdf: (pos: THREE.Vector3) => number, bounds: THREE.Box3) => {
    // CRITICAL: Store SDF and bounds for flow field integration
    // Use refs to avoid triggering re-renders on every frame
    droneSDFRef.current = sdf;
    droneBoundsRef.current = bounds;
    // Also set state for render-time access (can't access refs.current during render)
    setDroneSDF(sdf);
    setDroneBounds(bounds);
    // Increment version to trigger velocity field update (only when SDF actually changes)
    setDroneSDFVersion(prev => prev + 1);
    
    // Calculate object dimensions for dynamic wind tunnel
    const size = bounds.getSize(new THREE.Vector3());
    const objectCenter = bounds.getCenter(new THREE.Vector3());
    
    // Use FULL model bounds (width and height) instead of just central area
    // This ensures deflection is calculated for the entire model
    const fullWidth = size.z;  // Full Z dimension (width)
    const fullHeight = size.y; // Full Y dimension (height)
    
    // Calculate and set default spawn area values (user can override via sidebar)
    // Position spawn area upstream of the model, covering full width and height
    const calculatedPosition = {
      x: objectCenter.x - size.x, // Upstream by full model depth
      y: objectCenter.y, // Centered on object Y (covers full height)
      z: objectCenter.z, // Centered on object Z (covers full width)
    };
    const calculatedSize = {
      width: fullWidth,   // Full model width (Z dimension)
      height: fullHeight, // Full model height (Y dimension)
    };
    
    setSpawnAreaPosition(calculatedPosition);
    setSpawnAreaSize(calculatedSize);
    
    console.log('📐 Object bounds loaded for dynamic wind tunnel:', {
      bounds: {
        min: { x: bounds.min.x, y: bounds.min.y, z: bounds.min.z },
        max: { x: bounds.max.x, y: bounds.max.y, z: bounds.max.z },
      },
      size: { x: size.x, y: size.y, z: size.z },
      fullDimensions: {
        width: fullWidth,
        height: fullHeight,
        depth: size.x,
      },
      calculatedSpawnArea: {
        position: calculatedPosition,
        size: calculatedSize,
        note: 'Using FULL model width and height for complete deflection coverage',
      },
    });
    
    console.log('Drone SDF loaded and connected to flow field');
  }, []);

  // Handle bounds for non-mesh obstacles (cylinder, sphere, box)
  const handleBoundsLoaded = useCallback((bounds: THREE.Box3) => {
    // Store bounds for object-aware spawning
    droneBoundsRef.current = bounds;
    // Also set state for render-time access
    setDroneBounds(bounds);
    
    // Calculate object dimensions for dynamic wind tunnel
    const size = bounds.getSize(new THREE.Vector3());
    const objectCenter = bounds.getCenter(new THREE.Vector3());
    
    // Use FULL model bounds (width and height) instead of just central area
    // This ensures deflection is calculated for the entire model
    const fullWidth = size.z;  // Full Z dimension (width)
    const fullHeight = size.y; // Full Y dimension (height)
    
    // Calculate and set default spawn area values (user can override via sidebar)
    // Position spawn area upstream of the model, covering full width and height
    const calculatedPosition = {
      x: objectCenter.x - size.x, // Upstream by full model depth
      y: objectCenter.y, // Centered on object Y (covers full height)
      z: objectCenter.z, // Centered on object Z (covers full width)
    };
    const calculatedSize = {
      width: fullWidth,   // Full model width (Z dimension)
      height: fullHeight, // Full model height (Y dimension)
    };
    
    setSpawnAreaPosition(calculatedPosition);
    setSpawnAreaSize(calculatedSize);
    
    console.log('📐 Obstacle bounds loaded for dynamic wind tunnel:', {
      obstacleType,
      size: { x: size.x, y: size.y, z: size.z },
      fullDimensions: {
        width: fullWidth,
        height: fullHeight,
        depth: size.x,
      },
      calculatedSpawnArea: {
        position: calculatedPosition,
        size: calculatedSize,
        note: 'Using FULL model width and height for complete deflection coverage',
      },
    });
  }, [obstacleType]);

  // Handle model config loaded (for dynamic_source_area)
  // Note: We don't auto-enable based on config - user must explicitly enable via checkbox
  const handleConfigLoaded = useCallback((config: { dynamic_source_area?: boolean }) => {
    setModelConfig(config);
    // Don't auto-set useObjectAwareSpawning from config - let user control it via UI
    console.log('📐 Model config loaded - dynamic_source_area available:', config.dynamic_source_area, '(user controls via checkbox)');
  }, []);

  // Force metrics not calculated for drone (only for cylinder)
  // Keeping forceMetrics state for potential future drone force calculations

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Canvas area */}
      <div className="flex-1 relative">
        <Canvas
          onCreated={() => {
            frameCountRef.current = 0;
            lastTimeRef.current = Date.now();
          }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 100]} fov={75} />
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <pointLight position={[50, 50, 50]} intensity={1} />
          <pointLight position={[-50, -50, -50]} intensity={0.5} />
          <SceneBackgroundUpdater color={canvasBgColor} />
          <FPSCounter 
            isRunning={isRunning} 
            onFrame={() => {
              frameCountRef.current += 1;
            }} 
          />
          <FPSCounter 
            isRunning={isRunning} 
            onFrame={() => {
              frameCountRef.current += 1;
            }} 
          />

          {/* Wind tunnel mode: particles + obstacle visualization */}
          <WindTunnelRenderer
            particleCount={particleCount}
            isRunning={isRunning}
            scenario={simulationParams.scenario}
            flowSpeed={windTunnelParams.flowSpeed}
            showTrails={windTunnelParams.showTrails}
            colorByVelocity={windTunnelParams.colorByVelocity}
            timeStep={simulationParams.timeStep}
            obstacleType={obstacleType}
            meshSDF={droneSDF || undefined}
            meshBounds={droneBounds || undefined}
            droneSDFVersion={droneSDFVersion}
            particleSize={particleSize}
            useObjectAwareSpawning={useObjectAwareSpawning}
            spawnAreaPosition={spawnAreaPosition}
            spawnAreaSize={spawnAreaSize}
          />
          {/* Render obstacle visualization */}
          <ObstacleVisualizer
            obstacleType={obstacleType}
            modelPath={selectedModelPath}
            useBoundingBoxSDF={useBoundingBoxSDF} // false = exact mesh, true = bounding box
            onSDFLoaded={handleSDFLoaded}
            onBoundsLoaded={handleBoundsLoaded}
            onConfigLoaded={handleConfigLoaded}
          />
        </Canvas>
      </div>

      {/* Control panels */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-4 max-h-[calc(100vh-8px)] overflow-y-auto">
        <SimulationControls
          isRunning={isRunning}
          onPlayPause={handlePlayPause}
        />
        <ParametersPanel
          onParameterChange={handleParameterChange}
          mode="windTunnel"
          selectedModelPath={selectedModelPath}
          useBoundingBoxSDF={useBoundingBoxSDF}
          onSDFModeChange={(value) => {
            console.log('🔍 SDF mode changed via ParametersPanel:', value);
            setUseBoundingBoxSDF(value);
          }}
          obstacleType={obstacleType}
          particleSize={particleSize}
          useObjectAwareSpawning={useObjectAwareSpawning}
          spawnAreaPosition={spawnAreaPosition}
          spawnAreaSize={spawnAreaSize}
          particleCount={particleCount}
          timeStep={simulationParams.timeStep}
          waveInterval={simulationParams.waveInterval}
          particlesPerWave={simulationParams.particlesPerWave}
          scenario={simulationParams.scenario}
          integrationMethod={simulationParams.integrationMethod}
          respawnDistance={simulationParams.respawnDistance}
          deflectionStrength={simulationParams.deflectionStrength}
          accelerationFactor={simulationParams.accelerationFactor}
          gridResolution={simulationParams.gridResolution}
          viscosity={simulationParams.viscosity}
          pressureIterations={simulationParams.pressureIterations}
          diffusionIterations={simulationParams.diffusionIterations}
          vorticityScale={simulationParams.vorticityScale}
          updateEveryNFrames={simulationParams.updateEveryNFrames}
          particleLifetime={windTunnelParams.particleLifetime || 30}
          turbulenceIntensity={windTunnelParams.turbulenceIntensity}
        />
        <InformationPanel
          statistics={statistics}
          forceMetrics={forceMetrics || undefined}
          scenario="windTunnelDrone"
        />
      </div>
    </div>
  );
}

export function ParticleSimulatorScene(): React.ReactNode {
  return <ParticleContent />;
}
