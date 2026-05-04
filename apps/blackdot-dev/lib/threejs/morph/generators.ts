/**
 * Morph Target Generators
 *
 * Pre-built functions for generating common morph target transformations.
 * Each generator creates a new set of vertex positions based on the original geometry.
 */

import { BufferGeometry, Vector3 } from 'three'
import { MorphTarget, MorphGeneratorConfig } from './types'

/**
 * Generate a spherify morph target
 * Transforms vertices toward a sphere surface
 */
export function generateSpherifyMorph(
  geometry: BufferGeometry,
  name = 'spherify',
  intensity = 1.0
): MorphTarget {
  const positions = geometry.attributes.position.array as Float32Array
  const spherePositions = new Float32Array(positions.length)

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    const z = positions[i + 2]

    // Spherical transformation formula
    const nx = x * Math.sqrt(1 - (y * y) / 2 - (z * z) / 2 + (y * y * z * z) / 3)
    const ny = y * Math.sqrt(1 - (z * z) / 2 - (x * x) / 2 + (z * z * x * x) / 3)
    const nz = z * Math.sqrt(1 - (x * x) / 2 - (y * y) / 2 + (x * x * y * y) / 3)

    // Apply intensity
    spherePositions[i] = x + (nx - x) * intensity
    spherePositions[i + 1] = y + (ny - y) * intensity
    spherePositions[i + 2] = z + (nz - z) * intensity
  }

  return {
    name,
    positions: spherePositions,
  }
}

/**
 * Generate a twist morph target
 * Rotates vertices around an axis with distance-based angle
 */
export function generateTwistMorph(
  geometry: BufferGeometry,
  name = 'twist',
  intensity = 1.0,
  axis: 'x' | 'y' | 'z' = 'y'
): MorphTarget {
  const positions = geometry.attributes.position.array as Float32Array
  const twistedPositions = new Float32Array(positions.length)

  // Calculate bounding box for normalization
  geometry.computeBoundingBox()
  const bbox = geometry.boundingBox!
  const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
  const axisLength = bbox.max.getComponent(axisIndex) - bbox.min.getComponent(axisIndex)

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    const z = positions[i + 2]

    // Twist angle based on position along axis
    const axisPos = [x, y, z][axisIndex]
    const normalizedPos = (axisPos - bbox.min.getComponent(axisIndex)) / axisLength
    const angle = normalizedPos * Math.PI * 2 * intensity

    // Apply rotation based on axis
    if (axis === 'y') {
      const radius = Math.sqrt(x * x + z * z)
      const currentAngle = Math.atan2(z, x)
      const newAngle = currentAngle + angle

      twistedPositions[i] = radius * Math.cos(newAngle)
      twistedPositions[i + 1] = y
      twistedPositions[i + 2] = radius * Math.sin(newAngle)
    } else if (axis === 'x') {
      const radius = Math.sqrt(y * y + z * z)
      const currentAngle = Math.atan2(z, y)
      const newAngle = currentAngle + angle

      twistedPositions[i] = x
      twistedPositions[i + 1] = radius * Math.cos(newAngle)
      twistedPositions[i + 2] = radius * Math.sin(newAngle)
    } else {
      // axis === 'z'
      const radius = Math.sqrt(x * x + y * y)
      const currentAngle = Math.atan2(y, x)
      const newAngle = currentAngle + angle

      twistedPositions[i] = radius * Math.cos(newAngle)
      twistedPositions[i + 1] = radius * Math.sin(newAngle)
      twistedPositions[i + 2] = z
    }
  }

  return {
    name,
    positions: twistedPositions,
  }
}

/**
 * Generate a wave morph target
 * Applies sinusoidal displacement
 */
export function generateWaveMorph(
  geometry: BufferGeometry,
  name = 'wave',
  amplitude = 0.5,
  frequency = 2.0,
  axis: 'x' | 'y' | 'z' = 'y'
): MorphTarget {
  const positions = geometry.attributes.position.array as Float32Array
  const wavePositions = new Float32Array(positions.length)

  geometry.computeBoundingBox()
  const bbox = geometry.boundingBox!

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    const z = positions[i + 2]

    // Wave based on horizontal position
    const waveInput = axis === 'x' ? x : axis === 'y' ? y : z
    const waveOffset = Math.sin(waveInput * frequency) * amplitude

    // Apply wave perpendicular to axis
    if (axis === 'y') {
      wavePositions[i] = x
      wavePositions[i + 1] = y + waveOffset
      wavePositions[i + 2] = z
    } else if (axis === 'x') {
      wavePositions[i] = x + waveOffset
      wavePositions[i + 1] = y
      wavePositions[i + 2] = z
    } else {
      wavePositions[i] = x
      wavePositions[i + 1] = y
      wavePositions[i + 2] = z + waveOffset
    }
  }

  return {
    name,
    positions: wavePositions,
  }
}

/**
 * Generate an inflate morph target
 * Pushes vertices outward along their normals
 */
export function generateInflateMorph(
  geometry: BufferGeometry,
  name = 'inflate',
  amount = 0.5
): MorphTarget {
  const positions = geometry.attributes.position.array as Float32Array
  const inflatedPositions = new Float32Array(positions.length)

  // Ensure normals are computed
  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals()
  }
  const normals = geometry.attributes.normal.array as Float32Array

  for (let i = 0; i < positions.length; i += 3) {
    inflatedPositions[i] = positions[i] + normals[i] * amount
    inflatedPositions[i + 1] = positions[i + 1] + normals[i + 1] * amount
    inflatedPositions[i + 2] = positions[i + 2] + normals[i + 2] * amount
  }

  return {
    name,
    positions: inflatedPositions,
  }
}

/**
 * Generate an explode morph target
 * Pushes vertices away from center
 */
export function generateExplodeMorph(
  geometry: BufferGeometry,
  name = 'explode',
  factor = 1.5
): MorphTarget {
  const positions = geometry.attributes.position.array as Float32Array
  const explodedPositions = new Float32Array(positions.length)

  // Calculate center
  geometry.computeBoundingBox()
  const center = new Vector3()
  geometry.boundingBox!.getCenter(center)

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    const z = positions[i + 2]

    // Direction from center
    const dx = x - center.x
    const dy = y - center.y
    const dz = z - center.z

    // Push outward
    explodedPositions[i] = x + dx * (factor - 1)
    explodedPositions[i + 1] = y + dy * (factor - 1)
    explodedPositions[i + 2] = z + dz * (factor - 1)
  }

  return {
    name,
    positions: explodedPositions,
  }
}

/**
 * Generate a custom morph target using a user-defined function
 */
export function generateCustomMorph(
  geometry: BufferGeometry,
  name: string,
  transformFn: (vertex: Vector3, index: number, originalPositions: Float32Array) => Vector3
): MorphTarget {
  const positions = geometry.attributes.position.array as Float32Array
  const customPositions = new Float32Array(positions.length)

  const vertex = new Vector3()

  for (let i = 0; i < positions.length; i += 3) {
    vertex.set(positions[i], positions[i + 1], positions[i + 2])
    const transformed = transformFn(vertex, i / 3, positions)

    customPositions[i] = transformed.x
    customPositions[i + 1] = transformed.y
    customPositions[i + 2] = transformed.z
  }

  return {
    name,
    positions: customPositions,
  }
}

/**
 * Generate morph target from configuration
 */
export function generateMorphTarget(
  geometry: BufferGeometry,
  config: MorphGeneratorConfig
): MorphTarget {
  const intensity = config.intensity ?? 1.0

  switch (config.type) {
    case 'spherify':
      return generateSpherifyMorph(geometry, 'spherify', intensity)

    case 'twist':
      return generateTwistMorph(
        geometry,
        'twist',
        intensity,
        (config.params?.axis as unknown as 'x' | 'y' | 'z') ?? 'y'
      )

    case 'wave':
      return generateWaveMorph(
        geometry,
        'wave',
        config.params?.amplitude ?? 0.5,
        config.params?.frequency ?? 2.0,
        (config.params?.axis as unknown as 'x' | 'y' | 'z') ?? 'y'
      )

    case 'inflate':
      return generateInflateMorph(geometry, 'inflate', intensity)

    case 'explode':
      return generateExplodeMorph(geometry, 'explode', 1 + intensity)

    case 'custom':
      if (!config.customFn) {
        throw new Error('Custom morph requires customFn in config.params')
      }
      return generateCustomMorph(geometry, 'custom', config.customFn)

    default:
      throw new Error(`Unknown morph type: ${config.type}`)
  }
}
