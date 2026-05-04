/**
 * Schema Detection Utilities
 *
 * Helps properly detect Zod schema types, handling wrapped types like .optional()
 */

import { z } from 'zod';

/**
 * Check if a schema is a ZodObject, unwrapping optional/nullable/default wrappers
 */
export function isZodObject(schema: z.ZodTypeAny): boolean {
  if (!schema) return false;

  // Direct check
  if (schema._def?.typeName === 'ZodObject') {
    return true;
  }

  // Unwrap optional
  if (schema._def?.typeName === 'ZodOptional') {
    return isZodObject(schema._def.schema);
  }

  // Unwrap nullable
  if (schema._def?.typeName === 'ZodNullable') {
    return isZodObject(schema._def.schema);
  }

  // Unwrap default
  if (schema._def?.typeName === 'ZodDefault') {
    return isZodObject(schema._def.schema);
  }

  return false;
}

/**
 * Unwrap a schema to get the underlying ZodObject
 */
export function unwrapZodObject<T extends z.ZodRawShape = z.ZodRawShape>(
  schema: z.ZodTypeAny
): z.ZodObject<T> | null {
  if (!schema) return null;

  if (schema._def?.typeName === 'ZodObject') {
    return schema as z.ZodObject<T>;
  }

  if (schema._def?.typeName === 'ZodOptional') {
    return unwrapZodObject(schema._def.schema);
  }

  if (schema._def?.typeName === 'ZodNullable') {
    return unwrapZodObject(schema._def.schema);
  }

  if (schema._def?.typeName === 'ZodDefault') {
    return unwrapZodObject(schema._def.schema);
  }

  return null;
}

/**
 * Check if value is a plain object (for type narrowing)
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
