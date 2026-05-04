import * as THREE from 'three'

/**
 * Creates a simplified (low-poly) version of a geometry by reducing vertex count
 * Works by decimating vertices while preserving overall shape
 */
export function simplifyGeometry(
  geometry: THREE.BufferGeometry,
  targetRatio: number = 0.5 // 0.5 = 50% of original vertices
): THREE.BufferGeometry {
  const simplified = geometry.clone()

  const positionAttribute = simplified.getAttribute('position')
  if (!positionAttribute) return simplified

  const vertexCount = positionAttribute.count
  const targetCount = Math.floor(vertexCount * targetRatio)

  // Simple decimation: remove every nth vertex
  const step = Math.max(1, Math.floor(vertexCount / targetCount))

  if (step <= 1) return simplified // Already simplified enough

  // Create new position array with decimated vertices
  const newPositions: number[] = []
  const oldPositions = positionAttribute.array as Float32Array

  for (let i = 0; i < vertexCount; i += step) {
    newPositions.push(oldPositions[i * 3])
    newPositions.push(oldPositions[i * 3 + 1])
    newPositions.push(oldPositions[i * 3 + 2])
  }

  simplified.setAttribute('position', new THREE.BufferAttribute(new Float32Array(newPositions), 3))

  // Recompute normals for proper lighting
  simplified.computeVertexNormals()

  return simplified
}

/**
 * Create Three.js geometry from type and args
 */
export function createGeometryFromType(type: string, args: any[]): THREE.BufferGeometry | null {
  try {
    switch (type) {
      case 'sphere':
        return new THREE.SphereGeometry(...(args as any[]))
      case 'box':
        return new THREE.BoxGeometry(...(args as any[]))
      case 'cone':
        return new THREE.ConeGeometry(...(args as any))
      case 'cylinder':
        return new THREE.CylinderGeometry(...(args as any))
      case 'icosahedron':
        return new THREE.IcosahedronGeometry(...(args as any))
      case 'octahedron':
        return new THREE.OctahedronGeometry(...(args as any))
      case 'torus':
        return new THREE.TorusGeometry(...(args as any))
      case 'torusKnot':
        return new THREE.TorusKnotGeometry(...(args as any))
      default:
        return null
    }
  } catch (e) {
    console.warn(`Failed to create geometry of type ${type}:`, e)
    return null
  }
}

/**
 * Creates low-poly versions of standard geometries
 * Returns both detailed and simplified versions
 */
export function createDetailedGeometryPair(
  type: string,
  detailedArgs: any[],
  simplificationRatio: number = 0.4
): { detailed: THREE.BufferGeometry; simplified: THREE.BufferGeometry } | null {
  const detailed = createGeometryFromType(type, detailedArgs)
  if (!detailed) return null

  const simplified = simplifyGeometry(detailed, simplificationRatio)

  return { detailed, simplified }
}

/**
 * Get simplified geometry args for a given detail level (0-1)
 * 0 = ultra-jagged, 0.5 = medium, 1 = smooth detailed
 */
export function getGeometryArgsAtDetail(
  type: string,
  detail: number // 0-1, where 0 is ultra-simplified and 1 is fully detailed
): any[] {
  // Clamp detail to 0-1
  const d = Math.max(0, Math.min(1, detail))

  switch (type) {
    case 'sphere': {
      // Interpolate from [1, 8, 8] (detail=0) to [1, 64, 64] (detail=1)
      const segments = Math.round(8 + (64 - 8) * d)
      return [1, segments, segments]
    }

    case 'icosahedron': {
      // Interpolate from [1, 0] (detail=0) to [1, 5] (detail=1)
      const detailLevel = Math.round(0 + (5 - 0) * d)
      return [1, detailLevel]
    }

    case 'torus': {
      // Interpolate radial and tubular segments
      const radialSegments = Math.round(8 + (32 - 8) * d)
      const tubularSegments = Math.round(8 + (256 - 8) * d)
      return [1, 0.4, radialSegments, tubularSegments]
    }

    case 'torusKnot': {
      // Interpolate tubular and radial segments
      const tubularSegments = Math.round(64 + (256 - 64) * d)
      const radialSegments = Math.round(8 + (32 - 8) * d)
      return [1, 0.4, tubularSegments, radialSegments, 2, 3]
    }

    case 'cone': {
      // Interpolate radial segments
      const radialSegments = Math.round(8 + (64 - 8) * d)
      return [1, 2, radialSegments]
    }

    case 'cylinder': {
      // Interpolate radial segments
      const radialSegments = Math.round(8 + (64 - 8) * d)
      return [0.8, 0.8, 2, radialSegments]
    }

    case 'box': {
      // Boxes don't have detail levels
      return [1, 1, 1]
    }

    default:
      return []
  }
}

/**
 * Pre-made low-poly geometry sets for common morphs
 */
export const LOW_POLY_GEOMETRY_SETS = {
  /**
   * Smooth sphere → low-poly sphere
   * Usage: <InteractiveSphere geometry={createGeometryFromType('sphere', LOW_POLY_GEOMETRY_SETS.sphere.detailed)} hoverGeometry={createGeometryFromType('sphere', LOW_POLY_GEOMETRY_SETS.sphere.simplified)} />
   */
  sphere: {
    detailed: [1, 64, 64] as any,
    simplified: [1, 8, 8] as any,
  },

  /**
   * High-detail icosahedron → low-poly icosahedron
   */
  icosahedron: {
    detailed: [1, 5] as any,
    simplified: [1, 0] as any,
  },

  /**
   * Smooth torus → low-poly torus
   */
  torus: {
    detailed: [1, 0.4, 32, 256] as any,
    simplified: [1, 0.4, 8, 8] as any,
  },

  /**
   * Detailed torus knot → low-poly torus knot
   */
  torusKnot: {
    detailed: [1, 0.4, 256, 32, 2, 3] as any,
    simplified: [1, 0.4, 64, 8, 2, 3] as any,
  },

  /**
   * Smooth cone → low-poly cone
   */
  cone: {
    detailed: [1, 2, 64] as any,
    simplified: [1, 2, 8] as any,
  },

  /**
   * Smooth cylinder → low-poly cylinder
   */
  cylinder: {
    detailed: [0.8, 0.8, 2, 64] as any,
    simplified: [0.8, 0.8, 2, 8] as any,
  },

  /**
   * Box stays crisp but this set provides variation for reference
   */
  box: {
    detailed: [1, 1, 1] as any,
    simplified: [1, 1, 1] as any, // Boxes don't simplify
  },
}
