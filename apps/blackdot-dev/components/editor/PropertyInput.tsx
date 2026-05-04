/**
 * Property Input Component
 *
 * Labeled input for editing a single property value.
 * Supports various input types with validation and formatting.
 *
 * @category editor
 * @layer 2
 * @example
 * ```tsx
 * <PropertyInput
 *   label="Scale"
 *   type="number"
 *   value={1.5}
 *   min={0.1}
 *   max={10}
 *   step={0.1}
 *   onChange={(value) => setScale(value)}
 * />
 * ```
 */

'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PropertyInputProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'color' | 'range';
  placeholder?: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function PropertyInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  description,
  min,
  max,
  step,
  disabled,
  className
}: PropertyInputProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        {type === 'number' && (
          <span className="text-xs text-muted-foreground font-mono">{value}</span>
        )}
      </div>

      {type === 'color' ? (
        <div className="flex gap-2">
          <input
            type="color"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="h-8 w-12 rounded cursor-pointer border border-input"
          />
          <Input
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 h-8 text-xs font-mono"
          />
        </div>
      ) : type === 'range' ? (
        <div className="space-y-2">
          <input
            type="range"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{min ?? 0}</span>
            <span>{value}</span>
            <span>{max ?? 100}</span>
          </div>
        </div>
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="h-8 text-xs"
        />
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
