'use client'

import { useState, useEffect } from 'react'
import { ModelTransition } from '@/lib/threejs/transitions'
import { UAVModel } from '@/lib/scenes/models/UAVModel'

/**
 * Complex transition with multiple effects, precise timing, and staggered animations
 * Demonstrates the full power of the transition system
 * Loops infinitely
 */
export function ComplexMultiEffectExample() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive((prev) => !prev)
    }, 3500) // 1.3s animation + 2.2s pause

    return () => clearInterval(interval)
  }, [])

  return (
    <ModelTransition
      beforeModel={<UAVModel modelOffset={0} />}
      afterModel={
        <group scale={[1.3, 1.3, 1.3]}>
          <UAVModel modelOffset={0} />
        </group>
      }
      trigger="manual"
      isActive={isActive}
      reverseOnSecondClick={true}
      effects={[
        // Phase 1: Exit first model (0s - 0.4s)
        {
          type: 'fade',
          duration: 0.3,
          target: 'before',
          ease: 'power2.in'
        },
        {
          type: 'scale',
          duration: 0.4,
          target: 'before',
          from: 1,
          to: 0.7,
          ease: 'power2.in'
        },
        {
          type: 'rotate',
          duration: 0.4,
          target: 'before',
          axis: 'z',
          amount: Math.PI * 0.25,
          ease: 'power2.in'
        },

        // Phase 2: Camera movement (0.1s - 1.3s)
        {
          type: 'camera',
          duration: 1.2,
          delay: 0.1,
          from: [0, 0, 20],
          to: [-12, 8, 22],
          lookAt: [2, 0, 0],
          ease: 'power1.inOut'
        },

        // Phase 3: Enter second model (0.3s - 1.1s)
        {
          type: 'slide',
          duration: 0.8,
          delay: 0.3,
          target: 'after',
          direction: 'right',
          distance: 10,
          ease: 'power2.out'
        },
        {
          type: 'scale',
          duration: 0.8,
          delay: 0.3,
          target: 'after',
          from: 0,
          to: 1.3,
          ease: 'back.out(1.7)'
        },
        {
          type: 'fade',
          duration: 0.6,
          delay: 0.4,
          target: 'after',
          ease: 'power2.out'
        },
        {
          type: 'rotate',
          duration: 1.0,
          delay: 0.3,
          target: 'after',
          axis: 'y',
          amount: Math.PI * 1.5,
          ease: 'power2.out'
        }
      ]}
    />
  )
}
