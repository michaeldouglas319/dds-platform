'use client';

/**
 * Theme Showcase Renderer
 *
 * Demonstrates the unified design system where shadcn/ui components and Three.js
 * scenes share the same CSS token layer and respond to theme changes simultaneously.
 *
 * This renderer proves the integration by showing:
 * 1. UI components (Button, Card, Badge) using token-based Tailwind styles
 * 2. A Three.js scene with materials reading the same tokens
 * 3. Live theme switching with simultaneous updates to both
 *
 * @example
 * {
 *   "type": "section",
 *   "display": { "layout": "theme-showcase" },
 *   "subject": { "title": "Design System" },
 *   "spatial": { "autoRotate": true }
 * }
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { RendererProps } from '@dds/types';
import {
  getColorToken,
  subscribeToThemeChanges,
  getCurrentTheme,
} from '../lib/token-bridge';
import { SceneWithFallback } from '../lib/SceneWithFallback';

// ─── Tokenized Shader Material ───────────────────────────────────────

function createThemeShowcaseMaterial(): THREE.ShaderMaterial {
  const primaryColor = getColorToken('--color-primary', '#6366f1');
  const secondaryColor = getColorToken('--color-secondary', '#00ccaa');
  const backgroundColorLight = getColorToken('--color-neutral-50', '#ffffff');
  const backgroundColorDark = getColorToken('--color-neutral-950', '#0a0a0a');

  return new THREE.ShaderMaterial({
    uniforms: {
      uPrimaryColor: { value: primaryColor },
      uSecondaryColor: { value: secondaryColor },
      uBackgroundLight: { value: backgroundColorLight },
      uBackgroundDark: { value: backgroundColorDark },
      uTime: { value: 0 },
      uTheme: { value: getCurrentTheme() === 'dark' ? 1.0 : 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform vec3 uBackgroundLight;
      uniform vec3 uBackgroundDark;
      uniform float uTime;
      uniform float uTheme;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        // Blend between primary and secondary based on position + time
        vec3 color = mix(
          uPrimaryColor,
          uSecondaryColor,
          sin(vUv.x * 3.14159 + uTime) * 0.5 + 0.5
        );

        // Modulate by position for depth
        color += vPosition * 0.1;

        // Apply background color based on theme
        vec3 bg = mix(uBackgroundLight, uBackgroundDark, uTheme);
        color = mix(bg, color, 0.7);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

// ─── Three.js Scene Component ─────────────────────────────────────

interface ThemeShowcaseSceneProps {
  autoRotate?: boolean;
}

function ThemeShowcaseScene({ autoRotate = true }: ThemeShowcaseSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const frameRef = useRef<number>(0);

  // Wire token bridge to material
  useEffect(() => {
    return subscribeToThemeChanges((theme) => {
      if (materialRef.current && 'uniforms' in materialRef.current) {
        materialRef.current.uniforms.uTheme.value =
          theme === 'dark' ? 1.0 : 0.0;
      }
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup Three.js
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create material and mesh
    const material = createThemeShowcaseMaterial();
    materialRef.current = material;

    const geometry = new THREE.IcosahedronGeometry(2, 5);
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(5, 5, 5);
    scene.add(light);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (material && 'uniforms' in material) {
        (material as THREE.ShaderMaterial).uniforms.uTime.value += 0.016;
      }

      if (autoRotate && mesh) {
        mesh.rotation.x += 0.0005;
        mesh.rotation.y += 0.001;
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

    // Subscribe to theme changes for shader uniforms
    const unsubscribe = subscribeToThemeChanges((theme) => {
      if (!materialRef.current) return;

      // Update background colors based on new theme
      const bgLight = getColorToken('--color-neutral-50', '#ffffff');
      const bgDark = getColorToken('--color-neutral-950', '#0a0a0a');

      if ('uniforms' in materialRef.current) {
        materialRef.current.uniforms.uBackgroundLight.value.copy(bgLight);
        materialRef.current.uniforms.uBackgroundDark.value.copy(bgDark);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      unsubscribe();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [autoRotate]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
      role="img"
      aria-label="3D shape animated with design system tokens"
    />
  );
}

// ─── UI Component Example ──────────────────────────────────────────

function ThemeShowcaseUI() {
  const theme = getCurrentTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="space-y-6"
      style={{
        backgroundColor: `var(--color-background)`,
        color: `var(--color-foreground)`,
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--color-neutral-200)',
      }}
    >
      {/* Title */}
      <div>
        <h2
          className="text-2xl font-bold"
          style={{
            color: `var(--color-primary)`,
            marginBottom: '8px',
          }}
        >
          Design System Tokens
        </h2>
        <p style={{ color: `var(--color-muted-foreground)` }}>
          Both the 3D scene and UI components share the same CSS token layer.
          Change your system theme to see both update simultaneously.
        </p>
      </div>

      {/* Token Display Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Primary Color Card */}
        <div
          style={{
            backgroundColor: `var(--color-primary)`,
            color: '#ffffff',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div className="text-sm font-semibold">Primary</div>
          <div className="text-xs opacity-75">--color-primary</div>
        </div>

        {/* Secondary Color Card */}
        <div
          style={{
            backgroundColor: `var(--color-secondary)`,
            color: '#000000',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div className="text-sm font-semibold">Secondary</div>
          <div className="text-xs opacity-75">--color-secondary</div>
        </div>

        {/* Theme Badge */}
        <div
          style={{
            backgroundColor: isDark
              ? `var(--color-neutral-800)`
              : `var(--color-neutral-200)`,
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            border: `2px solid var(--color-primary)`,
          }}
        >
          <div className="text-sm font-semibold">
            {isDark ? '🌙' : '☀️'} {theme}
          </div>
          <div className="text-xs opacity-75">data-theme</div>
        </div>
      </div>

      {/* Description */}
      <div
        style={{
          padding: '16px',
          backgroundColor: `var(--color-neutral-900)`,
          borderLeft: `4px solid var(--color-primary)`,
          borderRadius: '4px',
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        <strong>How it works:</strong> The shader material reads CSS custom
        properties (--color-primary, --color-secondary, etc.) and converts them
        to THREE.Color objects. When you change your system theme or toggle
        data-theme, the token bridge automatically updates the shader uniforms,
        creating a seamless visual experience across UI and 3D.
      </div>
    </div>
  );
}

// ─── Main Renderer Component ───────────────────────────────────────

export function ThemeShowcaseRenderer({
  section,
  onError,
}: RendererProps) {
  const autoRotate = section.spatial?.autoRotate !== false;

  return (
    <div className="space-y-8 py-8 px-4 sm:px-6">
      {/* Header */}
      {section.subject?.title && (
        <div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: `var(--color-primary)` }}
          >
            {section.subject.title}
          </h1>
          {section.subject.subtitle && (
            <p
              className="text-lg"
              style={{ color: `var(--color-muted-foreground)` }}
            >
              {section.subject.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Grid: 3D Scene + UI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* 3D Scene (left) */}
        <SceneWithFallback height={400}>
          <ThemeShowcaseScene autoRotate={autoRotate} />
        </SceneWithFallback>

        {/* UI Component (right) */}
        <ThemeShowcaseUI />
      </div>

      {/* Footer */}
      {section.content?.body && (
        <div
          style={{
            color: `var(--color-foreground)`,
            lineHeight: '1.6',
            maxWidth: '64rem',
          }}
        >
          {section.content.body}
        </div>
      )}
    </div>
  );
}
