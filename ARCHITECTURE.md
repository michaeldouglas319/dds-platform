# DDS Platform — Enterprise Architecture Recommendation

## Consensus Package Stack

| Domain | Site | Package | Stars | License | Cost |
|---|---|---|---|---|---|
| E-Commerce | .shop | **Medusa.js** `@medusajs/medusa` | 32K | MIT | Free (self-host) |
| Gallery | .art | **react-photo-album** + **YARL** | 2K | MIT | Free |
| i18n | .asia | **next-intl** | 4.2K | MIT | Free |
| Knowledge Base | .wiki | **Fumadocs** `fumadocs-core` | 11.3K | MIT | Free |
| Blog/Content | .dev | **Keystatic** `@keystatic/core` | 2K | MIT | Free |
| Dashboard | .app | **Recharts** + **TanStack Table** | 27K+28K | MIT | Free |
| Community | .space | **Supabase Realtime** | 7.5K | Apache-2.0 | Free tier |
| Landing Builder | .online | **Puck** `@measured/puck` | 12.4K | MIT | Free |
| Corporate CMS | .site | **Payload CMS** `payload` | 41.4K | MIT | Free (self-host) |
| Tech Demos | .tech | **Sandpack** + **Shiki** | 6K+13K | Apache/MIT | Free |
| API Docs | .net | **Scalar** `@scalar/api-reference` | 14.4K | MIT | Free |
| Dev Portal | blackdot.dev | Scalar + Sandpack + Monaco | — | MIT | Free |
| Creative Lab | blackdot.space | **GSAP** + **Lenis** | 24K+13K | Free* | Free |

### 3D / Physics Stack (shared renderer)
| Package | Role | Size |
|---|---|---|
| @react-three/fiber 9.5 | React Three.js renderer | ~45KB |
| @react-three/drei 10.7 | Helpers (Float, Environment, ScrollControls) | ~20-60KB |
| @react-three/rapier 2.2 | WASM physics engine | ~250KB + 600KB WASM |
| wawa-vfx 1.2 | GPU particle system | ~15KB |
| @react-three/postprocessing 3.0 | Bloom, DoF, effects | ~30KB |
| three-custom-shader-material 6.4 | Custom GLSL shaders | ~10KB |
| meshline 3.3 | Thick lines, trails | ~5KB |
| lenis 1.3 | Smooth scroll | ~8KB |

**Critical prerequisite**: React 19 upgrade required for modern pmndrs stack.

---

## New Renderer Types (50 total proposed)

### E-Commerce (.shop) — 8 renderers
- `product-card` — single product tile with image, price, quick-add
- `product-grid` — filterable/sortable paginated grid
- `product-detail` — full PDP with gallery, variants, add-to-cart
- `price-display` — reusable price component (sale, compare-at)
- `cart-drawer` — slide-out cart with line items
- `checkout-form` — multi-step checkout
- `collection-header` — collection banner/title
- `order-confirmation` — post-purchase page

### Gallery (.art) — 6 renderers
- `gallery-masonry` — responsive masonry/justified layout
- `gallery-carousel` — linear carousel with thumbnails
- `lightbox-viewer` — single hero → full lightbox
- `artwork-card` — single artwork with metadata
- `collection-grid` — filterable artwork collection
- `exhibition-section` — themed exhibition with statement + gallery

### Content (.asia, .wiki, .dev) — 8 renderers
- `doc-page` — full docs page with breadcrumbs, pagination
- `doc-sidebar` — hierarchical navigation sidebar
- `doc-toc` — on-page table of contents
- `search-results` — cross-domain search results
- `article-card` — blog post preview card
- `blog-post` — full blog post with author info
- `code-block-interactive` — tabbed code with syntax highlighting
- `locale-switcher` — language selector with completion badges

### Dashboard (.app, .space, .site, .online) — 11 renderers
- `chart-line` — time series / trend charts
- `chart-bar` — categorical comparison
- `chart-pie` — distribution / donut charts
- `data-table` — headless sortable/filterable table
- `metric-dashboard` — KPI cards with sparklines
- `chat-thread` — realtime chat with threads
- `activity-stream` — CDC-powered activity feed
- `cms-block` — Payload CMS rich text renderer
- `page-builder-canvas` — Puck visual editor output
- `testimonial-wall` — masonry testimonial cards
- `pricing-table-interactive` — billing toggle + tier comparison

### API/Demos (.tech, .net, blackdot) — 8 renderers
- `api-explorer` — full Scalar API reference
- `api-endpoint` — single endpoint showcase
- `openapi-viewer` — read-only Redoc-style reference
- `code-playground` — Sandpack live code editor
- `code-editor` — Monaco IDE section
- `terminal-demo` — animated CLI walkthrough
- `animation-canvas` — GSAP timeline + scroll trigger
- `scroll-sequence` — Lenis + GSAP scroll-driven narrative

### Physics/3D (renderer spatial) — 8 renderers
- `physics-playground` — rigid bodies with gravity, drag
- `particle-field` — GPU particles with cursor/scroll
- `interactive-model` — hover/click/drag GLTF models
- `drag-scene` — throwable physics objects
- `cloth-simulation` — Verlet cloth with wind
- `magnetic-cursor` — elements attracted to cursor
- `scroll-3d-scene` — scroll-driven camera + keyframes
- `environment-scene` — HDR environment with atmosphere

---

## Theme Variant System

### Resolution chain
```
section.display.variant → theme.variantOverrides[layout] → theme.defaultVariant → 'default'
```

### Two strategies
- **Style-only**: same component + `data-variant` CSS attribute
- **Structural**: separate component file in `renderers/variants/`

### JSON config
```json
{
  "display": { "layout": "header", "variant": "hero" },
  "theme": {
    "defaultVariant": "minimal",
    "variantOverrides": { "header": "hero", "stats-grid": "animated-counter" }
  }
}
```

### 24 variants across 6 existing renderers
| Renderer | Variants |
|---|---|
| header | default, minimal, hero, split, gradient |
| stats-grid | default, compact, large-number, animated-counter |
| feature-matrix | default, cards, toggle, minimal |
| timeline | default, vertical, horizontal, alternating |
| centered-text | default, quote, callout, highlight |
| standard-card | default, horizontal, overlay, minimal |

---

## Implementation Priority

### Phase 1 — Foundation (enables all sites)
1. React 19 upgrade (unlocks modern 3D stack)
2. Theme variant system in renderer registry
3. `testimonial-wall` + `pricing-table-interactive` (pure renderers, no deps)

### Phase 2 — Content sites (.wiki, .dev, .asia)
1. Fumadocs integration for .wiki
2. Keystatic integration for .dev
3. next-intl integration for .asia
4. New renderers: doc-page, doc-sidebar, blog-post, article-card, locale-switcher

### Phase 3 — Interactive sites (.app, .tech, .net)
1. Recharts + TanStack Table for .app
2. Sandpack + Shiki + Scalar for .tech and .net
3. New renderers: chart-*, data-table, code-playground, api-explorer

### Phase 4 — Commerce + Community (.shop, .space)
1. Medusa.js backend for .shop
2. Supabase Realtime for .space
3. New renderers: product-*, cart-*, chat-thread, activity-stream

### Phase 5 — Physics + Creative (renderer + blackdot.space)
1. R3F + Rapier + wawa-vfx integration
2. GSAP + Lenis for blackdot.space
3. New renderers: physics-playground, particle-field, magnetic-cursor, scroll-3d-scene

### Phase 6 — Builder + CMS (.online, .site)
1. Puck integration for .online
2. Payload CMS for .site
3. New renderers: page-builder-canvas, cms-block

---

## ARMS Platform — Geopolitical Conflict Mapping

### Overview

ARMS (Abundance at Arms) is a real-time geopolitical conflict mapping application within the DDS platform. It aggregates conflict event data from multiple sources and visualizes them across interactive 3D globe and 2D flat map views.

### Data Architecture

**Sources:** Multi-source aggregation from 5 free APIs:
- GDELT (Global Event, Language, and Tone Database) — 15-minute event freshness
- NewsAPI — Global news aggregation
- Reddit — Real-time discussions
- RSS Feeds — Custom sources
- HackerNews — Tech-related events

**Storage:** Supabase PostgreSQL
- Table: `globe_events`
- Schema: `[id, source, external_id, lat, lon, weight, name, url, tag, date]`
- Index: `(tag, date)` for filtering performance

**Type System:** Shared `@dds/types` package
- `GlobeEventRow` — Event data structure
- `EventTag` — Tagged enum (lethal, disaster, geopolitical, military, news, social, tech-news)
- `TAG_COLORS` — Color mapping for visualization
- `AggregationResponse` — Multi-source aggregation response

**API Endpoints:**
- `GET /api/arms-events` — Fetch events with optional filtering (tag, date range, limit)
- `POST /api/aggregate-events` — Cron job endpoint for multi-source aggregation (runs every 15 minutes)

### Visualization Layers

**3D Globe View:**
- Three.js + react-three-fiber rendering
- Event points as colored circles with sizing by weight
- Interactive rotation, zoom, camera control
- Optional 3D tiles layer (Google buildings/terrain)
- 415+ events visible at default zoom

**2D Flat Map View:**
- MapLibre GL base map with OpenFreeMap tiles
- deck.gl ScatterplotLayer for event points (high-performance geospatial)
- Three basemap options:
  - **Positron** (light theme) — OpenFreeMap Positron style
  - **Dark** — OpenFreeMap Dark style
  - **Satellite** — Esri World Imagery
- Event clustering and interaction on hover/click

**Event Styling:**
- Color by tag (red=lethal, orange=disaster, blue=news, green=social, etc.)
- Size by weight (logarithmic scale, 8-100px)
- Opacity by recency (fade out for older events)
- Stroke outline on selection

### UI Architecture

**Container:** `apps/ageofabundance-wiki/components/arms-drilldown.jsx`
- State management for: events, filters, selected event, view mode, basemap
- Fetch events on mount from `/api/arms-events`
- Apply client-side filtering (tags, date range)

**Sidebar Controls:**
- View mode toggle (🌍 Globe / 🗺️ Map buttons)
- Event types filter (checkboxes + counts)
- Date range pickers (optional from/to)
- Results counter
- View-specific controls (basemap toggle for flat map)

**Viewport:**
- Conditional rendering: `mapMode === 'globe' ? <InteractiveGlobeScene /> : <FlatMap />`
- Full-screen responsive container
- Smooth transition on mode switch

**Detail Panel:**
- Event metadata on click
- Source attribution
- External link to news source
- Clickable lat/lon coordinates

### File Structure

```
apps/ageofabundance-wiki/
├── app/
│   ├── api/
│   │   ├── arms-events/route.ts              # Event fetching endpoint
│   │   └── aggregate-events/route.ts         # Multi-source aggregation (cron)
│   └── arms/
│       └── page.jsx                          # ARMS drilldown page
├── components/
│   ├── arms-drilldown.jsx                    # Main container
│   ├── flat-map.tsx                          # MapLibre + deck.gl
│   ├── flat-map.css
│   └── globe-3d-tiles.tsx                    # 3D tiles support (optional)

packages/types/
├── index.ts                                  # Barrel export
├── globe-events.ts                           # Event types
└── event-tags.ts                             # Tag definitions + colors
```

### Type Hierarchy

All types imported from centralized `@dds/types`:

```typescript
// Single source of truth
import {
  GlobeEventRow,
  EventTag,
  TAG_COLORS,
  TAG_NAMES,
  AggregationResponse
} from '@dds/types'

// Component usage
const event: GlobeEventRow = { source, external_id, lat, lon, weight, name, url, tag, date }
const color: [number, number, number] = TAG_COLORS[event.tag || 'social']
```

### Deployment Pipeline

**GitHub Actions Workflow:** `.github/workflows/deploy-on-push.yml`
1. Trigger on push to main with app/package changes
2. Detect changed apps via `git diff`
3. Build locally: `pnpm turbo build --filter=@dds/ageofabundance-wiki`
4. Deploy prebuilt artifacts to Vercel
5. Create GitHub deployment status

**No Vercel Cloud Build:** All builds happen locally (free), only artifacts deployed.

**Environment Variables:**
- `NEXT_PUBLIC_DDS_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_DDS_SUPABASE_ANON_KEY` — Supabase public key
- `DDS_SUPABASE_SERVICE_ROLE_KEY` — Server-side key (for aggregation)
- `CRON_SECRET` — Vercel cron authentication

### Adding New Data Sources

Extend `apps/ageofabundance-wiki/app/api/aggregate-events/route.ts`:

```typescript
async function fetchFromSource(): Promise<GlobeEventRow[]> {
  try {
    // Fetch from API
    // Transform to GlobeEventRow format
    // Deduplicate by external_id
    return events
  } catch (err) {
    console.error('[aggregate] Source failed:', err)
    return [] // Graceful fallback
  }
}

const SOURCES = {
  newSource: { fetch: fetchFromSource, weight: 0.7 }
}
```

**Expected effort:** ~50 lines per source

### Adding New Visualizations

Create new component accepting `events: GlobeEventRow[]`:

1. Define component in `components/`
2. Add mode toggle to sidebar
3. Conditionally render in viewport
4. Import types from `@dds/types`

**Expected effort:** 2-3 hours per visualization

### Caching & Performance

- **ISR:** 5-minute revalidation for `/api/arms-events`
- **Browser Cache:** `Cache-Control: public, s-maxage=300, stale-while-revalidate=60`
- **Rendering:** 60 FPS on deck.gl + Three.js
- **Load Time:** Target < 3 seconds (globe + 415 events)

### Next Agents

- **Agent 2:** Data Layer System (45+ configurable layers)
- **Agent 3:** Intelligence Index (event correlation)
- **Agent 4:** Cross-Stream Correlation
- **Agent 5:** Financial Radar
- **Agents 6-10:** Flight tracking, multilingual support, offline AI, performance optimization

See `AGENT_2_DATA_LAYER_SYSTEM.md` and `NEXT_AGENTS.md` for implementation roadmap.
