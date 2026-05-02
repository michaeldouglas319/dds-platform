#!/bin/bash
# Deploy mutex: ensure only one deploy runs at a time
# Source this in scripts to acquire/release lock

LOCK_FILE="/tmp/deploy.lock"

acquire_lock() {
  if [ -f "$LOCK_FILE" ]; then
    LOCKED_PID=$(cat "$LOCK_FILE" 2>/dev/null)
    if [ -n "$LOCKED_PID" ] && kill -0 "$LOCKED_PID" 2>/dev/null; then
      echo "✗ Deploy already running (PID $LOCKED_PID)"
      echo "  Either wait for it to finish, or run: make kill-deploy"
      exit 1
    else
      # Stale lock from previous crash — clean it up
      if [ -n "$LOCKED_PID" ]; then
        echo "Removing stale lock from PID $LOCKED_PID"
      fi
      rm -f "$LOCK_FILE"
    fi
  fi

  # Acquire lock
  echo $$ > "$LOCK_FILE"
  trap 'rm -f "$LOCK_FILE"' EXIT
}
