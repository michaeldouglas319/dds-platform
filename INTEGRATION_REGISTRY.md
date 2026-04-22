# DDS Unified Integration Registry

Tracking integration of industry-standard open source UI infrastructure into `@dds/renderer` and `@dds/ui`.

## Current Integrations

### ✅ Radix UI Dialog (2026-04-18)

**What changed:**
- Added `@radix-ui/react-dialog` dependency to `@dds/ui`
- Upgraded `Sheet` component from custom context pattern to Radix Dialog primitive
- All sheet interactions (open/close/focus management) now handled by Radix with WCAG2.1 AA keyboard + ARIA compliance

**Files modified:**
- `packages/ui/package.json` — added `@radix-ui/react-dialog` ^1.1.2
- `packages/ui/components/sheet.tsx` — refactored to use DialogPrimitive
- `packages/ui/__tests__/components.test.tsx` — added 5 test cases for Sheet component
- `packages/ui/index.ts` — added SheetPortal export

**Test coverage:**
- ✅ Renders with Radix Dialog context (trigger + content)
- ✅ Renders SheetHeader, SheetTitle, SheetDescription without errors
- ✅ Accepts and applies className prop
- ✅ Renders SheetClose button
- ✅ All 10 component tests pass (Vitest)

**Fallback path:**
- Sheet component gracefully degrades via DialogPrimitive context — no custom portal wiring needed
- All props forward to underlying Radix primitives

**Accessibility improvements:**
- ✅ Keyboard navigation (Esc, Tab, focus trap) via Radix Dialog
- ✅ ARIA roles (`role="dialog"`) automatically applied
- ✅ Focus management handled by primitives
- ✅ Overlay click-to-close built in

**Design token bridge:**
- Sheet styling uses existing Tailwind tokens (e.g., `--ring-offset-background`, `--background`)
- No hardcoded colors; all inherits from design system

---

## Roadmap (Priority Order)

| Layer | Target | Status | Purpose |
|---|---|---|---|
| Primitives | More Radix UI | ⏳ Next | Popover, Tooltip, Dropdown, Tabs, Accordion |
| Components | shadcn/ui | ⏳ Queued | Production-ready component skins over Radix |
| 3D | Three.js r161+ | ✅ Ready | Already integrated; needs shader token bridge |
| Bridge | CSS → Three.js | ⏳ Next | Read design tokens into shader uniforms |
| Testing | Vitest + Playwright | ✅ Ready | Both frameworks already configured |

---

## Session Log

- **2026-04-18** — Radix UI Dialog integration complete. Upgraded Sheet component to use DialogPrimitive underneath. 5 new vitest test cases. All tests pass. No breaking changes to existing API.

