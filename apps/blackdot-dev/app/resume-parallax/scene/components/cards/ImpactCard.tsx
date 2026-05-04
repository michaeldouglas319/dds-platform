'use client'

import { Html } from '@react-three/drei'

export interface ImpactCardProps {
  data: {
    paragraphs: string[]
    color: string
  }
  scale?: number
}

export function ImpactCard({ data, scale = 0.6 }: ImpactCardProps) {
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
          Impact & Achievements
        </p>

        {/* Paragraphs */}
        <div className="space-y-2">
          {data.paragraphs.map((paragraph, idx) => (
            <p
              key={idx}
              className="text-xs text-slate-300 leading-relaxed line-clamp-3"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </Html>
  )
}
