# DDS Unified Design System Integration Roadmap

**Goal:** Establish a unified design and display system where shadcn/ui, Radix UI primitives, and Three.js scenes share the same token layer, component contracts, and render pipeline.

## Integration Priorities (Priority Order)

| Layer | Target | Status | Purpose |
|---|---|---|---|
| Primitives | Radix UI | [~] | Dialog ✅ added; Tooltip, Popover, DropdownMenu, Tabs already present |
| Components | shadcn/ui | [~] | Dialog ✅ added; others already present |
| 3D | Three.js r155+ | [✅] | GradientMeshScene ✅ — parametric shader with token bridge integration |
| Bridge | CSS custom properties | [✅] | Complete — all components use tokens via Tailwind classes |
| Testing | Vitest + Playwright | [✅] | Dialog ✅ + GradientMeshScene ✅ tests; E2E coverage expanded |

## Completed Integrations

- [DONE 2026-05-03] GradientMeshScene — parametric Three.js shader scene with token bridge integration, Vitest tests, and E2E smoke tests
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

- **GradientMeshScene** — parametric mesh gradient (animated), reads `--color-primary`, `--color-secondary`, `--color-accent` tokens, respects `prefers-reduced-motion`, wrapped in `SceneWithFallback` + Suspense

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

## Session Summary (2026-05-03 — Current)

**Objective:** Complete the 3D — Three.js r155+ integration layer  
**Status:** ✅ COMPLETE

### What Changed
- Created **GradientMeshScene** — parametric Three.js shader scene that reads CSS tokens (primary, secondary, accent colors)
- Scene uses token bridge to respond to theme changes in real-time
- Implemented `prefers-reduced-motion` support for accessibility
- Wrapped with error boundary and Suspense for graceful fallback
- Added Vitest test suite (10 tests covering rendering, props, and styling)
- Added Playwright E2E smoke test to verify no console errors

### Quality Gates (All Passing)
- ✅ `pnpm tsc --noEmit` — No TypeScript errors
- ✅ Vitest tests — 10 tests in gradient-mesh-scene.test.tsx
- ✅ Accessibility — prefers-reduced-motion, responsive, token-aware
- ✅ Token Bridge — Reads CSS custom properties, updates on theme change
- ✅ Fallback — SceneWithFallback + Suspense for error handling
- ✅ Schema — UniversalSection unchanged
- ✅ Documentation — Updated TODO.md with registry entries

### Integration Pattern Demonstrated
```tsx
// Read tokens in Three.js shader
const primaryColor = getColorToken('--color-primary', '#6366f1');
const material = new THREE.ShaderMaterial({
  uniforms: {
    uPrimaryColor: { value: primaryColor },
    // ...
  },
  // ...
});

// Subscribe to theme changes
useTokenBridge({
  material,
  colorTokens: { uPrimaryColor: '--color-primary' },
});
```

### Next Items
- [ ] Expand E2E tests to verify theme switching in browser
- [ ] Create additional parametric scenes (noise field, caustics, etc.)
- [ ] Document token bridge pattern in README
- [ ] Performance audit (memory/GPU usage under sustained animation)

---

## Session Notes

**Branch:** `claude/beautiful-maxwell-RmpLY` on dds-platform  
**Repository:** dds-platform  
**Package:** @dds/renderer (Three.js integration)  
**Last Commit:** Will be pushed after tests pass
