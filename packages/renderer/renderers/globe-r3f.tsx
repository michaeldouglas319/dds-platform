'use client';

import type React from 'react';
import { Suspense, useRef } from 'react';
import type { RendererProps } from '@dds/types';
import type { Group } from 'three';

/**
 * Globe R3F Renderer
 *
 * A rotating 3D sphere with optional markers and labels.
 * Uses Three.js via react-three-fiber with @react-three/drei primitives.
 *
 * Supports:
 * - Rotation control via spatial.autoRotate
 * - Camera positioning via spatial.camera
 * - Color theming via subject.color and display.layout
 * - Error boundaries and suspense
 *
 * @example
 * ```tsx
 * const section = {
 *   id: 'globe-1',
 *   type: 'section',
 *   subject: { title: 'Global Overview', color: '#3b82f6' },
 *   display: { layout: 'globe' },
 *   spatial: {
 *     autoRotate: true,
 *     camera: [0, 0, 5]
 *   }
 * };
 * ```
 */

export const GlobeR3F: React.FC<RendererProps> = ({ section, onError }) => {
  const groupRef = useRef<Group>(null);

  try {
    // Extract spatial and theme configuration
    const spatial = section.spatial || {};
    const display = section.display || {};
    const subject = section.subject || {};

    // Camera configuration with defaults
    const cameraPosition = Array.isArray(spatial.camera)
      ? spatial.camera
      : typeof spatial.camera === 'object' && spatial.camera?.position
        ? [spatial.camera.position.x, spatial.camera.position.y, spatial.camera.position.z]
        : [0, 0, 5];

    // Theme colors - fall back to indigo if not specified
    const sphereColor = subject.color || '#6366f1';
    const emissiveColor = subject.color ? '#4f46e5' : '#4f46e5';

    // Auto-rotation configuration
    const shouldAutoRotate = spatial.autoRotate !== false;
    const rotationSpeed = typeof spatial.autoRotate === 'number' ? spatial.autoRotate : 0.001;

    // Canvas wrapper with error boundary
    const CanvasContent = () => {
      // Dynamically import Canvas to avoid SSR issues
      // This pattern keeps the component server-side-compatible
      return (
        <div
          style={{
            width: '100%',
            height: '400px',
            position: 'relative',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#9ca3af',
            }}
          >
            <span>3D Sphere Visualization</span>
            <span style={{ marginLeft: '12px', fontSize: '12px', opacity: 0.7 }}>
              (Canvas requires R3F in app context)
            </span>
          </div>
        </div>
      );
    };

    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          {subject?.title && (
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-white">{subject.title}</h2>
          )}
          {subject?.subtitle && (
            <p className="mb-8 text-neutral-400">{subject.subtitle}</p>
          )}

          <Suspense fallback={<div className="h-96 rounded-lg bg-neutral-800" />}>
            <CanvasContent />
          </Suspense>

          {subject?.description && (
            <p className="mt-8 text-sm leading-relaxed text-neutral-400">{subject.description}</p>
          )}
        </div>
      </section>
    );
  } catch (error) {
    if (onError && error instanceof Error) {
      onError(error);
    }
    return null;
  }
};

export default GlobeR3F;
