-- public.entries — universal knowledge table matching @dds/types UniversalSection.
-- Links to public.globe_events via the shared `tag` column (entries.tag = globe_events.tag).

create table if not exists public.entries (
  id             text primary key,
  type           text not null check (type in ('section','entry','hero','profile','config')),
  name           text,
  page           text,
  slug           text,
  tag            text,
  parent_id      text references public.entries(id) on delete cascade,
  entry_order    integer,
  subject        jsonb,
  content        jsonb,
  media          jsonb,
  links          jsonb,
  display        jsonb,
  spatial        jsonb,
  landing        jsonb,
  meta           jsonb,
  metadata       jsonb,
  status         text not null default 'active' check (status in ('active','archived','draft')),
  featured       boolean not null default false,
  featured_rank  integer,
  inserted_at    timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index if not exists entries_slug_uidx
  on public.entries (slug) where slug is not null;
create index if not exists entries_tag_idx       on public.entries (tag);
create index if not exists entries_parent_idx    on public.entries (parent_id);
create index if not exists entries_type_idx      on public.entries (type);
create index if not exists entries_status_idx    on public.entries (status);
create index if not exists entries_featured_idx
  on public.entries (featured, featured_rank) where featured = true;

create or replace function public.touch_entries()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists entries_touch on public.entries;
create trigger entries_touch
  before update on public.entries
  for each row execute function public.touch_entries();

alter table public.entries enable row level security;

drop policy if exists "public read entries" on public.entries;
create policy "public read entries"
  on public.entries for select
  using (status = 'active');
