/**
 * Schema Section Component
 *
 * Auto-generates an entire config section from a Zod object schema.
 * Renders all fields within the schema using SchemaFormField.
 */

'use client';

import React from 'react';
import { z } from 'zod';
import { SchemaFormField } from './SchemaFormField';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { isZodObject, unwrapZodObject, isPlainObject } from './schema-utils';

interface SchemaSectionProps<T extends z.ZodObject<any>> {
  /** Section title */
  title: string;
  /** The Zod object schema */
  schema: T;
  /** Current values */
  value: z.infer<T>;
  /** Callback when any value changes */
  onChange: (value: z.infer<T>) => void;
  /** Whether section is expanded */
  isExpanded?: boolean;
  /** Callback to toggle expanded state */
  onToggleExpanded?: () => void;
  /** Optional CSS class for container */
  className?: string;
  /** Optional description for the section */
  description?: string;
}

/**
 * Auto-generates a collapsible section with all fields from a Zod object schema
 */
export function SchemaSection<T extends z.ZodObject<any>>({
  title,
  schema,
  value,
  onChange,
  isExpanded = true,
  onToggleExpanded,
  className = '',
  description
}: SchemaSectionProps<T>) {
  const shape = schema.shape;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Section Header */}
      <button
        type="button"
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/50 hover:bg-slate-800/70 rounded border border-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
          <h3 className="text-white text-sm font-semibold">{title}</h3>
        </div>
        <span className="text-slate-500 text-xs">
          {Object.keys(shape).length} parameters
        </span>
      </button>

      {/* Section Description */}
      {description && isExpanded && (
        <p className="text-slate-400 text-xs px-3 -mt-1">
          {description}
        </p>
      )}

      {/* Section Fields */}
      {isExpanded && (
        <div className="pl-6 pr-3 space-y-3">
          {Object.entries(shape).map(([key, fieldSchema]) => {
            const fieldValue = value[key as keyof typeof value];
            const schema = fieldSchema as z.ZodTypeAny;

            // Check if this is a nested object schema (handles .optional() wrapped objects)
            const isNestedObject = isZodObject(schema);
            const hasValue = isPlainObject(fieldValue);

            // Try to unwrap - if successful and has value, render as nested
            const unwrappedSchema = isNestedObject ? unwrapZodObject(schema) : null;

            if (unwrappedSchema && hasValue) {
              // Render nested section
              return (
                <NestedSchemaSection
                  key={key}
                  title={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  schema={unwrappedSchema}
                  value={fieldValue}
                  onChange={(newValue) => {
                    onChange({
                      ...value,
                      [key]: newValue
                    });
                  }}
                  isExpanded={true}
                />
              );
            }

            return (
              <SchemaFormField
                key={key}
                schema={schema}
                value={fieldValue}
                onChange={(newValue) => {
                  onChange({
                    ...value,
                    [key]: newValue
                  });
                }}
                path={`${title}.${key}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Nested Schema Section Component
 *
 * For rendering nested object schemas (e.g., blueGate.entryAttraction).
 * Similar to SchemaSection but with different styling for nested context.
 */
export function NestedSchemaSection<T extends z.ZodObject<any>>({
  title,
  schema,
  value,
  onChange,
  isExpanded = true,
  onToggleExpanded,
  className = '',
  description
}: SchemaSectionProps<T>) {
  const shape = schema.shape;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Nested Section Header */}
      {onToggleExpanded ? (
        <button
          type="button"
          onClick={onToggleExpanded}
          className="w-full flex items-center justify-between px-2 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 rounded border border-slate-600/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-slate-400" />
            )}
            <h4 className="text-slate-200 text-xs font-medium">{title}</h4>
          </div>
          <span className="text-slate-500 text-[10px]">
            {Object.keys(shape).length} params
          </span>
        </button>
      ) : (
        <h4 className="text-slate-200 text-xs font-medium px-2">{title}</h4>
      )}

      {/* Nested Section Description */}
      {description && isExpanded && (
        <p className="text-slate-400 text-[10px] px-2 -mt-1">
          {description}
        </p>
      )}

      {/* Nested Fields */}
      {isExpanded && (
        <div className="pl-4 space-y-2">
          {Object.entries(shape).map(([key, fieldSchema]) => {
            const fieldValue = value[key as keyof typeof value];
            const schema = fieldSchema as z.ZodTypeAny;

            // Check if this is a nested object schema (recursive handling, with optional detection)
            const isNestedObject = isZodObject(schema);
            const hasValue = isPlainObject(fieldValue);

            // Try to unwrap - if successful and has value, render as nested
            const unwrappedSchema = isNestedObject ? unwrapZodObject(schema) : null;

            if (unwrappedSchema && hasValue) {
              // Recursively render nested section
              return (
                <NestedSchemaSection
                  key={key}
                  title={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  schema={unwrappedSchema}
                  value={fieldValue}
                  onChange={(newValue) => {
                    onChange({
                      ...value,
                      [key]: newValue
                    });
                  }}
                  isExpanded={true}
                />
              );
            }

            return (
              <SchemaFormField
                key={key}
                schema={schema}
                value={fieldValue}
                onChange={(newValue) => {
                  onChange({
                    ...value,
                    [key]: newValue
                  });
                }}
                path={`${title}.${key}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
