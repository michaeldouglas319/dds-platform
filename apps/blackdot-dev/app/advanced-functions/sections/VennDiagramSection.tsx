'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SkillOverlapVenn from '@/components/SkillOverlapVenn'
import { surveillanceSystemsConfig } from '@/lib/config/verticals/surveillance-systems.config'
import { rapidManufacturingConfig } from '@/lib/config/verticals/rapid-manufacturing.config'

/**
 * Skill Overlap Venn Diagram Section
 * Visualizes which skills are shared across umbrellas and verticals
 */

export function VennDiagramSection() {
  const [selectedVertical, setSelectedVertical] = useState<'surveillance' | 'manufacturing'>(
    'surveillance'
  )
  const [expandedUmbrella, setExpandedUmbrella] = useState<number | null>(null)

  const verticals = [
    {
      id: 'surveillance',
      name: 'Surveillance Systems',
      config: surveillanceSystemsConfig,
      icon: '📹',
    },
    {
      id: 'manufacturing',
      name: 'Rapid Manufacturing',
      config: rapidManufacturingConfig,
      icon: '🏭',
    },
  ]

  const currentVertical = verticals.find((v) => v.id === selectedVertical)

  // Calculate skill statistics
  const calculateStats = () => {
    if (!currentVertical) return { total: 0, unique: 0, shared: 0, umbrellas: 0 }

    const allSkills = new Set<string>()
    const skillCounts = new Map<string, number>()

    currentVertical.config.expertiseUmbrellas.forEach((umbrella: any) => {
      umbrella.requiredSkills.forEach((skill: any) => {
        allSkills.add(skill.name)
        skillCounts.set(skill.name, (skillCounts.get(skill.name) ?? 0) + 1)
      })
    })

    const sharedSkills = Array.from(skillCounts.values()).filter((count) => count > 1).length
    const uniqueSkills = allSkills.size - sharedSkills

    return {
      total: allSkills.size,
      unique: uniqueSkills,
      shared: sharedSkills,
      umbrellas: currentVertical.config.expertiseUmbrellas.length,
    }
  }

  const stats = calculateStats()

  return (
    <div className="space-y-8">
      {/* Vertical Selection */}
      <div className="flex gap-4">
        {verticals.map((vertical) => (
          <button
            key={vertical.id}
            onClick={() => setSelectedVertical(vertical.id as 'surveillance' | 'manufacturing')}
            className={`flex-1 rounded-lg border transition-all p-4 ${
              selectedVertical === vertical.id
                ? 'border-primary bg-primary/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <span className="text-2xl">{vertical.icon}</span>
            <p className="font-semibold mt-2">{vertical.name}</p>
          </button>
        ))}
      </div>

      {/* Statistics */}
      {currentVertical && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Skills</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Shared Across Umbrellas</p>
            <p className="text-3xl font-bold text-amber-500 mt-1">{stats.shared}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Unique to One Umbrella</p>
            <p className="text-3xl font-bold text-blue-500 mt-1">{stats.unique}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Expertise Umbrellas</p>
            <p className="text-3xl font-bold text-purple-500 mt-1">{stats.umbrellas}</p>
          </Card>
        </div>
      )}

      {/* Venn Diagram */}
      {currentVertical && (
        <div className="space-y-6">
          <div className="rounded-lg border border-white/10 bg-background/50 p-6">
            <h2 className="text-2xl font-bold mb-2">Skill Overlap Visualization</h2>
            <p className="text-muted-foreground">
              Venn diagram showing which skills appear in multiple umbrellas
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-background to-background/50">
            <div style={{ height: '600px' }} className="w-full">
              <SkillOverlapVenn vertical={currentVertical.config} />
            </div>
          </div>

          {/* Umbrella Details */}
          <Card className="p-6">
            <h3 className="font-semibold mb-6">Umbrella Breakdown</h3>
            <div className="space-y-4">
              {currentVertical.config.expertiseUmbrellas.map((umbrella: any, idx: number) => {
                const isExpanded = expandedUmbrella === idx
                const sharedSkillCount = umbrella.requiredSkills.filter((skill: any) => {
                  return currentVertical.config.expertiseUmbrellas.some(
                    (other: any, oidx: number) =>
                      oidx !== idx && other.skills.some((s: any) => s.name === skill.name)
                  )
                }).length

                return (
                  <div key={idx} className="border-l-4 border-primary/50 pl-4">
                    <button
                      onClick={() => setExpandedUmbrella(isExpanded ? null : idx)}
                      className="flex items-center justify-between w-full hover:opacity-80 transition-opacity"
                    >
                      <div className="text-left">
                        <h4 className="font-medium">{umbrella.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {umbrella.requiredSkills.length} total skills •{' '}
                          <span className="text-amber-500">{sharedSkillCount} shared</span>
                        </p>
                      </div>
                      <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                        {umbrella.requiredSkills.map((skill: any, sidx: number) => {
                          const appearsInOthers = currentVertical.config.expertiseUmbrellas.some(
                            (other: any, oidx: number) =>
                              oidx !== idx && other.skills.some((s: any) => s.name === skill.name)
                          )

                          return (
                            <div key={sidx} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                {appearsInOthers && (
                                  <span
                                    className="inline-block w-2 h-2 rounded-full bg-amber-500"
                                    title="Shared with other umbrellas"
                                  />
                                )}
                                {skill.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {skill.founderSuitability}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Insights */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              💡 Key Insights
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                • {stats.shared} skills appear in multiple umbrellas - invest heavily in these
                areas
              </li>
              <li>
                • {stats.unique} skills are unique to single umbrellas - consider specialist roles
              </li>
              <li>
                • Core competencies span {stats.umbrellas} expertise areas - ensure well-rounded
                team coverage
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  )
}
