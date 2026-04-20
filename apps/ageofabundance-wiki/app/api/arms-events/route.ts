import { NextResponse } from 'next/server'
import { createDdsSupabase } from '@dds/auth/supabase'

/**
 * GET /api/arms-events
 *
 * Streams live conflict event data from the globe_events Supabase table.
 * Supports filtering by tag, date range, and result limit.
 *
 * Query params:
 *   - tag: string (optional) — filter by single event tag (lethal, protest, etc) or "all"
 *   - from: ISO date string (optional) — filter events on/after this date
 *   - to: ISO date string (optional) — filter events on/before this date
 *   - limit: number (optional, default 500, max 2000)
 *
 * Response: { events: GlobeEventRow[], error?: string }
 */

type GlobeEventRow = {
  id?: string
  source: string
  external_id: string
  lat: number
  lon: number
  weight: number
  name: string
  url: string | null
  tag: string | null
  date: string | null
}

export const revalidate = 300 // 5-minute ISR cache, matching ingest cadence

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const tag = searchParams.get('tag')
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')
    const limitParam = searchParams.get('limit')

    const limit = Math.min(Math.max(1, parseInt(limitParam ?? '500')), 2000)

    const supabase = createDdsSupabase()

    let query = supabase
      .from('globe_events')
      .select('id, source, external_id, lat, lon, weight, name, url, tag, date')

    if (tag && tag !== 'all') {
      query = query.eq('tag', tag)
    }

    if (fromDate) {
      query = query.gte('date', fromDate)
    }

    if (toDate) {
      query = query.lte('date', toDate)
    }

    const { data, error, status, statusText } = await query
      .order('date', { ascending: false })
      .order('weight', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json(
        { events: [], error: error.message, status, statusText },
        { status: 502 },
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { events: [], count: 0 },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
          },
        },
      )
    }

    const events = (data ?? []) as GlobeEventRow[]

    return NextResponse.json(
      { events, count: events.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      },
    )
  } catch (err) {
    return NextResponse.json(
      {
        events: [],
        error: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 },
    )
  }
}
