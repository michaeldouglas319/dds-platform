import type { GlobeEvent } from './types';

// ReliefWeb disasters — free, keyless, open CORS.
// Docs: https://reliefweb.int/help/api
const RELIEFWEB_URL =
  'https://api.reliefweb.int/v1/disasters' +
  '?appname=blackdot-dds' +
  '&profile=list' +
  '&preset=latest' +
  '&limit=200';

type ReliefwebResponse = {
  data?: Array<{
    id: string | number;
    fields?: {
      name?: string;
      status?: string;
      date?: { created?: string };
      primary_country?: {
        location?: { lat?: number; lon?: number };
        name?: string;
      };
      type?: Array<{ name?: string; primary?: boolean }>;
      url?: string;
      url_alias?: string;
    };
  }>;
};

const FAMINE = /(famine|food insecurity|drought)/i;
const DISEASE = /(epidemic|outbreak|cholera|ebola|measles|dengue|marburg|mpox)/i;

function categorize(types: Array<{ name?: string }>): string {
  const joined = types.map((t) => t.name ?? '').join(' ');
  if (FAMINE.test(joined)) return 'famine';
  if (DISEASE.test(joined)) return 'disease';
  return 'disaster';
}

export async function fetchReliefweb(): Promise<GlobeEvent[]> {
  try {
    const res = await fetch(RELIEFWEB_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as ReliefwebResponse;
    const rows = body.data ?? [];

    return rows
      .map((r) => {
        const f = r.fields ?? {};
        const loc = f.primary_country?.location;
        if (!loc || typeof loc.lat !== 'number' || typeof loc.lon !== 'number') {
          return null;
        }
        const types = f.type ?? [];
        return {
          externalId: `reliefweb-${r.id}`,
          source: 'reliefweb' as const,
          lat: loc.lat,
          lon: loc.lon,
          weight: f.status === 'ongoing' ? 50 : 25,
          name: f.name ?? f.primary_country?.name ?? 'Humanitarian event',
          url: f.url_alias ?? f.url,
          tag: categorize(types),
          date: f.date?.created,
        } satisfies GlobeEvent;
      })
      .filter((e): e is GlobeEvent => e !== null);
  } catch {
    return [];
  }
}
