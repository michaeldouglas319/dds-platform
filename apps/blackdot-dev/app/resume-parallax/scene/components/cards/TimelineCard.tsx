'use client'

import { Html } from '@react-three/drei'
import { DurationBar } from '@/components/composites/DataDisplay'

export interface TimelineCardProps {
  data: {
    startDate: Date
    endDate: Date
    color: string
  }
  scale?: number
}

export function TimelineCard({ data, scale = 0.6 }: TimelineCardProps) {
  return (
    <Html transform scale={scale} occlude="blending">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 w-72 space-y-3">
        {/* Color accent bar */}
        <div
          className="h-1 rounded-full w-full"
          style={{ backgroundColor: data.color }}
        />

        {/* Label */}
        <p className="text-xs font-semibold text-slate-400 uppercase">
          Timeline
        </p>

        {/* Duration bar using DataDisplay component */}
        <div className="scale-90 origin-top-left">
          <DurationBar
            startDate={data.startDate}
            endDate={data.endDate}
            color={data.color}
            showLabel={false}
            showDuration={true}
            format="both"
            animate={true}
            metadata={{
              label: 'Employment Duration'
            }}
          />
        </div>
      </div>
    </Html>
  )
}
