'use client'

import { useState, useEffect } from 'react'
import { ModelTransition } from '@/lib/threejs/transitions'
import { BuildingModel } from '@/lib/scenes/models/BuildingModel'

/**
 * Synchronized fade and camera movement
 * Loops infinitely
 */
export function CameraAnimationExample() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive((prev) => !prev)
    }, 2500) // 1.0s animation + 1.5s pause

    return () => clearInterval(interval)
  }, [])

  return (
    <ModelTransition
      beforeModel={<BuildingModel modelOffset={0} />}
      afterModel={
        <group scale={[1.1, 1.1, 1.1]}>
          <BuildingModel modelOffset={0} />
        </group>
      }
      trigger="manual"
      isActive={isActive}
      reverseOnSecondClick={true}
      effects={[
        {
          type: 'fade',
          duration: 0.6,
          target: 'before',
          ease: 'power2.inOut'
        },
        {
          type: 'fade',
          duration: 0.6,
          delay: 0.2,
          target: 'after',
          ease: 'power2.inOut'
        },
        {
          type: 'camera',
          duration: 1.0,
          from: [0, 0, 20],
          to: [15, 10, 25],
          lookAt: [0, 2, 0],
          ease: 'power1.inOut'
        }
      ]}
    />
  )
}
