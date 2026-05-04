/**
 * Annotation Markers Component
 * Renders 3D markers and labels for annotations in the scene
 * Based on the standard annotation pattern
 */

import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { AnnotationData } from '@/lib/types/annotation.types';

interface AnnotationMarkersProps {
  annotations: AnnotationData[];
  visible?: boolean;
}

export function AnnotationMarkers({ annotations, visible = true }: AnnotationMarkersProps) {
  const { scene } = useThree();
  const markersRef = useRef<THREE.Group>(null);

  if (!visible) return null;

  return (
    <group ref={markersRef}>
      {annotations.map((annotation) => {
        const position = annotation.position || annotation.lookAt;
        const color = annotation.color || '#4CAF50';

        return (
          <group key={annotation.id} position={[position.x, position.y, position.z]}>
            {/* 3D Marker Sphere */}
            <Sphere args={[0.1, 16, 16]}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </Sphere>

            {/* Label */}
            <Html
              position={[0, 0.3, 0]}
              center
              distanceFactor={10}
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  border: `2px solid ${color}`,
                }}
              >
                {annotation.title}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}


