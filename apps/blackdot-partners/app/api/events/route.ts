import { NextResponse } from 'next/server';
import { createDdsSupabase } from '@dds/auth/supabase';

// Public reader: returns every event currently in the `globe_events` table.
// Hit by the landing page to populate the globe. 5-minute edge cache keeps
// the DB calm under traffic.

export const revalidate = 300;

type EventRow = {
  lat: number;
  lon: number;
  weight: number;
  name: string;
  url: string | null;
  tag: string | null;
  date: string | null;
  source: string;
};

export async function GET() {
  try {
    const supabase = createDdsSupabase();
    const { data, error, status, statusText } = await supabase
      .from('globe_events')
      .select('lat, lon, weight, name, url, tag, date, source')
      .limit(5000);

    if (error) {
      return NextResponse.json(
        { events: [], error: error.message, status, statusText },
        { status: 502 },
      );
    }
    if (!data || data.length === 0) {
      return NextResponse.json(
        { events: [], count: 0, debug: { status, statusText, dataIsNull: data === null } },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const rows = (data ?? []) as EventRow[];
    const events = rows.map((r) => ({
      lat: r.lat,
      lon: r.lon,
      weight: r.weight,
      name: r.name,
      url: r.url ?? undefined,
      tag: r.tag ?? undefined,
      date: r.date ?? undefined,
      source: r.source,
    }));

    return NextResponse.json(
      { events, count: events.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        },
      },
    );
  } catch (err) {
    return NextResponse.json(
      {
        events: [],
        error: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 },
    );
  }
}
