# ARMS Platform Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete ARMS platform feature parity with WorldMonitor by implementing 3D globe enhancements, fixing flat map rendering, and setting up parallel agent dispatch for remaining features.

**Architecture:** Three-phase approach:
1. **Phase 2a** — Fix & verify core visualization (flat map rendering + basemap toggle)
2. **Phase 2b** — Enhance globe with 3D tiles (buildings, terrain, satellite)
3. **Phase 2c** — Code cleanup and agent dispatch setup

**Tech Stack:** Next.js, Three.js, MapLibre GL, deck.gl, three-geospatial, Supabase, TypeScript

---

## File Structure

Files to be created/modified:

**Flat Map Enhancement:**
- `apps/ageofabundance-wiki/components/flat-map.tsx` — Add basemap state + controls
- `apps/ageofabundance-wiki/components/flat-map.css` — Style basemap toggle buttons
- `apps/ageofabundance-wiki/components/arms-drilldown.jsx` — Pass basemap state to FlatMap

**Globe Enhancement:**
- `apps/ageofabundance-wiki/components/globe-3d-tiles.tsx` — New component for 3D tiles
- `packages/globe/src/index.tsx` — Extend InteractiveGlobeScene with 3D tiles support

**Code Cleanup:**
- `packages/types/src/index.ts` — Central barrel export for all shared types
- `ARCHITECTURE.md` — Single source of truth documentation

---

## Phase 2a: Flat Map Rendering & Basemap Toggle

### Task 1: Verify and Fix Deck.gl Event Point Rendering

**Files:**
- `apps/ageofabundance-wiki/components/flat-map.tsx`
- Create: `apps/ageofabundance-wiki/components/flat-map-debug.ts` (temporary debug helper)

- [ ] **Step 1: Debug event rendering**

Create temporary debug helper to inspect deck.gl initialization:

```typescript
// apps/ageofabundance-wiki/components/flat-map-debug.ts
export function debugDeckGL(overlay: MapboxOverlay | null, events: any[]) {
  if (!overlay) {
    console.warn('[flat-map] Overlay not initialized')
    return
  }
  console.log('[flat-map] Overlay initialized')
  console.log('[flat-map] Events to render:', events.length)
  console.log('[flat-map] Overlay props:', (overlay as any).props)
}
```

- [ ] **Step 2: Add debug call to flat-map useEffect**

Modify `apps/ageofabundance-wiki/components/flat-map.tsx` to add debug output:

```typescript
useEffect(() => {
  if (!overlay.current || !events.length) return

  const validEvents = events.filter(e => e.lat !== 0 || e.lon !== 0)
  if (!validEvents.length) {
    console.warn('[flat-map] No valid events after filtering')
    overlay.current.setProps({ layers: [] })
    return
  }

  // DEBUG
  import('./flat-map-debug').then(m => m.debugDeckGL(overlay.current, validEvents))

  // ... rest of code
}, [events, selectedEventId, onEventSelect])
```

- [ ] **Step 3: Check browser console for debug output**

Open DevTools on `/arms` → Map view. Look for `[flat-map]` logs. Expected output:
- `[flat-map] Overlay initialized`
- `[flat-map] Events to render: 415`

If Overlay is null or event count is 0, the issue is in event data flow. If count is correct, the ScatterplotLayer may have rendering issues.

- [ ] **Step 4: Verify event data shape**

Add console.log to see actual event objects:

```typescript
const features = validEvents.map(event => {
  const feature = {
    position: [event.lon, event.lat] as [number, number],
    size: Math.max(event.weight * 0.5, 8),
    color: getEventColor(event.tag),
    properties: event,
  }
  console.log('[flat-map] Sample feature:', feature)
  return feature
})
```

Expected: position is `[lon, lat]` (e.g., `[2.3522, 48.8566]` for Paris), size is 8-100px, color is RGB array.

- [ ] **Step 5: Remove debug code**

Delete `flat-map-debug.ts` and remove all debug console.logs from `flat-map.tsx`.

---

### Task 2: Add Basemap Toggle Controls

**Files:**
- `apps/ageofabundance-wiki/components/flat-map.tsx`
- `apps/ageofabundance-wiki/components/flat-map.css`
- `apps/ageofabundance-wiki/components/arms-drilldown.jsx`

- [ ] **Step 1: Add basemap state to arms-drilldown**

Modify `apps/ageofabundance-wiki/components/arms-drilldown.jsx`:

```typescript
const [mapBasemap, setMapBasemap] = useState('light') // 'light' | 'dark' | 'satellite'
```

Add this near line 18 where other state is initialized.

- [ ] **Step 2: Pass basemap to FlatMap component**

Update FlatMap call in arms-drilldown.jsx (around line 162):

```typescript
<FlatMap
  events={filteredEvents}
  selectedEventId={selectedEvent?.id}
  onEventSelect={setSelectedEvent}
  basemap={mapBasemap}
  onBasemapChange={setMapBasemap}
/>
```

- [ ] **Step 3: Update FlatMap props interface**

Modify `apps/ageofabundance-wiki/components/flat-map.tsx` interface:

```typescript
export interface FlatMapProps {
  events: GlobeEventRow[]
  selectedEventId?: string | null
  onEventSelect?: (event: GlobeEventRow) => void
  basemap?: 'light' | 'dark' | 'satellite'
  onBasemapChange?: (basemap: 'light' | 'dark' | 'satellite') => void
}
```

- [ ] **Step 4: Map basemap to URL**

Add basemap style mapping in FlatMap component:

```typescript
const basemapStyles = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
}

const mapStyle = basemapStyles[props.basemap || 'light']
```

Update map initialization (line 42-49):

```typescript
map.current = new maplibregl.Map({
  container: mapContainer.current,
  style: mapStyle, // Use dynamic style
  center: [0, 20],
  zoom: 2,
  pitch: 0,
  bearing: 0,
})
```

- [ ] **Step 5: Add basemap toggle HTML**

Add toggle buttons to FlatMap JSX (after the map container div):

```typescript
<div className="flat-map__basemap-toggle">
  <button
    className={`flat-map__basemap-btn ${props.basemap === 'light' ? 'active' : ''}`}
    onClick={() => props.onBasemapChange?.('light')}
    title="Light basemap"
  >
    🗺️
  </button>
  <button
    className={`flat-map__basemap-btn ${props.basemap === 'dark' ? 'active' : ''}`}
    onClick={() => props.onBasemapChange?.('dark')}
    title="Dark basemap"
  >
    🌙
  </button>
  <button
    className={`flat-map__basemap-btn ${props.basemap === 'satellite' ? 'active' : ''}`}
    onClick={() => props.onBasemapChange?.('satellite')}
    title="Satellite basemap"
  >
    🛰️
  </button>
</div>
```

Add this before the closing `</div>` of `flat-map` class.

- [ ] **Step 6: Style basemap toggle**

Add to `apps/ageofabundance-wiki/components/flat-map.css`:

```css
.flat-map__basemap-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 5;
}

.flat-map__basemap-btn {
  background: rgba(15, 25, 45, 0.8);
  border: 1px solid rgba(100, 150, 200, 0.2);
  border-radius: 4px;
  width: 40px;
  height: 40px;
  padding: 0;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flat-map__basemap-btn:hover {
  background: rgba(15, 25, 45, 0.95);
  border-color: rgba(100, 150, 200, 0.5);
}

.flat-map__basemap-btn.active {
  background: rgba(100, 150, 200, 0.3);
  border-color: rgba(100, 150, 200, 1);
}
```

- [ ] **Step 7: Test basemap toggle**

Run dev server and navigate to `/arms` → Map view. 
- Click each basemap button (🗺️, 🌙, 🛰️)
- Verify map style changes for each
- Verify button active state highlights correctly
- Verify light map shows light colors, dark shows dark, satellite shows aerial view

Expected: Smooth visual transition between basemap styles.

- [ ] **Step 8: Commit**

```bash
git add apps/ageofabundance-wiki/components/flat-map.tsx
git add apps/ageofabundance-wiki/components/flat-map.css
git add apps/ageofabundance-wiki/components/arms-drilldown.jsx
git commit -m "feat: add basemap toggle controls to flat map (light/dark/satellite)"
```

---

### Task 3: Verify Event Points Render on All Basemaps

**Files:**
- `apps/ageofabundance-wiki/components/flat-map.tsx`

- [ ] **Step 1: Test event rendering on light basemap**

Open `/arms` → Map. Verify:
- Colored dots/circles visible on map
- Multiple points scattered across Africa, Europe, Middle East
- Clicking on point shows event in detail panel

Expected: 10+ visible event points at zoom level 2.

- [ ] **Step 2: Test on dark basemap**

Click 🌙 button. Verify:
- Map background is dark gray/black
- Event points still visible (contrast is maintained)
- Points maintain their color

Expected: Same events visible with good contrast on dark background.

- [ ] **Step 3: Test on satellite basemap**

Click 🛰️ button. Verify:
- Map shows aerial/satellite view
- Event points still visible
- Basemap is Esri World Imagery

Expected: Realistic satellite imagery with event overlays.

- [ ] **Step 4: Test zooming and panning**

On each basemap:
- Zoom in (scroll wheel) → Points should scale up
- Zoom out → Points should scale down
- Pan (drag) → Map should move, points stay with locations
- Hover over point → Cursor changes to pointer

Expected: Smooth interaction, no lag.

- [ ] **Step 5: If points not visible, inspect deck.gl**

Run in browser console:

```javascript
// Find the canvas element
const canvas = document.querySelector('canvas')
console.log('Canvas size:', canvas.width, canvas.height)
console.log('Canvas visible:', canvas.offsetParent !== null)

// Check if WebGL context exists
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
console.log('WebGL context:', gl ? 'ok' : 'failed')
```

If WebGL fails, check browser compatibility. If canvas is 0x0, add explicit dimensions to container div.

- [ ] **Step 6: If still no points, add explicit layer color**

Try making points bright white to ensure visibility:

```typescript
getFillColor: (d: any) => [255, 255, 255, 255], // Bright white
```

This is a temporary test. If white points appear, the issue is color mapping. If not, the layer isn't rendering.

---

## Phase 2b: Globe 3D Tiles Enhancement

### Task 4: Add 3D Google Tiles Support to Globe

**Files:**
- Create: `apps/ageofabundance-wiki/components/globe-3d-tiles.tsx`
- `packages/globe/src/index.tsx` — Extend with 3D tiles
- `packages/types/src/globe-config.ts` — New config types

- [ ] **Step 1: Create 3D tiles component**

Create `apps/ageofabundance-wiki/components/globe-3d-tiles.tsx`:

```typescript
'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export interface Globe3DTilesProps {
  scene: THREE.Scene
  camera: THREE.Camera
  enabled?: boolean
}

export function loadGoogleTiles(scene: THREE.Scene, camera: THREE.Camera) {
  try {
    // Using three-geospatial or similar library
    // This is a placeholder - actual implementation depends on chosen library
    console.log('[3d-tiles] Loading Google 3D tiles...')
    
    // Would add Google 3D tileset to scene
    // Example with three-geospatial:
    // const tileset = await Cesium3DTileset.fromUrl(googleTilesUrl)
    
    return true
  } catch (err) {
    console.error('[3d-tiles] Failed to load:', err)
    return false
  }
}

export function enable3DTiles(scene: THREE.Scene, enabled: boolean) {
  // Toggle visibility of 3D tiles
  scene.traverseVisible(obj => {
    if ((obj as any).is3DTile) {
      obj.visible = enabled
    }
  })
}
```

- [ ] **Step 2: Install three-geospatial or alternative**

Decide on library for 3D tiles:
- `three-geospatial` — Cesium 3D Tiles
- `@deck.gl/geo-layers` — Deck.gl geospatial with 3D support
- `potree` — Point cloud rendering

Add to `apps/ageofabundance-wiki/package.json`:

```json
"dependencies": {
  "three-geospatial": "latest"
}
```

Then: `pnpm install`

- [ ] **Step 3: Extend InteractiveGlobeScene**

Modify `packages/globe/src/index.tsx` to accept 3D tiles config:

```typescript
export interface InteractiveGlobeSceneProps {
  events: GlobeEventRow[]
  focusedIndex?: number | null
  onPointSelect?: (index: number, event: GlobeEventRow) => void
  background?: string | null
  enable3DTiles?: boolean // New prop
}

export function InteractiveGlobeScene(props: InteractiveGlobeSceneProps) {
  // ... existing code ...
  
  useEffect(() => {
    if (props.enable3DTiles && sceneRef.current) {
      import('../lib/globe-3d-tiles').then(m => {
        m.loadGoogleTiles(sceneRef.current.scene, cameraRef.current)
      })
    }
  }, [props.enable3DTiles])
}
```

- [ ] **Step 4: Add UI toggle for 3D tiles**

Add to `apps/ageofabundance-wiki/components/arms-drilldown.jsx`:

```typescript
const [enable3DTiles, setEnable3DTiles] = useState(false)

// In globe section:
<InteractiveGlobeScene
  events={filteredEvents}
  focusedIndex={selectedEvent ? filteredEvents.findIndex(e => e.id === selectedEvent.id) : null}
  onPointSelect={(index, event) => setSelectedEvent(event)}
  background={null}
  enable3DTiles={enable3DTiles}
/>

// Add toggle button in sidebar:
<button
  onClick={() => setEnable3DTiles(!enable3DTiles)}
  className={`arms-drilldown__3d-toggle ${enable3DTiles ? 'active' : ''}`}
>
  {enable3DTiles ? '🏢 3D Buildings' : '🌍 Globe Only'}
</button>
```

- [ ] **Step 5: Test 3D tiles rendering**

Run dev server. On Globe view:
- Toggle "3D Buildings" button
- Verify buildings appear/disappear
- Rotate globe to see 3D geometry
- No performance degradation

Expected: 3D building outlines visible in urban areas, maintains 60 FPS.

- [ ] **Step 6: Commit**

```bash
git add apps/ageofabundance-wiki/components/globe-3d-tiles.tsx
git add packages/globe/src/index.tsx
git add apps/ageofabundance-wiki/components/arms-drilldown.jsx
git commit -m "feat: add 3D tiles support to globe (buildings, terrain)"
```

---

## Phase 2c: Code Cleanup & Agent Dispatch

### Task 5: Establish Single Source of Truth for Types

**Files:**
- `packages/types/src/index.ts` — New barrel export
- `packages/types/src/globe-events.ts` — Already exists
- `packages/types/src/event-tags.ts` — Extract enum
- All agent files — Update imports

- [ ] **Step 1: Create barrel export**

Create `packages/types/src/index.ts`:

```typescript
// Core event types
export * from './globe-events'
export * from './event-tags'
export * from './api-responses'

// Re-export for convenience
export type {
  GlobeEventRow,
  SourceResult,
  AggregationResponse,
} from './globe-events'
```

- [ ] **Step 2: Extract event tags to separate file**

Create `packages/types/src/event-tags.ts`:

```typescript
export const EVENT_TAGS = {
  lethal: 'lethal',
  disaster: 'disaster',
  geopolitical: 'geopolitical',
  military: 'military',
  news: 'news',
  social: 'social',
} as const

export type EventTag = typeof EVENT_TAGS[keyof typeof EVENT_TAGS]

export const TAG_COLORS: Record<EventTag, [number, number, number]> = {
  lethal: [255, 100, 100],
  disaster: [255, 150, 0],
  geopolitical: [255, 100, 100],
  military: [255, 80, 80],
  news: [100, 150, 255],
  social: [100, 255, 100],
}
```

- [ ] **Step 3: Create API response types**

Create `packages/types/src/api-responses.ts`:

```typescript
import { GlobeEventRow } from './globe-events'

export interface ArmsEventsResponse {
  events: GlobeEventRow[]
  total: number
  timestamp: string
}

export interface AggregateEventsResponse {
  aggregated: number
  updated: number
  sources: {
    name: string
    count: number
    success: boolean
    duration: number
  }[]
}
```

- [ ] **Step 4: Update all imports**

Find all `import * from '@dds/types'` and verify they work. Run:

```bash
pnpm build
```

Expected: No import errors. All types resolve correctly.

- [ ] **Step 5: Update component type imports**

Verify `flat-map.tsx` and other components import from `@dds/types`:

```typescript
import { GlobeEventRow, EVENT_TAGS, TAG_COLORS } from '@dds/types'
```

- [ ] **Step 6: Commit**

```bash
git add packages/types/src/
git commit -m "refactor: establish single source of truth for shared types"
```

---

### Task 6: Document Architecture

**Files:**
- Create: `ARCHITECTURE.md`

- [ ] **Step 1: Create architecture document**

Create `ARCHITECTURE.md` in project root:

```markdown
# ARMS Platform Architecture

## Overview

ARMS (Abundance at Arms) is a real-time geopolitical conflict mapping platform built on Next.js, Three.js, MapLibre GL, and deck.gl.

## Core Layers

### 1. Data Layer
- **Source**: Multi-source aggregation (GDELT, NewsAPI, Reddit, RSS, HackerNews)
- **Storage**: Supabase PostgreSQL (`globe_events` table)
- **API**: `/api/arms-events` (fetch), `/api/aggregate-events` (POST cron)

### 2. Visualization Layer
- **Globe**: Three.js 3D globe with event points
- **Flat Map**: MapLibre GL with deck.gl ScatterplotLayer
- **3D Tiles**: Google 3D buildings/terrain (optional)

### 3. UI Layer
- Sidebar: Filters (tags, date range), mode toggle
- Viewport: Dynamic globe/map view
- Detail Panel: Event information on selection

## File Organization

```
apps/ageofabundance-wiki/
├── app/
│   ├── api/
│   │   ├── arms-events/       # Event fetching endpoint
│   │   └── aggregate-events/  # Multi-source aggregation
│   └── arms/
│       └── page.jsx           # ARMS drilldown page
├── components/
│   ├── arms-drilldown.jsx     # Main component
│   ├── flat-map.tsx           # MapLibre + deck.gl
│   └── globe-3d-tiles.tsx     # 3D tiles support
└── styles/

packages/
├── types/                      # Shared TypeScript types
├── globe/                      # Three.js globe component
└── ...
```

## Single Source of Truth

All types: `packages/types/src/index.ts`
All colors: `packages/types/src/event-tags.ts`
All APIs: Listed in this doc

## Adding New Sources

1. Create function returning `Promise<GlobeEventRow[]>`
2. Add to `SOURCES` config in `/api/aggregate-events`
3. Export from route handler
4. Update `AGENT_1_MULTI_SOURCE_AGGREGATOR.md` documentation

## Adding New Visualizations

1. Create component accepting `GlobeEventRow[]`
2. Import types from `@dds/types`
3. Add toggle to sidebar if needed
4. Update `arms-drilldown.jsx` to render conditionally
```

- [ ] **Step 2: Add to git**

```bash
git add ARCHITECTURE.md
git commit -m "docs: add architecture documentation"
```

---

### Task 7: Prepare for Agent Dispatch

**Files:**
- Create: `AGENT_2_DATA_LAYER_SYSTEM.md`
- Create: `NEXT_AGENTS.md`

- [ ] **Step 1: Create Agent 2 spec**

Create `AGENT_2_DATA_LAYER_SYSTEM.md`:

```markdown
# Agent 2: Data Layer System

## Goal
Implement 45+ configurable data layers that can be toggled on/off in the sidebar.

## Layers

### Conflict (12)
- Active conflicts
- Disputed territories
- Military installations
- Naval activity
- ...

### Infrastructure (10)
- Power plants
- Water supplies
- Transportation hubs
- ...

### Economic (8)
- Trade routes
- Resource deposits
- Market centers
- ...

### Social (8)
- Population density
- Refugee camps
- Protests
- ...

### Environmental (5)
- Climate zones
- Disaster zones
- Pollution
- ...

### Custom (2+)
- User-defined layers

## Implementation
[Detailed tasks following writing-plans format...]
```

- [ ] **Step 2: Create agent dispatch roadmap**

Create `NEXT_AGENTS.md`:

```markdown
# Remaining Agent Dispatch Queue

## Status
- ✅ Agent 1: Multi-Source Aggregator
- 🔄 Agent 2: Data Layer System (ready for dispatch)
- 🔄 Agent 3: Intelligence Index (depends on Agent 2)
- 🔄 Agent 4: Cross-Stream Correlation
- 🔄 Agent 5: Financial Radar
- 🔄 Agent 6: Flight Tracking
- 🔄 Agent 7: Multi-Language Support
- 🔄 Agent 8: Site Variants
- 🔄 Agent 9: Offline AI
- 🔄 Agent 10: Performance Optimization

## Dispatch Sequence
1. Complete Phase 2a-2c
2. Dispatch Agent 2-4 in parallel
3. After 2-4 complete, dispatch 5-6
4. After all features, dispatch 7-10

## Cost Estimate
~40-50 agent-hours total for full feature parity
```

- [ ] **Step 3: Commit**

```bash
git add AGENT_2_DATA_LAYER_SYSTEM.md
git add NEXT_AGENTS.md
git commit -m "docs: prepare agent dispatch queue and specifications"
```

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-03-arms-next-phase.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Tasks 1-7 become independent work items.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach would you prefer?**

If Subagent-Driven: I'll use superpowers:subagent-driven-development to dispatch Task 1 immediately.

If Inline Execution: Ready to begin Task 1 with executing-plans.
