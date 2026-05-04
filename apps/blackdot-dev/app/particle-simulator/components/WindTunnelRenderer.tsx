'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { VelocityField } from '../simulation/windTunnel/VelocityField';
import { FlowScenarios } from '../simulation/windTunnel/FlowScenarios';
import { ParticleAdvection } from '../simulation/windTunnel/ParticleAdvection';
import { VelocityVisualization } from '../visualization/VelocityVisualization';
import { Streamlines } from '../simulation/windTunnel/Streamlines';

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
}

// Performance metrics tracking
interface PerformanceMetrics {
  sdfQueryTime: number;
  sdfCacheHits: number;
  sdfCacheMisses: number;
  avgParticleUpdateTime: number;
  frameTime: number;
}

interface WindParticle {
  position: THREE.Vector3;
  color: THREE.Color;
  trail: THREE.Vector3[];
  age: number; // Time since spawned
}

export function WindTunnelRenderer({
  particleCount = 5000,
  isRunning = true,
  scenario = 'laminar',
  flowSpeed = 10.0,
  showTrails = false,
  colorByVelocity = true,
  timeStep = 0.016,
  showVelocityVectors = false,
  showVelocityHeatmap = false,
  showStreamlines = false,
  dragCoefficient = 0.5,
  boundaryLayerThickness = 5.0,
  separationZoneSize = 10.0,
  meshSDF,
  meshBounds,
  droneSDFVersion = 0,
  particleSize = 2.0, // Default particle size
  useObjectAwareSpawning = false, // Enable object-aware spawning
  spawnAreaPosition,
  spawnAreaSize,
}: WindTunnelRendererProps) {
  // Store meshSDF in ref for use in useFrame (avoid dependency issues)
  const meshSDFRef = useRef(meshSDF);
  useEffect(() => {
    meshSDFRef.current = meshSDF;
  }, [meshSDF]);
  
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<WindParticle[]>([]);
  const positionsRef = useRef<Float32Array>(null);
  const colorsRef = useRef<Float32Array>(null);
  const velocityFieldRef = useRef<VelocityField | null>(null);
  const waveTimerRef = useRef<number>(0);
  const waveIntervalRef = useRef<number>(0.05); // Spawn new particles every 0.05 seconds
  const particlesPerWaveRef = useRef<number>(Math.max(10, Math.ceil(particleCount / 100)));
  const { scene } = useThree();

  // Performance metrics tracking
  const metricsRef = useRef<PerformanceMetrics>({
    sdfQueryTime: 0,
    sdfCacheHits: 0,
    sdfCacheMisses: 0,
    avgParticleUpdateTime: 0,
    frameTime: 0,
  });
  const frameTimeStartRef = useRef<number>(0);

  // Visualization refs
  const velocityVectorsRef = useRef<THREE.Group | null>(null);
  const velocityHeatmapRef = useRef<THREE.Mesh | null>(null);
  const streamlinesRef = useRef<THREE.Group | null>(null);

  // Initialize particles and velocity field
  // Use droneSDFVersion instead of meshSDF/meshBounds in deps to avoid infinite loops
  // Functions and objects are compared by reference, causing re-renders every frame
  useEffect(() => {
    // Create velocity field based on scenario
    // For drone scenario, pass mesh SDF if available
    const field = FlowScenarios.createScenario(
      scenario,
      flowSpeed,
      undefined, // aerodynamicParams
      scenario === 'drone' ? meshSDF : undefined,
      scenario === 'drone' ? meshBounds : undefined
    );
    
    if (scenario === 'drone' && meshSDF && meshBounds) {
      // Test SDF at a few points to verify it's using actual mesh geometry
      const testPoints = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(10, 0, 0),
        new THREE.Vector3(0, 10, 0),
        new THREE.Vector3(0, 0, 10),
      ];
      const sdfValues = testPoints.map(p => meshSDF(p));
      
      console.log('✅ Drone flow: Using EXACT mesh SDF with potential flow physics', {
        hasSDF: !!meshSDF,
        hasBounds: !!meshBounds,
        bounds: {
          min: { x: meshBounds.min.x, y: meshBounds.min.y, z: meshBounds.min.z },
          max: { x: meshBounds.max.x, y: meshBounds.max.y, z: meshBounds.max.z },
        },
        sdfTestValues: sdfValues,
        note: 'SDF values should vary based on actual mesh geometry, not be uniform (which would indicate sphere/box approximation)',
      });
    } else if (scenario === 'drone') {
      console.warn('⚠️ Drone flow: No mesh SDF provided, using fallback bounding box approximation');
    }
    
    velocityFieldRef.current = field;

    // Initialize with empty particles array - will be filled by waves
    const particles: WindParticle[] = [];
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Initialize all positions/colors to zero (will be populated by waves)
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = 0;
      colors[i] = 0;
    }

    particlesRef.current = particles;
    positionsRef.current = positions;
    colorsRef.current = colors;
    waveTimerRef.current = 0;

    // Calculate particles per wave based on target count
    const particlesPerWave = Math.max(10, Math.ceil(particleCount / 100));
    particlesPerWaveRef.current = particlesPerWave;

    // Update geometry
    if (pointsRef.current) {
      const geometry = pointsRef.current.geometry;
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
    // Use droneSDFVersion instead of meshSDF/meshBounds to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particleCount, scenario, flowSpeed, droneSDFVersion]);

  // Update visualization layers when toggles or field changes
  useEffect(() => {
    if (!velocityFieldRef.current) return;

    const field = velocityFieldRef.current;
    const bounds = field.getBounds();

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
          min: new THREE.Vector3(bounds.min.x + 5, bounds.min.y, bounds.min.z),
          max: new THREE.Vector3(bounds.min.x + 5, bounds.max.y, bounds.max.z),
        };

        const streamlines = Streamlines.generateStreamlines(field, inletBounds, {
          gridResolution: 8,
          maxSteps: 150,
          timeStep: 0.1,
          minVelocity: 0.01,
        });

        const lines = Streamlines.createStreamlineLines(streamlines, new THREE.Color(0x4488ff));
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

  /**
   * Spawn a new wave of particles at the inlet
   * Particles spawn randomly across the inlet cross-section
   * OR object-centered if useObjectAwareSpawning is enabled
   */
  const spawnWave = () => {
    if (!velocityFieldRef.current || !positionsRef.current || !colorsRef.current) {
      return;
    }

    const particles = particlesRef.current;
    const positions = positionsRef.current;
    const colors = colorsRef.current;
    const field = velocityFieldRef.current;
    const bounds = field.getBounds();
    
    let inletX: number;
    let spawnYMin: number, spawnYMax: number;
    let spawnZMin: number, spawnZMax: number;
    
    // Use manual spawn area if provided, otherwise calculate from object bounds
    if (spawnAreaPosition && spawnAreaSize) {
      // Manual override: Use values from sidebar
      inletX = spawnAreaPosition.x;
      spawnYMin = spawnAreaPosition.y - spawnAreaSize.height / 2;
      spawnYMax = spawnAreaPosition.y + spawnAreaSize.height / 2;
      spawnZMin = spawnAreaPosition.z - spawnAreaSize.width / 2;
      spawnZMax = spawnAreaPosition.z + spawnAreaSize.width / 2;
      
      // Clamp to velocity field bounds
      spawnYMin = Math.max(spawnYMin, bounds.min.y);
      spawnYMax = Math.min(spawnYMax, bounds.max.y);
      spawnZMin = Math.max(spawnZMin, bounds.min.z);
      spawnZMax = Math.min(spawnZMax, bounds.max.z);
      
      console.log('🎯 Manual spawn area override:', {
        position: spawnAreaPosition,
        size: spawnAreaSize,
        spawnArea: {
          y: [spawnYMin, spawnYMax],
          z: [spawnZMin, spawnZMax],
        },
        inletX,
      });
    } else if (useObjectAwareSpawning && meshBounds) {
      // Object-aware spawning: Source area matches object's two largest dimensions
      const objectCenter = meshBounds.getCenter(new THREE.Vector3());
      const objectSize = meshBounds.getSize(new THREE.Vector3());
      
      // Get the two largest dimensions (for Y and Z spawn plane)
      const dimensions = [objectSize.x, objectSize.y, objectSize.z].sort((a, b) => b - a);
      const largestDim = dimensions[0];   // Largest dimension
      const secondLargestDim = dimensions[1]; // Second largest dimension
      
      // Spawn area: Use two largest dimensions for Y and Z
      // This creates a dynamic wind tunnel that adapts to object shape
      const spawnHeight = largestDim;      // Y dimension (height)
      const spawnWidth = secondLargestDim;  // Z dimension (width)
      
      // Spawn upstream of object, centered on object
      // Position inlet slightly upstream (1x largest dimension)
      inletX = objectCenter.x - largestDim;
      
      // Center spawn area on object, use two largest dimensions
      spawnYMin = objectCenter.y - spawnHeight / 2;
      spawnYMax = objectCenter.y + spawnHeight / 2;
      spawnZMin = objectCenter.z - spawnWidth / 2;
      spawnZMax = objectCenter.z + spawnWidth / 2;
      
      // Clamp to velocity field bounds
      spawnYMin = Math.max(spawnYMin, bounds.min.y);
      spawnYMax = Math.min(spawnYMax, bounds.max.y);
      spawnZMin = Math.max(spawnZMin, bounds.min.z);
      spawnZMax = Math.min(spawnZMax, bounds.max.z);
      
      console.log('🎯 Dynamic wind tunnel - Object-aware spawning:', {
        objectSize: { x: objectSize.x, y: objectSize.y, z: objectSize.z },
        largestDimensions: [largestDim, secondLargestDim],
        spawnArea: { 
          height: spawnHeight, 
          width: spawnWidth,
          y: [spawnYMin, spawnYMax], 
          z: [spawnZMin, spawnZMax] 
        },
        inletX,
      });
    } else {
      // Default: Full velocity field cross-section
      inletX = bounds.min.x + 5;
      spawnYMin = bounds.min.y;
      spawnYMax = bounds.max.y;
      spawnZMin = bounds.min.z;
      spawnZMax = bounds.max.z;
    }

    // Spawn new particles up to the limit with FULLY RANDOM positions
    for (let i = 0; i < particlesPerWaveRef.current; i++) {
      if (particles.length < particleCount) {
        // Randomize across spawn area (object-aware or full field)
        const y = spawnYMin + Math.random() * (spawnYMax - spawnYMin);
        const z = spawnZMin + Math.random() * (spawnZMax - spawnZMin);
        
        // Add small random offset in X to prevent clustering
        const x = inletX + (Math.random() - 0.5) * 2;

        const position = new THREE.Vector3(x, y, z);
        const color = new THREE.Color(0.5, 0.7, 1.0); // Default cyan

        const particleIndex = particles.length;
        particles.push({
          position: position.clone(),
          color: color,
          trail: [position.clone()],
          age: 0,
        });

        // Update buffers for this particle
        positions[particleIndex * 3] = position.x;
        positions[particleIndex * 3 + 1] = position.y;
        positions[particleIndex * 3 + 2] = position.z;

        colors[particleIndex * 3] = color.r;
        colors[particleIndex * 3 + 1] = color.g;
        colors[particleIndex * 3 + 2] = color.b;
      }
    }
  };

  // Animation loop with performance tracking
  useFrame(() => {
    frameTimeStartRef.current = performance.now();

    if (
      !isRunning ||
      !pointsRef.current ||
      !positionsRef.current ||
      !velocityFieldRef.current
    ) {
      return;
    }

    // Spawn new wave of particles at regular intervals
    waveTimerRef.current += timeStep;
    if (waveTimerRef.current >= waveIntervalRef.current) {
      spawnWave();
      waveTimerRef.current = 0;
    }

    const particles = particlesRef.current;
    const positions = positionsRef.current;
    const colors = colorsRef.current;
    const field = velocityFieldRef.current;
    const bounds = field.getBounds();

    // Advect particles
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      // Update particle age
      particle.age += timeStep;

      // CRITICAL: Check for collision with mesh using SDF BEFORE advection
      // This prevents particles from clipping through geometry
      let isInsideObstacle = false;
      let sdfValue = Infinity;

      // Use mesh SDF directly if available (more accurate than field.getSignedDistance)
      const currentMeshSDF = meshSDFRef.current;
      if (currentMeshSDF) {
        sdfValue = currentMeshSDF(particle.position);
        // Check if inside or very close to surface (within particle size)
        if (sdfValue < particleSize * 0.5) {
          isInsideObstacle = true;
        }
      } else if (field.getSignedDistance) {
        sdfValue = field.getSignedDistance(particle.position);
        if (sdfValue < particleSize * 0.5) {
          isInsideObstacle = true;
        }
      }

      if (isInsideObstacle) {
        // Particle inside obstacle - push it out along SDF gradient with FINE precision
        if (currentMeshSDF) {
          // Use FINER epsilon for better accuracy with actual mesh geometry
          // This helps particles find grooves and surface features
          const epsilon = 0.05; // Smaller epsilon = finer surface detail
          const gradX = (currentMeshSDF(new THREE.Vector3(particle.position.x + epsilon, particle.position.y, particle.position.z)) -
                        currentMeshSDF(new THREE.Vector3(particle.position.x - epsilon, particle.position.y, particle.position.z))) / (2 * epsilon);
          const gradY = (currentMeshSDF(new THREE.Vector3(particle.position.x, particle.position.y + epsilon, particle.position.z)) -
                        currentMeshSDF(new THREE.Vector3(particle.position.x, particle.position.y - epsilon, particle.position.z))) / (2 * epsilon);
          const gradZ = (currentMeshSDF(new THREE.Vector3(particle.position.x, particle.position.y, particle.position.z + epsilon)) -
                        currentMeshSDF(new THREE.Vector3(particle.position.x, particle.position.y, particle.position.z - epsilon))) / (2 * epsilon);

          const gradient = new THREE.Vector3(gradX, gradY, gradZ);
          if (gradient.length() > 0.001) {
            const normal = gradient.normalize();
            // IMPROVED: Push particle out more gently to allow settling in grooves
            // Use smaller safety margin to keep particles close to surface features
            const pushDistance = Math.max(particleSize * 0.3, Math.abs(sdfValue) + 0.2);
            particle.position.add(normal.multiplyScalar(pushDistance));
          } else {
            // Fallback: reset to inlet
            const inletX = bounds.min.x + 5;
            particle.position.set(
              inletX,
              bounds.min.y + Math.random() * (bounds.max.y - bounds.min.y),
              bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z)
            );
          }
        } else {
          // No SDF available - reset to random inlet position
          const inletX = bounds.min.x + 5;
          particle.position.set(
            inletX,
            bounds.min.y + Math.random() * (bounds.max.y - bounds.min.y),
            bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z)
          );
        }
        particle.trail = [particle.position.clone()];
        particle.age = 0;
      } else {
        // Advect particle using RK4
        const newPosition = ParticleAdvection.advectRK4(
          particle.position,
          field,
          timeStep
        );
        
        // CRITICAL: Check for collision AFTER advection and correct if needed
        // This prevents particles from stepping through thin geometry (like wings)
        if (currentMeshSDF) {
          const newSdfValue = currentMeshSDF(newPosition);
          // Check if close to or inside surface
          if (newSdfValue < particleSize * 0.5) {
            // Particle stepped into mesh during advection - push it back with fine precision
            const epsilon = 0.05; // Finer epsilon for surface detail
            const gradX = (currentMeshSDF(new THREE.Vector3(newPosition.x + epsilon, newPosition.y, newPosition.z)) -
                          currentMeshSDF(new THREE.Vector3(newPosition.x - epsilon, newPosition.y, newPosition.z))) / (2 * epsilon);
            const gradY = (currentMeshSDF(new THREE.Vector3(newPosition.x, newPosition.y + epsilon, newPosition.z)) -
                          currentMeshSDF(new THREE.Vector3(newPosition.x, newPosition.y - epsilon, newPosition.z))) / (2 * epsilon);
            const gradZ = (currentMeshSDF(new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z + epsilon)) -
                          currentMeshSDF(new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z - epsilon))) / (2 * epsilon);

            const gradient = new THREE.Vector3(gradX, gradY, gradZ);
            if (gradient.length() > 0.001) {
              const normal = gradient.normalize();
              // IMPROVED: Push particle out gently to surface, allowing settling
              const pushDistance = Math.max(particleSize * 0.25, Math.abs(newSdfValue) + 0.15);
              newPosition.add(normal.multiplyScalar(pushDistance));
            } else {
              // Can't compute gradient - revert to previous position
              newPosition.copy(particle.position);
            }
          }
        }
        
        particle.position.copy(newPosition);
      }

      // Update color based on velocity if enabled
      if (colorByVelocity) {
        const velocity = field.sampleVelocity(particle.position);
        const speed = velocity.length();
        const maxSpeed = flowSpeed * 2;

        // Color gradient from blue (slow) to red (fast)
        const hue = Math.max(0, 1 - Math.min(speed / maxSpeed, 1)) * 0.67; // 0.67 = blue hue
        particle.color.setHSL(hue, 1, 0.5);
      }

      // Store trail if enabled
      if (showTrails) {
        particle.trail.push(particle.position.clone());
        // Keep only last 50 positions for performance
        if (particle.trail.length > 50) {
          particle.trail.shift();
        }
      }

      // Recycle particles that exit domain - Use manual or object-aware respawn
      let respawnX: number;
      let respawnYMin: number, respawnYMax: number;
      let respawnZMin: number, respawnZMax: number;
      
      // Use manual spawn area if provided, otherwise calculate from object bounds
      if (spawnAreaPosition && spawnAreaSize) {
        // Manual override: Use values from sidebar
        respawnX = spawnAreaPosition.x;
        respawnYMin = spawnAreaPosition.y - spawnAreaSize.height / 2;
        respawnYMax = spawnAreaPosition.y + spawnAreaSize.height / 2;
        respawnZMin = spawnAreaPosition.z - spawnAreaSize.width / 2;
        respawnZMax = spawnAreaPosition.z + spawnAreaSize.width / 2;
        
        // Clamp to velocity field bounds
        respawnYMin = Math.max(respawnYMin, bounds.min.y);
        respawnYMax = Math.min(respawnYMax, bounds.max.y);
        respawnZMin = Math.max(respawnZMin, bounds.min.z);
        respawnZMax = Math.min(respawnZMax, bounds.max.z);
      } else if (useObjectAwareSpawning && meshBounds) {
        const objectCenter = meshBounds.getCenter(new THREE.Vector3());
        const objectSize = meshBounds.getSize(new THREE.Vector3());
        const dimensions = [objectSize.x, objectSize.y, objectSize.z].sort((a, b) => b - a);
        const largestDim = dimensions[0];
        const secondLargestDim = dimensions[1];
        
        respawnX = objectCenter.x - largestDim;
        respawnYMin = objectCenter.y - largestDim / 2;
        respawnYMax = objectCenter.y + largestDim / 2;
        respawnZMin = objectCenter.z - secondLargestDim / 2;
        respawnZMax = objectCenter.z + secondLargestDim / 2;
        
        // Clamp to bounds
        respawnYMin = Math.max(respawnYMin, bounds.min.y);
        respawnYMax = Math.min(respawnYMax, bounds.max.y);
        respawnZMin = Math.max(respawnZMin, bounds.min.z);
        respawnZMax = Math.min(respawnZMax, bounds.max.z);
      } else {
        respawnX = bounds.min.x + 5;
        respawnYMin = bounds.min.y;
        respawnYMax = bounds.max.y;
        respawnZMin = bounds.min.z;
        respawnZMax = bounds.max.z;
      }
      
      if (particle.position.x > bounds.max.x) {
        // Reset to inlet with RANDOM y, z position (object-aware or full field)
        particle.position.set(
          respawnX,
          respawnYMin + Math.random() * (respawnYMax - respawnYMin),
          respawnZMin + Math.random() * (respawnZMax - respawnZMin)
        );
        particle.trail = [particle.position.clone()];
        particle.age = 0; // Reset age
      }
      
      // Also recycle particles that go too far back or out of bounds
      if (particle.position.x < bounds.min.x - 10) {
        particle.position.set(
          respawnX,
          respawnYMin + Math.random() * (respawnYMax - respawnYMin),
          respawnZMin + Math.random() * (respawnZMax - respawnZMin)
        );
        particle.trail = [particle.position.clone()];
        particle.age = 0;
      }

      // Clamp y and z to bounds
      if (particle.position.y < bounds.min.y || particle.position.y > bounds.max.y) {
        particle.position.y = Math.max(bounds.min.y, Math.min(bounds.max.y, particle.position.y));
      }
      if (particle.position.z < bounds.min.z || particle.position.z > bounds.max.z) {
        particle.position.z = Math.max(bounds.min.z, Math.min(bounds.max.z, particle.position.z));
      }

      // Update buffers
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;

      if (colors) {
        colors[i * 3] = particle.color.r;
        colors[i * 3 + 1] = particle.color.g;
        colors[i * 3 + 2] = particle.color.b;
      }
    }

    // Mark for update
    const geometry = pointsRef.current.geometry;
    const posAttr = geometry.getAttribute('position');
    const colAttr = geometry.getAttribute('color');
    if (posAttr) {
      (posAttr as THREE.BufferAttribute).needsUpdate = true;
    }
    if (colAttr) {
      (colAttr as THREE.BufferAttribute).needsUpdate = true;
    }

    // Track frame time
    metricsRef.current.frameTime = performance.now() - frameTimeStartRef.current;

    // Log performance every second (60 frames at 60fps)
    if (particlesRef.current.length > 0 && Math.random() < 0.016) {
      console.log(`⚡ Performance: ${particles.length} particles | Frame: ${metricsRef.current.frameTime.toFixed(2)}ms`);
    }
  });

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
