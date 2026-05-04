'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';
import { ParticleRenderer } from './ParticleRenderer';
import { WindTunnelRenderer } from './WindTunnelRenderer';
import { ObstacleVisualizer } from './ObstacleVisualizer';
import { SimulationControls } from './SimulationControls';
import { ParametersPanel } from './ParametersPanel';
import { InformationPanel } from './InformationPanel';
import { getBackgroundColor } from '@/lib/utils/themeColors';
import { ForceMetrics } from '../simulation/windTunnel/ForceMetrics';
import { VelocityField } from '../simulation/windTunnel/VelocityField';
import { FlowScenarios } from '../simulation/windTunnel/FlowScenarios';
import { FPSCounter } from './FPSCounter';

interface ParticleSimulatorSceneProps {
  initialParticleCount?: number;
}

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
  const [particleCount, setParticleCount] = useState(5000);
  const [simulationMode, setSimulationMode] = useState<'coulomb' | 'windTunnel'>('coulomb');
  const [selectedScenario, setSelectedScenario] = useState('epn');
  const [obstacleType, setObstacleType] = useState<string>('none');
  const [canvasBgColor, setCanvasBgColor] = useState('#000000');
  const [selectedModelPath, setSelectedModelPath] = useState<string>('/assets/models/super_cam__-_rusian_reconnaissance_drone.glb');
  const [useBoundingBoxSDF, setUseBoundingBoxSDF] = useState<boolean>(false); // Default to actual mesh geometry
  const [forceMetrics, setForceMetrics] = useState<{
    dragForce?: number;
    dragCoefficient?: number;
    liftForce?: number;
    liftCoefficient?: number;
    momentumDeficit?: number;
  } | null>(null);
  const velocityFieldRef = useRef<VelocityField | null>(null);
  // Use refs for SDF and bounds to prevent unnecessary re-renders
  // Functions and objects are compared by reference, so state updates cause infinite loops
  // Also maintain state variables for render-time access (can't access refs.current during render)
  const droneSDFRef = useRef<((pos: THREE.Vector3) => number) | null>(null);
  const droneBoundsRef = useRef<THREE.Box3 | null>(null);
  const [droneSDF, setDroneSDF] = useState<((pos: THREE.Vector3) => number) | null>(null);
  const [droneBounds, setDroneBounds] = useState<THREE.Box3 | null>(null);
  const [droneSDFVersion, setDroneSDFVersion] = useState(0); // Version counter to trigger updates
  const [particleSize, setParticleSize] = useState(0.8); // Particle size for granular particles (smaller for better mesh interaction)
  const [useObjectAwareSpawning, setUseObjectAwareSpawning] = useState(false); // Default: Disabled (user can enable via checkbox)
  const [modelConfig, setModelConfig] = useState<{ dynamic_source_area?: boolean } | null>(null); // Store model config
  
  // Manual spawn area controls (can override calculated values)
  const [spawnAreaPosition, setSpawnAreaPosition] = useState({ x: -50, y: 0, z: 0 });
  const [spawnAreaSize, setSpawnAreaSize] = useState({ width: 40, height: 40 });

  // Map scenario ID to obstacle type
  const scenarioToObstacleMap: Record<string, string> = {
    laminar: 'none',
    cylinder: 'cylinder',
    sphere: 'sphere',
    box: 'box',
    plane: 'plane',
    drone: 'drone',
    shear: 'none',
    vortex: 'none',
    turbulent: 'none',
    vortex_street: 'none',
    airfoil: 'airfoil',
  };
  const [parameters, setParameters] = useState({
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

  const handleFrameCount = useCallback(() => {
    frameCountRef.current += 1;
  }, []);

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleScenarioChange = (scenarioName: string, mode: 'coulomb' | 'windTunnel') => {
    setSelectedScenario(scenarioName);
    setSimulationMode(mode);

    // Update obstacle type based on scenario
    if (mode === 'windTunnel') {
      // Extract scenario ID from full scenario name
      // e.g., "windTunnelLaminar" -> "laminar", "windTunnelPlane" -> "plane"
      let scenarioId = scenarioName.replace('windTunnel', '');
      scenarioId = scenarioId.charAt(0).toLowerCase() + scenarioId.slice(1);

      setObstacleType(scenarioToObstacleMap[scenarioId] || 'none');
    }
  };

  const handleParameterChange = (param: string, value: unknown) => {
    // Wind tunnel parameters
    if (
      param === 'flowSpeed' ||
      param === 'turbulenceIntensity' ||
      param === 'showTrails' ||
      param === 'colorByVelocity'
    ) {
      setWindTunnelParams((prev) => {
        const updated = { ...prev };
        if (param === 'flowSpeed' && typeof value === 'number') {
          updated.flowSpeed = value;
        } else if (param === 'turbulenceIntensity' && typeof value === 'number') {
          updated.turbulenceIntensity = value;
        } else if (param === 'showTrails' && typeof value === 'boolean') {
          updated.showTrails = value;
        } else if (param === 'colorByVelocity' && typeof value === 'boolean') {
          updated.colorByVelocity = value;
        }
        return updated;
      });
    } else if (param === 'particleSize') {
      // Granular particles verification
      if (typeof value === 'number') {
        setParticleSize(value);
        console.log('🔬 Particle size changed to:', value);
      }
    } else if (param === 'useObjectAwareSpawning') {
      // Object-aware spawning toggle
      if (typeof value === 'boolean') {
        setUseObjectAwareSpawning(value);
        console.log('🎯 Object-aware spawning:', value ? 'ENABLED' : 'DISABLED');
      }
    } else if (param === 'spawnAreaPositionX') {
      if (typeof value === 'number') {
        setSpawnAreaPosition(prev => ({ ...prev, x: value }));
      }
    } else if (param === 'spawnAreaPositionY') {
      if (typeof value === 'number') {
        setSpawnAreaPosition(prev => ({ ...prev, y: value }));
      }
    } else if (param === 'spawnAreaPositionZ') {
      if (typeof value === 'number') {
        setSpawnAreaPosition(prev => ({ ...prev, z: value }));
      }
    } else if (param === 'spawnAreaWidth') {
      if (typeof value === 'number') {
        setSpawnAreaSize(prev => ({ ...prev, width: value }));
      }
    } else if (param === 'spawnAreaHeight') {
      if (typeof value === 'number') {
        setSpawnAreaSize(prev => ({ ...prev, height: value }));
      }
    } else if (param === 'sdfMode') {
      // SDF mode change (handled by onSDFModeChange callback)
      // This is handled separately via onSDFModeChange prop
      console.log('🔍 SDF mode change requested:', value);
    } else {
      // Coulomb parameters - add type guards
      if (typeof value === 'number') {
        setParameters((prev) => {
          const updated = { ...prev };
          if (param === 'gravityConstant') updated.gravityConstant = value;
          else if (param === 'chargeConstant') updated.chargeConstant = value;
          else if (param === 'nuclearConstant') updated.nuclearConstant = value;
          else if (param === 'timeStep') updated.timeStep = value;
          else if (param === 'frictionCoefficient') updated.frictionCoefficient = value;
          else if (param === 'maxSpeed') updated.maxSpeed = value;
          return updated;
        });
      }
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

  // Calculate force metrics for cylinder scenario
  useEffect(() => {
    if (simulationMode === 'windTunnel' && obstacleType === 'cylinder') {
      // Create velocity field for force calculation
      let scenarioId = selectedScenario.replace('windTunnel', '');
      scenarioId = scenarioId.charAt(0).toLowerCase() + scenarioId.slice(1);
      
      const field = FlowScenarios.createScenario(scenarioId, windTunnelParams.flowSpeed);
      velocityFieldRef.current = field;
      
      // Calculate forces with a slight delay to ensure field is ready
      const timer = setTimeout(() => {
        try {
          const metrics = ForceMetrics.calculateCylinderForces(
            field,
            windTunnelParams.flowSpeed,
            5.0, // cylinder radius
            1.225 // air density
          );
          
          setForceMetrics({
            dragForce: metrics.dragForce,
            dragCoefficient: metrics.dragCoefficient,
            momentumDeficit: metrics.dragForce * 0.1, // Approximate
          });
        } catch (error) {
          console.error('Error calculating force metrics:', error);
          setForceMetrics(null);
        }
      }, 200);

      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForceMetrics(null);
    }
  }, [simulationMode, selectedScenario, obstacleType, windTunnelParams.flowSpeed]);

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
            onFrame={handleFrameCount} 
          />
          <FPSCounter 
            isRunning={isRunning} 
            onFrame={() => {
              frameCountRef.current += 1;
            }} 
          />

          {/* Particle system - switch between modes */}
          {simulationMode === 'coulomb' ? (
            <ParticleRenderer
              particleCount={particleCount}
              isRunning={isRunning}
              gravityConstant={parameters.gravityConstant / 100}
              chargeConstant={parameters.chargeConstant / 100}
              nuclearConstant={parameters.nuclearConstant / 100}
              timeStep={parameters.timeStep}
              friction={parameters.frictionCoefficient}
              maxSpeed={parameters.maxSpeed}
            />
          ) : (
            <>
              {/* Wind tunnel mode: particles + obstacle visualization */}
              <WindTunnelRenderer
                particleCount={particleCount}
                isRunning={isRunning}
                scenario={
                  (() => {
                    let id = selectedScenario.replace('windTunnel', '');
                    return id.charAt(0).toLowerCase() + id.slice(1);
                  })()
                }
                flowSpeed={windTunnelParams.flowSpeed}
                showTrails={windTunnelParams.showTrails}
                colorByVelocity={windTunnelParams.colorByVelocity}
                obstacleType={obstacleType}
                meshSDF={obstacleType === 'drone' ? droneSDF || undefined : undefined}
                meshBounds={droneBounds || undefined} // Use bounds for all obstacles (drone, cylinder, sphere, box)
                droneSDFVersion={obstacleType === 'drone' ? droneSDFVersion : 0}
                particleSize={particleSize}
                useObjectAwareSpawning={useObjectAwareSpawning && obstacleType !== 'none'}
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
            </>
          )}
        </Canvas>
      </div>

      {/* Control panels */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-4 max-h-[calc(100vh-8px)] overflow-y-auto">
        <SimulationControls
          isRunning={isRunning}
          onPlayPause={handlePlayPause}
          onScenarioChange={handleScenarioChange}
        />
        <ParametersPanel
          onParameterChange={handleParameterChange}
          mode={simulationMode}
          selectedModelPath={selectedModelPath}
          onModelPathChange={setSelectedModelPath}
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
        />
        <InformationPanel
          statistics={statistics}
          forceMetrics={forceMetrics || undefined}
          scenario={selectedScenario}
        />
      </div>
    </div>
  );
}

export function ParticleSimulatorScene({ initialParticleCount = 5000 }: ParticleSimulatorSceneProps) {
  return <ParticleContent />;
}
