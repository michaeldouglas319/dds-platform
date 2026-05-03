# ARMS → WorldMonitor Drilldown Integration Plan

## Reuse Strategy (Free First)

### Existing Components to Leverage
- ✅ `@dds/globe` → InteractiveGlobeScene (Three.js globe rendering)
- ✅ `@dds/renderer` → Config-driven component rendering
- ✅ `GlobePoint` type (matches our schema)
- ✅ Supabase Edge Functions (free tier: 500k req/mo)
- ✅ Upstash Redis (free tier: 10k commands/day)

### What We Need to Build
1. **Data Aggregator** (Supabase Edge Function)
   - Fetch free news sources (RSS, GDELT, NewsAPI free, Reddit)
   - Aggregate into GlobePoint[] format
   - Cache in Upstash Redis (3hr TTL)
   - Cost: FREE

2. **Dual-Map UI** (using existing globe + new flat map)
   - Reuse InteractiveGlobeScene for 3D globe
   - Add flat map (deck.gl or Maplibre GL - both free)
   - Toggle between views
   - Cost: FREE (libraries already open)

3. **Drilldown Page** (`/arms` route)
   - Replace current modal approach with full-page route
   - Use dds-renderer for component composition
   - Wire globe selection to detail panel
   - Add filters/layers UI
   - Cost: FREE

4. **Intelligence Scoring** (optional first phase)
   - Country-level risk scores (geopolitical + economic + disaster)
   - Overlay on globe
   - Defer to phase 2 if time-constrained
   - Cost: FREE (computed client/edge)

5. **Data Sources** (Free APIs only)
   - GDELT (geopolitical - free, no auth)
   - NewsAPI (500/mo free tier)
   - Reddit API (free, rate-limited)
   - RSS feeds (~100 sources - free)
   - HackerNews API (free)
   - Cost: FREE

## Architecture

```
/arms (new routed drilldown page)
├── ArmsLayout (main container)
├── MapViewer (globe or flat map toggle)
│   ├── InteractiveGlobeScene (reused @dds/globe)
│   └── FlatMap (new, deck.gl/maplibre)
├── FilterBar (tags, date range, layers)
├── EventPanel (detail view when event selected)
└── DataSource: Supabase Edge Function → Upstash Redis Cache
```

## Phase 1 (MVP - This Sprint)
- [ ] Build data aggregator Edge Function
- [ ] Migrate ArmsCard to routed link (not modal)
- [ ] Create /arms drilldown page
- [ ] Integrate InteractiveGlobeScene (reuse existing)
- [ ] Add basic filtering (by tag/date)
- [ ] Wire event selection → detail panel

## Phase 2 (Enhancements)
- [ ] Add flat map view (toggle globe/map)
- [ ] Data layer system (15+ categories)
- [ ] Country intelligence scoring
- [ ] Cross-stream correlation
- [ ] Finance radar (stocks, commodities, crypto)

## Free Stack Summary
- **Frontend**: dds-renderer, React Three Fiber, @dds/globe
- **Backend**: Supabase Edge Functions (500k req/mo free)
- **Caching**: Upstash Redis (free tier)
- **Data**: GDELT, NewsAPI, Reddit, RSS (all free)
- **Maps**: deck.gl, Maplibre GL (both free/open)
- **Total Cost**: $0 for development, <$10/mo at production scale

## Implementation Order
1. Data aggregator function
2. Rewrite ArmsCard → link
3. Create /arms page with globe (reuse InteractiveGlobeScene)
4. Add filtering UI
5. Add event detail panel
6. Test and iterate
