'use client'

import { forwardRef, useRef, useImperativeHandle, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { BackSide, Quaternion, Vector3, type Group } from 'three'

const EARTH_TEXTURE_URL =
  'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'

export type GlobeHandle = {
  spinGroup: Group | null
}

type GlobeProps = {
  radius?: number
  textureUrl?: string
  atmosphere?: boolean
  atmosphereColor?: string
  atmosphereOpacity?: number
  tiltDeg?: number
  rotationSpeed?: number
  /** When true, auto-spin pauses. */
  paused?: boolean
  /**
   * Local-space position (inside the spin group) to rotate toward camera.
   * When set, auto-spin is paused and the group slerps so this point faces +Z.
   */
  focusPosition?: Vector3 | null
  /** Time constant for focus slerp (higher = snappier). Default 2.5. */
  focusLerpSpeed?: number
  children?: ReactNode
  position?: [number, number, number]
  initialSpinY?: number
}

const TMP_Q = new Quaternion()
const TMP_Q_TARGET = new Quaternion()
const TMP_V = new Vector3()
const CAMERA_DIR = new Vector3(0, 0, 1)

export const Globe = forwardRef<GlobeHandle, GlobeProps>(function Globe(
  {
    radius = 3,
    textureUrl = EARTH_TEXTURE_URL,
    atmosphere = true,
    atmosphereColor = '#4aa3ff',
    atmosphereOpacity = 0.12,
    tiltDeg = 23,
    rotationSpeed = 0.69,
    paused = false,
    focusPosition = null,
    focusLerpSpeed = 2.5,
    children,
    position = [0, 0, 0],
    initialSpinY = -Math.PI / 4,
  },
  ref,
) {
  const spinRef = useRef<Group>(null)
  const texture = useTexture(textureUrl)

  useImperativeHandle(ref, () => ({ spinGroup: spinRef.current }), [])

  useFrame((_, delta) => {
    const g = spinRef.current
    if (!g) return
    if (focusPosition) {
      // Compute the rotation that moves the focus vector (in local coords)
      // to the camera-facing +Z direction, factoring out the current tilt.
      TMP_V.copy(focusPosition).normalize()
      TMP_Q_TARGET.setFromUnitVectors(TMP_V, CAMERA_DIR)
      // Current rotation quaternion of the spin group
      TMP_Q.copy(g.quaternion)
      TMP_Q.slerp(TMP_Q_TARGET, Math.min(1, delta * focusLerpSpeed))
      g.quaternion.copy(TMP_Q)
      return
    }
    if (!paused) {
      g.rotation.y += delta * rotationSpeed
    }
  })

  return (
    <group position={position} rotation={[(tiltDeg * Math.PI) / 180, 0, 0]}>
      <group ref={spinRef} rotation={[0, initialSpinY, 0]}>
        <mesh castShadow scale={radius}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial map={texture} specular="#222222" shininess={12} />
        </mesh>
        {atmosphere && (
          <mesh scale={radius * 1.025}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshBasicMaterial
              color={atmosphereColor}
              transparent
              opacity={atmosphereOpacity}
              side={BackSide}
            />
          </mesh>
        )}
        {children}
      </group>
    </group>
  )
})
