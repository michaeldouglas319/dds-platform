'use client';

import React, { ReactNode, useRef, useState, Suspense } from 'react';
import { Center, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BubbleButtonContent } from '@/app/landing/components/BubbleButton';
import { GlassTile, FrostedGlassTile } from './GlassTile';

// Text configuration
interface TextConfig {
  content: string;
  fontSize?: number;
  color?: string;
  weight?: number;
  position?: [number, number, number];
  /** Z-depth for 3D glow effect (default: varies by text type) */
  depth?: number;
  /** Offset multiplier for glow plane scale (default: 1) */
  glowScale?: number;
  /** Glow intensity (default: varies by text type) */
  glowIntensity?: number;
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

type LayoutVariant = 'vertical' | 'horizontal' | 'circular' | 'stacked';

export interface BubbleButtonLayoutProps {
  /** Main title text above/around bubble */
  title?: TextConfig;

  /** Subtitle text below bubble */
  subtitle?: TextConfig;

  /** Status text (center of bubble) */
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

  /** Layout arrangement of elements (default: 'vertical') */
  variant?: LayoutVariant;

  /** Spacing multiplier between elements (default: 1) */
  spacing?: number;

  /** Bubble button props */
  onClick?: () => void;
  hoverColor?: string;
  color?: string;
  darkColor?: string;
  customCursor?: string;

  /** Enable/disable click interaction (default: true) */
  clickable?: boolean;

  /** Custom children to render inside the layout */
  children?: ReactNode;
}

// Layout variant position maps
const layoutPositions: Record<LayoutVariant, { bubble: [number, number, number]; title: [number, number, number]; subtitle: [number, number, number] }> = {
  vertical: {
    bubble: [0, 0, 0],
    title: [0, 2.5, 0],
    subtitle: [0, -2.5, 0],
  },
  horizontal: {
    bubble: [0, 0, 0],
    title: [-2.5, 0.5, 0],
    subtitle: [2.5, 0.5, 0],
  },
  circular: {
    bubble: [0, 0, 0],
    title: [0, 1.8, 0],
    subtitle: [0, -1.8, 0],
  },
  stacked: {
    bubble: [0, 1, 0],
    title: [0, 3, 0],
    subtitle: [0, -1, 0],
  },
};

/**
 * BubbleButtonLayout - Configurable bubble button with text and accessories
 *
 * Similar to LoaderLayout but for bubble buttons. Supports title, subtitle,
 * status text, accessories, and multiple layout variants.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <BubbleButtonLayout
 *     variant="vertical"
 *     position={[0, -2, 0]}
 *     scale={0.25}
 *     title={{ content: "Login", fontSize: 1, color: "#ffffff" }}
 *     subtitle={{ content: "Click to authenticate", fontSize: 0.2 }}
 *     hoverColor="#FF6B9D"
 *     onClick={() => console.log('Clicked')}
 *   />
 * </Canvas>
 * ```
 */
export const BubbleButtonLayout = ({
  title,
  subtitle,
  statusText,
  additionalText = [],
  accessories = [],
  background,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  variant = 'vertical',
  spacing = 1,
  onClick,
  clickable = true,
  hoverColor = '#E8B059',
  color = 'white',
  darkColor = '#202020',
  customCursor,
  children,
}: BubbleButtonLayoutProps) => {
  const layoutPositions_ = layoutPositions[variant];
  const bubbleGroupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  // Pulsing glass tile animation (reversed - pulses by default, stable on hover)
  useFrame((state) => {
    // Dramatic pulse animation by default, stable when hovered (REVERSED)
    const pulse = !isHovered ? Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5 : 0;
    setPulseIntensity(pulse);
  });

  // Create accessory geometry
  const renderAccessory = (accessory: AccessoryConfig, index: number) => {
    const { type, color: accColor = '#ffffff', emissive = accColor, emissiveIntensity = 0.3, scale: accScale = 0.15, position: accPos = [0, 0, 0] } = accessory;

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
        color: accColor,
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

        {/* Main bubble button */}
        <group
          ref={bubbleGroupRef}
          position={layoutPositions_.bubble}
          onClick={clickable ? (e) => { e.stopPropagation(); onClick?.(); } : undefined}
          onPointerOver={clickable ? (e) => { e.stopPropagation(); setIsHovered(true); } : undefined}
          onPointerOut={clickable ? (e) => { e.stopPropagation(); setIsHovered(false); } : undefined}
        >
          <BubbleButtonContent
            onClick={onClick}
            hoverColor={hoverColor}
            color={color}
            darkColor={darkColor}
            customCursor={customCursor}
            useParentLighting={true}
          />
        </group>

        {/* Title text - 3D text with glow effect, light reactive */}
        {title && (
          <group
            position={[layoutPositions_.title[0], layoutPositions_.title[1] * spacing, layoutPositions_.title[2]]}
            onClick={clickable ? (e) => { e.stopPropagation(); onClick?.(); } : undefined}
            onPointerOver={clickable ? (e) => { e.stopPropagation(); setIsHovered(true); } : undefined}
            onPointerOut={clickable ? (e) => { e.stopPropagation(); setIsHovered(false); } : undefined}
          >
            <Text
              position={title.position || [0, 0.5, 0.5]}
              fontSize={title.fontSize || 0.5}
              color={title.color || '#ffffff'}
              anchorX="center"
              anchorY="middle"
              fontWeight={title.weight || 700}
              renderOrder={10}
              maxWidth={5}
              scale={[1, 1, 0.1]}
            >
              {title.content}
            </Text>
            {/* Glass tile background */}
            <group scale={[1 + pulseIntensity * 0.1, 1 + pulseIntensity * 0.1, 1]}>
              <GlassTile
                position={[(title.position?.[0] || 0), (title.position?.[1] || 0.5), (title.depth ?? 0.4)]}
                scale={[(4 * (title.glowScale ?? 1)), (1 * (title.glowScale ?? 1))]}
                color={title.color || '#ffffff'}
                opacity={0.2 + pulseIntensity * 0.1}
              />
            </group>
          </group>
        )}

        {/* Status text (center of bubble) - 3D, light reactive */}
        {statusText && (
          <group
            position={[0, 0, 0.1]}
            onClick={clickable ? (e) => { e.stopPropagation(); onClick?.(); } : undefined}
            onPointerOver={clickable ? (e) => { e.stopPropagation(); setIsHovered(true); } : undefined}
            onPointerOut={clickable ? (e) => { e.stopPropagation(); setIsHovered(false); } : undefined}
          >
            <Text
              position={statusText.position || [0, 0, 0]}
              fontSize={statusText.fontSize || 0.6}
              color={statusText.color || '#00ff00'}
              anchorX="center"
              anchorY="middle"
              fontWeight={statusText.weight || 700}
              renderOrder={10}
            >
              {statusText.content}
            </Text>
            {/* Glass tile background */}
            <group scale={[1 + pulseIntensity * 0.15, 1 + pulseIntensity * 0.15, 1]}>
              <GlassTile
                position={[(statusText.position?.[0] || 0), (statusText.position?.[1] || 0), (statusText.depth ?? -0.1)]}
                scale={[(3 * (statusText.glowScale ?? 1)), (1 * (statusText.glowScale ?? 1))]}
                color={statusText.color || '#00ff00'}
                opacity={0.3 + pulseIntensity * 0.15}
              />
            </group>
          </group>
        )}

        {/* Subtitle text - 3D, light reactive */}
        {subtitle && (
          <group
            position={[layoutPositions_.subtitle[0], layoutPositions_.subtitle[1] * spacing, layoutPositions_.subtitle[2]]}
            onClick={clickable ? (e) => { e.stopPropagation(); onClick?.(); } : undefined}
            onPointerOver={clickable ? (e) => { e.stopPropagation(); setIsHovered(true); } : undefined}
            onPointerOut={clickable ? (e) => { e.stopPropagation(); setIsHovered(false); } : undefined}
          >
            <Text
              position={subtitle.position || [0, 0, 0.1]}
              fontSize={subtitle.fontSize || 0.2}
              color={subtitle.color || '#888888'}
              anchorX="center"
              anchorY="middle"
              fontWeight={subtitle.weight || 400}
              renderOrder={10}
              maxWidth={6}
            >
              {subtitle.content}
            </Text>
            {/* Glass tile background */}
            <group scale={[1 + pulseIntensity * 0.08, 1 + pulseIntensity * 0.08, 1]}>
              <FrostedGlassTile
                position={[(subtitle.position?.[0] || 0), (subtitle.position?.[1] || 0), (subtitle.depth ?? 0)]}
                scale={[(4 * (subtitle.glowScale ?? 1)), (0.5 * (subtitle.glowScale ?? 1))]}
                color={subtitle.color || '#888888'}
                opacity={0.15 + pulseIntensity * 0.08}
              />
            </group>
          </group>
        )}

        {/* Additional text lines - 3D, light reactive */}
        {additionalText.map((text, index) => (
          <group
            key={`text-${index}`}
            position={text.position || [0, -2.5 - index * 0.4, 0]}
            onClick={clickable ? (e) => { e.stopPropagation(); onClick?.(); } : undefined}
            onPointerOver={clickable ? (e) => { e.stopPropagation(); setIsHovered(true); } : undefined}
            onPointerOut={clickable ? (e) => { e.stopPropagation(); setIsHovered(false); } : undefined}
          >
            <Text
              fontSize={text.fontSize || 0.2}
              color={text.color || '#888888'}
              anchorX="center"
              anchorY="middle"
              fontWeight={text.weight || 400}
              renderOrder={10}
              maxWidth={6}
            >
              {text.content}
            </Text>
            {/* Glass tile background */}
            <group scale={[1 + pulseIntensity * 0.08, 1 + pulseIntensity * 0.08, 1]}>
              <FrostedGlassTile
                position={[0, 0, (text.depth ?? -0.05)]}
                scale={[(4 * (text.glowScale ?? 1)), (0.5 * (text.glowScale ?? 1))]}
                color={text.color || '#888888'}
                opacity={0.15 + pulseIntensity * 0.08}
              />
            </group>
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
