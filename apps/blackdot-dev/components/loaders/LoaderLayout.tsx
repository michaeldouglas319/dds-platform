'use client';

import React, { ReactNode, useRef, useState } from 'react';
import { Center, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Item1 } from '@/components/shared/loaders/Item1';
import { Item2 } from '@/components/shared/loaders/Item2';
import { Item3 } from '@/components/shared/loaders/Item3';
import { Item4 } from '@/components/shared/loaders/Item4';
import { Item5 } from '@/components/shared/loaders/Item5';
import { Item6 } from '@/components/shared/loaders/Item6';
import { Item7 } from '@/components/shared/loaders/Item7';
import { Item8 } from '@/components/shared/loaders/Item8';
import { Item9 } from '@/components/shared/loaders/Item9';
import { Item10 } from '@/components/shared/loaders/Item10';
import { Item11 } from '@/components/shared/loaders/Item11';
import { Item12 } from '@/components/shared/loaders/Item12';
import { ConfigurableWave } from './ConfigurableWave';
import { ConfigurableRings } from './ConfigurableRings';
import { ConfigurableStack } from './ConfigurableStack';

// Loader type union
type LoaderType =
  | 'item1' | 'item2' | 'item3' | 'item4' | 'item5' | 'item6'
  | 'item7' | 'item8' | 'item9' | 'item10' | 'item11' | 'item12'
  | 'wave' | 'rings' | 'stack';

type LayoutVariant = 'vertical' | 'horizontal' | 'circular' | 'stacked';

// Text configuration
interface TextConfig {
  content: string;
  fontSize?: number;
  color?: string;
  weight?: number;
  position?: [number, number, number];
}

// Accessory configuration (icons, badges, indicators)
interface AccessoryConfig {
  type: 'sphere' | 'box' | 'cone' | 'cylinder';
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  scale?: number | [number, number, number];
  position?: [number, number, number];
}

// Background configuration
interface BackgroundConfig {
  enabled?: boolean;
  color?: string;
  opacity?: number;
  scale?: [number, number];
  position?: [number, number, number];
}

export interface LoaderLayoutProps {
  /** Which loader to display (default: 'item1') */
  loader?: LoaderType;

  /** Layout arrangement of elements (default: 'vertical') */
  variant?: LayoutVariant;

  /** Main title text above/around loader */
  title?: TextConfig;

  /** Subtitle text below loader */
  subtitle?: TextConfig;

  /** Progress or status text (center of loader) */
  statusText?: TextConfig;

  /** Additional text lines */
  additionalText?: TextConfig[];

  /** Decorative accessories (spheres, boxes, etc.) */
  accessories?: AccessoryConfig[];

  /** Semi-transparent background plane */
  background?: BackgroundConfig;

  /** Overall scale (default: 1) */
  scale?: number;

  /** Overall position (default: [0, 0, 0]) */
  position?: [number, number, number];

  /** Overall rotation (default: [0, 0, 0]) */
  rotation?: [number, number, number];

  /** Loader-specific scale */
  loaderScale?: number | [number, number, number];

  /** Custom children to render inside the layout */
  children?: ReactNode;

  /** Light responsive mode for loaders (default: false) */
  lightResponsive?: boolean;

  /** Spacing multiplier between elements (default: 1) */
  spacing?: number;

  // Configurable Wave specific props
  waveCount?: number;
  waveColors?: string[];
  waveHeights?: number[];

  // Configurable Rings specific props
  ringsCount?: number;
  ringsColors?: string[];
  ringsRotationSpeed?: number;

  // Configurable Stack specific props
  stackCount?: number;
  stackColors?: string[];

  // Item1 specific props
  item1RingCount?: number;
  item1RingThickness?: number;
  item1Duration?: number;
  item1Stagger?: number;
  item1RepeatDelay?: number;

  // Item2 specific props
  item2BoxCount?: number;
  item2Radius?: number;
  item2InnerDuration?: number;
  item2OuterDuration?: number;

  // Item3 specific props
  item3Count?: number;
  item3Radius?: number;
  item3InnerSpeed?: number;
  item3OuterSpeed?: number;

  // Item7 specific props
  item7Count?: number;
  item7BoxSpacing?: number;
  item7Duration?: number;
  item7Stagger?: number;
  item7Ease?: string;

  // Item10 specific props
  item10OuterRadius?: number;
  item10InnerRadius?: number;
  item10Depth?: number;
  item10Segments?: number;

  /** Click handler for the loader (optional) */
  onClick?: () => void;

  /** Enable/disable click interaction (default: false) */
  clickable?: boolean;
}

const loaderComponentMap: Record<LoaderType, React.ComponentType<Record<string, unknown>>> = {
  item1: Item1,
  item2: Item2,
  item3: Item3,
  item4: Item4,
  item5: Item5,
  item6: Item6,
  item7: Item7,
  item8: Item8,
  item9: Item9,
  item10: Item10,
  item11: Item11,
  item12: Item12,
  wave: ConfigurableWave,
  rings: ConfigurableRings,
  stack: ConfigurableStack,
};

// Layout variant position maps
const layoutPositions: Record<LayoutVariant, { loader: [number, number, number]; title: [number, number, number]; subtitle: [number, number, number] }> = {
  vertical: {
    loader: [0, 0, 0],
    title: [0, 2.5, 0],
    subtitle: [0, -2.5, 0],
  },
  horizontal: {
    loader: [0, 0, 0],
    title: [-2.5, 0.5, 0],
    subtitle: [2.5, 0.5, 0],
  },
  circular: {
    loader: [0, 0, 0],
    title: [0, 1.8, 0],
    subtitle: [0, -1.8, 0],
  },
  stacked: {
    loader: [0, 1, 0],
    title: [0, 3, 0],
    subtitle: [0, -1, 0],
  },
};

/**
 * Reusable loader layout component
 *
 * Combines loaders with text, backgrounds, and accessories in configurable layouts.
 * Supports 12 individual loaders + 3 configurable loaders (wave, rings, stack).
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <LoaderLayout
 *     loader="item1"
 *     variant="vertical"
 *     title={{ content: "Processing", fontSize: 0.5, color: "#ffffff" }}
 *     statusText={{ content: "45%", color: "#00ff00" }}
 *     subtitle={{ content: "This may take a few seconds", fontSize: 0.2 }}
 *     background={{ enabled: true, color: "#000000", opacity: 0.2 }}
 *     accessories={[
 *       { type: 'sphere', color: '#00ff00', position: [0, 0.8, 0] }
 *     ]}
 *   />
 * </Canvas>
 * ```
 */
export const LoaderLayout = ({
  onClick,
  clickable = false,
  loader = 'item1',
  variant = 'vertical',
  title,
  subtitle,
  statusText,
  additionalText = [],
  accessories = [],
  background,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  loaderScale = 1,
  children,
  lightResponsive = false,
  spacing = 1,
  waveCount = 10,
  waveColors = ['#ffffff'],
  waveHeights,
  ringsCount = 4,
  ringsColors = ['#ffffff'],
  ringsRotationSpeed = 1,
  stackCount = 4,
  stackColors = ['#ffffff'],
  // Item1
  item1RingCount,
  item1RingThickness,
  item1Duration,
  item1Stagger,
  item1RepeatDelay,
  // Item2
  item2BoxCount,
  item2Radius,
  item2InnerDuration,
  item2OuterDuration,
  // Item3
  item3Count,
  item3Radius,
  item3InnerSpeed,
  item3OuterSpeed,
  // Item7
  item7Count,
  item7BoxSpacing,
  item7Duration,
  item7Stagger,
  item7Ease,
  // Item10
  item10OuterRadius = 1,
  item10InnerRadius = 0.2,
  item10Depth = 0.3,
  item10Segments = 4,
}: LoaderLayoutProps) => {
  const layoutPositions_ = layoutPositions[variant];
  const loaderGroupRef = useRef<THREE.Group>(null);
  const [_isHovered, setIsHovered] = useState(false);
  const [targetScale, setTargetScale] = useState(1);
  const currentScaleRef = useRef(1);

  // Animate scale on click
  useFrame(() => {
    if (loaderGroupRef.current) {
      currentScaleRef.current += (targetScale - currentScaleRef.current) * 0.15;
      loaderGroupRef.current.scale.set(
        currentScaleRef.current,
        currentScaleRef.current,
        currentScaleRef.current
      );
    }
  });

  // Render the selected loader component
  const renderLoader = () => {
    const LoaderComponent = loaderComponentMap[loader];

    // Props for configurable loaders
    const configurableProps = {
      count: loader === 'wave' ? waveCount : loader === 'rings' ? ringsCount : stackCount,
      colors: loader === 'wave' ? waveColors : loader === 'rings' ? ringsColors : stackColors,
      heights: loader === 'wave' ? waveHeights : undefined,
      scale: loaderScale,
    };

    // Props for individual loaders
    const itemProps: Record<string, unknown> = {
      lightResponsive,
    };

    // Item-specific props
    if (loader === 'item1' && (item1RingCount !== undefined || item1RingThickness !== undefined || item1Duration !== undefined || item1Stagger !== undefined || item1RepeatDelay !== undefined)) {
      if (item1RingCount !== undefined) itemProps.ringCount = item1RingCount;
      if (item1RingThickness !== undefined) itemProps.ringThickness = item1RingThickness;
      if (item1Duration !== undefined) itemProps.duration = item1Duration;
      if (item1Stagger !== undefined) itemProps.stagger = item1Stagger;
      if (item1RepeatDelay !== undefined) itemProps.repeatDelay = item1RepeatDelay;
    }

    if (loader === 'item2' && (item2BoxCount !== undefined || item2Radius !== undefined || item2InnerDuration !== undefined || item2OuterDuration !== undefined)) {
      if (item2BoxCount !== undefined) itemProps.boxCount = item2BoxCount;
      if (item2Radius !== undefined) itemProps.radius = item2Radius;
      if (item2InnerDuration !== undefined) itemProps.innerDuration = item2InnerDuration;
      if (item2OuterDuration !== undefined) itemProps.outerDuration = item2OuterDuration;
    }

    if (loader === 'item3' && (item3Count !== undefined || item3Radius !== undefined || item3InnerSpeed !== undefined || item3OuterSpeed !== undefined)) {
      if (item3Count !== undefined) itemProps.count = item3Count;
      if (item3Radius !== undefined) itemProps.radius = item3Radius;
      if (item3InnerSpeed !== undefined) itemProps.innerSpeed = item3InnerSpeed;
      if (item3OuterSpeed !== undefined) itemProps.outerSpeed = item3OuterSpeed;
    }

    if (loader === 'item7' && (item7Count !== undefined || item7BoxSpacing !== undefined || item7Duration !== undefined || item7Stagger !== undefined || item7Ease !== undefined)) {
      if (item7Count !== undefined) itemProps.count = item7Count;
      if (item7BoxSpacing !== undefined) itemProps.boxSpacing = item7BoxSpacing;
      if (item7Duration !== undefined) itemProps.duration = item7Duration;
      if (item7Stagger !== undefined) itemProps.stagger = item7Stagger;
      if (item7Ease !== undefined) itemProps.ease = item7Ease;
    }

    if (loader === 'item10') {
      itemProps.outerRadius = item10OuterRadius;
      itemProps.innerRadius = item10InnerRadius;
      itemProps.depth = item10Depth;
      itemProps.segments = item10Segments;
    }

    const props = ['wave', 'rings', 'stack'].includes(loader) ? configurableProps : itemProps;

    return <LoaderComponent {...props} />;
  };

  // Create accessory geometry
  const renderAccessory = (accessory: AccessoryConfig, index: number) => {
    const { type, color = '#ffffff', emissive = color, emissiveIntensity = 0.3, scale: accScale = 0.15, position: accPos = [0, 0, 0] } = accessory;

    const geometryMap: Record<string, React.ReactElement> = {
      sphere: React.createElement('sphereGeometry', { args: [1, 32, 32] }),
      box: React.createElement('boxGeometry', { args: [1, 1, 1] }),
      cone: React.createElement('coneGeometry', { args: [1, 2, 32] }),
      cylinder: React.createElement('cylinderGeometry', { args: [0.5, 0.5, 2, 32] }),
    };

    return React.createElement(
      'mesh',
      { key: `accessory-${index}`, position: accPos, scale: accScale },
      geometryMap[type],
      React.createElement('meshStandardMaterial', {
        color,
        emissive,
        emissiveIntensity,
      })
    );
  };

  return (
    <Center position={position} scale={scale} rotation={rotation}>
      <group>
        {/* Background plane */}
        {background?.enabled && (
          <mesh position={background.position || [0, 0, -0.5]} scale={background.scale ? (background.scale as unknown as [number, number, number]) : [4, 4, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={background.color || '#000000'}
              transparent
              opacity={background.opacity || 0.2}
            />
          </mesh>
        )}

        {/* Main loader */}
        <group
          ref={loaderGroupRef}
          position={layoutPositions_.loader}
          onClick={clickable ? (e) => {
            e.stopPropagation();
            setTargetScale(2.5);
            onClick?.();
            setTimeout(() => setTargetScale(1), 500);
          } : undefined}
          onPointerOver={clickable ? (e) => { e.stopPropagation(); setIsHovered(true); } : undefined}
          onPointerOut={clickable ? (e) => { e.stopPropagation(); setIsHovered(false); } : undefined}
        >
          {renderLoader()}
        </group>

        {/* Title text */}
        {title && (
          <group position={[layoutPositions_.title[0], layoutPositions_.title[1] * spacing, layoutPositions_.title[2]]}>
            <Text
              fontSize={title.fontSize || 0.5}
              color={title.color || '#ffffff'}
              anchorX="center"
              anchorY="middle"
              fontWeight={title.weight || 700}
              position={title.position || [0, 0.5, 0.5]}
            >
              {title.content}
            </Text>
          </group>
        )}

        {/* Status text (center of loader) */}
        {statusText && (
          <group position={[0, 0, 0.1]}>
            <Text
              fontSize={statusText.fontSize || 0.6}
              color={statusText.color || '#00ff00'}
              anchorX="center"
              anchorY="middle"
              fontWeight={statusText.weight || 700}
              position={statusText.position || [0, 0, 0]}
            >
              {statusText.content || 'tert'}
            </Text>
          </group>
        )}

        {/* Subtitle text */}
        {subtitle && (
          <group position={[layoutPositions_.subtitle[0], layoutPositions_.subtitle[1] * spacing, layoutPositions_.subtitle[2]]}>
            <Text
              fontSize={subtitle.fontSize || 0.2}
              color={subtitle.color || '#888888'}
              anchorX="center"
              anchorY="middle"
              fontWeight={subtitle.weight || 400}
              position={subtitle.position || [0, 0, 0.1]}
            >
              {subtitle.content}
            </Text>
          </group>
        )}

        {/* Additional text lines */}
        {additionalText.map((text, index) => (
          <group key={`text-${index}`} position={text.position || [0, -2.5 - index * 0.4, 0]}>
            <Text
              fontSize={text.fontSize || 0.2}
              color={text.color || '#888888'}
              anchorX="center"
              anchorY="middle"
              fontWeight={text.weight || 400}
            >
              {text.content}
            </Text>
          </group>
        ))}

        {/* Accessories */}
        {accessories.map((accessory, index) => renderAccessory(accessory, index))}

        {/* Custom children */}
        {children && <group>{children}</group>}
      </group>
    </Center>
  );
};
