'use client'

import { InteractiveModel } from '@/app/landing/components/InteractiveModel'

/**
 * DetailComparisonExample - Shows three chess models with different detail levels
 * Positioned at different X coordinates to display side-by-side
 * Detail levels: 0.3 (blocky), 0.6 (medium), 0.9 (smooth)
 */
export function DetailComparisonExample() {
  return (
    <>
      {/* Low detail (0.3) - Blocky geometry */}
      <InteractiveModel
        modelPath="/assets/models/chess_set.glb"
        morphGeometryType="sphere"
        morphDetail={0.3}
        morphSpeed={0.1}
        position={[-2, 0, 0]}
        scale={1.5}
        hoverScale={1.15}
        float={false}
        hoverRotate={true}
        rotationSpeed={2}
        onClick={() => console.log('Detail 0.3 clicked!')}
        interactive={true}
      />
      {/* Medium detail (0.6) - Balanced */}
      <InteractiveModel
        modelPath="/assets/models/chess_set.glb"
        morphGeometryType="sphere"
        morphDetail={0.6}
        morphSpeed={0.1}
        position={[0, 0, 0]}
        scale={1.5}
        hoverScale={1.15}
        float={false}
        hoverRotate={true}
        rotationSpeed={2}
        onClick={() => console.log('Detail 0.6 clicked!')}
        interactive={true}
      />
      {/* High detail (0.9) - Smooth */}
      <InteractiveModel
        modelPath="/assets/models/chess_set.glb"
        morphGeometryType="sphere"
        morphDetail={0.9}
        morphSpeed={0.1}
        position={[2, 0, 0]}
        scale={1.5}
        hoverScale={1.15}
        float={false}
        hoverRotate={true}
        rotationSpeed={2}
        onClick={() => console.log('Detail 0.9 clicked!')}
        interactive={true}
      />
    </>
  )
}
