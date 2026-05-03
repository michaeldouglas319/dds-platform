# ARMS Improvement Backlog

Ordered by impact × confidence. One task per session. Mark `[x]` when shipped to production.

Reference apps: Liveuamap · WorldMonitor · Bellingcat · FlightAware · Windy.com

---

## Phase 1 — Surface Value (zero new dependencies)

- [ ] **1.1 — Event detail panel**
  Replace the current lat/lon sidebar with a real detail panel:
  source domain favicon + name, event headline as title, relative timestamp ("3h ago"),
  tag badge with colour, "Open source →" external link button.
  Pattern: existing `selectedEvent` state + CSS panel already in `arms-drilldown.css`.
  Reference: Liveuamap event sidebar.

- [ ] **1.2 — Relative timestamps**
  Replace raw ISO dates everywhere (sidebar list, detail panel) with "X min/h/days ago".
  Zero deps — one 15-line utility function.
  Reference: every major news site.

- [ ] **1.3 — Flat map clustering**
  Enable deck.gl `ScatterplotLayer` → swap to `GeoJsonLayer` + supercluster, or use
  deck.gl's `IconClusterLayer` example pattern. Show count badge, click to zoom+expand.
  Pattern: deck.gl clustering example (deck.gl docs, 10k+ stars repo).
  Reference: Windy.com station clusters.

- [ ] **1.4 — Top active regions widget**
  Sidebar section: top 5 countries by filtered event count, each row clickable to
  add a country filter. Derive from existing `filteredEvents` — no fetch needed.
  Reference: WorldMonitor left rail country list.

- [ ] **1.5 — Event type legend**
  Explicit colour legend panel below event type filter checkboxes — coloured dot +
  label + count. Pulls from existing `TAG_COLORS` and `TAG_NAMES` from `@dds/types`.

---

## Phase 2 — WorldMonitor Surface (zero or minimal new deps)

- [ ] **2.1 — Live event ticker**
  Fixed bottom bar: horizontally scrolling list of the 20 most recent events.
  Each item: tag-coloured dot · headline · "X min ago". Click centres map on event.
  Pattern: CSS `marquee` replacement using `animation: scroll-x` — no deps.
  Reference: WorldMonitor bottom ticker, Reuters live blog.

- [ ] **2.2 — Source OG image in detail panel**
  When an event is selected, fetch `/api/og-image?url=<source_url>` which server-side
  fetches the OG `<meta>` image tag and returns the URL. Display as hero image in panel.
  Pattern: Next.js Route Handler, `cheerio` or regex parse (already in ecosystem or
  native `fetch` + regex — no new client dep).
  Reference: Liveuamap event image thumbnails.

- [ ] **2.3 — Recency opacity already works — add recency filter toggle**
  Add "Last 24h / 7 days / 30 days / All" quick-filter buttons above the date pickers.
  Sets `dateFrom` to `now - N days`. Zero new code beyond what exists.

- [ ] **2.4 — Escalation score per region**
  Compute `score = Σ(lethal×3 + disaster×2 + other×1) × recencyDecay` per country.
  Display as ranked list in top-regions widget (task 1.4 prerequisite).
  Zero deps — pure JS reduce over `filteredEvents`.

- [ ] **2.5 — Shareable URL state**
  Encode active tag filters + date range + selected event ID into URL search params.
  On load, restore from URL. Enables linking to a specific filtered view.
  Pattern: `useSearchParams` (Next.js App Router, already in project).

---

## Phase 3 — R3F Globe Immersion (existing deps only: three.js, @react-three/fiber, drei)

- [ ] **3.1 — Pulse rings on globe events**
  Animated expanding + fading ring around each event point on the globe.
  Pattern: `useFrame` + scale uniform on a `RingGeometry` — standard drei pattern,
  no new dep. Reference: flight tracker pulse dots (FlightAware, Flightradar24).

- [ ] **3.2 — Camera fly-to on event click**
  On globe event click, smooth camera orbit to centre on that lat/lon.
  Pattern: `CameraControls` from `@react-three/drei` (already installed).
  Reference: Google Earth camera transitions.

- [ ] **3.3 — Atmospheric haze**
  Soft blue atmosphere ring around the globe using a sprite or shader backface sphere.
  Pattern: drei `<Sphere>` with custom `MeshBasicMaterial` + `side: BackSide` + blue tint.
  Used in dozens of drei examples. Reference: NASA WorldWind, Cesium globe.

- [ ] **3.4 — Globe → flat map crossfade transition**
  When switching modes, fade the outgoing view out (opacity 0 over 300ms) before
  mounting the incoming one — removes the jarring hard swap.
  Pattern: CSS transition + React `useState` + `useEffect` delayed unmount.

- [ ] **3.5 — Arc lines between same-tag same-day events**
  Draw `TubeGeometry` arcs connecting clusters of lethal events that share a date.
  Pattern: `THREE.CatmullRomCurve3` — no new dep.
  Reference: FlightAware flight arcs, Kepler.gl arc layer.

---

## Phase 4 — Data Intelligence (new deps, all feature-flagged behind env var)

- [ ] **4.1 — Timeline scrubber**
  Horizontal timeline bar at bottom. Drag to scrub through event dates — map
  animates to show only events up to that point.
  Dep: `@dnd-kit/core` (10k+ stars) or native `<input type="range">` (no dep).
  Feature flag: `NEXT_PUBLIC_ARMS_TIMELINE=true`.

- [ ] **4.2 — Related articles panel**
  After event select, fetch 3 headlines from `/api/arms-related?q=<location>&tag=<tag>`.
  Route queries existing Supabase `globe_events` for nearby events same tag ±7 days.
  No external API needed — uses existing data.
  Feature flag: `NEXT_PUBLIC_ARMS_RELATED=true`.

- [ ] **4.3 — Export filtered events**
  "Export CSV" button in sidebar downloads `filteredEvents` as a CSV file.
  Pattern: `Blob` + `URL.createObjectURL` — no dep.
  GeoJSON export as stretch goal (same pattern).

- [ ] **4.4 — Heatmap density layer**
  Toggle to replace scatter dots with a density heatmap on flat map.
  Dep: deck.gl `HeatmapLayer` — already in `deck.gl` package (same dep, no addition).
  Feature flag: `NEXT_PUBLIC_ARMS_HEATMAP=true`.

- [ ] **4.5 — Embed / shareable snapshot**
  `/arms/embed?filters=...` route renders the map full-screen with no chrome.
  Enables iframe embedding in news articles.
  Pattern: Next.js route + existing component — no new dep.
