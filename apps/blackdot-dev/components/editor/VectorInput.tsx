/**
 * Vector Input Component
 *
 * Input for 3D vectors (x, y, z) with synchronized controls.
 * Useful for positions, scales, and rotations.
 *
 * @category editor
 * @layer 2
 * @example
 * ```tsx
 * <VectorInput
 *   label="Position"
 *   value={{ x: 0, y: 1, z: 0 }}
 *   onChange={(vector) => setPosition(vector)}
 *   step={0.1}
 * />
 * ```
 */

'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface VectorInputProps {
  label: string;
  value: Vector3;
  onChange: (value: Vector3) => void;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  locked?: boolean;
  onLockChange?: (locked: boolean) => void;
  className?: string;
}

export function VectorInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  description,
  locked = false,
  onLockChange,
  className
}: VectorInputProps) {
  const [localLocked, setLocalLocked] = useState(locked);

  const handleChange = (axis: 'x' | 'y' | 'z', newValue: number) => {
    const updated = { ...value, [axis]: newValue };

    // If locked and changing non-x value, sync to x
    if (localLocked && axis !== 'x') {
      updated.x = newValue;
    }

    onChange(updated);
  };

  const toggleLock = () => {
    const newLocked = !localLocked;
    setLocalLocked(newLocked);
    onLockChange?.(newLocked);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        {onLockChange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLock}
            className="h-6 w-6 p-0"
          >
            {localLocked ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <div key={axis} className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              {axis}
            </label>
            <Input
              type="number"
              value={value[axis]}
              onChange={(e) => handleChange(axis, Number(e.target.value))}
              min={min}
              max={max}
              step={step}
              className={cn(
                'h-7 text-xs',
                axis === 'x' ? 'border-red-500/50' :
                axis === 'y' ? 'border-green-500/50' :
                'border-blue-500/50'
              )}
            />
          </div>
        ))}
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
