import data from '@/data/conflict-events.json';
import type { GlobeEvent } from './types';

// UCDP GED v24.1 — static 2023 snapshot (stripped form).
// When you obtain a UCDP access token, swap this for a live fetch to
// https://ucdpapi.pcr.uu.se/api/gedevents/25.1 with the
// `x-ucdp-access-token` header and normalize the rich fields.

type RawUcdp = {
  events: Array<{
    lat: number;
    lon: number;
    weight: number;
    name: string;
  }>;
};

export async function fetchUcdp(): Promise<GlobeEvent[]> {
  const ds = data as RawUcdp;
  return ds.events.map((e, i) => ({
    externalId: `ucdp-${i}-${e.lat.toFixed(3)}-${e.lon.toFixed(3)}`,
    source: 'ucdp',
    lat: e.lat,
    lon: e.lon,
    weight: e.weight,
    name: e.name,
    tag: 'lethal',
  }));
}
