'use client';

/**
 * Gradient Mesh Scene
 *
 * A parametric Three.js scene that renders an animated mesh gradient.
 * Colors are read from CSS design tokens and update on theme changes.
 *
 * Features:
 * - Token-aware colors (primary, accent, neutral)
 * - Reduced motion support
 * - WebGL error handling with Suspense fallback
 * - Theme subscription for automatic updates
 * - Responsive canvas sizing
 */

import { useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { useTokenBridge } from '../useTokenBridge';
import { SceneWithFallback } from '../SceneWithFallback';
import { getColorToken } from '../token-bridge';

interface GradientMeshSceneProps {
  /** Canvas height (default: '100vh') */
  height?: string | number;
  /** Container class name */
  className?: string;
  /** Animation speed multiplier (default: 1) */
  speed?: number;
}

/**
 * Create a shader material that blends three color tokens
 */
function createTokenizedGradientMaterial(): THREE.ShaderMaterial {
  const primaryColor = getColorToken('--color-primary', '#6366f1');
  const secondaryColor = getColorToken('--color-secondary', '#10b981');
  const accentColor = getColorToken('--color-accent', '#f59e0b');

  return new THREE.ShaderMaterial({
    uniforms: {
      uPrimary: { value: primaryColor },
      uSecondary: { value: secondaryColor },
      uAccent: { value: accentColor },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPos;

      void main() {
        vUv = uv;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uPrimary;
      uniform vec3 uSecondary;
      uniform vec3 uAccent;
      uniform float uTime;

      varying vec2 vUv;
      varying vec3 vPos;

      vec3 gradient(vec2 uv, float time) {
        // Multi-layer gradient animation
        vec2 p1 = vec2(sin(time * 0.3) * 0.5 + 0.5, cos(time * 0.2) * 0.5 + 0.5);
        vec2 p2 = vec2(sin(time * 0.4 + 2.0) * 0.5 + 0.5, cos(time * 0.25 + 1.0) * 0.5 + 0.5);
        vec2 p3 = vec2(sin(time * 0.35 + 4.0) * 0.5 + 0.5, cos(time * 0.3 + 2.0) * 0.5 + 0.5);

        // Distance fields for each control point
        float d1 = length(uv - p1);
        float d2 = length(uv - p2);
        float d3 = length(uv - p3);

        // Smooth step blending
        float w1 = 1.0 / (d1 + 0.1);
        float w2 = 1.0 / (d2 + 0.1);
        float w3 = 1.0 / (d3 + 0.1);
        float wTotal = w1 + w2 + w3;

        // Weighted color blend
        vec3 col = (uPrimary * w1 + uSecondary * w2 + uAccent * w3) / wTotal;

        // Add subtle noise/detail
        float noise = sin(vPos.x * 2.0 + time * 0.5) * sin(vPos.y * 2.0 + time * 0.3) * 0.1;
        col += noise * vec3(0.1);

        return col;
      }

      void main() {
        vec3 color = gradient(vUv, uTime);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

/**
 * GradientMeshScene: Main scene component
 *
 * Wraps Three.js scene with:
 * - Token bridge integration
 * - Error boundary
 * - Suspense fallback
 * - Responsive sizing
 */
function GradientMeshSceneContent({
  height = '100vh',
  speed = 1,
}: Omit<GradientMeshSceneProps, 'className'>): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const isReducedMotion = useRef(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion.current = mediaQuery.matches;
    const handler = (e: MediaQueryListEvent) => {
      isReducedMotion.current = e.matches;
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Setup token bridge for color uniforms
  useTokenBridge({
    material: materialRef.current ?? undefined,
    colorTokens: {
      uPrimary: '--color-primary',
      uSecondary: '--color-secondary',
      uAccent: '--color-accent',
    },
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height_px = containerRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height_px, 0.1, 1000);
    camera.position.z = 0.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
    renderer.setSize(width, height_px);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create material with tokens
    const material = createTokenizedGradientMaterial();
    materialRef.current = material;

    // Create geometry (full-screen quad)
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let startTime = Date.now();

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (!isReducedMotion.current && material && 'uniforms' in material) {
        const elapsed = (Date.now() - startTime) * 0.001;
        (material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed * speed;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [speed]);

  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: heightStyle,
        position: 'relative',
        overflow: 'hidden',
      }}
      data-testid="gradient-mesh-scene"
    />
  );
}

/**
 * GradientMeshScene: Public API
 *
 * Wraps content with Suspense and error boundary for safety.
 */
export function GradientMeshScene({
  height = '100vh',
  className,
  speed = 1,
}: GradientMeshSceneProps): JSX.Element {
  return (
    <SceneWithFallback height={height} className={className}>
      <Suspense fallback={<div style={{ width: '100%', height }} />}>
        <GradientMeshSceneContent height={height} speed={speed} />
      </Suspense>
    </SceneWithFallback>
  );
}
