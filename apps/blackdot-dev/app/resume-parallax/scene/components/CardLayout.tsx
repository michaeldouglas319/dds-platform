'use client'

import { useMemo } from 'react'
import type { JobSection } from '@/lib/config/content'
import type { CardLayoutType } from '@/lib/config/design/cardLayouts.config'
import {
  generateCards,
  CardType,
  type CardDefinition
} from '@/lib/utils/cardGenerator'
import {
  calculateCardPositions,
  getLayoutConfig,
  CARD_LAYOUT_PRESETS,
  type CardLayoutConfig
} from '@/lib/config/design/cardLayouts.config'
import {
  SummaryCard,
  DetailsCard,
  ImpactCard,
  SkillsCard,
  MetricsCard,
  TimelineCard
} from './cards'

export interface CardLayoutProps {
  job: JobSection
  layout?: CardLayoutType | CardLayoutConfig
  scale?: number
}

/**
 * CardLayout - Main orchestrator for card-based job visualization
 *
 * Connects the generative card system with dynamic layout positioning.
 * Intelligently splits job data into 3-6 specialized cards and positions
 * them in 3D space using configurable layouts.
 *
 * @category composite
 * @layer 2
 */
export function CardLayout({ job, layout = 'arc', scale = 0.6 }: CardLayoutProps) {
  // Get layout configuration
  const layoutConfig = useMemo(() => {
    return getLayoutConfig(layout)
  }, [layout])

  // Generate cards from job data
  const cards = useMemo(() => {
    return generateCards(job)
  }, [job])

  // Calculate positions for cards
  const positions = useMemo(() => {
    return calculateCardPositions(cards.length, layoutConfig)
  }, [cards.length, layoutConfig])

  /**
   * Render appropriate card component based on type
   */
  function renderCard(card: CardDefinition, position: [number, number, number]) {
    switch (card.type) {
      case CardType.SUMMARY:
        return (
          <group key={`${card.type}-0`} position={position}>
            <SummaryCard
              data={card.data as Parameters<typeof SummaryCard>[0]['data']}
              scale={scale}
            />
          </group>
        )

      case CardType.DETAILS:
        return (
          <group key={`${card.type}-0`} position={position}>
            <DetailsCard
              data={card.data as Parameters<typeof DetailsCard>[0]['data']}
              scale={scale}
            />
          </group>
        )

      case CardType.IMPACT:
        return (
          <group key={`${card.type}-0`} position={position}>
            <ImpactCard
              data={card.data as Parameters<typeof ImpactCard>[0]['data']}
              scale={scale}
            />
          </group>
        )

      case CardType.SKILLS:
        return (
          <group key={`${card.type}-0`} position={position}>
            <SkillsCard
              data={card.data as Parameters<typeof SkillsCard>[0]['data']}
              scale={scale}
            />
          </group>
        )

      case CardType.METRICS:
        return (
          <group key={`${card.type}-0`} position={position}>
            <MetricsCard
              data={card.data as Parameters<typeof MetricsCard>[0]['data']}
              scale={scale}
            />
          </group>
        )

      case CardType.TIMELINE:
        return (
          <group key={`${card.type}-0`} position={position}>
            <TimelineCard
              data={card.data as Parameters<typeof TimelineCard>[0]['data']}
              scale={scale}
            />
          </group>
        )

      default:
        return null
    }
  }

  return (
    <group>
      {cards.map((card, index) => {
        const position = positions[index]
        return renderCard(card, position)
      })}
    </group>
  )
}

/**
 * Export layout type for external use
 */
export type { CardLayoutType, CardLayoutConfig }
export { CARD_LAYOUT_PRESETS }
