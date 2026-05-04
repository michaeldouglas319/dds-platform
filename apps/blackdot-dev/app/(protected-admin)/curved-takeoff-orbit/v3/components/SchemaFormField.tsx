/**
 * Schema Form Field Component
 *
 * Auto-generates UI controls from Zod schema metadata.
 * Supports sliders, inputs, selects, checkboxes, and color pickers.
 */

'use client';

import React from 'react';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { getFieldMeta, type FieldMetadata } from '../config/schema-metadata';

interface SchemaFormFieldProps<T> {
  /** The Zod schema for this field */
  schema: z.ZodTypeAny;
  /** Current value */
  value: T;
  /** Callback when value changes */
  onChange: (value: T) => void;
  /** Optional path for nested objects (e.g., "physics.donutThickness") */
  path?: string;
  /** Optional CSS class for container */
  className?: string;
}

/**
 * Auto-generates a form field from a Zod schema with metadata
 */
export function SchemaFormField<T>({
  schema,
  value,
  onChange,
  path,
  className = ''
}: SchemaFormFieldProps<T>) {
  const meta = getFieldMeta(schema);

  // If value is an object or array, show warning instead of [object Object]
  if (typeof value === 'object' && value !== null && !meta) {
    return (
      <div className={`p-2 bg-yellow-900/20 border border-yellow-700/50 rounded ${className}`}>
        <p className="text-yellow-400 text-xs font-semibold">⚠️ Complex Type</p>
        <p className="text-yellow-300 text-[10px] mt-1">
          {path || 'Field'} requires manual UI component
        </p>
        <pre className="text-yellow-200 text-[9px] mt-1 overflow-x-auto">
          {JSON.stringify(value, null, 2).slice(0, 100)}...
        </pre>
      </div>
    );
  }

  if (!meta) {
    // No metadata - fallback to basic input
    return (
      <div className={`space-y-2 ${className}`}>
        <Label className="text-slate-300 text-xs">
          {path || 'Value'}
        </Label>
        <Input
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full h-8 text-sm bg-slate-700/50 border-slate-600 text-white"
        />
      </div>
    );
  }

  // Render based on control type
  switch (meta.control) {
    case 'slider':
      return (
        <div className={`space-y-2 ${className}`}>
          <div className="flex items-center justify-between">
            <Label className="text-slate-300 text-xs font-medium">
              {meta.label}
            </Label>
            <span className="text-slate-400 text-xs font-mono">
              {typeof value === 'number' ? value.toFixed(2) : String(value)}
              {meta.unit && <span className="text-slate-500 ml-1">{meta.unit}</span>}
            </span>
          </div>
          <Slider
            value={[typeof value === 'number' ? value : 0]}
            onValueChange={([val]) => onChange(val as T)}
            min={meta.min ?? 0}
            max={meta.max ?? 100}
            step={meta.step ?? 1}
            className="w-full"
          />
          {meta.description && (
            <p className="text-slate-500 text-[10px] leading-tight">
              {meta.description}
            </p>
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div className={`flex items-start gap-2 py-1 ${className}`}>
          <input
            type="checkbox"
            id={path}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked as T)}
            className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
          />
          <div className="flex-1">
            <Label
              htmlFor={path}
              className="text-slate-300 text-xs font-medium cursor-pointer"
            >
              {meta.label}
            </Label>
            {meta.description && (
              <p className="text-slate-500 text-[10px] leading-tight mt-0.5">
                {meta.description}
              </p>
            )}
          </div>
        </div>
      );

    case 'select':
      return (
        <div className={`space-y-2 ${className}`}>
          <Label className="text-slate-300 text-xs font-medium">
            {meta.label}
          </Label>
          <select
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value as T)}
            className="w-full px-3 py-2 text-sm bg-slate-700/50 text-white rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {meta.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {meta.description && (
            <p className="text-slate-500 text-[10px] leading-tight">
              {meta.description}
            </p>
          )}
        </div>
      );

    case 'color':
      return (
        <div className={`space-y-2 ${className}`}>
          <Label className="text-slate-300 text-xs font-medium">
            {meta.label}
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={typeof value === 'string' ? value.slice(0, 7) : '#000000'} // Remove alpha for color picker
              onChange={(e) => {
                // Preserve alpha if present
                const currentValue = String(value ?? '#000000ff');
                const alpha = currentValue.length === 9 ? currentValue.slice(7) : 'ff';
                onChange((e.target.value + alpha) as T);
              }}
              className="w-16 h-8 rounded border border-slate-600 cursor-pointer bg-slate-700"
            />
            <Input
              type="text"
              value={String(value ?? '')}
              onChange={(e) => onChange(e.target.value as T)}
              placeholder="#RRGGBBaa"
              className="flex-1 h-8 text-sm bg-slate-700/50 border-slate-600 text-white font-mono"
            />
          </div>
          {meta.description && (
            <p className="text-slate-500 text-[10px] leading-tight">
              {meta.description}
            </p>
          )}
        </div>
      );

    case 'input':
    default:
      return (
        <div className={`space-y-2 ${className}`}>
          <Label className="text-slate-300 text-xs font-medium">
            {meta.label}
          </Label>
          <Input
            type="number"
            value={typeof value === 'number' ? value : String(value ?? '')}
            onChange={(e) => {
              const numValue = parseFloat(e.target.value);
              onChange((isNaN(numValue) ? e.target.value : numValue) as T);
            }}
            className="w-full h-8 text-sm bg-slate-700/50 border-slate-600 text-white"
          />
          {meta.description && (
            <p className="text-slate-500 text-[10px] leading-tight">
              {meta.description}
            </p>
          )}
        </div>
      );
  }
}
