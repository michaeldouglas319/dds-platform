#!/bin/bash
set -e

# Deploy one app: build locally, upload prebuilt to Vercel
# Usage: bash scripts/deploy-app.sh <app-name>

APP=$1
APP_DIR="apps/$APP"

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

echo "→ Building $APP locally..."
cd "$APP_DIR"

# Build locally for Vercel (injects env vars, outputs to .vercel/output/)
vercel build --prod 2>&1 | grep -v "^Warning:" || true

echo "→ Uploading prebuilt $APP to Vercel..."

# Deploy the prebuilt output (zero build minutes on Vercel's end)
vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN" 2>&1 | tail -5

cd ../..
echo "✓ $APP deployed."
