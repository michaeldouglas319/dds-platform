'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// ─── Constants ──────────────────────────────────────────────────
const PARTICLE_COUNT = 3000;
const SPHERE_COUNT = 14;
const MOUSE_INFLUENCE = 2.5;
const RETURN_SPEED = 0.02;
const CONNECTION_DISTANCE = 1.8;
const MAX_CONNECTIONS = 800;

const VENTURES = [
  { label: '.ai', color: '#8b5cf6', size: 0.35 },
  { label: '.shop', color: '#ec4899', size: 0.28 },
  { label: '.art', color: '#f59e0b', size: 0.28 },
  { label: '.wiki', color: '#22c55e', size: 0.28 },
  { label: '.dev', color: '#06b6d4', size: 0.28 },
  { label: '.app', color: '#3b82f6', size: 0.28 },
  { label: '.space', color: '#a855f7', size: 0.28 },
  { label: '.tech', color: '#ef4444', size: 0.28 },
  { label: '.net', color: '#14b8a6', size: 0.28 },
  { label: '.asia', color: '#f97316', size: 0.25 },
  { label: '.online', color: '#6366f1', size: 0.25 },
  { label: '.site', color: '#84cc16', size: 0.25 },
  { label: '.org', color: '#d946ef', size: 0.25 },
  { label: '.wiki', color: '#0ea5e9', size: 0.25 },
];

const PITCH_LINES = [
  'Intelligence amplified.',
  'Abundance realized.',
  '16 domains. One platform.',
  'Zero artificial scarcity.',
];

// ─── Easing ─────────────────────────────────────────────────────
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

// ─── Simplex-like noise (fast 3D hash) ──────────────────────────
function noise3D(x: number, y: number, z: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

export default function VisionPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const hoveredSphereRef = useRef<number>(-1);
  const frameRef = useRef(0);

  const initScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.08);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // ─── Lights ───────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x8b5cf6, 2, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 1.5, 20);
    pointLight2.position.set(-5, -3, 3);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xec4899, 1, 15);
    pointLight3.position.set(0, 5, -5);
    scene.add(pointLight3);

    // ─── Particle Field ───────────────────────────────────────
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const originalPositions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 5;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;

      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        colors[i * 3] = 0.55; colors[i * 3 + 1] = 0.36; colors[i * 3 + 2] = 0.96;
      } else if (colorChoice < 0.6) {
        colors[i * 3] = 0.02; colors[i * 3 + 1] = 0.71; colors[i * 3 + 2] = 0.83;
      } else {
        colors[i * 3] = 0.93; colors[i * 3 + 1] = 0.28; colors[i * 3 + 2] = 0.6;
      }

      sizes[i] = Math.random() * 3 + 1;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          float dist = -mvPos.z;
          vAlpha = smoothstep(12.0, 2.0, dist) * 0.8;
          gl_PointSize = size * uPixelRatio * (4.0 / dist);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float glow = exp(-d * 6.0);
          gl_FragColor = vec4(vColor * (1.0 + glow * 0.5), vAlpha * glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ─── Connection Lines ─────────────────────────────────────
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(MAX_CONNECTIONS * 6);
    const lineColors = new Float32Array(MAX_CONNECTIONS * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // ─── Venture Spheres ──────────────────────────────────────
    const spheres: THREE.Mesh[] = [];
    const sphereVelocities: THREE.Vector3[] = [];
    const sphereOriginalPositions: THREE.Vector3[] = [];

    VENTURES.forEach((venture, i) => {
      const angle = (i / VENTURES.length) * Math.PI * 2;
      const radius = i === 0 ? 0 : 2.2 + (i % 3) * 0.8;
      const y = (Math.random() - 0.5) * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      const geometry = new THREE.IcosahedronGeometry(venture.size, 2);
      const color = new THREE.Color(venture.color);
      const material = new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
        metalness: 0.4,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.9,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { venture, index: i };
      scene.add(mesh);
      spheres.push(mesh);
      sphereVelocities.push(new THREE.Vector3());
      sphereOriginalPositions.push(new THREE.Vector3(x, y, z));

      // Glow ring
      const ringGeometry = new THREE.RingGeometry(venture.size + 0.05, venture.size + 0.12, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.lookAt(camera.position);
      mesh.add(ring);
    });

    // ─── Raycaster for hover ──────────────────────────────────
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.1 };
    const mouseVec = new THREE.Vector2();

    // ─── Animation Loop ───────────────────────────────────────
    const clock = new THREE.Clock();
    let connectionCount = 0;

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = Math.min(clock.getDelta(), 0.05);

      particleMaterial.uniforms.uTime.value = elapsed;

      // Mouse → 3D
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseWorld = new THREE.Vector3(mx * 6, my * 4, 0);

      // ─── Particle Physics ─────────────────────────────────
      const posArr = particleGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        // Noise displacement
        const noiseX = noise3D(posArr[ix] * 0.3 + elapsed * 0.1, posArr[iy] * 0.3, posArr[iz] * 0.3) * 0.002;
        const noiseY = noise3D(posArr[ix] * 0.3, posArr[iy] * 0.3 + elapsed * 0.1, posArr[iz] * 0.3 + 100) * 0.002;
        const noiseZ = noise3D(posArr[ix] * 0.3 + 200, posArr[iy] * 0.3, posArr[iz] * 0.3 + elapsed * 0.1) * 0.002;

        velocities[ix] += noiseX;
        velocities[iy] += noiseY;
        velocities[iz] += noiseZ;

        // Mouse repulsion
        const dx = posArr[ix] - mouseWorld.x;
        const dy = posArr[iy] - mouseWorld.y;
        const dz = posArr[iz] - mouseWorld.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const influence = MOUSE_INFLUENCE / (distSq + 0.5);

        if (distSq < 9) {
          velocities[ix] += dx * influence * 0.01;
          velocities[iy] += dy * influence * 0.01;
          velocities[iz] += dz * influence * 0.01;
        }

        // Return to original
        velocities[ix] += (originalPositions[ix] - posArr[ix]) * RETURN_SPEED;
        velocities[iy] += (originalPositions[iy] - posArr[iy]) * RETURN_SPEED;
        velocities[iz] += (originalPositions[iz] - posArr[iz]) * RETURN_SPEED;

        // Damping
        velocities[ix] *= 0.95;
        velocities[iy] *= 0.95;
        velocities[iz] *= 0.95;

        posArr[ix] += velocities[ix];
        posArr[iy] += velocities[iy];
        posArr[iz] += velocities[iz];
      }

      particleGeometry.attributes.position.needsUpdate = true;

      // ─── Sphere Physics ───────────────────────────────────
      mouseVec.set(mx, my);
      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObjects(spheres);
      hoveredSphereRef.current = intersects.length > 0 ? (intersects[0].object as THREE.Mesh).userData.index : -1;

      spheres.forEach((sphere, i) => {
        const vel = sphereVelocities[i];
        const orig = sphereOriginalPositions[i];

        // Orbit motion
        const orbitSpeed = i === 0 ? 0.1 : 0.15 + i * 0.01;
        const angle = elapsed * orbitSpeed + (i * Math.PI * 2) / VENTURES.length;
        const radius = orig.length();

        if (i > 0) {
          const targetX = radius * Math.cos(angle);
          const targetZ = radius * Math.sin(angle);
          vel.x += (targetX - sphere.position.x) * 0.01;
          vel.z += (targetZ - sphere.position.z) * 0.01;
        }

        // Float
        vel.y += Math.sin(elapsed * 0.5 + i) * 0.001;
        vel.y += (orig.y - sphere.position.y) * 0.01;

        // Mouse attraction (spheres attract, not repel)
        const sdx = mouseWorld.x - sphere.position.x;
        const sdy = mouseWorld.y - sphere.position.y;
        const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
        if (sdist < 3) {
          const force = 0.003 * (1 - sdist / 3);
          vel.x += sdx * force;
          vel.y += sdy * force;
        }

        // Sphere-sphere repulsion
        spheres.forEach((other, j) => {
          if (i === j) return;
          const dx = sphere.position.x - other.position.x;
          const dy = sphere.position.y - other.position.y;
          const dz = sphere.position.z - other.position.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const minDist = VENTURES[i].size + VENTURES[j].size + 0.3;
          if (dist < minDist) {
            const force = (minDist - dist) * 0.05;
            vel.x += (dx / dist) * force;
            vel.y += (dy / dist) * force;
            vel.z += (dz / dist) * force;
          }
        });

        // Damping
        vel.multiplyScalar(0.92);
        sphere.position.add(vel);

        // Rotation
        sphere.rotation.x += 0.005 + i * 0.001;
        sphere.rotation.y += 0.008 + i * 0.001;

        // Hover glow
        const mat = sphere.material as THREE.MeshPhysicalMaterial;
        const isHovered = hoveredSphereRef.current === i;
        const targetEmissive = isHovered ? 0.8 : 0.3;
        mat.emissiveIntensity += (targetEmissive - mat.emissiveIntensity) * 0.1;
        const targetScale = isHovered ? 1.3 : 1.0;
        sphere.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        // Ring billboard
        if (sphere.children[0]) {
          sphere.children[0].lookAt(camera.position);
        }
      });

      // ─── Connection Lines ─────────────────────────────────
      connectionCount = 0;
      const lPos = lineGeometry.attributes.position.array as Float32Array;
      const lCol = lineGeometry.attributes.color.array as Float32Array;

      for (let i = 0; i < spheres.length && connectionCount < MAX_CONNECTIONS; i++) {
        for (let j = i + 1; j < spheres.length && connectionCount < MAX_CONNECTIONS; j++) {
          const dist = spheres[i].position.distanceTo(spheres[j].position);
          if (dist < CONNECTION_DISTANCE * 2) {
            const alpha = 1 - dist / (CONNECTION_DISTANCE * 2);
            const ci = connectionCount * 6;

            lPos[ci] = spheres[i].position.x;
            lPos[ci + 1] = spheres[i].position.y;
            lPos[ci + 2] = spheres[i].position.z;
            lPos[ci + 3] = spheres[j].position.x;
            lPos[ci + 4] = spheres[j].position.y;
            lPos[ci + 5] = spheres[j].position.z;

            const c1 = new THREE.Color(VENTURES[i].color);
            const c2 = new THREE.Color(VENTURES[j].color);
            lCol[ci] = c1.r * alpha;
            lCol[ci + 1] = c1.g * alpha;
            lCol[ci + 2] = c1.b * alpha;
            lCol[ci + 3] = c2.r * alpha;
            lCol[ci + 4] = c2.g * alpha;
            lCol[ci + 5] = c2.b * alpha;

            connectionCount++;
          }
        }
      }

      lineGeometry.setDrawRange(0, connectionCount * 2);
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      // ─── Camera sway ──────────────────────────────────────
      camera.position.x += (mx * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (my * 0.3 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      // ─── Light movement ───────────────────────────────────
      pointLight1.position.x = Math.sin(elapsed * 0.3) * 6;
      pointLight1.position.y = Math.cos(elapsed * 0.2) * 4;
      pointLight2.position.x = Math.cos(elapsed * 0.4) * 5;
      pointLight2.position.z = Math.sin(elapsed * 0.3) * 5;

      renderer.render(scene, camera);
    }

    animate();

    // ─── Resize ─────────────────────────────────────────────
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      particleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    }
    window.addEventListener('resize', handleResize);

    // ─── Mouse ──────────────────────────────────────────────
    function handleMouse(e: MouseEvent) {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener('mousemove', handleMouse);

    // ─── Touch ──────────────────────────────────────────────
    function handleTouch(e: TouchEvent) {
      if (e.touches.length > 0) {
        mouseRef.current.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    }
    window.addEventListener('touchmove', handleTouch, { passive: true });

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('touchmove', handleTouch);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, []);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  // ─── Scroll-driven text sections ──────────────────────────
  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      setScrollProgress(progress);
      setActiveSection(Math.min(Math.floor(progress * PITCH_LINES.length), PITCH_LINES.length - 1));
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} style={{ background: '#050510' }}>
      {/* Fixed Three.js Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
        }}
      />

      {/* Scroll sections overlaid on canvas */}
      <div style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
        {/* Hero — full viewport */}
        <section style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '2rem',
        }}>
          <p style={{
            fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: 0.4,
            color: '#a78bfa',
            marginBottom: '1.5rem',
            fontWeight: 300,
          }}>
            Enter the ecosystem
          </p>
          <h1 style={{
            fontSize: 'clamp(3rem, 10vw, 8rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
            margin: 0,
            color: 'white',
          }}>
            <span style={{ opacity: 0.3, fontWeight: 300, fontSize: '0.45em', display: 'block', marginBottom: '0.2em' }}>The</span>
            <span style={{ opacity: 0.5, fontWeight: 400, display: 'block' }}>Age of</span>
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block',
            }}>Abundance</span>
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.5rem)',
            opacity: 0.5,
            marginTop: '2rem',
            maxWidth: '36rem',
            lineHeight: 1.6,
            color: 'white',
          }}>
            Intelligence amplified. Abundance realized.
          </p>
          <div style={{
            marginTop: '3rem',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}>
            {VENTURES.slice(0, 8).map((v) => (
              <span key={v.label} style={{
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                border: `1px solid ${v.color}33`,
                color: v.color,
                fontSize: '0.8rem',
                letterSpacing: '0.05em',
                background: `${v.color}08`,
              }}>
                {v.label}
              </span>
            ))}
          </div>
          <div style={{
            position: 'absolute',
            bottom: '3rem',
            opacity: 0.3,
            color: 'white',
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            Scroll to explore ↓
          </div>
        </section>

        {/* Pitch sections */}
        {PITCH_LINES.map((line, i) => (
          <section key={i} style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 4.5rem)',
              fontWeight: 700,
              color: 'white',
              textAlign: 'center',
              maxWidth: '50rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              opacity: activeSection === i ? 1 : 0.1,
              transform: `translateY(${activeSection === i ? 0 : 30}px)`,
              transition: 'opacity 0.8s ease, transform 0.8s ease',
            }}>
              {line}
            </h2>
          </section>
        ))}

        {/* CTA section */}
        <section style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '2rem',
          gap: '2rem',
          pointerEvents: 'auto',
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
          }}>
            Explore the Ecosystem
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/" style={{
              padding: '0.8rem 2rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'transform 0.2s',
            }}>
              ← Back to Home
            </a>
            <a href="https://blackdot.dev" style={{
              padding: '0.8rem 2rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              transition: 'border-color 0.2s',
            }}>
              blackdot.dev →
            </a>
          </div>
          <p style={{
            fontSize: '0.85rem',
            opacity: 0.3,
            color: 'white',
            marginTop: '2rem',
          }}>
            Built with the DDS Universal Renderer + Three.js
          </p>
        </section>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 0.6; transform: translateY(5px); }
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        a:hover { transform: scale(1.05); }
      `}</style>
    </div>
  );
}
