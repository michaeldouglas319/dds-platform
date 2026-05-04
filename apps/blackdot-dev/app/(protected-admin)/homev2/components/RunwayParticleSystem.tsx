'use client';

import { useRef, useMemo, useEffect, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import * as THREE from 'three';
import { RUNWAY_CONFIG } from '../config/runway.config';
import { DRONE_FLEETS, getTotalFleetParticles } from '../config/fleets.config';
import type { RunwayParticle } from '../types/particle.types';
import type { DroneFleet } from '../types/fleet.types';
import { useRunwayAnimation } from '../hooks/useRunwayAnimation';
import { useRapierParticles } from '../hooks/useRapierParticles';
import { OrbitalPhysicsManager } from './OrbitalPhysicsManager';
import { generateRandomOrbitalParams } from '@/lib/threejs/utils/orbitalPaths';
import { getFleetPrimaryColor, getFleetEmissiveColor, getFleetEmoji } from '../utils/fleetCoding';
import { orientationFromDirection } from '@/lib/threejs/utils/orientation';
import { registerParticleModels, DEFAULT_MODEL_ID } from '../config/models.config';
import type { ScalableOrbitingParticlesRef } from '../particle/ScalableOrbitingParticles';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useCachedModel } from '@/lib/threejs/utils/modelCache';
import { optimizeGLTFScene } from '@/lib/threejs/optimization/modelOptimization';
import { getModelPath, getModelScale, getNativeOrientation, getNativePosition, getModelIdForFleet } from '../utils/modelConfig';

// Performance optimization constants (will be set based on isMobile detection)
const DEFAULT_MOBILE_PARTICLE_REDUCTION = 0.5;
const DEFAULT_UPDATE_THROTTLE = 1;

/**
 * Multi-fleet runway particle system with fleet-specific rendering
 * Each fleet gets its own instanced mesh for color distinction
 */
interface RunwayParticleSystemProps {
  orbitingParticlesRef?: React.RefObject<ScalableOrbitingParticlesRef>;
  /** Origin rotation to adjust model orientation relative to front (Euler angles in radians) */
  originRotation?: [number, number, number];
}

export function RunwayParticleSystem({
  orbitingParticlesRef,
  originRotation = [0, 0, 0], // Default: no rotation
}: RunwayParticleSystemProps = {}) {
  const config = RUNWAY_CONFIG;
  const totalParticles = getTotalFleetParticles();

  // Mobile detection state (initialized to false for SSR safety)
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [mobileParticleReduction, setMobileParticleReduction] = useState(DEFAULT_MOBILE_PARTICLE_REDUCTION);
  const [updateThrottle, setUpdateThrottle] = useState(DEFAULT_UPDATE_THROTTLE);

  // Detect mobile/low-end device after hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mobile = (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) || (window.innerWidth < 768);
    const lowEnd = mobile && ((navigator.hardwareConcurrency || 2) < 4);

    setIsMobile(mobile);
    setIsLowEnd(lowEnd);
    setMobileParticleReduction(lowEnd ? 0.3 : 0.5);
    setUpdateThrottle(mobile ? 2 : 1);
  }, []);

  // Register particle models on mount
  useEffect(() => {
    registerParticleModels();
  }, []);

  // Optimize particle count for mobile
  const optimizedFleets = useMemo(() => {
    if (isMobile) {
      return DRONE_FLEETS.map(fleet => ({
        ...fleet,
        particleCount: Math.floor(fleet.particleCount * mobileParticleReduction),
      }));
    }
    return DRONE_FLEETS;
  }, [isMobile, mobileParticleReduction]);

  const optimizedTotalParticles = useMemo(() => {
    return optimizedFleets.reduce((sum, f) => sum + f.particleCount, 0);
  }, [optimizedFleets]);

  // Create one instanced mesh per fleet
  const fleetMeshesRef = useRef<Map<string, THREE.InstancedMesh>>(new Map());
  const groupRef = useRef<Group>(null);
  const frameCountRef = useRef(0);
  const tmpObject = useRef(new THREE.Object3D());
  const initializedRef = useRef(false);

  const particlesRef = useRef<RunwayParticle[]>([]);

  // Create origin rotation quaternion from Euler angles
  const originRotationQuat = useMemo(() => {
    return new THREE.Quaternion().setFromEuler(
      new THREE.Euler(originRotation[0], originRotation[1], originRotation[2], 'XYZ')
    );
  }, [originRotation]);

  // Load all models for different fleets
  const modelIds = [1, 2, 3] as const; // All available model IDs
  const model1 = useCachedModel(
    getModelPath(1) || '/assets/models/2_plane_draco.glb',
    (scene) => {
      scene.traverse((child) => {
        if (child instanceof THREE.Light) child.parent?.remove(child);
        if (child instanceof THREE.AnimationMixer || (child as any).animations) {
          (child as any).animations = [];
        }
      });
      return scene as THREE.Group;
    }
  );
  const model2 = useCachedModel(
    getModelPath(2) || '/assets/models/super_cam__-_rusian_reconnaissance_drone_draco.glb',
    (scene) => {
      scene.traverse((child) => {
        if (child instanceof THREE.Light) child.parent?.remove(child);
        if (child instanceof THREE.AnimationMixer || (child as any).animations) {
          (child as any).animations = [];
        }
      });
      return scene as THREE.Group;
    }
  );
  const model3 = useCachedModel(
    getModelPath(3) || '/assets/models/dron_low_poly_3d_model_gltf/scene.gltf',
    (scene) => {
      scene.traverse((child) => {
        if (child instanceof THREE.Light) child.parent?.remove(child);
        if (child instanceof THREE.AnimationMixer || (child as any).animations) {
          (child as any).animations = [];
        }
      });
      return scene as THREE.Group;
    }
  );

  // Create geometry cache for each model ID
  const modelGeometries = useMemo(() => {
    const geometries = new Map<number, THREE.BufferGeometry>();
    
    const processModel = (model: THREE.Group | null, modelId: number) => {
      if (!model) {
        geometries.set(modelId, new THREE.SphereGeometry(config.particles.radius, 16, 16));
        return;
      }

      const modelGeoms: THREE.BufferGeometry[] = [];
      const nativeOrient = getNativeOrientation(modelId);
      const modelScale = getModelScale(modelId);
      const nativeRotation = new THREE.Euler(nativeOrient[0], nativeOrient[1], nativeOrient[2], 'XYZ');
      const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(nativeRotation);
      
      model.traverse((child) => {
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
          
          // Apply native orientation to normals
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
          
          clonedGeometry.scale(modelScale, modelScale, modelScale);
          modelGeoms.push(clonedGeometry);
        }
      });

      if (modelGeoms.length === 0) {
        geometries.set(modelId, new THREE.SphereGeometry(config.particles.radius, 16, 16));
      } else if (modelGeoms.length === 1) {
        geometries.set(modelId, modelGeoms[0]);
      } else {
        geometries.set(modelId, mergeGeometries(modelGeoms));
      }
    };

    processModel(model1, 1);
    processModel(model2, 2);
    processModel(model3, 3);

    return geometries;
  }, [model1, model2, model3, config.particles.radius]);

  // Pre-allocate particles array with fleet-specific parameters
  useEffect(() => {
    if (!initializedRef.current && optimizedTotalParticles > 0) {
      const allParticles: RunwayParticle[] = [];
      let globalIdx = 0;

      optimizedFleets.forEach(fleet => {
        for (let i = 0; i < fleet.particleCount; i++) {
          const orbitalParams = generateRandomOrbitalParams(
            [fleet.orbitalCenter.x, fleet.orbitalCenter.y, fleet.orbitalCenter.z],
            fleet.orbitalRadius || config.orbit.radius,
            (fleet.orbitalSpeed || config.orbit.speed) * fleet.speedMultiplier,
            config.takeoff.maxHeight + fleet.altitudeOffset
          );

          allParticles.push({
            position: new THREE.Vector3(0, -1000, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            state: 'parked' as const,
            stateTimer: 0,
            targetWaypoint: null,
            currentWaypoint: 0,
            scale: 0,
            gateId: '',
            originalGatePosition: new THREE.Vector3(0, 0, 0),
            // Fleet-specific properties
            fleetId: fleet.id,
            fleetColor: getFleetPrimaryColor(fleet.id),
            fleetEmissive: getFleetEmissiveColor(fleet.id),
            modelType: fleet.modelType,
            // Assign model ID based on fleet (each fleet/color uses a different model)
            modelId: getModelIdForFleet(fleet.id).toString(),
            // Orbital
            orbitalParams: orbitalParams,
            orbitAngle: orbitalParams.initialAngle,
          });
          globalIdx++;
        }
      });

      particlesRef.current = allParticles;
      initializedRef.current = true;
      console.log(
        `[RunwayParticleSystem] Pre-allocated ${optimizedTotalParticles} particles across ${optimizedFleets.length} fleets`
      );
      optimizedFleets.forEach(fleet => {
        const emoji = getFleetEmoji(fleet.id);
        console.log(`  ${emoji} ${fleet.name}: ${fleet.particleCount} drones`);
      });
    }
  }, [optimizedTotalParticles, optimizedFleets, config.orbit.radius, config.orbit.speed, config.takeoff.maxHeight]);

  // Initialize fleet-specific instanced meshes
  // Memoize fleet IDs to prevent unnecessary recreation when only modelGeometries rememoizes
  const fleetIdsKey = useMemo(
    () => optimizedFleets.map(f => f.id).join(','),
    [optimizedFleets]
  );

  useEffect(() => {
    if (initializedRef.current && groupRef.current && modelGeometries.size > 0) {
      // Clear existing meshes
      fleetMeshesRef.current.forEach((mesh, fleetId) => {
        groupRef.current?.remove(mesh);
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      });
      fleetMeshesRef.current.clear();

      // Create new meshes for each fleet (each fleet uses its assigned model)
      optimizedFleets.forEach(fleet => {
        const fleetParticles = particlesRef.current.filter(p => p.fleetId === fleet.id);
        const particleCount = fleetParticles.length;

        // Get model ID for this fleet and use corresponding geometry
        const fleetModelId = getModelIdForFleet(fleet.id);
        const geometry = modelGeometries.get(fleetModelId)?.clone() ||
          new THREE.SphereGeometry(config.particles.radius, 16, 16);

        // Create material with fleet colors
        const material = new THREE.MeshStandardMaterial({
          color: getFleetPrimaryColor(fleet.id),
          emissive: getFleetEmissiveColor(fleet.id),
          emissiveIntensity: 0.5,
        });

        // Create instanced mesh
        const mesh = new THREE.InstancedMesh(geometry, material, particleCount);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Initialize all matrices to invisible
        const invMatrix = new THREE.Matrix4();
        invMatrix.scale(new THREE.Vector3(0, 0, 0));
        for (let i = 0; i < particleCount; i++) {
          mesh.setMatrixAt(i, invMatrix);
        }
        mesh.instanceMatrix.needsUpdate = true;

        groupRef.current?.add(mesh);
        fleetMeshesRef.current.set(fleet.id, mesh);

        // DEBUG: Disabled for production - enable if tracking fleet initialization
        // console.log(`[RunwayParticleSystem] Created instanced mesh for fleet "${fleet.id}" with ${particleCount} particles`);
      });
    }
  }, [fleetIdsKey, modelGeometries, config.particles.radius]);

  // Initialize waypoint positions and orientations
  const waypointPositions = useMemo(() => {
    return config.taxiWaypoints.map(wp => new THREE.Vector3(...wp.position));
  }, [config.taxiWaypoints]);
  
  const waypointOrientations = useMemo(() => {
    return config.taxiWaypoints.map(wp => wp.orientation);
  }, [config.taxiWaypoints]);

  // Spawn particle function - start at gate, will taxi to runway then takeoff
  const spawnParticle = useCallback(
    (idx: number, gatePos: [number, number, number], gateId: string, fleetId: string) => {
      if (idx < particlesRef.current.length) {
        const particle = particlesRef.current[idx];
        const fleet = optimizedFleets.find(f => f.id === fleetId);

        if (!fleet) {
          console.warn(`[RunwayParticleSystem] Fleet not found: ${fleetId}`);
          return;
        }

        // Get model ID for this fleet (each fleet/color uses a different model)
        const fleetModelId = getModelIdForFleet(fleetId);
        const nativePos = getNativePosition(fleetModelId);
        
        // Set initial position at gate with native position offset
        particle.position.set(
          gatePos[0] + nativePos[0],
          gatePos[1] + nativePos[1],
          gatePos[2] + nativePos[2]
        );
        particle.velocity.set(0, 0, 0);
        particle.scale = 1.0;
        particle.gateId = gateId;
        particle.sourceGateId = gateId;
        particle.originalGatePosition.set(...gatePos);
        particle.fleetId = fleetId;
        particle.fleetColor = getFleetPrimaryColor(fleetId);
        particle.fleetEmissive = getFleetEmissiveColor(fleetId);
        particle.modelType = fleet.modelType;
        particle.modelId = fleetModelId.toString(); // Assign model ID based on fleet

        // Generate orbital params with fleet-specific settings (for later use)
        particle.orbitalParams = generateRandomOrbitalParams(
          [fleet.orbitalCenter.x, fleet.orbitalCenter.y, fleet.orbitalCenter.z],
          fleet.orbitalRadius || config.orbit.radius,
          (fleet.orbitalSpeed || config.orbit.speed) * fleet.speedMultiplier,
          config.takeoff.maxHeight + fleet.altitudeOffset
        );
        particle.orbitAngle = particle.orbitalParams.initialAngle;

        // Start in parked state - will taxi to runway then takeoff
        particle.state = 'parked';
        particle.stateTimer = config.timing.parkedTime;
        particle.targetWaypoint = null;
        particle.currentWaypoint = 0;

        const emoji = getFleetEmoji(fleetId);
        console.log(
          `[RunwayParticleSystem] ${emoji} Spawned particle ${idx} at gate ${gateId} (${fleet.name})`
        );
      } else {
        console.warn(
          `[RunwayParticleSystem] Failed to spawn particle at index ${idx} - array length is ${particlesRef.current.length}`
        );
      }
    },
    [optimizedFleets, config.timing.parkedTime, config.orbit.radius, config.orbit.speed, config.takeoff.maxHeight]
  );

  // Use fleet-aware spawn queue hook
  useRunwayAnimation(particlesRef, spawnParticle, optimizedFleets);

  // Physics-based particle management (Phase 2: Kinematic taxi/takeoff)
  const taxiWaypoints = useMemo(
    () => config.taxiWaypoints.map(wp => new THREE.Vector3(...wp.position)),
    [config.taxiWaypoints]
  );
  useRapierParticles({ particlesRef, waypointPositions: taxiWaypoints });

  // Update particle positions and matrices
  useFrame((state, delta) => {
    frameCountRef.current++;

    // Throttle updates on mobile
    if (isMobile && frameCountRef.current % updateThrottle !== 0) {
      return;
    }

    if (!groupRef.current) return;

    const particles = particlesRef.current;

    // Log first frame with particle data
    if (frameCountRef.current === 1) {
      console.log(
        `[RunwayParticleSystem] First frame update - total particles: ${particles.length}`
      );
    }

    // Update each fleet's instanced mesh
    optimizedFleets.forEach(fleet => {
      const mesh = fleetMeshesRef.current.get(fleet.id);
      if (!mesh) return;

      const fleetParticles = particles.filter(p => p.fleetId === fleet.id);
      let visibleCount = 0;

      fleetParticles.forEach((particle) => {
        if (particle.scale > 0) {
          // Get model config for native position offset
          const particleModelId = particle.modelId ? parseInt(particle.modelId) : config.defaultModelId;
          const nativePos = getNativePosition(particleModelId);
          const nativeOrient = getNativeOrientation(particleModelId);
          
          // Apply native position offset to particle position
          tmpObject.current.position.set(
            particle.position.x + nativePos[0],
            particle.position.y + nativePos[1],
            particle.position.z + nativePos[2]
          );
          tmpObject.current.scale.setScalar(particle.scale);

          // Apply orientation based on particle state
          if (particle.state === 'taxiing' && particle.orientation) {
            // For taxiing: use the fixed forward orientation set by OrbitalPhysicsManager
            // Combine origin rotation with the fixed forward orientation and native orientation
            const nativeOrientQuat = new THREE.Quaternion().setFromEuler(
              new THREE.Euler(nativeOrient[0], nativeOrient[1], nativeOrient[2], 'XYZ')
            );
            const finalQuat = originRotationQuat.clone()
              .multiply(nativeOrientQuat)
              .multiply(particle.orientation.quaternion);
            tmpObject.current.quaternion.copy(finalQuat);
          } else if (particle.velocity.lengthSq() > 0.01) {
            // For other states: face direction of travel
            const orientation = orientationFromDirection(particle.velocity.normalize());
            const nativeOrientQuat = new THREE.Quaternion().setFromEuler(
              new THREE.Euler(nativeOrient[0], nativeOrient[1], nativeOrient[2], 'XYZ')
            );
            // Combine origin rotation with native orientation and direction rotation
            const finalQuat = originRotationQuat.clone()
              .multiply(nativeOrientQuat)
              .multiply(orientation.quaternion);
            tmpObject.current.quaternion.copy(finalQuat);
          } else if (particle.orientation) {
            // Use particle's stored orientation if available
            const nativeOrientQuat = new THREE.Quaternion().setFromEuler(
              new THREE.Euler(nativeOrient[0], nativeOrient[1], nativeOrient[2], 'XYZ')
            );
            const finalQuat = originRotationQuat.clone()
              .multiply(nativeOrientQuat)
              .multiply(particle.orientation.quaternion);
            tmpObject.current.quaternion.copy(finalQuat);
          } else {
            // If no velocity or orientation, apply origin rotation and native orientation
            const nativeOrientQuat = new THREE.Quaternion().setFromEuler(
              new THREE.Euler(nativeOrient[0], nativeOrient[1], nativeOrient[2], 'XYZ')
            );
            tmpObject.current.quaternion.copy(originRotationQuat).multiply(nativeOrientQuat);
          }

          tmpObject.current.updateMatrix();
          mesh.setMatrixAt(visibleCount, tmpObject.current.matrix);
          visibleCount++;
        }
      });

      // Update visible instance count for this fleet
      mesh.count = visibleCount;
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <>
      <group ref={groupRef} />
      <OrbitalPhysicsManager
        particlesRef={particlesRef}
        waypointPositions={waypointPositions}
        waypointOrientations={waypointOrientations}
        orbitingParticlesRef={orbitingParticlesRef}
        originRotation={originRotation}
      />
    </>
  );
}
