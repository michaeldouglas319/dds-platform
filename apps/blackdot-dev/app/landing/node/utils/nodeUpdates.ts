import * as THREE from 'three';
import { NodeData } from '../../types/node.types';
import { NETWORK_CONFIG } from '../../config/network.config';

/**
 * Handle expired node states
 */
function handleExpiredState(nodeState: NodeData): void {
  switch (nodeState.state) {
    case 'dying':
    case 'deleting':
      nodeState.alive = false;
      nodeState.state = 'default';
      nodeState.timer = 0;
      break;
    case 'new':
    case 'cleaning':
      nodeState.state = 'default';
      nodeState.timer = 0;
      break;
    default:
      break;
  }
}

/**
 * Update node timers and handle expired states
 */
export function updateNodeTimers(
  delta: number,
  nodeStatesRef: React.MutableRefObject<Array<NodeData>>,
  config: typeof NETWORK_CONFIG
): void {
  for (let i = 0; i < config.nodeCount; i++) {
    const nodeState = nodeStatesRef.current[i];
    if (!nodeState) continue;
    if (nodeState.timer > 0) {
      nodeState.timer -= delta;
    }
    if (nodeState.timer <= 0 && nodeState.state !== 'default') {
      handleExpiredState(nodeState);
    }
  }
}

/**
 * Process spawn queue - create nodes at scheduled times
 */
export function processSpawnQueue(
  currentTime: number,
  basePositions: Float32Array,
  spawnQueueRef: React.MutableRefObject<Array<{ nodeIdx: number; spawnTime: number }>>,
  nodeStatesRef: React.MutableRefObject<Array<NodeData>>,
  createNodeFn: (nodeIdx: number, basePositions: Float32Array, position?: THREE.Vector3, startScale?: number) => void
): void {
  spawnQueueRef.current = spawnQueueRef.current.filter(spawn => {
    if (currentTime >= spawn.spawnTime) {
      const nodeState = nodeStatesRef.current[spawn.nodeIdx];
      if (nodeState && !nodeState.alive) {
        createNodeFn(spawn.nodeIdx, basePositions);
        return false;
      }
      return false;
    }
    return true;
  });
}

/**
 * Update node positions ref for particle collision detection
 */
export function updateNodePositions(
  instancedMeshRef: React.RefObject<THREE.InstancedMesh>,
  nodeStatesRef: React.MutableRefObject<Array<NodeData>>,
  nodePositionsRef: React.MutableRefObject<THREE.Vector3[]>,
  config: { nodeCount: number }
): void {
  if (!instancedMeshRef.current) return;
  
  const positions: THREE.Vector3[] = [];
  const tempMatrix = new THREE.Matrix4();
  const tempPos = new THREE.Vector3();
  
  for (let i = 0; i < config.nodeCount; i++) {
    const nodeState = nodeStatesRef.current[i];
    if (nodeState && nodeState.alive) {
      instancedMeshRef.current.getMatrixAt(i, tempMatrix);
      tempPos.setFromMatrixPosition(tempMatrix);
      positions.push(tempPos.clone());
    } else {
      positions.push(new THREE.Vector3(Infinity, Infinity, Infinity));
    }
  }
  
  nodePositionsRef.current = positions;
}

/**
 * Update connection lines based on current node positions
 */
export function updateConnections(
  linesRef: React.RefObject<THREE.LineSegments>,
  instancedMeshRef: React.RefObject<THREE.InstancedMesh>,
  nodeStatesRef: React.MutableRefObject<Array<NodeData>>,
  nodeCount: number,
  connectionDistance: number,
  agitationLevel: number,
  currentTime: number
): void {
  if (!linesRef.current || !instancedMeshRef.current) return;
  
  const shouldUpdate = Math.floor(currentTime * 10) % 3 === 0;
  if (!shouldUpdate) return;
  
  const connArray = linesRef.current.geometry.attributes.position.array as Float32Array;
  let connIndex = 0;
  const tempMatrix = new THREE.Matrix4();
  const tempPosition = new THREE.Vector3();
  
  for (let i = 0; i < nodeCount && connIndex < connArray.length - 5; i++) {
    const nodeStateI = nodeStatesRef.current[i];
    if (!nodeStateI || !nodeStateI.alive) continue;
    
    instancedMeshRef.current.getMatrixAt(i, tempMatrix);
    tempPosition.setFromMatrixPosition(tempMatrix);
    const iPos = tempPosition.clone();
    
    for (let j = i + 1; j < nodeCount && connIndex < connArray.length - 5; j++) {
      const nodeStateJ = nodeStatesRef.current[j];
      if (!nodeStateJ || !nodeStateJ.alive) continue;
      
      instancedMeshRef.current.getMatrixAt(j, tempMatrix);
      tempPosition.setFromMatrixPosition(tempMatrix);
      const jPos = tempPosition.clone();
      
      const distance = iPos.distanceTo(jPos);
      const dynamicDistance = connectionDistance * (1.0 + agitationLevel * 0.3);
      
      if (distance < dynamicDistance) {
        connArray[connIndex++] = iPos.x;
        connArray[connIndex++] = iPos.y;
        connArray[connIndex++] = iPos.z;
        connArray[connIndex++] = jPos.x;
        connArray[connIndex++] = jPos.y;
        connArray[connIndex++] = jPos.z;
      }
    }
  }
  
  linesRef.current.geometry.attributes.position.needsUpdate = true;
  linesRef.current.geometry.setDrawRange(0, connIndex / 3);
}

/**
 * Handle node evolution (death, birth, cleaning)
 */
export function handleEvolution(
  currentTime: number,
  lastEvolutionTimeRef: React.MutableRefObject<number>,
  lastRandomSetTimeRef: React.MutableRefObject<number>,
  nodeStatesRef: React.MutableRefObject<Array<NodeData>>,
  basePositions: Float32Array,
  spawnQueueRef: React.MutableRefObject<Array<{ nodeIdx: number; spawnTime: number }>>,
  nodeCount: number,
  config: typeof NETWORK_CONFIG
): void {
  const { evolutionInterval, randomSetInterval, similarityThreshold } = config;
  
  // Periodic evolution: randomly select nodes to die
  if (currentTime - lastEvolutionTimeRef.current > evolutionInterval) {
    lastEvolutionTimeRef.current = currentTime;
    
    const nodesToKill = Math.floor(2 + Math.random() * 3);
    const aliveIndices = nodeStatesRef.current
      .map((state, idx) => state && state.alive && state.state === 'default' ? idx : -1)
      .filter(idx => idx !== -1);
    
    for (let i = 0; i < nodesToKill && aliveIndices.length > 0; i++) {
      const randomIdx = Math.floor(Math.random() * aliveIndices.length);
      const nodeIdx = aliveIndices[randomIdx];
      aliveIndices.splice(randomIdx, 1);
      
      nodeStatesRef.current[nodeIdx].state = 'dying';
      nodeStatesRef.current[nodeIdx].timer = config.deathFadeTime;
      
      const spawnDelay = config.spawnDelayMin + Math.random() * (config.spawnDelayMax - config.spawnDelayMin);
      spawnQueueRef.current.push({
        nodeIdx,
        spawnTime: currentTime + config.deathFadeTime + spawnDelay,
      });
    }
  }
  
  // Random set cleaning: delete similar nodes immediately
  if (currentTime - lastRandomSetTimeRef.current > randomSetInterval) {
    lastRandomSetTimeRef.current = currentTime;
    
    const processed = new Set<number>();
    
    for (let i = 0; i < nodeCount; i++) {
      const nodeStateI = nodeStatesRef.current[i];
      if (!nodeStateI || !nodeStateI.alive || processed.has(i)) continue;
      
      const iPos = new THREE.Vector3(
        basePositions[i * 3],
        basePositions[i * 3 + 1],
        basePositions[i * 3 + 2]
      );
      
      const similarNodes: number[] = [i];
      
      for (let j = i + 1; j < nodeCount; j++) {
        const nodeStateJ = nodeStatesRef.current[j];
        if (!nodeStateJ || !nodeStateJ.alive || processed.has(j)) continue;
        
        const jPos = new THREE.Vector3(
          basePositions[j * 3],
          basePositions[j * 3 + 1],
          basePositions[j * 3 + 2]
        );
        
        if (iPos.distanceTo(jPos) < similarityThreshold) {
          similarNodes.push(j);
        }
      }
      
      if (similarNodes.length > 1) {
        for (let k = 1; k < similarNodes.length; k++) {
          const nodeIdx = similarNodes[k];
          nodeStatesRef.current[nodeIdx].alive = false;
          nodeStatesRef.current[nodeIdx].state = 'default';
          nodeStatesRef.current[nodeIdx].timer = 0;
          processed.add(nodeIdx);
          
          const spawnDelay = config.spawnDelayMin + Math.random() * (config.spawnDelayMax - config.spawnDelayMin);
          spawnQueueRef.current.push({
            nodeIdx,
            spawnTime: currentTime + spawnDelay,
          });
        }
        
        const firstIdx = similarNodes[0];
        nodeStatesRef.current[firstIdx].state = 'cleaning';
        nodeStatesRef.current[firstIdx].timer = config.cleaningTime;
        processed.add(firstIdx);
      }
    }
  }
}

