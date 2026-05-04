/**
 * Scene Control Panel Component
 *
 * Control panel for managing 3D scene properties including lighting,
 * camera, environment, and effects.
 *
 * @category 3d-dashboard
 * @layer 2
 * @example
 * ```tsx
 * <SceneControlPanel
 *   onLightingChange={(config) => updateLighting(config)}
 *   onCameraChange={(config) => updateCamera(config)}
 * />
 * ```
 */

'use client';

import React, { useState } from 'react';
import { PropertyPanel, PropertySection } from '@/components/editor/PropertyPanel';
import { PropertyInput } from '@/components/editor/PropertyInput';
import { VectorInput } from '@/components/editor/VectorInput';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Lightbulb, Wind, Sun, Eye } from 'lucide-react';

interface LightingConfig {
  ambientIntensity: number;
  directionalIntensity: number;
  directionalColor: string;
  environmentIntensity: number;
}

interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  autoRotate: boolean;
}

interface SceneControlPanelProps {
  onLightingChange?: (config: LightingConfig) => void;
  onCameraChange?: (config: CameraConfig) => void;
  onEnvironmentChange?: (env: string) => void;
  className?: string;
}

export function SceneControlPanel({
  onLightingChange,
  onCameraChange,
  onEnvironmentChange,
  className
}: SceneControlPanelProps) {
  const [lighting, setLighting] = useState<LightingConfig>({
    ambientIntensity: 0.5,
    directionalIntensity: 1.0,
    directionalColor: '#ffffff',
    environmentIntensity: 1.0
  });

  const [camera, setCamera] = useState<CameraConfig>({
    fov: 75,
    near: 0.1,
    far: 1000,
    autoRotate: true
  });

  const [environment, setEnvironment] = useState<string>('neutral');
  const [effects, setEffects] = useState({
    bloom: false,
    fog: false,
    shadows: true
  });

  const handleLightingChange = (key: keyof LightingConfig, value: any) => {
    const updated = { ...lighting, [key]: value };
    setLighting(updated);
    onLightingChange?.(updated);
  };

  const handleCameraChange = (key: keyof CameraConfig, value: any) => {
    const updated = { ...camera, [key]: value };
    setCamera(updated);
    onCameraChange?.(updated);
  };

  const handleEffectChange = (key: string, value: boolean) => {
    const updated = { ...effects, [key]: value };
    setEffects(updated as any);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Lighting Controls */}
      <PropertyPanel title="Lighting" description="Light sources and intensity">
        <PropertySection title="Ambient" description="Global illumination">
          <PropertyInput
            label="Intensity"
            type="range"
            value={lighting.ambientIntensity}
            onChange={(val) => handleLightingChange('ambientIntensity', val as number)}
            min={0}
            max={2}
            step={0.1}
          />
        </PropertySection>

        <PropertySection title="Directional" description="Main light source">
          <PropertyInput
            label="Intensity"
            type="range"
            value={lighting.directionalIntensity}
            onChange={(val) => handleLightingChange('directionalIntensity', val as number)}
            min={0}
            max={2}
            step={0.1}
          />
          <PropertyInput
            label="Color"
            type="color"
            value={lighting.directionalColor}
            onChange={(val) => handleLightingChange('directionalColor', val)}
          />
        </PropertySection>

        <PropertySection title="Environment" description="Background lighting" defaultOpen={false}>
          <PropertyInput
            label="Intensity"
            type="range"
            value={lighting.environmentIntensity}
            onChange={(val) => handleLightingChange('environmentIntensity', val as number)}
            min={0}
            max={2}
            step={0.1}
          />
        </PropertySection>
      </PropertyPanel>

      {/* Camera Controls */}
      <PropertyPanel title="Camera" description="View and perspective settings">
        <PropertySection title="Projection" description="Field of view and clipping planes">
          <PropertyInput
            label="Field of View"
            type="range"
            value={camera.fov}
            onChange={(val) => handleCameraChange('fov', val)}
            min={30}
            max={120}
            step={5}
          />
          <PropertyInput
            label="Near Plane"
            type="number"
            value={camera.near}
            onChange={(val) => handleCameraChange('near', val)}
            min={0.01}
            step={0.01}
          />
          <PropertyInput
            label="Far Plane"
            type="number"
            value={camera.far}
            onChange={(val) => handleCameraChange('far', val)}
            min={100}
            step={100}
          />
        </PropertySection>

        <PropertySection title="Motion" description="Auto-rotation and animation" defaultOpen={false}>
          <PropertyInput
            label="Auto Rotate"
            type="range"
            value={camera.autoRotate ? 100 : 0}
            onChange={(val) => handleCameraChange('autoRotate', (typeof val === 'number' ? val : parseFloat(val)) > 50)}
            min={0}
            max={100}
          />
        </PropertySection>
      </PropertyPanel>

      {/* Environment */}
      <PropertyPanel title="Environment" description="Scene atmosphere and effects">
        <PropertySection title="Preset">
          <PropertyInput
            label="Environment"
            type="text"
            value={environment}
            onChange={(val) => {
              setEnvironment(val as string);
              onEnvironmentChange?.(val as string);
            }}
            placeholder="neutral, studio, sunset, forest..."
          />
        </PropertySection>

        <PropertySection title="Effects">
          <PropertyInput
            label="Bloom"
            type="range"
            value={effects.bloom ? 100 : 0}
            onChange={(val) => handleEffectChange('bloom', (typeof val === 'number' ? val : parseFloat(val)) > 50)}
            min={0}
            max={100}
          />
          <PropertyInput
            label="Fog"
            type="range"
            value={effects.fog ? 100 : 0}
            onChange={(val) => handleEffectChange('fog', (typeof val === 'number' ? val : parseFloat(val)) > 50)}
            min={0}
            max={100}
          />
          <PropertyInput
            label="Shadows"
            type="range"
            value={effects.shadows ? 100 : 0}
            onChange={(val) => handleEffectChange('shadows', (typeof val === 'number' ? val : parseFloat(val)) > 50)}
            min={0}
            max={100}
          />
        </PropertySection>
      </PropertyPanel>

      {/* Quick Stats */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Scene Info</h3>
        <div className="grid grid-cols-2 gap-2">
          <DashboardCard
            title="Lights"
            value="3"
            icon={<Lightbulb className="h-5 w-5" />}
          />
          <DashboardCard
            title="Shadows"
            value={effects.shadows ? 'On' : 'Off'}
            icon={<Sun className="h-5 w-5" />}
          />
        </div>
      </div>
    </div>
  );
}
