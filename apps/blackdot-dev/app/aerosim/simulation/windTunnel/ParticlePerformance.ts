/**
 * Performance logging utilities for particle system
 */

export interface PerformanceStats {
  updateTime: number;
  frameTime: number;
}

export interface SDFStats {
  cacheHitRate: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface ExtremeStats {
  minVelocity: number;
  maxVelocity: number;
  minPositionChange: number;
  maxPositionChange: number;
  zeroVelocityCount: number;
  staticParticleCount: number;
  avgVelocity: number;
  avgPositionChange: number;
}

export interface PerformanceLog {
  cacheHitRate: string | number;
  cacheHits: number;
  cacheMisses: number;
  sdfQueriesPerFrame: number;
}

/**
 * Log performance stats periodically
 */
export function logPerformance(
  frameCount: number,
  frameTime: number,
  particleCount: number,
  delta: number,
  sdfStats: SDFStats | null,
  updateInterval: number,
  extremeStats?: ExtremeStats | null
): void {
  const now = Date.now();
  const lastLogTime = logPerformance.lastLogTime || now;
  
  if (now - lastLogTime >= updateInterval) {
    const fps = Math.round(1000 / (delta * 1000));
    const avgFrameTime = frameTime.toFixed(2);

    const baseLog: PerformanceLog = {
      cacheHitRate: sdfStats ? `${(sdfStats.cacheHitRate * 100).toFixed(1)}%` : 'N/A',
      cacheHits: sdfStats?.cacheHits || 0,
      cacheMisses: sdfStats?.cacheMisses || 0,
      // Phase 1: Track SDF query reduction
      sdfQueriesPerFrame: sdfStats ? (sdfStats.cacheHits + sdfStats.cacheMisses) : 0,
    };
    
    // Debug: Log if voxel grid exists but has no queries (Phase 2 diagnostic)
    if (frameCount % 300 === 0 && sdfStats && sdfStats.cacheHits === 0 && sdfStats.cacheMisses > 1000) {
      console.warn('⚠️ Phase 2: Voxel grid may not be active - all queries going to direct SDF');
      console.warn(`   Cache misses: ${sdfStats.cacheMisses} (voxel grid should have high hit rate)`);
    }
    
    // Phase 2: Add voxel grid stats if available
    // Check if meshSDF has voxel grid attached (will be checked in getSDFStats)
    
    // Add extreme stats if provided - log separately for better visibility
    if (extremeStats) {
      console.log(`⚡ Performance: ${particleCount} particles | Frame: ${avgFrameTime}ms | FPS: ${fps}`, baseLog);
      console.log(`  📊 Velocity: min=${extremeStats.minVelocity.toFixed(6)} max=${extremeStats.maxVelocity.toFixed(6)} avg=${extremeStats.avgVelocity.toFixed(6)} zero=${extremeStats.zeroVelocityCount}`);
      console.log(`  📊 Movement: min=${extremeStats.minPositionChange.toFixed(6)} max=${extremeStats.maxPositionChange.toFixed(6)} avg=${extremeStats.avgPositionChange.toFixed(6)} static=${extremeStats.staticParticleCount}`);
    } else {
      console.log(`⚡ Performance: ${particleCount} particles | Frame: ${avgFrameTime}ms | FPS: ${fps}`, baseLog);
    }
    
    // Log warnings for extreme cases
    if (extremeStats) {
      if (extremeStats.zeroVelocityCount > particleCount * 0.5) {
        console.warn(`⚠️ ${extremeStats.zeroVelocityCount}/${particleCount} particles have zero velocity!`);
      }
      if (extremeStats.staticParticleCount > particleCount * 0.5) {
        console.warn(`⚠️ ${extremeStats.staticParticleCount}/${particleCount} particles are not moving!`);
      }
      if (extremeStats.maxVelocity < 0.01) {
        console.warn(`⚠️ Max velocity is very low: ${extremeStats.maxVelocity.toFixed(6)} - particles may appear static!`);
      }
      if (extremeStats.maxPositionChange < 0.001) {
        console.warn(`⚠️ Max position change is very low: ${extremeStats.maxPositionChange.toFixed(6)} - particles may appear static!`);
      }
    }
    
    logPerformance.lastLogTime = now;
  }
}

// Store last log time as static property
logPerformance.lastLogTime = Date.now();

interface MeshSDFWithStats {
  (pos: { x: number; y: number; z: number }): number;
  __voxelGrid?: { getStats(): { cacheHitRate: number; cacheHits: number; cacheMisses: number } };
  __meshSDFInstance?: { getStats(): { cacheHitRate: number; cacheHits: number; cacheMisses: number } };
}

/**
 * Extract SDF stats from meshSDF if available
 * Phase 2: Also checks for voxel grid stats
 */
export function getSDFStats(meshSDF?: MeshSDFWithStats): SDFStats | null {
  if (!meshSDF) {
    return null;
  }

  // Phase 2: Check for voxel grid first (higher priority)
  const voxelGrid = meshSDF.__voxelGrid;
  if (voxelGrid && typeof voxelGrid.getStats === 'function') {
    const voxelStats = voxelGrid.getStats();
    // Return voxel grid stats even if no queries yet (to show it exists)
    return {
      cacheHitRate: voxelStats.cacheHitRate || 0,
      cacheHits: voxelStats.cacheHits || 0,
      cacheMisses: voxelStats.cacheMisses || 0,
    };
  }

  // Fallback to MeshSDF_BVH stats
  const instance = meshSDF.__meshSDFInstance;
  if (instance && instance.getStats) {
    const bvhStats = instance.getStats();
    // Only return if there have been queries
    if (bvhStats.cacheHits + bvhStats.cacheMisses > 0) {
      return {
        cacheHitRate: bvhStats.cacheHitRate,
        cacheHits: bvhStats.cacheHits,
        cacheMisses: bvhStats.cacheMisses,
      };
    }
  }
  
  return null;
}

