# Agent Coordination & Task Tracking

**Central hub for subagent-driven development. Agents follow this pattern for all reports.**

---

## Status Report Pattern

Each agent writes **one status update per task** following this format:

```
## Task #N: [Task Name] — [STATUS]

**Status:** in_progress | blocked | completed | failed

**Progress:**
- [x] Step 1: Description
- [ ] Step 2: Description
- [ ] Step 3: Description

**Blocker (if blocked):**
- What is blocking: [description]
- Impact: [what can't proceed]
- Awaiting: [decision, approval, another agent's task]

**Output (if completed):**
- Files created/modified: [list with line counts]
- Tests: [passing count / total]
- Next task: #N+1 (link to task list)

**Metadata:**
- Agent: [agent name/ID]
- Time spent: [rough estimate]
- Commit: [git commit hash or "pending"]
```

---

## Task Status in TaskList

The main task list (TaskList output) shows:
- **Task ID** and **Subject** — identifies the work
- **Status** — one of: `pending`, `in_progress`, `completed`
- **Owner** — agent currently working on it (or empty if unassigned)
- **BlockedBy** — tasks that must finish first (if any)

**Progression:** `pending` → `in_progress` (when agent starts) → `completed` (when agent finishes and reports)

---

## Coordination Rules

### For Agents
1. **Claim a task** — When you start, update task status to `in_progress` and set `owner` to your agent name
2. **Report progress** — After each major step, post one status update in the format above
3. **Commit early** — Make a commit at the end of each step (don't batch multiple steps into one commit)
4. **Mark done** — When task completes, update task status to `completed` and post final report
5. **If blocked** — Post blocker report immediately, don't wait. Main Claude will unblock you.
6. **No silent failures** — If something breaks, report it. Don't try to hide it or work around it.

### For Main Claude (Director)
1. **Dispatch subagents** — One agent per task (or group of related short tasks)
2. **Monitor reports** — Watch for blocker reports, test failures, or slow progress
3. **Unblock agents** — Review blockers, make decisions, post clarifications
4. **Redirect if needed** — If agent goes off-track, redirect before they waste time
5. **Approve completions** — When agent marks task done, verify output before moving to next task
6. **Celebrate wins** — Acknowledge completed tasks, mark them in the tracker
7. **Keep this doc in sync** — Update the tracker as tasks complete

---

## Current Plan

**Implementation:** News scraper → entries pipeline  
**Plan file:** `docs/superpowers/plans/2026-04-16-news-scraper-entries-seed.md`  
**Total tasks:** 9 implementation tasks + 1 tracking task = 10 tasks

### Task Queue

| ID | Task | Owner | Status | Blocker |
|---|---|---|---|---|
| #3 | Task 1: Set up test infrastructure | — | pending | — |
| #4 | Task 2: Write transform schema tests | — | pending | #3 |
| #5 | Task 3: Implement schema transformation | — | pending | #4 |
| #6 | Task 4: Write WHO scraper tests | — | pending | #3 |
| #7 | Task 5: Implement WHO scraper | — | pending | #6 |
| #8 | Task 6: Implement remaining scrapers | — | pending | #6 |
| #9 | Task 7: Implement seeder script | — | pending | #5, #7, #8 |
| #10 | Task 8: Verify visual rendering | — | pending | #9 |
| #11 | Task 9: Final commit & summary | — | pending | #10 |

---

## Example Agent Report

```
## Task #3: Set up test infrastructure — in_progress

**Status:** in_progress

**Progress:**
- [x] Step 1: Create types file for raw article shape
- [x] Step 2: Add test dependencies to package.json
- [ ] Step 3: Add test script to package.json
- [ ] Step 4: Commit

**Output so far:**
- Created: `scripts/scrape-and-seed/types.ts` (47 lines)
- Modified: `package.json` (added vitest, @vitest/ui, node-fetch, axios)

**Metadata:**
- Agent: subagent-1
- Time spent: ~5 min
- Status: On track, will commit when all steps done
```

---

## How to Use This Tracker

1. **At start of session:** Director reviews task queue, dispatches agents to available tasks
2. **During execution:** Agents post status updates after each major step
3. **If blocked:** Agent posts blocker report, waits for director response
4. **Between tasks:** Director reviews outputs, marks task complete, dispatches next agent
5. **At end:** Final summary of all completed tasks, git log, visual verification

---

## Commit Message Pattern

All agents follow this pattern for commits:

```
<type>: <subject>

<body (optional)>

Task: #<task-id>
```

**Types:**
- `feat:` — new feature
- `test:` — test file or test changes
- `fix:` — bug fix
- `docs:` — documentation
- `refactor:` — refactoring (avoid unless necessary)
- `setup:` — setup/config changes

**Example:**
```
test: add transform schema tests

Write failing unit tests for articleToEntry transformation,
covering slug generation, tag mapping, and field inclusion.

Task: #4
```

---

## Files Modified by This Coordination

- `AGENT_COORDINATION.md` — this file (central tracker)
- Task list (created via TaskCreate) — owned by task system
- Plan document — `docs/superpowers/plans/2026-04-16-news-scraper-entries-seed.md`

---

## Next Steps

**Dispatch order** (based on dependencies):

1. **Parallel dispatch (can run simultaneously):**
   - Agent A → Task #3 (infrastructure setup)
   - Agent B → Task #6 (WHO scraper tests)

2. **After both complete, dispatch Task #4 & #5 in parallel** (depends on #3, #6)

3. **Continue cascading** per the dependency graph

**Start:** Dispatch Agent A to Task #3 and Agent B to Task #6

