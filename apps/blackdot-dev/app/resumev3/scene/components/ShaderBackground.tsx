"use client"

import { useRef } from 'react';
import type { JSX } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Custom Shader Material for animated background
 * Showcases advanced R3F shader techniques
 */
const WaveMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color('#6366f1'),
    uColor2: new THREE.Color('#8b5cf6'),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      vec3 pos = position;
      // Subtle wave distortion
      pos.z += sin(pos.x * 2.0 + uTime) * 0.05;
      pos.z += cos(pos.y * 2.0 + uTime) * 0.05;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      // Animated gradient based on position and time
      vec2 uv = vUv;
      
      // Create flowing gradient
      float gradient = sin(uv.x * 3.0 + uTime * 0.5) * 0.5 + 0.5;
      gradient += sin(uv.y * 2.0 + uTime * 0.3) * 0.3;
      gradient = gradient * 0.5 + 0.5;
      
      // Mix colors
      vec3 color = mix(uColor1, uColor2, gradient);
      
      // Add subtle noise for texture
      float noise = sin(vPosition.x * 10.0 + uTime) * sin(vPosition.y * 10.0 + uTime) * 0.02;
      color += noise;
      
      // Fade to transparent at edges
      float edgeFade = smoothstep(0.0, 0.3, min(uv.x, 1.0 - uv.x));
      edgeFade *= smoothstep(0.0, 0.3, min(uv.y, 1.0 - uv.y));
      
      gl_FragColor = vec4(color, edgeFade * 0.4);
    }
  `
);

extend({ WaveMaterial });

// R3F v9 type augmentation - simpler pattern
declare module '@react-three/fiber' {
  interface ThreeElements {
    waveMaterial: JSX.IntrinsicElements['meshStandardMaterial'];
  }
}

/**
 * ShaderBackground Component
 * Creates an animated shader-based background effect
 * Showcases custom shader material integration
 */
export function ShaderBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial & { uTime?: number } | null>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -3]} scale={[30, 30, 1]}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <waveMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

