#!/bin/bash

# One-time setup: link each app to its Vercel project
# Run once, then never again
# Usage: bash scripts/setup-vercel-projects.sh

if [ -z "$VERCEL_TOKEN" ]; then
  echo "✗ VERCEL_TOKEN not set. Add to ~/.zshrc:"
  echo "  export VERCEL_TOKEN=\"your_token_here\""
  exit 1
fi

echo "Linking all apps to Vercel projects..."
echo ""

for APP_DIR in apps/*/; do
  APP=$(basename "$APP_DIR")
  echo "→ Linking $APP..."

  cd "$APP_DIR"

  # Link app to its Vercel project (matches app name)
  # This creates .vercel/project.json with project ID
  vercel link --yes --project="$APP" 2>&1 | grep -E "Linked|already" || echo "  (linked or already configured)"

  cd ../..
done

echo ""
echo "✓ All apps linked to Vercel projects."
echo "  You can now run: make deploy"
