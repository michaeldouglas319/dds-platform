'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

/**
 * Advanced Functions Showcase
 * Demonstrates complex features and visualizations:
 * - Skill network graphs
 * - Venn diagram overlaps
 * - Vertical comparisons
 * - Interactive controls
 */

// Dynamically import heavy components
const SkillNetworkSection = dynamic(
  () => import('./sections/SkillNetworkSection').then((m) => m.SkillNetworkSection),
  { loading: () => <div className="p-8 text-center">Loading Network...</div> }
)

const VennDiagramSection = dynamic(
  () => import('./sections/VennDiagramSection').then((m) => m.VennDiagramSection),
  { loading: () => <div className="p-8 text-center">Loading Venn...</div> }
)

const VerticalComparisonSection = dynamic(
  () => import('./sections/VerticalComparisonSection').then((m) => m.VerticalComparisonSection),
  { loading: () => <div className="p-8 text-center">Loading Comparison...</div> }
)

type Section = 'network' | 'venn' | 'comparison'

export default function AdvancedFunctionsPage() {
  const [activeSection, setActiveSection] = useState<Section>('network')

  const sections: { id: Section; label: string; description: string }[] = [
    {
      id: 'network',
      label: 'Skill Network',
      description: 'Interactive neural network visualization of vertical requirements',
    },
    {
      id: 'venn',
      label: 'Skill Overlap',
      description: 'Venn diagram showing skill intersections across umbrellas',
    },
    {
      id: 'comparison',
      label: 'Vertical Comparison',
      description: 'Side-by-side comparison scoring and analysis',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Advanced Functions</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Showcase of sophisticated visualizations and animations
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3">
          {sections.map((section) => (
            <Button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              variant={activeSection === section.id ? 'default' : 'outline'}
              className="transition-all"
            >
              {section.label}
            </Button>
          ))}
        </div>

        {/* Section Description */}
        <div className="mt-6">
          <p className="text-muted-foreground">
            {sections.find((s) => s.id === activeSection)?.description}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="min-h-[600px]">
          {activeSection === 'network' && <SkillNetworkSection />}
          {activeSection === 'venn' && <VennDiagramSection />}
          {activeSection === 'comparison' && <VerticalComparisonSection />}
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-white/10 bg-background/50 py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-semibold">About This Showcase</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Advanced visualizations demonstrating complex data relationships and interactive 3D
                animations. Built with React Three Fiber, GSAP, D3.js, and custom WebGL shaders.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold">Performance</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Dynamically loaded components with lazy loading. Each section optimized for
                performance with adaptive quality settings based on device capabilities.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
