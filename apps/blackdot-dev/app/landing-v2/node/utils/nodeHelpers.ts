import * as THREE from 'three';
import { NodeData } from '../../types/node.types';
import { NETWORK_CONFIG } from '../../config/network.config';

/**
 * Handle expired node states - transitions nodes to their next state
 */
export function handleExpiredState(nodeState: NodeData): void {
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
 * Create a new node at a random position or specified position
 */
export function createNode(
  nodeIdx: number,
  basePositions: Float32Array,
  position: THREE.Vector3 | undefined,
  startScale: number,
  nodeStatesRef: React.MutableRefObject<Array<NodeData>>,
  instancedMeshRef: React.RefObject<THREE.InstancedMesh>,
  config: typeof NETWORK_CONFIG
): void {
  if (position) {
    basePositions[nodeIdx * 3] = position.x;
    basePositions[nodeIdx * 3 + 1] = position.y;
    basePositions[nodeIdx * 3 + 2] = position.z;
  } else {
    const radius = 0.8 + Math.random() * 0.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    
    basePositions[nodeIdx * 3] = radius * Math.sin(phi) * Math.cos(theta);
    basePositions[nodeIdx * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    basePositions[nodeIdx * 3 + 2] = radius * Math.cos(phi);
  }
  
  const nodeState = nodeStatesRef.current[nodeIdx];
  if (!nodeState) {
    // Initialize node state if it doesn't exist
    nodeStatesRef.current[nodeIdx] = {
      alive: true,
      state: 'new',
      timer: config.newSpawnTime,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  } else {
    nodeState.alive = true;
    nodeState.state = 'new';
    nodeState.timer = config.newSpawnTime;
    nodeState.pulsePhase = Math.random() * Math.PI * 2;
  }
  
  if (instancedMeshRef.current && startScale === 0) {
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity();
    tempMatrix.setPosition(new THREE.Vector3(
      basePositions[nodeIdx * 3],
      basePositions[nodeIdx * 3 + 1],
      basePositions[nodeIdx * 3 + 2]
    ));
    tempMatrix.scale(new THREE.Vector3(0, 0, 0));
    instancedMeshRef.current.setMatrixAt(nodeIdx, tempMatrix);
  }
}

/**
 * Initialize network data (positions, connections, etc.)
 */
export function initializeNetworkData(
  nodeCount: number,
  connectionDistance: number
) {
  const pos = new Float32Array(nodeCount * 3);
  const basePos = new Float32Array(nodeCount * 3);
  const steps = new Float32Array(nodeCount);
  const cols = new Float32Array(nodeCount * 3);
  const nodePositions: THREE.Vector3[] = [];
  
  // Note: nodeStatesRef initialization moved to useEffect to avoid accessing refs during render
  
  // Use neutral gray color
  const defaultColor = new THREE.Color('#aaaaaa'); // Neutral gray
  
  for (let i = 0; i < nodeCount; i++) {
    const radius = 0.8 + Math.random() * 0.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    
    basePos[i * 3] = x;
    basePos[i * 3 + 1] = y;
    basePos[i * 3 + 2] = z;
    
    cols[i * 3] = defaultColor.r;
    cols[i * 3 + 1] = defaultColor.g;
    cols[i * 3 + 2] = defaultColor.b;
    
    nodePositions.push(new THREE.Vector3(x, y, z));
    steps[i] = Math.random() * Math.PI * 2;
  }
  
  const conns: number[] = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const distance = nodePositions[i].distanceTo(nodePositions[j]);
      if (distance < connectionDistance) {
        conns.push(
          nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
          nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
        );
      }
    }
  }
  
  return { 
    positions: pos, 
    basePositions: basePos, 
    stepData: steps, 
    connections: new Float32Array(conns),
    colors: cols
  };
}

/**
 * Integrate a particle into the network
 */
export function integrateParticle(
  position: THREE.Vector3,
  startScale: number,
  nodeStatesRef: React.MutableRefObject<Array<NodeData>>,
  basePositions: Float32Array,
  createNodeFn: (nodeIdx: number, basePositions: Float32Array, position?: THREE.Vector3, startScale?: number) => void,
  config: typeof NETWORK_CONFIG,
  onNodeIntegration?: () => void
): number {
  for (let i = 0; i < config.nodeCount; i++) {
    const nodeState = nodeStatesRef.current[i];
    if (!nodeState || !nodeState.alive) {
      createNodeFn(i, basePositions, position, startScale);
      onNodeIntegration?.();
      return i;
    }
  }
  return -1;
}
