/**
 * Mirror Component
 *
 * Reusable reflective surface using Three.js Reflector.
 * Based on: https://github.com/mrdoob/three.js/blob/master/examples/webgl_mirror.html
 *
 * Features:
 * - Real-time reflections of scene objects
 * - Configurable geometry (plane, circle)
 * - Adjustable resolution and mirror tint
 * - Automatic render target management
 */

'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

interface MirrorProps {
  /** Mirror shape type */
  geometry?: 'plane' | 'circle';

  /** Geometry dimensions (width/height for plane, radius for circle) */
  dimensions?: {
    width?: number;
    height?: number;
    radius?: number;
    segments?: number;
  };

  /** Position in world space */
  position?: [number, number, number] | THREE.Vector3;

  /** Rotation in radians [x, y, z] */
  rotation?: [number, number, number];

  /** Mirror surface color tint (hex) */
  color?: number | string;

  /** Reflection resolution scale (0.1 - 1.0, lower = better performance) */
  resolutionScale?: number;

  /** Prevents z-fighting artifacts (default: 0.003) */
  clipBias?: number;

  /** Optional blur for softer reflections */
  blur?: number;
}

export function Mirror({
  geometry = 'plane',
  dimensions = {},
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = 0xb5b5b5,
  resolutionScale = 0.5,
  clipBias = 0.003,
  blur = 0,
}: MirrorProps) {
  const { gl } = useThree();
  const mirrorRef = useRef<Reflector | null>(null);

  // Create geometry based on type
  const mirrorGeometry = useMemo(() => {
    if (geometry === 'circle') {
      const radius = dimensions.radius ?? 40;
      const segments = dimensions.segments ?? 64;
      return new THREE.CircleGeometry(radius, segments);
    } else {
      const width = dimensions.width ?? 100;
      const height = dimensions.height ?? 100;
      return new THREE.PlaneGeometry(width, height);
    }
  }, [geometry, dimensions]);

  // Calculate render target dimensions
  const renderTargetSize = useMemo(() => {
    const size = gl.getDrawingBufferSize(new THREE.Vector2());
    return {
      width: size.width * resolutionScale,
      height: size.height * resolutionScale,
    };
  }, [gl, resolutionScale]);

  // Create Reflector instance
  useEffect(() => {
    const reflector = new Reflector(mirrorGeometry, {
      clipBias,
      textureWidth: renderTargetSize.width,
      textureHeight: renderTargetSize.height,
      color: typeof color === 'string' ? new THREE.Color(color) : color,
    });

    // Apply position
    if (Array.isArray(position)) {
      reflector.position.set(position[0], position[1], position[2]);
    } else {
      reflector.position.copy(position);
    }

    // Apply rotation
    reflector.rotation.set(rotation[0], rotation[1], rotation[2]);

    // Optional blur effect
    if (blur > 0 && reflector.material) {
      // Access Reflector's internal material and add subtle blur via transparency
      const mat = reflector.material as THREE.ShaderMaterial;
      if (mat.opacity !== undefined) {
        mat.transparent = true;
        mat.opacity = 1.0 - blur * 0.1; // Subtle blur via opacity
      }
    }

    mirrorRef.current = reflector;

    return () => {
      mirrorGeometry.dispose();
      reflector.dispose();
    };
  }, [mirrorGeometry, clipBias, renderTargetSize, color, position, rotation, blur]);

  // Handle window resize - update render target
  useEffect(() => {
    const handleResize = () => {
      if (!mirrorRef.current) return;

      const size = gl.getDrawingBufferSize(new THREE.Vector2());
      const width = size.width * resolutionScale;
      const height = size.height * resolutionScale;

      mirrorRef.current.getRenderTarget().setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gl, resolutionScale]);

  if (!mirrorRef.current) return null;
  return <primitive object={mirrorRef.current} />;
}

/**
 * Convenience component for floor mirrors (horizontal reflective surfaces)
 */
export function FloorMirror({
  radius = 40,
  position = [0, 0, 0],
  color = 0xb5b5b5,
  resolutionScale = 0.5,
}: {
  radius?: number;
  position?: [number, number, number] | THREE.Vector3;
  color?: number | string;
  resolutionScale?: number;
}) {
  return (
    <Mirror
      geometry="circle"
      dimensions={{ radius, segments: 64 }}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]} // Horizontal
      color={color}
      resolutionScale={resolutionScale}
    />
  );
}

/**
 * Convenience component for wall mirrors (vertical reflective surfaces)
 */
export function WallMirror({
  width = 100,
  height = 100,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = 0xb5b5b5,
  resolutionScale = 0.5,
}: {
  width?: number;
  height?: number;
  position?: [number, number, number] | THREE.Vector3;
  rotation?: [number, number, number];
  color?: number | string;
  resolutionScale?: number;
}) {
  return (
    <Mirror
      geometry="plane"
      dimensions={{ width, height }}
      position={position}
      rotation={rotation}
      color={color}
      resolutionScale={resolutionScale}
    />
  );
}
