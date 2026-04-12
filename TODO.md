# DDS Platform Evolution — Strategic Tracks

## TRACK A — RENDERER UNIFICATION
Goal: Every consumer app renders through @dds/renderer + site.config.json. No bespoke JSX.

Status: The wiki (ageofabundance-wiki) has the richest UI but uses zero @dds/renderer imports — it renders via custom components (ArticleCard, wiki-article, wiki-backlinks, wiki-text, wiki-toc). The info site and most other apps are stubs.

### Work Items (do in order):
- [ ] 1. Create wiki-specific renderer plugins that wrap existing wiki components as @dds/renderer registry entries: wiki-article, wiki-index, wiki-toc, wiki-backlinks, wiki-card-grid
- [ ] 2. Define the UniversalSection shape extensions needed (meta.wiki, content.wikiLinks, etc.) — additive only, optional props with defaults
- [ ] 3. Convert wiki home page to render via SectionBatchRenderer + site.config.json
- [ ] 4. Convert wiki article page (/a/[slug]) to render via SectionBatchRenderer
- [ ] 5. Convert wiki article index (/a) to render via SectionBatchRenderer
- [ ] 6. Repeat for info, net, and other stub apps — wire them to site.config.json + SectionBatchRenderer
- [ ] 7. Extract common wiki layout (breadcrumbs, metadata bar, footer) into a shared renderer plugin

## TRACK B — VISUAL VOCABULARY & FLUID NAVIGATION
Goal: Users can cycle through visual variations of the same content and drill down without page reloads. The platform feels like a living, explorable surface — not a stack of static pages.

### Work Items (do in order):
- [ ] 1. Add a VariantSwitcher component to @dds/renderer — given a section, renders a strip of variant thumbnails the user can cycle through (e.g., same stats data as bar chart, radial, table, or card grid)
- [ ] 2. Create alternate layout variants for existing renderers (hero-minimal, hero-cinematic, hero-split; text-prose, text-columns, text-highlight; stats-grid, stats-radial, stats-ticker)
- [ ] 3. Add drill-down mechanics: clicking a card/section smoothly expands it in-place (or pushes a detail panel) without a full page navigation. Use View Transitions API or Framer Motion layout animations.
- [ ] 4. Add a section-level theme variant picker — users can preview a section in different theme variants (midnight, vibrant, etc.) with a floating pill selector
- [ ] 5. Build a "presentation mode" — full-screen, keyboard-navigable section-by-section walkthrough of any page's content
- [ ] 6. Add micro-interactions: hover reveals, parallax depth, scroll-triggered entrances (all behind prefers-reduced-motion)

## TRACK C — CHAT PROVIDER INTERFACE
Goal: A ChatProvider plugs into @dds/renderer the same way ThemeProvider does. Any app can add a conversational interface that understands the site's content.

### Work Items (do in order):
- [ ] 1. Define the ChatProvider interface in @dds/types: { sendMessage, messages, isLoading, context }
- [ ] 2. Create @dds/chat package with ChatProvider component, useChatContext hook, and a ChatPanel UI component (floating, docked, or inline modes)
- [ ] 3. Wire ChatProvider to read the current page's UniversalSection data as context — the chat knows what the user is looking at
- [ ] 4. Add a ChatTrigger renderer plugin — a section type that embeds a contextual chat prompt (e.g., "Ask about this article")
- [ ] 5. Integrate with Vercel AI SDK for the actual LLM calls (model-agnostic, provider-swappable)
- [ ] 6. Add chat-to-navigation: chat responses can include deep links to sections, and clicking them scrolls/navigates to that content
- [ ] 7. Add chat memory across sections — conversation persists as user navigates

## SESSION LOG

### Session 1 (2026-04-12)
Starting point. Created TODO.md. Awaiting task assignment.

---

**BASELINE_SHA**: (to be recorded on first commit)
