'use client';

/**
 * Canvas3D Demo Page
 * Shows how to use Canvas3DSlide with config-driven sections
 */

import { useState } from 'react';
import { Canvas3DSlide } from '@/components/canvas3d';
import { canvas3dExamples } from '@/lib/config/examples/canvas3d-examples.config';

export default function Canvas3DDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const section = canvas3dExamples[activeIndex];

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        <h1 className="text-2xl font-bold">Canvas3D Config Demo</h1>
        <div className="flex gap-2">
          {canvas3dExamples.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`rounded px-4 py-2 transition ${
                i === activeIndex ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              Example {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Content Card */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-800 p-8">
          <div className="rounded-lg bg-gray-900 p-6">
            <div className="mb-2 text-sm text-gray-400">{section.page.toUpperCase()}</div>
            <h2 className="mb-2 text-3xl font-bold" style={{ color: section.color }}>
              {section.title}
            </h2>
            {section.subtitle && <p className="mb-6 text-lg text-gray-400">{section.subtitle}</p>}

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{section.content.heading}</h3>
              {section.content.paragraphs?.map((p: string | { description: string }, i: number) => (
                <p key={i} className="text-gray-300">
                  {typeof p === 'string' ? p : p.description}
                </p>
              ))}

              {section.content.stats && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {section.content.stats.map((stat: { value: string | number; label: string }, i: number) => (
                    <div key={i} className="rounded bg-gray-800 p-4">
                      <div className="text-2xl font-bold" style={{ color: section.color }}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {section.content.features && (
                <div className="mt-6">
                  <div className="mb-2 font-semibold">Features:</div>
                  <div className="flex flex-wrap gap-2">
                    {section.content.features.map((feature: string, i: number) => (
                      <span key={i} className="rounded-full bg-gray-800 px-3 py-1 text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: 3D Canvas */}
        <div className="w-1/2">
          {section.canvas3d ? (
            <Canvas3DSlide config={section.canvas3d} />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-600">No 3D config available</div>
          )}
        </div>
      </div>

      {/* Footer: Config Preview */}
      <div className="border-t border-gray-800 p-4">
        <details className="cursor-pointer">
          <summary className="font-semibold text-gray-400">View Config JSON</summary>
          <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-4 text-xs text-gray-300">
            {JSON.stringify(section.canvas3d, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
