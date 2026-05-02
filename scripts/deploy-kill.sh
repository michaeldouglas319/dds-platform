#!/bin/bash
# Emergency kill: stop all deploy processes immediately

echo "Killing all deploy processes..."
pkill -f "vercel build" && echo "✓ Killed: vercel build" || true
pkill -f "vercel deploy" && echo "✓ Killed: vercel deploy" || true
pkill -f "turbo build" && echo "✓ Killed: turbo build" || true
pkill -f "deploy-app.sh" && echo "✓ Killed: deploy-app.sh" || true
pkill -f "deploy.sh" && echo "✓ Killed: deploy.sh" || true
pkill -f "deploy-watch.sh" && echo "✓ Killed: deploy-watch.sh" || true

rm -f /tmp/deploy.lock
echo "Locks cleared."
echo "All deploy processes killed."
