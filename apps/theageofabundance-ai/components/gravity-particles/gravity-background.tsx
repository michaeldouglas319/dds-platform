'use client';

/**
 * GravityBackground — Fixed full-screen gravity particle system with bloom.
 * Ported from dds-v3 gravity-particles system.
 * Sits behind page content as a living background.
 */

import { useEffect, useRef } from 'react';
import {
  Scene, PerspectiveCamera, WebGLRenderer,
  LinearSRGBColorSpace, Clock, Vector2,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import { GravityWell } from './gravity-well';
import { ParticleEmitter } from './particle-emitter';
import { GravitySimulation } from './gravity-simulation';
import { ParticleRenderer } from './particle-renderer';

const WELLS = [
  { position: [0, 0, 0], mass: 40, captureRadius: 0.6, id: 'core' },
  { position: [-4, 2, -2], mass: 20, captureRadius: 0.4, id: 'left' },
  { position: [4, -1, -1], mass: 20, captureRadius: 0.4, id: 'right' },
];

const EMITTERS = [
  { position: [8, 4, 2], rate: 12, initialSpeed: 1.2, spread: 1 },
  { position: [-8, -3, 3], rate: 10, initialSpeed: 1.0, spread: 1 },
  { position: [0, 8, -2], rate: 8, initialSpeed: 1.5, spread: 1.5 },
  { position: [-5, -6, 1], rate: 8, initialSpeed: 1.3, spread: 0.8 },
  { position: [6, 5, -3], rate: 6, initialSpeed: 1.1, spread: 1.2 },
];

const THRESHOLDS = [
  { count: 50, color: [0.15, 0.1, 0.25], bloom: 0 },
  { count: 200, color: [0.35, 0.2, 0.65], bloom: 0.2 },
  { count: 500, color: [0.55, 0.3, 0.95], bloom: 0.5 },
  { count: 1000, color: [0.9, 0.5, 1.0], bloom: 0.8 },
  { count: 2000, color: [1.0, 0.8, 1.0], bloom: 1.2 },
];

export function GravityBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Renderer
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true });
    } catch {
      return;
    }
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = LinearSRGBColorSpace;

    // Scene + Camera
    const scene = new Scene();
    const camera = new PerspectiveCamera(50, w / h, 0.1, 200);
    camera.position.z = 18;

    // Bloom postprocessing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new Vector2(w, h), 0.0, 0.4, 0.85);
    composer.addPass(bloomPass);

    // Simulation
    const sim = new GravitySimulation({ maxParticles: 4096, damping: 0.998, maxAge: 25 });

    WELLS.forEach((cfg, i) => {
      sim.addWell(new GravityWell({ ...cfg, id: cfg.id || `well-${i}` }));
    });

    EMITTERS.forEach((cfg, i) => {
      sim.addEmitter(new ParticleEmitter({ ...cfg, id: `emitter-${i}` }));
    });

    // Particle renderer
    const particleRenderer = new ParticleRenderer({ maxParticles: 4096, pointSize: 2.5 });
    scene.add(particleRenderer.points);

    // Threshold config
    const sortedThresholds = [...THRESHOLDS].sort((a, b) => a.count - b.count);
    const thresholdRules = sortedThresholds.map(t => ({ threshold: t.count, color: t.color }));
    const bloomStops = sortedThresholds.map(t => ({ threshold: t.count, bloom: t.bloom ?? 0 }));

    // Animation
    const clock = new Clock();
    let smoothBloom = 0;

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      const result = sim.step(dt);
      sim.applyThresholdColors(thresholdRules, result.totalCaptured);

      // Bloom interpolation
      let targetBloom = 0;
      if (bloomStops.length > 0) {
        let lower = bloomStops[0];
        let upper = bloomStops[0];
        for (let i = 0; i < bloomStops.length; i++) {
          if (result.totalCaptured >= bloomStops[i].threshold) {
            lower = bloomStops[i];
            upper = bloomStops[i + 1] || bloomStops[i];
          }
        }
        const range = upper.threshold - lower.threshold;
        const t = range > 0
          ? Math.min((result.totalCaptured - lower.threshold) / range, 1)
          : (result.totalCaptured >= lower.threshold ? 1 : 0);
        targetBloom = lower.bloom + (upper.bloom - lower.bloom) * t;
      }

      smoothBloom += (targetBloom - smoothBloom) * 0.03;
      bloomPass.strength = smoothBloom;
      particleRenderer.setBloomIntensity(smoothBloom);

      particleRenderer.update(result.positions, result.colors);

      // Gentle camera orbit
      camera.position.x = Math.sin(elapsed * 0.05) * 3;
      camera.position.y = Math.cos(elapsed * 0.04) * 2;
      camera.lookAt(0, 0, 0);

      composer.render();
    }

    animate();

    // Resize
    function handleResize() {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      renderer.setSize(nw, nh);
      composer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      particleRenderer.dispose();
      renderer.dispose();
      composer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
