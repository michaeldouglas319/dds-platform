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

## Build & Deploy Strategy

**Never build on Vercel cloud** — all builds run on GitHub Actions (Ubuntu, free minutes).

- ✅ Test builds locally: `pnpm turbo build --filter=@dds/<app-name>`
- ✅ Production deploys: push to `main` → GitHub Actions handles it automatically
- ❌ Never use `vercel build` from macOS directly (broken: `spawn sh ENOENT` on macOS)
- ❌ Never trigger builds from the Vercel dashboard

**Deployment workflow:**
1. Make changes to an app in `/apps/<app-name>`
2. Test the build: `pnpm turbo build --filter=@dds/<app-name>`
3. Push to `main` — GitHub Actions detects changed apps and deploys only those

**How GitHub Actions deploys with zero Vercel cost:**
- Runs `pnpm install` at monorepo root (workspace deps available)
- `VERCEL_INSTALL_COMPLETED=1 vercel build --prod` — skips Vercel's install step, builds on the free Ubuntu runner
- `vercel deploy --prebuilt --prod` — uploads artifacts only, Vercel never builds

**Why not `make deploy` locally:** `vercel build` has a macOS shell compatibility bug (`spawn sh ENOENT`). CI uses Ubuntu where it works correctly.

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
