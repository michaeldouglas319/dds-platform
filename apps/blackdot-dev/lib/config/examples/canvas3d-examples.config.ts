/**
 * React Three Fiber Config-Driven Examples
 * Production-ready patterns for integrating 3D into slides
 */

import type { Canvas3DConfig } from '@/lib/types/canvas3d.types';
import type { UnifiedSection } from '@/lib/config/content';

// Example 1: Resume job card with floating logo
export const resumeJobCard3D: UnifiedSection & { canvas3d?: Canvas3DConfig } = {
  id: 'job-tech-lead',
  page: 'resume',
  title: 'Senior Technical Lead',
  subtitle: 'Acme Corp • 2020-2023',
  color: '#3b82f6',
  content: {
    heading: 'Led engineering team of 12 developers',
    paragraphs: ['Built scalable microservices architecture', 'Reduced deployment time by 70%'],
    highlights: ['Node.js', 'TypeScript', 'AWS', 'React'],
  },
  canvas3d: {
    models: [
      {
        id: 'company-logo',
        modelPath: '/models/golden_globe_decoration.glb',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
        animation: {
          type: 'float',
          speed: 1,
          amplitude: 0.2,
        },
        interactive: true,
      },
    ],
    scene: {
      background: 'transparent',
      lights: [
        { type: 'ambient', intensity: 0.5 },
        { type: 'directional', intensity: 1, position: [5, 5, 5] },
      ],
    },
    fallbackMode: 'image',
    camera: {
      position: [0, 0, 3],
      fov: 50,
    },
  },
};

// Example 2: Business idea slide with rotating drone model
export const businessIdeaDrone: UnifiedSection & { canvas3d?: Canvas3DConfig } = {
  id: 'drone-delivery-idea',
  page: 'business',
  title: 'Autonomous Drone Delivery',
  subtitle: 'Last-Mile Logistics Solution',
  color: '#10b981',
  content: {
    heading: 'Revolutionizing Urban Delivery',
    paragraphs: [
      'AI-powered autonomous drones for 15-minute delivery',
      'Reduces carbon emissions by 80% vs traditional vehicles',
    ],
    stats: [
      { label: 'Market Size', value: '$29B by 2027' },
      { label: 'Delivery Speed', value: '15 mins' },
    ],
  },
  canvas3d: {
    models: [
      {
        id: 'drone-main',
        modelPath: '/models/super_cam__-_rusian_reconnaissance_drone.glb',
        position: [0, 0, 0],
        rotation: [0.1, 0, 0],
        scale: 1.5,
        animation: {
          type: 'rotate',
          speed: 0.5,
          amplitude: 1,
        },
        interactive: true,
      },
    ],
    scene: {
      background: '#0a0a0a',
      fog: { near: 5, far: 15, color: '#0a0a0a' },
      lights: [
        { type: 'ambient', intensity: 0.3, color: '#ffffff' },
        { type: 'directional', intensity: 1.5, position: [10, 10, 5], color: '#ffffff' },
        { type: 'point', intensity: 0.8, position: [-5, 3, -5], color: '#10b981' },
      ],
    },
    fallbackMode: 'image',
    camera: {
      position: [0, 1, 4],
      fov: 45,
    },
  },
};

// Example 3: Multi-model scene (ecosystem visualization)
export const businessEcosystem: UnifiedSection & { canvas3d?: Canvas3DConfig } = {
  id: 'ecosystem-overview',
  page: 'business',
  title: 'Product Ecosystem',
  subtitle: 'End-to-End Platform',
  color: '#8b5cf6',
  content: {
    heading: 'Integrated Solution Stack',
    paragraphs: ['Hardware, software, and cloud infrastructure working in harmony'],
    features: ['Edge computing', 'Real-time telemetry', 'ML-powered routing', 'Fleet management'],
  },
  canvas3d: {
    models: [
      {
        id: 'drone-1',
        modelPath: '/models/super_cam__-_rusian_reconnaissance_drone.glb',
        position: [-2, 0, 0],
        rotation: [0, 0.5, 0],
        scale: 0.8,
        animation: { type: 'float', speed: 0.8, amplitude: 0.15 },
      },
      {
        id: 'drone-2',
        modelPath: '/models/super_cam__-_rusian_reconnaissance_drone.glb',
        position: [2, 0.5, -1],
        rotation: [0, -0.5, 0],
        scale: 0.8,
        animation: { type: 'wave', speed: 1.2, amplitude: 0.3 },
      },
      {
        id: 'hub',
        modelPath: '/models/chess_set.glb',
        position: [0, -1, 0],
        rotation: [0, 0, 0],
        scale: 0.8,
        animation: { type: 'pulse', speed: 1, amplitude: 0.5 },
      },
    ],
    scene: {
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      fog: { near: 8, far: 20 },
      lights: [
        { type: 'ambient', intensity: 0.4 },
        { type: 'directional', intensity: 1, position: [5, 5, 5] },
        { type: 'point', intensity: 1.5, position: [0, 2, 2], color: '#8b5cf6' },
      ],
    },
    fallbackMode: 'text',
    camera: {
      position: [0, 1, 6],
      fov: 50,
    },
  },
};

// Usage example array for testing
export const canvas3dExamples = [resumeJobCard3D, businessIdeaDrone, businessEcosystem];
