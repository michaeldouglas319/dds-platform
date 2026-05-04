'use client'

import { InteractiveModel } from '@/app/landing/components/InteractiveModel'

export function DroneExample() {
  return (
    <InteractiveModel
      modelPath="/assets/models/super_cam__-_rusian_reconnaissance_drone.glb"
      morphGeometryType="torus"
      morphDetail={0.7}
      morphSpeed={0.14}
      position={[0, 0, 0]}
      scale={1.5}
      hoverScale={1.18}
      float={true}
      floatIntensity={0.25}
      floatSpeed={1.2}
      hoverRotate={true}
      rotationSpeed={2.5}
      onClick={() => console.log('Drone clicked!')}
      interactive={true}
    />
  )
}
