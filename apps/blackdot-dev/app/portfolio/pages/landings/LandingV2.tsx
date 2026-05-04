'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { useSpring, animated, config as springConfig } from '@react-spring/web';
import { useSpring as useSpringThree } from '@react-spring/three';
import * as THREE from 'three';
import { useLandingState } from '../../hooks/useLandingState';
import { ClickToSignInOverlay } from '../../components/shared/ClickToSignInOverlay';
import NavigationDock, { defaultNavigationItems } from '@/app/portfolio/components/shared/NavigationDock';

/**
 * Central glowing sphere component
 */
const CentralSphere: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowMaterialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.0003;
      meshRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group>
      {/* Central glowing sphere */}
      <mesh ref={meshRef} scale={1.2}>
        <icosahedronGeometry args={[1, 8]} />
        <meshStandardMaterial
          emissive="#0088ff"
          emissiveIntensity={1.5}
          metalness={0.6}
          roughness={0.4}
          wireframe={false}
        />
      </mesh>

      {/* Glow effect using a larger transparent sphere */}
      <mesh scale={1.3}>
        <icosahedronGeometry args={[1, 8]} />
        <meshBasicMaterial
          color="#0088ff"
          transparent
          opacity={0.1}
          wireframe={false}
        />
      </mesh>

      {/* Inner light glow */}
      <mesh scale={0.8}>
        <icosahedronGeometry args={[1, 8]} />
        <meshBasicMaterial
          color="#00ff88"
          transparent
          opacity={0.15}
          wireframe={false}
        />
      </mesh>
    </group>
  );
};

/**
 * Orbital element - rotates around central sphere
 */
interface OrbitalElementProps {
  orbitRadius: number;
  speed: number;
  color: string;
  size: number;
  rotationAxis?: [number, number, number];
  delay?: number;
}

const OrbitalElement: React.FC<OrbitalElementProps> = ({
  orbitRadius,
  speed,
  color,
  size,
  rotationAxis = [0, 1, 0],
  delay = 0,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef<number>(Date.now() + delay);

  useFrame(() => {
    if (!groupRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const angle = elapsed * speed;

    // Orbital rotation
    groupRef.current.position.x = Math.cos(angle) * orbitRadius;
    groupRef.current.position.z = Math.sin(angle) * orbitRadius;

    // Self rotation
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} scale={size}>
        <octahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={1}
          metalness={0.7}
          roughness={0.3}
          color={color}
        />
      </mesh>

      {/* Orbital trail glow */}
      <mesh position={[0, 0, 0]} scale={size * 1.5}>
        <octahedronGeometry args={[0.5, 2]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          wireframe={false}
        />
      </mesh>
    </group>
  );
};

/**
 * Particle system for background
 */
const ParticleSystem: React.FC<{ count: number }> = ({ count }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const positionArray = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, [count]);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x += 0.00005;
      pointsRef.current.rotation.y += 0.00005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positionArray, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.3} color="#ffffff" sizeAttenuation transparent opacity={0.4} />
    </points>
  );
};

/**
 * 3D Scene Component
 */
interface Scene3DProps {
  particleCount: number;
}

const Scene3D: React.FC<Scene3DProps> = ({ particleCount }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const hasAnimated = useRef(false);

  // Camera animation on load
  useFrame(() => {
    if (cameraRef.current && !hasAnimated.current) {
      hasAnimated.current = true;
      // Camera will be positioned via PerspectiveCamera component
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 15]} fov={75} />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        autoRotate={false}
        minDistance={5}
        maxDistance={50}
      />

      {/* Lighting setup */}
      <ambientLight intensity={0.6} color="#ffffff" />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ff6b9d" />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#00ff88" />
      <pointLight position={[0, 15, 0]} intensity={0.5} color="#0088ff" />

      {/* Background stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={0.5} />

      {/* Particle system */}
      <ParticleSystem count={particleCount} />

      {/* Central glowing sphere */}
      <CentralSphere />

      {/* Orbital elements - 5 elements at different orbits */}
      <OrbitalElement
        orbitRadius={4}
        speed={1.5}
        color="#ff6b9d"
        size={0.4}
        delay={0}
      />
      <OrbitalElement
        orbitRadius={6}
        speed={1}
        color="#00ff88"
        size={0.5}
        delay={500}
      />
      <OrbitalElement
        orbitRadius={8}
        speed={0.7}
        color="#ffd700"
        size={0.35}
        delay={1000}
      />
      <OrbitalElement
        orbitRadius={5}
        speed={1.2}
        color="#ff3366"
        size={0.38}
        delay={1500}
      />
      <OrbitalElement
        orbitRadius={7}
        speed={0.85}
        color="#00ddff"
        size={0.45}
        delay={2000}
      />
    </>
  );
};

/**
 * Hero Text Section
 */
interface HeroSectionProps {
  isVisible: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isVisible }) => {
  const fadeInAnimation = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0px)' : 'translateY(30px)',
    config: springConfig.slow,
  });

  return (
    <animated.div
      style={{
        ...fadeInAnimation,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        textAlign: 'center',
        pointerEvents: 'none',
        maxWidth: '90vw',
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(2rem, 8vw, 4rem)',
          fontWeight: 700,
          color: 'white',
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em',
          textShadow: '0 0 30px rgba(0, 136, 255, 0.5)',
        }}
      >
        React Three Fiber Portfolio
      </h1>
      <p
        style={{
          fontSize: 'clamp(0.875rem, 3vw, 1.25rem)',
          color: 'rgba(255, 255, 255, 0.7)',
          margin: '0 0 24px 0',
          maxWidth: '640px',
          lineHeight: 1.6,
          letterSpacing: '0.01em',
        }}
      >
        Explore cutting-edge 3D graphics with React Three Fiber, orbital mechanics, and real-time
        animation. Experience performance-optimized WebGL rendering at 60+ FPS.
      </p>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <a
          href="#about"
          style={{
            padding: '12px 28px',
            backgroundColor: 'rgba(0, 136, 255, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            backdropFilter: 'blur(10px)',
            transition: 'all 200ms ease-out',
            boxShadow: '0 0 20px rgba(0, 136, 255, 0.4)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(0, 136, 255, 1)';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
              '0 0 40px rgba(0, 136, 255, 0.8)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(0, 136, 255, 0.8)';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
              '0 0 20px rgba(0, 136, 255, 0.4)';
          }}
        >
          Explore
        </a>
        <a
          href="#components"
          style={{
            padding: '12px 28px',
            backgroundColor: 'transparent',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 200ms ease-out',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              'rgba(255, 255, 255, 0.8)';
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              'rgba(255, 255, 255, 0.3)';
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
          }}
        >
          Components
        </a>
      </div>
    </animated.div>
  );
};

/**
 * Loading State Component
 */
const LoadingIndicator: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const rotation = useSpring({
    from: { rotate: 0 },
    to: isVisible ? { rotate: 360 } : { rotate: 0 },
    loop: isVisible,
    config: { duration: 1500 },
  });

  if (!isVisible) return null;

  return (
    <animated.div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: rotation.rotate.to((r) => `translate(-50%, -50%) rotate(${r}deg)`),
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: '3px solid rgba(255, 255, 255, 0.2)',
        borderTopColor: 'rgba(0, 136, 255, 1)',
        zIndex: 999,
      }}
    />
  );
};

/**
 * Error Display Component
 */
interface ErrorDisplayProps {
  error: string | null;
  onDismiss: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  const fadeOut = useSpring({
    opacity: error ? 1 : 0,
    config: springConfig.default,
  });

  if (!error) return null;

  return (
    <animated.div
      style={{
        ...fadeOut,
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        backgroundColor: 'rgba(255, 67, 54, 0.9)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        zIndex: 1001,
        maxWidth: '400px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 16px rgba(255, 67, 54, 0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <span style={{ flex: 1 }}>{error}</span>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '0 8px',
        }}
      >
        ×
      </button>
    </animated.div>
  );
};

/**
 * Main Landing-V2 Component
 *
 * A complete landing page with:
 * - 3D orbital lighting effects using React Three Fiber
 * - Particle system background
 * - Auth state management with sign-in overlay
 * - Navigation dock for authenticated users
 * - Smooth animations and transitions
 * - Responsive design (mobile/tablet/desktop)
 * - Performance optimized (60+ FPS target)
 * - TypeScript strict mode ready
 */
const LandingV2: React.FC = () => {
  const landingState = useLandingState('unauthenticated');
  const [isSignInPending, setIsSignInPending] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSignInPending(true);
      await landingState.signIn('user@example.com', 'password123');
    } catch (err) {
      console.error('Sign in error:', err);
    } finally {
      setIsSignInPending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await landingState.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const navigationItems = useMemo(
    () =>
      defaultNavigationItems({
        onHome: () => console.log('Navigate to home'),
        onComponents: () => console.log('Navigate to components'),
        onPlayground: () => console.log('Navigate to playground'),
        onAbout: () => console.log('Navigate to about'),
        onProfile: () => console.log('Navigate to profile'),
        onSignOut: handleSignOut,
      }),
    []
  );

  const isUnauthenticated = landingState.authState === 'unauthenticated';
  const isAuthenticating = landingState.authState === 'authenticating';

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
        background: '#000000',
      }}
    >
      {/* 3D Scene Canvas */}
      <Canvas
        style={{
          position: 'absolute',
          inset: 0,
        }}
        performance={{ min: 0.5, max: 1 }}
        dpr={[1, 2]}
      >
        <Scene3D particleCount={landingState.config.particleCount} />
      </Canvas>

      {/* Hero Section - Overlay on canvas */}
      <HeroSection isVisible={isUnauthenticated && !isAuthenticating} />

      {/* Sign In Overlay */}
      <ClickToSignInOverlay
        isVisible={isUnauthenticated}
        isLoading={isAuthenticating}
        onSignIn={handleSignIn}
        overlayOpacity={0.3}
        signInText="Click anywhere to sign in"
        animationVariant="pulse"
      />

      {/* Loading Indicator */}
      <LoadingIndicator isVisible={isAuthenticating} />

      {/* Error Display */}
      <ErrorDisplay error={landingState.error} onDismiss={() => landingState.setError(null)} />

      {/* Navigation Dock - Shown when authenticated */}
      <NavigationDock
        items={navigationItems}
        position="bottom"
        isVisible={landingState.authState === 'authenticated'}
        darkMode={true}
        enableKeyboardNav={true}
      />

      {/* Bottom Info Text - Only show when unauthenticated */}
      {isUnauthenticated && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            zIndex: 10,
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
          }}
        >
          Built with React Three Fiber + Drei + React Spring + GLSL
        </div>
      )}

      {/* Performance Monitor (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>Auth: {landingState.authState}</div>
          <div>Particles: {landingState.config.particleCount}</div>
          <div>FPS Target: 60+</div>
        </div>
      )}
    </div>
  );
};

export default LandingV2;
