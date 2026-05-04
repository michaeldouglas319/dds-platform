'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface ParticleSystemControlsProps {
  scale: number;
  position: [number, number, number];
  originRotation?: [number, number, number];
  onScaleChange: (scale: number) => void;
  onPositionChange: (position: [number, number, number]) => void;
  onOriginRotationChange?: (rotation: [number, number, number]) => void;
  onReset?: () => void;
  onOpenModelModal?: () => void;
}

export function ParticleSystemControls({
  scale,
  position,
  originRotation = [0, 0, 0],
  onScaleChange,
  onPositionChange,
  onOriginRotationChange,
  onReset,
  onOpenModelModal,
}: ParticleSystemControlsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [localPosition, setLocalPosition] = useState<[number, number, number]>(position);
  const [localRotation, setLocalRotation] = useState<[number, number, number]>(originRotation);

  const handlePositionInputChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newPosition: [number, number, number] = [...localPosition];
    newPosition[index] = numValue;
    setLocalPosition(newPosition);
    onPositionChange(newPosition);
  };

  const handlePositionSliderChange = (index: number, value: number[]) => {
    const newPosition: [number, number, number] = [...localPosition];
    newPosition[index] = value[0];
    setLocalPosition(newPosition);
    onPositionChange(newPosition);
  };

  const handleRotationInputChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newRotation: [number, number, number] = [...localRotation];
    newRotation[index] = numValue;
    setLocalRotation(newRotation);
    onOriginRotationChange?.(newRotation);
  };

  const handleRotationSliderChange = (index: number, value: number[]) => {
    const newRotation: [number, number, number] = [...localRotation];
    newRotation[index] = value[0];
    setLocalRotation(newRotation);
    onOriginRotationChange?.(newRotation);
  };

  const handleReset = () => {
    const defaultScale = 100; // Relative to scene (3x runway size)
    const defaultPosition: [number, number, number] = [5, 50, 0]; // Centered relative to scene
    const defaultRotation: [number, number, number] = [0, 0, 0]; // No rotation
    onScaleChange(defaultScale);
    setLocalPosition(defaultPosition);
    onPositionChange(defaultPosition);
    setLocalRotation(defaultRotation);
    onOriginRotationChange?.(defaultRotation);
    onReset?.();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50"
        variant="outline"
        size="sm"
      >
        Show Controls
      </Button>
    );
  }

  return (
    <Card className="fixed top-4 right-4 z-50 w-80 bg-background/95 backdrop-blur-sm border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Particle System Controls</CardTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6"
          >
            ×
          </Button>
        </div>
        <CardDescription>Adjust scale and position in real-time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Parameter Tester Button */}
        {onOpenModelModal && (
          <Button
            onClick={onOpenModelModal}
            variant="outline"
            className="w-full"
            size="sm"
          >
            🎨 Open Model Parameter Tester
          </Button>
        )}
        {/* Scale Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="scale">Scale</Label>
            <span className="text-sm text-muted-foreground">{scale.toFixed(1)}</span>
          </div>
          <Slider
            id="scale"
            min={30}
            max={200}
            step={1}
            value={[scale]}
            onValueChange={(value) => onScaleChange(value[0])}
            className="w-full"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              value={scale.toFixed(1)}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 30;
                onScaleChange(Math.max(30, Math.min(200, val)));
              }}
              className="h-8 text-xs"
              min={30}
              max={200}
              step={1}
            />
          </div>
        </div>

        {/* Position Controls */}
        <div className="space-y-4">
          <Label>Position</Label>
          
          {/* X Position */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pos-x" className="text-xs font-normal">
                X
              </Label>
              <span className="text-xs text-muted-foreground">{localPosition[0].toFixed(1)}</span>
            </div>
            <Slider
              id="pos-x"
              min={-50}
              max={50}
              step={0.5}
              value={[localPosition[0]]}
              onValueChange={(value) => handlePositionSliderChange(0, value)}
              className="w-full"
            />
            <Input
              type="number"
              value={localPosition[0].toFixed(1)}
              onChange={(e) => handlePositionInputChange(0, e.target.value)}
              className="h-8 text-xs"
              step={0.5}
            />
          </div>

          {/* Y Position */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pos-y" className="text-xs font-normal">
                Y
              </Label>
              <span className="text-xs text-muted-foreground">{localPosition[1].toFixed(1)}</span>
            </div>
            <Slider
              id="pos-y"
              min={0}
              max={100}
              step={0.5}
              value={[localPosition[1]]}
              onValueChange={(value) => handlePositionSliderChange(1, value)}
              className="w-full"
            />
            <Input
              type="number"
              value={localPosition[1].toFixed(1)}
              onChange={(e) => handlePositionInputChange(1, e.target.value)}
              className="h-8 text-xs"
              step={0.5}
            />
          </div>

          {/* Z Position */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pos-z" className="text-xs font-normal">
                Z
              </Label>
              <span className="text-xs text-muted-foreground">{localPosition[2].toFixed(1)}</span>
            </div>
            <Slider
              id="pos-z"
              min={-50}
              max={50}
              step={0.5}
              value={[localPosition[2]]}
              onValueChange={(value) => handlePositionSliderChange(2, value)}
              className="w-full"
            />
            <Input
              type="number"
              value={localPosition[2].toFixed(1)}
              onChange={(e) => handlePositionInputChange(2, e.target.value)}
              className="h-8 text-xs"
              step={0.5}
            />
          </div>
        </div>

        {/* Origin Rotation Controls */}
        {onOriginRotationChange && (
          <div className="space-y-4">
            <Label>Origin Rotation (radians)</Label>
            
            {/* X Rotation (Roll) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rot-x" className="text-xs font-normal">
                  X (Roll)
                </Label>
                <span className="text-xs text-muted-foreground">
                  {localRotation[0].toFixed(3)} ({((localRotation[0] * 180) / Math.PI).toFixed(1)}°)
                </span>
              </div>
              <Slider
                id="rot-x"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                value={[localRotation[0]]}
                onValueChange={(value) => handleRotationSliderChange(0, value)}
                className="w-full"
              />
              <Input
                type="number"
                value={localRotation[0].toFixed(3)}
                onChange={(e) => handleRotationInputChange(0, e.target.value)}
                className="h-8 text-xs"
                step={0.01}
              />
            </div>

            {/* Y Rotation (Pitch) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rot-y" className="text-xs font-normal">
                  Y (Pitch)
                </Label>
                <span className="text-xs text-muted-foreground">
                  {localRotation[1].toFixed(3)} ({((localRotation[1] * 180) / Math.PI).toFixed(1)}°)
                </span>
              </div>
              <Slider
                id="rot-y"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                value={[localRotation[1]]}
                onValueChange={(value) => handleRotationSliderChange(1, value)}
                className="w-full"
              />
              <Input
                type="number"
                value={localRotation[1].toFixed(3)}
                onChange={(e) => handleRotationInputChange(1, e.target.value)}
                className="h-8 text-xs"
                step={0.01}
              />
            </div>

            {/* Z Rotation (Yaw) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rot-z" className="text-xs font-normal">
                  Z (Yaw)
                </Label>
                <span className="text-xs text-muted-foreground">
                  {localRotation[2].toFixed(3)} ({((localRotation[2] * 180) / Math.PI).toFixed(1)}°)
                </span>
              </div>
              <Slider
                id="rot-z"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                value={[localRotation[2]]}
                onValueChange={(value) => handleRotationSliderChange(2, value)}
                className="w-full"
              />
              <Input
                type="number"
                value={localRotation[2].toFixed(3)}
                onChange={(e) => handleRotationInputChange(2, e.target.value)}
                className="h-8 text-xs"
                step={0.01}
              />
            </div>
          </div>
        )}

        {/* Reset Button */}
        <Button onClick={handleReset} variant="outline" className="w-full" size="sm">
          Reset to Defaults
        </Button>
      </CardContent>
    </Card>
  );
}
