'use client'

import { TAG_COLORS, TAG_NAMES } from '@dds/types'
import { timeAgo, sourceDomain, faviconUrl, severityLabel } from '../lib/arms-time'
import './arms-event-detail.css'

export function ArmsEventDetail({ event, onClose }) {
  if (!event) return null

  const tag = event.tag || 'news'
  const [r, g, b] = TAG_COLORS[tag] || [100, 150, 255]
  const tagColor = `rgb(${r}, ${g}, ${b})`
  const tagBg = `rgba(${r}, ${g}, ${b}, 0.15)`
  const tagBorder = `rgba(${r}, ${g}, ${b}, 0.4)`
  const tagName = TAG_NAMES[tag] || tag

  const domain = sourceDomain(event.url)
  const favicon = faviconUrl(event.url)
  const severity = severityLabel(event.weight || 0)

  return (
    <div className="arms-event-detail">
      <button className="arms-event-detail__close" onClick={onClose} aria-label="Close">✕</button>

      {/* Tag + time row */}
      <div className="arms-event-detail__meta-row">
        <span
          className="arms-event-detail__tag"
          style={{ color: tagColor, background: tagBg, borderColor: tagBorder }}
        >
          {tagName}
        </span>
        <span className="arms-event-detail__time">{timeAgo(event.date)}</span>
      </div>

      {/* Headline */}
      <h2 className="arms-event-detail__headline">{event.name}</h2>

      <div className="arms-event-detail__divider" />

      {/* Source row */}
      {domain && (
        <div className="arms-event-detail__source-row">
          {favicon && (
            <img
              src={favicon}
              alt=""
              className="arms-event-detail__favicon"
              width={16}
              height={16}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          )}
          <span className="arms-event-detail__domain">{domain}</span>
        </div>
      )}

      {/* Severity */}
      <div className="arms-event-detail__severity-row">
        <span className="arms-event-detail__severity-label">Severity</span>
        <span className={`arms-event-detail__severity-badge arms-event-detail__severity-badge--${severity.level}`}>
          {severity.label}
        </span>
      </div>

      <div className="arms-event-detail__divider" />

      {/* Coordinates */}
      <div className="arms-event-detail__coords">
        {event.lat?.toFixed(2)}°, {event.lon?.toFixed(2)}°
      </div>

      {/* CTA */}
      {event.url && (
        <a
          href={event.url}
          target="_blank"
          rel="noreferrer"
          className="arms-event-detail__cta"
        >
          Open source ↗
        </a>
      )}
    </div>
  )
}
