.PHONY: build deploy deploy-all dev clean setup help

## Local-first build & deploy
## All builds run locally (free), prebuilt to Vercel (cheap)

help:
	@echo "Commands:"
	@echo "  make dev         - Start local dev server (pnpm turbo dev)"
	@echo "  make build       - Build only changed apps (cached, fast)"
	@echo "  make deploy      - Deploy only changed apps (prebuilt → Vercel)"
	@echo "  make deploy-all  - Deploy ALL 33 apps (use rarely)"
	@echo "  make clean       - Remove all build artifacts"
	@echo "  make setup       - One-time: link all apps to Vercel projects"

# Build only apps changed since last commit (Turbo cache magic)
build:
	pnpm turbo build --filter='[HEAD^1]'

# Deploy only changed apps (detects via git, builds locally, ships prebuilt)
deploy:
	bash scripts/deploy.sh

# Deploy all 33 apps (full rebuild, no cache — use when you need everything fresh)
deploy-all:
	@echo "Deploying all apps..."
	@for app in apps/*/; do \
		appname=$$(basename $$app); \
		echo "→ Deploying $$appname..."; \
		bash scripts/deploy-app.sh "$$appname" || echo "  ✗ Failed: $$appname"; \
	done
	@echo "All apps deployed."

# Start Turbo dev server (watches all packages)
dev:
	pnpm turbo dev

# Clean all build artifacts (free up disk space)
clean:
	pnpm turbo clean
	@find apps -name '.vercel' -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "Cleaned."

# One-time setup: link all app folders to Vercel projects
setup:
	bash scripts/setup-vercel-projects.sh

# Watch deploy logs live (tail -f /tmp/deploy.log)
watch-deploy:
	@tail -f /tmp/deploy.log

# Emergency kill all deploy processes
kill-deploy:
	bash scripts/deploy-kill.sh

# Monitor Vercel build minutes (must stay < $5/month)
cost:
	bash scripts/cost-monitor.sh
