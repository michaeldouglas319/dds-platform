'use client';

import React, { ReactNode } from 'react';
import { Center, Text } from '@react-three/drei';
import { InteractiveModel } from '@/app/landing/components/InteractiveModel';
import { type InteractiveModelProps } from '@/app/landing/components/InteractiveModel';

type LayoutVariant = 'vertical' | 'horizontal' | 'circular' | 'stacked';

interface TextConfig {
  content: string;
  fontSize?: number;
  color?: string;
  weight?: number;
  position?: [number, number, number];
}

interface InteractiveModelLayoutProps {
  /** Layout arrangement of elements (default: 'vertical') */
  variant?: LayoutVariant;

  /** Title text above/around model */
  title?: TextConfig;

  /** Subtitle text below model */
  subtitle?: TextConfig;

  /** Spacing multiplier between elements (default: 1) */
  spacing?: number;

  /** Overall scale (default: 1) */
  scale?: number;

  /** Overall position (default: [0, 0, 0]) */
  position?: [number, number, number];

  /** Overall rotation (default: [0, 0, 0]) */
  rotation?: [number, number, number];

  /** All interactive model props */
  modelProps: InteractiveModelProps;

  /** Custom children to render inside the layout */
  children?: ReactNode;
}

// Layout variant position maps
const layoutPositions: Record<LayoutVariant, { model: [number, number, number]; title: [number, number, number]; subtitle: [number, number, number] }> = {
  vertical: {
    model: [0, 0, 0],
    title: [0, 2.5, 0],
    subtitle: [0, -2.5, 0],
  },
  horizontal: {
    model: [0, 0, 0],
    title: [-2.5, 0.5, 0],
    subtitle: [2.5, 0.5, 0],
  },
  circular: {
    model: [0, 0, 0],
    title: [0, 1.8, 0],
    subtitle: [0, -1.8, 0],
  },
  stacked: {
    model: [0, 1, 0],
    title: [0, 3, 0],
    subtitle: [0, -1, 0],
  },
};

/**
 * Reusable interactive model layout component
 *
 * Combines an InteractiveModel with title/subtitle text in configurable layouts.
 * Supports 4 layout variants (vertical, horizontal, circular, stacked).
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <InteractiveModelLayout
 *     variant="vertical"
 *     title={{ content: "Login", fontSize: 1, color: "#fff" }}
 *     subtitle={{ content: "Click to authenticate", fontSize: 0.5 }}
 *     position={[0, -2, 0]}
 *     modelProps={{
 *       modelPath: "/assets/models/paper_pen_one/scene.gltf",
 *       scale: 5,
 *       rotation: [0, -Math.PI * 0.1, 0],
 *       float: true,
 *       hoverRotate: true,
 *       onClick: () => console.log('Clicked!')
 *     }}
 *   />
 * </Canvas>
 * ```
 */
export const InteractiveModelLayout = ({
  variant = 'vertical',
  title,
  subtitle,
  spacing = 1,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  modelProps,
  children,
}: InteractiveModelLayoutProps) => {
  const layoutPositions_ = layoutPositions[variant];

  return (
    <Center scale={scale} position={position} rotation={rotation}>
      <group>
        {/* Interactive Model */}
        <group position={layoutPositions_.model}>
          <InteractiveModel {...modelProps} />
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

        {/* Custom children */}
        {children && <group>{children}</group>}
      </group>
    </Center>
  );
};
