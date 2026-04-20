'use client'

import { useMemo, useState } from 'react'
import type { GlobePoint } from '@dds/globe'

type GlobeEventRow = GlobePoint & {
  source: string
  external_id: string
}

type Sort = {
  column: keyof GlobeEventRow
  dir: 'asc' | 'desc'
}

type ArmsTableViewProps = {
  filteredEvents: GlobeEventRow[]
  onRowSelect?: (event: GlobeEventRow) => void
}

const COLUMNS = [
  { key: 'name' as const, label: 'Event Name' },
  { key: 'tag' as const, label: 'Category' },
  { key: 'date' as const, label: 'Date' },
  { key: 'weight' as const, label: 'Weight' },
  { key: 'source' as const, label: 'Source' },
  { key: 'url' as const, label: 'Link' },
] as const

export function ArmsTableView({ filteredEvents, onRowSelect }: ArmsTableViewProps) {
  const [sort, setSort] = useState<Sort>({ column: 'date', dir: 'desc' })

  const sorted = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const av = a[sort.column] ?? ''
      const bv = b[sort.column] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, {
        numeric: true,
      })
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [filteredEvents, sort])

  const handleHeaderClick = (column: keyof GlobeEventRow) => {
    if (sort.column === column) {
      setSort((s) => ({ ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' }))
    } else {
      setSort({ column, dir: 'desc' })
    }
  }

  return (
    <div className="arms-table-wrapper">
      <table className="arms-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleHeaderClick(col.key)}
                data-sort={sort.column === col.key ? sort.dir : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((event) => (
            <tr
              key={event.external_id || event.id}
              onClick={() => onRowSelect?.(event)}
            >
              <td>{event.name}</td>
              <td>{event.tag || '—'}</td>
              <td>{event.date ? new Date(event.date).toLocaleDateString() : '—'}</td>
              <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                {event.weight.toLocaleString()}
              </td>
              <td>{event.source}</td>
              <td>
                {event.url ? (
                  <a href={event.url} target="_blank" rel="noreferrer">
                    view
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
