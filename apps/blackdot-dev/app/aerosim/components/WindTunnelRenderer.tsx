'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { VelocityField } from '../simulation/windTunnel/VelocityField';
import { FlowScenarios } from '../simulation/windTunnel/FlowScenarios';
import { FluidSimulator } from '../simulation/windTunnel/FluidSimulator';
import { VelocityVisualization } from '../visualization/VelocityVisualization';
import { Streamlines } from '../simulation/windTunnel/Streamlines';
import { WindParticle, spawnWave } from '../simulation/windTunnel/ParticleManager';
import { updateParticles } from '../simulation/windTunnel/ParticleUpdater';
import { logPerformance, getSDFStats } from '../simulation/windTunnel/ParticlePerformance';

interface WindTunnelRendererProps {
  particleCount?: number;
  isRunning?: boolean;
  scenario?: string;
  flowSpeed?: number;
  showTrails?: boolean;
  colorByVelocity?: boolean;
  timeStep?: number;
  obstacleType?: string;
  // Visualization toggles
  showVelocityVectors?: boolean;
  showVelocityHeatmap?: boolean;
  showStreamlines?: boolean;
  // Aerodynamic parameters
  dragCoefficient?: number;
  boundaryLayerThickness?: number;
  separationZoneSize?: number;
  // Mesh SDF for complex geometries (drone, etc.)
  meshSDF?: (pos: THREE.Vector3) => number;
  meshBounds?: THREE.Box3;
  droneSDFVersion?: number; // Version counter to detect SDF changes
  // Granular particles - verification props
  particleSize?: number; // Particle size in world units (default: 2.0)
  useObjectAwareSpawning?: boolean; // Enable object-centered spawning
  // Manual spawn area override (if provided, uses these values instead of calculating)
  spawnAreaPosition?: { x: number; y: number; z: number };
  spawnAreaSize?: { width: number; height: number };
  // Deflection parameters (GOLD STANDARD: user-controllable)
  deflectionStrength?: number;
  accelerationFactor?: number;
  // Particle simulation parameters
  respawnDistance?: number;
  particleLifetime?: number;
  // Turbulence parameter
  turbulenceIntensity?: number;
  // CFD parameters
  gridResolution?: number;
  viscosity?: number;
  pressureIterations?: number;
  diffusionIterations?: number;
  vorticityScale?: number;
  updateEveryNFrames?: number;
  stuckThreshold?: number;
}

// WindParticle interface is now imported from ParticleManager

export function WindTunnelRenderer({
  particleCount = 2000, // Reduced default for better performance
  isRunning = true,
  scenario = 'laminar',
  flowSpeed = 10.0,
  showTrails = false,
  colorByVelocity = true,
  timeStep = 0.016,
  showVelocityVectors = false,
  showVelocityHeatmap = false,
  showStreamlines = false,
  dragCoefficient: _dragCoefficient = 0.5,
  boundaryLayerThickness: _boundaryLayerThickness = 5.0,
  separationZoneSize: _separationZoneSize = 10.0,
  meshSDF,
  meshBounds,
  droneSDFVersion = 0,
  particleSize = 2.0, // Default particle size
  useObjectAwareSpawning = false, // Enable object-aware spawning
  spawnAreaPosition,
  spawnAreaSize,
  deflectionStrength = 1.0,
  accelerationFactor = 1.0,
  respawnDistance = 200,
  particleLifetime = 15.0,
  turbulenceIntensity = 0.0,
  gridResolution = 48,
  viscosity = 0.001,
  pressureIterations = 40,
  diffusionIterations = 20,
  vorticityScale = 1.0,
  updateEveryNFrames = 2,
  stuckThreshold = 0.01,
}: WindTunnelRendererProps) {
  // Store meshSDF in ref for use in useFrame (avoid dependency issues)
  const meshSDFRef = useRef(meshSDF);
  useEffect(() => {
    meshSDFRef.current = meshSDF;
  }, [meshSDF]);
  
  // Points ref for GPU-optimized rendering (like particle-simulator for better visual appearance)
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<WindParticle[]>([]);
  const positionsRef = useRef<Float32Array>(null);
  const colorsRef = useRef<Float32Array>(null);
  const velocityFieldRef = useRef<VelocityField | null>(null);
  const fluidSimulatorRef = useRef<FluidSimulator | null>(null);
  const waveTimerRef = useRef<number>(0);
  const waveIntervalRef = useRef<number>(0.05); // Spawn new particles every 0.05 seconds
  const particlesPerWaveRef = useRef<number>(Math.max(10, Math.ceil(particleCount / 100)));
  const { scene, gl } = useThree();
  const frameSkipCounterRef = useRef<number>(0);
  const performanceStatsRef = useRef({ updateTime: 0, frameTime: 0 });

  // Performance monitoring
  const frameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const _lastLogTimeRef = useRef<number>(Date.now());
  const performanceLogInterval = 1000; // Log every 1 second

  // Visualization refs
  const velocityVectorsRef = useRef<THREE.Group | null>(null);
  const velocityHeatmapRef = useRef<THREE.Mesh | null>(null);
  const streamlinesRef = useRef<THREE.Group | null>(null);

  // Initialize particles and fluid simulator
  // Use droneSDFVersion instead of meshSDF/meshBounds in deps to avoid infinite loops
  useEffect(() => {
    // Create FluidSimulator for real-time CFD
    let simulator: FluidSimulator | VelocityField;
    
    // For drone scenario, use analytical meshFlowWithSDF for explicit deflection
    // This provides better visual deflection around the mesh than CFD solver
    // GOLD STANDARD: Pass user-controllable deflection parameters
    if (scenario === 'drone') {
      if (meshSDF && meshBounds) {
        // Use analytical meshFlowWithSDF for explicit deflection around mesh
        // CRITICAL: Regenerate velocity field when deflection parameters change
        console.log(`🔄 Regenerating velocity field with deflectionStrength=${deflectionStrength}, accelerationFactor=${accelerationFactor}, turbulenceIntensity=${turbulenceIntensity}%`);
        simulator = FlowScenarios.meshFlowWithSDF(flowSpeed, meshSDF, new THREE.Vector3(0, 0, 0), meshBounds, deflectionStrength, accelerationFactor, turbulenceIntensity);
        velocityFieldRef.current = simulator as VelocityField;
        fluidSimulatorRef.current = null;
      } else {
        // SDF not yet available, use uniform flow as placeholder
        simulator = FlowScenarios.uniformLaminarFlow(flowSpeed);
        velocityFieldRef.current = simulator as VelocityField;
        fluidSimulatorRef.current = null;
      }
    } else {
      // For other scenarios, use FluidSimulator with renderer
      simulator = FlowScenarios.createScenario(
        scenario,
        flowSpeed,
        gl, // WebGL renderer
        undefined, // No custom SDF for non-drone scenarios
        undefined, // No custom bounds for non-drone scenarios
        gridResolution, // Use prop value
        deflectionStrength, // GOLD STANDARD: Pass deflection parameters
        accelerationFactor, // GOLD STANDARD: Pass acceleration parameters
        turbulenceIntensity // FIXED: Pass turbulence parameter
      );
      
      if (simulator instanceof FluidSimulator) {
        fluidSimulatorRef.current = simulator;
        velocityFieldRef.current = null;
        
        // Apply CFD parameters
        simulator.setParameters({
          viscosity,
          vorticityScale,
          pressureIterations,
          diffusionIterations,
          dt: timeStep,
        });
      } else {
        // Fallback to VelocityField if simulator creation failed
        velocityFieldRef.current = simulator as VelocityField;
        fluidSimulatorRef.current = null;
      }
    }
    
    // Initialize with empty particles array - will be filled by waves
    const particles: WindParticle[] = [];
    particlesRef.current = particles;
    waveTimerRef.current = 0;

    // Initialize position and color buffers if not already initialized
    if (!positionsRef.current || !colorsRef.current) {
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      positionsRef.current = positions;
      colorsRef.current = colors;
    }

    // Update geometry if points ref exists
    if (pointsRef.current && positionsRef.current && colorsRef.current) {
      const geometry = pointsRef.current.geometry;
      geometry.setAttribute('position', new THREE.BufferAttribute(positionsRef.current, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colorsRef.current, 3));
    }

    // Calculate particles per wave based on target count (reduced for performance)
    const particlesPerWave = Math.max(5, Math.ceil(particleCount / 150));
    particlesPerWaveRef.current = particlesPerWave;

    // Use droneSDFVersion instead of meshSDF/meshBounds to prevent infinite loops
    // CRITICAL: Include deflectionStrength, accelerationFactor, and turbulenceIntensity for real-time updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    particleCount, 
    scenario, 
    flowSpeed, 
    droneSDFVersion, 
    gridResolution, 
    viscosity, 
    pressureIterations, 
    diffusionIterations, 
    vorticityScale, 
    timeStep, 
    deflectionStrength, 
    accelerationFactor, 
    turbulenceIntensity
  ]);

  // Update visualization layers when toggles or field changes
  useEffect(() => {
    const simulator = fluidSimulatorRef.current;
    const field = velocityFieldRef.current;
    
    if (!simulator && !field) return;

    const bounds = simulator ? simulator.getBounds() : field!.getBounds();
    
    // For now, visualization only works with VelocityField
    // TODO: Add visualization support for FluidSimulator
    if (!field) return;

    // Velocity vectors
    if (showVelocityVectors) {
      if (!velocityVectorsRef.current) {
        const vectors = VelocityVisualization.createVelocityVectors(field, {
          gridSpacing: 15,
          arrowScale: 3,
          arrowRadius: 0.2,
          minVelocityThreshold: 0.1,
          colorBySpeed: true,
        });
        velocityVectorsRef.current = vectors;
        scene.add(vectors);
      } else {
        VelocityVisualization.updateVelocityVectors(velocityVectorsRef.current, field, {
          gridSpacing: 15,
          arrowScale: 3,
          arrowRadius: 0.2,
          minVelocityThreshold: 0.1,
          colorBySpeed: true,
        });
      }
      if (velocityVectorsRef.current) {
        velocityVectorsRef.current.visible = true;
      }
    } else {
      if (velocityVectorsRef.current) {
        velocityVectorsRef.current.visible = false;
      }
    }

    // Velocity heatmap (2D plane at z=0)
    if (showVelocityHeatmap) {
      if (!velocityHeatmapRef.current) {
        const texture = VelocityVisualization.createVelocityHeatmap(
          field,
          new THREE.Vector3(0, 0, 1), // Z-normal plane
          0, // z=0
          256
        );

        const size = Math.min(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y);
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(0, 0, 0);
        plane.rotation.x = -Math.PI / 2; // Lay flat in XY plane
        velocityHeatmapRef.current = plane;
        scene.add(plane);
      } else {
        // Update texture
        const texture = VelocityVisualization.createVelocityHeatmap(
          field,
          new THREE.Vector3(0, 0, 1),
          0,
          256
        );
        if (velocityHeatmapRef.current.material instanceof THREE.MeshBasicMaterial) {
          velocityHeatmapRef.current.material.map?.dispose();
          velocityHeatmapRef.current.material.map = texture;
          velocityHeatmapRef.current.material.needsUpdate = true;
        }
      }
      if (velocityHeatmapRef.current) {
        velocityHeatmapRef.current.visible = true;
      }
    } else {
      if (velocityHeatmapRef.current) {
        velocityHeatmapRef.current.visible = false;
      }
    }

    // Streamlines
    if (showStreamlines) {
      if (!streamlinesRef.current) {
        const inletBounds = {
          min: new THREE.Vector3(Math.max(bounds.min.x - 10, -10), bounds.min.y, bounds.min.z),
          max: new THREE.Vector3(Math.max(bounds.min.x - 10, -10), bounds.max.y, bounds.max.z),
        };

        const streamlines = Streamlines.generateStreamlines(field, inletBounds, {
          gridResolution: 8,
          maxSteps: 150,
          timeStep: 0.1,
          minVelocity: 0.01,
        });

        // Use colored streamlines with velocity-based coloring
        const lines = Streamlines.createColoredStreamlineTubes(
          streamlines,
          field,
          0.5,  // tubeRadius
          8,    // radialSegments
          flowSpeed * 2 // maxSpeed for color normalization
        );
        streamlinesRef.current = lines;
        scene.add(lines);
      }
      if (streamlinesRef.current) {
        streamlinesRef.current.visible = true;
      }
    } else {
      if (streamlinesRef.current) {
        streamlinesRef.current.visible = false;
      }
    }
  }, [showVelocityVectors, showVelocityHeatmap, showStreamlines, scenario, flowSpeed, scene]);

  // Cleanup visualization on unmount
  useEffect(() => {
    return () => {
      if (velocityVectorsRef.current) {
        scene.remove(velocityVectorsRef.current);
        velocityVectorsRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) {
              child.material.dispose();
            }
          }
        });
      }
      if (velocityHeatmapRef.current) {
        scene.remove(velocityHeatmapRef.current);
        velocityHeatmapRef.current.geometry.dispose();
        if (velocityHeatmapRef.current.material instanceof THREE.Material) {
          velocityHeatmapRef.current.material.dispose();
        }
      }
      if (streamlinesRef.current) {
        scene.remove(streamlinesRef.current);
        streamlinesRef.current.traverse((child) => {
          if (child instanceof THREE.Line) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, [scene]);

  // Spawn wave function is now imported from ParticleManager
  const handleSpawnWave = () => {
    const simulator = fluidSimulatorRef.current;
    const field = velocityFieldRef.current;
    
    if (!simulator && !field) {
      return;
    }

    const particles = particlesRef.current;
    const bounds = simulator ? simulator.getBounds() : field!.getBounds();
    
    spawnWave(
      particles,
      particleCount,
      particlesPerWaveRef.current,
      bounds,
      flowSpeed,
      particleLifetime,
      spawnAreaPosition,
      spawnAreaSize,
      useObjectAwareSpawning,
      meshBounds
    );
  };

  // Animation loop
  useFrame((state, delta) => {
    if (
      !isRunning ||
      !pointsRef.current ||
      (!velocityFieldRef.current && !fluidSimulatorRef.current)
    ) {
      return;
    }

    // Performance monitoring
    const frameStart = performance.now();
    frameCountRef.current++;

    // Spawn new wave of particles at regular intervals
    waveTimerRef.current += timeStep;
    if (waveTimerRef.current >= waveIntervalRef.current) {
      handleSpawnWave();
      waveTimerRef.current = 0;
    }

    const particles = particlesRef.current;
    const simulator = fluidSimulatorRef.current;
    const field = velocityFieldRef.current;
    
    // Update CFD parameters if they changed (check every frame, but only update simulator when needed)
    if (simulator) {
      // Update parameters dynamically (they may have changed via UI)
      simulator.setParameters({
        viscosity,
        vorticityScale,
        pressureIterations,
        diffusionIterations,
        dt: timeStep,
      });
    } else if (field) {
      // Debug: Log when using analytical VelocityField instead of CFD
      if (frameCountRef.current % 300 === 0) { // Log every 5 seconds at 60fps
      }
    }
    
    // Update CFD simulation (every N frames for performance)
    frameSkipCounterRef.current++;
    if (simulator && frameSkipCounterRef.current >= updateEveryNFrames) {
      const updateStart = performance.now();
      simulator.update(); // This now includes syncVelocityData()
      performanceStatsRef.current.updateTime = performance.now() - updateStart;
      frameSkipCounterRef.current = 0;
      
      // Debug: Log when CFD updates
      if (frameCountRef.current % 180 === 0) { // Every 3 seconds at 60fps
        console.log('🔄 CFD simulation updated', {
          updateTime: `${performanceStatsRef.current.updateTime.toFixed(2)}ms`,
          gridResolution: `${gridResolution}³`,
        });
      }
    }
    
    // Update performance stats
    performanceStatsRef.current.frameTime = delta * 1000; // Convert to ms
    
    // Log performance stats periodically (every 60 frames ~ 1 second at 60fps)
    if (frameCountRef.current % 60 === 0 && simulator) {
      const stats = performanceStatsRef.current;
      console.log('📊 CFD Performance:', {
        updateTime: `${stats.updateTime.toFixed(2)}ms`,
        frameTime: `${stats.frameTime.toFixed(2)}ms`,
        fps: `${(1000 / stats.frameTime).toFixed(1)}`,
        gridResolution: `${gridResolution}³`,
        updateRate: `Every ${updateEveryNFrames} frames`,
      });
    }
    
    // Get bounds from simulator or field
    const bounds = simulator ? simulator.getBounds() : (field ? field.getBounds() : null);
    if (!bounds) return;
    
    const positions = positionsRef.current;
    const colors = colorsRef.current;
    if (!positions || !colors) return;

    // Update particles using extracted module
    // Expanded to cover spawn position at x=-10 (upstream)
    const inletExclusionZone = 30.0; // Don't check edges/stuck near inlet
    const extremeStats = updateParticles({
      particles,
      bounds,
      simulator,
      field,
      meshSDF: meshSDFRef.current,
      timeStep,
      flowSpeed,
      colorByVelocity,
      showTrails,
      stuckThreshold,
      particleLifetime,
      inletExclusionZone,
      respawnDistance, // FIXED: Pass respawnDistance parameter
      spawnAreaPosition,
      spawnAreaSize,
      useObjectAwareSpawning,
      meshBounds,
    });

    // Update position and color buffers
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
      
      colors[i * 3] = particle.color.r;
      colors[i * 3 + 1] = particle.color.g;
      colors[i * 3 + 2] = particle.color.b;
    }

    // Mark buffers for update
    const geometry = pointsRef.current.geometry;
    const posAttr = geometry.getAttribute('position');
    const colAttr = geometry.getAttribute('color');
    if (posAttr) {
      (posAttr as THREE.BufferAttribute).needsUpdate = true;
    }
    if (colAttr) {
      (colAttr as THREE.BufferAttribute).needsUpdate = true;
    }

    // Performance logging (every ~1 second)
    const frameTime = performance.now() - frameStart;
    frameTimeRef.current = frameTime;
    
    // Type guard: meshSDFRef.current might be a plain function, but getSDFStats expects MeshSDFWithStats
    const sdfStats = meshSDFRef.current && typeof meshSDFRef.current === 'function' && ('__voxelGrid' in meshSDFRef.current || '__meshSDFInstance' in meshSDFRef.current)
      ? getSDFStats(meshSDFRef.current as Parameters<typeof getSDFStats>[0])
      : null;
    logPerformance(
      frameCountRef.current,
      frameTime,
      particles.length,
      delta,
      sdfStats,
      performanceLogInterval,
      extremeStats || null
    );
  });

  // Initialize position and color buffers on mount/update
  useEffect(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const defaultColor = new THREE.Color(0.5, 0.7, 1.0); // Default cyan
    
    for (let i = 0; i < particleCount; i++) {
      colors[i * 3] = defaultColor.r;
      colors[i * 3 + 1] = defaultColor.g;
      colors[i * 3 + 2] = defaultColor.b;
    }
    
    positionsRef.current = positions;
    colorsRef.current = colors;
    
    if (pointsRef.current) {
      const geometry = pointsRef.current.geometry;
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
  }, [particleCount]);

  const posArray = positionsRef.current || new Float32Array(particleCount * 3);
  const colArray = colorsRef.current || new Float32Array(particleCount * 3);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[posArray, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colArray, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particleSize}
        vertexColors
        sizeAttenuation={true}
        transparent
        opacity={0.8}
        toneMapped={false}
      />
    </points>
  );
}
