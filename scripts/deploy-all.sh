#!/bin/bash
# Deploy all sites to Vercel from monorepo root
# Each site gets its own Vercel project with the monorepo build filter

set -e
cd "$(dirname "$0")/.."
ROOT=$(pwd)

SITES=(
  ageofabundance-shop
  ageofabundance-art
  ageofabundance-asia
  ageofabundance-wiki
  ageofabundance-dev
  ageofabundance-app
  ageofabundance-space
  ageofabundance-online
  ageofabundance-site
  ageofabundance-tech
  ageofabundance-net
  blackdot-dev
  blackdot-space
  blackdot-partners
  blackdot-capital
)

for site in "${SITES[@]}"; do
  echo ""
  echo "═══════════════════════════════════════════"
  echo "  Deploying: $site"
  echo "═══════════════════════════════════════════"

  # Update vercel.json for this site
  cat > vercel.json << EOF
{
  "buildCommand": "pnpm turbo run build --filter=@dds/$site",
  "outputDirectory": "apps/$site/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
EOF

  # Remove old link
  rm -rf .vercel

  # Deploy
  npx vercel deploy --prod --yes --name "$site" 2>&1 | tail -5

  echo "  ✓ $site deployed"
done

echo ""
echo "═══════════════════════════════════════════"
echo "  All ${#SITES[@]} sites deployed!"
echo "═══════════════════════════════════════════"
