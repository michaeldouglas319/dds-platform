'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import './arms-drilldown.css'

const InteractiveGlobeScene = dynamic(
  () => import('@dds/globe').then(m => m.InteractiveGlobeScene),
  { ssr: false, loading: () => <div className="arms-drilldown__loading">Loading globe...</div> }
)

export function ArmsDrilldown() {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeFilters, setActiveFilters] = useState({
    tags: new Set(),
    dateFrom: null,
    dateTo: null,
  })
  const [mapMode, setMapMode] = useState('globe') // globe | flat
  const [isLoading, setIsLoading] = useState(true)

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = new URLSearchParams({ limit: '500' })
        const resp = await fetch(`/api/arms-events?${params}`)
        const data = await resp.json()
        setEvents(data.events || [])
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to fetch events:', err)
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = events

    if (activeFilters.tags.size > 0) {
      filtered = filtered.filter(e => activeFilters.tags.has(e.tag))
    }

    if (activeFilters.dateFrom) {
      filtered = filtered.filter(e => !e.date || e.date >= activeFilters.dateFrom)
    }

    if (activeFilters.dateTo) {
      filtered = filtered.filter(e => !e.date || e.date <= activeFilters.dateTo)
    }

    setFilteredEvents(filtered)
  }, [events, activeFilters])

  // Get unique tags
  const availableTags = [...new Set(events.map(e => e.tag).filter(Boolean))]

  const toggleTag = (tag) => {
    const newTags = new Set(activeFilters.tags)
    if (newTags.has(tag)) {
      newTags.delete(tag)
    } else {
      newTags.add(tag)
    }
    setActiveFilters({ ...activeFilters, tags: newTags })
  }

  return (
    <div className="arms-drilldown">
      {/* Header */}
      <header className="arms-drilldown__header">
        <div className="arms-drilldown__header-content">
          <h1 className="arms-drilldown__title">Abundance at Arms</h1>
          <p className="arms-drilldown__subtitle">Global conflict mapping • Real-time intelligence • Source integration</p>
        </div>
        <a href="/" className="arms-drilldown__back">← Back to wiki</a>
      </header>

      {/* Main layout */}
      <div className="arms-drilldown__main">
        {/* Sidebar - Filters */}
        <aside className="arms-drilldown__sidebar">
          <div className="arms-drilldown__sidebar-section">
            <h2 className="arms-drilldown__sidebar-title">View Mode</h2>
            <div className="arms-drilldown__mode-toggle">
              <button
                className={`arms-drilldown__mode-btn ${mapMode === 'globe' ? 'active' : ''}`}
                onClick={() => setMapMode('globe')}
              >
                🌍 Globe
              </button>
              <button
                className={`arms-drilldown__mode-btn ${mapMode === 'flat' ? 'active' : ''}`}
                onClick={() => setMapMode('flat')}
              >
                🗺️ Map
              </button>
            </div>
          </div>

          <div className="arms-drilldown__sidebar-section">
            <h2 className="arms-drilldown__sidebar-title">Event Types</h2>
            <div className="arms-drilldown__tag-list">
              <button
                className={`arms-drilldown__tag ${activeFilters.tags.size === 0 ? 'active' : ''}`}
                onClick={() => setActiveFilters({ ...activeFilters, tags: new Set() })}
              >
                All Events ({events.length})
              </button>
              {availableTags.map(tag => (
                <button
                  key={tag}
                  className={`arms-drilldown__tag ${activeFilters.tags.has(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag} ({events.filter(e => e.tag === tag).length})
                </button>
              ))}
            </div>
          </div>

          <div className="arms-drilldown__sidebar-section">
            <h2 className="arms-drilldown__sidebar-title">Date Range</h2>
            <input
              type="date"
              className="arms-drilldown__date-input"
              value={activeFilters.dateFrom || ''}
              onChange={(e) => setActiveFilters({ ...activeFilters, dateFrom: e.target.value })}
              placeholder="From"
            />
            <input
              type="date"
              className="arms-drilldown__date-input"
              value={activeFilters.dateTo || ''}
              onChange={(e) => setActiveFilters({ ...activeFilters, dateTo: e.target.value })}
              placeholder="To"
            />
          </div>

          <div className="arms-drilldown__sidebar-section">
            <h2 className="arms-drilldown__sidebar-title">Results</h2>
            <p className="arms-drilldown__result-count">{filteredEvents.length} events</p>
          </div>
        </aside>

        {/* Center - Map View */}
        <div className="arms-drilldown__viewport">
          {isLoading ? (
            <div className="arms-drilldown__loading-screen">Loading globe...</div>
          ) : mapMode === 'globe' ? (
            <InteractiveGlobeScene
              events={filteredEvents}
              focusedIndex={selectedEvent ? filteredEvents.findIndex(e => e.id === selectedEvent.id) : null}
              onPointSelect={(index, event) => setSelectedEvent(event)}
              background={null}
            />
          ) : (
            <div className="arms-drilldown__flat-map">
              <p>Flat map coming soon — deck.gl/maplibre integration</p>
            </div>
          )}
        </div>

        {/* Right - Detail Panel */}
        <aside className={`arms-drilldown__details ${selectedEvent ? 'open' : ''}`}>
          {selectedEvent ? (
            <div className="arms-drilldown__event-detail">
              <button
                className="arms-drilldown__detail-close"
                onClick={() => setSelectedEvent(null)}
              >
                ✕
              </button>
              <div className="arms-drilldown__event-tag">{selectedEvent.tag || 'Event'}</div>
              <h2 className="arms-drilldown__event-name">{selectedEvent.name}</h2>

              <div className="arms-drilldown__event-meta">
                {selectedEvent.date && (
                  <div className="arms-drilldown__meta-item">
                    <span className="arms-drilldown__meta-label">Date:</span>
                    <span>{selectedEvent.date}</span>
                  </div>
                )}
                <div className="arms-drilldown__meta-item">
                  <span className="arms-drilldown__meta-label">Severity:</span>
                  <span>{Math.round(selectedEvent.weight)}</span>
                </div>
                <div className="arms-drilldown__meta-item">
                  <span className="arms-drilldown__meta-label">Source:</span>
                  <span>{selectedEvent.source}</span>
                </div>
              </div>

              {selectedEvent.url && (
                <a href={selectedEvent.url} target="_blank" rel="noreferrer" className="arms-drilldown__source-link">
                  View source ↗
                </a>
              )}
            </div>
          ) : (
            <div className="arms-drilldown__details-empty">
              <p>Click an event on the globe to view details</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
