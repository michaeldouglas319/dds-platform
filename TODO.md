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

## Session Notes

**Branch:** `claude/beautiful-maxwell-41auK` on dds-platform  
**Monorepo:** dds-v3 (Next.js, TypeScript strict, ESLint, Turbo)  
**Primary Consumer:** apps/ageofabundance-art  
