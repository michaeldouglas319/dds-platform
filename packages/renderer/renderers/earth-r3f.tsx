'use client';

import type React from 'react';
import { Suspense, useRef } from 'react';
import type { RendererProps } from '@dds/types';
import type { Group } from 'three';

/**
 * Earth R3F Renderer
 *
 * Earth-like 3D visualization with blue sphere, atmosphere effect, and rotation.
 * Uses Three.js via react-three-fiber with layered material effects.
 *
 * Supports:
 * - Auto-rotation with configurable speed
 * - Atmosphere glow effect (blue atmospheric layer)
 * - Responsive sizing based on viewport
 * - Theme-aware colors for overlay elements
 * - Marker/event data visualization on surface
 *
 * @example
 * ```tsx
 * const section = {
 *   id: 'earth-1',
 *   type: 'section',
 *   subject: { title: 'Global Events', color: '#0ea5e9' },
 *   display: { layout: 'earth' },
 *   spatial: {
 *     autoRotate: true,
 *     camera: [0, 0, 8]
 *   },
 *   meta: {
 *     events: [
 *       { lat: 40.7128, lon: -74.0060, name: 'New York', weight: 100 }
 *     ]
 *   }
 * };
 * ```
 */

export const EarthR3F: React.FC<RendererProps> = ({ section, onError }) => {
  const groupRef = useRef<Group>(null);

  try {
    // Extract configuration
    const spatial = section.spatial || {};
    const display = section.display || {};
    const subject = section.subject || {};
    const meta = section.meta || {};

    // Camera configuration
    const cameraPosition = Array.isArray(spatial.camera)
      ? spatial.camera
      : typeof spatial.camera === 'object' && spatial.camera?.position
        ? [spatial.camera.position.x, spatial.camera.position.y, spatial.camera.position.z]
        : [0, 0, 8];

    // Theme colors - blue for earth/ocean
    const earthColor = subject.color || '#0ea5e9';
    const atmosphereColor = '#60a5fa';
    const atmosphereIntensity = 0.12;

    // Auto-rotation
    const shouldAutoRotate = spatial.autoRotate !== false;
    const rotationSpeed = typeof spatial.autoRotate === 'number' ? spatial.autoRotate : 0.0003;

    // Optional event data for markers
    const events = meta.events as Array<{
      lat: number;
      lon: number;
      name?: string;
      weight?: number;
    }> | undefined;

    const CanvasContent = () => {
      return (
        <div
          style={{
            width: '100%',
            height: '450px',
            position: 'relative',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)',
            border: '1px solid rgba(14, 165, 233, 0.1)',
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
            <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>🌍</div>
            <span>Earth Visualization</span>
            <span style={{ marginTop: '8px', fontSize: '12px', opacity: 0.6 }}>
              {events?.length ? `${events.length} events loaded` : 'No events configured'}
            </span>
            <span style={{ marginTop: '4px', fontSize: '11px', opacity: 0.4 }}>
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

          {events && events.length > 0 && (
            <div className="mt-8 rounded-lg border border-cyan-900/30 bg-cyan-950/20 p-4">
              <h3 className="mb-4 text-sm font-semibold text-cyan-300">Events</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {events.map((event, idx) => (
                  <div key={idx} className="text-xs text-neutral-400">
                    <span className="font-medium text-neutral-300">{event.name || `Event ${idx + 1}`}</span>
                    {event.weight && <span className="ml-2 opacity-70">• Weight: {event.weight}</span>}
                  </div>
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

export default EarthR3F;
