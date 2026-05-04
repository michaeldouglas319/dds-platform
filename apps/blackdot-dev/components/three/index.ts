/**
 * Three.js Components Barrel Export
 *
 * Layer 2 components: Three.js and React Three Fiber components
 * 
 * @category three
 * @layer 2
 */

// Canvas
export { StandardCanvas } from './StandardCanvas'
export type { StandardCanvasProps } from './StandardCanvas'

// UI Integration
export { ThreeUI, ThreeUIPanel, ThreeUIOverlay } from './ThreeUI'
export type { ThreeUIProps } from './ThreeUI'

// Scenes
export { BaseScene } from './scenes/BaseScene'
export type { BaseSceneProps } from './scenes/BaseScene'

export { ModelScene } from './scenes/ModelScene'
export type { ModelSceneProps } from './scenes/ModelScene'

export { InteractiveScene } from './scenes/InteractiveScene'
export type { InteractiveSceneProps } from './scenes/InteractiveScene'

// Legacy (deprecated - use StandardCanvas)
export { CanvasScene, FloatingObject } from './canvas-scene'
