/**
 * Generic Spatial Grid for collision detection optimization
 * Reduces O(n²) complexity to O(n) average case by partitioning space
 *
 * Generic version works with any type that has a `position: THREE.Vector3` property
 */

import * as THREE from 'three';
import type { RunwayParticle } from '../types/particle.types';

/**
 * Constraint for types that can be used with SpatialGrid
 */
export interface Positionable {
  position: THREE.Vector3;
}

/**
 * Generic Spatial Grid for any entity with a position
 */
export class SpatialGrid<T extends Positionable> {
  private grid = new Map<string, T[]>();
  private cellSize: number;
  private gridBounds = { min: new THREE.Vector3(-100, -100, -100), max: new THREE.Vector3(100, 100, 100) };

  constructor(cellSize: number = 10) {
    this.cellSize = cellSize;
  }

  /**
   * Get grid cell key for a 3D position
   */
  private getCellKey(pos: THREE.Vector3): string {
    const x = Math.floor(pos.x / this.cellSize);
    const y = Math.floor(pos.y / this.cellSize);
    const z = Math.floor(pos.z / this.cellSize);
    return `${x},${y},${z}`;
  }

  /**
   * Clear grid and rebuild from entities
   * @param entities - Array of entities with position property
   * @param filterFn - Optional filter function (e.g., skip invisible entities)
   */
  update(entities: T[], filterFn?: (entity: T) => boolean): void {
    this.grid.clear();

    entities.forEach(entity => {
      // Apply filter if provided
      if (filterFn && !filterFn(entity)) return;

      const key = this.getCellKey(entity.position);
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key)!.push(entity);
    });
  }

  /**
   * Get nearby entities within radius (checks current and adjacent cells)
   * @param entity - The entity to find neighbors for
   * @param radius - Search radius
   * @param filterFn - Optional filter function for results
   */
  getNearby(entity: T, radius: number, filterFn?: (other: T) => boolean): T[] {
    const nearby: T[] = [];
    const cellKey = this.getCellKey(entity.position);
    const [x, y, z] = cellKey.split(',').map(Number);

    // Check current cell and all 26 adjacent cells (3x3x3 cube)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const adjacentKey = `${x + dx},${y + dy},${z + dz}`;
          const cellEntities = this.grid.get(adjacentKey);

          if (cellEntities) {
            cellEntities.forEach(other => {
              if (other !== entity) {
                const distance = entity.position.distanceTo(other.position);
                if (distance < radius && distance > 0) {
                  // Apply filter if provided
                  if (!filterFn || filterFn(other)) {
                    nearby.push(other);
                  }
                }
              }
            });
          }
        }
      }
    }

    return nearby;
  }

  /**
   * Get all entities in the grid
   */
  getAllEntities(): T[] {
    const all: T[] = [];
    this.grid.forEach(entities => all.push(...entities));
    return all;
  }

  /**
   * Get number of entities in grid
   */
  getCount(): number {
    let count = 0;
    this.grid.forEach(entities => count += entities.length);
    return count;
  }

  /**
   * Clear the grid
   */
  clear(): void {
    this.grid.clear();
  }
}

/**
 * Optimized collision avoidance using spatial grid
 * Replaces O(n²) checking with O(n) average case
 *
 * Legacy version for RunwayParticle - kept for backward compatibility
 */
export function getCollisionAvoidanceOptimized(
  particle: RunwayParticle,
  grid: SpatialGrid<RunwayParticle>,
  avoidanceRadius: number,
  avoidanceStrength: number
): THREE.Vector3 {
  const avoidanceForce = new THREE.Vector3(0, 0, 0);
  const nearby = grid.getNearby(
    particle,
    avoidanceRadius,
    (other) => other.scale > 0 // Filter out invisible particles
  );

  nearby.forEach(other => {
    const distance = particle.position.distanceTo(other.position);
    if (distance < avoidanceRadius && distance > 0) {
      const repulsion = particle.position.clone().sub(other.position).normalize();
      const strength = (1 - distance / avoidanceRadius) * avoidanceStrength;
      avoidanceForce.add(repulsion.multiplyScalar(strength));
    }
  });

  return avoidanceForce;
}

/**
 * Generic collision avoidance for any positionable entity
 * @param entity - The entity to calculate avoidance for
 * @param grid - Spatial grid containing entities
 * @param avoidanceRadius - Radius within which to avoid other entities
 * @param avoidanceStrength - Strength of the avoidance force
 * @param filterFn - Optional filter for which entities to avoid
 */
export function getCollisionAvoidanceGeneric<T extends Positionable>(
  entity: T,
  grid: SpatialGrid<T>,
  avoidanceRadius: number,
  avoidanceStrength: number,
  filterFn?: (other: T) => boolean
): THREE.Vector3 {
  const avoidanceForce = new THREE.Vector3(0, 0, 0);
  const nearby = grid.getNearby(entity, avoidanceRadius, filterFn);

  nearby.forEach(other => {
    const distance = entity.position.distanceTo(other.position);
    if (distance < avoidanceRadius && distance > 0) {
      const repulsion = entity.position.clone().sub(other.position).normalize();
      const strength = (1 - distance / avoidanceRadius) * avoidanceStrength;
      avoidanceForce.add(repulsion.multiplyScalar(strength));
    }
  });

  return avoidanceForce;
}
