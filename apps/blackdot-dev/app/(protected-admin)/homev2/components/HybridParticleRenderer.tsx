'use client';

import { useRef, useMemo, useEffect, MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useCachedModel } from '@/lib/threejs/utils/modelCache';
import { RUNWAY_CONFIG } from '../config/runway.config';
import { getModelPath, getModelScale, getNativeOrientation } from '../utils/modelConfig';
import type { HybridParticle } from '../types/path-particle.types';

interface HybridParticleRendererProps {
  particlesRef: MutableRefObject<HybridParticle[]>;
  particleRadius?: number;
}

/**
 * Hybrid Particle Renderer
 *
 * Renders HybridParticles using instanced meshes with airplane model geometry
 * Handles all rendering, no physics updates (those are handled by HybridMotionManager)
 */
export function HybridParticleRenderer({
  particlesRef,
  particleRadius = 1.5,
}: HybridParticleRendererProps) {
  const groupRef = useRef<Group>(null);
  const fleetMeshesRef = useRef<Map<string, THREE.InstancedMesh>>(new Map());
  const frameCountRef = useRef(0);
  const tmpObject = useRef(new THREE.Object3D());
  const initializedRef = useRef(false);

  // Get default model config
  const defaultModelId = RUNWAY_CONFIG.defaultModelId;
  const modelPath = getModelPath(defaultModelId);
  const modelScale = getModelScale(defaultModelId);
  const nativeOrientation = getNativeOrientation(defaultModelId);

  // Load airplane GLB model for particles using config path
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
  const particleGeometry = useMemo(() => {
    if (!airplaneModel) {
      return new THREE.SphereGeometry(particleRadius, 16, 16);
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
      return new THREE.SphereGeometry(particleRadius, 16, 16);
    }

    // If only one geometry, use it directly; otherwise merge them
    if (geometries.length === 1) {
      return geometries[0];
    }

    // Merge multiple geometries
    return mergeGeometries(geometries);
  }, [airplaneModel, particleRadius, nativeOrientation, modelScale]);

  // Initialize instanced meshes for each fleet
  useEffect(() => {
    if (!groupRef.current || initializedRef.current) return;

    // Get unique fleets from particles
    const fleets = new Set(particlesRef.current.map((p) => p.fleetId));

    fleets.forEach((fleetId) => {
      const fleetParticles = particlesRef.current.filter((p) => p.fleetId === fleetId);
      const particleCount = fleetParticles.length;

      // Use airplane model geometry or fallback to sphere
      const geometry = particleGeometry.clone();

      // Create material with vertex color support for per-instance colors
      const firstParticle = fleetParticles[0];
      const material = new THREE.MeshStandardMaterial({
        color: firstParticle.color,
        emissive: firstParticle.emissive,
        emissiveIntensity: 0.5,
        vertexColors: true,
      });

      // Create instanced mesh
      const mesh = new THREE.InstancedMesh(geometry, material, particleCount);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Initialize per-instance colors
      const colors = new Float32Array(particleCount * 3); // RGB per instance
      for (let i = 0; i < particleCount; i++) {
        const particle = fleetParticles[i];
        const color = new THREE.Color(particle.color);
        colors[i * 3 + 0] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);

      // Initialize all matrices to invisible
      const invMatrix = new THREE.Matrix4();
      invMatrix.scale(new THREE.Vector3(0, 0, 0));
      for (let i = 0; i < particleCount; i++) {
        mesh.setMatrixAt(i, invMatrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      groupRef.current!.add(mesh);
      fleetMeshesRef.current.set(fleetId, mesh);

      console.log(
        `[HybridParticleRenderer] Created instanced mesh for fleet "${fleetId}" with ${particleCount} particles (airplane geometry)`
      );
    });

    initializedRef.current = true;
  }, [particleGeometry]);

  // Update particle positions and matrices each frame
  useFrame((state, delta) => {
    frameCountRef.current++;

    if (!groupRef.current || particlesRef.current.length === 0) return;

    const particles = particlesRef.current;

    // Update each fleet's instanced mesh
    fleetMeshesRef.current.forEach((mesh, fleetId) => {
      const fleetParticles = particles.filter((p) => p.fleetId === fleetId);
      let visibleCount = 0;

      fleetParticles.forEach((particle) => {
        if (particle.visible && particle.scale > 0) {
          tmpObject.current.position.copy(particle.position);
          tmpObject.current.scale.setScalar(particle.scale);
          tmpObject.current.quaternion.copy(particle.orientation);
          tmpObject.current.updateMatrix();

          mesh.setMatrixAt(visibleCount, tmpObject.current.matrix);

          // Update instance color
          const color = new THREE.Color(particle.color);
          mesh.setColorAt(visibleCount, color);

          visibleCount++;
        }
      });

      // Update visible instance count for this fleet
      mesh.count = visibleCount;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });

    // Log metrics periodically
    if (frameCountRef.current % 60 === 0) {
      const visibleParticles = particles.filter((p) => p.visible && p.scale > 0);
      const phaseCount = {
        taxi: visibleParticles.filter((p) => p.phase === 'taxi').length,
        takeoff: visibleParticles.filter((p) => p.phase === 'takeoff').length,
        orbiting: visibleParticles.filter((p) => p.phase === 'orbiting').length,
        landing: visibleParticles.filter((p) => p.phase === 'landing').length,
        landed: visibleParticles.filter((p) => p.phase === 'landed').length,
      };

      console.log(`[HybridParticleRenderer] Frame ${frameCountRef.current}:`, {
        total: particles.length,
        visible: visibleParticles.length,
        phases: phaseCount,
      });
    }
  });

  return <group ref={groupRef} />;
}
