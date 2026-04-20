'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { GlobePoint } from '@dds/globe'

const InteractiveGlobeScene = dynamic(
  () => import('@dds/globe').then((m) => m.InteractiveGlobeScene),
  { ssr: false },
)

type GlobeEventRow = GlobePoint & {
  source: string
  external_id: string
}

type ArmsMapSceneProps = {
  filteredEvents: GlobeEventRow[]
  focusedIndex: number | null
  onPointSelect?: (index: number, event: GlobeEventRow) => void
}

export function ArmsMapScene({
  filteredEvents,
  focusedIndex,
  onPointSelect,
}: ArmsMapSceneProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        background: 'hsl(228 30% 4%)',
      }}
    >
      <InteractiveGlobeScene
        events={filteredEvents}
        focusedIndex={focusedIndex}
        onPointSelect={(index, event) => {
          if (onPointSelect) {
            onPointSelect(index, event as GlobeEventRow)
          }
        }}
      />
    </div>
  )
}
