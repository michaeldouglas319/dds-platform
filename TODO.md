# dds-v3 UI Integration Roadmap

## Integration Targets (Priority Order)

| Layer | Target | Status | Purpose |
|---|---|---|---|
| Primitives | Radix UI | [DONE 2026-04-27] | Accessible headless primitives (Dialog, Tooltip, Popover, DropdownMenu, Tabs) |
| Components | shadcn/ui | [DONE 2026-04-27] | Production-ready component skin over Radix — Label added |
| 3D | Three.js r155+ | [DONE 2026-04-27] | Comprehensive renderer registry (20+ scenes: Globe, Earth, Model, Carousel, Cards, Text, etc.) |
| Bridge | CSS custom properties | [DONE 2026-04-27] | Unified token bridge: CSS vars → Three.js + shadcn/ui via token-bridge.ts |
| Testing | Vitest + Playwright | [ ] | Component unit tests ✓21 passing + need E2E scene smoke tests |

## Integration Registry

### shadcn Components
- ✅ Label — Styled `<label>` element for form accessibility (htmlFor, className forwarding)

### Radix Primitives
- ✅ Dialog (@radix-ui/react-dialog v1.1.2) — Already integrated via Sheet component
- ✅ Tabs (@radix-ui/react-tabs v1.1.2) — Replaced custom implementation, now Radix-based
- ✅ Tooltip (@radix-ui/react-tooltip v1.1.6) — New TooltipProvider/Root/Trigger/Content pattern
- ✅ Popover (@radix-ui/react-popover v1.0.7) — New Popover/PopoverTrigger/PopoverContent/PopoverAnchor
- ✅ DropdownMenu (@radix-ui/react-dropdown-menu v2.0.6) — Full implementation with 14 sub-components

### Token Bridge
- ✅ `token-bridge.ts` — Read CSS custom properties and convert to Three.js colors/uniforms
- ✅ `tokens.css` — Comprehensive design token system (colors, spacing, typography, shadows, radius, transitions, layout)
- ✅ `useTokenBridge.ts` — React hook for applying tokens to materials and listening to theme changes
- ✅ Theme-aware: Supports light/dark variants via `data-theme` attribute
- ✅ Fallback support: System preference detection (`prefers-color-scheme`)
- ✅ HSL ↔ RGB conversion for shader compatibility

### Scenes with Fallbacks
(Not yet implemented — requires WebGL fallback paths)

## Blockers & Notes
- DropdownMenu + Tooltip composability issue: When combining via asChild, Tooltip delayDuration is ignored (known Radix issue #1920)

## Session Log

### Session 3 (2026-04-27)
- [DONE 2026-04-27] Implemented unified CSS token bridge (shadcn/ui ↔ Three.js)
  - Created `/packages/ui/tokens.css` with 70+ design tokens (colors, spacing, typography, shadows, transitions)
  - Created `/packages/renderer/lib/token-bridge.ts` with utilities to read CSS vars and convert to Three.js colors/uniforms
  - Created `/packages/renderer/lib/useTokenBridge.ts` React hook for theme-aware material updates
  - Created comprehensive tests: 15 token-bridge tests + 8 integration tests (all passing)
  - Supports light/dark theme switching via `data-theme` attribute
  - HSL ↔ RGB color conversion, server-side safety (SSR compatible)
  - Pattern: CSS custom properties are single source of truth, read by both Tailwind (shadcn) and Three.js
  - **Next:** E2E scene smoke tests with Playwright to verify WebGL fallbacks work

### Session 2 (2026-04-27)
- [DONE 2026-04-27] Added Label component (shadcn/ui production component)
  - New Label component: styled `<label>` element with htmlFor, className, ref forwarding
  - Follows established pattern: React.forwardRef + cn utility + JSDoc
  - Added 3 unit tests: rendering, htmlFor association, className application
  - All 21 UI component tests pass
  - Pattern: simple form labels, accessibility-first (works with Input via htmlFor)
  - **Next:** Dialog (centered modal) or other shadcn form components (Select, Checkbox, etc.)

### Session 1 (2026-04-27)
- [DONE 2026-04-27] Integrated Radix UI Primitives foundation layer
  - Replaced custom Tabs with Radix Tabs primitive (data-driven state)
  - Created Tooltip component with TooltipProvider + delayDuration config
  - Created Popover component with portal/alignment control
  - Created comprehensive DropdownMenu with checkable items, radio groups, separators
  - Added @dds/ui dependencies: +react-tabs, +react-tooltip, +react-popover, +react-dropdown-menu
  - All 18 unit tests pass; ageofabundance-art builds successfully
  - Pattern: Radix primitive → CVA styling → className forwarding (consistent across all components)
  - **Next:** shadcn/ui components wrapping these Radix primitives (Button, Dialog, etc. from shadcn registry)

