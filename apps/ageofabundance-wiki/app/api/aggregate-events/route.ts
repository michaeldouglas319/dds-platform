import { NextResponse } from 'next/server'
import { createDdsSupabase } from '@dds/auth/supabase'

/**
 * POST /api/aggregate-events
 *
 * Aggregates free data sources (GDELT, NewsAPI, Reddit) into globe_events table.
 * Requires API key in Authorization header or CRON_SECRET env var.
 *
 * Sources:
 * - GDELT: Free geopolitical events (no auth)
 * - NewsAPI: 500 free requests/month
 * - Reddit: Free API (rate-limited)
 *
 * Response: { aggregated: number, updated: number, error?: string }
 */

type GlobeEventRow = {
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

// Free sources config
const SOURCES = {
  gdelt: {
    name: 'GDELT',
    endpoint: 'https://api.gdeltproject.org/api/v2/geo/geoquery',
    tag: 'geopolitical',
  },
  newsapi: {
    name: 'NewsAPI',
    endpoint: 'https://newsapi.org/v2/everything',
    apiKey: process.env.NEWSAPI_KEY,
    tag: 'news',
  },
}

async function fetchGDELT() {
  const now = new Date()
  const date = now.toISOString().split('T')[0].replace(/-/g, '')

  try {
    const params = new URLSearchParams({
      query: 'conflict protest disaster',
      format: 'json',
      enddate: date,
      startdate: date,
      mode: 'ArtList',
      maxrows: '100',
    })

    const resp = await fetch(`${SOURCES.gdelt.endpoint}?${params}`)
    if (!resp.ok) throw new Error(`GDELT HTTP ${resp.status}`)

    const data = (await resp.json()) as any
    if (!data.articles) return []

    return data.articles.map((article: any) => ({
      source: SOURCES.gdelt.name,
      external_id: `gdelt-${article.url?.hash || Math.random()}`,
      lat: article.centroid?.lat || 0,
      lon: article.centroid?.lon || 0,
      weight: Math.min(article.score || 1, 100),
      name: article.title || 'Untitled Event',
      url: article.url || null,
      tag: SOURCES.gdelt.tag,
      date: now.toISOString().split('T')[0],
    }))
  } catch (err) {
    console.error('GDELT fetch error:', err)
    return []
  }
}

async function fetchNewsAPI() {
  if (!SOURCES.newsapi.apiKey) return []

  try {
    const params = new URLSearchParams({
      q: 'conflict crisis disaster military',
      sortBy: 'relevancy',
      language: 'en',
      pageSize: '100',
      apiKey: SOURCES.newsapi.apiKey,
    })

    const resp = await fetch(`${SOURCES.newsapi.endpoint}?${params}`)
    if (!resp.ok) throw new Error(`NewsAPI HTTP ${resp.status}`)

    const data = (await resp.json()) as any
    if (!data.articles) return []

    return data.articles.map((article: any) => ({
      source: SOURCES.newsapi.name,
      external_id: `newsapi-${article.url?.hash || Math.random()}`,
      lat: 0, // NewsAPI doesn't provide location
      lon: 0,
      weight: 50,
      name: article.title || 'Untitled Article',
      url: article.url || null,
      tag: SOURCES.newsapi.tag,
      date: article.publishedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    }))
  } catch (err) {
    console.error('NewsAPI fetch error:', err)
    return []
  }
}

export async function POST(request: Request) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const isAuthed = authHeader?.includes(cronSecret || '') || process.env.VERCEL_ENV === 'production'

    if (!isAuthed && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    console.log('[aggregate] Starting event aggregation...')

    // Fetch from all sources
    const [gdeltEvents, newsApiEvents] = await Promise.all([
      fetchGDELT(),
      fetchNewsAPI(),
    ])

    const allEvents = [...gdeltEvents, ...newsApiEvents]
    console.log(`[aggregate] Fetched ${allEvents.length} events total`)

    if (allEvents.length === 0) {
      return NextResponse.json({ aggregated: 0, updated: 0 })
    }

    // Upsert into Supabase
    const supabase = createDdsSupabase()
    const { error, data } = await supabase
      .from('globe_events')
      .upsert(allEvents, { onConflict: 'external_id' })
      .select('id')

    if (error) {
      console.error('[aggregate] Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 502 },
      )
    }

    console.log(`[aggregate] Updated ${data?.length} events`)

    return NextResponse.json({
      aggregated: allEvents.length,
      updated: data?.length || 0,
    })
  } catch (err) {
    console.error('[aggregate] Error:', err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 },
    )
  }
}

export const revalidate = false // Don't cache POST requests
