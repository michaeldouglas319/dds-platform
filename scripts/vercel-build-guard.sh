#!/bin/bash
# Guard: prevent accidental Vercel cloud builds
# All builds must be LOCAL via make deploy
# This script runs if Vercel somehow tries to build

echo "🚨 CRITICAL: Vercel tried to build on the cloud!"
echo ""
echo "This deployment should NOT be building on Vercel."
echo "All builds are local via 'make deploy' command."
echo ""
echo "This means:"
echo "  1. A commit pushed without 'make deploy' first"
echo "  2. Or an accidental trigger of Vercel rebuild"
echo ""
echo "COST IMPACT: This is consuming your \$5/month budget!"
echo ""
echo "Solution:"
echo "  1. Kill this build in Vercel dashboard"
echo "  2. Run 'make cost' to check damage"
echo "  3. Ensure all deployments use 'make deploy' locally"
echo ""

exit 1
