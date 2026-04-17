'use client';

/**
 * LayerVisualization - Three.js based 3D layered universe visualization
 *
 * Renders nodes in horizontal layers based on type, with interactive
 * selection, keyboard navigation, and subtle animation.
 *
 * @module @dds/renderer/lib/graph-views/layered-universe-view/LayerVisualization
 */

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import type { GraphNode, GraphEdge } from '../../graph-utils/types';
import { useGraphView } from '../../graph-utils/context';

// ─── Types ────────────────────────────────────────────────────────

export type NodeType = 'entry' | 'signal' | 'person' | 'organization' | 'concept' | 'event';

export interface LayerVisualizationProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  containerRef: React.RefObject<HTMLDivElement>;
}

// ─── Constants ─────────────────────────────────────────────────────

const NODE_TYPES: NodeType[] = ['entry', 'signal', 'person', 'organization', 'concept', 'event'];

const LAYER_COLORS: Record<NodeType, number> = {
  entry: 0x3b82f6,        // blue
  signal: 0xef4444,       // red
  person: 0x8b5cf6,       // purple
  organization: 0x059669, // teal
  concept: 0xf59e0b,      // amber
  event: 0xec4899,        // pink
};

const LAYER_SPACING = 200;
const NODES_PER_ROW = 8;
const NODE_RADIUS = 15;
const NODE_SEGMENTS = 32;

// ─── Helper Functions ─────────────────────────────────────────────

/**
 * Group nodes by type
 */
function groupNodesByType(nodes: GraphNode[]): Record<NodeType, GraphNode[]> {
  const groups: Record<NodeType, GraphNode[]> = {
    entry: [],
    signal: [],
    person: [],
    organization: [],
    concept: [],
    event: [],
  };

  nodes.forEach((node) => {
    const type = node.type as NodeType;
    if (type in groups) {
      groups[type].push(node);
    }
  });

  return groups;
}

/**
 * Calculate world position for a node in a layer
 */
function calculateNodePosition(
  nodeIndex: number,
  layerIndex: number,
  nodeCount: number
): THREE.Vector3 {
  const rowIndex = Math.floor(nodeIndex / NODES_PER_ROW);
  const colIndex = nodeIndex % NODES_PER_ROW;

  const x = colIndex * 80 - (NODES_PER_ROW * 80) / 2;
  const y = -rowIndex * 80;
  const z = layerIndex * LAYER_SPACING;

  return new THREE.Vector3(x, y, z);
}

// ─── Main Component ───────────────────────────────────────────────

export const LayerVisualization: React.FC<LayerVisualizationProps> = ({
  nodes,
  edges,
  containerRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeGroupRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const { selectNode } = useGraphView();

  // Group nodes by type
  const nodesByType = useMemo(() => groupNodesByType(nodes), [nodes]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    // Camera setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.set(0, 0, 600);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    // Create layers and nodes
    let layerIndex = 0;
    NODE_TYPES.forEach((nodeType) => {
      const typeNodes = nodesByType[nodeType];
      if (typeNodes.length === 0) return;

      // Layer background plane
      const planeGeometry = new THREE.PlaneGeometry(1200, 400);
      const planeMaterial = new THREE.MeshStandardMaterial({
        color: LAYER_COLORS[nodeType],
        metalness: 0.3,
        roughness: 0.7,
        transparent: true,
        opacity: 0.1,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.position.z = layerIndex * LAYER_SPACING;
      scene.add(plane);

      // Layer label as text
      const canvas_label = document.createElement('canvas');
      const ctx = canvas_label.getContext('2d');
      if (ctx) {
        canvas_label.width = 512;
        canvas_label.height = 128;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(nodeType.toUpperCase(), 256, 64);

        const texture = new THREE.CanvasTexture(canvas_label);
        const labelMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const labelGeometry = new THREE.PlaneGeometry(300, 75);
        const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
        labelMesh.position.set(-500, 150, layerIndex * LAYER_SPACING + 10);
        scene.add(labelMesh);
      }

      // Create node meshes
      typeNodes.forEach((node, nodeIndex) => {
        const position = calculateNodePosition(nodeIndex, layerIndex, typeNodes.length);

        const geometry = new THREE.IcosahedronGeometry(NODE_RADIUS, NODE_SEGMENTS);
        const material = new THREE.MeshStandardMaterial({
          color: LAYER_COLORS[nodeType],
          metalness: 0.6,
          roughness: 0.4,
          emissive: LAYER_COLORS[nodeType],
          emissiveIntensity: 0.2,
        });
        const nodeMesh = new THREE.Mesh(geometry, material);
        nodeMesh.position.copy(position);
        nodeMesh.userData = { nodeId: node.id, nodeType, nodeLabel: node.label };

        scene.add(nodeMesh);
        nodeGroupRef.current.set(node.id, nodeMesh);
      });

      layerIndex++;
    });

    // Create edge connections
    const edgePositions: number[] = [];
    edges.forEach((edge) => {
      const sourceNode = nodeGroupRef.current.get(edge.source);
      const targetNode = nodeGroupRef.current.get(edge.target);

      if (sourceNode && targetNode) {
        edgePositions.push(
          sourceNode.position.x,
          sourceNode.position.y,
          sourceNode.position.z,
          targetNode.position.x,
          targetNode.position.y,
          targetNode.position.z
        );
      }
    });

    if (edgePositions.length > 0) {
      const edgeGeometry = new THREE.BufferGeometry();
      edgeGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edgePositions), 3));
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: 0x64748b,
        transparent: true,
        opacity: 0.3,
        linewidth: 1,
      });
      const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      scene.add(edgeLines);
    }

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Handle mouse click for node selection
    const handleCanvasClick = (event: MouseEvent) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        scene.children.filter((child) => child instanceof THREE.Mesh && child.userData.nodeId)
      );

      if (intersects.length > 0) {
        const intersected = intersects[0].object as THREE.Mesh;
        const { nodeId, nodeType } = intersected.userData;
        selectNode(nodeId, nodeType);
      }
    };

    canvasRef.current.addEventListener('click', handleCanvasClick);

    // Handle keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      const speed = 10;
      switch (event.key) {
        case 'ArrowLeft':
          camera.position.x -= speed;
          break;
        case 'ArrowRight':
          camera.position.x += speed;
          break;
        case 'ArrowUp':
          camera.position.y += speed;
          break;
        case 'ArrowDown':
          camera.position.y -= speed;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Subtle scene rotation
      scene.rotation.x += 0.00005;
      scene.rotation.y += 0.0001;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      canvasRef.current?.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [nodes, edges, selectNode, containerRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default LayerVisualization;
