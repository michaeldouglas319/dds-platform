#!/bin/bash
# Monitor Vercel build minutes to stay under $5/month
# Vercel charges ~$0.25 per 100 build minutes
# $5/month = 2000 build minutes max

if [ -z "$VERCEL_TOKEN" ]; then
  echo "✗ VERCEL_TOKEN not set"
  exit 1
fi

BUDGET_CENTS=500          # $5.00
COST_PER_100MIN=25        # $0.25 per 100 minutes
MAX_MINUTES=$(( BUDGET_CENTS * 100 / COST_PER_100MIN ))

echo "Vercel Build Cost Monitor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Budget: \$$((BUDGET_CENTS / 100)).$((BUDGET_CENTS % 100))"
echo "Max build minutes: $MAX_MINUTES"
echo ""

# Get all projects
PROJECTS=$(curl -s "https://api.vercel.com/v9/projects?limit=100" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  | grep -o '"name":"[^"]*"' | cut -d'"' -f4)

TOTAL_MINUTES=0

for PROJECT in $PROJECTS; do
  # Get deployments for this project (last 30 days)
  DEPLOYMENTS=$(curl -s "https://api.vercel.com/v5/deployments?projectId=$PROJECT&limit=50" \
    -H "Authorization: Bearer $VERCEL_TOKEN" 2>/dev/null)

  # Parse buildingMs (build time in milliseconds)
  MINUTES=$(echo "$DEPLOYMENTS" | grep -o '"buildingMs":[0-9]*' | cut -d':' -f2 | awk '{sum+=$1} END {print int(sum/60000)}')

  if [ -n "$MINUTES" ] && [ "$MINUTES" -gt 0 ]; then
    TOTAL_MINUTES=$(( TOTAL_MINUTES + MINUTES ))
    printf "%-30s %6d min\n" "$PROJECT:" "$MINUTES"
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
PERCENTAGE=$(( TOTAL_MINUTES * 100 / MAX_MINUTES ))
COST=$(( TOTAL_MINUTES * COST_PER_100MIN / 100 ))

printf "Total build minutes:  %6d / %d\n" "$TOTAL_MINUTES" "$MAX_MINUTES"
printf "Estimated cost:       $%.2f / $%.2f\n" "$(bc -l <<< "scale=2; $COST / 100")" "$(bc -l <<< "scale=2; $BUDGET_CENTS / 100")"
printf "Budget usage:         %3d%%\n" "$PERCENTAGE"
echo ""

if [ "$PERCENTAGE" -gt 80 ]; then
  echo "⚠️  WARNING: Approaching budget limit"
  exit 1
elif [ "$PERCENTAGE" -gt 100 ]; then
  echo "🚨 CRITICAL: Over budget!"
  exit 2
else
  echo "✓ Within budget"
  exit 0
fi
