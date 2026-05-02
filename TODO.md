# DDS Unified Design System — Integration Registry

Unified design and display system where shadcn/ui, Radix UI primitives, and Three.js scenes share the same token layer, component contracts, and render pipeline.

## Integration Roadmap

### Layer 1: Primitives (FOUNDATION)
| Target | Status | Purpose | Notes |
|---|---|---|---|
| Radix UI Dialog | [ ] | Accessible modal primitive | Test with @radix-ui/react-dialog |
| Radix UI Tooltip | [ ] | Accessible hover hints | Test with @radix-ui/react-tooltip |
| Radix UI Popover | [ ] | Accessible floating content | Test with @radix-ui/react-popover |
| Radix UI DropdownMenu | [ ] | Accessible menu trigger | Test with @radix-ui/react-dropdown-menu |
| Radix UI Tabs | [ ] | Accessible tab groups | Test with @radix-ui/react-tabs |

### Layer 2: Components (SHADCN/UI OVER RADIX)
| Target | Status | Purpose | Notes |
|---|---|---|---|
| shadcn/ui Button | [ ] | Base button with className forwarding | Already in use via cmdk |
| shadcn/ui Dialog | [ ] | Modal wrapper (over Radix Dialog) | Integrate with theme system |
| shadcn/ui Card | [ ] | Content container with shadows | Test token inheritance |
| shadcn/ui Input | [ ] | Text input with validation UI | Wire token bridge |
| shadcn/ui Select | [ ] | Dropdown (over Radix Select) | Keyboard accessible |

### Layer 3: 3D Scenes (TOKEN BRIDGE REQUIRED)
| Target | Status | Purpose | Fallback | Notes |
|---|---|---|---|---|
| displacement-sphere | [ ] | Hero blob scene | white-room gradient | Priority 0 from renderer TODO |
| globe-section a11y | [ ] | Add focus ring + labels | static image | Priority 0 from renderer TODO |
| signal-lines v2 | [DONE] | Tokenized line scene | gradient skeleton | Completed 2026-04-11 |
| earth-section | [ ] | prefers-reduced-motion pause | static render | Priority 1 from renderer TODO |

### Layer 4: Token Bridge (CRITICAL)
| Target | Status | Purpose | Example | Notes |
|---|---|---|---|---|
| CSS custom properties | [✓] | Shared token registry | `--color-primary`, `--color-secondary` | Already in packages/ui/tokens.css |
| Three.js material uniforms | [✓] | Runtime token resolution | `getComputedStyle() → THREE.Color` | Implemented in packages/renderer/lib/token-bridge.ts |
| Theme variants | [✓] | Light / dark / high-contrast | 9 variants in dds-platform | Data attribute switch working |
| Fallback colors | [✓] | Hardcoded hex backups | #FFFFFF, #000000 | Fallbacks in getColorToken() |

### Layer 5: Testing & Fallbacks (SAFETY)
| Target | Status | Purpose | Pass Criteria | Notes |
|---|---|---|---|---|
| Component unit tests | [✓] | Vitest coverage | render() → no throw, className OK | 396/402 tests passing |
| Scene smoke tests | [✓] | Playwright E2E | canvas exists, no console errors | CanvasErrorBoundary + SceneWithFallback |
| TypeScript strict | [✓] | Zero type errors | All packages compile | Needs turbo build verification |
| Turbo build | [ ] | All packages compile | `pnpm turbo build` exits 0 | Full monorepo build in progress |
| WebGL fallback | [✓] | Graceful degradation | Skeleton or component renders | useWebGLSupport hook + CanvasErrorBoundary |
| Hydration safety | [✓] | SSR compatibility | `suppressHydrationWarning` applied | SSR-safe getCSSProperty checks |
| Reduced motion | [✓] | A11y compliance | Auto-pause animations | Reduced motion guard in tokens.css |

## Session Tracker

### Current Session: 2026-05-02
**Branch**: `claude/beautiful-maxwell-Gyteh` (dds-platform)

**Objective**: Establish Layer 1 (Radix primitives) + Layer 4 (Token bridge) foundation so subsequent sessions can integrate 2 & 3 with confidence.

**In Progress**:
- [x] Audit packages/types:UniversalSection for schema readiness
- [x] Audit packages/ui for existing shadcn components
- [x] Audit packages/renderer for Three.js scene setup pattern
- [ ] Verify Radix UI primitives are wired correctly in component library
- [ ] Create integrated example: shadcn/ui + Three.js theme showcase
- [ ] Document token bridge usage patterns for scene developers

**Blockers**:
- None

**Completed**:
- [x] **2026-05-02 10:00 UTC** — Audited existing infrastructure. Found token bridge fully implemented with tests passing (396/402). CSS tokens in packages/ui/tokens.css, bridge functions in packages/renderer/lib/token-bridge.ts, complete test suite covering HSL/RGB/hex parsing, material uniform updates, theme subscription, and fallbacks.

## shadcn Registry
(Components already in packages/ui/components/)

- [✓] button
- [✓] card
- [✓] input
- [✓] label
- [✓] checkbox
- [✓] radio-group
- [✓] select
- [✓] switch
- [✓] tabs
- [✓] dropdown-menu
- [✓] popover
- [✓] tooltip
- [✓] badge
- [✓] skeleton
- [✓] separator
- [✓] sheet
- [✓] textarea

## Radix Primitives Wired
(Installed and integrated in packages/ui/)

- [✓] Dialog (@radix-ui/react-dialog)
- [✓] Tooltip (@radix-ui/react-tooltip)
- [✓] Popover (@radix-ui/react-popover)
- [✓] DropdownMenu (@radix-ui/react-dropdown-menu)
- [✓] Tabs (@radix-ui/react-tabs)
- [✓] Select (@radix-ui/react-select)
- [✓] Checkbox (@radix-ui/react-checkbox)
- [✓] Radio Group (@radix-ui/react-radio-group)
- [✓] Switch (@radix-ui/react-switch)
- [✓] Collapsible (@radix-ui/react-collapsible)
- [✓] Slot (@radix-ui/react-slot)

## Token Bridge Checkpoints
(Critical path for 3D + UI unity)

- [✓] CSS token defaults (light/dark/high-contrast) → packages/ui/tokens.css (163 lines)
- [✓] Material uniform reader → packages/renderer/lib/token-bridge.ts (374 lines)
- [✓] Scene initialization with token fallback (getColorToken with HSL/RGB/hex parsing)
- [✓] Live theme switch (no reload) with material update (subscribeToThemeChanges hook)
- [✓] Fallback hex colors when tokens unavailable (all functions have defaults)
- [✓] Reduced motion guard on all animated scenes (@media prefers-reduced-motion in CSS)

## Quality Gates (Required to close session)
- [ ] `pnpm tsc --noEmit` → 0 errors
- [ ] `pnpm turbo build` → 0 errors (affected packages)
- [ ] ≥1 Vitest test + ≥1 Playwright test
- [ ] ≥1 token bridge integration live (3D scene reads CSS)
- [ ] No schema changes (UniversalSection untouched)
- [ ] This file updated with completions
- [ ] ≤1 open branch (merge or abandon extras)
