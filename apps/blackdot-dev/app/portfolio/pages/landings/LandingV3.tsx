'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  CSSProperties,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated, config } from '@react-spring/web';
import { useLandingState } from '../../hooks/useLandingState';
import ClickToSignInOverlay, { useSignInOverlay } from '../../components/shared/ClickToSignInOverlay';
import NavigationDock, { defaultNavigationItems, NavigationItem } from '@/app/portfolio/components/shared/NavigationDock';

/**
 * Device tier detection based on performance characteristics
 */
type DeviceTier = 'low' | 'mid' | 'high';

interface DeviceCapabilities {
  tier: DeviceTier;
  particleCount: number;
  pixelRatio: number;
  reducedMotion: boolean;
  gpuMemory: number;
}

/**
 * Detect device capabilities and return appropriate settings
 */
const detectDeviceCapabilities = (): DeviceCapabilities => {
  // Check for reduced motion preference (safe for SSR)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Get device pixel ratio (indicator of resolution) (safe for SSR)
  const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  // Rough GPU memory detection (not perfect but works for most cases)
  let gpuMemory = 2048; // Default to 2GB
  if (typeof window !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (ext) {
          const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
          if (renderer && renderer.includes('Adreno')) gpuMemory = 1024;
          if (renderer && renderer.includes('Mali')) gpuMemory = 1024;
          if (renderer && renderer.includes('RTX')) gpuMemory = 8192;
        }
      }
    } catch {
      // Fallback if WebGL detection fails
    }
  }

  // Determine device tier (safe for SSR)
  let tier: DeviceTier = 'mid';
  const innerWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  if (innerWidth < 768 && gpuMemory < 2048) {
    tier = 'low';
  } else if (innerWidth > 1920 && gpuMemory >= 4096) {
    tier = 'high';
  }

  // Determine particle count based on tier
  const particleCountMap: Record<DeviceTier, number> = {
    low: 15,
    mid: 25,
    high: 40,
  };

  return {
    tier,
    particleCount: reducedMotion ? Math.min(particleCountMap[tier], 10) : particleCountMap[tier],
    pixelRatio,
    reducedMotion,
    gpuMemory,
  };
};

/**
 * Particle data structure
 */
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  scale: number;
  opacity: number;
  mass: number;
}

/**
 * Adaptive Particles Component - Minimalist sparse particle system
 */
interface AdaptiveParticlesProps {
  count: number;
  reducedMotion: boolean;
}

const AdaptiveParticles: React.FC<AdaptiveParticlesProps> = ({ count, reducedMotion }) => {
  const meshRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<Particle[]>([]);
  const { camera } = useThree();
  const animationIdRef = useRef<number | null>(null);

  // Initialize particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: count }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      scale: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.5 + 0.3,
      mass: Math.random() * 0.5 + 0.5,
    }));
  }, [count]);

  // Animation loop
  useFrame(() => {
    if (!meshRef.current || reducedMotion) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const attenuations = meshRef.current.geometry.attributes.attenuation.array as Float32Array;

    for (let i = 0; i < particlesRef.current.length; i++) {
      const particle = particlesRef.current[i];

      // Update position
      particle.position.add(particle.velocity);

      // Soft constraints (particles drift gently)
      const dist = particle.position.length();
      if (dist > 40) {
        particle.velocity.multiplyScalar(-0.5);
      }

      // Damping
      particle.velocity.multiplyScalar(0.995);

      // Update geometry
      const idx = i * 3;
      positions[idx] = particle.position.x;
      positions[idx + 1] = particle.position.y;
      positions[idx + 2] = particle.position.z;

      attenuations[i] = particle.scale * particle.opacity;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.geometry.attributes.attenuation.needsUpdate = true;
  });

  // Create geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const attenuation = new Float32Array(count);

    particlesRef.current.forEach((particle, i) => {
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
      attenuation[i] = particle.scale * particle.opacity;
    });

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('attenuation', new THREE.BufferAttribute(attenuation, 1));

    return geo;
  }, [count]);

  // Minimal shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        texture: { value: new THREE.CanvasTexture(createParticleTexture()) },
      },
      vertexShader: `
        attribute float attenuation;
        varying float vAttenuation;

        void main() {
          vAttenuation = attenuation;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (300.0 / -mvPosition.z) * attenuation;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D texture;
        varying float vAttenuation;

        void main() {
          vec4 tex = texture2D(texture, gl_PointCoord);
          gl_FragColor = vec4(1.0, 1.0, 1.0, tex.a * vAttenuation * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  return <points ref={meshRef} geometry={geometry} material={material} />;
};

/**
 * Create a simple circular particle texture
 */
function createParticleTexture(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;

  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Soft circle gradient
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  return canvas;
}

/**
 * Central Glow - Minimal focal point
 */
interface CentralGlowProps {
  reducedMotion: boolean;
}

const CentralGlow: React.FC<CentralGlowProps> = ({ reducedMotion }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || reducedMotion) return;

    // Gentle rotation
    groupRef.current.rotation.x += 0.0001;
    groupRef.current.rotation.y += 0.0002;

    // Soft pulsing
    const scale = 1 + Math.sin(Date.now() * 0.0005) * 0.1;
    groupRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={groupRef}>
      {/* Main glow sphere */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial
          color={new THREE.Color(0.9, 0.95, 1.0)}
          wireframe={false}
          transparent={true}
          opacity={0.15}
        />
      </mesh>

      {/* Emissive core */}
      <mesh>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial
          color={new THREE.Color(0.95, 0.98, 1.0)}
          transparent={true}
          opacity={0.3}
        />
      </mesh>

      {/* Points of light */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 12 }, (_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  const radius = 2;
                  return [
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    Math.cos(angle * 0.5) * radius,
                  ];
                }).flat()
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.15} color={0xffffff} transparent opacity={0.8} />
      </points>
    </group>
  );
};

/**
 * Scene background with minimal lighting
 */
const SceneEnvironment: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || reducedMotion) return;

    // Subtle camera drift
    groupRef.current.rotation.z += 0.00003;
  });

  return (
    <group ref={groupRef}>
      {/* Minimal lighting setup */}
      <ambientLight intensity={0.2} />
      <pointLight
        position={[20, 20, 20]}
        intensity={0.15}
        distance={100}
        decay={2}
        color={0xffffff}
      />
      <pointLight
        position={[-20, -20, -20]}
        intensity={0.08}
        distance={100}
        decay={2}
        color={0xe8f0f8}
      />
    </group>
  );
};

/**
 * Canvas 3D Scene Component
 */
interface CanvasSceneProps {
  capabilities: DeviceCapabilities;
}

const CanvasScene: React.FC<CanvasSceneProps> = ({ capabilities }) => {
  return (
    <Canvas
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
      camera={{
        position: [0, 0, 30],
        fov: 75,
        near: 0.1,
        far: 10000,
      }}
      dpr={capabilities.pixelRatio}
      performance={{ min: 0.5, max: 1 }}
    >
      {/* Scene background */}
      <color attach="background" args={[0x0a0a0f]} />

      {/* Environment */}
      <SceneEnvironment reducedMotion={capabilities.reducedMotion} />

      {/* Central focal point */}
      <CentralGlow reducedMotion={capabilities.reducedMotion} />

      {/* Particle system */}
      <AdaptiveParticles
        count={capabilities.particleCount}
        reducedMotion={capabilities.reducedMotion}
      />

      {/* Optimize rendering */}
      <Preload all />
    </Canvas>
  );
};

/**
 * Main Landing Page Component - LandingV3
 *
 * A minimalist landing page with adaptive design:
 * - Responsive particle count based on device
 * - Smooth auth transitions
 * - NavigationDock for authenticated users
 * - ClickToSignInOverlay for unauthenticated users
 * - Respects reduced motion preferences
 * - 60+ FPS on all devices
 */
export const LandingV3: React.FC = () => {
  // State management
  const landingState = useLandingState('unauthenticated');
  const [activeNavItem, setActiveNavItem] = useState<string>('home');

  // Device capability detection
  const capabilities = useMemo(() => detectDeviceCapabilities(), []);

  // Check if authenticated
  const isAuthenticated = landingState.authState === 'authenticated';

  // Overlay state
  const [showOverlay, setShowOverlay] = useState(!isAuthenticated);

  // Update overlay visibility when auth state changes
  useEffect(() => {
    setShowOverlay(landingState.authState === 'unauthenticated');
  }, [landingState.authState]);

  // Navigation callbacks
  const navigationCallbacks = useMemo(
    () => ({
      onHome: () => {
        setActiveNavItem('home');
        console.log('Navigate to Home');
      },
      onComponents: () => {
        setActiveNavItem('components');
        console.log('Navigate to Components');
      },
      onPlayground: () => {
        setActiveNavItem('playground');
        console.log('Navigate to Playground');
      },
      onAbout: () => {
        setActiveNavItem('about');
        console.log('Navigate to About');
      },
      onProfile: () => {
        setActiveNavItem('profile');
        console.log('Navigate to Profile');
      },
      onSignOut: async () => {
        await landingState.signOut();
        setActiveNavItem('home');
      },
    }),
    [landingState]
  );

  // Generate navigation items
  const navigationItems = useMemo(
    () => defaultNavigationItems(navigationCallbacks),
    [navigationCallbacks]
  );

  // Handle sign in
  const handleSignIn = useCallback(async () => {
    try {
      await landingState.signIn('demo@example.com', 'password');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  }, [landingState]);

  // Handle click to sign in overlay
  const handleOverlayClick = useCallback(async () => {
    await handleSignIn();
  }, [handleSignIn]);

  // Container: fixed viewport fill so Canvas fills actual viewport (not constrained by AppShell)
  const containerStyles: CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  // Overlay fade animation
  const overlayAnimation = useSpring({
    opacity: isAuthenticated ? 0 : 1,
    pointerEvents: isAuthenticated ? 'none' : 'auto',
    config: config.gentle,
  });

  // Navigation dock animation
  const navAnimation = useSpring({
    opacity: isAuthenticated ? 1 : 0,
    config: config.gentle,
  });

  return (
    <div style={containerStyles}>
      {/* 3D Canvas Scene */}
      <CanvasScene capabilities={capabilities} />

      {/* Content Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
        }}
      >
        {/* Main Content */}
        {isAuthenticated ? (
          <div
            style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
              animation: 'fadeIn 0.6s ease-out',
            } as CSSProperties & { animation: string }}
          >
            <h1
              style={{
                fontSize: 'clamp(2rem, 8vw, 4rem)',
                fontWeight: 700,
                margin: '0 0 1rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                opacity: 0.8,
                margin: 0,
                maxWidth: '60vw',
              }}
            >
              Your minimalist creative space awaits
            </p>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <h1
              style={{
                fontSize: 'clamp(2rem, 8vw, 4rem)',
                fontWeight: 700,
                margin: '0 0 1rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              Landing V3
            </h1>
            <p
              style={{
                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                opacity: 0.7,
                margin: 0,
                maxWidth: '60vw',
              }}
            >
              Minimalist adaptive design
            </p>
          </div>
        )}

        {/* Device info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'monospace',
              zIndex: 10,
            }}
          >
            <div>Device: {capabilities.tier}</div>
            <div>Particles: {capabilities.particleCount}</div>
            <div>Motion: {capabilities.reducedMotion ? 'reduced' : 'normal'}</div>
          </div>
        )}
      </div>

      {/* Click to Sign In Overlay */}
      <animated.div
        style={{
          ...overlayAnimation,
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          pointerEvents: overlayAnimation.pointerEvents as any,
        }}
      >
        <ClickToSignInOverlay
          isVisible={showOverlay}
          isLoading={landingState.authState === 'authenticating'}
          onSignIn={handleSignIn}
          overlayOpacity={0.5}
          signInText="Click anywhere to enter"
          animationVariant="pulse"
        />
      </animated.div>

      {/* Navigation Dock */}
      <animated.div
        style={{
          ...navAnimation,
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
        }}
      >
        <NavigationDock
          items={navigationItems}
          activeItemId={activeNavItem}
          onActiveItemChange={setActiveNavItem}
          position="bottom"
          isVisible={isAuthenticated}
          showIcons={true}
          showLabels={true}
          animationDuration={300}
          darkMode={true}
          enableKeyboardNav={true}
        />
      </animated.div>

      {/* Global styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Remove default margins */
        body {
          margin: 0;
          padding: 0;
          background: #0a0a0f;
        }

        /* Respects reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          h1 {
            font-size: 2rem;
          }

          p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingV3;
