/**
 * Model Dashboard Component
 *
 * Complete dashboard for 3D model viewing and manipulation.
 * Combines 3D viewport with property editor and statistics.
 *
 * @category 3d-dashboard
 * @layer 2
 */

'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PropertyPanel, PropertySection } from '@/components/editor/PropertyPanel';
import { PropertyInput } from '@/components/editor/PropertyInput';
import { VectorInput } from '@/components/editor/VectorInput';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DataGrid } from '@/components/dashboard/DataGrid';
import { Box, Eye, RotateCw } from 'lucide-react';

interface ModelDashboardProps {
  modelName?: string;
  viewport: React.ReactNode;
  stats?: {
    vertices?: number;
    triangles?: number;
    materials?: number;
    animations?: number;
  };
  onPropertyChange?: (property: string, value: any) => void;
  className?: string;
}

interface ModelTransform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export function ModelDashboard({
  modelName = 'Untitled Model',
  viewport,
  stats = {
    vertices: 5420,
    triangles: 10840,
    materials: 3,
    animations: 2
  },
  onPropertyChange,
  className
}: ModelDashboardProps) {
  const [transform, setTransform] = useState<ModelTransform>({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  });

  const [visibility, setVisibility] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  const handleTransformChange = (field: keyof ModelTransform, value: any) => {
    const updated = { ...transform, [field]: value };
    setTransform(updated);
    onPropertyChange?.(field, value);
  };

  const statsData = [
    { name: 'Vertices', value: stats.vertices?.toLocaleString() },
    { name: 'Triangles', value: stats.triangles?.toLocaleString() },
    { name: 'Materials', value: stats.materials },
    { name: 'Animations', value: stats.animations }
  ];

  return (
    <DashboardLayout
      title={modelName}
      subtitle="3D Model Inspector & Editor"
      mainContent={
        <div className="w-full h-full bg-black/5">
          {viewport}
        </div>
      }
      sidebar={
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Statistics */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Statistics</h3>
            <DataGrid
              columns={[
                { key: 'name', label: 'Metric', width: '60%' },
                { key: 'value', label: 'Value', width: '40%', align: 'right' }
              ]}
              data={statsData}
              variant="striped"
            />
          </div>

          {/* Properties */}
          <PropertyPanel
            title="Transform"
            description="Position, rotation, and scale"
          >
            <PropertySection title="Position" description="XYZ coordinates">
              <VectorInput
                label="Position"
                value={transform.position}
                onChange={(val) => handleTransformChange('position', val)}
                step={0.1}
              />
            </PropertySection>

            <PropertySection title="Rotation" description="Euler angles in degrees">
              <VectorInput
                label="Rotation"
                value={transform.rotation}
                onChange={(val) => handleTransformChange('rotation', val)}
                step={1}
              />
            </PropertySection>

            <PropertySection title="Scale" description="Uniform scaling" defaultOpen={false}>
              <VectorInput
                label="Scale"
                value={transform.scale}
                onChange={(val) => handleTransformChange('scale', val)}
                step={0.1}
                min={0.1}
                locked={true}
              />
            </PropertySection>
          </PropertyPanel>

          {/* Visibility & Rendering */}
          <PropertyPanel title="Rendering" description="Display options">
            <PropertySection title="Display">
              <PropertyInput
                label="Visible"
                type="range"
                value={visibility ? 100 : 0}
                onChange={(val) => {
                  const numVal = typeof val === 'number' ? val : parseFloat(val);
                  setVisibility(numVal > 50);
                  onPropertyChange?.('visible', numVal > 50);
                }}
                min={0}
                max={100}
              />
            </PropertySection>

            <PropertySection title="Mode" defaultOpen={false}>
              <PropertyInput
                label="Wireframe"
                type="range"
                value={wireframe ? 100 : 0}
                onChange={(val) => {
                  const numVal = typeof val === 'number' ? val : parseFloat(val);
                  setWireframe(numVal > 50);
                  onPropertyChange?.('wireframe', numVal > 50);
                }}
                min={0}
                max={100}
              />
            </PropertySection>
          </PropertyPanel>
        </div>
      }
      sidebarWidth="normal"
      sidebarPosition="right"
      className={className}
    />
  );
}
