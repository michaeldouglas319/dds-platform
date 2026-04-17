'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { GraphNode, GraphEdge } from '../../graph-utils/types';
import { useGraphView } from '../../graph-utils/context';
import styles from './force-graph-view.module.css';

interface ForceGraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  containerRef: React.RefObject<HTMLDivElement>;
}

interface NodePhysics {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  mass: number;
  pinned: boolean;
}

/**
 * Force-directed graph simulation using Verlet integration
 * Each node is treated as a particle with mass
 * Connected nodes attract, all nodes repel
 */
export const ForceGraphCanvas: React.FC<ForceGraphCanvasProps> = ({
  nodes,
  edges,
  containerRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeMapRef = useRef<Map<string, NodePhysics>>(new Map());
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const { state, selectNode, setHovered } = useGraphView();

  // Physics parameters
  const REPULSION = 100;
  const ATTRACTION = 0.1;
  const DAMPING = 0.95;
  const TIME_STEP = 0.016;
  const MAX_VELOCITY = 10;

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Initialize Three.js scene
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.z = 300;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    // Initialize node physics
    nodes.forEach((node) => {
      nodeMapRef.current.set(node.id, {
        id: node.id,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        z: Math.random() * 200 - 100,
        vx: 0,
        vy: 0,
        vz: 0,
        mass: 1,
        pinned: false,
      });
    });

    // Create node geometries
    const nodeGeometry = new THREE.SphereGeometry(5, 8, 8);
    const nodeMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });

    nodes.forEach((node) => {
      const physics = nodeMapRef.current.get(node.id);
      if (!physics) return;

      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      mesh.position.set(physics.x, physics.y, physics.z);
      mesh.userData = { nodeId: node.id };
      scene.add(mesh);
    });

    // Create edge lines
    const edgeGeometry = new THREE.BufferGeometry();
    const edgePositions: number[] = [];

    edges.forEach((edge) => {
      const fromPhysics = nodeMapRef.current.get(edge.source);
      const toPhysics = nodeMapRef.current.get(edge.target);
      if (!fromPhysics || !toPhysics) return;

      edgePositions.push(fromPhysics.x, fromPhysics.y, fromPhysics.z);
      edgePositions.push(toPhysics.x, toPhysics.y, toPhysics.z);
    });

    edgeGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(edgePositions), 3)
    );

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xd1d5db,
      transparent: true,
      opacity: 0.5,
    });
    const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    scene.add(edgeLines);

    // Animation loop
    let animationFrameId: number;
    let iterationCount = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Physics simulation (run every other frame to save computation)
      if (iterationCount % 2 === 0) {
        // Apply forces
        const nodeArray = Array.from(nodeMapRef.current.values());

        nodeArray.forEach((node) => {
          if (node.pinned) return;

          // Repulsion from all other nodes
          nodeArray.forEach((other) => {
            if (node.id === other.id) return;

            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dz = node.z - other.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist > 0.1) {
              const force = REPULSION / (dist * dist);
              node.vx += (dx / dist) * force;
              node.vy += (dy / dist) * force;
              node.vz += (dz / dist) * force;
            }
          });

          // Attraction along edges
          edges.forEach((edge) => {
            if (
              (edge.source === node.id && edge.target === nodeArray[0].id) ||
              (edge.target === node.id && edge.source === nodeArray[0].id)
            ) {
              const other = nodeMapRef.current.get(
                edge.source === node.id ? edge.target : edge.source
              );
              if (!other) return;

              const dx = other.x - node.x;
              const dy = other.y - node.y;
              const dz = other.z - node.z;
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

              if (dist > 0.1) {
                const force = ATTRACTION * dist;
                node.vx += (dx / dist) * force;
                node.vy += (dy / dist) * force;
                node.vz += (dz / dist) * force;
              }
            }
          });

          // Damping and velocity limit
          node.vx *= DAMPING;
          node.vy *= DAMPING;
          node.vz *= DAMPING;

          const vel = Math.sqrt(node.vx ** 2 + node.vy ** 2 + node.vz ** 2);
          if (vel > MAX_VELOCITY) {
            const scale = MAX_VELOCITY / vel;
            node.vx *= scale;
            node.vy *= scale;
            node.vz *= scale;
          }

          // Update position
          node.x += node.vx * TIME_STEP;
          node.y += node.vy * TIME_STEP;
          node.z += node.vz * TIME_STEP;
        });
      }

      // Update node meshes
      scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.userData.nodeId) {
          const physics = nodeMapRef.current.get(child.userData.nodeId);
          if (physics) {
            child.position.set(physics.x, physics.y, physics.z);
          }
        }
      });

      // Update edge positions
      if (edgeLines && edgeGeometry.attributes.position) {
        const positions = edgeGeometry.attributes.position.array as Float32Array;
        let idx = 0;

        edges.forEach((edge) => {
          const fromPhysics = nodeMapRef.current.get(edge.source);
          const toPhysics = nodeMapRef.current.get(edge.target);
          if (!fromPhysics || !toPhysics) return;

          positions[idx++] = fromPhysics.x;
          positions[idx++] = fromPhysics.y;
          positions[idx++] = fromPhysics.z;
          positions[idx++] = toPhysics.x;
          positions[idx++] = toPhysics.y;
          positions[idx++] = toPhysics.z;
        });

        edgeGeometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      iterationCount++;
    };

    animate();

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

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [nodes, edges]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      role="img"
      aria-label="Force-directed graph visualization"
    />
  );
};
