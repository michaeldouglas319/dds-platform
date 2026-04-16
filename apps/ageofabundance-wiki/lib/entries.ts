import { createDdsSupabase } from '@dds/auth/supabase';
import type { UniversalSection } from '@dds/types';

export type EntryRow = UniversalSection & {
  slug: string | null;
  tag: string | null;
  status: 'active' | 'archived' | 'draft';
  featured: boolean;
  featured_rank: number | null;
  parent_id: string | null;
  entry_order: number | null;
};

export type GlobeEventRow = {
  id: number;
  source: string;
  external_id: string;
  lat: number;
  lon: number;
  weight: number;
  name: string;
  url: string | null;
  tag: string | null;
  date: string | null;
};

function hasSupabaseEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_DDS_SUPABASE_URL ?? process.env.DDS_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_DDS_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

export async function fetchEntryBySlug(slug: string): Promise<EntryRow | null> {
  if (!hasSupabaseEnv()) return null;
  const sb = createDdsSupabase();
  const { data, error } = await sb
    .from('entries')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();
  if (error) {
    console.error('[entries] fetchEntryBySlug error', error);
    return null;
  }
  return (data as EntryRow | null) ?? null;
}

export async function fetchEntries(opts: { type?: string; limit?: number } = {}): Promise<EntryRow[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = createDdsSupabase();
  let q = sb.from('entries').select('*').eq('status', 'active');
  if (opts.type) q = q.eq('type', opts.type);
  q = q.order('featured', { ascending: false }).order('featured_rank', { ascending: true }).order('updated_at', { ascending: false });
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) {
    console.error('[entries] fetchEntries error', error);
    return [];
  }
  return (data as EntryRow[]) ?? [];
}

export async function fetchFeaturedEntry(): Promise<EntryRow | null> {
  if (!hasSupabaseEnv()) return null;
  const sb = createDdsSupabase();
  const { data, error } = await sb
    .from('entries')
    .select('*')
    .eq('status', 'active')
    .eq('featured', true)
    .order('featured_rank', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('[entries] fetchFeaturedEntry error', error);
    return null;
  }
  return (data as EntryRow | null) ?? null;
}

export async function fetchEventsByTag(tag: string, limit = 50): Promise<GlobeEventRow[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = createDdsSupabase();
  const { data, error } = await sb
    .from('globe_events')
    .select('*')
    .eq('tag', tag)
    .order('date', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) {
    console.error('[entries] fetchEventsByTag error', error);
    return [];
  }
  return (data as GlobeEventRow[]) ?? [];
}
