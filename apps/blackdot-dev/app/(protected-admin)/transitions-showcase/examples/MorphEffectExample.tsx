'use client'

import { useState, useEffect } from 'react'
import { ModelTransition } from '@/lib/threejs/transitions'

/**
 * Morph Effect Example
 *
 * Simple cross-fade morph between two 3D models.
 * Demonstrates smooth transitions using opacity and scale.
 *
 * For production 3D animations, use Framer Motion for React Three Fiber:
 * https://www.framer.com/motion/react-three-fiber/
 */

function BoxModel() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshPhongMaterial color={0x3b82f6} />
    </mesh>
  )
}

function SphereModel() {
  return (
    <mesh>
      <sphereGeometry args={[1.4, 32, 32]} />
      <meshPhongMaterial color={0x8b5cf6} />
    </mesh>
  )
}

export function MorphEffectExample() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive((prev) => !prev)
    }, 5000) // 2s transition + 3s pause

    return () => clearInterval(interval)
  }, [])

  return (
    <ModelTransition
      beforeModel={<BoxModel />}
      afterModel={<SphereModel />}
      trigger="manual"
      isActive={isActive}
      effects={[
        {
          type: 'morph',
          duration: 2.0,
          ease: 'power2.inOut'
        }
      ]}
    />
  )
}
