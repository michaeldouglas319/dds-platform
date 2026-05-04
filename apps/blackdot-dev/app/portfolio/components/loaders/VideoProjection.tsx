'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Preload, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface VideoProjectionProps {
  /** Optional mask image URL. If omitted, default is a square of cubes. */
  opacity?: number;
  maskUrl?: string;
  videoUrl: string;
  gridSize?: number;
  spacing?: number;
  animationDuration?: number;
  style?: React.CSSProperties;
  onLoadComplete?: () => void;
  /** Optional mesh/screen to add to the scene (e.g. plane with video, custom mesh). */
  optionalScreen?: React.ReactNode;
}

/**
 * Video Projection Cube Grid — 1:1 with ref: app/landing/ref/video-projection-codrops
 * (Models.js createMask/createGrid, gl-app.js scene/camera/lights)
 */
interface CubeData {
  mesh: THREE.Mesh;
  gridX: number;
  gridY: number;
  originalScale: THREE.Vector3;
}

const CubeGrid: React.FC<{
  opacity?: number;
  maskUrl?: string;
  videoUrl: string;
  gridSize: number;
  spacing: number;
  onLoadComplete?: () => void;
}> = ({ opacity = 1, maskUrl, videoUrl, gridSize, spacing, onLoadComplete }) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const cubesRef = useRef<CubeData[]>([]);
  const ripplesRef = useRef<Array<{ startTime: number; x: number; y: number }>>([]);
  const [, setCubes] = useState<THREE.Mesh[]>([]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.opacity = opacity;
      materialRef.current.transparent = opacity < 1;
    }
  }, [opacity]);

  // Generate random pulse ripples on a timer (3-5 sec random intervals)
  useEffect(() => {
    const scheduleRipple = () => {
      const delay = Math.random() * 2000 + 3000; // 3-5 seconds random
      const timeoutId = setTimeout(() => {
        // Random position on screen (-1 to 1 normalized)
        const x = (Math.random() * 2) - 1;
        const y = (Math.random() * 2) - 1;

        ripplesRef.current.push({
          startTime: Date.now(),
          x,
          y,
        });

        // Clean up old ripples
        ripplesRef.current = ripplesRef.current.filter(
          (r) => Date.now() - r.startTime < 4000 // Keep ripples for 4 seconds
        );

        // Schedule next ripple
        scheduleRipple();
      }, delay);

      return timeoutId;
    };

    const timeoutId = scheduleRipple();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const useSquareDefault = maskUrl == null || maskUrl === '';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const rafIdRef = { current: 0 };

    const runWithMaskData = (
      data: Uint8ClampedArray,
      gridWidth: number,
      gridHeight: number
    ) => {

      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.loop = false;
      video.muted = true;
      video.playsInline = true;

      // Ping-pong: forward → backward → forward (no negative playbackRate; throttle reverse seeks to reduce glitches)
      let playingBackward = false;
      let lastTickTime = 0;
      let accumulatedBackward = 0;
      const SEEK_STEP = 1 / 30; // ~30fps seek rate during reverse to avoid decoder thrashing

      const tick = (time: number) => {
        rafIdRef.current = requestAnimationFrame(tick);
        if (!playingBackward) {
          lastTickTime = time;
          return;
        }
        if (!video.duration) return;
        const delta = lastTickTime ? (time - lastTickTime) / 1000 : 0;
        lastTickTime = time;
        accumulatedBackward += delta;
        // Throttle: max one seek per frame at ~30fps step (smoother, less glitchy)
        if (accumulatedBackward >= SEEK_STEP) {
          const next = Math.max(0, video.currentTime - SEEK_STEP);
          video.currentTime = next;
          accumulatedBackward -= SEEK_STEP;
          if (next <= 0) {
            playingBackward = false;
            accumulatedBackward = 0;
            video.currentTime = 0;
            video.play().catch(() => {});
          }
        }
      };
      rafIdRef.current = requestAnimationFrame(tick);

      video.addEventListener('ended', () => {
        video.pause(); // Prevent playback conflicts during manual reverse
        playingBackward = true;
        accumulatedBackward = 0;
        lastTickTime = performance.now();
      });
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = 0;
        video.play().catch(() => {});
      });

      if (video.readyState >= 1) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      videoTexture.wrapS = THREE.ClampToEdgeWrapping;
      videoTexture.wrapT = THREE.ClampToEdgeWrapping;

      const material = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.FrontSide,
        opacity,
        transparent: opacity < 1,
      });
      materialRef.current = material;

      const addCube = (x: number, y: number) => {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const uvX = x / gridSize;
        const uvY = y / gridSize;
        const uvWidth = 1 / gridSize;
        const uvHeight = 1 / gridSize;
        const uvAttribute = geometry.attributes.uv;
        const uvArray = uvAttribute.array as Float32Array;
        for (let i = 0; i < uvArray.length; i += 2) {
          uvArray[i] = uvX + uvArray[i] * uvWidth;
          uvArray[i + 1] = uvY + uvArray[i + 1] * uvHeight;
        }
        uvAttribute.needsUpdate = true;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (x - (gridSize - 1) / 2) * spacing;
        mesh.position.y = (y - (gridSize - 1) / 2) * spacing;
        mesh.position.z = 0;
        mesh.scale.set(1, 1, 1); // Store original scale
        cubesRef.current.push({
          mesh,
          gridX: x,
          gridY: y,
          originalScale: new THREE.Vector3(1, 1, 1),
        });
        if (groupRef.current) groupRef.current.add(mesh);
      };

      // 1:1 with Models.js createGrid: loop gridSize × gridSize
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const flippedY = gridHeight - 1 - y;
          const pixelIndex = (flippedY * gridWidth + x) * 4;
          const inBounds = x < gridWidth && y < gridHeight;
          const r = inBounds ? data[pixelIndex] : 255;
          const g = inBounds ? data[pixelIndex + 1] : 255;
          const b = inBounds ? data[pixelIndex + 2] : 255;
          const brightness = (r + g + b) / 3;
          if (brightness < 128) addCube(x, y);
        }
      }

      // Fallback: if mask is all light (e.g. placeholder.jpg), show full grid so something is visible
      if (cubesRef.current.length === 0) {
        for (let x = 0; x < gridSize; x++) {
          for (let y = 0; y < gridSize; y++) addCube(x, y);
        }
      }

      setCubes(cubesRef.current.map((c) => c.mesh));
      onLoadComplete?.();
    };

    if (useSquareDefault) {
      // Default: square of cubes (no mask image)
      canvas.width = gridSize;
      canvas.height = gridSize;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, gridSize, gridSize);
      const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
      runWithMaskData(imageData.data, gridSize, gridSize);
    } else {
      const maskImage = new Image();
      maskImage.crossOrigin = 'anonymous';
      maskImage.onload = () => {
        const originalWidth = maskImage.width;
        const originalHeight = maskImage.height;
        const aspectRatio = originalWidth / originalHeight;
        let gridWidth = gridSize;
        let gridHeight = gridSize;
        if (aspectRatio > 1) {
          gridWidth = gridSize;
          gridHeight = Math.round(gridSize / aspectRatio);
        } else {
          gridHeight = gridSize;
          gridWidth = Math.round(gridSize * aspectRatio);
        }
        canvas.width = gridWidth;
        canvas.height = gridHeight;
        ctx.drawImage(maskImage, 0, 0, gridWidth, gridHeight);
        const imageData = ctx.getImageData(0, 0, gridWidth, gridHeight);
        runWithMaskData(imageData.data, gridWidth, gridHeight);
      };
      maskImage.src = maskUrl;
    }

    return () => {
      materialRef.current = null;
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [maskUrl, videoUrl, gridSize, spacing, opacity, onLoadComplete]);

  // Animate expanding ripples from pointer origins
  useFrame(({ camera }) => {
    if (cubesRef.current.length === 0) return;

    const rippleSpeed = 1.5; // How fast ripples expand (very slow)
    const rippleWaveWidth = 2.5; // Width of each ripple (wider)
    const rippleIntensity = 0.1; // Max scale multiplier (very subtle - 10% size increase)

    // Calculate scale for each cube from all active ripples
    cubesRef.current.forEach(({ mesh, originalScale }) => {
      const cubeWorldPos = new THREE.Vector3();
      mesh.getWorldPosition(cubeWorldPos);

      let maxScale = 1;

      // Apply each active ripple
      ripplesRef.current.forEach((ripple) => {
        const age = (Date.now() - ripple.startTime) / 1000; // Age in seconds
        // Speed accelerates over time (recovery effect)
        const adaptiveSpeed = rippleSpeed * (1 + age * 0.5);
        const rippleRadius = age * adaptiveSpeed; // Expanding radius

        // Cast ray from camera through ripple origin to world space
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2(ripple.x, ripple.y);
        raycaster.setFromCamera(pointer, camera);

        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const rippleOrigin = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, rippleOrigin);

        // Distance from cube to ripple origin
        const distance = cubeWorldPos.distanceTo(rippleOrigin);
        const distFromWave = Math.abs(distance - rippleRadius);

        // Strong effect within wave, fades at edges
        if (distFromWave < rippleWaveWidth) {
          const waveInfluence = 1 - distFromWave / rippleWaveWidth;
          const rippleScale = 1 + waveInfluence * (rippleIntensity - 1);
          maxScale = Math.max(maxScale, rippleScale);
        }
      });

      // Apply final scale
      mesh.scale.copy(originalScale).multiplyScalar(maxScale);
    });
  });

  return <group ref={groupRef} scale={0.15} />;
};

/**
 * Video Projection Loader Component
 * Grid of UV-mapped video cubes controlled by mask image
 */
export const VideoProjection: React.FC<VideoProjectionProps> = ({
  opacity = 1,
  maskUrl,
  videoUrl,
  gridSize = 24,
  spacing = 0.65,
  style,
  onLoadComplete,
  optionalScreen,
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 35 }}
        performance={{ min: 0.5, max: 1 }}
        gl={{ alpha: false, antialias: true }}
        style={{ display: 'block' }}
      >
        <color attach="background" args={[0x0a0a0f]} />
        <ambientLight color={0xffffff} />
        <directionalLight color={0xffffff} position={[5, 5, 5]} intensity={10} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <MeshReflectorMaterial
            blur={[256, 128]}
            resolution={512}
            mixBlur={0.5}
            mixStrength={0.4}
            roughness={0.2}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0a0a0a"
            metalness={0.1}
            mirror={0.25}
          />
        </mesh>

        {/* Cube layout: grid + optional mesh/screen (e.g. plane, custom mesh) */}
        <group name="projection-layout">
          <CubeGrid
            opacity={opacity}
            maskUrl={maskUrl}
            videoUrl={videoUrl}
            gridSize={gridSize}
            spacing={spacing}
            onLoadComplete={onLoadComplete}
          />
          {optionalScreen != null ? (
            <group name="projection-screen-slot">{optionalScreen}</group>
          ) : null}
        </group>

        {/* Lock view like Landing V1: no OrbitControls, fixed camera */}
        <Preload all />
      </Canvas>
    </div>
  );
};

export default VideoProjection;
