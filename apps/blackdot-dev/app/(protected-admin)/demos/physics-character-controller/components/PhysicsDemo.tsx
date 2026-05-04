'use client'

import { Suspense } from 'react'
import { PhysicsScene } from './PhysicsScene'

interface PhysicsDemoProps {
  gravity: number
  bounce: number
  maxSpeed: number
  acceleration: number
  jumpForce: number
  className?: string
}

export function PhysicsDemo({
  gravity,
  bounce,
  maxSpeed,
  acceleration,
  jumpForce,
  className = '',
}: PhysicsDemoProps) {
  return (
    <div className={`w-full h-full rounded-lg overflow-hidden border border-border/50 ${className}`}>
      <Suspense
        fallback={
          <div className="w-full h-full bg-background/50 flex items-center justify-center">
            <div className="text-foreground/60 text-sm">Loading physics scene...</div>
          </div>
        }
      >
        <PhysicsScene
          gravity={gravity}
          bounce={bounce}
          maxSpeed={maxSpeed}
          acceleration={acceleration}
          jumpForce={jumpForce}
        />
      </Suspense>
    </div>
  )
}
