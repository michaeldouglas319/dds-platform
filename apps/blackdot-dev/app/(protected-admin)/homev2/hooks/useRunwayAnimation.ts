import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { RUNWAY_CONFIG } from '../config/runway.config';
import { DRONE_FLEETS } from '../config/fleets.config';
import type { RunwayParticle } from '../types/particle.types';
import type { DroneFleet } from '../types/fleet.types';
import * as THREE from 'three';

interface SpawnQueueItem {
  particleIdx: number;
  spawnTime: number;
  gateIdx: number;
  gateId: string;
  gatePos: [number, number, number];
  fleetId: string; // NEW: Which fleet this particle belongs to
}

export function useRunwayAnimation(
  particlesRef: React.MutableRefObject<RunwayParticle[]>,
  spawnParticle: (idx: number, gatePos: [number, number, number], gateId: string, fleetId: string) => void,
  fleets: DroneFleet[] = DRONE_FLEETS
) {
  const spawnQueueRef = useRef<SpawnQueueItem[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  // Initialize spawn queue only once
  const initializeSpawnQueue = useCallback(() => {
    if (initializedRef.current) return;

    const queue: SpawnQueueItem[] = [];
    let globalParticleIdx = 0;
    let currentSpawnTime = 0;

    // For each fleet, create spawn queue items for all its particles
    fleets.forEach((fleet) => {
      // Assign particles from each fleet's origin gates
      const gates = fleet.originGates;
      const minDistance = RUNWAY_CONFIG.timing.minDistanceBetweenParticles;
      const baseDelay = RUNWAY_CONFIG.timing.staggerDelay;
      const lastSpawnedPositions: THREE.Vector3[] = [];

      for (let particleInFleet = 0; particleInFleet < fleet.particleCount; particleInFleet++) {
        // Cycle through fleet's gates
        const gateIdx = particleInFleet % gates.length;
        const gate = gates[gateIdx];
        const gatePos = new THREE.Vector3(gate.position.x, gate.position.y, gate.position.z);

        // Calculate additional delay to ensure minimum distance from previously spawned particles
        let additionalDelay = 0;
        if (lastSpawnedPositions.length > 0) {
          // Check distance to all recently spawned particles
          const minDistToAny = Math.min(
            ...lastSpawnedPositions.map(pos => gatePos.distanceTo(pos))
          );
          
          // If too close, add delay based on taxi speed to create spacing
          if (minDistToAny < minDistance) {
            const taxiSpeed = RUNWAY_CONFIG.timing.taxiSpeed * 10; // Convert to velocity
            const distanceNeeded = minDistance - minDistToAny;
            additionalDelay = distanceNeeded / taxiSpeed; // Time needed to create spacing
          }
        }

        queue.push({
          particleIdx: globalParticleIdx,
          spawnTime: currentSpawnTime + additionalDelay,
          gateIdx: gateIdx,
          gateId: gate.id,
          gatePos: [gate.position.x, gate.position.y, gate.position.z] as [number, number, number],
          fleetId: fleet.id,
        });

        globalParticleIdx++;
        currentSpawnTime += baseDelay + additionalDelay;
        
        // Track this position for distance checking (keep last 5 for performance)
        lastSpawnedPositions.push(gatePos);
        if (lastSpawnedPositions.length > 5) {
          lastSpawnedPositions.shift();
        }
      }
    });

    spawnQueueRef.current = queue;
    initializedRef.current = true;
    console.log(`[RunwayAnimation] Spawn queue initialized with ${queue.length} total particles across ${fleets.length} fleets`);
    fleets.forEach(fleet => {
      console.log(`  - ${fleet.name}: ${fleet.particleCount} particles`);
    });
  }, [fleets]);

  // Process spawn queue
  useFrame((state) => {
    const currentTime = state.clock.getElapsedTime();

    if (!initializedRef.current) {
      startTimeRef.current = currentTime;
      initializeSpawnQueue();
      console.log('[RunwayAnimation] Animation started at time', currentTime.toFixed(2));
    }

    if (startTimeRef.current === null) return;

    const elapsed = currentTime - startTimeRef.current;

    spawnQueueRef.current = spawnQueueRef.current.filter((item) => {
      if (elapsed >= item.spawnTime) {
        const fleet = fleets.find(f => f.id === item.fleetId);
        const fleetName = fleet?.name || item.fleetId;
        console.log(
          `[RunwayAnimation] Spawning particle ${item.particleIdx} at gate ${item.gateId} (${fleetName}) at time ${elapsed.toFixed(2)}s`
        );
        spawnParticle(
          item.particleIdx,
          item.gatePos,
          item.gateId,
          item.fleetId
        );
        return false;
      }
      return true;
    });
  });

  return { initializeSpawnQueue };
}
