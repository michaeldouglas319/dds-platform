'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Select component not available, using native select with styling
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useCachedModel } from '@/lib/threejs/utils/modelCache';
import { RUNWAY_CONFIG } from '../config/runway.config';
import { getModelPath, getModelScale, getNativeOrientation } from '../utils/modelConfig';

interface ModelParameterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Isolated Model Parameter Modal
 * Allows testing model orientation and scale in isolation
 */
export function ModelParameterModal({ open, onOpenChange }: ModelParameterModalProps) {
  const [selectedModelId, setSelectedModelId] = useState<number>(1);
  const [universalScale, setUniversalScale] = useState(1.0);
  const [orientationX, setOrientationX] = useState(0);
  const [orientationY, setOrientationY] = useState(0);
  const [orientationZ, setOrientationZ] = useState(0);
  const [showDegrees, setShowDegrees] = useState(true);

  // Get model config
  const modelPath = getModelPath(selectedModelId);
  const baseScale = getModelScale(selectedModelId);
  const baseOrientation = getNativeOrientation(selectedModelId);

  // Calculate final values
  const finalScale = baseScale * universalScale;
  const finalOrientation: [number, number, number] = [
    baseOrientation[0] + orientationX,
    baseOrientation[1] + orientationY,
    baseOrientation[2] + orientationZ,
  ];

  // Convert to degrees for display
  const orientationDegrees = useMemo(() => [
    (finalOrientation[0] * 180) / Math.PI,
    (finalOrientation[1] * 180) / Math.PI,
    (finalOrientation[2] * 180) / Math.PI,
  ], [finalOrientation]);

  // Copy values to clipboard
  const copyConfig = () => {
    const config = `nativeOrientation: [${finalOrientation[0].toFixed(3)}, ${finalOrientation[1].toFixed(3)}, ${finalOrientation[2].toFixed(3)}] as [number, number, number],
scale: ${finalScale.toFixed(3)},`;
    navigator.clipboard.writeText(config);
  };

  const copyOrientation = () => {
    const orientation = `[${finalOrientation[0].toFixed(3)}, ${finalOrientation[1].toFixed(3)}, ${finalOrientation[2].toFixed(3)}] as [number, number, number]`;
    navigator.clipboard.writeText(orientation);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Model Parameter Tester</DialogTitle>
          <DialogDescription>
            Isolated model preview to test orientation and scale. Adjust values and copy to config.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* 3D Preview */}
          <div className="col-span-1 h-[500px] border rounded-lg overflow-hidden">
            <Canvas shadows>
              <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
              <pointLight position={[-10, -10, -5]} intensity={0.5} />
              <OrbitControls enableDamping dampingFactor={0.05} />
              <gridHelper args={[10, 10]} />
              <axesHelper args={[5]} />
              <ModelPreview
                modelPath={modelPath || '/assets/models/2_plane_draco.glb'}
                scale={finalScale}
                orientation={finalOrientation}
              />
            </Canvas>
          </div>

          {/* Controls */}
          <div className="col-span-1 space-y-4">
            {/* Model Selection */}
            <div>
              <Label>Model</Label>
              <select
                value={selectedModelId.toString()}
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  setSelectedModelId(id);
                  // Reset to base orientation when changing models
                  const base = getNativeOrientation(id);
                  setOrientationX(0);
                  setOrientationY(0);
                  setOrientationZ(0);
                }}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Object.keys(RUNWAY_CONFIG.models.planes).map((id) => (
                  <option key={id} value={id}>
                    Model {id} - {getModelPath(parseInt(id))?.split('/').pop() || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            {/* Universal Scale */}
            <div>
              <Label>Universal Scale: {universalScale.toFixed(2)}x</Label>
              <Slider
                value={[universalScale]}
                onValueChange={([val]) => setUniversalScale(val)}
                min={0.1}
                max={5.0}
                step={0.1}
              />
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  value={universalScale.toFixed(2)}
                  onChange={(e) => setUniversalScale(parseFloat(e.target.value) || 1.0)}
                  className="w-20"
                  step={0.1}
                />
                <span className="text-sm text-muted-foreground self-center">
                  Base: {baseScale.toFixed(3)} → Final: {finalScale.toFixed(3)}
                </span>
              </div>
            </div>

            {/* Orientation Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Orientation</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDegrees(!showDegrees)}
                >
                  {showDegrees ? 'Show Radians' : 'Show Degrees'}
                </Button>
              </div>

              {/* X Rotation */}
              <div>
                <Label>X (Roll): {showDegrees ? `${orientationDegrees[0].toFixed(1)}°` : `${finalOrientation[0].toFixed(3)} rad`}</Label>
                <Slider
                  value={[orientationX]}
                  onValueChange={([val]) => setOrientationX(val)}
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.01}
                />
                <Input
                  type="number"
                  value={showDegrees ? orientationDegrees[0].toFixed(1) : finalOrientation[0].toFixed(3)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (showDegrees) {
                      setOrientationX((val * Math.PI) / 180 - baseOrientation[0]);
                    } else {
                      setOrientationX(val - baseOrientation[0]);
                    }
                  }}
                  className="mt-1"
                  step={showDegrees ? 1 : 0.01}
                />
              </div>

              {/* Y Rotation */}
              <div>
                <Label>Y (Pitch): {showDegrees ? `${orientationDegrees[1].toFixed(1)}°` : `${finalOrientation[1].toFixed(3)} rad`}</Label>
                <Slider
                  value={[orientationY]}
                  onValueChange={([val]) => setOrientationY(val)}
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.01}
                />
                <Input
                  type="number"
                  value={showDegrees ? orientationDegrees[1].toFixed(1) : finalOrientation[1].toFixed(3)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (showDegrees) {
                      setOrientationY((val * Math.PI) / 180 - baseOrientation[1]);
                    } else {
                      setOrientationY(val - baseOrientation[1]);
                    }
                  }}
                  className="mt-1"
                  step={showDegrees ? 1 : 0.01}
                />
              </div>

              {/* Z Rotation */}
              <div>
                <Label>Z (Yaw): {showDegrees ? `${orientationDegrees[2].toFixed(1)}°` : `${finalOrientation[2].toFixed(3)} rad`}</Label>
                <Slider
                  value={[orientationZ]}
                  onValueChange={([val]) => setOrientationZ(val)}
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.01}
                />
                <Input
                  type="number"
                  value={showDegrees ? orientationDegrees[2].toFixed(1) : finalOrientation[2].toFixed(3)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (showDegrees) {
                      setOrientationZ((val * Math.PI) / 180 - baseOrientation[2]);
                    } else {
                      setOrientationZ(val - baseOrientation[2]);
                    }
                  }}
                  className="mt-1"
                  step={showDegrees ? 1 : 0.01}
                />
              </div>
            </div>

            {/* Output Values */}
            <div className="border rounded-lg p-3 bg-muted space-y-2">
              <div className="text-sm font-semibold">Output Values:</div>
              <div className="text-xs font-mono space-y-1">
                <div>
                  <span className="text-muted-foreground">Scale:</span> {finalScale.toFixed(3)}
                </div>
                <div>
                  <span className="text-muted-foreground">Orientation (rad):</span>{' '}
                  [{finalOrientation[0].toFixed(3)}, {finalOrientation[1].toFixed(3)}, {finalOrientation[2].toFixed(3)}]
                </div>
                <div>
                  <span className="text-muted-foreground">Orientation (deg):</span>{' '}
                  [{orientationDegrees[0].toFixed(1)}°, {orientationDegrees[1].toFixed(1)}°, {orientationDegrees[2].toFixed(1)}°]
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button onClick={copyOrientation} size="sm" variant="outline">
                  Copy Orientation
                </Button>
                <Button onClick={copyConfig} size="sm" variant="outline">
                  Copy Full Config
                </Button>
              </div>
            </div>

            {/* Reset Button */}
            <Button
              onClick={() => {
                setOrientationX(0);
                setOrientationY(0);
                setOrientationZ(0);
                setUniversalScale(1.0);
              }}
              variant="outline"
              className="w-full"
            >
              Reset Adjustments
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 3D Model Preview Component
 */
function ModelPreview({
  modelPath,
  scale,
  orientation,
}: {
  modelPath: string;
  scale: number;
  orientation: [number, number, number];
}) {
  const model = useCachedModel(modelPath, (scene) => {
    scene.traverse((child) => {
      if (child instanceof THREE.Light) child.parent?.remove(child);
      if (child instanceof THREE.AnimationMixer || (child as any).animations) {
        (child as any).animations = [];
      }
    });
    return scene as THREE.Group;
  });

  const rotation = useMemo(() => {
    return new THREE.Euler(orientation[0], orientation[1], orientation[2], 'XYZ');
  }, [orientation]);

  if (!model) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }

  return (
    <primitive
      object={model.clone()}
      scale={[scale, scale, scale]}
      rotation={rotation}
    />
  );
}
