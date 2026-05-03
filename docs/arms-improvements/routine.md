# ARMS Incremental Improvement Routine

Paste this prompt into Claude Code to run one improvement cycle.
One task. One commit. One deploy. Stop.

---

## Prompt (copy everything below this line)

---

You are running the ARMS incremental improvement routine for the `ageofabundance-wiki` app
in the DDS platform monorepo at `/Volumes/Seagate Portable Drive/claude/dds-platform`.

## Your job — one task, then stop

1. Read `docs/arms-improvements/backlog.md`
2. Find the first unchecked item `- [ ]`
3. Run the confidence check (below)
4. If confident: implement it, test it, commit it, mark it done in the backlog, stop
5. If not confident: note why in the backlog item and move to the next one

## Confidence check — must pass ALL of these before starting

- [ ] I can point to a working code pattern in THIS repo OR a flagship reference app
      (Liveuamap, WorldMonitor, Windy.com, Flightradar24, deck.gl docs, drei examples)
- [ ] The change does not modify any existing component's public interface/props
- [ ] If it needs a new dependency, that dep has 1000+ GitHub stars and is not already
      provided by a smaller existing dep
- [ ] I can implement and manually verify it in under 60 minutes of work
- [ ] It does not touch the data pipeline (`aggregate-events`, `arms-events` API routes)
      unless the task explicitly calls for a new route

If any check fails: skip the task, add a one-line note explaining which check failed,
and try the next item.

## Implementation rules

**Modularity**
- New UI: new component file in `apps/ageofabundance-wiki/components/arms-*/`
- New util: `apps/ageofabundance-wiki/lib/arms-*.ts`
- Import into `arms-drilldown.jsx` — do not inline logic there
- CSS: co-located `arms-<component>.css` file, never inline styles

**Feature flags**
- Any Phase 3 or 4 task: guard with `process.env.NEXT_PUBLIC_ARMS_<FEATURE>` check
- Default to `false` (opt-in). Document the flag name in the backlog item.
- Phase 1 and 2 tasks ship unconditionally — they're safe surface improvements

**No regressions**
- The existing globe view must still work after your change
- The existing flat map must still work after your change
- `filteredEvents` state and filter controls must not change behaviour
- Run the dev server and visually verify both views before committing

**Commits**
- Stage only files you touched
- Message format: `feat(arms): <what> — backlog item <N.N>`
- Do NOT push — the user will review and push

## Verification steps before committing

1. `pnpm turbo build --filter=@dds/ageofabundance-wiki` — must succeed with no errors
2. Open `/arms` in the dev server — flat map loads, globe loads, filters work
3. The new feature is visible and functional
4. No console errors introduced by your change

## After committing

- Mark the backlog item `[x]` and add a one-line completion note with the commit hash
- Report to the user:
  - What you built
  - Which backlog item is done
  - What the next item is
  - Any risks or follow-up notes

## Context files to read before starting

- `apps/ageofabundance-wiki/components/arms-drilldown.jsx` — main container
- `apps/ageofabundance-wiki/components/flat-map.tsx` — deck.gl flat map
- `packages/types/src/globe-events.ts` — shared event types
- `packages/types/src/event-tags.ts` — TAG_COLORS, TAG_NAMES
- `apps/ageofabundance-wiki/components/arms-drilldown.css` — existing styles

---

## Design principles (apply to every task)

**Surface**: Dark UI. Glanceable. Images where available. Coloured event badges.
Like WorldMonitor — professional, not playful.

**Drill-down**: Practical. Every click should tell you something you couldn't see before.
Current lat/lon display has zero value — replace with: source, headline, time, link.

**Performance**: `filteredEvents` can be 400+ points. Never O(n²). Use `useMemo`.
deck.gl handles 1M points — don't fight it, use its built-in layers.

**Audience**: Journalists who need to cite it + general public who need to understand it.
Every feature should serve both: a good image hook for the journalist,
a clear plain-language label for the public.
