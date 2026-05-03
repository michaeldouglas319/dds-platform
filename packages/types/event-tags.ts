/**
 * Event tag definitions — single source of truth for event categorization
 * Tags, colors, and metadata for conflict event visualization
 */

export const EVENT_TAGS = {
  lethal: 'lethal',
  disaster: 'disaster',
  geopolitical: 'geopolitical',
  military: 'military',
  news: 'news',
  social: 'social',
  'tech-news': 'tech-news',
} as const

export type EventTag = typeof EVENT_TAGS[keyof typeof EVENT_TAGS]

export const TAG_COLORS: Record<EventTag, [number, number, number]> = {
  lethal: [255, 100, 100],
  disaster: [255, 150, 0],
  geopolitical: [255, 100, 100],
  military: [255, 80, 80],
  news: [100, 150, 255],
  social: [100, 255, 100],
  'tech-news': [255, 200, 100],
}

export const TAG_NAMES: Record<EventTag, string> = {
  lethal: 'Lethal Conflict',
  disaster: 'Disaster',
  geopolitical: 'Geopolitical',
  military: 'Military Activity',
  news: 'News',
  social: 'Social Movement',
  'tech-news': 'Tech News',
}
