/**
 * Ideas Building Annotations Configuration
 * Defines annotation points for navigating through the building model
 * Based on the standard annotation pattern from Three.js boilerplate
 */

export interface AnnotationConfig {
  id: string;
  title: string;
  description?: string;
  camPos: { x: number; y: number; z: number };
  lookAt: { x: number; y: number; z: number };
  position?: { x: number; y: number; z: number }; // Optional: where label appears (defaults to lookAt)
  color?: string; // Optional: color for marker/label
}

/**
 * Standard building annotations
 * Camera positions and look-at points for navigating through the building
 * Positions are relative to the building model (centered at origin)
 */
export const buildingAnnotations: AnnotationConfig[] = [
  {
    id: 'entrance',
    title: 'Main Entrance',
    description: 'Welcome to the building. This is the main entrance area.',
    camPos: { x: 0, y: 1.5, z: 4 },
    lookAt: { x: 0, y: 0.5, z: 1.5 },
    position: { x: 0, y: 0.5, z: 1.5 },
    color: '#4CAF50',
  },
  {
    id: 'lobby',
    title: 'Lobby',
    description: 'The main lobby area with reception desk.',
    camPos: { x: 0, y: 2.5, z: 3 },
    lookAt: { x: 0, y: 1.5, z: 0 },
    position: { x: 0, y: 1.5, z: 0 },
    color: '#2196F3',
  },
  {
    id: 'office-floor',
    title: 'Office Floor',
    description: 'Modern office spaces with collaborative workspaces.',
    camPos: { x: 0, y: 4.5, z: 4 },
    lookAt: { x: 0, y: 3, z: 0 },
    position: { x: 0, y: 3, z: 0 },
    color: '#FF9800',
  },
  {
    id: 'roof',
    title: 'Roof Terrace',
    description: 'Rooftop terrace with panoramic views.',
    camPos: { x: 0, y: 7.5, z: 5 },
    lookAt: { x: 0, y: 6.5, z: 0 },
    position: { x: 0, y: 6.5, z: 0 },
    color: '#9C27B0',
  },
];

