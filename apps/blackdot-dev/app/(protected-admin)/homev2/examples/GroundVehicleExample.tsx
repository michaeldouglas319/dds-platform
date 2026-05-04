/**
 * Ground Vehicle System - Usage Example
 *
 * This example shows how to integrate ground vehicles into an existing scene
 */

'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { GroundVehicleSystem } from '../components/GroundVehicleSystem';
import { SCENE_CONFIG } from '../config/scene.config';
import {
  MINIMAL_DEMO_PRESET,
  SMALL_AIRPORT_PRESET,
  BUSY_HUB_PRESET,
} from '../config/presets/ground-vehicles.preset';

export default function GroundVehicleExample() {
  const [selectedPreset, setSelectedPreset] = useState<'default' | 'minimal' | 'small' | 'busy'>('default');
  const [showDebug, setShowDebug] = useState(true);

  // Select config based on preset
  const config = {
    default: SCENE_CONFIG.groundVehicles!,
    minimal: MINIMAL_DEMO_PRESET,
    small: SMALL_AIRPORT_PRESET,
    busy: BUSY_HUB_PRESET,
  }[selectedPreset];

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        padding: '20px',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'monospace',
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Ground Vehicle Demo</h3>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Preset:</label>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value as any)}
            style={{
              padding: '5px 10px',
              background: '#333',
              color: 'white',
              border: '1px solid #555',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            <option value="default">Default (from SCENE_CONFIG)</option>
            <option value="minimal">Minimal Demo (1 vehicle)</option>
            <option value="small">Small Airport (3 vehicles)</option>
            <option value="busy">Busy Hub (7 vehicles)</option>
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showDebug}
              onChange={(e) => setShowDebug(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Show Debug Visualization
          </label>
        </div>

        <div style={{ fontSize: '12px', color: '#aaa', marginTop: 15 }}>
          <div>Camera: Orbit controls</div>
          <div>Left click + drag: Rotate</div>
          <div>Right click + drag: Pan</div>
          <div>Scroll: Zoom</div>
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas
        camera={{
          position: [0, 80, 100],
          fov: 50,
        }}
        shadows
      >
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Ground Vehicle System */}
        <GroundVehicleSystem
          config={config}
          enabled={true}
          showDebug={showDebug}
        />

        {/* Ground plane */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial color="#2a3f5f" />
        </mesh>

        {/* Reference cube at origin */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>

        {/* Orbit controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={20}
          maxDistance={300}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
      </Canvas>
    </div>
  );
}
