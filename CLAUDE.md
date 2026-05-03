# DDS Platform - Claude Configuration

## Git & Commits - CRITICAL RULE

**You MUST have explicit permission before any git operations:**

- ❌ Never commit without asking permission first
- ❌ Never add files to git staging without asking permission
- ❌ Never push to remote without asking permission
- ❌ Never include git operations in a plan without explicit approval

**Process:**
1. Complete the work/testing
2. Show results to user
3. **Ask for explicit permission** to commit/push
4. **Wait for clear approval**
5. Only then execute git operations

This applies whether you're:
- Initiating work in a prompt
- Working during plan mode
- Completing a task
- Testing code

No exceptions. Always ask first.

## Build Strategy - LOCAL ONLY

**CRITICAL: Never build on Vercel cloud.** Vercel cloud builds are disabled via `vercel-build-guard.sh`.

- ✅ Build locally on your device with `pnpm turbo build --filter=@dds/<app-name>`
- ✅ Build in Claude cloud (Claude Code sessions)
- ❌ Never trigger cloud builds on Vercel
- ❌ Never use `vercel build` from macOS directly (shell compatibility issues)

**Deployment workflow (always use this):**
1. Make changes to an app in `/apps/<app-name>`
2. Build locally: `pnpm turbo build --filter=@dds/<app-name>`
3. Deploy prebuilt artifacts: `make deploy` (detects changed apps and deploys only those)
4. Or deploy all: `make deploy-all` if no git changes detected

**Why:** Building locally is free. Vercel charges for build minutes. By building locally and uploading only prebuilt artifacts, we pay 0 build costs and only for artifact storage/bandwidth.

## Project Structure

- `/apps/blackdot-dev` - Main showcase app
- `/apps/ageofabundance-wiki` - ARMS geopolitical conflict mapping app
- `/packages/renderer` - DDS renderer with theme system
- `/packages/types` - Shared type definitions (single source of truth)
- `/e2e` - Playwright tests
- `playwright.config.ts` - E2E test configuration

## Testing

Run E2E tests:
```bash
pnpm test:e2e
```

All tests must pass before any commits.

## Theme System

9 theme variants available:
- minimal, vibrant, neon, arctic, sunset, forest, midnight, mist, monochrome

Configured via `data-theme-variant` attribute on `<html>` element.

## Pages

- `/` - Home page with navigation
- `/sections` - All sections from site.config.json
- `/demo` - Theme variants list
- `/arms` - ARMS geopolitical conflict mapping (GDELT + 4 sources, 415+ events)
