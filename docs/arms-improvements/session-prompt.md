# ARMS Viewer — Autonomous Improvement Session

You are a senior engineer making one incremental, production-quality improvement
to the ARMS conflict-mapping viewer inside the `ageofabundance-wiki` Next.js app.

**Monorepo root:** `/Volumes/Seagate Portable Drive/claude/dds-platform`
**App:** `apps/ageofabundance-wiki`
**Deploy:** push to `main` → GitHub Actions builds on Ubuntu → `vercel deploy --prebuilt --prod`

Every session produces one complete, tested, backward-compatible change.
One commit. Clean Git state. No orphaned code.

---

## CONTEXT

**Stack**
| Layer | Technology |
|---|---|
| App framework | Next.js 15 App Router, TypeScript strict |
| 2D map | deck.gl `ScatterplotLayer` + MapLibre GL |
| 3D globe | Three.js + `@react-three/fiber` + `@react-three/drei` |
| Data | Supabase PostgreSQL — `globe_events` table |
| Types | `@dds/types` — `GlobeEventRow`, `EventTag`, `TAG_COLORS`, `TAG_NAMES` |
| Build | Turborepo — `pnpm turbo build --filter=@dds/ageofabundance-wiki` |

**Key files**
```
apps/ageofabundance-wiki/
├── components/
│   ├── arms-drilldown.jsx        ← main container (state, layout)
│   ├── arms-event-detail.jsx     ← detail panel component
│   ├── flat-map.tsx              ← deck.gl flat map
│   └── arms-drilldown.css        ← shared styles
├── lib/
│   └── arms-time.ts              ← timeAgo, sourceDomain, faviconUrl, severityLabel
├── app/
│   ├── arms/page.jsx             ← ARMS route
│   └── api/
│       ├── arms-events/route.ts      ← event fetch endpoint (ISR, 5 min)
│       └── aggregate-events/route.ts ← cron aggregation
docs/arms-improvements/
├── backlog.md   ← source of truth for what to build next
└── routine.md   ← (this file's predecessor)
```

**Design philosophy**
Dark professional UI. Glanceable at a glance, deep on demand.
Reference apps: **Liveuamap · WorldMonitor · Bellingcat · Windy.com · Flightradar24**
- Surface: dark background, coloured event type badges, images where available
- Drill-down: every click must reveal something the user couldn't see before
- Performance: `filteredEvents` can be 400+ items — use `useMemo`, never O(n²)
- Audience: journalists who need to cite sources + general public who need clarity

---

## SESSION PROTOCOL

### STEP 1 — READ STATE

Read `docs/arms-improvements/backlog.md`.
Find the first unchecked `- [ ]` item.
State it clearly. Do not start a different task.

If an item is blocked (missing data, missing dep, pattern unclear):
- Add a one-line BLOCKED note in the backlog
- Move to the next unchecked item

### STEP 2 — AUDIT EXISTING CODE

Read the relevant source files for the chosen task.
Identify:
- What already exists that can be reused or extended
- Any state, props, or CSS that the new feature must integrate with
- Whether the task requires a new component file, a new lib utility, or a change to `arms-drilldown.jsx`

Do NOT delete or refactor working code. Additions only, unless the task explicitly replaces something broken.

### STEP 3 — VERIFY PATTERN

Before writing code, confirm the implementation pattern exists in one of:
- Existing code in this repo (preferred)
- deck.gl documentation / examples (deck.gl.io)
- `@react-three/drei` examples (drei.pmnd.rs)
- A reference app listed above (Liveuamap, WorldMonitor, etc.)
- MDN / standard browser API

Summarise in 2–3 bullet points:
- What pattern you're following and where it comes from
- Any gotchas relevant to Next.js App Router or the monorepo build
- Whether a new dependency is needed (only add if 1 000+ GitHub stars)

### STEP 4 — IMPLEMENT

**File structure rules**
- New UI component → `components/arms-<name>.jsx` + co-located `arms-<name>.css`
- New utility → `lib/arms-<name>.ts`
- Wire into `arms-drilldown.jsx` — keep logic out of the container
- Never add inline styles; use CSS custom properties or co-located CSS

**Feature flag rule (Phase 3 and 4 tasks only)**
Guard with `process.env.NEXT_PUBLIC_ARMS_<FEATURE>` defaulting to `'false'`.
Document the flag name in the backlog item when marking done.

**Dependency rule**
Zero new deps for Phase 1–2 tasks.
Phase 3: may use existing `three`, `@react-three/fiber`, `@react-three/drei`.
Phase 4: new dep only if 1 000+ GitHub stars AND not already provided by an existing package.

**No regressions rule**
- Flat map must load and display events after your change
- Globe must load and display events after your change
- All existing filters (tags, date range) must still work
- `ArmsEventDetail` must render correctly on event select

**Token rule**
Any colour used in a new component must come from:
- An existing CSS custom property in `arms-drilldown.css`, OR
- A `TAG_COLORS` / `TAG_NAMES` value from `@dds/types`, OR
- A new CSS custom property added in the same commit with a clear name

No hardcoded hex values in component files.

### STEP 5 — FALLBACKS

Every new feature must degrade gracefully:

| Scenario | Required fallback |
|---|---|
| Event has no `url` | Hide CTA button — no broken link |
| Event has no `date` | Show "Unknown date" — no crash |
| Favicon fails to load | `onError` hides the `<img>` — no broken icon |
| New API route fails | Return `{ events: [] }` with error logged — no 500 |
| New deck.gl layer fails | Catch in `onError` / `onBeforeRender` — fall back to existing ScatterplotLayer |
| WebGL context lost (globe) | `<Suspense>` boundary with a text fallback — no blank screen |
| Feature flag `false` | Component is not mounted — zero overhead |

### STEP 6 — SELF-TEST

Run all four before marking done:

```bash
# 1. Type check
pnpm tsc --noEmit

# 2. Build
pnpm turbo build --filter=@dds/ageofabundance-wiki

# 3. Dev server visual check
# Open http://localhost:3001/arms
# Verify: flat map loads, events appear, new feature is visible and functional
# Verify: click an event — ArmsEventDetail renders with no console errors
# Verify: switch to globe — globe loads, filters work

# 4. Console check
# No new errors or warnings introduced by your change
```

If TypeScript or build fails: fix before committing.
If visual check fails: fix before committing.
Do not commit broken code.

### STEP 7 — COMMIT AND UPDATE BACKLOG

**Commit format**
```
feat(arms): <what changed in plain English> — backlog item <N.N>
```

Stage only the files you touched. Do not `git add .`.

**After committing:**
- Mark the backlog item `[x]` and add: ` — <commit hash> — <one sentence what changed>`
- Commit the backlog update separately or in the same commit — your choice
- Do NOT push — the user will review and push

**Report to user:**
1. What you built (one paragraph, plain English, no jargon)
2. Which backlog item is done
3. What the next item is
4. Any risks or dependencies to flag

---

## QUALITY GATES

A session is only valid when ALL of the following are true:

- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm turbo build --filter=@dds/ageofabundance-wiki` exits 0
- [ ] New feature is visually verified in the dev server
- [ ] No new console errors
- [ ] At least one fallback path is implemented for the new feature
- [ ] `docs/arms-improvements/backlog.md` is updated
- [ ] Commit message references the backlog item number
- [ ] No existing component props or API response shapes are changed

If any gate fails: fix it. Do not leave the repo in a broken state.

---

## INTEGRATION REGISTRY

Update this section as items complete.

### Phase 1 — Surface Value
- [DONE 2026-05-03] `arms-event-detail.jsx` — coloured tag badge, relative timestamp, source favicon, severity label, "Open source" CTA — replaces lat/lon/raw-number detail panel (item 1.1)
- [DONE 2026-05-03] `lib/arms-time.ts` — `timeAgo`, `sourceDomain`, `faviconUrl`, `severityLabel` utilities

### Phase 2 — WorldMonitor Surface
_(none yet)_

### Phase 3 — R3F Globe Immersion
_(none yet)_

### Phase 4 — Data Intelligence
_(none yet)_

---

## REFERENCE: data shape

```typescript
// From @dds/types
interface GlobeEventRow {
  id?: string
  source: string        // e.g. 'gdelt', 'newsapi', 'reddit'
  external_id: string
  lat: number
  lon: number
  weight: number        // 0–10 severity score
  name: string          // event headline / title
  url: string | null    // source article URL
  tag: EventTag | null  // 'lethal' | 'disaster' | 'geopolitical' | 'military' | 'news' | 'social' | 'tech-news'
  date: string | null   // ISO date string
}

// TAG_COLORS: Record<EventTag, [r, g, b]> — convert to CSS with rgb(r, g, b)
// TAG_NAMES: Record<EventTag, string>  — human-readable label
```

## REFERENCE: environment variables

```
NEXT_PUBLIC_DDS_SUPABASE_URL        — Supabase project URL
NEXT_PUBLIC_DDS_SUPABASE_ANON_KEY   — public key (client-side safe)
DDS_SUPABASE_SERVICE_ROLE_KEY       — server-only (aggregate route)
CRON_SECRET                         — Vercel cron auth
ALLOW_VERCEL_BUILD                  — set to '1' by GitHub Actions only
```
