/**
 * Annotation Manager Component
 * Renders 3D annotations/markers with labels
 *
 * Features:
 * - Displays annotation points in 3D space
 * - HTML labels that always face camera
 * - Distance-based visibility (hide when too far)
 * - Click handlers for interaction
 * - Responsive scaling
 */

'use client';

import React, { useMemo, useState, useCallback, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { AnnotationPoint } from '../models/types';

interface AnnotationManagerProps {
  annotations: AnnotationPoint[];
  onAnnotationClick?: (annotation: AnnotationPoint) => void;
  activeId?: string;
  hideDistance?: number; // Hide annotations beyond this distance
  scale?: number; // Label scale
  showIcon?: boolean;
}

/**
 * Single annotation marker
 */
function AnnotationMarker({
  annotation,
  onClick,
  isActive,
  hideDistance,
  scale = 1,
}: {
  annotation: AnnotationPoint;
  onClick: () => void;
  isActive: boolean;
  hideDistance?: number;
  scale?: number;
}) {
  const { camera } = useThree();
  const [isVisible, setIsVisible] = useState(true);
  const posVector = useMemo(
    () => new THREE.Vector3(...annotation.position),
    [annotation.position]
  );

  useFrame(() => {
    if (!hideDistance) {
      setIsVisible(annotation.isVisible ?? true);
      return;
    }

    const distance = camera.position.distanceTo(posVector);
    setIsVisible(distance < hideDistance && (annotation.isVisible ?? true));
  });

  if (!isVisible) return null;

  const markerColor = annotation.color ?? '#4CAF50';
  const markerSize = isActive ? 0.15 : 0.1;

  return (
    <group position={annotation.position}>
      {/* 3D Sphere Marker */}
      <mesh onClick={onClick} onPointerOver={(e) => e.stopPropagation()}>
        <sphereGeometry args={[markerSize, 16, 16]} />
        <meshStandardMaterial
          color={markerColor}
          emissive={markerColor}
          emissiveIntensity={isActive ? 1 : 0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Glow ring */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <ringGeometry args={[markerSize * 0.8, markerSize * 1.2, 32]} />
        <meshBasicMaterial
          color={markerColor}
          transparent
          opacity={isActive ? 0.8 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* HTML Label */}
      <Html position={[0, markerSize + 0.2, 0]} center distanceFactor={10}>
        <div
          onClick={onClick}
          style={{
            padding: '8px 12px',
            backgroundColor: markerColor,
            color: 'white',
            borderRadius: '4px',
            fontSize: `${12 * scale}px`,
            fontWeight: 'bold',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transform: 'translate(-50%, 0)',
            left: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = 'translate(-50%, -5px) scale(1.05)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = 'translate(-50%, 0)';
          }}
        >
          {annotation.title}
        </div>
      </Html>

      {/* Description tooltip on hover */}
      {annotation.description && (
        <Html position={[0, markerSize - 0.3, 0]} center distanceFactor={15}>
          <div
            style={{
              padding: '6px 10px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              borderRadius: '3px',
              fontSize: `${10 * scale}px`,
              maxWidth: '150px',
              textAlign: 'center',
              opacity: 0,
              pointerEvents: 'none',
              transition: 'opacity 0.2s ease',
              transform: 'translate(-50%, 0)',
              left: '50%',
            }}
            className="annotation-description"
          >
            {annotation.description}
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Main annotation manager component
 * Renders all annotations for a model
 */
export function AnnotationManager({
  annotations,
  onAnnotationClick,
  activeId,
  hideDistance = 50,
  scale = 1,
  showIcon = true,
}: AnnotationManagerProps) {
  const handleClick = useCallback(
    (annotation: AnnotationPoint) => {
      onAnnotationClick?.(annotation);
    },
    [onAnnotationClick]
  );

  if (!annotations || annotations.length === 0) {
    return null;
  }

  return (
    <group>
      {annotations.map((annotation) => (
        <AnnotationMarker
          key={annotation.id}
          annotation={annotation}
          onClick={() => handleClick(annotation)}
          isActive={annotation.id === activeId}
          hideDistance={hideDistance}
          scale={scale}
        />
      ))}
    </group>
  );
}

/**
 * Hook to manage annotation state
 * Tracks active annotation and handles transitions
 */
export function useAnnotations(initialAnnotations: AnnotationPoint[] = []) {
  const [activeAnnotation, setActiveAnnotation] = useState<AnnotationPoint | null>(null);
  const [visibleAnnotations, setVisibleAnnotations] = useState<AnnotationPoint[]>(
    initialAnnotations
  );

  const handleAnnotationClick = useCallback((annotation: AnnotationPoint) => {
    setActiveAnnotation(annotation);
  }, []);

  const goToAnnotation = useCallback((id: string) => {
    const annotation = visibleAnnotations.find((a) => a.id === id);
    if (annotation) {
      setActiveAnnotation(annotation);
    }
  }, [visibleAnnotations]);

  const clearActive = useCallback(() => {
    setActiveAnnotation(null);
  }, []);

  return {
    activeAnnotation,
    visibleAnnotations,
    setVisibleAnnotations,
    handleAnnotationClick,
    goToAnnotation,
    clearActive,
  };
}

/**
 * Export annotation utilities
 */
export function getAnnotationById(
  annotations: AnnotationPoint[],
  id: string
): AnnotationPoint | undefined {
  return annotations.find((a) => a.id === id);
}

export function filterAnnotationsByDistance(
  annotations: AnnotationPoint[],
  position: THREE.Vector3,
  maxDistance: number
): AnnotationPoint[] {
  return annotations.filter((annotation) => {
    const annotationPos = new THREE.Vector3(...annotation.position);
    return position.distanceTo(annotationPos) < maxDistance;
  });
}
