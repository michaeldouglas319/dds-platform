'use client'

import { InteractiveModel } from '@/app/landing/components/InteractiveModel'

export function ChessExample() {
  return (
    <InteractiveModel
      modelPath="/assets/models/chess_set.glb"
      morphGeometryType="sphere"
      morphDetail={0.6}
      morphSpeed={0.1}
      position={[0, 0, 0]}
      scale={3}
      hoverScale={1.15}
      float={true}
      floatIntensity={0.2}
      floatSpeed={1}
      hoverRotate={true}
      rotationSpeed={2}
      onClick={() => console.log('Chess set clicked!')}
      interactive={true}
    />
  )
}
