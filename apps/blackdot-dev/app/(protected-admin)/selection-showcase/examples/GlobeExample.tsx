'use client'

import { InteractiveModel } from '@/app/landing/components/InteractiveModel'

export function GlobeExample() {
  return (
    <InteractiveModel
      modelPath="/assets/models/golden_globe_decoration.glb"
      morphGeometryType="sphere"
      morphDetail={0.9}
      morphSpeed={0.08}
      position={[0, 0, 0]}
      scale={0.012}
      hoverScale={1.2}
      float={true}
      floatIntensity={0.1}
      floatSpeed={0.9}
      hoverRotate={true}
      rotationSpeed={1.8}
      onClick={() => console.log('Globe clicked!')}
      interactive={true}
    />
  )
}
