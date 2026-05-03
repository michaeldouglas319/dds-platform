export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown date'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function sourceDomain(url: string | null | undefined): string {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function faviconUrl(url: string | null | undefined): string {
  const domain = sourceDomain(url)
  if (!domain) return ''
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

export function severityLabel(weight: number): { label: string; level: 'low' | 'moderate' | 'high' | 'critical' } {
  if (weight >= 8) return { label: 'Critical', level: 'critical' }
  if (weight >= 5) return { label: 'High', level: 'high' }
  if (weight >= 2) return { label: 'Moderate', level: 'moderate' }
  return { label: 'Low', level: 'low' }
}
