'use client';

import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Preload } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Props for WebGPULoader component
 */
export interface WebGPULoaderProps {
  /**
   * Model URL (GLTF/GLB format)
   */
  modelUrl?: string;

  /**
   * Particle count for liquid effect
   * @default 2000
   */
  particleCount?: number;

  /**
   * Animation speed
   * @default 1
   */
  speed?: number;

  /**
   * Primary liquid color
   * @default '#00ff88'
   */
  liquidColor?: string;

  /**
   * Secondary liquid color for gradient
   * @default '#0088ff'
   */
  liquidColor2?: string;

  /**
   * Particle size
   * @default 0.05
   */
  particleSize?: number;

  /**
   * Show model orbit controls
   * @default false
   */
  showControls?: boolean;

  /**
   * Loading complete callback
   */
  onLoadComplete?: () => void;

  /**
   * Custom container style
   */
  style?: React.CSSProperties;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Particle data structure for liquid effect
 */
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
}

/**
 * Liquid Particle System Component with Mouse Interaction
 */
const LiquidParticleSystem: React.FC<{
  particleCount: number;
  liquidColor: THREE.Color;
  liquidColor2: THREE.Color;
  particleSize: number;
  speed: number;
}> = ({ particleCount, liquidColor, liquidColor2, particleSize, speed }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      position: new THREE.Vector3(
        Math.sin(i * 0.1) * 2,
        3 + Math.random() * 2,
        Math.cos(i * 0.1) * 2
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        -1 - Math.random() * 0.5,
        (Math.random() - 0.5) * 2
      ),
      life: Math.random() * 0.5 + 0.5,
    }));
  }, [particleCount]);

  // Update particles each frame
  useFrame(() => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;
    const mouseWorldPos = new THREE.Vector3(mouseRef.current.x * 5, mouseRef.current.y * 5, 2);

    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];

      // Mouse deflection force
      const towardsMouse = mouseWorldPos.clone().sub(p.position);
      const distance = towardsMouse.length();
      const deflectionRadius = 3;

      if (distance < deflectionRadius) {
        const force = (1 - distance / deflectionRadius) * 0.4;
        towardsMouse.normalize().multiplyScalar(force);
        p.velocity.add(towardsMouse);
      }

      // Physics simulation
      p.velocity.y -= 0.015 * speed; // Gravity
      p.velocity.multiplyScalar(0.98); // Damping

      p.position.add(
        p.velocity.clone().multiplyScalar(0.02 * speed)
      );

      // Decrease life
      p.life -= 0.004 * speed;

      // Reset dead particles
      if (p.life <= 0) {
        p.position.set(
          Math.sin(i * 0.1) * 2,
          3 + Math.random() * 1,
          Math.cos(i * 0.1) * 2
        );
        p.velocity.set(
          (Math.random() - 0.5) * 2,
          -1.5 - Math.random() * 0.5,
          (Math.random() - 0.5) * 2
        );
        p.life = 1;
      }

      // Update geometry
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;

      // Color based on life
      const hue = (i / particleCount) * 0.6; // Hue range
      const saturation = p.life; // Fade out
      const colorLerp = new THREE.Color().setHSL(hue, 1, 0.5);
      colorLerp.lerp(liquidColor, 0.5).lerp(liquidColor2, 0.5);

      colors[i * 3] = colorLerp.r * p.life;
      colors[i * 3 + 1] = colorLerp.g * p.life;
      colors[i * 3 + 2] = colorLerp.b * p.life;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    particlesRef.current.forEach((p, i) => {
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;

      const colorLerp = new THREE.Color().setHSL((i / particleCount) * 0.6, 1, 0.5);
      colors[i * 3] = colorLerp.r;
      colors[i * 3 + 1] = colorLerp.g;
      colors[i * 3 + 2] = colorLerp.b;
    });

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [particleCount]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: particleSize,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      }),
    [particleSize]
  );

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};

/**
 * Central rotating model component with mouse interaction
 */
const CentralModel: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.002 + mouseRef.current.y * 0.01;
    meshRef.current.rotation.y += 0.003 + mouseRef.current.x * 0.01;
  });

  return (
    <mesh ref={meshRef} scale={0.8}>
      <icosahedronGeometry args={[1, 4]} />
      <meshPhongMaterial
        color={0x0088ff}
        emissive={0x0044ff}
        shininess={100}
        wireframe={false}
      />
    </mesh>
  );
};

/**
 * Model loader component
 */
const ModelViewer: React.FC<{ modelUrl?: string }> = ({ modelUrl }) => {
  const { scene } = useThree();
  const gltf = useGLTF(modelUrl || '');

  useEffect(() => {
    if (!modelUrl || !gltf) return;

    const model = gltf.scene.clone();
    model.scale.set(1.5, 1.5, 1.5);
    scene.add(model);

    return () => {
      scene.remove(model);
    };
  }, [modelUrl, gltf, scene]);

  return null;
};

/**
 * Scene component combining model and liquid effect
 */
const LoaderScene: React.FC<{
  modelUrl?: string;
  particleCount: number;
  liquidColor: THREE.Color;
  liquidColor2: THREE.Color;
  particleSize: number;
  speed: number;
  showControls: boolean;
}> = ({
  modelUrl,
  particleCount,
  liquidColor,
  liquidColor2,
  particleSize,
  speed,
  showControls,
}) => {
  return (
    <>
      <color attach="background" args={[0x0a0a0f]} />
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.4} color={0x0088ff} />

      {/* Central rotating model */}
      {!modelUrl && <CentralModel />}
      {modelUrl && <ModelViewer modelUrl={modelUrl} />}

      {/* Liquid particle system */}
      <LiquidParticleSystem
        particleCount={particleCount}
        liquidColor={liquidColor}
        liquidColor2={liquidColor2}
        particleSize={particleSize}
        speed={speed}
      />

      {showControls && <OrbitControls autoRotate autoRotateSpeed={2} />}
      <Preload all />
    </>
  );
};

/**
 * WebGPU Loader Component - Reusable liquid loader with 3D model
 *
 * Features:
 * - GPU-accelerated particle system
 * - Support for GLTF/GLB models
 * - Customizable liquid colors and particle behavior
 * - High performance animation
 * - Responsive design
 *
 * @example
 * ```tsx
 * <WebGPULoader
 *   modelUrl="/models/my-model.glb"
 *   particleCount={2000}
 *   liquidColor="#00ff88"
 *   onLoadComplete={() => console.log('Ready!')}
 * />
 * ```
 */
export const WebGPULoader: React.FC<WebGPULoaderProps> = ({
  modelUrl,
  particleCount = 2000,
  speed = 1,
  liquidColor = '#00ff88',
  liquidColor2 = '#0088ff',
  particleSize = 0.05,
  showControls = false,
  onLoadComplete,
  style,
  className,
}) => {
  const [isReady, setIsReady] = useState(false);

  const liquidColorObj = useMemo(
    () => new THREE.Color(liquidColor),
    [liquidColor]
  );
  const liquidColor2Obj = useMemo(
    () => new THREE.Color(liquidColor2),
    [liquidColor2]
  );

  useEffect(() => {
    if (isReady && onLoadComplete) {
      onLoadComplete();
    }
  }, [isReady, onLoadComplete]);

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        onCreated={() => setIsReady(true)}
        performance={{ min: 0.5, max: 1 }}
      >
        <LoaderScene
          modelUrl={modelUrl}
          particleCount={particleCount}
          liquidColor={liquidColorObj}
          liquidColor2={liquidColor2Obj}
          particleSize={particleSize}
          speed={speed}
          showControls={showControls}
        />
      </Canvas>
    </div>
  );
};

export default WebGPULoader;
