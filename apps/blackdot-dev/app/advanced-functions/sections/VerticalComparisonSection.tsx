'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  scoreVertical,
  compareVerticals,
  getHiringBudgetSummary,
  getGrantFundingPotential,
} from '@/lib/utils/verticalAnalysis'
import { surveillanceSystemsConfig } from '@/lib/config/verticals/surveillance-systems.config'
import { rapidManufacturingConfig } from '@/lib/config/verticals/rapid-manufacturing.config'

/**
 * Vertical Comparison Section
 * Side-by-side analysis of verticals with scoring and metrics
 */

export function VerticalComparisonSection() {
  const verticals = [
    {
      name: 'Surveillance Systems',
      config: surveillanceSystemsConfig,
      color: 'from-blue-500 to-cyan-500',
      icon: '📹',
    },
    {
      name: 'Rapid Manufacturing',
      config: rapidManufacturingConfig,
      color: 'from-purple-500 to-pink-500',
      icon: '🏭',
    },
  ]

  // Calculate scores and metrics
  const scores = verticals.map((v) => ({
    ...v,
    score: scoreVertical(v.config),
    hiring: getHiringBudgetSummary(v.config),
    grants: getGrantFundingPotential(v.config),
  }))

  const comparison = compareVerticals(verticals.map((v) => v.config))

  // Get recommendation
  const topRanked = comparison[0]
  const topConfig = verticals.find((v) => v.config.id === topRanked.verticalId)

  return (
    <div className="space-y-8">
      {/* Overall Rankings */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Vertical Rankings</h2>
        {comparison.map((result, idx) => {
          const config = verticals.find((v) => v.config.id === result.verticalId)
          const scoreData = scores.find((s) => s.config.id === result.verticalId)

          return (
            <Card key={idx} className="p-6 border-l-4 border-primary/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{config?.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold">{config?.name}</h3>
                      <p className="text-sm text-muted-foreground">Rank #{idx + 1}</p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid gap-3 md:grid-cols-3 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Score</p>
                      <p className="text-2xl font-bold text-primary">
                        {scoreData?.score.totalScore.toFixed(1)}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time to Revenue</p>
                      <p className="font-mono text-sm">
                        {config?.config.timeToRevenue?.min ?? '?'}-{config?.config.timeToRevenue?.max ?? '?'} mo
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Market TAM</p>
                      <p className="font-mono text-sm">
                        {(() => {
                          const analysis = config?.config.marketAnalysis as Record<string, unknown>;
                          const tam = (analysis?.tam as Record<string, unknown>)?.value ?? 0;
                          return `$${((tam as number) / 1e9).toFixed(0)}B`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendation Badge */}
                {idx === 0 && (
                  <Badge className="h-fit bg-amber-500/20 text-amber-700 dark:text-amber-400">
                    ⭐ TOP CHOICE
                  </Badge>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Detailed Scoring */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Detailed Scoring Analysis</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {scores.map((item) => (
            <Card key={item.name} className="p-6">
              <h3 className="text-lg font-semibold mb-6">{item.name}</h3>

              {/* Score Bars */}
              <div className="space-y-4">
                {Object.entries(item.score.breakdown).map(([key, value]) => {
                  const label = key
                    .replace(/([A-Z])/g, ' $1')
                    .trim()
                    .split(' ')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')

                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-sm font-mono">{value.toFixed(1)}/10</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/50 transition-all"
                          style={{ width: `${(value / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Recommendation */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm font-medium text-muted-foreground mb-2">Recommendation</p>
                <Badge variant="outline" className="capitalize">
                  {item.score.recommendation}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Financial Analysis */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Financial Requirements</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {scores.map((item) => (
            <Card key={`financial-${item.name}`} className="p-6">
              <h3 className="text-lg font-semibold mb-4">{item.name}</h3>

              <div className="space-y-4">
                {/* Hiring Budget */}
                <div className="rounded-lg bg-white/5 p-4">
                  <p className="text-sm text-muted-foreground mb-2">Hiring Budget Required</p>
                  <p className="text-2xl font-bold text-red-500">
                    ${(item.hiring.totalCost.max / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.hiring.mustHire} specialist roles needed
                  </p>
                </div>

                {/* Grant Funding */}
                <div className="rounded-lg bg-white/5 p-4">
                  <p className="text-sm text-muted-foreground mb-2">Non-Dilutive Grant Potential</p>
                  <p className="text-2xl font-bold text-green-500">
                    ${(item.grants.totalPotential.max / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.grants.activeGrants} programs available
                  </p>
                </div>

                {/* Founder Control */}
                <div className="rounded-lg bg-white/5 p-4">
                  <p className="text-sm text-muted-foreground mb-2">Founder-Fillable Roles</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {Math.round(
                      (item.hiring.founderFillable /
                        (item.hiring.founderFillable +
                          item.hiring.mustHire)) *
                        100
                    )}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.hiring.founderFillable} of{' '}
                    {item.hiring.founderFillable + item.hiring.mustHire}{' '}
                    core roles
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Top Choice Details */}
      {topConfig && (
        <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{topConfig.icon}</span>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Recommended Choice</h2>
              <p className="text-muted-foreground mb-4">
                {topConfig.name} scores highest overall due to optimal balance of founder control,
                market size, and time to revenue.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Market Opportunity</p>
                  <p className="font-semibold">
                    {(() => {
                      const analysis = topConfig?.config.marketAnalysis as Record<string, unknown>;
                      const tam = (analysis?.tam as Record<string, unknown>)?.value ?? 0;
                      return `$${((tam as number) / 1e9).toFixed(0)}B TAM`;
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Timeline</p>
                  <p className="font-semibold">
                    {topConfig?.config.timeToRevenue?.min ?? '?'}-{topConfig?.config.timeToRevenue?.max ?? '?'}{' '}
                    months
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Founder Suitability</p>
                  <p className="font-semibold">Excellent Fit</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Methodology */}
      <Card className="p-6 bg-background/50 border-white/10">
        <h3 className="font-semibold mb-4">Scoring Methodology</h3>
        <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
          <div>
            <p className="font-semibold text-foreground mb-2">Weighted Factors</p>
            <ul className="space-y-1">
              <li>• Grant Eligibility: 5%</li>
              <li>• Founder Suitability: 35%</li>
              <li>• Market Size: 25%</li>
              <li>• Time to Revenue: 25%</li>
              <li>• Regulatory Complexity: 10%</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-2">Key Metrics</p>
            <ul className="space-y-1">
              <li>• Market TAM, CAGR, and growth projections</li>
              <li>• Licensing and regulatory burden assessment</li>
              <li>• Hiring requirements and specialist costs</li>
              <li>• Grant funding availability and award amounts</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
