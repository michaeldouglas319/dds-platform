'use client'

import { InteractiveModel } from '@/app/landing/components/InteractiveModel'

export function AircraftExample() {
  return (
    <InteractiveModel
      modelPath="/assets/models/aircraft_presentation_cover.glb"
      morphGeometryType="icosahedron"
      morphDetail={0.5}
      morphSpeed={0.12}
      position={[0, 0, 0]}
      scale={4}
      hoverScale={1.12}
      float={true}
      floatIntensity={0.15}
      floatSpeed={0.8}
      hoverRotate={true}
      rotationSpeed={1.5}
      onClick={() => console.log('Aircraft clicked!')}
      interactive={true}
    />
  )
}
