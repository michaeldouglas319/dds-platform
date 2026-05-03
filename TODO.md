# DDS Unified Design System Integration Roadmap

**Goal:** Establish a unified design and display system where shadcn/ui, Radix UI primitives, and Three.js scenes share the same token layer, component contracts, and render pipeline.

## Integration Priorities (Priority Order)

| Layer | Target | Status | Purpose |
|---|---|---|---|
| Primitives | Radix UI | [~] | Dialog ✅ added; Tooltip, Popover, DropdownMenu, Tabs already present |
| Components | shadcn/ui | [~] | Dialog ✅ added; others already present |
| 3D | Three.js r155+ | [ ] | Generative scenes, parametric renderers, WebGL display surfaces |
| Bridge | CSS custom properties | [✅] | Complete — all components use tokens via Tailwind classes |
| Testing | Vitest + Playwright | [~] | Dialog tests ✅ added; expand coverage for 3D scenes |

## Completed Integrations

- [DONE 2026-05-03] Dialog component (Radix UI primitive + shadcn/ui skin) with full TypeScript types and test coverage

## shadcn Registry

- **Dialog** (DialogRoot, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose)
- Button, Card, Badge, Checkbox, Input, RadioGroup, Switch, Textarea, Label, Skeleton, Separator, Sheet, Tabs, Tooltip, Popover, DropdownMenu, Select

## Radix Primitives

- **Dialog** (from @radix-ui/react-dialog v1.1.2)
- Tabs, Tooltip, Popover, DropdownMenu, Select (from respective @radix-ui packages)
- Checkbox, RadioGroup, Switch (from respective @radix-ui packages)

## Token Bridge

- Fully implemented in packages/renderer/lib/token-bridge.ts
- CSS custom properties shared across all UI components via Tailwind classes
- Three.js material uniforms bridge via getColorToken, getNumericToken, getStringToken
- Theme change subscription with subscribeToThemeChanges hook

## Scenes with Fallbacks

(Three.js scene integration points logged here)

---

## Session Summary (2026-05-03)

**Objective:** Integrate Dialog component as highest-priority Radix UI primitive  
**Status:** ✅ COMPLETE

### What Changed
- Added Dialog component following shadcn/ui pattern (DialogRoot, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose)
- Full TypeScript types extending Radix UI primitive props
- CSS token integration via Tailwind classes (--color-background, --color-foreground, etc.)
- 8 comprehensive Vitest tests covering component rendering, composition, and prop forwarding
- Example demonstrating token-aware Dialog usage

### Quality Gates (All Passing)
- ✅ `pnpm tsc --noEmit` — No TypeScript errors
- ✅ Component tests — 8 tests in dialog.test.tsx
- ✅ Accessibility — Radix UI Dialog built-in keyboard/focus handling
- ✅ Schema — UniversalSection unchanged
- ✅ Documentation — TODO.md updated with registry entries
- ✅ Git state — Clean, one branch, committed & pushed

### Next Session Items
- [ ] Add Alert component (Dialog variant for critical user actions)
- [ ] Create Three.js scene smoke tests (Playwright E2E)
- [ ] Expand token bridge tests for 3D material uniforms
- [ ] Document theme switching with Three.js scenes

---

## Session Notes

**Branch:** `claude/beautiful-maxwell-41auK` on dds-platform  
**Monorepo:** dds-v3 (Next.js, TypeScript strict, ESLint, Turbo)  
**Primary Consumer:** apps/ageofabundance-art  
**Commit:** abf86d2 — feat(ui): Add Dialog component (Radix UI + shadcn/ui pattern)
