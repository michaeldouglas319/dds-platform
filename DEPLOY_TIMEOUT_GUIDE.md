# Deploy Watcher & Timeout Guide

## What It Does

The deploy watcher ensures **no deploy step ever runs longer than its time limit**.
Nothing hangs. Nothing drains CPU. Everything either finishes or gets killed.

**Hard rule: nothing exceeds 10 minutes total per app.**

---

## How It Works

Every deploy step is wrapped with a timer that:
1. Starts the step
2. Watches the clock
3. If it runs too long → **kills it immediately**
4. Logs the kill with reason (timeout, not error)
5. Exits with failure code

One deploy at a time (mutex lock prevents parallel deploys).

---

## Timeout Limits

```
vercel build        → 5 min   (VERCEL_BUILD_TIMEOUT=300)
vercel deploy       → 3 min   (DEPLOY_TIMEOUT=180)
Total per app       → 10 min  (APP_TIMEOUT=600) ← HARD CEILING
```

These are defaults. Override per-run:
```bash
APP_TIMEOUT=300 make deploy    # Tighter 5-min ceiling instead of 10
VERCEL_BUILD_TIMEOUT=120 make deploy  # Shorter vercel build timeout
```

---

## Workflow

### Normal deploy
```bash
make deploy    # Detects changed apps, deploys each with timeout protection
```

Watch logs in another terminal:
```bash
make watch-deploy    # tail -f /tmp/deploy.log (live status)
```

Example output:
```
[10:23:41] START: vercel build (ageofabundance-info) (limit: 300s)
[10:24:15] DONE: vercel build (ageofabundance-info) completed in 34s ✓
[10:24:15] START: vercel deploy (ageofabundance-info) (limit: 180s)
[10:24:28] DONE: vercel deploy (ageofabundance-info) completed in 13s ✓
```

### Step takes too long

If `vercel build` runs for 301 seconds (1 second over the 300s limit):

```
[10:36:02] START: vercel build (ageofabundance-wiki) (limit: 300s)
[10:36:03] KILLED: vercel build (ageofabundance-wiki) exceeded 300s (ran 301s) — PID 48291 ✗
```

The process is killed, deploy for that app fails, and you see:
```
✗ Failed: ageofabundance-wiki
```

### Emergency kill all deploys

If you need to stop everything immediately:
```bash
make kill-deploy    # Kills all deploy processes, clears lock
```

This:
- Kills all `vercel build`, `vercel deploy`, `turbo build` processes
- Clears the deploy lock
- Allows new deploy to start immediately

---

## Log File

All deploy activity goes to `/tmp/deploy.log`:
```bash
tail -f /tmp/deploy.log              # Watch live
cat /tmp/deploy.log                  # View all history
grep KILLED /tmp/deploy.log          # Find timeouts only
grep FAILED /tmp/deploy.log          # Find errors only
```

Log format:
```
[HH:MM:SS] START: <description> (limit: Xs)
[HH:MM:SS] DONE: <description> completed in Xs ✓
[HH:MM:SS] KILLED: <description> exceeded Xs (ran Ys) — PID xyz ✗
[HH:MM:SS] FAILED: <description> exited with code N after Ys ✗
```

---

## Mutex Lock

Only one deploy can run at a time. File: `/tmp/deploy.lock`

If you try to deploy while another is running:
```
✗ Deploy already running (PID 12345)
  Either wait for it to finish, or run: make kill-deploy
```

The lock is cleaned up automatically when deploy finishes (success or failure).

If deployment crashes and lock remains stale, the next deploy detects it and removes it.

---

## Integration with Nanobot

The enhancement engine respects timeouts:
1. Executes code change
2. Builds locally (Turbo, watched for 10min)
3. If build times out → marked `failed` with reason
4. Ready for `bash scripts/deploy-app.sh [app]` if successful

No automatic deploys — you control when `make deploy` runs.

---

## Environment Variables

Set in `~/.zshrc` to customize (optional):

```bash
# Default is 600 (10 minutes) — hard ceiling, nothing exceeds this
export APP_TIMEOUT=600

# Vercel build step (default 300 = 5 min)
export VERCEL_BUILD_TIMEOUT=300

# Vercel deploy step (default 180 = 3 min)
export DEPLOY_TIMEOUT=180

# Local turbo builds (default 600 = 10 min)
export BUILD_TIMEOUT=600

# Log file location (default /tmp/deploy.log)
export DEPLOY_LOG=/tmp/deploy.log
```

Or override per-run:
```bash
APP_TIMEOUT=300 make deploy          # Tighter ceiling
VERCEL_BUILD_TIMEOUT=60 make deploy  # Kill build if > 1 minute
```

---

## Guarantees

✓ No deploy hangs forever (max 10 min, then killed)  
✓ One deploy at a time (no race conditions)  
✓ All failures logged with reason (timeout, error, kill)  
✓ Emergency kill available (`make kill-deploy`)  
✓ Locks cleaned up automatically  

---

## Troubleshooting

### "Deploy already running (PID 12345)"
Another deploy is active. Either:
```bash
wait    # Wait for it to finish (check make watch-deploy)
# or
make kill-deploy    # Kill it immediately
```

### Build took 35 minutes, got killed
That's the point. Timeouts exist. Either:
- Increase timeout: `APP_TIMEOUT=2400 make deploy` (40 min)
- Fix the slow build (cache issues, dependencies, large bundle)
- Check logs: `grep ageofabundance-wiki /tmp/deploy.log`

### Stale lock after crash
First new deploy attempt will detect and clean it. Or:
```bash
rm /tmp/deploy.lock
```

### Want to see what's happening
```bash
make watch-deploy    # Tail logs live during deploy
```

---

## That's It

`make deploy` is all you need. The watcher handles everything else — timeouts,
kills, logging. If a deploy gets stuck, you'll know in 10 minutes max, not hours.
