'use client'

import { useState, useEffect } from 'react'
import { ModelTransition } from '@/lib/threejs/transitions'
import { BookModel } from '@/lib/scenes/models/BookModel'

/**
 * Slide in with staggered fade effects
 * Loops infinitely
 */
export function SlideAndFadeExample() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive((prev) => !prev)
    }, 2800) // 0.8s animation + 2.0s pause

    return () => clearInterval(interval)
  }, [])

  return (
    <ModelTransition
      beforeModel={<BookModel modelOffset={0} />}
      afterModel={
        <group scale={[1.15, 1.15, 1.15]}>
          <BookModel modelOffset={0} />
        </group>
      }
      trigger="manual"
      isActive={isActive}
      reverseOnSecondClick={true}
      effects={[
        {
          type: 'fade',
          duration: 0.4,
          target: 'before',
          ease: 'power2.out'
        },
        {
          type: 'slide',
          duration: 0.8,
          delay: 0.2,
          target: 'after',
          direction: 'up',
          distance: 8,
          ease: 'power2.out'
        },
        {
          type: 'fade',
          duration: 0.6,
          delay: 0.3,
          target: 'after',
          ease: 'power2.out'
        },
        {
          type: 'rotate',
          duration: 0.8,
          delay: 0.2,
          target: 'after',
          axis: 'x',
          amount: Math.PI * 0.3,
          ease: 'power2.out'
        }
      ]}
    />
  )
}
