'use client';

import { useRef } from 'react';
import { DirectionalLight } from 'three';

interface LightingProps {
  intensity?: number;
  theme?: 'studio' | 'sunset' | 'warehouse' | 'minimal';
}

/**
 * Lighting setup for configurator scenes
 * Provides photorealistic base with sci-fi accent lights
 *
 * @category 3d
 * @subcategory lighting
 */
export function Lighting({ intensity = 1, theme = 'studio' }: LightingProps) {
  const directionalLightRef = useRef<DirectionalLight>(null);

  // Theme-based lighting configurations
  const themes = {
    studio: {
      ambient: { color: '#ffffff', intensity: 0.5 * intensity },
      directional: {
        color: '#ffffff',
        intensity: 1.2 * intensity,
        position: [5, 8, 5],
        mapSize: [2048, 2048],
      },
      hemisphere: {
        skyColor: '#87ceeb',
        groundColor: '#1a1a2e',
        intensity: 0.4 * intensity,
      },
      rimLights: [
        {
          color: '#0ea5e9',
          intensity: 0.3 * intensity,
          position: [-8, 2, 0],
        },
        {
          color: '#8b5cf6',
          intensity: 0.2 * intensity,
          position: [0, 2, -8],
        },
      ],
    },
    sunset: {
      ambient: { color: '#ffeaa7', intensity: 0.4 * intensity },
      directional: {
        color: '#ffa500',
        intensity: 1.5 * intensity,
        position: [8, 4, 3],
        mapSize: [2048, 2048],
      },
      hemisphere: {
        skyColor: '#ff6b6b',
        groundColor: '#2d3436',
        intensity: 0.5 * intensity,
      },
      rimLights: [
        {
          color: '#ff7f50',
          intensity: 0.4 * intensity,
          position: [-5, 3, -5],
        },
        {
          color: '#4ecdc4',
          intensity: 0.2 * intensity,
          position: [0, 1, -10],
        },
      ],
    },
    warehouse: {
      ambient: { color: '#e0e0e0', intensity: 0.3 * intensity },
      directional: {
        color: '#ffffff',
        intensity: 0.9 * intensity,
        position: [6, 10, 4],
        mapSize: [2048, 2048],
      },
      hemisphere: {
        skyColor: '#b0c4de',
        groundColor: '#505050',
        intensity: 0.3 * intensity,
      },
      rimLights: [
        {
          color: '#64b5f6',
          intensity: 0.15 * intensity,
          position: [-6, 3, 0],
        },
      ],
    },
    minimal: {
      ambient: { color: '#ffffff', intensity: 0.6 * intensity },
      directional: {
        color: '#ffffff',
        intensity: 1.0 * intensity,
        position: [0, 8, 5],
        mapSize: [2048, 2048],
      },
      hemisphere: {
        skyColor: '#ffffff',
        groundColor: '#f5f5f5',
        intensity: 0.2 * intensity,
      },
      rimLights: [],
    },
  };

  const config = themes[theme];

  return (
    <>
      {/* Ambient light - base illumination */}
      <ambientLight
        color={config.ambient.color}
        intensity={config.ambient.intensity}
      />

      {/* Directional light - sun, with shadow casting */}
      <directionalLight
        ref={directionalLightRef}
        color={config.directional.color}
        intensity={config.directional.intensity}
        position={config.directional.position as [number, number, number]}
        castShadow
        shadow-mapSize-width={config.directional.mapSize[0]}
        shadow-mapSize-height={config.directional.mapSize[1]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Hemisphere light - sky/ground gradient */}
      <hemisphereLight
        args={[config.hemisphere.skyColor, config.hemisphere.groundColor, config.hemisphere.intensity]}
      />

      {/* Rim lights - sci-fi accent lighting */}
      {config.rimLights.map((light, index) => (
        <pointLight
          key={index}
          color={light.color}
          intensity={light.intensity}
          position={light.position as [number, number, number]}
          distance={20}
          decay={2}
        />
      ))}
    </>
  );
}
