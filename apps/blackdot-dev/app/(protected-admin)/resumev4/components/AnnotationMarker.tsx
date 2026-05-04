"use client"

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';
import type { MapAnnotation } from '../config/map.config';
import { ANNOTATION_CONFIG } from '../config/map.config';

interface AnnotationMarkerProps {
  annotation: MapAnnotation;
  isActive?: boolean;
  onClick?: (annotationId: string) => void;
}

/**
 * 3D Annotation Marker Component
 *
 * Renders a floating marker with label above job positions.
 * Handles hover states, click interactions, and graceful fallbacks.
 *
 * Features:
 * - Billboard behavior (always faces camera)
 * - Hover scale animation
 * - Click to reveal job details
 * - Graceful handling when annotation is disabled or incomplete
 */
export function AnnotationMarker({
  annotation,
  isActive = false,
  onClick,
}: AnnotationMarkerProps) {
  const markerRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animate marker on hover and when active (must be before early return)
  useFrame((state, delta) => {
    if (markerRef.current) {
      // Smooth scale animation
      const targetScale = hovered || isActive
        ? ANNOTATION_CONFIG.hoverScale
        : 1;

      easing.damp3(
        markerRef.current.scale,
        [targetScale, targetScale, targetScale],
        0.2,
        delta
      );

      // Gentle floating animation
      const floatOffset = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      markerRef.current.position.y = floatOffset;

      // Billboard effect - always face camera
      markerRef.current.lookAt(state.camera.position);
    }
  });

  // Don't render if annotation is disabled or missing required data
  if (!annotation.enabled || !annotation.label) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(annotation.id);
    }
  };

  const markerColor = isActive
    ? ANNOTATION_CONFIG.activeColor
    : (hovered ? ANNOTATION_CONFIG.activeColor : ANNOTATION_CONFIG.markerColor);

  return (
    <group position={annotation.position}>
      {/* Marker sphere */}
      <mesh
        ref={markerRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[ANNOTATION_CONFIG.markerSize, 16, 16]} />
        <meshStandardMaterial
          color={markerColor}
          opacity={ANNOTATION_CONFIG.markerOpacity}
          transparent
          emissive={markerColor}
          emissiveIntensity={isActive || hovered ? 0.5 : 0.2}
        />
      </mesh>

      {/* Connection line to ground */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([
              0, 0, 0,
              0, -annotation.position[1], 0
            ]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={markerColor}
          opacity={0.3}
          transparent
        />
      </line>

      {/* HTML Label */}
      <Html
        position={[0, ANNOTATION_CONFIG.labelOffset, 0]}
        center
        distanceFactor={6}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          transition: 'all 0.2s ease',
          opacity: hovered || isActive ? 1 : 0.8,
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            border: `2px solid ${markerColor}`,
            backdropFilter: 'blur(4px)',
          }}
        >
          {annotation.label}
          <div
            style={{
              fontSize: '10px',
              opacity: 0.7,
              marginTop: '2px',
            }}
          >
            {annotation.company}
          </div>
        </div>
      </Html>
    </group>
  );
}
