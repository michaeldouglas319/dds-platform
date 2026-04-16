import type { GlobePoint } from './types'

export const CATEGORY_COLORS: Readonly<Record<string, string>> = {
  lethal: '#ff3355',
  protest: '#ff9933',
  political: '#aa33ff',
  infrastructure: '#3377ff',
  cyber: '#33ff99',
  displacement: '#ffdd33',
  famine: '#aa5533',
  disease: '#eeeeee',
  disaster: '#33ccff',
  science: '#000000',
}

export function resolveColor(e: GlobePoint, fallback: string): string {
  if (e.color) return e.color
  if (e.tag && CATEGORY_COLORS[e.tag]) return CATEGORY_COLORS[e.tag]
  return fallback
}
