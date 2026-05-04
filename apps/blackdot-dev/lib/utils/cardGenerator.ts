/**
 * Card Generator - Rule-based system to split JobSection into specialized cards
 *
 * Intelligently analyzes job content (paragraphs, highlights, metrics) and
 * generates 3-6 specialized cards for dynamic layout positioning.
 *
 * @category utility
 */

import type { JobSection } from '@/lib/config/content'

export enum CardType {
  SUMMARY = 'SUMMARY',
  DETAILS = 'DETAILS',
  IMPACT = 'IMPACT',
  SKILLS = 'SKILLS',
  METRICS = 'METRICS',
  TIMELINE = 'TIMELINE'
}

export interface CardDefinition {
  type: CardType
  priority: number
  data: Record<string, unknown>
}

/**
 * Extract metrics from text using pattern matching
 * Looks for: percentages (95%), augmented numbers (12+), multipliers (2x)
 */
function extractMetrics(text: string): string[] {
  const metrics: string[] = []
  const seen = new Set<string>()

  // Pattern 1: Percentages (95%)
  const percentMatches = text.match(/(\d+)%/g)
  if (percentMatches) {
    percentMatches.forEach(match => {
      if (!seen.has(match)) {
        metrics.push(match)
        seen.add(match)
      }
    })
  }

  // Pattern 2: Augmented numbers (12+, 2x)
  const augmentedMatches = text.match(/(\d+)([+xX])/g)
  if (augmentedMatches) {
    augmentedMatches.forEach(match => {
      if (!seen.has(match)) {
        metrics.push(match)
        seen.add(match)
      }
    })
  }

  return metrics
}

/**
 * Check if text contains significant metrics
 */
function hasMetrics(paragraphs: string[]): boolean {
  const fullText = paragraphs.join(' ')
  return extractMetrics(fullText).length > 0
}

/**
 * Generate specialized cards from job section
 *
 * Generation Rules:
 * - SUMMARY (always): Company, role, period, color
 * - DETAILS (always): First 1-2 paragraphs
 * - IMPACT (if >3 paragraphs): Remaining paragraphs
 * - SKILLS (if >4 highlights): All highlights as badges
 * - METRICS (if metrics detected): Extracted numbers
 * - TIMELINE (always): Duration visualization
 */
export function generateCards(job: JobSection): CardDefinition[] {
  const cards: CardDefinition[] = []
  const { paragraphs = [], highlights = [] } = job.content || {}

  // 1. SUMMARY - Always generated (Priority 1: Most important)
  cards.push({
    type: CardType.SUMMARY,
    priority: 1,
    data: {
      company: job.company,
      role: job.role,
      period: job.period,
      color: job.color,
      heading: job.content.heading
    }
  })

  // 2. DETAILS - First 1-2 paragraphs (Priority 2)
  if (paragraphs.length > 0) {
    const detailsCount = Math.min(2, paragraphs.length)
    cards.push({
      type: CardType.DETAILS,
      priority: 2,
      data: {
        paragraphs: paragraphs.slice(0, detailsCount),
        color: job.color
      }
    })
  }

  // 3. IMPACT - Remaining paragraphs if >3 total (Priority 3)
  if (paragraphs.length > 3) {
    cards.push({
      type: CardType.IMPACT,
      priority: 3,
      data: {
        paragraphs: paragraphs.slice(2),
        color: job.color
      }
    })
  }

  // 4. SKILLS - Highlights as badges if >4 (Priority 4)
  if (highlights.length > 4) {
    cards.push({
      type: CardType.SKILLS,
      priority: 4,
      data: {
        highlights,
        color: job.color,
        maxItems: 6
      }
    })
  }

  // 5. METRICS - Auto-extracted numbers if detected (Priority 5)
  if (hasMetrics(paragraphs)) {
    const fullText = paragraphs.join(' ')
    const metrics = extractMetrics(fullText)
    if (metrics.length > 0) {
      cards.push({
        type: CardType.METRICS,
        priority: 5,
        data: {
          metrics,
          color: job.color,
          content: fullText
        }
      })
    }
  }

  // 6. TIMELINE - Always generated (Priority 6)
  cards.push({
    type: CardType.TIMELINE,
    priority: 6,
    data: {
      startDate: new Date(job.period.split('-')[0].trim() + ' 1'),
      endDate: job.period.split('-')[1].trim() === 'Present'
        ? new Date()
        : new Date(job.period.split('-')[1].trim() + ' 1'),
      color: job.color
    }
  })

  // Sort by priority to ensure consistent ordering
  return cards.sort((a, b) => a.priority - b.priority)
}

/**
 * Calculate target card count based on job content
 * Ensures reasonable number of cards (3-6)
 */
export function getExpectedCardCount(job: JobSection): number {
  const { paragraphs = [], highlights = [] } = job.content || {}
  let count = 2 // SUMMARY + TIMELINE (always)

  // Add DETAILS
  if (paragraphs.length > 0) count++

  // Add IMPACT if enough paragraphs
  if (paragraphs.length > 3) count++

  // Add SKILLS if enough highlights
  if (highlights.length > 4) count++

  // Add METRICS if detected
  if (hasMetrics(paragraphs)) count++

  return Math.max(3, Math.min(count, 6))
}
