#!/bin/bash
# Watcher: run command with timeout. Kill if overrun, log everything.
# Usage: bash scripts/deploy-watch.sh <timeout_seconds> <description> <command...>

TIMEOUT=$1
DESCRIPTION=$2
shift 2

LOG_FILE="${DEPLOY_LOG:-/tmp/deploy.log}"
START=$(date +%s)

log() {
  echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "START: $DESCRIPTION (limit: ${TIMEOUT}s)"

# Run in own process group so we can kill entire tree
set -m
"$@" &
CMD_PID=$!

# Timeout warden
(
  sleep "$TIMEOUT"
  if kill -0 "$CMD_PID" 2>/dev/null; then
    ELAPSED=$(( $(date +%s) - START ))
    log "KILLED: $DESCRIPTION exceeded ${TIMEOUT}s (ran ${ELAPSED}s) — PID $CMD_PID"
    # Try TERM first, then KILL
    kill -TERM -- "-$CMD_PID" 2>/dev/null || true
    sleep 2
    kill -KILL -- "-$CMD_PID" 2>/dev/null || true
  fi
) &
WATCHER_PID=$!

wait "$CMD_PID"
EXIT_CODE=$?

kill "$WATCHER_PID" 2>/dev/null || true

ELAPSED=$(( $(date +%s) - START ))

if [ "$EXIT_CODE" -eq 0 ]; then
  log "DONE: $DESCRIPTION completed in ${ELAPSED}s ✓"
elif [ "$EXIT_CODE" -eq 124 ] || [ "$EXIT_CODE" -eq 143 ]; then
  log "TIMEOUT: $DESCRIPTION killed after ${ELAPSED}s ✗"
  exit 124
else
  log "FAILED: $DESCRIPTION exited with code $EXIT_CODE after ${ELAPSED}s ✗"
  exit "$EXIT_CODE"
fi
