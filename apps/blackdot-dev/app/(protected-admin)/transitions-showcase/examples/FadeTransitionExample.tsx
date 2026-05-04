'use client'

import { useState, useEffect } from 'react'
import { ModelTransition } from '@/lib/threejs/transitions'
import { BuildingModel } from '@/lib/scenes/models/BuildingModel'

/**
 * Simple fade transition between two model scales
 * Loops infinitely
 */
export function FadeTransitionExample() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive((prev) => !prev)
    }, 2000) // 0.6s fade + 1.4s pause

    return () => clearInterval(interval)
  }, [])

  return (
    <ModelTransition
      beforeModel={<BuildingModel modelOffset={0} />}
      afterModel={
        <group scale={[0.8, 0.8, 0.8]}>
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
          ease: 'power2.inOut',
          target: 'both'
        }
      ]}
    />
  )
}
