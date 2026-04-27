# dds-v3 UI Integration Roadmap

## Integration Targets (Priority Order)

| Layer | Target | Status | Purpose |
|---|---|---|---|
| Primitives | Radix UI | [DONE 2026-04-27] | Accessible headless primitives (Dialog, Tooltip, Popover, DropdownMenu, Tabs) |
| Components | shadcn/ui | [DONE 2026-04-27] | Production-ready component skin over Radix — Label added |
| 3D | Three.js r155+ | [ ] | Generative scenes, parametric renderers, WebGL display |
| Bridge | CSS custom properties | [ ] | Single token set for shadcn + Three.js material uniforms |
| Testing | Vitest + Playwright | [ ] | Component unit tests + E2E scene smoke tests |

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
(Not yet implemented — requires Three.js material uniform reading from CSS custom properties)

### Scenes with Fallbacks
(Not yet implemented — requires WebGL fallback paths)

## Blockers & Notes
- DropdownMenu + Tooltip composability issue: When combining via asChild, Tooltip delayDuration is ignored (known Radix issue #1920)

## Session Log

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

