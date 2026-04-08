import { NextResponse } from 'next/server';
import { createDdsSupabaseAdmin } from '@dds/auth/supabase';
import { fetchUcdp, fetchUsgs, fetchReliefweb } from '@/lib/feeds';
import type { GlobeEvent } from '@/lib/feeds';

// Runs hourly via Vercel Cron. Aggregates every feed, upserts into Supabase.
// Guarded by CRON_SECRET so only Vercel Cron (or an admin with the secret)
// can trigger ingestion.
//
// Vercel automatically sends `Authorization: Bearer $CRON_SECRET` when the
// env var is set, so this runs unattended on schedule.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type FeedResult = {
  source: string;
  status: 'ok' | 'error';
  count: number;
  error?: string;
};

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const feeds: Array<{ name: string; fn: () => Promise<GlobeEvent[]> }> = [
    { name: 'ucdp', fn: fetchUcdp },
    { name: 'usgs', fn: fetchUsgs },
    { name: 'reliefweb', fn: fetchReliefweb },
  ];

  const start = Date.now();
  const settled = await Promise.allSettled(feeds.map((f) => f.fn()));
  const results: FeedResult[] = settled.map((r, i) => ({
    source: feeds[i].name,
    status: r.status === 'fulfilled' ? 'ok' : 'error',
    count: r.status === 'fulfilled' ? r.value.length : 0,
    error: r.status === 'rejected' ? String(r.reason) : undefined,
  }));

  const events = settled.flatMap((r) =>
    r.status === 'fulfilled' ? r.value : [],
  );

  if (events.length === 0) {
    return NextResponse.json({
      ingested: 0,
      durationMs: Date.now() - start,
      results,
      note: 'no events to upsert',
    });
  }

  const supabase = createDdsSupabaseAdmin();
  const rows = events.map((e) => ({
    source: e.source,
    external_id: e.externalId,
    lat: e.lat,
    lon: e.lon,
    weight: e.weight,
    name: e.name,
    url: e.url ?? null,
    tag: e.tag,
    date: e.date ?? null,
  }));

  const { error, count } = await supabase
    .from('globe_events')
    .upsert(rows, { onConflict: 'source,external_id', count: 'exact' });

  return NextResponse.json({
    ingested: count ?? rows.length,
    durationMs: Date.now() - start,
    results,
    error: error?.message,
  });
}
