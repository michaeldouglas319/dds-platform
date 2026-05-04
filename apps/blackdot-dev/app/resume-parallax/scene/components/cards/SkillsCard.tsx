'use client'

import { Html } from '@react-three/drei'
import { HighlightsList } from '@/components/composites/DataDisplay'

export interface SkillsCardProps {
  data: {
    highlights: string[]
    color: string
    maxItems?: number
  }
  scale?: number
}

export function SkillsCard({ data, scale = 0.6 }: SkillsCardProps) {
  return (
    <Html transform scale={scale} occlude="blending">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 w-80 space-y-3">
        {/* Color accent bar */}
        <div
          className="h-1 rounded-full w-full"
          style={{ backgroundColor: data.color }}
        />

        {/* Label */}
        <p className="text-xs font-semibold text-slate-400 uppercase">
          Key Skills & Tech
        </p>

        {/* Highlights using DataDisplay component */}
        <HighlightsList
          items={data.highlights}
          color={data.color}
          layout="grid"
          maxColumns={2}
          maxItems={data.maxItems || 6}
          textSize="xs"
          bullet={true}
          truncate={true}
        />
      </div>
    </Html>
  )
}
