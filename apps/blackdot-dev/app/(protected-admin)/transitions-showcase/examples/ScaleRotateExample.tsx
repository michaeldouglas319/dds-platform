'use client'

import { useState, useEffect } from 'react'
import { ModelTransition } from '@/lib/threejs/transitions'
import { BuildingModel } from '@/lib/scenes/models/BuildingModel'

/**
 * Combined scale and rotate effects
 * Loops infinitely
 */
export function ScaleRotateExample() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive((prev) => !prev)
    }, 2500) // 0.8s animation + 1.7s pause

    return () => clearInterval(interval)
  }, [])

  return (
    <ModelTransition
      beforeModel={<BuildingModel modelOffset={0} />}
      afterModel={
        <group scale={[1.2, 1.2, 1.2]}>
          <BuildingModel modelOffset={0} />
        </group>
      }
      trigger="manual"
      isActive={isActive}
      reverseOnSecondClick={true}
      effects={[
        {
          type: 'scale',
          duration: 0.8,
          target: 'before',
          from: 1,
          to: 0.5,
          ease: 'power2.in'
        },
        {
          type: 'rotate',
          duration: 0.8,
          target: 'before',
          axis: 'y',
          amount: Math.PI * 0.5,
          ease: 'power2.in'
        },
        {
          type: 'scale',
          duration: 0.8,
          delay: 0.3,
          target: 'after',
          from: 0,
          to: 1.2,
          ease: 'back.out(1.7)'
        },
        {
          type: 'rotate',
          duration: 0.8,
          delay: 0.3,
          target: 'after',
          axis: 'y',
          amount: -Math.PI * 0.5,
          ease: 'back.out(1.7)'
        }
      ]}
    />
  )
}
