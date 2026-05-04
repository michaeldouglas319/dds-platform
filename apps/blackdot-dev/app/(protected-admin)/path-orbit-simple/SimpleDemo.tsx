'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Particle {
  pos: THREE.Vector3;
  t: number;
  inOrbit: boolean;
  angle: number;
  visible: boolean;
}

const PATH = [
  [-30, 0, -30],
  [-20, 5, -20],
  [-10, 10, -10],
  [0, 15, 0],
  [10, 20, 10],
  [20, 25, 20],
  [30, 30, 30],
];

const ORBIT_POS = [50, 30, 50];
const ORBIT_R = 15;

export function SimpleDemo() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const particles = useRef<Particle[]>([]);
  const spawnTimer = useRef(0);
  const [speed, setSpeed] = useState(2);
  const [spawn, setSpawn] = useState(2);

  const curve = useMemo(() => {
    const points = PATH.map(p => new THREE.Vector3(...(p as any)));
    return new THREE.CatmullRomCurve3(points);
  }, []);

  if (!particles.current.length) {
    particles.current = Array(100).fill(null).map(() => ({
      pos: new THREE.Vector3(-40, -5, -40),
      t: 0,
      inOrbit: false,
      angle: Math.random() * Math.PI * 2,
      visible: false,
    }));
  }

  useFrame((state, delta) => {
    if (!mesh.current) return;

    spawnTimer.current += delta;
    const spawnDelay = 1 / spawn;

    let count = 0;
    particles.current.forEach((p, idx) => {
      // Spawn
      if (!p.visible && spawnTimer.current >= spawnDelay) {
        p.visible = true;
        p.t = 0;
        p.inOrbit = false;
        spawnTimer.current = 0;
      }

      if (!p.visible) return;
      count++;

      if (!p.inOrbit) {
        // Path phase
        p.t += (speed / 70) * delta;

        if (p.t >= 1) {
          p.inOrbit = true;
          p.angle = Math.atan2(p.pos.z - ORBIT_POS[2], p.pos.x - ORBIT_POS[0]);
        } else {
          p.pos.copy(curve.getPoint(p.t));
        }
      } else {
        // Orbit phase
        p.angle += speed * 0.02 * delta;
        p.pos.x = ORBIT_POS[0] + Math.cos(p.angle) * ORBIT_R;
        p.pos.z = ORBIT_POS[2] + Math.sin(p.angle) * ORBIT_R;
        p.pos.y = ORBIT_POS[1] + Math.sin(p.angle * 0.5) * 3;
      }

      // Update matrix
      const m = new THREE.Matrix4();
      m.setPosition(p.pos);
      mesh.current!.setMatrixAt(idx, m);
    });

    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.count = count;
  });

  return (
    <group>
      {/* Particles */}
      <instancedMesh ref={mesh} args={[undefined, undefined, 100]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#6366f1" emissive="#4f46e5" emissiveIntensity={0.5} />
      </instancedMesh>

      {/* Path */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(PATH.flat()), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#888" linewidth={2} />
      </line>

      {/* Orbit */}
      {Array.from({ length: 64 }).map((_, i) => {
        const a = (i / 64) * Math.PI * 2;
        const nx = (((i + 1) / 64) * Math.PI * 2);
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([
                  ORBIT_POS[0] + Math.cos(a) * ORBIT_R,
                  ORBIT_POS[1] + Math.sin(a * 0.5) * 3,
                  ORBIT_POS[2] + Math.sin(a) * ORBIT_R,
                  ORBIT_POS[0] + Math.cos(nx) * ORBIT_R,
                  ORBIT_POS[1] + Math.sin(nx * 0.5) * 3,
                  ORBIT_POS[2] + Math.sin(nx) * ORBIT_R,
                ]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#0f0" opacity={0.4} transparent />
          </line>
        );
      })}

      {/* Ground */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}
