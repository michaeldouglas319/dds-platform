'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useRef, useEffect } from 'react';

interface HandMeshProps {
  handMatrices: Float32Array;
  handPosition: THREE.Vector3;
}

/**
 * Renders a hand mesh matching the original edankwan/touch-leap-motion implementation
 *
 * Uses the same geometry primitives:
 * - Palm: CylinderGeometry(1, 1, 1, 6) - hexagonal prism
 * - Finger Bones: CylinderGeometry(1, 1, 1, 12) - 12-sided cylinders
 * - Joint Nodes: SphereGeometry(1, 10, 12) - spheres at finger joints
 */
export function HandMesh({ handMatrices, handPosition }: HandMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Material matching original - MeshStandardMaterial with PBR properties
  const skinMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.86,
        metalness: 0.45,
        color: 0xaaaaaa, // light gray
        emissive: 0x000000,
      }),
    []
  );

  // Palm geometry - hexagonal prism (6-sided cylinder)
  const palmGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(1, 1, 1, 6);
  }, []);

  // Finger bone geometry - 12-sided cylinder, translated -0.5 on Y
  const boneGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(1, 1, 1, 12, 1);
    geometry.translate(0, -0.5, 0);
    return geometry;
  }, []);

  // Joint node geometry - sphere with 10x12 segments
  const nodeGeometry = useMemo(() => {
    return new THREE.SphereGeometry(1, 10, 12);
  }, []);

  // Initialize hand meshes on mount (only once)
  useEffect(() => {
    if (!groupRef.current) return;

    // Create and add palm mesh
    const palmMesh = new THREE.Mesh(palmGeometry, skinMaterial);
    palmMesh.castShadow = true;
    palmMesh.receiveShadow = true;
    palmMesh.matrixAutoUpdate = false;
    groupRef.current.add(palmMesh);

    // Create and add finger bone meshes (5 fingers × 3 bones = 15 total)
    for (let finger = 0; finger < 5; finger++) {
      for (let bone = 0; bone < 3; bone++) {
        // Bone mesh
        const boneMesh = new THREE.Mesh(boneGeometry, skinMaterial);
        boneMesh.castShadow = true;
        boneMesh.receiveShadow = true;
        boneMesh.matrixAutoUpdate = false;
        groupRef.current.add(boneMesh);

        // Joint node sphere
        const nodeMesh = new THREE.Mesh(nodeGeometry, skinMaterial);
        nodeMesh.castShadow = true;
        nodeMesh.receiveShadow = true;
        nodeMesh.matrixAutoUpdate = false;
        groupRef.current.add(nodeMesh);
      }
    }
  }, []);

  // Decode matrix with scale at indices 3, 7, 11 for rendering
  const decodeMatrix = (encodedArray: Float32Array, offset: number): THREE.Matrix4 => {
    const matrix = new THREE.Matrix4();
    matrix.fromArray(encodedArray, offset);

    // Extract scale from encoded positions
    const scale = new THREE.Vector3(
      encodedArray[offset + 3],
      encodedArray[offset + 7],
      encodedArray[offset + 11]
    );

    // Zero out the encoded scale
    matrix.elements[3] = 0;
    matrix.elements[7] = 0;
    matrix.elements[11] = 0;

    // Apply scale to render matrix
    if (scale.length() > 0.001) {
      matrix.scale(scale);
    }

    return matrix;
  };

  // Update hand geometry each frame based on matrices
  useFrame(() => {
    if (!groupRef.current) return;

    const children = groupRef.current.children;
    let childIndex = 0;

    // Update palm (first child, uses matrix 0)
    if (children[childIndex]) {
      const palmMesh = children[childIndex] as THREE.Mesh;
      const palmMatrix = decodeMatrix(handMatrices, 0);
      palmMesh.matrix.copy(palmMatrix);
      childIndex++;
    }

    // Update finger bones (matrices 1-15)
    // Each finger has 2 children per bone: bone mesh + node mesh
    for (let finger = 0; finger < 5; finger++) {
      for (let bone = 0; bone < 3; bone++) {
        const matrixIndex = 1 + finger * 3 + bone;
        const boneMatrix = decodeMatrix(handMatrices, matrixIndex * 16);

        // Bone mesh
        if (children[childIndex]) {
          const boneMesh = children[childIndex] as THREE.Mesh;
          boneMesh.matrix.copy(boneMatrix);
          childIndex++;
        }

        // Node mesh (joint sphere)
        if (children[childIndex]) {
          const nodeMesh = children[childIndex] as THREE.Mesh;
          nodeMesh.matrix.copy(boneMatrix);
          childIndex++;
        }
      }
    }
  });

  return <group ref={groupRef} />;
}
