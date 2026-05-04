'use client';

import React, { Suspense, useEffect, useMemo, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = '/assets/pictures/3d_google_logo.glb';

// Preload the Google logo model for faster rendering
if (typeof window !== 'undefined') {
  try {
    useGLTF.preload(MODEL_URL);
  } catch (_e) {
    console.debug('Model preload initiated');
  }
}

function GoogleGModel() {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(MODEL_URL);
  const cloned = useMemo(() => {
    if (!gltf.scene) return null;

    const clonedScene = gltf.scene.clone();

    // Enhance materials for visibility
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.Material) {
          const material = child.material.clone();

          // Make materials more visible
          if (material instanceof THREE.MeshStandardMaterial) {
            material.emissiveIntensity = 0.5;
            material.metalness = 0.0;
            material.roughness = 0.2;
          } else if (material instanceof THREE.MeshPhongMaterial) {
            material.emissive = new THREE.Color(0x333333);
            material.shininess = 100;
          }

          child.material = material;
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return clonedScene;
  }, [gltf.scene]);

  // Fit model to view once (in useMemo) to avoid jump; return null if no clone
  const fitted = useMemo(() => {
    if (!cloned) return null;
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 1.8 / maxDim : 1.5;
    cloned.position.sub(center.multiplyScalar(scale));
    cloned.scale.multiplyScalar(scale);
    return cloned;
  }, [cloned]);

  if (!fitted) {
    return (
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color="#4285F4"
          emissive="#4285F4"
          emissiveIntensity={0.4}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      <primitive object={fitted} />
    </group>
  );
}

export interface GoogleLogo3DProps {
  size?: number;
}

/**
 * Small 3D Google logo for use inside the Authenticate button.
 * Loads and renders the Google 3D model with auto-rotation.
 * Falls back to a Google-colored sphere if model fails to load.
 */
export function GoogleLogo3D({ size = 28 }: GoogleLogo3DProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsClient(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Transparent placeholder until client (no visible square)
  if (!isClient) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          verticalAlign: 'middle',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flexShrink: 0,
        verticalAlign: 'middle',
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        style={{
          width: size,
          height: size,
          display: 'block',
          pointerEvents: 'none',
        }}
        frameloop="always"
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[2, 2, 2]} intensity={1.4} />
        <directionalLight position={[-2, -1, -2]} intensity={0.8} />
        <pointLight position={[0, 0, 1.5]} intensity={1} />

        <Suspense fallback={null}>
          <GoogleGModel />
        </Suspense>
      </Canvas>
    </span>
  );
}

export default GoogleLogo3D;
