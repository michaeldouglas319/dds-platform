# ARMS Viewer — Autonomous Improvement Session

You are a senior engineer making one incremental, production-quality improvement
to the ARMS conflict-mapping viewer inside the `ageofabundance-wiki` Next.js app.

**Repo:** `https://github.com/michaeldouglas319/dds-platform`
**App:** `apps/ageofabundance-wiki`
**Deploy pipeline:** push to `main` → GitHub Actions (Ubuntu runner) builds with
`VERCEL_INSTALL_COMPLETED=1 ALLOW_VERCEL_BUILD=1 vercel build --prod` →
`vercel deploy --prebuilt --prod` → live on Vercel. Zero Vercel cloud build cost.

Every session produces one complete, tested, backward-compatible change.
One commit. One push. Clean Git state. No orphaned code.

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
| Package manager | pnpm (version read from `packageManager` in root `package.json`) |

**Key files (paths relative to repo root)**
```
apps/ageofabundance-wiki/
├── components/
│   ├── arms-drilldown.jsx        ← main container (state, layout)
│   ├── arms-event-detail.jsx     ← detail panel component
│   ├── arms-event-detail.css
│   ├── flat-map.tsx              ← deck.gl flat map
│   └── arms-drilldown.css        ← shared styles
├── lib/
│   └── arms-time.ts              ← timeAgo, sourceDomain, faviconUrl, severityLabel
├── app/
│   ├── arms/page.jsx
│   └── api/
│       ├── arms-events/route.ts
│       └── aggregate-events/route.ts
docs/arms-improvements/
├── backlog.md          ← ordered task list — source of truth
└── session-prompt.md   ← this file
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

### STEP 0 — SYNC

Pull latest main before touching any files:

```bash
git pull origin main
```

If there are merge conflicts: resolve them before proceeding. Do not start work
on a dirty or out-of-date tree.

Install dependencies in case anything changed:

```bash
pnpm install --frozen-lockfile
```

---

### STEP 1 — READ STATE

Read `docs/arms-improvements/backlog.md`.
Find the first unchecked `- [ ]` item.
State it clearly. Do not start a different task.

If an item is blocked (missing data, missing dep, pattern unclear):
- Add a one-line `BLOCKED:` note inline in the backlog item
- Move to the next unchecked item

---

### STEP 2 — AUDIT EXISTING CODE

Read the relevant source files for the chosen task. Identify:
- What already exists that can be reused or extended
- Any state, props, or CSS the new feature must integrate with
- Whether the task needs a new component file, a new lib utility, or a change to `arms-drilldown.jsx`

Do NOT delete or refactor working code. Additions only, unless the task explicitly replaces something broken.

---

### STEP 3 — VERIFY PATTERN

Before writing code, confirm the implementation pattern exists in one of:
- Existing code in this repo (preferred)
- deck.gl documentation / examples
- `@react-three/drei` examples
- A reference app listed above
- MDN / standard browser API

State in 2–3 bullet points:
- What pattern you're following and where it comes from
- Any gotchas for Next.js App Router or the monorepo build
- Whether a new dependency is needed (only add if 1 000+ GitHub stars)

---

### STEP 4 — IMPLEMENT

**File structure rules**
- New UI component → `components/arms-<name>.jsx` + co-located `arms-<name>.css`
- New utility → `lib/arms-<name>.ts`
- Wire into `arms-drilldown.jsx` — keep logic out of the container
- No inline styles — use CSS custom properties or co-located CSS files

**Feature flag rule (Phase 3 and 4 tasks only)**
Guard with `process.env.NEXT_PUBLIC_ARMS_<FEATURE>` defaulting to `'false'`.
Document the env var name in the backlog when marking done.

**Dependency rule**
- Phase 1–2: zero new deps
- Phase 3: may use existing `three`, `@react-three/fiber`, `@react-three/drei`
- Phase 4: new dep only if 1 000+ GitHub stars AND not already covered by an existing package

**No regressions rule**
- Flat map must load and display events after your change
- Globe must load and display events after your change
- All existing filters (tags, date range) must still work
- `ArmsEventDetail` must render correctly on event select

**Colour rule**
All colours must come from:
- An existing CSS custom property in `arms-drilldown.css`, OR
- `TAG_COLORS` / `TAG_NAMES` from `@dds/types`, OR
- A new CSS custom property added in the same commit

No hardcoded hex values in component files.

---

### STEP 5 — FALLBACKS

Every new feature must degrade gracefully:

| Scenario | Required fallback |
|---|---|
| Event has no `url` | Hide CTA — no broken link |
| Event has no `date` | Show "Unknown date" — no crash |
| Favicon fails to load | `onError` hides the `<img>` — no broken icon |
| New API route fails | Return `{ events: [] }` with error logged — no 500 |
| New deck.gl layer fails | Fall back to existing `ScatterplotLayer` |
| WebGL context lost (globe) | `<Suspense>` boundary with text fallback — no blank screen |
| Feature flag `false` | Component not mounted — zero overhead |

---

### STEP 6 — VERIFY (no local server)

Run both checks before committing. Fix any failure before proceeding.

```bash
# 1. Type check — must exit 0
pnpm tsc --noEmit

# 2. Build — must exit 0 with no errors
pnpm turbo build --filter=@dds/ageofabundance-wiki
```

If either fails: fix the code and re-run. Do not commit broken code.

---

### STEP 7 — COMMIT, UPDATE BACKLOG, PUSH

**Stage only files you touched. Never `git add .`**

```bash
# Stage your changes
git add <specific files>

# Commit
git commit -m "feat(arms): <plain English description> — backlog item <N.N>"

# Update the backlog
# Mark item [x] and append: — <short-sha> — <one sentence what changed>
git add docs/arms-improvements/backlog.md
git commit -m "docs(arms): mark backlog item <N.N> done"

# Push — this triggers GitHub Actions → vercel build → vercel deploy --prebuilt --prod
git push origin main
```

**After pushing, verify CI started:**

```bash
gh run list --limit 3
```

The deploy workflow (`Deploy to Vercel`) should appear as `in_progress` within 10 seconds.
If it does not appear, check that the changed files match the workflow path filters:
`apps/**`, `packages/**`, `pnpm-lock.yaml`, `.github/workflows/deploy-on-push.yml`.

---

### STEP 8 — REPORT

Output a concise summary:
1. **What was built** — one paragraph, plain English
2. **Backlog item completed** — e.g. "1.2 — Relative timestamps"
3. **Next item** — the next unchecked backlog task
4. **CI status** — confirm `gh run list` shows the deploy workflow running or green
5. **Any risks** — deps, follow-up, known edge cases

---

## QUALITY GATES

A session is only valid when ALL of the following are true:

- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm turbo build --filter=@dds/ageofabundance-wiki` exits 0
- [ ] At least one fallback path is implemented for the new feature
- [ ] `docs/arms-improvements/backlog.md` is updated and committed
- [ ] Commit message references the backlog item number
- [ ] `git push origin main` completed successfully
- [ ] `gh run list` confirms the deploy workflow triggered
- [ ] No existing component props or API response shapes are changed

If any gate fails: fix it. Do not leave the repo in a broken or unpushed state.

---

## INTEGRATION REGISTRY

### Phase 1 — Surface Value
- [DONE 2026-05-03] `arms-event-detail.jsx` — coloured tag badge, relative timestamp,
  source favicon + domain, severity label, "Open source" CTA. Replaces raw lat/lon display. (item 1.1)
- [DONE 2026-05-03] `lib/arms-time.ts` — `timeAgo`, `sourceDomain`, `faviconUrl`, `severityLabel`

### Phase 2 — WorldMonitor Surface
_(none yet)_

### Phase 3 — R3F Globe Immersion
_(none yet)_

### Phase 4 — Data Intelligence
_(none yet)_

---

## REFERENCE: GlobeEventRow shape

```typescript
interface GlobeEventRow {
  id?: string
  source: string        // 'gdelt' | 'newsapi' | 'reddit' | 'rss' | 'hackernews'
  external_id: string
  lat: number
  lon: number
  weight: number        // 0–10 severity score
  name: string          // event headline / title
  url: string | null    // source article URL
  tag: EventTag | null  // 'lethal' | 'disaster' | 'geopolitical' | 'military' | 'news' | 'social' | 'tech-news'
  date: string | null   // ISO date string
}

// TAG_COLORS: Record<EventTag, [r, g, b]> — convert to CSS: `rgb(${r}, ${g}, ${b})`
// TAG_NAMES:  Record<EventTag, string>     — human-readable label
```

## REFERENCE: environment variables

```
NEXT_PUBLIC_DDS_SUPABASE_URL        — Supabase project URL (client-safe)
NEXT_PUBLIC_DDS_SUPABASE_ANON_KEY   — Supabase anon key (client-safe)
DDS_SUPABASE_SERVICE_ROLE_KEY       — server-only (aggregate-events route)
CRON_SECRET                         — Vercel cron auth header
ALLOW_VERCEL_BUILD                  — set to '1' by GitHub Actions only; guards vercel.json buildCommand
VERCEL_TOKEN                        — GitHub Actions secret; not available in app code
```

## REFERENCE: CI/CD pipeline

```
git push origin main
  └─► GitHub Actions: .github/workflows/deploy-on-push.yml
        ├── pnpm install --frozen-lockfile   (monorepo root)
        ├── detect changed apps (git diff HEAD~1 HEAD | grep '^apps/')
        └── for each changed app with .vercel/project.json:
              vercel pull --yes --environment=production
              VERCEL_INSTALL_COMPLETED=1 ALLOW_VERCEL_BUILD=1 vercel build --prod
              vercel deploy --prebuilt --prod
```
