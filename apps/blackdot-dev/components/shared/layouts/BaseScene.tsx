/**
 * Base Scene Component
 * Shared foundation for all scene components
 * Handles common patterns: theme reactivity, portal detection, lighting, environment
 */

import { useEffect, useState, ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import { MeshReflectorMaterial, Environment } from '@react-three/drei';
import { getBackgroundColor } from '@/lib/utils/themeColors';

export interface BaseSceneProps {
  /** Additional children content */
  children?: ReactNode;
  /** Portal view content (rendered when in overview card) */
  portalContent?: ReactNode;
  /** Detail view content (rendered when in full page) */
  detailContent: ReactNode;
  /** Lighting configuration */
  lighting?: {
    ambientIntensity?: { portal: number; detail: number };
    directionalIntensity?: { portal: number; detail: number };
    directionalPosition?: [number, number, number];
    castShadows?: boolean;
  };
  /** Floor configuration */
  floor?: {
    enabled?: boolean;
    size?: [number, number];
    color?: { dark: string; light: string };
  };
  /** Environment preset */
  environment?: string | false;
  /** Fog configuration */
  fog?: {
    enabled?: boolean;
    near?: number;
    far?: number;
  };
  /** Content group position offset */
  contentPosition?: [number, number, number];
  /** Portal content position offset */
  portalContentPosition?: [number, number, number];
  /** Disable background color (for transparent scenes like neural network) */
  disableBackground?: boolean;
}

/**
 * Base Scene Component
 * Provides shared foundation for all scenes with:
 * - Theme-reactive background
 * - Portal detection
 * - Conditional rendering (portal vs detail)
 * - Common lighting patterns
 * - Optional reflective floor
 * - Environment setup
 */
export function BaseScene({
  children,
  portalContent,
  detailContent,
  lighting = {},
  floor = {},
  environment = 'city',
  fog = {},
  contentPosition = [0, 0, 0],
  portalContentPosition = [0, 0, 0],
  disableBackground = false,
}: BaseSceneProps) {
  const { previousRoot } = useThree();
  const isPortal = !!previousRoot;
  
  const [backgroundColor, setBackgroundColor] = useState(() => getBackgroundColor());
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      return document.documentElement.classList.contains('dark');
    } catch {
      return true; // Fallback to dark theme
    }
  });
  
  // Ensure isDark is always defined (safety check)
  const darkMode = isDark !== undefined && isDark !== null ? isDark : true;

  // Listen for theme changes by watching the DOM class
  useEffect(() => {
    const updateColors = () => {
      const newColor = getBackgroundColor();
      const newIsDark = document.documentElement.classList.contains('dark');
      setBackgroundColor(newColor);
      setIsDark(newIsDark);
    };

    updateColors();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    window.addEventListener('storage', updateColors);
    const interval = setInterval(updateColors, 100);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', updateColors);
      clearInterval(interval);
    };
  }, []);

  // Lighting configuration with defaults
  const {
    ambientIntensity = { portal: 1.2, detail: 0.8 },
    directionalIntensity = { portal: 1.5, detail: 1.0 },
    directionalPosition = [5, 5, 5],
    castShadows = true,
  } = lighting;

  // Floor configuration with defaults
  const {
    enabled: floorEnabled = true,
    size: floorSize = [50, 50],
    color: floorColor = { dark: '#050505', light: '#f5f5f5' },
  } = floor;

  // Fog configuration with defaults
  const {
    enabled: fogEnabled = true,
    near: fogNear = 0,
    far: fogFar = 15,
  } = fog;

  return (
    <>
      {/* Theme-reactive background - can be disabled for transparent scenes */}
      {!disableBackground && <color attach="background" args={[backgroundColor]} />}
      
      {/* Fog - only in detail mode */}
      {!isPortal && fogEnabled && (
        <fog attach="fog" args={[backgroundColor, fogNear, fogFar]} />
      )}
      
      {/* Lighting optimized for portal vs detail */}
      <ambientLight intensity={isPortal ? ambientIntensity.portal : ambientIntensity.detail} />
      <directionalLight 
        position={directionalPosition} 
        intensity={isPortal ? directionalIntensity.portal : directionalIntensity.detail}
        castShadow={castShadows && !isPortal}
      />
      
      {/* Content group with conditional positioning */}
      <group position={isPortal ? portalContentPosition : contentPosition}>
        {/* Conditional content rendering */}
        {isPortal && portalContent ? portalContent : detailContent}
        
        {/* Children (additional scene content) */}
        {children}

        {/* Reflective floor - only in detail mode for performance */}
        {!isPortal && floorEnabled && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={floorSize} />
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={2048}
              mixBlur={1}
              mixStrength={80}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color={darkMode ? floorColor.dark : floorColor.light}
              metalness={0.5}
              mirror={0}
            />
          </mesh>
        )}
      </group>
      
      {/* Environment preset */}
      {environment && <Environment preset={environment as 'city' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'park' | 'lobby'} />}
    </>
  );
}




