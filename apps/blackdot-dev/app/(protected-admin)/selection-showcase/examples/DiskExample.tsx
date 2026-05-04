'use client'

import { InteractiveModel } from '@/app/landing/components/InteractiveModel'

/**
 * DiskExample - Morphs between a 3D model and a flat disk
 * Uses cylinder geometry with low height to create disk appearance
 */
export function DiskExample() {
  return (
    <InteractiveModel
      modelPath="/assets/models/chess_set.glb"
      morphGeometryType="cylinder"
      morphDetail={0.6}
      morphSpeed={0.12}
      position={[0, 0, 0]}
      scale={2.5}
      hoverScale={1.15}
      float={true}
      floatIntensity={0.2}
      floatSpeed={1}
      hoverRotate={true}
      rotationSpeed={2}
      onClick={() => console.log('Disk morph clicked!')}
      interactive={true}
    />
  )
}
