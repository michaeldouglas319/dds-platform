/**
 * Token Bridge Example: Unified Design Tokens for shadcn/ui + Three.js
 *
 * This file demonstrates how to use CSS design tokens shared between
 * shadcn/ui components and Three.js materials.
 *
 * Pattern:
 * 1. Define tokens in CSS custom properties (--color-primary, etc.)
 * 2. Use tokens in shadcn/ui via Tailwind CSS
 * 3. Read same tokens in Three.js via token bridge
 * 4. Theme changes automatically update both systems
 *
 * @example
 * ```tsx
 * // In your Next.js app:
 * import { useTokenBridge } from './useTokenBridge';
 * import { SceneWithTokenBridge } from './token-bridge-example';
 *
 * export function HomePage() {
 *   return (
 *     <div>
 *       {/* shadcn/ui components use tokens via Tailwind */}
 *       <Button className="bg-[var(--color-primary)]">Click me</Button>
 *
 *       {/* Three.js scene uses same tokens via bridge */}
 *       <SceneWithTokenBridge />
 *     </div>
 *   );
 * }
 * ```
 */

'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTokenBridge } from './useTokenBridge';
import {
  getColorToken,
  subscribeToThemeChanges,
} from './token-bridge';

/**
 * Example 1: Basic shader material using color tokens
 *
 * This shows the minimal setup: read tokens, apply to shader.
 */
export function createTokenizedMaterial(): THREE.ShaderMaterial {
  // Read tokens from CSS custom properties
  const primaryColor = getColorToken('--color-brand-primary', '#6366f1');
  const accentColor = getColorToken('--color-brand-accent', '#00ccaa');

  return new THREE.ShaderMaterial({
    uniforms: {
      uPrimaryColor: { value: primaryColor },
      uAccentColor: { value: accentColor },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uPrimaryColor;
      uniform vec3 uAccentColor;
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        // Blend between primary and accent based on UV and time
        vec3 color = mix(uPrimaryColor, uAccentColor, sin(vUv.x + uTime) * 0.5 + 0.5);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

/**
 * Example 2: React component that responds to theme changes
 *
 * Uses the useTokenBridge hook to automatically update materials
 * when the theme (data-theme attribute) changes.
 */
export function SceneWithTokenBridge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const frameRef = useRef<number>(0);

  // Hook into token bridge
  // Automatically reapplies tokens when theme changes
  useTokenBridge({
    material: materialRef.current ?? undefined,
    colorTokens: {
      uPrimaryColor: '--color-brand-primary',
      uAccentColor: '--color-brand-accent',
    },
    onThemeChange: (theme) => {
      console.log(`Theme changed to: ${theme}`);
    },
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup Three.js scene
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create material with tokens
    const material = createTokenizedMaterial();
    materialRef.current = material;

    // Create geometry and mesh
    const geometry = new THREE.IcosahedronGeometry(2, 4);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Update time uniform for animation
      if (material && 'uniforms' in material) {
        (material as THREE.ShaderMaterial).uniforms.uTime.value += 0.01;
      }

      mesh.rotation.x += 0.001;
      mesh.rotation.y += 0.002;

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

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
      role="img"
      aria-label="3D sphere animated with design tokens"
    />
  );
}

/**
 * Example 3: Manual theme switching (advanced)
 *
 * If you need fine-grained control over when tokens are applied,
 * subscribe directly to theme changes.
 */
export function SceneWithManualThemeSync() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    // Subscribe to theme changes and manually update materials
    const unsubscribe = subscribeToThemeChanges((theme) => {
      if (!materialRef.current) return;

      const material = materialRef.current;

      // Read new colors from CSS based on theme
      const bgColor = getColorToken(
        '--color-brand-background-' + theme,
        theme === 'dark' ? '#0a0a0a' : '#ffffff',
      );

      const primaryColor = getColorToken('--color-brand-primary', '#000000');

      // Update uniforms
      if ('uniforms' in material) {
        material.uniforms.uPrimaryColor.value.copy(primaryColor);
        material.uniforms.uBackgroundColor = {
          value: bgColor,
        };
      }

      console.log(`Applied ${theme} theme colors`);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '400px',
        background: 'var(--color-brand-background-light)',
        borderRadius: '8px',
      }}
    >
      {/* Your Three.js canvas would go here */}
      <p>Manual theme sync example</p>
    </div>
  );
}

/**
 * Usage Tips
 *
 * 1. Token Naming Convention
 *    - Primary colors: --color-brand-primary, --color-brand-secondary
 *    - Backgrounds: --color-brand-background-light, --color-brand-background-dark
 *    - Interactions: --color-interactive-hover, --color-interactive-active
 *    - Text: --color-brand-text-light, --color-brand-text-dark
 *
 * 2. Color Format Support
 *    - HSL: "hsl(226 71% 55%)" ✅
 *    - RGB: "99 102 241" ✅
 *    - Hex: "#6366f1" ✅
 *
 * 3. Performance Considerations
 *    - getColorToken() reads from DOM each call
 *    - Cache results or use useTokenBridge hook for efficiency
 *    - subscribeToThemeChanges() updates all materials at once
 *
 * 4. Fallback Strategy
 *    - Always provide fallback color to getColorToken()
 *    - Fallbacks used when token not found or document unavailable
 *    - This ensures scenes work in SSR context
 *
 * 5. Three.js Material Requirements
 *    - Only ShaderMaterial supports custom uniforms
 *    - Color uniforms must be type THREE.Color
 *    - Numeric uniforms auto-convert with getNumericToken()
 */
