'use client';

import { useRef, useState, useEffect, useMemo, useCallback, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NETWORK_CONFIG } from '@/app/landing/config/network.config';
import { NodeData } from '@/app/landing/types/node.types';
import { NetworkRef } from '@/app/landing/types/network.types';
import { useMountAnimation, getRecommendedEasing } from '@/hooks/useMountAnimation';
import {
  createNode,
  initializeNetworkData,
  integrateParticle
} from '@/app/landing/node/utils/nodeHelpers';
import { calculateNodeColor } from '@/app/landing/node/utils/nodeColors';
import {
  updateNodeTimers,
  processSpawnQueue,
  updateNodePositions,
  updateConnections,
  handleEvolution
} from '@/app/landing/node/utils/nodeUpdates';

interface NeuralNetworkProps {
  collisionRef?: React.RefObject<NetworkRef>;
  onNodeIntegration?: () => void;
  position?: [number, number, number];
  [key: string]: unknown;
}

export function NeuralNetwork({
  collisionRef,
  onNodeIntegration,
  position = [0, -0.09, 0],
  ...props
}: NeuralNetworkProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Use neutral gray color for neural network nodes
  const primaryColor = useMemo(() => {
    return new THREE.Color('#aaaaaa'); // Neutral gray
  }, []);

  // Collision-based color averaging
  const collisionColorRef = useRef(primaryColor.clone());
  const collisionCountRef = useRef(0);
  const emissiveIntensityRef = useRef(0);

  // Collision handler for cumulative color averaging
  const handleCollision = useCallback((particleColor: THREE.Color, intensity: number) => {
    // Cumulative color averaging: (sum of all colors) / count
    collisionCountRef.current += 1;
    const currentSum = collisionColorRef.current.clone().multiplyScalar(collisionCountRef.current - 1);
    const newSum = currentSum.add(particleColor);
    // Manually divide each component (Color doesn't have divideScalar)
    collisionColorRef.current.set(
      newSum.r / collisionCountRef.current,
      newSum.g / collisionCountRef.current,
      newSum.b / collisionCountRef.current
    );

    // Increase emissive intensity based on collision frequency (makes it "hot")
    emissiveIntensityRef.current = Math.min(1.0, emissiveIntensityRef.current + intensity * 0.15);
  }, []);

  const nodeStatesRef = useRef<Array<NodeData>>([]);
  const spawnQueueRef = useRef<Array<{ nodeIdx: number; spawnTime: number }>>([]);
  const lastEvolutionTimeRef = useRef(0);
  const lastRandomSetTimeRef = useRef(0);

  // Network configuration (from constants)
  const { nodeCount, connectionDistance, baseScale, growthFactor } = NETWORK_CONFIG;

  // Initialize nodeStatesRef outside of render (in an effect) - must happen before useMemo
  useEffect(() => {
    // Reinitialize if needed
    if (nodeStatesRef.current.length !== nodeCount) {
      nodeStatesRef.current = Array.from({ length: nodeCount }, () => ({
        alive: true,
        state: 'default' as const,
        timer: 0,
        pulsePhase: Math.random() * Math.PI * 2,
      }));
    }
  }, [nodeCount]);

  // Generate initial node positions and connection data
  // Note: nodeStatesRef is initialized in the effect above, but we don't pass it to avoid ref access during render
  const { positions, basePositions, stepData, connections, colors } = useMemo(() => {
    return initializeNetworkData(nodeCount, connectionDistance);
  }, [nodeCount, connectionDistance]);

  // Create node function with refs
  const createNodeFn = useCallback((nodeIdx: number, basePositions: Float32Array, position?: THREE.Vector3, startScale: number = 1.0) => {
    createNode(nodeIdx, basePositions, position, startScale, nodeStatesRef, instancedMeshRef as React.RefObject<THREE.InstancedMesh>, NETWORK_CONFIG);
  }, []);

  // Integrate particle function
  const integrateParticleFn = useCallback((particlePosition: THREE.Vector3, startScale: number = 0): number => {
    return integrateParticle(
      particlePosition,
      startScale,
      nodeStatesRef,
      basePositions,
      createNodeFn,
      NETWORK_CONFIG,
      onNodeIntegration
    );
  }, [basePositions, createNodeFn, onNodeIntegration]);

  // Update node states function
  const updateNodeStatesFn = useCallback((delta: number, currentTime: number) => {
    updateNodeTimers(delta, nodeStatesRef, NETWORK_CONFIG);
    processSpawnQueue(currentTime, basePositions, spawnQueueRef, nodeStatesRef, createNodeFn);
  }, [basePositions, createNodeFn]);

  // Apply colors to all nodes
  const applyNodeColors = useCallback((currentTime: number, agitationLevel: number) => {
    if (!instancedMeshRef.current) return;

    // Get or create color attribute
    let colorAttribute = instancedMeshRef.current.geometry.getAttribute('color') as THREE.InstancedBufferAttribute;
    if (!colorAttribute) {
      const colors = new Float32Array(nodeCount * 3);
      colorAttribute = new THREE.InstancedBufferAttribute(colors, 3);
      instancedMeshRef.current.geometry.setAttribute('color', colorAttribute);
    }

    const colorArray = colorAttribute.array as Float32Array;

    for (let i = 0; i < nodeCount; i++) {
      const nodeState = nodeStatesRef.current[i];
      if (!nodeState) {
        // Use default gray color for uninitialized nodes
        const idx = i * 3;
        colorArray[idx] = 0.67; // gray
        colorArray[idx + 1] = 0.67;
        colorArray[idx + 2] = 0.67;
        continue;
      }

      const baseColor = calculateNodeColor(nodeState, currentTime, agitationLevel);

      // Apply collision-based color influence
      const collisionInfluencedColor = baseColor.clone().lerp(
        collisionColorRef.current,
        0.3
      );
      collisionInfluencedColor.multiplyScalar(1.0 + emissiveIntensityRef.current * 0.3);

      // Set color in array
      const idx = i * 3;
      colorArray[idx] = collisionInfluencedColor.r;
      colorArray[idx + 1] = collisionInfluencedColor.g;
      colorArray[idx + 2] = collisionInfluencedColor.b;
    }

    colorAttribute.needsUpdate = true;

    // Also ensure material uses vertex colors
    const material = instancedMeshRef.current.material as THREE.MeshStandardMaterial;
    if (material) {
      material.vertexColors = true;
    }
  }, [nodeCount]);

  // Mounting animation
  const { scale: mountScale } = useMountAnimation({
    easing: getRecommendedEasing('mount'),
    duration: 1200,
    delay: 300,
    animateRotation: false,
  });

  // Initialize instance colors and enable instance coloring
  useEffect(() => {
    if (instancedMeshRef.current) {
      // Create instance color attribute using theme primary color
      const colors = new Float32Array(nodeCount * 3);
      for (let i = 0; i < nodeCount; i++) {
        colors[i * 3] = primaryColor.r;
        colors[i * 3 + 1] = primaryColor.g;
        colors[i * 3 + 2] = primaryColor.b;
      }

      instancedMeshRef.current.geometry.setAttribute(
        'color',
        new THREE.InstancedBufferAttribute(colors, 3)
      );

      // Enable instance coloring in material
      const material = instancedMeshRef.current.material as THREE.MeshStandardMaterial;
      if (material) {
        material.vertexColors = true;
      }
    }
  }, [nodeCount, primaryColor]);

  // Expose node positions for particle evaluation
  const nodePositionsRef = useRef<THREE.Vector3[]>([]);

  // Update node positions ref each frame for particle collision detection
  useFrame(() => {
    if (instancedMeshRef.current) {
      updateNodePositions(instancedMeshRef as React.RefObject<THREE.InstancedMesh>, nodeStatesRef, nodePositionsRef, { nodeCount });
    }
  });

  // Expose integration function via ref
  useImperativeHandle(collisionRef, () => ({
    handleCollision,
    getPosition: () => groupRef.current?.position || new THREE.Vector3(...position),
    integrateParticle: integrateParticleFn,
    getNodePositions: () => nodePositionsRef.current,
  }), [handleCollision, integrateParticleFn, position]);

  // Track scroll for agitation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight;
      const progress = Math.min(1, scrollY / maxScroll);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state, delta) => {
    if (!instancedMeshRef.current || !linesRef.current || !groupRef.current) return;

    const t = state.clock.getElapsedTime();

    // Agitation level - only from scroll, not mouse
    const agitationLevel = scrollProgress > 0.1 ? 0.5 : 0;

    // Apply mounting animation scale to group
    groupRef.current.scale.set(mountScale, mountScale, mountScale);

    // Update instanced mesh positions and matrices
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const nodeSize = 0.08;

    for (let i = 0; i < nodeCount; i++) {
      const nodeState = nodeStatesRef.current[i];

      // Skip if nodeState doesn't exist
      if (!nodeState) {
        // Hide uninitialized nodes by scaling to zero
        tempMatrix.identity();
        tempMatrix.scale(new THREE.Vector3(0, 0, 0));
        instancedMeshRef.current.setMatrixAt(i, tempMatrix);
        continue;
      }

      if (!nodeState.alive) {
        // Hide dead nodes by scaling to zero
        tempMatrix.identity();
        tempMatrix.scale(new THREE.Vector3(0, 0, 0));
        instancedMeshRef.current.setMatrixAt(i, tempMatrix);
        continue;
      }

      const baseIndex = i * 3;
      const baseX = basePositions[baseIndex];
      const baseY = basePositions[baseIndex + 1];
      const baseZ = basePositions[baseIndex + 2];

      // Use base position directly without noise displacement
      tempPosition.set(baseX, baseY, baseZ);

      // Set matrix for this instance (position and scale)
      tempMatrix.identity();
      tempMatrix.setPosition(tempPosition);

      // Elastic scale animation for new nodes
      let finalScale = nodeSize;
      if (nodeState.state === 'new' && nodeState.timer > NETWORK_CONFIG.newSpawnTime - 0.5) {
        // Phase 1: Elastic scale-in with overshoot
        const fadeIn = 1 - ((nodeState.timer - (NETWORK_CONFIG.newSpawnTime - 0.5)) / 0.5);
        // Elastic easing: overshoots to 1.2x then settles to 1.0x
        const elasticT = fadeIn < 1 ? 1 - Math.pow(2, -10 * fadeIn) * Math.sin((fadeIn * 10 - 0.75) * (2 * Math.PI / 3)) : 1;
        const overshoot = elasticT > 1 ? 1.2 : elasticT;
        finalScale = nodeSize * overshoot;
      }

      tempMatrix.scale(new THREE.Vector3(finalScale, finalScale, finalScale));
      instancedMeshRef.current.setMatrixAt(i, tempMatrix);
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;

    // 2. SCALE THROUGH INNOVATION: Smoothly lerp the overall scale
    const targetScale = baseScale + (growthFactor - baseScale) * agitationLevel;
    const currentScale = instancedMeshRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);

    instancedMeshRef.current.scale.setScalar(newScale);
    linesRef.current.scale.setScalar(newScale);

    // 3. Update connection lines based on current node positions
    updateConnections(
      linesRef as React.RefObject<THREE.LineSegments>,
      instancedMeshRef as React.RefObject<THREE.InstancedMesh>,
      nodeStatesRef,
      nodeCount,
      connectionDistance,
      agitationLevel,
      t
    );

    // 4. Update line opacity based on signal strength (competition) - smooth transition
    if (linesRef.current.material) {
      const material = linesRef.current.material as THREE.LineBasicMaterial;
      const baseOpacity = 0.2 + agitationLevel * 0.2; // Smooth opacity transition
      const pulse = Math.sin(t * 2) * 0.1 + 0.9;
      material.opacity = baseOpacity * pulse;
    }

    // 5. ISOLATED: Update node states and handle expiration
    updateNodeStatesFn(delta, t);

    // 6. NODE EVOLUTION SYSTEM: Death, Birth, and Cleaning (trigger new events)
    handleEvolution(
      t,
      lastEvolutionTimeRef,
      lastRandomSetTimeRef,
      nodeStatesRef,
      basePositions,
      spawnQueueRef,
      nodeCount,
      NETWORK_CONFIG
    );

    // 7. Apply node colors (abstracted)
    applyNodeColors(t, agitationLevel);

    // Lerp collision color toward default (decay over time - color evolution)
    collisionColorRef.current.lerp(new THREE.Color('#aaaaaa'), 0.02);
    emissiveIntensityRef.current = Math.max(0, emissiveIntensityRef.current - 0.01);

    // Apply collision-based color to line material
    if (linesRef.current.material) {
      const material = linesRef.current.material as THREE.LineBasicMaterial;
      const baseColor = new THREE.Color('#aaaaaa'); // Neutral gray
      const finalColor = baseColor.clone().lerp(collisionColorRef.current, 0.2);
      material.color.copy(finalColor);
    }

    // Dynamic rotation - base animation only
    const rotationSpeed = 0.1;
    const rotationVariation = Math.sin(t * 0.3) * 0.1 * agitationLevel;
    groupRef.current.rotation.y = t * rotationSpeed;
    groupRef.current.rotation.x = Math.sin(t * 0.2) * (0.05 + rotationVariation);
    groupRef.current.rotation.z = Math.cos(t * 0.25) * 0.03 * agitationLevel;
  });

  return (
    <group {...props} dispose={null}>
      <group ref={groupRef} position={position}>
        {/* Neurons (Nodes) - Spheres */}
        <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, nodeCount]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.6}
            vertexColors={true}
          />
        </instancedMesh>

        {/* Synapses (Connections) */}
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[connections, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#aaaaaa"
            transparent
            opacity={0.2}
            linewidth={1}
          />
        </lineSegments>
      </group>
    </group>
  );
}