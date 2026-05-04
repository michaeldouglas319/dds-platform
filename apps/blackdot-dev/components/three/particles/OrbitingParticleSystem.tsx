import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '@/app/landing/config/colors.config';
import { PARTICLE_CONFIG } from '@/app/landing/config/particle.config';
import { ParticleState, HandoffData } from '@/app/landing/types/particle.types';
import { NetworkRef } from '@/app/landing/types/network.types';
// Import shader material to register it
import '@/app/landing/shaders/ParticleMaterial'; // Register shader material

// Performance optimization constants (will be set based on isMobile detection)
const DEFAULT_MOBILE_PARTICLE_REDUCTION = 0.5;
const DEFAULT_UPDATE_THROTTLE = 1;
const DEFAULT_COLLISION_CHECK_INTERVAL = 0.1;

interface OrbitingParticleSystemProps {
  count?: number;
  objectPosition?: [number, number, number];
  avoidanceRadius?: number;
  avoidanceStrength?: number;
  orbitalSpeed?: number;
  collisionHandler?: (particleColor: THREE.Color, intensity: number) => void;
  collisionThreshold?: number;
  /** Optional: Network reference for neural network integration features (evaluation, integration) */
  networkRef?: React.RefObject<NetworkRef>;
  /** Optional: Enable network integration features (requires networkRef) */
  enableNetworkIntegration?: boolean;
}

const EVALUATION_TIME = 1.5;
const EVALUATION_DISTANCE = 0.15;
const ACCEPTANCE_THRESHOLD = 0.6;

/**
 * Reusable orbiting particle system that can be attached to any object.
 *
 * @example
 * // Basic usage - orbit around any position
 * <OrbitingParticleSystem
 *   objectPosition={[0, 0, 0]}
 *   count={200}
 * />
 *
 * @example
 * // With neural network integration
 * <OrbitingParticleSystem
 *   objectPosition={[0, -0.09, 0]}
 *   networkRef={networkRef}
 *   collisionHandler={handleCollision}
 * />
 *
 * @example
 * // Standalone without network features
 * <OrbitingParticleSystem
 *   objectPosition={[1, 2, 3]}
 *   enableNetworkIntegration={false}
 *   count={150}
 * />
 */
export function OrbitingParticleSystem({
  count = PARTICLE_CONFIG.count,
  objectPosition = [0, -0.09, 0],
  avoidanceRadius = PARTICLE_CONFIG.avoidanceRadius,
  avoidanceStrength = PARTICLE_CONFIG.avoidanceStrength,
  orbitalSpeed = PARTICLE_CONFIG.orbitalSpeed,
  collisionHandler,
  collisionThreshold = 0.15,
  networkRef,
  enableNetworkIntegration = true, // Default to true for backward compatibility
}: OrbitingParticleSystemProps) {
  // Mobile detection state (initialized to false for SSR safety)
  const [isMobile, setIsMobile] = useState(false);
  const [mobileParticleReduction, setMobileParticleReduction] = useState(DEFAULT_MOBILE_PARTICLE_REDUCTION);
  const [updateThrottle, setUpdateThrottle] = useState(DEFAULT_UPDATE_THROTTLE);
  const [collisionCheckInterval, setCollisionCheckInterval] = useState(DEFAULT_COLLISION_CHECK_INTERVAL);

  // Detect mobile/low-end device after hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mobile = (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) || (window.innerWidth < 768);
    const lowEnd = mobile && ((navigator.hardwareConcurrency || 2) < 4);

    setIsMobile(mobile);
    setMobileParticleReduction(lowEnd ? 0.3 : 0.5);
    setUpdateThrottle(mobile ? 2 : 1);
    setCollisionCheckInterval(mobile ? 0.2 : 0.1);
  }, []);

  // Optimize particle count for mobile
  const optimizedCount = useMemo(() => {
    const baseCount = count;
    if (isMobile) {
      return Math.floor(baseCount * mobileParticleReduction);
    }
    return baseCount;
  }, [count, isMobile, mobileParticleReduction]);

  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const lastCollisionCheckRef = useRef(0);
  const frameCountRef = useRef(0);

  const handoffRef = useRef<Map<number, HandoffData>>(new Map());

  const particlesRef = useRef<Array<{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    state: ParticleState;
    color: THREE.Color;
    evaluationTimer: number;
    targetNodeIdx: number | null;
    scale: number;
  }>>([]);

  const positionsArrayRef = useRef<Float32Array | null>(null);
  const colorsArrayRef = useRef<Float32Array | null>(null);
  const scalesArrayRef = useRef<Float32Array | null>(null);

  // Initialize particles
  useEffect(() => {
    // Get actual object position from network if available, otherwise use provided position
    let initialObjectPos: THREE.Vector3;
    if (networkRef?.current) {
      initialObjectPos = networkRef.current.getPosition();
    } else {
      initialObjectPos = new THREE.Vector3(...objectPosition);
    }

    const objectPos = initialObjectPos;
    const particles: typeof particlesRef.current = [];
    const positions = new Float32Array(optimizedCount * 3);
    const colors = new Float32Array(optimizedCount * 3);
    const scales = new Float32Array(optimizedCount);

    const shellCount = 2;
    const innerShellWeight = 0.6;

    for (let i = 0; i < optimizedCount; i++) {
      let shell;
      const rand = Math.random();
      if (rand < innerShellWeight) {
        shell = Math.floor(Math.random() * 2);
      } else {
        shell = 2 + Math.floor(Math.random() * 2);
      }

      const shellProgress = Math.random();
      let radius: number;
      if (shell < 2) {
        radius = 0.3 + shell * 0.25 + Math.random() * 0.25;
      } else {
        radius = 0.8 + (shell - 2) * 0.35 + Math.random() * 0.35;
      }

      const theta = shellProgress * Math.PI * 2 + (shell * Math.PI / shellCount);
      const phi = Math.acos(Math.random() * 2 - 1);
      const height = -0.4 + shellProgress * 0.8 + Math.random() * 0.3;

      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        height,
        radius * Math.sin(phi) * Math.sin(theta)
      ).add(objectPos);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );

      particles.push({
        position: pos.clone(),
        velocity: vel,
        state: 'roaming',
        color: new THREE.Color('#aaaaaa'), // Neutral gray to match nodes
        evaluationTimer: 0,
        targetNodeIdx: null,
        scale: 1.0,
      });

      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      const neutralColor = new THREE.Color('#aaaaaa'); // Neutral gray to match nodes
      colors[i * 3] = neutralColor.r;
      colors[i * 3 + 1] = neutralColor.g;
      colors[i * 3 + 2] = neutralColor.b;

      scales[i] = 1.0;
    }

    particlesRef.current = particles;
    positionsArrayRef.current = positions;
    colorsArrayRef.current = colors;
    scalesArrayRef.current = scales;

    if (pointsRef.current) {
      const geometry = pointsRef.current.geometry;
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      if (!geometry.getAttribute('scale')) {
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
      }
    }
  }, [optimizedCount, objectPosition, networkRef]);

  // Legacy attributes for shader compatibility
  const { radii, speeds, angles, heights, noiseOffsets, phases } = useMemo(() => {
    const radii = new Float32Array(optimizedCount);
    const speeds = new Float32Array(optimizedCount);
    const angles = new Float32Array(optimizedCount);
    const heights = new Float32Array(optimizedCount);
    const noiseOffsets = new Float32Array(optimizedCount);
    const phases = new Float32Array(optimizedCount);

    for (let i = 0; i < optimizedCount; i++) {
      radii[i] = 0.5;
      speeds[i] = 0.3;
      angles[i] = Math.random() * Math.PI * 2;
      heights[i] = 0;
      noiseOffsets[i] = Math.random() * Math.PI * 1.1;
      phases[i] = Math.random() * Math.PI * 1.1;
    }

    return { radii, speeds, angles, heights, noiseOffsets, phases };
  }, [optimizedCount]);

  // Update uniforms - initial setup
  useEffect(() => {
    if (materialRef.current) {
      // Limit pixel ratio for mobile performance
      const windowDPR = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
      const pixelRatio = isMobile ? Math.min(windowDPR, 1.5) : Math.min(windowDPR, 2);
      materialRef.current.uniforms.uPixelRatio.value = pixelRatio;
      // Will be updated dynamically in useFrame if networkRef is available
      const initialPos = networkRef?.current?.getPosition() || new THREE.Vector3(...objectPosition);
      materialRef.current.uniforms.uObjectPosition.value.copy(initialPos);
      materialRef.current.uniforms.uAvoidanceRadius.value = avoidanceRadius;
      materialRef.current.uniforms.uAvoidanceStrength.value = avoidanceStrength;
      materialRef.current.uniforms.uOrbitalSpeed.value = orbitalSpeed;
    }
  }, [objectPosition, avoidanceRadius, avoidanceStrength, orbitalSpeed, networkRef]);

  // Animation loop with frame throttling for mobile
  useFrame((state, delta) => {
    frameCountRef.current++;

    // Throttle updates on mobile
    if (isMobile && frameCountRef.current % updateThrottle !== 0) {
      return;
    }

    const t = state.clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
    }

    if (!positionsArrayRef.current || !colorsArrayRef.current || !scalesArrayRef.current) return;

    const particles = particlesRef.current;
    const positions = positionsArrayRef.current;
    const colors = colorsArrayRef.current;
    const scales = scalesArrayRef.current;

    // Get actual object position from network if available, otherwise use provided position
    // Neural network center is at group position, nodes are distributed around it
    let actualObjectPos: THREE.Vector3;
    if (networkRef?.current) {
      actualObjectPos = networkRef.current.getPosition();
    } else {
      actualObjectPos = new THREE.Vector3(...objectPosition);
    }

    // Update shader uniform with actual position
    if (materialRef.current) {
      materialRef.current.uniforms.uObjectPosition.value.copy(actualObjectPos);
    }

    const objectPos = actualObjectPos;

    // Update particles based on state
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      if (particle.state === 'integrated') {
        scales[i] = 0;
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
        continue;
      }

      // Handle handoff state - only if network integration is enabled
      if (particle.state === 'integrating' && enableNetworkIntegration) {
        const handoff = Array.from(handoffRef.current.values()).find(h => h.particleIdx === i);
        if (handoff && networkRef?.current) {
          const handoffProgress = Math.min(1, (t - handoff.startTime) / 0.5);

          const networkPos = networkRef.current.getPosition();
          const nodePositions = networkRef.current.getNodePositions();
          let targetPos = particle.position.clone();
          if (nodePositions && handoff.nodeIdx < nodePositions.length) {
            const nodePos = nodePositions[handoff.nodeIdx];
            if (nodePos.x !== Infinity) {
              targetPos = nodePos.clone().add(networkPos);
            }
          }

          particle.position.lerp(targetPos, 0.2);
          particle.scale = THREE.MathUtils.lerp(1.0, 0, handoffProgress);

          const greenColor = new THREE.Color(COLORS.green);
          const pulse = Math.sin(t * 10) * 0.3 + 0.7;
          particle.color.lerp(greenColor, pulse * 0.5);

          if (handoffProgress >= 1) {
            particle.state = 'integrated';
            particle.scale = 0;
          }
        }
      }

      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;

      colors[i * 3] = particle.color.r;
      colors[i * 3 + 1] = particle.color.g;
      colors[i * 3 + 2] = particle.color.b;

      scales[i] = particle.scale;
    }

    // Update geometry attributes
    if (pointsRef.current) {
      const geometry = pointsRef.current.geometry;
      const posAttr = geometry.getAttribute('position');
      const colorAttr = geometry.getAttribute('color');
      const scaleAttr = geometry.getAttribute('scale');

      if (posAttr) {
        (posAttr as THREE.BufferAttribute).array = positions;
        posAttr.needsUpdate = true;
      }
      if (colorAttr) {
        (colorAttr as THREE.BufferAttribute).array = colors;
        colorAttr.needsUpdate = true;
      }
      if (scaleAttr) {
        (scaleAttr as THREE.BufferAttribute).array = scales;
        scaleAttr.needsUpdate = true;
      }
    }

    // Collision detection and evaluation - throttled for performance
    if (collisionHandler && t - lastCollisionCheckRef.current > collisionCheckInterval) {
      lastCollisionCheckRef.current = t;

      // Sample fewer particles on mobile for performance
      const sampleDivisor = isMobile ? 30 : 20;
      const sampleRate = Math.max(1, Math.floor(optimizedCount / sampleDivisor));

      for (let i = 0; i < optimizedCount; i += sampleRate) {
        const particle = particles[i];
        if (particle.state === 'integrated') continue;

        const particlePos = particle.position.clone().sub(objectPos);
        const distance = particlePos.length();

        // Check for node collision (evaluation trigger) - only if network integration is enabled
        if (distance < EVALUATION_DISTANCE && particle.state === 'roaming' && enableNetworkIntegration && networkRef?.current) {
          const nodePositions = networkRef.current.getNodePositions();
          if (nodePositions) {
            let nearestNodeIdx = -1;
            let minDist = Infinity;

            for (let j = 0; j < nodePositions.length; j++) {
              const nodePos = nodePositions[j];
              if (nodePos.x === Infinity) continue;

              const dist = particle.position.distanceTo(nodePos);
              if (dist < EVALUATION_DISTANCE && dist < minDist) {
                minDist = dist;
                nearestNodeIdx = j;
              }
            }

            if (nearestNodeIdx !== -1) {
              particle.state = 'evaluating';
              particle.targetNodeIdx = nearestNodeIdx;
              particle.evaluationTimer = EVALUATION_TIME;
            }
          }
        }

        // Handle evaluation state
        if (particle.state === 'evaluating') {
          particle.evaluationTimer -= delta;

          const strobe = Math.sin(t * 8) > 0 ? 1 : 0;
          const nodeColor = new THREE.Color(COLORS.default);
          particle.color.lerp(nodeColor, strobe * 0.5);

          if (particle.evaluationTimer <= 0) {
            const accepted = Math.random() > (1 - ACCEPTANCE_THRESHOLD);

            if (accepted && networkRef?.current) {
              particle.state = 'integrating';
              const nodeIdx = networkRef.current.integrateParticle(particle.position.clone(), 0);

              if (nodeIdx !== -1) {
                handoffRef.current.set(i, {
                  particleIdx: i,
                  nodeIdx,
                  timer: 0.5,
                  startTime: t,
                });
              } else {
                particle.state = 'roaming';
                particle.targetNodeIdx = null;
                const rejectDir = particle.position.clone().sub(objectPos).normalize();
                particle.velocity.add(rejectDir.multiplyScalar(0.3));
              }
            } else {
              particle.state = 'roaming';
              particle.targetNodeIdx = null;
              const rejectDir = particle.position.clone().sub(objectPos).normalize();
              particle.velocity.add(rejectDir.multiplyScalar(0.3));
            }
          }
        }

        // Collision handler for color evolution
        if (distance < collisionThreshold && collisionHandler) {
          const distFactor = 1 - (distance / collisionThreshold);
          collisionHandler(particle.color.clone(), distFactor);
        }
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positionsArrayRef.current || new Float32Array(optimizedCount * 3), 3]} />
        <bufferAttribute attach="attributes-aRadius" args={[radii, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aAngle" args={[angles, 1]} />
        <bufferAttribute attach="attributes-aHeight" args={[heights, 1]} />
        <bufferAttribute attach="attributes-aNoiseOffset" args={[noiseOffsets, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <orbitingParticleMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}