/**
 * Common arrangement patterns for loader components
 *
 * These utilities help position objects in common patterns:
 * - Circular arrangements
 * - Grid patterns
 * - Stacks
 * - Radial distributions
 */

import * as THREE from 'three'

/**
 * Calculate circular arrangement positions
 *
 * @param count - Number of items to arrange
 * @param radius - Radius of the circle
 * @param offset - Optional offset angle in radians
 * @returns Array of [x, y, z] positions
 */
export function getCircularPositions(
  count: number,
  radius: number,
  offset: number = 0
): [number, number, number][] {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2 + offset
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
  })
}

/**
 * Calculate grid arrangement positions
 *
 * @param width - Number of items along x axis
 * @param height - Number of items along y axis
 * @param spacing - Distance between items
 * @param centerOrigin - If true, center the grid at origin
 * @returns Array of [x, y, z] positions
 */
export function getGridPositions(
  width: number,
  height: number,
  spacing: number = 1,
  centerOrigin: boolean = true
): [number, number, number][] {
  const positions: [number, number, number][] = []
  const startX = centerOrigin ? -(width - 1) * spacing * 0.5 : 0
  const startY = centerOrigin ? -(height - 1) * spacing * 0.5 : 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      positions.push([
        startX + x * spacing,
        startY + y * spacing,
        0,
      ])
    }
  }

  return positions
}

/**
 * Calculate 3D grid arrangement positions
 *
 * @param width - Number of items along x axis
 * @param height - Number of items along y axis
 * @param depth - Number of items along z axis
 * @param spacing - Distance between items
 * @param centerOrigin - If true, center the grid at origin
 * @returns Array of [x, y, z] positions
 */
export function get3DGridPositions(
  width: number,
  height: number,
  depth: number,
  spacing: number = 1,
  centerOrigin: boolean = true
): [number, number, number][] {
  const positions: [number, number, number][] = []
  const startX = centerOrigin ? -(width - 1) * spacing * 0.5 : 0
  const startY = centerOrigin ? -(height - 1) * spacing * 0.5 : 0
  const startZ = centerOrigin ? -(depth - 1) * spacing * 0.5 : 0

  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        positions.push([
          startX + x * spacing,
          startY + y * spacing,
          startZ + z * spacing,
        ])
      }
    }
  }

  return positions
}

/**
 * Calculate vertical stack positions
 *
 * @param count - Number of items in stack
 * @param spacing - Vertical distance between items
 * @param centerOrigin - If true, center the stack at origin
 * @returns Array of [x, y, z] positions
 */
export function getStackPositions(
  count: number,
  spacing: number = 1,
  centerOrigin: boolean = true
): [number, number, number][] {
  return Array.from({ length: count }).map((_, i) => {
    const yPos = centerOrigin
      ? (i - count / 2) * spacing + spacing * 0.5
      : i * spacing
    return [0, yPos, 0]
  })
}

/**
 * Calculate radial arrangement with multiple rings
 *
 * @param itemsPerRing - Number of items in each ring
 * @param ringCount - Number of concentric rings
 * @param baseRadius - Radius of innermost ring
 * @param radiusIncrement - Distance between rings
 * @returns Array of [x, y, z] positions
 */
export function getRadialRingPositions(
  itemsPerRing: number,
  ringCount: number,
  baseRadius: number = 1,
  radiusIncrement: number = 1
): [number, number, number][] {
  const positions: [number, number, number][] = []

  for (let ring = 0; ring < ringCount; ring++) {
    const radius = baseRadius + ring * radiusIncrement
    const itemCount = Math.max(1, Math.floor(itemsPerRing * (ring + 1)))

    for (let i = 0; i < itemCount; i++) {
      const angle = (i / itemCount) * Math.PI * 2
      positions.push([
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius,
      ])
    }
  }

  return positions
}

/**
 * Calculate cross/plus arrangement
 *
 * @param itemsPerArm - Number of items along each arm
 * @param spacing - Distance between items
 * @param includeCenter - If true, add item at center
 * @returns Array of [x, y, z] positions
 */
export function getCrossPositions(
  itemsPerArm: number,
  spacing: number = 1,
  includeCenter: boolean = true
): [number, number, number][] {
  const positions: [number, number, number][] = []

  if (includeCenter) {
    positions.push([0, 0, 0])
  }

  // North
  for (let i = 1; i <= itemsPerArm; i++) {
    positions.push([0, 0, i * spacing])
  }

  // South
  for (let i = 1; i <= itemsPerArm; i++) {
    positions.push([0, 0, -i * spacing])
  }

  // East
  for (let i = 1; i <= itemsPerArm; i++) {
    positions.push([i * spacing, 0, 0])
  }

  // West
  for (let i = 1; i <= itemsPerArm; i++) {
    positions.push([-i * spacing, 0, 0])
  }

  return positions
}

/**
 * Map values to positions along a path
 *
 * @param values - Array of values to position
 * @param path - Path function that takes t (0-1) and returns [x, y, z]
 * @returns Array of [x, y, z] positions
 */
export function getPathPositions(
  count: number,
  path: (t: number) => [number, number, number]
): [number, number, number][] {
  return Array.from({ length: count }).map((_, i) => {
    const t = count > 1 ? i / (count - 1) : 0
    return path(t)
  })
}

/**
 * Parametric circle path
 *
 * @param radius - Radius of circle
 * @param height - Height (y position)
 * @returns Path function
 */
export function circlePath(
  radius: number = 1,
  height: number = 0
): (t: number) => [number, number, number] {
  return (t: number) => {
    const angle = t * Math.PI * 2
    return [Math.cos(angle) * radius, height, Math.sin(angle) * radius]
  }
}

/**
 * Parametric helix path
 *
 * @param radius - Radius of helix
 * @param height - Total height
 * @param turns - Number of complete turns
 * @returns Path function
 */
export function helixPath(
  radius: number = 1,
  height: number = 5,
  turns: number = 3
): (t: number) => [number, number, number] {
  return (t: number) => {
    const angle = t * Math.PI * 2 * turns
    return [
      Math.cos(angle) * radius,
      t * height,
      Math.sin(angle) * radius,
    ]
  }
}

/**
 * Parametric wave path
 *
 * @param wavelength - Distance between wave peaks
 * @param amplitude - Height of waves
 * @returns Path function
 */
export function wavePath(
  wavelength: number = 2,
  amplitude: number = 1
): (t: number) => [number, number, number] {
  return (t: number) => {
    return [
      t * 10 - 5,
      Math.sin(t * Math.PI * 2 / wavelength) * amplitude,
      0,
    ]
  }
}
