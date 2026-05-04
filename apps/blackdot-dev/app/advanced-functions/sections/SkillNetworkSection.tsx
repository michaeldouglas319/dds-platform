'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import VerticalSkillNetwork from '@/components/VerticalSkillNetwork'
import { surveillanceSystemsConfig } from '@/lib/config/verticals/surveillance-systems.config'
import { rapidManufacturingConfig } from '@/lib/config/verticals/rapid-manufacturing.config'

/**
 * Skill Network Visualization Section
 * Interactive neural network showing vertical requirements and dependencies
 */

export function SkillNetworkSection() {
  const [selectedVertical, setSelectedVertical] = useState<'surveillance' | 'manufacturing'>(
    'surveillance'
  )

  const verticals = [
    {
      id: 'surveillance',
      name: 'Surveillance Systems',
      score: 9.2,
      config: surveillanceSystemsConfig,
      description: 'CCTV installation and monitoring systems integration',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'manufacturing',
      name: 'Rapid Manufacturing',
      score: 9.1,
      config: rapidManufacturingConfig,
      description: 'Advanced manufacturing with software optimization',
      color: 'from-purple-500 to-pink-500',
    },
  ]

  const currentVertical = verticals.find((v) => v.id === selectedVertical)

  return (
    <div className="space-y-8">
      {/* Selection Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {verticals.map((vertical) => (
          <Card
            key={vertical.id}
            className={`cursor-pointer overflow-hidden transition-all ${
              selectedVertical === vertical.id
                ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedVertical(vertical.id as 'surveillance' | 'manufacturing')}
          >
            <div className={`h-24 bg-gradient-to-r ${vertical.color} opacity-20`} />
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{vertical.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{vertical.description}</p>
                </div>
                <Badge className="bg-primary/20 text-primary text-lg px-3 py-1">
                  {vertical.score}/10
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Network Visualization */}
      {currentVertical && (
        <div className="space-y-6">
          <div className="rounded-lg border border-white/10 bg-background/50 p-6">
            <h2 className="text-2xl font-bold mb-2">{currentVertical.name}</h2>
            <p className="text-muted-foreground">
              Interactive neural network showing skill requirements across expertise umbrellas
            </p>
          </div>

          {/* Canvas */}
          <div className="overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-background to-background/50">
            <div style={{ height: '700px' }} className="w-full">
              <VerticalSkillNetwork vertical={currentVertical.config} />
            </div>
          </div>

          {/* Details */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Network Explanation</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    Founder-Fillable
                  </p>
                  <p>Skills the founder can develop or hire for quickly</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    Must-Hire Experts
                  </p>
                  <p>Specialized roles requiring external expertise</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    Co-Founder Ideal
                  </p>
                  <p>Critical skills best handled by dedicated co-founder</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Umbrellas List */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Expertise Umbrellas</h3>
            <div className="space-y-4">
              {currentVertical.config.expertiseUmbrellas.map((umbrella: any, idx: number) => (
                <div key={idx} className="border-l-2 border-primary/50 pl-4">
                  <h4 className="font-medium flex items-center justify-between">
                    {umbrella.name}
                    <Badge variant="outline">{umbrella.requiredSkills.length} skills</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{umbrella.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {umbrella.requiredSkills.slice(0, 3).map((skill: any, sidx: number) => (
                      <Badge key={sidx} variant="secondary" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                    {umbrella.requiredSkills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{umbrella.requiredSkills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
