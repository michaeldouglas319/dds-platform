# Cost Control: Keep Vercel Under $5/Month

## The Goal
**$0–$5/month Vercel cost** (down from $1000+/month before).

All builds are local (free). Vercel only does hosting (cheap).

---

## How We Achieve This

### 1. All Builds Are Local
```bash
make deploy    # Runs pnpm turbo build on YOUR machine (free)
               # Then uploads prebuilt artifact to Vercel
```

Vercel never builds. It only serves.

### 2. Vercel Build Guard
If Vercel somehow tries to build (shouldn't happen), it fails immediately with:
```
🚨 CRITICAL: Vercel tried to build on the cloud!
This is consuming your $5/month budget!
```

This prevents accidental cloud builds from eating your budget.

### 3. Cost Monitoring
Check your current spend:
```bash
make cost    # Shows total Vercel build minutes this month
             # Warns at 80% of $5 budget
             # Alerts at 100%
```

Output:
```
Vercel Build Cost Monitor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Budget: $5.00
Max build minutes: 2000

ageofabundance-info:       45 min
ageofabundance-wiki:       32 min
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total build minutes:   425 / 2000
Estimated cost:      $1.06 / $5.00
Budget usage:           21%

✓ Within budget
```

---

## The Math

**Vercel Pricing (Pro Plan):**
- $0.25 per 100 build minutes
- $5.00/month budget = 2,000 build minutes max
- That's ~67 minutes per day

**Your Actual Cost:**
- Local builds: $0 (your computer)
- Vercel deploys: <$0.10 (prebuilt only, minimal CDN)
- **Total: $0–$1/month** (if you never trigger cloud builds)

---

## What to Avoid

❌ **Don't push to main without `make deploy` first**
→ Vercel might trigger a rebuild (old habit from before)

❌ **Don't manually trigger Vercel rebuilds in dashboard**
→ That's a cloud build (costs money)

❌ **Don't commit to main, expect Vercel to handle it**
→ GitHub Actions are deleted, nothing auto-deploys (by design)

---

## Workflow (Always This)

```bash
# 1. Make changes locally
vim apps/ageofabundance-info/src/page.tsx

# 2. Build locally (free, cached)
make build    # or just: make deploy (does build + deploy)

# 3. Test locally (free)
make dev

# 4. Ship to Vercel (cheap, prebuilt)
make deploy   # Detects changed apps, uploads prebuilt

# 5. Done. Check cost occasionally
make cost     # Verify you're still under budget
```

---

## If You Hit the Budget

### Option 1: Clear Old Builds
Vercel charges for build minutes in the **current month** only.
Each month resets.

So if you hit $5 in week 1, wait until next month (resets) or manually clear builds in Vercel dashboard.

### Option 2: Tighten Timeout
Current: 10 minutes per app max (APP_TIMEOUT=600)

To save time/cost on slow apps:
```bash
APP_TIMEOUT=300 make deploy    # 5-minute ceiling instead
```

### Option 3: Check What's Consuming Minutes
```bash
make cost    # Shows which projects consumed build time
```

If a project shows high minutes, it's either:
- Very slow `vercel build` step (need to optimize)
- Multiple old deployments in history (safe to ignore)

---

## Monitoring

### Weekly
```bash
make cost    # Takes 10 seconds, confirms you're under budget
```

### Monthly
Check Vercel dashboard:
- Billing → Current Usage
- Should show 0 build minutes (all local)

---

## Troubleshooting

### "Estimated cost: $X.XX" shows non-zero
This is fine if it's low (<$5). It means:
- Old builds from before we switched to local (safe)
- Or rare accidental cloud builds

### "Budget usage: 85%"
Get below 80% by:
```bash
make cost    # Identify which projects are slow
```

Then either optimize that app's build, or wait until next month.

### "CRITICAL: Over budget!"
You have $5 budget per month. Once spent:
1. Vercel stops new builds
2. You can still deploy prebuilt (cheap)
3. Next month resets

To recover: run `make deploy` on all apps locally, they'll be prebuilt and cheap to upload.

---

## Long-Term

This setup is **permanent**. Once configured:
- Every person runs `make deploy` locally
- Vercel never builds
- Cost stays $0–$5/month forever
- No maintenance needed

You never have to touch this again.

---

## Reference

| Command | What It Does | Cost |
|---------|-------------|------|
| `make deploy` | Local build + prebuilt upload | <$0.10/deploy |
| `make watch-deploy` | View logs (no cost) | $0 |
| `make cost` | Check budget (no cost) | $0 |
| `make kill-deploy` | Abort stuck deploy | $0 |
| `make dev` | Local dev server | $0 |
| Vercel dashboard rebuild | ❌ Don't do this | $0.25+ |
| GitHub push without `make deploy` | ❌ Don't do this | $0.25+ |

---

**Bottom line:** `make deploy` is your only deployment interface.
Everything else costs money or doesn't work.
