'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import type { GraphNode, GraphEdge } from '../../graph-utils/types';
import { useGraphView } from '../../graph-utils/context';

// ─── Constants ─────────────────────────────────────────────────────────

const GLOBE_RADIUS = 150;
const NODE_RADIUS = 3;
const AUTO_ROTATE_SPEED = 0.0002;

// ─── Helper Functions ─────────────────────────────────────────────────

/**
 * Generate deterministic latitude and longitude from node ID using hash.
 * Returns values in range: lat [-90, 90], lon [-180, 180]
 */
function nodeToLatLong(nodeId: string): { lat: number; lon: number } {
  // Simple hash function for deterministic positioning
  let hash = 0;
  for (let i = 0; i < nodeId.length; i++) {
    const char = nodeId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate lat/lon from hash
  const absHash = Math.abs(hash);
  const latHash = (absHash % 18000) / 100; // 0 to 180, scaled by 100
  const lonHash = ((absHash * 7919) % 36000) / 100; // 0 to 360, scaled by 100

  const lat = latHash - 90; // -90 to 90
  const lon = lonHash - 180; // -180 to 180

  return { lat, lon };
}

/**
 * Convert latitude/longitude to 3D position on sphere surface.
 * Uses spherical to Cartesian conversion.
 */
function latLongToVector3(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  // Convert to radians
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  // Spherical to Cartesian conversion
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  return new THREE.Vector3(x, y, z);
}

// ─── Component Props ────────────────────────────────────────────────────

export interface GlobeCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  containerRef: React.RefObject<HTMLDivElement>;
}

// ─── GlobeCanvas Component ──────────────────────────────────────────────

/**
 * GlobeCanvas - 3D Globe visualization with lat/long node positioning
 *
 * Renders a 3D sphere with nodes positioned deterministically based on their IDs,
 * edges connecting related nodes, and interactive controls (mouse rotation,
 * keyboard navigation, auto-rotation).
 *
 * @example
 * ```tsx
 * <GlobeCanvas
 *   nodes={nodes}
 *   edges={edges}
 *   containerRef={containerRef}
 * />
 * ```
 */
export const GlobeCanvas: React.FC<GlobeCanvasProps> = ({
  nodes,
  edges,
  containerRef,
}) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const nodesGroupRef = useRef<THREE.Group | null>(null);
  const edgesGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2 | null>(null);
  const nodeObjectsRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const animationIdRef = useRef<number | null>(null);

  const { selectNode } = useGraphView();

  // Keyboard state for rotation control
  const keysRef = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  // ─── Initialize Scene ───────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      10000
    );
    camera.position.z = GLOBE_RADIUS * 2;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup raycaster for mouse picking
    raycasterRef.current = new THREE.Raycaster();
    mouseRef.current = new THREE.Vector2();

    // ─── Create Globe ───────────────────────────────────────────────

    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 32, 32);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a2f5a,
      emissive: 0x0a1929,
      shininess: 5,
      wireframe: false,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeRef.current = globe;
    scene.add(globe);

    // ─── Add Grid Lines ─────────────────────────────────────────────

    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x1e3a5f,
      linewidth: 1,
    });

    // Latitude lines
    for (let lat = -90; lat <= 90; lat += 30) {
      const latRad = (lat * Math.PI) / 180;
      const points: THREE.Vector3[] = [];
      for (let lon = -180; lon <= 180; lon += 10) {
        const pos = latLongToVector3(lat, lon, GLOBE_RADIUS);
        points.push(pos);
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, gridMaterial);
      globe.add(line);
    }

    // Longitude lines
    for (let lon = -180; lon <= 180; lon += 30) {
      const points: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 10) {
        const pos = latLongToVector3(lat, lon, GLOBE_RADIUS);
        points.push(pos);
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, gridMaterial);
      globe.add(line);
    }

    // ─── Create Node and Edge Groups ────────────────────────────────

    const nodesGroup = new THREE.Group();
    nodesGroupRef.current = nodesGroup;
    scene.add(nodesGroup);

    const edgesGroup = new THREE.Group();
    edgesGroupRef.current = edgesGroup;
    scene.add(edgesGroup);

    // ─── Add Lighting ───────────────────────────────────────────────

    // Directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(500, 300, 500);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x505050);
    scene.add(ambientLight);

    // Hemisphere light
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x000000, 0.4);
    scene.add(hemiLight);

    // ─── Handle Window Resize ───────────────────────────────────────

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // ─── Cleanup ─────────────────────────────────────────────────────

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      globeGeometry.dispose();
      globeMaterial.dispose();
      gridMaterial.dispose();
      renderer.dispose();
    };
  }, [containerRef]);

  // ─── Render Nodes ───────────────────────────────────────────────────

  useEffect(() => {
    if (!nodesGroupRef.current) return;

    // Clear existing nodes
    while (nodesGroupRef.current.children.length > 0) {
      nodesGroupRef.current.removeChild(nodesGroupRef.current.children[0]);
    }
    nodeObjectsRef.current.clear();

    // Create node meshes
    const nodeMaterial = new THREE.MeshPhongMaterial({
      emissive: 0x4a9eff,
      shininess: 10,
    });

    nodes.forEach((node) => {
      const { lat, lon } = nodeToLatLong(node.id);
      const position = latLongToVector3(lat, lon, GLOBE_RADIUS);

      // Create node sphere
      const nodeGeometry = new THREE.SphereGeometry(NODE_RADIUS, 16, 16);
      const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      nodeMesh.position.copy(position);

      // Store reference for raycasting
      nodeObjectsRef.current.set(node.id, nodeMesh);

      nodesGroupRef.current!.add(nodeMesh);
    });
  }, [nodes]);

  // ─── Render Edges ───────────────────────────────────────────────────

  useEffect(() => {
    if (!edgesGroupRef.current) return;

    // Clear existing edges
    while (edgesGroupRef.current.children.length > 0) {
      edgesGroupRef.current.removeChild(edgesGroupRef.current.children[0]);
    }

    // Create edge curves
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x4a7f9e,
      linewidth: 1,
      transparent: true,
      opacity: 0.6,
    });

    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return;

      const { lat: sourceLat, lon: sourceLon } = nodeToLatLong(
        sourceNode.id
      );
      const { lat: targetLat, lon: targetLon } = nodeToLatLong(
        targetNode.id
      );

      const sourcePos = latLongToVector3(
        sourceLat,
        sourceLon,
        GLOBE_RADIUS
      );
      const targetPos = latLongToVector3(
        targetLat,
        targetLon,
        GLOBE_RADIUS
      );

      // Create a curve between nodes via globe center
      const curve = new THREE.CatmullRomCurve3([
        sourcePos,
        sourcePos
          .clone()
          .lerp(new THREE.Vector3(0, 0, 0), 0.5)
          .normalize()
          .multiplyScalar(GLOBE_RADIUS * 1.2),
        targetPos
          .clone()
          .lerp(new THREE.Vector3(0, 0, 0), 0.5)
          .normalize()
          .multiplyScalar(GLOBE_RADIUS * 1.2),
        targetPos,
      ]);

      const points = curve.getPoints(32);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, edgeMaterial);

      edgesGroupRef.current!.add(line);
    });
  }, [nodes, edges]);

  // ─── Mouse Interaction ───────────────────────────────────────────────

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!containerRef.current || !mouseRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [containerRef]
  );

  const handleMouseClick = useCallback(
    (event: MouseEvent) => {
      if (
        !raycasterRef.current ||
        !cameraRef.current ||
        !mouseRef.current ||
        !containerRef.current
      ) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      mouseRef.current.x = x;
      mouseRef.current.y = y;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      const nodeArray = Array.from(nodeObjectsRef.current.values());
      const intersects = raycasterRef.current.intersectObjects(nodeArray);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const nodeId = Array.from(nodeObjectsRef.current.entries()).find(
          ([, mesh]) => mesh === clickedMesh
        )?.[0];

        if (nodeId) {
          const node = nodes.find((n) => n.id === nodeId);
          if (node) {
            selectNode(nodeId, node.type);
          }
        }
      }
    },
    [nodes, selectNode, containerRef]
  );

  // ─── Keyboard Interaction ───────────────────────────────────────────

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight'
      ) {
        keysRef.current[event.key] = true;
        event.preventDefault();
      }
    },
    []
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight'
      ) {
        keysRef.current[event.key] = false;
        event.preventDefault();
      }
    },
    []
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      containerRef.current.addEventListener('click', handleMouseClick);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleMouseClick);
      }

      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleMouseMove, handleMouseClick, handleKeyDown, handleKeyUp, containerRef]);

  // ─── Animation Loop ─────────────────────────────────────────────────

  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) {
      return;
    }

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const globe = globeRef.current;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Auto-rotate globe
      if (globe) {
        globe.rotation.y += AUTO_ROTATE_SPEED;
      }

      // Keyboard rotation control
      if (globe) {
        const rotationSpeed = 0.02;
        if (keysRef.current.ArrowUp) {
          globe.rotation.x -= rotationSpeed;
        }
        if (keysRef.current.ArrowDown) {
          globe.rotation.x += rotationSpeed;
        }
        if (keysRef.current.ArrowLeft) {
          globe.rotation.y -= rotationSpeed;
        }
        if (keysRef.current.ArrowRight) {
          globe.rotation.y += rotationSpeed;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return null;
};

export default GlobeCanvas;
