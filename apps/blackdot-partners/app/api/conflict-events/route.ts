import { NextResponse } from 'next/server';
import data from '@/data/conflict-events.json';

// Data source: UCDP Georeferenced Event Dataset (GED) v24.1
// https://ucdp.uu.se/downloads/ — free, no API key, peer-reviewed.
// A snapshot CSV was downloaded at build time, filtered to 2023+ events,
// deduped by ~0.1 deg grid, sorted by fatalities, and saved as JSON.
//
// GDELT's geo/geo endpoint (previously used here) now returns HTTP 404.
// UCDP's live API requires a token as of Feb 2026, and ACLED requires
// a registered key, so a cached static snapshot is the only free path.

export const revalidate = 900;

export type ConflictEvent = {
  lat: number;
  lon: number;
  weight: number;
  name: string;
  url?: string;
  /** Per-event override color; scene uses this if set. */
  color?: string;
  /** Free-form tag producers can attach (e.g. category). */
  tag?: string;
};

type Dataset = {
  events: ConflictEvent[];
  source: string;
  generated: string;
};

export async function GET() {
  const ds = data as Dataset;
  return NextResponse.json(
    {
      events: ds.events,
      source: ds.source,
      generated: ds.generated,
      count: ds.events.length,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
      },
    },
  );
}
