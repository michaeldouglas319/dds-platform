/**
 * ISOLATED Scalable Orbiting Particle System
 * 
 * Self-contained particle system that can be scaled independently
 * Uses IDENTICAL particle geometry/material as runway particles:
 * - SphereGeometry(1.5, 16, 16)
 * - MeshStandardMaterial with color and emissive
 * - InstancedMesh for performance
 * 
 * Usage:
 * <ScalableOrbitingParticles 
 *   scale={100}  // Scale factor (1-200)
 *   position={[0, 50, 0]}
 * />
 */

'use client';

import { useRef, useEffect, useMemo, useImperativeHandle, forwardRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  calculateUnifiedOrbitPosition,
  updateUnifiedOrbitAngle,
  createUnifiedOrbitState,
  orbitalParamsToUnifiedState,
  type UnifiedOrbitState,
} from '@/lib/threejs/utils/unifiedOrbit';
import type { OrbitalParams } from '@/lib/threejs/utils/orbitalPaths';
import { useCachedModel } from '@/lib/threejs/utils/modelCache';
import { RUNWAY_CONFIG } from '../config/runway.config';
import { getModelPath, getModelScale, getNativeOrientation, getNativePosition } from '../utils/modelConfig';

// ============================================================================
// PARTICLE CONFIGURATION (Same as runway)
// ============================================================================

const PARTICLE_RADIUS = 1.5; // Same as runway.config.ts
const PARTICLE_SEGMENTS = 16; // Same as runway (16, 16)

const DEFAULT_SCALE = 100;
const DEFAULT_POSITION: [number, number, number] = [0, 50, 0];
const DEFAULT_COUNT = 50; // Reduced by 1/8 (from 400 to 50)

// Mobile detection constants (will be initialized inside component)
const DEFAULT_MOBILE_PARTICLE_REDUCTION = 0.5;
const DEFAULT_UPDATE_THROTTLE = 1;

interface ScalableOrbitingParticlesProps {
  /** Scale factor (1-200). Higher = larger particle sphere */
  scale?: number;
  /** Center position of particle system */
  position?: [number, number, number];
  /** Number of particles */
  count?: number;
  /** Primary color (hex) - same as runway particles */
  color1?: string;
  /** Secondary color (hex) - emissive color */
  color2?: string;
  /** Orbital speed multiplier */
  orbitalSpeed?: number;
  /** Visibility */
  visible?: boolean;
  /** Origin rotation to adjust model orientation relative to front (Euler angles in radians) */
  originRotation?: [number, number, number];
}

export interface ScalableOrbitingParticlesRef {
  /** Add a particle from runway system to orbiting system */
  addParticle: (orbitalParams: OrbitalParams, currentAngle: number, currentPosition: THREE.Vector3) => void;
  /** Get current particle count */
  getParticleCount: () => number;
  /** Get nearby orbiting particles within radius */
  getNearbyParticles: (position: THREE.Vector3, radius: number, time: number) => Array<{ state: UnifiedOrbitState; position: THREE.Vector3 }>;
}

export const ScalableOrbitingParticles = forwardRef<ScalableOrbitingParticlesRef, ScalableOrbitingParticlesProps>(
  function ScalableOrbitingParticles({
    scale = DEFAULT_SCALE,
    position = DEFAULT_POSITION,
    count = DEFAULT_COUNT,
    color1 = '#6366f1', // Same as runway particles
    color2 = '#4f46e5', // Same as runway emissive
    orbitalSpeed = 0.6,
    visible = true,
    originRotation = [0, 0, 0], // Default: no rotation
  }, ref) {
  // Mobile detection state (initialized to false for SSR safety)
  const [isMobile, setIsMobile] = useState(false);
  const [mobileParticleReduction, setMobileParticleReduction] = useState(DEFAULT_MOBILE_PARTICLE_REDUCTION);
  const [updateThrottle, setUpdateThrottle] = useState(DEFAULT_UPDATE_THROTTLE);

  // Detect mobile/low-end device after hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mobile = (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) || (window.innerWidth < 768);
    const lowEnd = mobile && ((navigator.hardwareConcurrency || 2) < 4);

    setIsMobile(mobile);
    setMobileParticleReduction(lowEnd ? 0.3 : 0.5);
    setUpdateThrottle(mobile ? 2 : 1);
  }, []);

  // Optimize particle count for mobile
  const optimizedCount = useMemo(() => {
    if (isMobile) {
      return Math.floor(count * mobileParticleReduction);
    }
    return count;
  }, [count, isMobile, mobileParticleReduction]);

  const groupRef = useRef<THREE.Group>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const frameCountRef = useRef(0);
  const tmpObject = useRef(new THREE.Object3D());
  
  // Calculate effective scale factor
  const scaleFactor = scale / DEFAULT_SCALE;

  // Get default model config
  const defaultModelId = RUNWAY_CONFIG.defaultModelId;
  const modelPath = getModelPath(defaultModelId);
  const modelScale = getModelScale(defaultModelId);
  const nativeOrientation = getNativeOrientation(defaultModelId);

  // Load airplane model for particles using config path
  const airplaneModel = useCachedModel(
    modelPath || '/assets/models/2_plane_draco.glb', // Fallback to old path
    (scene) => {
      // Remove lights and animations manually
      scene.traverse((child) => {
        if (child instanceof THREE.Light) {
          child.parent?.remove(child);
        }
        if (child instanceof THREE.AnimationMixer || (child as any).animations) {
          (child as any).animations = [];
        }
      });
      return scene as THREE.Group;
    }
  );

  // Extract geometry from airplane model, fallback to sphere if not loaded
  const geometry = useMemo(() => {
    if (!airplaneModel) {
      return new THREE.SphereGeometry(PARTICLE_RADIUS, PARTICLE_SEGMENTS, PARTICLE_SEGMENTS);
    }

    // Extract and merge all geometries from the airplane model
    const geometries: THREE.BufferGeometry[] = [];
    const nativeRotation = new THREE.Euler(
      nativeOrientation[0],
      nativeOrientation[1],
      nativeOrientation[2],
      'XYZ'
    );
    const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(nativeRotation);
    
    airplaneModel.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const clonedGeometry = child.geometry.clone();
        
        // Apply native orientation rotation to geometry
        const positionAttr = clonedGeometry.getAttribute('position');
        if (positionAttr) {
          const positions = positionAttr.array as Float32Array;
          const vector = new THREE.Vector3();
          
          for (let i = 0; i < positions.length; i += 3) {
            vector.set(positions[i], positions[i + 1], positions[i + 2]);
            vector.applyMatrix4(rotationMatrix);
            positions[i] = vector.x;
            positions[i + 1] = vector.y;
            positions[i + 2] = vector.z;
          }
          positionAttr.needsUpdate = true;
        }
        
        // Apply native orientation to normals if they exist
        const normalAttr = clonedGeometry.getAttribute('normal');
        if (normalAttr) {
          const normals = normalAttr.array as Float32Array;
          const normalMatrix = new THREE.Matrix3().getNormalMatrix(rotationMatrix);
          const vector = new THREE.Vector3();
          
          for (let i = 0; i < normals.length; i += 3) {
            vector.set(normals[i], normals[i + 1], normals[i + 2]);
            vector.applyMatrix3(normalMatrix).normalize();
            normals[i] = vector.x;
            normals[i + 1] = vector.y;
            normals[i + 2] = vector.z;
          }
          normalAttr.needsUpdate = true;
        }
        
        // Scale down model using config scale
        clonedGeometry.scale(modelScale, modelScale, modelScale);
        geometries.push(clonedGeometry);
      }
    });

    if (geometries.length === 0) {
      return new THREE.SphereGeometry(PARTICLE_RADIUS, PARTICLE_SEGMENTS, PARTICLE_SEGMENTS);
    }

    // If only one geometry, use it directly; otherwise merge them
    if (geometries.length === 1) {
      return geometries[0];
    }

    // Merge multiple geometries
    return mergeGeometries(geometries);
  }, [airplaneModel, nativeOrientation, modelScale]);
  
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color1,
      emissive: color2,
      emissiveIntensity: 0.5,
    });
  }, [color1, color2]);

  // Particle positions and orbital parameters (using unified orbit state)
  const particlesRef = useRef<Array<UnifiedOrbitState>>([]);
  // Track previous positions to calculate direction of travel
  const previousPositionsRef = useRef<Map<number, THREE.Vector3>>(new Map());
  
  // Create origin rotation quaternion from Euler angles
  const originRotationQuat = useMemo(() => {
    return new THREE.Quaternion().setFromEuler(
      new THREE.Euler(originRotation[0], originRotation[1], originRotation[2], 'XYZ')
    );
  }, [originRotation]);

  // Initialize particles with SCALABLE radius
  useEffect(() => {
    const particles: typeof particlesRef.current = [];
    const objectPos = new THREE.Vector3(...position);

    // Shell system with SCALABLE radii
    const shellCount = 2;
    const innerShellWeight = 0.6;

    for (let i = 0; i < optimizedCount; i++) {
      // Determine which shell
      let shell;
      const rand = Math.random();
      if (rand < innerShellWeight) {
        shell = Math.floor(Math.random() * 2);
      } else {
        shell = 2 + Math.floor(Math.random() * 2);
      }

      // Calculate radius - SCALED by scaleFactor
      const shellProgress = Math.random();
      let radius: number;
      if (shell < 2) {
        // Inner shells: base 50-100 units, scaled by factor
        radius = (50 + shell * 25 + Math.random() * 25) * scaleFactor;
      } else {
        // Outer shells: base 100-150 units, scaled by factor
        radius = (100 + (shell - 2) * 25 + Math.random() * 25) * scaleFactor;
      }

      // Spherical coordinates
      const theta = shellProgress * Math.PI * 2 + (shell * Math.PI / shellCount);
      const phi = Math.acos(Math.random() * 2 - 1);
      const height = (-20 + shellProgress * 40 + Math.random() * 15) * scaleFactor;

      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        height,
        radius * Math.sin(phi) * Math.sin(theta)
      ).add(objectPos);

      // Create unified orbit state with distributed phases to prevent convergence
      // Distribute phases evenly across 2π to ensure particles stay separated
      const phase = (i / optimizedCount) * Math.PI * 2 + Math.random() * 0.1; // Evenly distributed + small random
      const speed = 0.2 + Math.random() * 0.3;
      
      const orbitState = createUnifiedOrbitState(
        objectPos.clone(),
        radius,
        height,
        theta,
        phase,  // Evenly distributed phase
        speed
      );
      particles.push(orbitState);
    }

    particlesRef.current = particles;
    
    // Initialize previous positions for direction calculation
    previousPositionsRef.current.clear();
    particles.forEach((particle, idx) => {
      const initialPos = calculateUnifiedOrbitPosition(particle, {
        orbitalSpeed,
        time: 0,
      });
      previousPositionsRef.current.set(idx, initialPos);
    });
  }, [optimizedCount, position, scaleFactor, orbitalSpeed]);

  // Expose methods to add particles dynamically
  useImperativeHandle(ref, () => ({
    addParticle: (orbitalParams: OrbitalParams, currentAngle: number, currentPosition: THREE.Vector3) => {
      // Convert orbital params to unified orbit state
      const orbitState = orbitalParamsToUnifiedState(orbitalParams, currentAngle);
      
      // Update position to match current position
      orbitState.center = orbitalParams.center;
      
      // Add to particles array
      particlesRef.current.push(orbitState);
      
      // Resize instanced mesh if needed
      const currentCount = particlesRef.current.length;
      if (instancedMeshRef.current && currentCount > instancedMeshRef.current.count) {
        // Need to recreate mesh with larger capacity
        const oldMesh = instancedMeshRef.current;
        const newCapacity = Math.max(currentCount * 2, optimizedCount); // Double capacity or use optimizedCount
        const newMesh = new THREE.InstancedMesh(geometry, material, newCapacity);
        newMesh.castShadow = true;
        newMesh.receiveShadow = true;
        
        // Copy existing matrices
        const tmpMatrix = new THREE.Matrix4();
        for (let i = 0; i < oldMesh.count; i++) {
          oldMesh.getMatrixAt(i, tmpMatrix);
          newMesh.setMatrixAt(i, tmpMatrix);
        }
        
        // Initialize remaining matrices
        const invMatrix = new THREE.Matrix4();
        invMatrix.scale(new THREE.Vector3(0, 0, 0));
        for (let i = oldMesh.count; i < newCapacity; i++) {
          newMesh.setMatrixAt(i, invMatrix);
        }
        
        if (groupRef.current) {
          groupRef.current.remove(oldMesh);
          groupRef.current.add(newMesh);
        }
        instancedMeshRef.current = newMesh;
      }
      
      console.log(`[ScalableOrbitingParticles] Added particle from runway. Total: ${currentCount}`);
    },
    getParticleCount: () => particlesRef.current.length,
    getNearbyParticles: (position: THREE.Vector3, radius: number, currentTime: number) => {
      const nearby: Array<{ state: UnifiedOrbitState; position: THREE.Vector3 }> = [];
      const particles = particlesRef.current;
      
      particles.forEach((particle) => {
        // Calculate particle's current position
        const particlePos = calculateUnifiedOrbitPosition(particle, {
          orbitalSpeed,
          time: currentTime,
        });
        
        // Check if within radius
        const distance = position.distanceTo(particlePos);
        if (distance <= radius) {
          nearby.push({
            state: particle,
            position: particlePos,
          });
        }
      });
      
      return nearby;
    },
  }), [geometry, material, optimizedCount, orbitalSpeed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (instancedMeshRef.current && groupRef.current) {
        groupRef.current.remove(instancedMeshRef.current);
        instancedMeshRef.current = null;
      }
    };
  }, []);

  // Initialize instanced mesh with dynamic capacity
  useEffect(() => {
    if (!groupRef.current) return;

    // Use a larger initial capacity to allow for dynamic additions
    const initialCapacity = Math.max(optimizedCount * 2, 200); // Reduced capacity for better performance

    // Clean up existing mesh
    if (instancedMeshRef.current) {
      groupRef.current.remove(instancedMeshRef.current);
      instancedMeshRef.current = null;
    }

    // Create instanced mesh with extra capacity for dynamic additions
    const mesh = new THREE.InstancedMesh(geometry, material, initialCapacity);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Initialize all matrices to invisible initially
    const invMatrix = new THREE.Matrix4();
    invMatrix.scale(new THREE.Vector3(0, 0, 0));
    for (let i = 0; i < initialCapacity; i++) {
      mesh.setMatrixAt(i, invMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    groupRef.current.add(mesh);
    instancedMeshRef.current = mesh;

    // Cleanup function
    return () => {
      if (instancedMeshRef.current && groupRef.current) {
        groupRef.current.remove(instancedMeshRef.current);
        instancedMeshRef.current = null;
      }
    };
  }, [optimizedCount, geometry, material]);

  // Animation loop - update particle positions and matrices
  useFrame((state, delta) => {
    frameCountRef.current++;

    // Throttle updates on mobile
    if (isMobile && frameCountRef.current % updateThrottle !== 0) {
      return;
    }

    const mesh = instancedMeshRef.current;
    if (!mesh || particlesRef.current.length === 0) return;

    const t = state.clock.getElapsedTime();
    const particles = particlesRef.current;
    const objectPos = new THREE.Vector3(...position);
    let visibleCount = 0;

    // Track first and last particles for debugging
    let firstParticle: UnifiedOrbitState | null = null;
    let lastParticle: UnifiedOrbitState | null = null;
    let firstPos: THREE.Vector3 | null = null;
    let lastPos: THREE.Vector3 | null = null;

    particles.forEach((particle, idx) => {
      // Update orbital angle using unified function
      const oldAngle = particle.angle;
      particle.angle = updateUnifiedOrbitAngle(particle, {
        orbitalSpeed,
        time: t,
        delta: delta,
      });

      // Calculate speed (angle change per second)
      const angleDelta = particle.angle - oldAngle;
      const currentSpeed = angleDelta / delta;

      // Calculate orbital position using unified function
      const pos = calculateUnifiedOrbitPosition(particle, {
        orbitalSpeed,
        time: t,
      });

      // Track first and last particles
      if (idx === 0) {
        firstParticle = particle;
        firstPos = pos.clone();
      }
      if (idx === particles.length - 1) {
        lastParticle = particle;
        lastPos = pos.clone();
      }

      // Calculate direction of travel
      const previousPos = previousPositionsRef.current.get(idx);
      let direction = new THREE.Vector3(0, 0, 1); // Default forward direction
      
      if (previousPos) {
        direction = pos.clone().sub(previousPos).normalize();
        // If direction is too small, use previous direction or default
        if (direction.lengthSq() < 0.001) {
          direction.set(0, 0, 1);
        }
      }
      
      // Update previous position
      previousPositionsRef.current.set(idx, pos.clone());

      // Calculate rotation to face direction of travel
      const directionQuat = new THREE.Quaternion();
      const up = new THREE.Vector3(0, 1, 0);
      directionQuat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
      
      // Get native orientation and position offsets for default model
      const nativeOrient = getNativeOrientation(defaultModelId);
      const nativePos = getNativePosition(defaultModelId);
      
      // Combine origin rotation with native orientation and direction rotation
      const nativeOrientQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(nativeOrient[0], nativeOrient[1], nativeOrient[2], 'XYZ')
      );
      const finalQuat = originRotationQuat.clone()
        .multiply(nativeOrientQuat)
        .multiply(directionQuat);

      // Update matrix with position (including native offset), scale, and rotation
      tmpObject.current.position.set(
        pos.x + nativePos[0],
        pos.y + nativePos[1],
        pos.z + nativePos[2]
      );
      tmpObject.current.scale.setScalar(1.0);
      tmpObject.current.quaternion.copy(finalQuat);
      tmpObject.current.updateMatrix();

      // Update matrix (optimized - reuse single Object3D)
      mesh.setMatrixAt(visibleCount, tmpObject.current.matrix);
      visibleCount++;
    });

    // Update visible instance count to match actual particle count
    mesh.count = visibleCount;
    mesh.instanceMatrix.needsUpdate = true;

    // DEBUG: Console log metrics every 60 frames (~1 second at 60fps)
    // DISABLED for performance - enable if debugging orbital mechanics
    /*
    if (frameCountRef.current % 60 === 0 && firstPos && lastPos && firstParticle && lastParticle) {
      const distance = firstPos.distanceTo(lastPos);
      console.log(`[ScalableOrbitingParticles] Frame: ${frameCountRef.current} | Particles: ${particles.length} | Time: ${t.toFixed(2)}s`);
    }
    */
  });

  return (
    <group ref={groupRef} visible={visible} />
  );
});
