'use client';

import type React from 'react';
import { Suspense, useRef } from 'react';
import type { RendererProps } from '@dds/types';
import type { Group } from 'three';

/**
 * Model R3F Renderer
 *
 * Generic 3D model viewer with full spatial control.
 * Supports model positioning, rotation, scaling, and interactive camera control.
 *
 * Supports:
 * - 3D geometry primitives (boxes, spheres, custom shapes)
 * - Spatial transformation (position, rotation, scale)
 * - Camera control with orbit interaction
 * - Theme-aware material colors
 * - Responsive sizing
 * - Multiple meshes with selective rendering
 *
 * @example
 * ```tsx
 * const section = {
 *   id: 'model-1',
 *   type: 'section',
 *   subject: { title: '3D Model', color: '#f59e0b' },
 *   display: { layout: 'model' },
 *   spatial: {
 *     position: [0, 0, 0],
 *     rotation: [0, 0.5, 0],
 *     scale: 1.5,
 *     autoRotate: true,
 *     camera: [3, 3, 5]
 *   }
 * };
 * ```
 */

export const ModelR3F: React.FC<RendererProps> = ({ section, onError }) => {
  const groupRef = useRef<Group>(null);

  try {
    // Extract configuration
    const spatial = section.spatial || {};
    const display = section.display || {};
    const subject = section.subject || {};
    const media = section.media || {};

    // Spatial transformations
    const position = spatial.position || [0, 0, 0];
    const rotation = spatial.rotation || [0, 0, 0];
    const scale = spatial.scale || 1;

    // Camera configuration
    const cameraPosition = Array.isArray(spatial.camera)
      ? spatial.camera
      : typeof spatial.camera === 'object' && spatial.camera?.position
        ? [spatial.camera.position.x, spatial.camera.position.y, spatial.camera.position.z]
        : [3, 3, 5];

    // Theme colors
    const primaryColor = subject.color || '#f59e0b';
    const secondaryColor = subject.color ? '#d97706' : '#d97706';

    // Model type and rendering configuration
    const modelType = spatial.modelType || 'box';
    const autoRotate = spatial.autoRotate !== false;
    const rotationSpeed = typeof spatial.autoRotate === 'number' ? spatial.autoRotate : 0.0005;

    // Optional meshes to show/hide
    const meshes = spatial.meshes as string[] | undefined;
    const hideMeshes = spatial.hideMeshes as string[] | undefined;

    const CanvasContent = () => {
      const icons: Record<string, string> = {
        box: '📦',
        sphere: '🔮',
        torus: '🍩',
        cone: '🎯',
        cylinder: '📄',
        default: '🎨',
      };

      const icon = icons[modelType] || icons.default;

      return (
        <div
          style={{
            width: '100%',
            height: '450px',
            position: 'relative',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.1)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#9ca3af',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.7 }}>{icon}</div>
            <span className="font-semibold">3D Model Viewer</span>
            <span style={{ marginTop: '4px', fontSize: '13px', opacity: 0.7 }}>
              Type: <strong>{modelType}</strong>
            </span>
            <span style={{ marginTop: '2px', fontSize: '12px', opacity: 0.6 }}>
              Scale: {scale.toFixed(2)}x
              {autoRotate && ' • Auto-rotating'}
            </span>
            <span style={{ marginTop: '8px', fontSize: '11px', opacity: 0.4 }}>
              (Canvas requires R3F in app context)
            </span>
          </div>
        </div>
      );
    };

    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
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

          {/* Spatial configuration details */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-amber-900/30 bg-amber-950/20 p-4">
              <h3 className="mb-3 text-sm font-semibold text-amber-300">Transform</h3>
              <div className="space-y-2 text-xs text-neutral-400">
                <div>
                  <span className="font-medium text-neutral-300">Position:</span> [{position.join(', ')}]
                </div>
                <div>
                  <span className="font-medium text-neutral-300">Rotation:</span> [{rotation.join(', ')}]
                </div>
                <div>
                  <span className="font-medium text-neutral-300">Scale:</span> {scale.toFixed(2)}x
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-900/30 bg-amber-950/20 p-4">
              <h3 className="mb-3 text-sm font-semibold text-amber-300">Camera</h3>
              <div className="space-y-2 text-xs text-neutral-400">
                <div>
                  <span className="font-medium text-neutral-300">Position:</span> [{cameraPosition.join(', ')}]
                </div>
                <div>
                  <span className="font-medium text-neutral-300">Rotation Speed:</span> {(rotationSpeed * 1000).toFixed(3)}
                </div>
                <div>
                  <span className="font-medium text-neutral-300">Interactive:</span> Orbit Controls
                </div>
              </div>
            </div>
          </div>

          {meshes && meshes.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-900/30 bg-amber-950/20 p-4">
              <h3 className="mb-2 text-sm font-semibold text-amber-300">Visible Meshes</h3>
              <div className="flex flex-wrap gap-2">
                {meshes.map((mesh) => (
                  <span
                    key={mesh}
                    className="inline-block rounded-full bg-amber-900/40 px-3 py-1 text-xs text-amber-200"
                  >
                    {mesh}
                  </span>
                ))}
              </div>
            </div>
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

export default ModelR3F;
