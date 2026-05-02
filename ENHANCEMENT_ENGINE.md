# Nanobot Enhancement Engine

Autonomous system for discovering, improving, and deploying product enhancements. Every 6 hours, picks one atomic task (5-10 min improvement), executes it, scores against rules, and deploys via local-first pipeline.

---

## Architecture

```
discover-domains (hourly cron)
  ↓
  Scans Vercel projects → product_registry
  
product_registry (Supabase)
  ↓
  14 domains, rules, summaries
  
enhancement_tasks (Supabase)
  ↓
  Pending improvements, scored by rule violation
  
run-enhancement (every 6 hours cron)
  ↓
  Pick lowest-scoring task
  Execute locally (pnpm turbo build)
  Deploy via make deploy (prebuilt)
  Log to /tmp/deploy.log
```

---

## How It Works

### 1. Discovery (Hourly)

`/api/discover-domains` runs every hour:

```bash
GET /api/discover-domains
Authorization: Bearer $CRON_SECRET
```

**What it does:**
- Queries Vercel API for all projects
- Creates/updates `product_registry` entries
- One entry per domain (ageofabundance-shop, ageofabundance-wiki, etc.)

**Example product_registry row:**
```json
{
  "id": "uuid-...",
  "domain": "shop",
  "app_name": "ageofabundance-shop",
  "vercel_project_id": "prj_...",
  "name": "Age of Abundance Shop",
  "has_rules": false,
  "is_active": true,
  "created_at": "2026-04-15T09:00:00Z"
}
```

### 2. Rule Assessment

Human or AI adds `rules.md` to each app:

```markdown
# Rules: ageofabundance-shop

## Performance
- Lighthouse score must be 90+
- LCP must be < 2.5s
- CLS must be < 0.1

## UX
- Mobile nav must be accessible (WCAG 2.1 AA)
- Form submission < 1s feedback

## Accessibility
- All images must have alt text
- Color contrast must be 4.5:1 minimum
```

Tool: `POST /api/products/:id` with `rules_json` field (parsed rules).

Flag: `has_rules = true` when rules are loaded.

### 3. Enhancement Execution (Every 6 Hours)

`/api/run-enhancement` cron picks and executes one task:

```bash
GET /api/run-enhancement
Authorization: Bearer $CRON_SECRET
```

**Algorithm:**
1. Find active product with lowest rule compliance score
2. Find pending enhancement_tasks for that product
3. Pick lowest-scoring task (biggest rule violation)
4. Execute improvement locally
5. Build with `pnpm turbo build`
6. Deploy with `make deploy`
7. Update task status → `completed`, log duration, new score

**Example task execution:**
```
[09:15:02] START: Performance → Optimize images in ageofabundance-shop
[09:15:35] Built app locally (32s)
[09:15:42] Deployed via make deploy (7s)
[09:15:42] DONE: Task completed, score improved 4 → 6
```

---

## Database Schema

### product_registry
```sql
id UUID (primary)
domain TEXT (unique)         -- "shop", "wiki", "dev"
app_name TEXT                -- "ageofabundance-shop"
vercel_project_id TEXT       -- "prj_..."
created_at TIMESTAMP
updated_at TIMESTAMP
name TEXT
description TEXT
rules_json JSONB             -- Parsed rules
summary TEXT                 -- Current product summary
has_rules BOOLEAN            -- Flag: rules loaded?
is_active BOOLEAN            -- Skip if false
```

### enhancement_tasks
```sql
id UUID (primary)
product_id UUID (fk)
domain TEXT
app_name TEXT
created_at TIMESTAMP
updated_at TIMESTAMP

rule_name TEXT               -- "Performance" / "UX" / etc.
task_type TEXT               -- 'performance', 'ux', 'accessibility', 'seo', 'code_quality'
title TEXT                   -- "Optimize Lighthouse score"
description TEXT
status TEXT                  -- 'pending', 'in_progress', 'completed', 'failed', 'skipped'
priority INTEGER             -- 0=low, 1=medium, 2=high

score_before DECIMAL(3, 1)   -- 0-10 scale
score_after DECIMAL(3, 1)
rule_score DECIMAL(3, 1)     -- Gap vs. gold standard

assigned_to TEXT
started_at TIMESTAMP
completed_at TIMESTAMP
duration_seconds INTEGER

changes_json JSONB           -- {files: [...], lines: [...]}
logs TEXT                    -- Build/deploy logs
error_message TEXT           -- If failed
```

---

## API Endpoints

### Products

**List all active products:**
```bash
GET /api/products
```

**Get single product by domain:**
```bash
GET /api/products?domain=shop
```

**Create product (manual):**
```bash
POST /api/products
Content-Type: application/json

{
  "domain": "shop",
  "app_name": "ageofabundance-shop",
  "name": "Age of Abundance Shop",
  "description": "...",
  "rules_json": {}
}
```

**Update product (e.g., load rules):**
```bash
PUT /api/products?id=<uuid>
Content-Type: application/json

{
  "rules_json": { "performance": {...}, "ux": {...} },
  "has_rules": true,
  "summary": "Current product snapshot"
}
```

**Delete product:**
```bash
DELETE /api/products?id=<uuid>
```

### Tasks

**List all pending tasks:**
```bash
GET /api/tasks?status=pending
```

**List tasks for a domain:**
```bash
GET /api/tasks?domain=shop
```

**Get single task:**
```bash
GET /api/tasks?id=<uuid>
```

**Create task (manual):**
```bash
POST /api/tasks
Content-Type: application/json

{
  "product_id": "<uuid>",
  "domain": "shop",
  "app_name": "ageofabundance-shop",
  "rule_name": "Performance",
  "task_type": "performance",
  "title": "Optimize Lighthouse score",
  "description": "...",
  "priority": 2
}
```

**Update task (e.g., mark completed):**
```bash
PUT /api/tasks?id=<uuid>
Content-Type: application/json

{
  "status": "completed",
  "score_after": 8.5,
  "duration_seconds": 45,
  "logs": "..."
}
```

**Delete task:**
```bash
DELETE /api/tasks?id=<uuid>
```

---

## Cron Jobs (Vercel)

Configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/discover-domains",
      "schedule": "0 * * * *"          // Every hour, at :00
    },
    {
      "path": "/api/run-enhancement",
      "schedule": "0 */6 * * *"         // Every 6 hours (00:00, 06:00, 12:00, 18:00)
    }
  ]
}
```

**Environment Variables (Vercel):**
```bash
CRON_SECRET=<32-char-secret>           # Must match auth header
SUPABASE_URL=https://riwtgdoxnyjihdptkqap.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<key>        # For server-side mutations
SUPABASE_ANON_KEY=<key>                # For public API endpoints
VERCEL_TOKEN=<your-token>              # For Vercel API queries
```

---

## Monitoring

### Check recent enhancements:
```bash
# Via dashboard (coming soon)
# Or query directly:
curl "https://your-app.vercel.app/api/tasks?status=completed" \
  | jq '.[] | {domain, title, status, duration_seconds}'
```

### Check deploy logs:
```bash
# On your local machine:
tail -f /tmp/deploy.log | grep "ENHANCEMENT"

# Or after a cron run:
tail -100 /tmp/deploy.log
```

### Check discovered products:
```bash
curl "https://your-app.vercel.app/api/products" | jq '.[] | {domain, app_name, has_rules}'
```

---

## Next Steps

### Phase 1 (Current)
- ✅ Supabase migrations (product_registry, enhancement_tasks)
- ✅ API endpoints (CRUD for products, tasks)
- ✅ Cron job configuration (discover-domains, run-enhancement)
- ⏳ Manual rule loading (upload rules.md per app)

### Phase 2
- Dashboard UI (drill-down editing, status monitoring)
- Actual enhancement execution (code diffs, commits)
- Email reports (daily summary of improvements)
- Self-reflection endpoint (analyze what worked, what didn't)

### Phase 3
- Multi-agent coordination (Claude agents execute complex improvements)
- Feedback loops (score improvement over time)
- Cost optimization (track enhancement ROI)

---

## Troubleshooting

**"No active products to enhance"**
- Check that `discover-domains` has run: `GET /api/products`
- If empty, run manually: `curl https://your-app/api/discover-domains -H "Authorization: Bearer $CRON_SECRET"`

**"No pending tasks for product X"**
- Create tasks manually: `POST /api/tasks` with product_id
- Or parse `rules.md` file and auto-generate tasks

**Cron jobs not running?**
- Check Vercel dashboard: Settings → Cron Jobs
- Verify `CRON_SECRET` is set in environment
- Check logs: Vercel → Deployments → Logs

**Deploy is timing out?**
- Check `/tmp/deploy.log` for KILLED lines
- Increase timeout in Makefile if app is legitimately slow
- Or split into smaller incremental improvements

---

## Safety & Cost

**Deploy Safety:**
- Single deploy lock enforced (see DEPLOY_TIMEOUT_GUIDE.md)
- Hard 10-minute ceiling per app
- Immediate kill on overrun
- All logs written to `/tmp/deploy.log`

**Cost Control:**
- All builds run locally (free)
- Vercel only serves prebuilt (< $0.10/deploy)
- Total: $0–$5/month Vercel (see COST_CONTROL.md)
- Budget monitored: `make cost` command

---

**Bottom line:** Every 6 hours, one automatic improvement runs safely, quickly, and cheaply. All changes are logged and reversible.
