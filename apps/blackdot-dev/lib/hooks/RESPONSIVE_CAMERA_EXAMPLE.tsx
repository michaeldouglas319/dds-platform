/**
 * Example: Using useResponsiveCamera in a 3D Scene
 *
 * This file demonstrates how to integrate the hook into a real component.
 * Copy and adapt these patterns for your own scenes.
 */

'use client'

import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { useResponsiveCamera } from './useResponsiveCamera'
import { LANDING_PAGE_PRESET, PRODUCT_SHOWCASE_PRESET } from './responsiveCameraPresets'

/**
 * Example 1: Simple Usage with Preset
 *
 * Best for: Landing pages, hero sections
 */
export function LandingSceneWithPreset() {
  const [cameraPos, cameraFov] = useResponsiveCamera(LANDING_PAGE_PRESET)

  return (
    <Canvas>
      <PerspectiveCamera position={cameraPos} fov={cameraFov} makeDefault />
      <OrbitControls autoRotate />
      {/* Your 3D content here */}
    </Canvas>
  )
}

/**
 * Example 2: Custom Configuration
 *
 * Best for: Custom scenes with specific requirements
 */
export function ProductShowcaseScene() {
  const [cameraPos, cameraFov] = useResponsiveCamera({
    basePosition: [0, 8, 12],
    baseFov: 45,
    breakpoints: [
      { width: 0, yPosition: 6, fov: 40 },    // Mobile
      { width: 640, yPosition: 7, fov: 43 },   // Tablet
      { width: 1024, yPosition: 8, fov: 45 },  // Desktop
      { width: 1536, yPosition: 9, fov: 48 },  // Large desktop
    ],
    portraitThreshold: 0.9,
    portraitYAdjustment: -1.5,
    debounceDelay: 300,
  })

  return (
    <Canvas>
      <PerspectiveCamera position={cameraPos} fov={cameraFov} makeDefault />
      <OrbitControls autoRotate autoRotateSpeed={2} />
      {/* Your product model here */}
    </Canvas>
  )
}

/**
 * Example 3: Advanced with Manual Camera Control
 *
 * Best for: Scenes with manual camera updates or debugging
 */
export function AdvancedSceneWithDebug() {
  const [cameraPos, cameraFov, updateCamera] = useResponsiveCamera({
    basePosition: [0, 13, 10],
    baseFov: 50,
    breakpoints: [
      { width: 0, yPosition: 8, fov: 45 },
      { width: 640, yPosition: 10, fov: 48 },
      { width: 1024, yPosition: 11, fov: 50 },
      { width: 1536, yPosition: 13, fov: 55 },
    ],
  })

  return (
    <div>
      {/* Debug info */}
      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 100, background: '#000', color: '#fff', padding: '10px' }}>
        <p>Camera Pos: [{cameraPos[0].toFixed(1)}, {cameraPos[1].toFixed(1)}, {cameraPos[2].toFixed(1)}]</p>
        <p>Camera FOV: {cameraFov.toFixed(1)}°</p>
        <button onClick={updateCamera} style={{ marginTop: '5px', padding: '5px 10px' }}>
          Refresh Camera
        </button>
      </div>

      <Canvas>
        <PerspectiveCamera position={cameraPos} fov={cameraFov} makeDefault />
        <OrbitControls />
        {/* Your 3D content here */}
      </Canvas>
    </div>
  )
}

/**
 * Example 4: Replace Existing useEffect Pattern
 *
 * Migration example: Converting from manual useEffect to hook
 */
export function MigratedScene() {
  // BEFORE: Manual useEffect pattern (200+ lines)
  // const [cameraPos, setCameraPos] = useState([0, 13, 10])
  // const [cameraFov, setCameraFov] = useState(50)
  // useEffect(() => {
  //   const updateCamera = () => { /* complex logic */ }
  //   updateCamera()
  //   let timeoutId
  //   const handleResize = () => {
  //     clearTimeout(timeoutId)
  //     timeoutId = setTimeout(() => updateCamera(), 300)
  //   }
  //   window.addEventListener('resize', handleResize)
  //   return () => window.removeEventListener('resize', handleResize)
  // }, [])

  // AFTER: Simple hook call
  const [cameraPos, cameraFov] = useResponsiveCamera(LANDING_PAGE_PRESET)

  return (
    <Canvas>
      <PerspectiveCamera position={cameraPos} fov={cameraFov} makeDefault />
      {/* Your 3D content here */}
    </Canvas>
  )
}

/**
 * Example 5: Responsive Scene with Multiple Breakpoints
 *
 * Best for: Complex scenes with fine-tuned responsive behavior
 */
export function DetailedResponsiveScene() {
  const [cameraPos, cameraFov] = useResponsiveCamera({
    basePosition: [0, 15, 15],
    baseFov: 55,
    breakpoints: [
      // Small phones (< 360px)
      { width: 0, yPosition: 12, fov: 45 },
      // Large phones (360-640px)
      { width: 360, yPosition: 13, fov: 48 },
      // Tablets (640-1024px)
      { width: 640, yPosition: 14, fov: 51 },
      { width: 768, yPosition: 14, fov: 52 },
      // Desktops (1024-1536px)
      { width: 1024, yPosition: 15, fov: 54 },
      { width: 1280, yPosition: 15, fov: 55 },
      // Large desktops (1536px+)
      { width: 1536, yPosition: 16, fov: 57 },
      { width: 1920, yPosition: 16, fov: 58 },
      // Ultra-wide (2560px+)
      { width: 2560, yPosition: 17, fov: 60 },
    ],
    portraitThreshold: 0.95,
    portraitYAdjustment: -1.5,
    debounceDelay: 350,
    fovAspectMultiplier: 0.015, // Subtle FOV changes
  })

  return (
    <Canvas>
      <PerspectiveCamera position={cameraPos} fov={cameraFov} makeDefault />
      {/* Your complex 3D scene */}
    </Canvas>
  )
}

/**
 * Example 6: Conditional Scene Selection
 *
 * Best for: Apps with multiple scene types
 */
interface ConditionalSceneProps {
  sceneType: 'landing' | 'product' | 'gallery'
}

export function ConditionalResponsiveScene({ sceneType }: ConditionalSceneProps) {
  // Select preset based on scene type
  const preset =
    sceneType === 'product'
      ? PRODUCT_SHOWCASE_PRESET
      : LANDING_PAGE_PRESET

  const [cameraPos, cameraFov] = useResponsiveCamera(preset)

  return (
    <Canvas>
      <PerspectiveCamera position={cameraPos} fov={cameraFov} makeDefault />
      {/* Scene content based on type */}
    </Canvas>
  )
}

/**
 * Example 7: Scene with Effects and Responsive Camera
 *
 * Best for: Advanced scenes with post-processing
 */
export function SceneWithEffects() {
  const [cameraPos, cameraFov] = useResponsiveCamera(LANDING_PAGE_PRESET)

  return (
    <Canvas>
      <PerspectiveCamera position={cameraPos} fov={cameraFov} makeDefault />
      <OrbitControls autoRotate />

      {/* Your 3D content */}

      {/* Optional: Post-processing effects
      <EffectComposer>
        <Bloom luminanceThreshold={1} luminanceSmoothing={0.9} />
        <FXAA />
      </EffectComposer>
      */}
    </Canvas>
  )
}
