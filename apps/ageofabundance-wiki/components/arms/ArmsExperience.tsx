'use client'

import { useEffect, useCallback, useMemo, useState } from 'react'
import type { GlobePoint } from '@dds/globe'
import { ArmsMapScene } from './ArmsMapScene'
import { ArmsArticleLinks } from './ArmsArticleLinks'
import { ArmsTableView } from './ArmsTableView'

type GlobeEventRow = GlobePoint & {
  source: string
  external_id: string
}

type ArmsExperienceState = {
  events: GlobeEventRow[]
  filteredEvents: GlobeEventRow[]
  selectedEvent: GlobeEventRow | null
  selectedIndex: number | null
  mode: 'globe' | 'table'
  activeTag: string | null
  dateRange: { from: string | null; to: string | null }
  isLoading: boolean
  error: string | null
}

export default function ArmsExperience() {
  const [state, setState] = useState<ArmsExperienceState>({
    events: [],
    filteredEvents: [],
    selectedEvent: null,
    selectedIndex: null,
    mode: 'globe',
    activeTag: null,
    dateRange: { from: null, to: null },
    isLoading: true,
    error: null,
  })

  // Fetch events from API on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setState((s) => ({ ...s, isLoading: true, error: null }))
        const params = new URLSearchParams()
        if (state.activeTag && state.activeTag !== 'all') {
          params.set('tag', state.activeTag)
        }
        if (state.dateRange.from) {
          params.set('from', state.dateRange.from)
        }
        if (state.dateRange.to) {
          params.set('to', state.dateRange.to)
        }
        params.set('limit', '500')

        const res = await fetch(`/api/arms-events?${params.toString()}`)
        const data = (await res.json()) as { events: GlobeEventRow[] }
        setState((s) => ({
          ...s,
          events: data.events ?? [],
          isLoading: false,
        }))
      } catch (err) {
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : 'Failed to fetch events',
          isLoading: false,
        }))
      }
    }

    fetchEvents()
  }, [state.activeTag, state.dateRange])

  // Compute filtered events based on tag + date
  const filteredEvents = useMemo(() => {
    return state.events.filter((e) => {
      if (state.activeTag && state.activeTag !== 'all' && e.tag !== state.activeTag) {
        return false
      }
      if (state.dateRange.from && e.date && e.date < state.dateRange.from) {
        return false
      }
      if (state.dateRange.to && e.date && e.date > state.dateRange.to) {
        return false
      }
      return true
    })
  }, [state.events, state.activeTag, state.dateRange])

  const updateFilteredState = useCallback(() => {
    setState((s) => ({
      ...s,
      filteredEvents,
      selectedIndex: null,
      selectedEvent: null,
    }))
  }, [filteredEvents])

  useEffect(() => {
    updateFilteredState()
  }, [updateFilteredState])

  const handlePointSelect = useCallback((event: GlobeEventRow, index: number) => {
    setState((s) => ({
      ...s,
      selectedEvent: event,
      selectedIndex: index,
    }))
  }, [])

  const handleTagChange = useCallback((tag: string | null) => {
    setState((s) => ({
      ...s,
      activeTag: tag,
      selectedEvent: null,
      selectedIndex: null,
    }))
  }, [])

  const handleModeChange = useCallback((mode: 'globe' | 'table') => {
    setState((s) => ({
      ...s,
      mode,
    }))
  }, [])

  return (
    <div className="arms-layout" data-arms-experience>
      {state.mode === 'globe' ? (
        <div className="arms-canvas-wrapper">
          <ArmsMapScene
            filteredEvents={filteredEvents}
            focusedIndex={state.selectedIndex}
            onPointSelect={(index, event) => handlePointSelect(event, index)}
          />
        </div>
      ) : (
        <ArmsTableView
          filteredEvents={filteredEvents}
          onRowSelect={(event) => {
            handlePointSelect(event, filteredEvents.indexOf(event))
          }}
        />
      )}

      <div className="arms-ui-layer">
        <div className="arms-header-bar">
          <div className="arms-header-left">
            <a href="/" className="arms-back-link">
              ← ageofabundance.wiki
            </a>
            <h1 className="arms-title">Abundance at Arms</h1>
          </div>

          <div className="arms-toggle">
            <button
              className="arms-toggle-btn"
              data-active={state.mode === 'globe'}
              onClick={() => handleModeChange('globe')}
            >
              Globe
            </button>
            <button
              className="arms-toggle-btn"
              data-active={state.mode === 'table'}
              onClick={() => handleModeChange('table')}
            >
              Table
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="arms-filter-bar">
          <button
            className="arms-tag-chip"
            data-active={state.activeTag === null || state.activeTag === 'all'}
            onClick={() => handleTagChange(null)}
          >
            All Events
          </button>
          {['lethal', 'protest', 'political', 'infrastructure', 'cyber', 'displacement', 'famine', 'disease', 'disaster', 'science'].map(
            (tag) => (
              <button
                key={tag}
                className="arms-tag-chip"
                data-active={state.activeTag === tag}
                onClick={() => handleTagChange(state.activeTag === tag ? null : tag)}
              >
                <span className="dot"></span>
                {tag}
              </button>
            )
          )}
        </div>

        {/* Event panel stub */}
        {state.selectedEvent && (
          <div className="arms-panel arms-panel--open">
            <div className="arms-panel-content">
              <div className="arms-event-header">
                {state.selectedEvent.tag && (
                  <div className="arms-event-tag">{state.selectedEvent.tag}</div>
                )}
                <h2 className="arms-event-name">
                  {state.selectedEvent.name || 'Unnamed Event'}
                </h2>
              </div>
              <div className="arms-event-meta">
                <div className="arms-event-meta-item">
                  <span className="arms-event-meta-label">Weight:</span>
                  <span>{state.selectedEvent.weight.toLocaleString()}</span>
                </div>
                {state.selectedEvent.date && (
                  <div className="arms-event-meta-item">
                    <span className="arms-event-meta-label">Date:</span>
                    <span>{state.selectedEvent.date}</span>
                  </div>
                )}
                <div className="arms-event-meta-item">
                  <span className="arms-event-meta-label">Source:</span>
                  <span>{state.selectedEvent.source}</span>
                </div>
              </div>
              {state.selectedEvent.url && (
                <div className="arms-event-source">
                  <a
                    href={state.selectedEvent.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source ↗
                  </a>
                </div>
              )}
              <ArmsArticleLinks eventTag={state.selectedEvent.tag} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
