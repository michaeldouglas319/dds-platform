#!/bin/bash
set -e

# Deploy one app: build locally, upload prebuilt to Vercel
# Every step is watched with timeout — nothing runs > 10 minutes
# Usage: bash scripts/deploy-app.sh <app-name>

APP=$1
APP_DIR="apps/$APP"
WATCH="bash scripts/deploy-watch.sh"
DEPLOY_LOG=${DEPLOY_LOG:-/tmp/deploy.log}

# Timeout limits (all in seconds, total 10 min max per app)
APP_TIMEOUT=${APP_TIMEOUT:-600}                   # 10 min hard ceiling
VERCEL_BUILD_TIMEOUT=${VERCEL_BUILD_TIMEOUT:-300} # 5 min
DEPLOY_TIMEOUT=${DEPLOY_TIMEOUT:-180}             # 3 min

if [ -z "$APP" ]; then
  echo "Usage: bash scripts/deploy-app.sh <app-name>"
  exit 1
fi

if [ ! -d "$APP_DIR" ]; then
  echo "✗ App not found: $APP"
  exit 1
fi

if [ -z "$VERCEL_TOKEN" ]; then
  echo "✗ VERCEL_TOKEN not set. Add to ~/.zshrc:"
  echo "  export VERCEL_TOKEN=\"your_token_here\""
  exit 1
fi

# Hard ceiling: 10 minutes total for entire app deployment
DEPLOY_START=$(date +%s)

trap 'ELAPSED=$(( $(date +%s) - DEPLOY_START )); echo "[$(date '+%H:%M:%S')] ABORT: $APP deployment interrupted after ${ELAPSED}s" >> "$DEPLOY_LOG"' EXIT

cd "$APP_DIR"

# Step 1: Build locally (watched, 5 min max)
$WATCH "$VERCEL_BUILD_TIMEOUT" "vercel build ($APP)" \
  vercel build --prod >/dev/null 2>&1

# Step 2: Deploy prebuilt (watched, 3 min max)
$WATCH "$DEPLOY_TIMEOUT" "vercel deploy ($APP)" \
  vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN" >/dev/null 2>&1

cd ../..

ELAPSED=$(( $(date +%s) - DEPLOY_START ))
echo "[$(date '+%H:%M:%S')] COMPLETE: $APP deployed successfully in ${ELAPSED}s" >> "$DEPLOY_LOG"
echo "✓ $APP deployed (${ELAPSED}s)."
