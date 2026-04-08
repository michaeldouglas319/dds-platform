-- Globe events table — populated by /api/cron/ingest-events on an hourly schedule.
-- Run this once in the Supabase SQL editor for the DDS project.

create table if not exists public.globe_events (
  id bigint primary key generated always as identity,
  source text not null,
  external_id text not null,
  lat double precision not null,
  lon double precision not null,
  weight double precision not null default 1,
  name text not null,
  url text,
  tag text,
  date timestamptz,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, external_id)
);

create index if not exists globe_events_tag_idx on public.globe_events (tag);
create index if not exists globe_events_date_idx on public.globe_events (date desc nulls last);
create index if not exists globe_events_source_idx on public.globe_events (source);

-- Keep updated_at fresh on upserts
create or replace function public.touch_globe_events()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists globe_events_touch on public.globe_events;
create trigger globe_events_touch
  before update on public.globe_events
  for each row execute function public.touch_globe_events();

-- Row-level security: anyone can read, only the service role can write.
alter table public.globe_events enable row level security;

drop policy if exists "public read globe events" on public.globe_events;
create policy "public read globe events"
  on public.globe_events for select
  using (true);
