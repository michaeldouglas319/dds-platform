'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// ─── Config ─────────────────────────────────────────────────────
const GRAVITY = -15;
const RESTITUTION = 0.55;
const FRICTION = 0.985;
const GROUND_Y = -3;
const WALL_BOUNDS = 12;
const CEILING_Y = 15;
const SPAWN_INTERVAL = 300; // ms between spawns
const MAX_BODIES = 120;
const MOUSE_FORCE = 8;
const MOUSE_RADIUS = 3;

const SHAPE_TYPES = ['box', 'sphere', 'octahedron', 'torus', 'cone', 'dodecahedron', 'cylinder'] as const;

const COLORS = [
  '#8b5cf6', '#ec4899', '#06b6d4', '#22c55e', '#f59e0b',
  '#3b82f6', '#ef4444', '#a855f7', '#14b8a6', '#f97316',
  '#6366f1', '#d946ef', '#0ea5e9', '#84cc16', '#e879f9',
];

// Spawn sources — multiple emitters across the top
const SPAWN_SOURCES = [
  { x: -6, z: -2 },
  { x: -2, z: 1 },
  { x: 2, z: -1 },
  { x: 6, z: 2 },
  { x: 0, z: -3 },
  { x: -4, z: 3 },
  { x: 4, z: -2 },
];

interface PhysicsBody {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  radius: number; // bounding sphere radius
  mass: number;
  restitution: number;
}

export default function PlaygroundPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, worldX: 0, worldY: 0 });
  const bodiesRef = useRef<PhysicsBody[]>([]);
  const lastSpawnRef = useRef(0);
  const spawnIndexRef = useRef(0);

  const initScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.04);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 4, 16);
    camera.lookAt(0, 0, 0);

    // ─── Lights ───────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(8, 12, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    mainLight.shadow.bias = -0.001;
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0x8b5cf6, 1.5, 30);
    fillLight.position.set(-6, 8, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x06b6d4, 1, 25);
    rimLight.position.set(6, 3, -8);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(0xec4899, 0.8, 20);
    accentLight.position.set(0, 10, 8);
    scene.add(accentLight);

    // ─── Ground Plane ─────────────────────────────────────────
    const groundGeom = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a1a,
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = GROUND_Y;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid lines on ground
    const gridHelper = new THREE.GridHelper(30, 30, 0x1a1a3e, 0x0d0d20);
    gridHelper.position.y = GROUND_Y + 0.01;
    scene.add(gridHelper);

    // ─── Spawn Emitter Indicators ─────────────────────────────
    SPAWN_SOURCES.forEach((src) => {
      const ringGeom = new THREE.RingGeometry(0.2, 0.35, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.set(src.x, CEILING_Y - 5, src.z);
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);
    });

    // ─── Geometry Cache ───────────────────────────────────────
    const geometries: Record<string, THREE.BufferGeometry> = {
      box: new THREE.BoxGeometry(0.6, 0.6, 0.6),
      sphere: new THREE.SphereGeometry(0.35, 16, 16),
      octahedron: new THREE.OctahedronGeometry(0.4),
      torus: new THREE.TorusGeometry(0.3, 0.12, 12, 24),
      cone: new THREE.ConeGeometry(0.35, 0.7, 8),
      dodecahedron: new THREE.DodecahedronGeometry(0.35),
      cylinder: new THREE.CylinderGeometry(0.25, 0.25, 0.6, 12),
    };

    // ─── Spawn Function ───────────────────────────────────────
    function spawnBody() {
      if (bodiesRef.current.length >= MAX_BODIES) {
        // Remove oldest
        const oldest = bodiesRef.current.shift()!;
        scene.remove(oldest.mesh);
        oldest.mesh.geometry.dispose();
        (oldest.mesh.material as THREE.Material).dispose();
      }

      const source = SPAWN_SOURCES[spawnIndexRef.current % SPAWN_SOURCES.length];
      spawnIndexRef.current++;

      const shapeType = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
      const colorHex = COLORS[Math.floor(Math.random() * COLORS.length)];
      const color = new THREE.Color(colorHex);

      const scale = 0.7 + Math.random() * 0.8;
      const geometry = geometries[shapeType].clone();

      const material = new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.15,
        metalness: 0.3 + Math.random() * 0.4,
        roughness: 0.1 + Math.random() * 0.3,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.92,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.setScalar(scale);
      mesh.position.set(
        source.x + (Math.random() - 0.5) * 2,
        CEILING_Y - 5 + Math.random() * 3,
        source.z + (Math.random() - 0.5) * 2
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      const radius = 0.4 * scale;

      bodiesRef.current.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          -Math.random() * 3,
          (Math.random() - 0.5) * 2
        ),
        angularVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3
        ),
        radius,
        mass: scale * scale,
        restitution: RESTITUTION + (Math.random() - 0.5) * 0.2,
      });
    }

    // ─── Physics Step ─────────────────────────────────────────
    function physicsStep(dt: number) {
      const bodies = bodiesRef.current;
      const mx = mouseRef.current.worldX;
      const my = mouseRef.current.worldY;

      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const pos = b.mesh.position;

        // Gravity
        b.velocity.y += GRAVITY * dt;

        // Mouse force
        const dx = pos.x - mx;
        const dy = pos.y - my;
        const distSq = dx * dx + dy * dy;
        if (distSq < MOUSE_RADIUS * MOUSE_RADIUS && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const force = MOUSE_FORCE * (1 - dist / MOUSE_RADIUS) / dist;
          b.velocity.x += dx * force * dt;
          b.velocity.y += dy * force * dt;
          // Add spin from mouse push
          b.angularVelocity.x += dy * force * dt * 2;
          b.angularVelocity.z -= dx * force * dt * 2;
        }

        // Ground collision
        if (pos.y - b.radius < GROUND_Y) {
          pos.y = GROUND_Y + b.radius;
          b.velocity.y = -b.velocity.y * b.restitution;
          b.velocity.x *= FRICTION;
          b.velocity.z *= FRICTION;
          b.angularVelocity.multiplyScalar(0.95);

          // Rolling from velocity
          b.angularVelocity.x += b.velocity.z * 0.5;
          b.angularVelocity.z -= b.velocity.x * 0.5;
        }

        // Wall bounds
        if (pos.x < -WALL_BOUNDS) { pos.x = -WALL_BOUNDS; b.velocity.x = Math.abs(b.velocity.x) * b.restitution; }
        if (pos.x > WALL_BOUNDS) { pos.x = WALL_BOUNDS; b.velocity.x = -Math.abs(b.velocity.x) * b.restitution; }
        if (pos.z < -WALL_BOUNDS) { pos.z = -WALL_BOUNDS; b.velocity.z = Math.abs(b.velocity.z) * b.restitution; }
        if (pos.z > WALL_BOUNDS) { pos.z = WALL_BOUNDS; b.velocity.z = -Math.abs(b.velocity.z) * b.restitution; }

        // Body-body collision
        for (let j = i + 1; j < bodies.length; j++) {
          const b2 = bodies[j];
          const cx = pos.x - b2.mesh.position.x;
          const cy = pos.y - b2.mesh.position.y;
          const cz = pos.z - b2.mesh.position.z;
          const cdist = Math.sqrt(cx * cx + cy * cy + cz * cz);
          const minDist = b.radius + b2.radius;

          if (cdist < minDist && cdist > 0.001) {
            // Separate
            const overlap = (minDist - cdist) * 0.5;
            const nx = cx / cdist;
            const ny = cy / cdist;
            const nz = cz / cdist;

            pos.x += nx * overlap;
            pos.y += ny * overlap;
            pos.z += nz * overlap;
            b2.mesh.position.x -= nx * overlap;
            b2.mesh.position.y -= ny * overlap;
            b2.mesh.position.z -= nz * overlap;

            // Velocity exchange (elastic)
            const totalMass = b.mass + b2.mass;
            const relVelX = b.velocity.x - b2.velocity.x;
            const relVelY = b.velocity.y - b2.velocity.y;
            const relVelZ = b.velocity.z - b2.velocity.z;
            const relDot = relVelX * nx + relVelY * ny + relVelZ * nz;

            if (relDot > 0) continue; // separating

            const impulse = -(1 + RESTITUTION) * relDot / totalMass;

            b.velocity.x += impulse * b2.mass * nx;
            b.velocity.y += impulse * b2.mass * ny;
            b.velocity.z += impulse * b2.mass * nz;
            b2.velocity.x -= impulse * b.mass * nx;
            b2.velocity.y -= impulse * b.mass * ny;
            b2.velocity.z -= impulse * b.mass * nz;

            // Collision spin
            b.angularVelocity.x += ny * impulse * 0.5;
            b.angularVelocity.z -= nx * impulse * 0.5;
            b2.angularVelocity.x -= ny * impulse * 0.5;
            b2.angularVelocity.z += nx * impulse * 0.5;
          }
        }

        // Air damping
        b.velocity.multiplyScalar(0.999);
        b.angularVelocity.multiplyScalar(0.997);

        // Integrate
        pos.x += b.velocity.x * dt;
        pos.y += b.velocity.y * dt;
        pos.z += b.velocity.z * dt;

        b.mesh.rotation.x += b.angularVelocity.x * dt;
        b.mesh.rotation.y += b.angularVelocity.y * dt;
        b.mesh.rotation.z += b.angularVelocity.z * dt;

        // Emissive pulse based on velocity
        const speed = b.velocity.length();
        const mat = b.mesh.material as THREE.MeshPhysicalMaterial;
        mat.emissiveIntensity = 0.1 + Math.min(speed * 0.05, 0.6);
      }
    }

    // ─── Animation Loop ───────────────────────────────────────
    const clock = new THREE.Clock();

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.033); // cap at 30fps step
      const elapsed = clock.getElapsedTime();

      // Spawn new shapes
      if (elapsed * 1000 - lastSpawnRef.current > SPAWN_INTERVAL) {
        lastSpawnRef.current = elapsed * 1000;
        spawnBody();
      }

      physicsStep(dt);

      // Animate lights
      fillLight.position.x = Math.sin(elapsed * 0.3) * 8;
      fillLight.position.z = Math.cos(elapsed * 0.2) * 6;
      rimLight.position.x = Math.cos(elapsed * 0.4) * 7;
      accentLight.position.y = 8 + Math.sin(elapsed * 0.5) * 3;

      // Camera gentle orbit
      const camAngle = elapsed * 0.05;
      camera.position.x = Math.sin(camAngle) * 2 + mouseRef.current.x * 2;
      camera.position.y = 4 + mouseRef.current.y * 1.5;
      camera.lookAt(0, 1, 0);

      renderer.render(scene, camera);
    }

    animate();

    // ─── Events ───────────────────────────────────────────────
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function handleMouse(e: MouseEvent) {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      // Project to world space (approximate on xz plane at y=1)
      mouseRef.current.worldX = mouseRef.current.x * 10;
      mouseRef.current.worldY = GROUND_Y + 2 + mouseRef.current.y * 6;
    }

    function handleTouch(e: TouchEvent) {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1;
        mouseRef.current.worldX = mouseRef.current.x * 10;
        mouseRef.current.worldY = GROUND_Y + 2 + mouseRef.current.y * 6;
      }
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('touchmove', handleTouch, { passive: true });

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('touchmove', handleTouch);
      bodiesRef.current = [];
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#050510' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* Overlay UI */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 3rem)',
          fontWeight: 800,
          color: 'white',
          letterSpacing: '-0.03em',
          margin: 0,
          textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        }}>
          <span style={{ opacity: 0.3, fontWeight: 300, fontSize: '0.5em' }}>The </span>
          <span style={{ opacity: 0.5, fontWeight: 400 }}>Age of </span>
          <span style={{
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Abundance</span>
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.85rem',
          marginTop: '0.5rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Physics Playground — Move your cursor to interact
        </p>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1rem',
        zIndex: 1,
      }}>
        <a href="/" style={{
          padding: '0.6rem 1.5rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'white',
          textDecoration: 'none',
          fontSize: '0.85rem',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.05)',
        }}>
          ← Home
        </a>
        <a href="/vision" style={{
          padding: '0.6rem 1.5rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'white',
          textDecoration: 'none',
          fontSize: '0.85rem',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.05)',
        }}>
          Vision →
        </a>
      </div>
    </div>
  );
}
