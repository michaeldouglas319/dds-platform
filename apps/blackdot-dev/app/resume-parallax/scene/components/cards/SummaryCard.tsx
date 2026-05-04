'use client'

import { Html } from '@react-three/drei'

export interface SummaryCardProps {
  data: {
    company: string
    role: string
    period: string
    color: string
    heading?: string
  }
  scale?: number
}

export function SummaryCard({ data, scale = 0.6 }: SummaryCardProps) {
  return (
    <Html transform scale={scale} occlude="blending">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 w-72 space-y-2">
        {/* Color accent bar */}
        <div
          className="h-1 rounded-full w-full"
          style={{ backgroundColor: data.color }}
        />

        {/* Company name */}
        <h3
          className="text-sm font-bold truncate"
          style={{ color: data.color }}
        >
          {data.company}
        </h3>

        {/* Role */}
        <p className="text-xs text-slate-300 font-semibold">
          {data.role}
        </p>

        {/* Period */}
        <p className="text-xs text-slate-400">
          {data.period}
        </p>

        {/* Heading if available */}
        {data.heading && (
          <p className="text-xs text-slate-500 italic border-t border-slate-700/50 pt-2">
            {data.heading}
          </p>
        )}
      </div>
    </Html>
  )
}
