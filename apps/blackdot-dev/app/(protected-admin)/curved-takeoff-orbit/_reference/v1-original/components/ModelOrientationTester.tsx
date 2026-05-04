'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ModelOrientationTesterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelPath: string;
  currentScale: number;
  currentRotation: [number, number, number];
  currentPosition: [number, number, number];
  onApply: (config: {
    scale: number;
    rotationOffset: [number, number, number];
    positionOffset: [number, number, number];
  }) => void;
}

/**
 * Model Orientation Tester for Drone Models
 * Isolated 3D preview to test and adjust model parameters
 */
export function ModelOrientationTester({
  open,
  onOpenChange,
  modelPath,
  currentScale,
  currentRotation,
  currentPosition,
  onApply,
}: ModelOrientationTesterProps) {
  const [scale, setScale] = useState(currentScale);
  const [rotationX, setRotationX] = useState(currentRotation[0]);
  const [rotationY, setRotationY] = useState(currentRotation[1]);
  const [rotationZ, setRotationZ] = useState(currentRotation[2]);
  const [positionX, setPositionX] = useState(currentPosition[0]);
  const [positionY, setPositionY] = useState(currentPosition[1]);
  const [positionZ, setPositionZ] = useState(currentPosition[2]);
  const [showDegrees, setShowDegrees] = useState(true);
  const [showAxes, setShowAxes] = useState(true);

  const rotation: [number, number, number] = [rotationX, rotationY, rotationZ];
  const position: [number, number, number] = [positionX, positionY, positionZ];

  // Convert to degrees for display
  const rotationDegrees = useMemo(() => [
    (rotationX * 180) / Math.PI,
    (rotationY * 180) / Math.PI,
    (rotationZ * 180) / Math.PI,
  ], [rotationX, rotationY, rotationZ]);

  const handleApply = () => {
    onApply({
      scale,
      rotationOffset: rotation,
      positionOffset: position,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setScale(currentScale);
    setRotationX(currentRotation[0]);
    setRotationY(currentRotation[1]);
    setRotationZ(currentRotation[2]);
    setPositionX(currentPosition[0]);
    setPositionY(currentPosition[1]);
    setPositionZ(currentPosition[2]);
  };

  const copyConfig = () => {
    const config = `modelOrientation: {
  scale: ${scale.toFixed(3)},
  rotationOffset: [${rotation[0].toFixed(3)}, ${rotation[1].toFixed(3)}, ${rotation[2].toFixed(3)}] as [number, number, number],
  positionOffset: [${position[0].toFixed(3)}, ${position[1].toFixed(3)}, ${position[2].toFixed(3)}] as [number, number, number],
}`;
    navigator.clipboard.writeText(config);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🛠️ Model Orientation Tester</DialogTitle>
          <DialogDescription>
            Test and adjust model scale, rotation, and position. Apply changes to see them in the main scene.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* 3D Preview */}
          <div className="col-span-1 h-[500px] border rounded-lg overflow-hidden bg-slate-950">
            <Canvas shadows>
              <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
              <pointLight position={[-10, -10, -5]} intensity={0.5} />
              <OrbitControls enableDamping dampingFactor={0.05} />
              <gridHelper args={[20, 20]} />
              <axesHelper args={[5]} />
              <ModelPreview
                modelPath={modelPath}
                scale={scale}
                rotation={rotation}
                position={position}
                showAxes={showAxes}
              />
            </Canvas>

            {/* Axis Legend */}
            {showAxes && (
              <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-sm rounded-lg p-2 border border-slate-700 text-xs">
                <div className="font-semibold text-white mb-1">Visualization:</div>
                <div className="flex items-center gap-2 text-yellow-400 mb-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Particle Origin (0,0,0)</span>
                </div>
                <div className="border-t border-slate-600 my-1 pt-1">
                  <div className="font-semibold text-white mb-1">Orientation Vectors:</div>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="w-3 h-0.5 bg-blue-500"></div>
                  <span>Forward (Z)</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-3 h-0.5 bg-green-500"></div>
                  <span>Up (Y)</span>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-3 h-0.5 bg-red-500"></div>
                  <span>Right (X)</span>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="col-span-1 space-y-4 overflow-y-auto max-h-[500px] pr-2">
            {/* Show Axes Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
              <Label className="text-sm font-semibold text-white">Show Orientation Axes</Label>
              <Button
                onClick={() => setShowAxes(!showAxes)}
                variant={showAxes ? "default" : "outline"}
                size="sm"
              >
                {showAxes ? 'Hide' : 'Show'}
              </Button>
            </div>

            {/* Scale */}
            <div>
              <Label>Scale: {scale.toFixed(2)}x</Label>
              <Slider
                value={[scale]}
                onValueChange={([val]) => setScale(val)}
                min={0.1}
                max={3.0}
                step={0.1}
              />
              <Input
                type="number"
                value={scale.toFixed(2)}
                onChange={(e) => setScale(parseFloat(e.target.value) || 1.0)}
                className="mt-2"
                step={0.1}
              />
            </div>

            {/* Rotation Controls */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Rotation Offset</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDegrees(!showDegrees)}
                >
                  {showDegrees ? '° Degrees' : 'rad Radians'}
                </Button>
              </div>

              {/* X Rotation (Roll) */}
              <div>
                <Label className="text-xs">X (Roll): {showDegrees ? `${rotationDegrees[0].toFixed(1)}°` : `${rotationX.toFixed(3)} rad`}</Label>
                <Slider
                  value={[rotationX]}
                  onValueChange={([val]) => setRotationX(val)}
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.01}
                />
              </div>

              {/* Y Rotation (Pitch) */}
              <div>
                <Label className="text-xs">Y (Pitch): {showDegrees ? `${rotationDegrees[1].toFixed(1)}°` : `${rotationY.toFixed(3)} rad`}</Label>
                <Slider
                  value={[rotationY]}
                  onValueChange={([val]) => setRotationY(val)}
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.01}
                />
              </div>

              {/* Z Rotation (Yaw) */}
              <div>
                <Label className="text-xs">Z (Yaw): {showDegrees ? `${rotationDegrees[2].toFixed(1)}°` : `${rotationZ.toFixed(3)} rad`}</Label>
                <Slider
                  value={[rotationZ]}
                  onValueChange={([val]) => setRotationZ(val)}
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.01}
                />
              </div>
            </div>

            {/* Position Offset */}
            <div className="space-y-3 border-t pt-4">
              <Label className="font-semibold">Position Offset</Label>

              <div>
                <Label className="text-xs">X: {positionX.toFixed(2)}</Label>
                <Slider
                  value={[positionX]}
                  onValueChange={([val]) => setPositionX(val)}
                  min={-5}
                  max={5}
                  step={0.1}
                />
              </div>

              <div>
                <Label className="text-xs">Y: {positionY.toFixed(2)}</Label>
                <Slider
                  value={[positionY]}
                  onValueChange={([val]) => setPositionY(val)}
                  min={-5}
                  max={5}
                  step={0.1}
                />
              </div>

              <div>
                <Label className="text-xs">Z: {positionZ.toFixed(2)}</Label>
                <Slider
                  value={[positionZ]}
                  onValueChange={([val]) => setPositionZ(val)}
                  min={-5}
                  max={5}
                  step={0.1}
                />
              </div>
            </div>

            {/* Output Values */}
            <div className="border rounded-lg p-3 bg-slate-800 space-y-2">
              <div className="text-sm font-semibold text-white">Output Values:</div>
              <div className="text-xs font-mono text-slate-300 space-y-1">
                <div><span className="text-slate-400">Scale:</span> {scale.toFixed(3)}</div>
                <div>
                  <span className="text-slate-400">Rotation:</span>{' '}
                  [{rotation[0].toFixed(3)}, {rotation[1].toFixed(3)}, {rotation[2].toFixed(3)}]
                </div>
                <div>
                  <span className="text-slate-400">Position:</span>{' '}
                  [{position[0].toFixed(3)}, {position[1].toFixed(3)}, {position[2].toFixed(3)}]
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline" size="sm" className="flex-1">
                Reset
              </Button>
              <Button onClick={copyConfig} variant="outline" size="sm" className="flex-1">
                Copy Config
              </Button>
            </div>

            <Button onClick={handleApply} className="w-full" size="lg">
              Apply to Source
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
  rotation,
  position,
  showAxes = true,
}: {
  modelPath: string;
  scale: number;
  rotation: [number, number, number];
  position: [number, number, number];
  showAxes?: boolean;
}) {
  const { scene } = useGLTF(modelPath);

  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone();

    // Remove lights and animations from clone
    clone.traverse((child) => {
      if (child instanceof THREE.Light) child.parent?.remove(child);
      if ((child as any).animations) {
        (child as any).animations = [];
      }
    });

    return clone;
  }, [scene]);

  const euler = useMemo(() => {
    return new THREE.Euler(rotation[0], rotation[1], rotation[2], 'XYZ');
  }, [rotation]);

  if (!clonedScene) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }

  // Calculate orientation vectors from the rotation
  const quaternion = useMemo(() => {
    return new THREE.Quaternion().setFromEuler(euler);
  }, [euler]);

  const forward = useMemo(() => {
    return new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);
  }, [quaternion]);

  const up = useMemo(() => {
    return new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion);
  }, [quaternion]);

  const right = useMemo(() => {
    return new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion);
  }, [quaternion]);

  // Check if position offset is non-zero
  const hasOffset = position[0] !== 0 || position[1] !== 0 || position[2] !== 0;
  const particleOrigin = new THREE.Vector3(0, 0, 0);
  const modelPosition = new THREE.Vector3(...position);

  return (
    <group>
      {/* Particle Origin Marker */}
      <mesh position={particleOrigin}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>

      {/* Offset Connection Line (if offset exists) */}
      {hasOffset && showAxes && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([
                particleOrigin.x, particleOrigin.y, particleOrigin.z,
                modelPosition.x, modelPosition.y, modelPosition.z
              ]), 3]}
              count={2}
              array={new Float32Array([
                particleOrigin.x, particleOrigin.y, particleOrigin.z,
                modelPosition.x, modelPosition.y, modelPosition.z
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ffff00" linewidth={2} opacity={0.6} transparent />
        </line>
      )}

      {/* Model at offset position */}
      <primitive
        object={clonedScene}
        scale={[scale, scale, scale]}
        rotation={euler}
        position={position}
      />

      {/* Orientation Axis Helpers (at model position) */}
      {showAxes && (
        <>
          {/* Forward (Blue - Z axis) */}
          <arrowHelper
            args={[
              forward,
              modelPosition,
              3,
              0x0000ff,
              1,
              0.5
            ]}
          />

          {/* Up (Green - Y axis) */}
          <arrowHelper
            args={[
              up,
              modelPosition,
              2,
              0x00ff00,
              0.7,
              0.4
            ]}
          />

          {/* Right (Red - X axis) */}
          <arrowHelper
            args={[
              right,
              modelPosition,
              2,
              0xff0000,
              0.7,
              0.4
            ]}
          />
        </>
      )}
    </group>
  );
}

// Preload the drone model
useGLTF.preload('/assets/models/super_cam__-_rusian_reconnaissance_drone_draco.glb');
