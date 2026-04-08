import type { GlobeEvent } from './types';

// USGS significant earthquakes, last 30 days.
// Free, keyless, open CORS, maintained by the US government.
const USGS_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

type UsgsFeatureCollection = {
  features: Array<{
    id: string;
    geometry: { type: 'Point'; coordinates: [number, number, number] };
    properties: {
      mag: number | null;
      place: string | null;
      time: number | null;
      url: string | null;
      title: string | null;
    };
  }>;
};

export async function fetchUsgs(): Promise<GlobeEvent[]> {
  try {
    const res = await fetch(USGS_URL, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as UsgsFeatureCollection;
    return data.features
      .filter(
        (f) =>
          f?.geometry?.coordinates?.length === 3 &&
          typeof f.properties?.mag === 'number',
      )
      .map((f) => {
        const [lon, lat] = f.geometry.coordinates;
        const mag = f.properties.mag ?? 0;
        return {
          externalId: f.id,
          source: 'usgs' as const,
          lat,
          lon,
          weight: mag * 10,
          name: f.properties.title ?? `M${mag} ${f.properties.place ?? ''}`.trim(),
          url: f.properties.url ?? undefined,
          tag: 'disaster',
          date: f.properties.time
            ? new Date(f.properties.time).toISOString()
            : undefined,
        };
      });
  } catch {
    return [];
  }
}
