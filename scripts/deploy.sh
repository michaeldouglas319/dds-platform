#!/bin/bash
set -e

# Deploy only changed apps
# Detects changes via git, builds locally, ships prebuilt to Vercel

# Find all unique app directories changed since last commit
if [ ! -d ".git" ]; then
  echo "Error: not in git repository"
  exit 1
fi

CHANGED=$(git diff --name-only HEAD~1 HEAD 2>/dev/null | grep '^apps/' | cut -d/ -f2 | sort -u) || true

if [ -z "$CHANGED" ]; then
  echo "No app changes detected since last commit."
  echo "  → To deploy all apps: make deploy-all"
  exit 0
fi

echo "Changed apps: $CHANGED"
echo ""

FAILED=()
for APP in $CHANGED; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Deploying: $APP"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if ! bash scripts/deploy-app.sh "$APP"; then
    FAILED+=("$APP")
    echo "✗ Failed: $APP"
  else
    echo "✓ Deployed: $APP"
  fi
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ ${#FAILED[@]} -eq 0 ]; then
  echo "✓ All apps deployed."
  exit 0
else
  echo "✗ Failed apps: ${FAILED[*]}"
  exit 1
fi
