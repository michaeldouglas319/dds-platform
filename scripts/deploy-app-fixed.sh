#!/bin/bash
set -e

# Deploy one app: build locally, deploy prebuilt to Vercel
# Improved version that works around macOS shell issues
# Usage: bash scripts/deploy-app-fixed.sh <app-name> <vercel-token>

APP=$1
VERCEL_TOKEN=${2:-$VERCEL_TOKEN}
APP_DIR="apps/$APP"
DEPLOY_LOG=${DEPLOY_LOG:-/tmp/deploy.log}

if [ -z "$APP" ]; then
  echo "Usage: bash scripts/deploy-app-fixed.sh <app-name> [vercel-token]"
  exit 1
fi

if [ ! -d "$APP_DIR" ]; then
  echo "✗ App not found: $APP"
  exit 1
fi

if [ -z "$VERCEL_TOKEN" ]; then
  echo "✗ VERCEL_TOKEN not set."
  echo "  Pass it as argument: bash scripts/deploy-app-fixed.sh $APP <token>"
  echo "  Or set env: export VERCEL_TOKEN=<token>"
  exit 1
fi

DEPLOY_START=$(date +%s)

echo "[$(date '+%H:%M:%S')] Starting deployment: $APP" | tee -a "$DEPLOY_LOG"

cd "$APP_DIR"

# Step 1: Pull Vercel project settings
echo "  → Pulling Vercel project settings..."
npx vercel@latest pull --yes --quiet 2>/dev/null || true

# Step 2: Build locally (using pnpm from monorepo root)
echo "  → Building $APP locally..."
cd ../..
pnpm turbo build --filter=@dds/$APP --quiet || {
  echo "✗ Build failed for $APP"
  exit 1
}
cd "$APP_DIR"

# Step 3: Deploy using vercel deploy (NOT vercel build)
echo "  → Deploying to Vercel..."
npx vercel@latest deploy --prod --token="$VERCEL_TOKEN" --quiet

cd ../..

ELAPSED=$(( $(date +%s) - DEPLOY_START ))
echo "[$(date '+%H:%M:%S')] ✓ $APP deployed in ${ELAPSED}s" | tee -a "$DEPLOY_LOG"
echo "✓ $APP deployed successfully (${ELAPSED}s)."
