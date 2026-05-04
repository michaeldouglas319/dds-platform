import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { V3Config } from '../config/attractors.config'

export interface AttractorState {
  position: THREE.Vector3
  orientation: THREE.Vector3
  reference: THREE.Object3D
  controls: TransformControls | null
  ring: THREE.Mesh | null
  arrow: THREE.Mesh | null
}

export interface AttractorsPhysicsState {
  attractors: AttractorState[]
  positions: THREE.Vector3[]
  orientations: THREE.Vector3[]
  updateAttractor: (index: number) => void
}

/**
 * Manages attractor positions, orientations, and interactive controls
 * Follows curved-takeoff-orbit useV3Physics pattern
 */
export function useAttractorsPhysics(
  config: V3Config,
  scene: THREE.Scene,
  camera: THREE.Camera,
  gl: THREE.WebGLRenderer
): AttractorsPhysicsState {
  const attractorsRef = useRef<AttractorState[]>([])
  const positionsRef = useRef<THREE.Vector3[]>([])
  const orientationsRef = useRef<THREE.Vector3[]>([])

  useEffect(() => {
    // Clear existing attractors
    attractorsRef.current.forEach((att) => {
      if (att.controls) att.controls.dispose()
      if (att.reference) scene.remove(att.reference)
    })
    attractorsRef.current = []
    positionsRef.current = []
    orientationsRef.current = []

    // Helper geometries
    const ringGeometry = new THREE.RingGeometry(1, 1.02, 32, 1, 0, Math.PI * 1.5)
    const arrowGeometry = new THREE.ConeGeometry(0.1, 0.4, 12, 1, false)
    const helperMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })

    // Create attractors from config
    config.attractors.forEach((cfg, index) => {
      const attractor: AttractorState = {
        position: cfg.position.clone(),
        orientation: cfg.orientation.clone(),
        reference: new THREE.Object3D(),
        controls: null,
        ring: null,
        arrow: null,
      }

      // Set reference position and orientation
      attractor.reference.position.copy(attractor.position)
      attractor.reference.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        attractor.orientation
      )
      scene.add(attractor.reference)

      // Create helper group
      const helper = new THREE.Group()
      helper.scale.setScalar(0.325)
      attractor.reference.add(helper)

      // Ring visualization
      const ring = new THREE.Mesh(ringGeometry, helperMaterial)
      ring.rotation.x = -Math.PI * 0.5
      helper.add(ring)
      attractor.ring = ring

      // Arrow visualization
      const arrow = new THREE.Mesh(arrowGeometry, helperMaterial)
      arrow.position.x = 1
      arrow.position.z = 0.2
      arrow.rotation.x = Math.PI * 0.5
      helper.add(arrow)
      attractor.arrow = arrow

      // Interactive controls
      const controls = new TransformControls(camera, gl.domElement)
      controls.mode = config.debug.showHelpers ? 'rotate' : 'translate'
      controls.size = 0.5
      controls.attach(attractor.reference)
      controls.enabled = config.debug.showHelpers
      const controlsHelper = controls.getHelper()
      controlsHelper.visible = config.debug.showHelpers
      scene.add(controlsHelper)
      attractor.controls = controls

      // Update attractor on drag
      controls.addEventListener('change', () => {
        attractor.position.copy(attractor.reference.position)
        attractor.orientation.copy(
          new THREE.Vector3(0, 1, 0).applyQuaternion(attractor.reference.quaternion)
        )
        // Update global refs
        positionsRef.current[index] = attractor.position
        orientationsRef.current[index] = attractor.orientation
      })

      attractorsRef.current.push(attractor)
      positionsRef.current.push(attractor.position)
      orientationsRef.current.push(attractor.orientation)
    })

    return () => {
      attractorsRef.current.forEach((att) => {
        if (att.controls) att.controls.dispose()
        if (att.reference) scene.remove(att.reference)
      })
    }
  }, [config.attractors, scene, camera, gl, config.debug.showHelpers])

  const updateAttractor = (index: number) => {
    if (index < attractorsRef.current.length) {
      const att = attractorsRef.current[index]
      att.position.copy(att.reference.position)
      att.orientation.copy(
        new THREE.Vector3(0, 1, 0).applyQuaternion(att.reference.quaternion)
      )
    }
  }

  return {
    get attractors() {
      return attractorsRef.current
    },
    get positions() {
      return positionsRef.current
    },
    get orientations() {
      return orientationsRef.current
    },
    updateAttractor,
  }
}
