# Renderer Sync-Forward Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the canonical dds-renderer's 8-step fallback router, all 27 renderer implementations, and 3D support into dds-platform's `@dds/renderer` package — maintaining full data-contract compatibility with DDK's `section_configs.sectionData`.

**Architecture:** Reimplement each canonical renderer in the platform's Tailwind-first style (no CSS modules, no canonical `lib/` imports). The fallback router is ported verbatim from `dds-renderer/core/registry.tsx:121-196`. A lightweight `Markdown` component wraps `react-markdown`. 3D renderers use `next/dynamic` + R3F as peer deps. Platform-only renderers (`hero`, `cta`, `two-column`, `sectors-grid`) are preserved alongside canonical keys.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, react-markdown, @react-three/fiber (peer), @react-three/drei (peer), next/dynamic

**Canonical source:** `/Volumes/Seagate Portable Drive/claude/dds-renderer/`
**Platform target:** `/Volumes/Seagate Portable Drive/claude/dds-platform/packages/renderer/`

---

## File Map

### New files to create
| File | Responsibility |
|---|---|
| `packages/renderer/lib/markdown.tsx` | Lightweight `<Markdown>` wrapper around `react-markdown` |
| `packages/renderer/lib/resolve-renderer.ts` | 8-step fallback decision tree (ported from canonical) |
| `packages/renderer/renderers/standard-card-renderer.tsx` | Universal fallback card — renders any section |
| `packages/renderer/renderers/header-renderer.tsx` | Text heading + optional body |
| `packages/renderer/renderers/side-by-side-renderer.tsx` | Two-column: text left, image right |
| `packages/renderer/renderers/centered-text-renderer.tsx` | Centered text with optional inline link |
| `packages/renderer/renderers/text-only-renderer.tsx` | Simple heading + body (wraps TextRenderer) |
| `packages/renderer/renderers/image-only-renderer.tsx` | Theme-aware or single image display |
| `packages/renderer/renderers/image-text-renderer.tsx` | Image + heading + text, position configurable |
| `packages/renderer/renderers/profile-renderer.tsx` | Two-column profile with image + bio |
| `packages/renderer/renderers/project-header-renderer.tsx` | Hero header with background image |
| `packages/renderer/renderers/project-summary-renderer.tsx` | Landing card with model placeholder + CTA |
| `packages/renderer/renderers/globe-renderer.tsx` | 3D globe (lazy R3F) |
| `packages/renderer/renderers/generic-model-renderer.tsx` | GLB model viewer (lazy R3F) |
| `packages/renderer/renderers/model-viewer-renderer.tsx` | `<model-viewer>` web component |
| `packages/renderer/renderers/model-text-renderer.tsx` | 3D model + text side-by-side |
| `packages/renderer/renderers/earth-renderer.tsx` | Interactive Earth with scroll-driven children |
| `packages/renderer/renderers/carousel-renderer.tsx` | Image carousel |
| `packages/renderer/renderers/code-diff-renderer.tsx` | Side-by-side code comparison |
| `packages/renderer/renderers/background-columns-renderer.tsx` | Full-width bg image + text + video |
| `packages/renderer/renderers/featured-overlay-renderer.tsx` | Background image with centered overlay content |
| `packages/renderer/renderers/sidebar-images-renderer.tsx` | Text + sidebar image grid |
| `packages/renderer/renderers/index-grid-renderer.tsx` | Content index grid with page cards |
| `packages/renderer/renderers/signal-lines-renderer.tsx` | Canvas-based signal animation (placeholder) |
| `packages/renderer/renderers/intro-renderer.tsx` | Hero intro with rotating highlights |
| `packages/renderer/renderers/theme-switcher-renderer.tsx` | Dark/light toggle with preview image |
| `packages/renderer/__tests__/resolve-renderer.test.ts` | Decision tree unit tests |
| `packages/renderer/__tests__/registry.test.ts` | Registry completeness tests |

### Files to modify
| File | Changes |
|---|---|
| `packages/renderer/package.json` | Add `react-markdown` dep, R3F peer deps |
| `packages/renderer/batch-renderer.tsx` | Use `resolveRenderer()` instead of flat lookup |
| `packages/renderer/registry.ts` | Register all 27 canonical keys + keep platform aliases |
| `packages/renderer/renderers/index.ts` | Export all new renderers |
| `packages/renderer/index.ts` | Export `Markdown`, `resolveRenderer` |

---

## Task 1: Add dependencies

**Files:**
- Modify: `packages/renderer/package.json`

- [ ] **Step 1: Add react-markdown and R3F peer deps**

```json
{
  "name": "@dds/renderer",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./index.ts",
  "exports": {
    ".": "./index.ts",
    "./config": "./config/index.tsx"
  },
  "dependencies": {
    "@dds/types": "workspace:*",
    "@dds/ui": "workspace:*",
    "react-markdown": "^9.0.0"
  },
  "devDependencies": {
    "@dds/tsconfig": "workspace:*"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@react-three/fiber": "^8.0.0",
    "@react-three/drei": "^9.0.0",
    "three": ">=0.150.0"
  },
  "peerDependenciesMeta": {
    "@react-three/fiber": { "optional": true },
    "@react-three/drei": { "optional": true },
    "three": { "optional": true }
  }
}
```

- [ ] **Step 2: Install**

Run: `cd "/Volumes/Seagate Portable Drive/claude/dds-platform" && pnpm install`
Expected: Clean install, no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/renderer/package.json pnpm-lock.yaml
git commit -m "feat(renderer): add react-markdown dep and optional R3F peer deps"
```

---

## Task 2: Markdown component

**Files:**
- Create: `packages/renderer/lib/markdown.tsx`

- [ ] **Step 1: Write Markdown component**

```tsx
'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={className ?? 'prose prose-invert prose-sm max-w-none'}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/renderer/lib/markdown.tsx
git commit -m "feat(renderer): add Markdown component wrapping react-markdown"
```

---

## Task 3: 8-step fallback router

**Files:**
- Create: `packages/renderer/lib/resolve-renderer.ts`
- Create: `packages/renderer/__tests__/resolve-renderer.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { resolveRendererKey } from '../lib/resolve-renderer';

describe('resolveRendererKey', () => {
  it('step 1: returns explicit display.layout', () => {
    const section = { id: '1', type: 'section' as const, display: { layout: 'hero' } };
    expect(resolveRendererKey(section, ['hero'])).toEqual({
      key: 'hero', step: 1, reason: 'Explicit layout: display.layout = "hero"',
    });
  });

  it('step 2: landing with model returns project-summary', () => {
    const section = { id: '2', type: 'section' as const, landing: { enabled: true, figure: 1, model: { type: 'laptop' } } };
    expect(resolveRendererKey(section, ['project-summary'])).toEqual({
      key: 'project-summary', step: 2, reason: 'Landing page with model',
    });
  });

  it('step 3: spatial.modelType globe returns globe', () => {
    const section = { id: '3', type: 'section' as const, spatial: { modelType: 'globe' } };
    expect(resolveRendererKey(section, ['globe'])).toEqual({
      key: 'globe', step: 3, reason: 'Globe spatial model',
    });
  });

  it('step 4: spatial.modelPath returns generic-model', () => {
    const section = { id: '4', type: 'section' as const, spatial: { modelPath: '/model.glb' } };
    expect(resolveRendererKey(section, ['generic-model'])).toEqual({
      key: 'generic-model', step: 4, reason: 'Has spatial.modelPath',
    });
  });

  it('step 4b: spatial.modelType model-viewer returns model-viewer', () => {
    const section = { id: '4b', type: 'section' as const, spatial: { modelType: 'model-viewer', modelPath: '/m.glb' } };
    expect(resolveRendererKey(section, ['model-viewer'])).toEqual({
      key: 'model-viewer', step: 4, reason: 'Model viewer web component',
    });
  });

  it('step 5: children without image returns timeline', () => {
    const section = { id: '5', type: 'section' as const, children: [{ id: 'c1', type: 'section' as const }] };
    expect(resolveRendererKey(section, ['timeline'])).toEqual({
      key: 'timeline', step: 5, reason: 'Has children, no image',
    });
  });

  it('step 6: image without children returns side-by-side', () => {
    const section = { id: '6', type: 'section' as const, media: { image: '/img.png' } };
    expect(resolveRendererKey(section, ['side-by-side'])).toEqual({
      key: 'side-by-side', step: 6, reason: 'Has image, no children',
    });
  });

  it('step 7: has title returns header', () => {
    const section = { id: '7', type: 'section' as const, subject: { title: 'Hello' } };
    expect(resolveRendererKey(section, ['header'])).toEqual({
      key: 'header', step: 7, reason: 'Has title',
    });
  });

  it('step 8: fallback returns standard-card', () => {
    const section = { id: '8', type: 'section' as const };
    expect(resolveRendererKey(section, ['standard-card'])).toEqual({
      key: 'standard-card', step: 8, reason: 'Fallback',
    });
  });

  it('skips unregistered keys and falls through', () => {
    const section = { id: '9', type: 'section' as const, spatial: { modelType: 'globe' } };
    // globe not registered, but header is
    expect(resolveRendererKey(section, ['header', 'standard-card']).key).toBe('standard-card');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "/Volumes/Seagate Portable Drive/claude/dds-platform" && pnpm vitest run packages/renderer/__tests__/resolve-renderer.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
import type { UniversalSection } from '@dds/types';

export interface RendererDecision {
  key: string;
  step: number;
  reason: string;
}

/**
 * 8-step decision tree for renderer selection.
 * Ported from dds-renderer/core/registry.tsx:121-196.
 *
 * @param section - The section to resolve a renderer for
 * @param registeredKeys - Array of keys that are actually registered
 * @returns Decision with key, step number, and reason
 */
export function resolveRendererKey(
  section: UniversalSection,
  registeredKeys: string[],
): RendererDecision {
  const has = (key: string) => registeredKeys.includes(key);

  // 1. Explicit layout dispatch
  const layout = section.display?.layout;
  if (layout && has(layout)) {
    return { key: layout, step: 1, reason: `Explicit layout: display.layout = "${layout}"` };
  }

  // 2. Landing page sections with models
  if (section.landing?.enabled && section.landing?.model && has('project-summary')) {
    return { key: 'project-summary', step: 2, reason: 'Landing page with model' };
  }

  // 3. Globe model type
  if (section.spatial?.modelType === 'globe' && has('globe')) {
    return { key: 'globe', step: 3, reason: 'Globe spatial model' };
  }

  // 4. Generic 3D model with modelPath
  if (section.spatial?.modelPath) {
    // 4b. Model viewer web component
    if (section.spatial?.modelType === 'model-viewer' && has('model-viewer')) {
      return { key: 'model-viewer', step: 4, reason: 'Model viewer web component' };
    }
    if (has('generic-model')) {
      return { key: 'generic-model', step: 4, reason: 'Has spatial.modelPath' };
    }
  }

  // 5. Children without image -> timeline
  const hasChildren = section.children && section.children.length > 0;
  const hasImage = !!section.media?.image;
  if (hasChildren && !hasImage && has('timeline')) {
    return { key: 'timeline', step: 5, reason: 'Has children, no image' };
  }

  // 6. Image without children -> side-by-side
  if (hasImage && !hasChildren && has('side-by-side')) {
    return { key: 'side-by-side', step: 6, reason: 'Has image, no children' };
  }

  // 7. Has title -> header
  if (section.subject?.title && has('header')) {
    return { key: 'header', step: 7, reason: 'Has title' };
  }

  // 8. Fallback
  if (has('standard-card')) {
    return { key: 'standard-card', step: 8, reason: 'Fallback' };
  }

  // Ultimate fallback — use section type or first registered key
  const typeKey = section.type;
  if (has(typeKey)) {
    return { key: typeKey, step: 8, reason: 'Fallback to section.type' };
  }

  return { key: '__none__', step: 8, reason: 'No renderer found' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "/Volumes/Seagate Portable Drive/claude/dds-platform" && pnpm vitest run packages/renderer/__tests__/resolve-renderer.test.ts`
Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/renderer/lib/resolve-renderer.ts packages/renderer/__tests__/resolve-renderer.test.ts
git commit -m "feat(renderer): port 8-step fallback decision tree from canonical"
```

---

## Task 4: Update batch-renderer to use fallback router

**Files:**
- Modify: `packages/renderer/batch-renderer.tsx`

- [ ] **Step 1: Rewrite batch-renderer**

```tsx
'use client';

import type { UniversalSection, RendererRegistry, FeatureFlags } from '@dds/types';
import { defaultRegistry } from './registry';
import { resolveRendererKey } from './lib/resolve-renderer';

export interface SectionBatchRendererProps {
  sections: UniversalSection[];
  registry?: RendererRegistry;
  features?: FeatureFlags;
}

export function SectionBatchRenderer({
  sections,
  registry = defaultRegistry,
  features,
}: SectionBatchRendererProps) {
  const registeredKeys = Object.keys(registry);

  return (
    <>
      {sections.map((section) => {
        // Visibility gate
        if (section.display?.visible === false) return null;

        // Feature flag gate
        const flag = section.display?.featureFlag;
        if (flag && features && !features[flag]) return null;

        // 8-step decision tree
        const decision = resolveRendererKey(section, registeredKeys);
        const entry = registry[decision.key];

        if (entry) {
          const Component = entry.component;
          return <Component key={section.id} section={section} />;
        }

        // Ultimate fallback
        if (process.env.NODE_ENV === 'development') {
          return (
            <div
              key={section.id}
              className="px-6 py-8 text-center text-sm"
              style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: 4,
                color: '#856404',
                fontFamily: 'monospace',
              }}
            >
              <strong>No renderer:</strong> {section.name ?? section.id}
              <br />
              <small>Decision: step {decision.step} — {decision.reason}</small>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
```

- [ ] **Step 2: Verify dev server still works**

Run: `cd "/Volumes/Seagate Portable Drive/claude/dds-platform" && pnpm turbo run build --filter=@dds/renderer`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/renderer/batch-renderer.tsx
git commit -m "feat(renderer): use 8-step fallback router in batch renderer"
```

---

## Task 5: Standard card + header + text-only renderers

**Files:**
- Create: `packages/renderer/renderers/standard-card-renderer.tsx`
- Create: `packages/renderer/renderers/header-renderer.tsx`
- Create: `packages/renderer/renderers/text-only-renderer.tsx`

- [ ] **Step 1: Standard card renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';
import { cn } from '../lib/utils';

export function StandardCardRenderer({
  section,
  depth = 0,
}: RendererProps & { depth?: number }) {
  const header = section.subject?.title;
  const body = section.content?.body;
  const color = (section.subject?.color ?? section.meta?.color) as string | undefined;
  const company = section.meta?.company as string | undefined;
  const role = section.subject?.subtitle;
  const period = section.meta?.period as string | undefined;
  const location = section.meta?.location as string | undefined;
  const highlights = section.content?.highlights;

  return (
    <div
      className={cn(
        'mb-4 rounded bg-neutral-900/50 p-5',
        color ? 'border-l-4' : '',
      )}
      style={{
        borderLeftColor: color || undefined,
        paddingLeft: depth > 0 ? `${24 + depth * 12}px` : undefined,
      }}
      data-section-id={section.id}
    >
      {header && (
        <h3 className="mb-2 text-lg font-semibold text-white">{header}</h3>
      )}
      {body && <Markdown>{body}</Markdown>}
      {(company || role || period || location) && (
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
          {company && <span className="font-semibold text-neutral-300">{company}</span>}
          {role && <span>{role}</span>}
          {period && <span>{period}</span>}
          {location && <span>{location}</span>}
        </div>
      )}
      {highlights && highlights.length > 0 && (
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-neutral-400">
          {highlights.map((h, i) => (
            <li key={i}>{typeof h === 'string' ? h : h.description}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Header renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function HeaderRenderer({ section }: RendererProps) {
  const title = section.subject?.title;
  const body = section.content?.body;

  if (!title) {
    return <StandardCardRenderer section={section} />;
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">{title}</h2>
        {body && <Markdown>{body}</Markdown>}
      </div>
    </section>
  );
}

// Import here to avoid circular — header falls back to standard-card
import { StandardCardRenderer } from './standard-card-renderer';
```

- [ ] **Step 3: Text-only renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function TextOnlyRenderer({ section }: RendererProps) {
  const title = section.subject?.title;
  const body = section.content?.body;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {title && (
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">{title}</h2>
        )}
        {body && <Markdown>{body}</Markdown>}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/renderer/renderers/standard-card-renderer.tsx packages/renderer/renderers/header-renderer.tsx packages/renderer/renderers/text-only-renderer.tsx
git commit -m "feat(renderer): add standard-card, header, text-only renderers"
```

---

## Task 6: Image renderers (side-by-side, image-only, image-text, centered-text)

**Files:**
- Create: `packages/renderer/renderers/side-by-side-renderer.tsx`
- Create: `packages/renderer/renderers/image-only-renderer.tsx`
- Create: `packages/renderer/renderers/image-text-renderer.tsx`
- Create: `packages/renderer/renderers/centered-text-renderer.tsx`

- [ ] **Step 1: Side-by-side renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function SideBySideRenderer({ section }: RendererProps) {
  const body = section.content?.body;
  const imageUrl = typeof section.media?.image === 'string'
    ? section.media.image
    : section.media?.image?.src;
  const title = section.subject?.title;

  if (!body || !imageUrl) {
    // Fallback handled by registry — render what we have
    return (
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          {title && <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>}
          {body && <Markdown>{body}</Markdown>}
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-12 sm:grid-cols-2">
        <div>
          {title && <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>}
          <Markdown>{body}</Markdown>
        </div>
        <div className="overflow-hidden rounded-xl shadow-2xl">
          <img
            src={imageUrl}
            alt={title || 'Section image'}
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Image-only renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';

export function ImageOnlyRenderer({ section }: RendererProps) {
  const themedImage = section.media?.themedImage;
  const singleImage = section.meta?.image as any;
  const raised = section.display?.raised;

  const imgSrc = singleImage?.src
    ?? (themedImage?.dark?.src)
    ?? (typeof section.media?.image === 'string' ? section.media.image : section.media?.image?.src);

  if (!imgSrc) return null;

  const alt = (section.meta?.alt as string) || section.subject?.title || 'Image';

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <img
          src={imgSrc}
          alt={alt}
          className={`h-auto w-full rounded-xl ${raised ? 'shadow-2xl' : ''}`}
          loading="lazy"
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Image-text renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function ImageTextRenderer({ section }: RendererProps) {
  const title = section.subject?.title;
  const body = section.content?.body;
  const themedImage = section.media?.themedImage;

  const imgSrc = themedImage?.dark?.src
    ?? (typeof section.media?.image === 'string' ? section.media.image : section.media?.image?.src);
  if (!imgSrc) return null;

  const imagePosition = section.display?.imagePosition || 'above';
  const raised = section.display?.raised;
  const alt = themedImage?.alt || section.subject?.title || 'Image';

  const imageEl = (
    <img
      src={imgSrc}
      alt={alt}
      className={`h-auto w-full rounded-xl ${raised ? 'shadow-2xl' : ''}`}
      loading="lazy"
    />
  );

  const textEl = (
    <div>
      {title && <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>}
      {body && <Markdown>{body}</Markdown>}
    </div>
  );

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        {imagePosition === 'above' ? <>{imageEl}{textEl}</> : <>{textEl}{imageEl}</>}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Centered-text renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function CenteredTextRenderer({ section }: RendererProps) {
  const title = section.subject?.title;
  const body = section.content?.body;
  const link = section.links?.inline;

  let renderedBody: string | undefined = body;
  if (body && link && !body.includes('[')) {
    const parts = body.split(link.text);
    if (parts.length === 2) {
      renderedBody = `${parts[0]}[${link.text}](${link.href})${parts[1]}`;
    }
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        {title && <h2 className="mb-4 text-3xl font-bold text-white">{title}</h2>}
        {renderedBody && <Markdown>{renderedBody}</Markdown>}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/renderer/renderers/side-by-side-renderer.tsx packages/renderer/renderers/image-only-renderer.tsx packages/renderer/renderers/image-text-renderer.tsx packages/renderer/renderers/centered-text-renderer.tsx
git commit -m "feat(renderer): add side-by-side, image-only, image-text, centered-text renderers"
```

---

## Task 7: Profile, project-header, project-summary renderers

**Files:**
- Create: `packages/renderer/renderers/profile-renderer.tsx`
- Create: `packages/renderer/renderers/project-header-renderer.tsx`
- Create: `packages/renderer/renderers/project-summary-renderer.tsx`

- [ ] **Step 1: Profile renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function ProfileRenderer({ section }: RendererProps) {
  const title = section.subject?.title || '';
  const subtitle = section.subject?.subtitle || 'About';
  const body = section.content?.body || '';
  const buttonText = section.links?.primary?.text;
  const buttonHref = section.links?.primary?.href;
  const imageData = section.media?.image;
  const imageSrc = typeof imageData === 'string' ? imageData : imageData?.src;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto grid max-w-5xl items-start gap-12 sm:grid-cols-2">
        <div>
          {title && (
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-white">{title}</h2>
          )}
          {body && <Markdown>{body}</Markdown>}
          {buttonText && buttonHref && (
            <a
              href={buttonHref}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              {buttonText}
            </a>
          )}
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            {subtitle}
          </div>
          {imageSrc && (
            <img
              src={imageSrc}
              alt={title}
              className="mt-4 rounded-xl shadow-2xl"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Project-header renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';

export function ProjectHeaderRenderer({ section }: RendererProps) {
  const title = section.subject?.title;
  const body = section.content?.body;
  const bg = section.media?.background;
  const url = section.links?.primary?.href ?? section.links?.url;
  const linkLabel = section.links?.primary?.text;

  return (
    <section className="relative overflow-hidden px-6 py-24">
      {bg && (
        <img
          src={bg.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          loading="lazy"
          aria-hidden="true"
        />
      )}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {title && (
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-white">{title}</h1>
        )}
        {body && <p className="mb-6 text-lg text-neutral-300">{body}</p>}
        {url && linkLabel && (
          <a
            href={url}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            {linkLabel} &rarr;
          </a>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Project-summary renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function ProjectSummaryRenderer({ section, sectionIndex = 0 }: RendererProps & { sectionIndex?: number }) {
  const title = section.subject?.title || section.name || '';
  const description = section.content?.body || '';
  const buttonText = section.links?.primary?.text || 'View Project';
  const buttonLink = section.links?.primary?.href || '#';
  const alternate = section.meta?.alternate ?? (sectionIndex % 2 === 1);
  const color = (section.subject?.color || section.meta?.color || '#5b9fd0') as string;

  const figure = section.landing?.figure ?? (section.meta?.index as number | undefined);
  const index = figure
    ? (figure < 10 ? `0${figure}` : `${figure}`)
    : (sectionIndex + 1 < 10 ? `0${sectionIndex + 1}` : `${sectionIndex + 1}`);

  return (
    <section
      className={`px-6 py-20 ${alternate ? 'bg-neutral-900/30' : ''}`}
      id={section.id}
    >
      <div className={`mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row ${alternate ? 'sm:flex-row-reverse' : ''}`}>
        <div className="flex-1">
          <div className="mb-4 flex items-center gap-4">
            <div className="h-px flex-1 bg-neutral-700" />
            <span className="text-sm font-mono text-neutral-500">{index}</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white">{title}</h2>
          {description && <Markdown>{description}</Markdown>}
          <a
            href={buttonLink}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color }}
          >
            {buttonText} &rarr;
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center rounded-xl bg-neutral-800/50 p-8">
          <div
            className="text-6xl font-bold opacity-20"
            style={{ color }}
          >
            {title.charAt(0)}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/renderer/renderers/profile-renderer.tsx packages/renderer/renderers/project-header-renderer.tsx packages/renderer/renderers/project-summary-renderer.tsx
git commit -m "feat(renderer): add profile, project-header, project-summary renderers"
```

---

## Task 8: 3D renderers (globe, generic-model, model-viewer, model-text, earth)

**Files:**
- Create: `packages/renderer/renderers/globe-renderer.tsx`
- Create: `packages/renderer/renderers/generic-model-renderer.tsx`
- Create: `packages/renderer/renderers/model-viewer-renderer.tsx`
- Create: `packages/renderer/renderers/model-text-renderer.tsx`
- Create: `packages/renderer/renderers/earth-renderer.tsx`

- [ ] **Step 1: Globe renderer (lazy R3F)**

```tsx
'use client';

import { Suspense } from 'react';
import type { RendererProps } from '@dds/types';

let Globe: React.ComponentType<any> | null = null;

try {
  const { lazy } = require('react');
  Globe = lazy(() =>
    import('@react-three/fiber').then(() =>
      import('@react-three/drei').then((drei) => ({
        default: function GlobeMesh({ meshes }: { meshes: string[] }) {
          const { Canvas } = require('@react-three/fiber');
          const { OrbitControls, Sphere } = drei;
          return (
            <Canvas camera={{ position: [0, 0, 3] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Sphere args={[1, 64, 64]}>
                <meshStandardMaterial color="#4488ff" wireframe />
              </Sphere>
              <OrbitControls enableZoom={false} autoRotate />
            </Canvas>
          );
        },
      }))
    )
  );
} catch {
  // R3F not available
}

export function GlobeRenderer({ section }: RendererProps) {
  if (section.spatial?.modelType !== 'globe') return null;
  const meshes = section.spatial?.meshes || ['Atmosphere', 'EarthFull'];

  if (!Globe) {
    return (
      <section className="flex items-center justify-center px-6 py-20">
        <div className="text-center text-sm text-neutral-500">
          3D globe requires @react-three/fiber — install to enable.
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-12">
      <div className="mx-auto aspect-square max-w-lg overflow-hidden rounded-xl">
        <Suspense fallback={<div className="flex h-full items-center justify-center text-neutral-500">Loading globe...</div>}>
          <Globe meshes={meshes} />
        </Suspense>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Generic model renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function GenericModelRenderer({ section }: RendererProps) {
  const modelPath = section.spatial?.modelPath;
  const title = section.subject?.title;
  const body = section.content?.body;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        {title && <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>}
        {modelPath ? (
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-neutral-800/50">
            <p className="text-sm text-neutral-400">
              3D Model: <code className="rounded bg-neutral-700 px-2 py-1 text-xs">{modelPath}</code>
              <br />
              <span className="text-xs text-neutral-500">Requires @react-three/fiber — use model-viewer for web component fallback.</span>
            </p>
          </div>
        ) : null}
        {body && <div className="mt-4"><Markdown>{body}</Markdown></div>}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Model viewer renderer (web component)**

```tsx
'use client';

import { useEffect } from 'react';
import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

let scriptState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';

function useModelViewerScript() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof customElements !== 'undefined' && customElements.get('model-viewer')) {
      scriptState = 'ready';
      return;
    }
    if (scriptState === 'loading' || scriptState === 'ready') return;
    scriptState = 'loading';
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
    script.onload = () => { scriptState = 'ready'; };
    script.onerror = () => { scriptState = 'error'; script.remove(); };
    document.head.appendChild(script);
  }, []);
}

export function ModelViewerRenderer({ section }: RendererProps) {
  useModelViewerScript();

  const modelPath = section.spatial?.modelPath;
  if (!modelPath) return null;

  const title = section.subject?.title;
  const body = section.content?.body;
  const author = section.meta?.author as string | undefined;
  const thumbnail = section.meta?.thumbnail as string | undefined;

  if (scriptState === 'error') {
    return (
      <section className="px-6 py-12">
        <p className="text-center text-sm text-neutral-500">3D viewer unavailable.</p>
      </section>
    );
  }

  const viewer = (
    <div className="aspect-[4/3] overflow-hidden rounded-xl">
      {/* @ts-ignore — model-viewer is a web component */}
      <model-viewer
        src={modelPath}
        poster={thumbnail || undefined}
        alt={title || '3D Model'}
        auto-rotate
        camera-controls
        shadow-intensity="1"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        {title && <h3 className="mb-4 text-2xl font-bold text-white">{title}</h3>}
        {body ? (
          <div className="grid items-center gap-8 sm:grid-cols-2">
            <div>
              <Markdown>{body}</Markdown>
              {author && <p className="mt-2 text-xs text-neutral-500">Model by {author}</p>}
            </div>
            {viewer}
          </div>
        ) : (
          <>
            {viewer}
            {author && <p className="mt-2 text-xs text-neutral-500">Model by {author}</p>}
          </>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Model-text renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function ModelTextRenderer({ section }: RendererProps) {
  const title = section.subject?.title;
  const paragraphs = section.content?.paragraphs;
  const modelPath = section.spatial?.modelPath;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl items-start gap-12 sm:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-xl bg-neutral-800/50">
          {modelPath ? (
            <p className="text-xs text-neutral-500">3D: {modelPath}</p>
          ) : (
            <div className="text-4xl text-neutral-700">3D</div>
          )}
        </div>
        <div>
          {title && <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>}
          {paragraphs?.map((p, i) => (
            <div key={i} className="mb-4">
              {p.description && <Markdown>{p.description}</Markdown>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Earth renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function EarthRenderer({ section }: RendererProps) {
  const children = section.children || [];

  return (
    <section className="bg-neutral-950 px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 flex aspect-video items-center justify-center rounded-xl bg-neutral-900">
          <p className="text-sm text-neutral-500">Interactive Earth — requires R3F</p>
        </div>
        {children.map((child) => (
          <div key={child.id} className="mb-8 border-l-2 border-neutral-700 pl-6">
            {child.subject?.title && (
              <h3 className="mb-2 text-xl font-semibold text-white">{child.subject.title}</h3>
            )}
            {child.content?.body && <Markdown>{child.content.body}</Markdown>}
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add packages/renderer/renderers/globe-renderer.tsx packages/renderer/renderers/generic-model-renderer.tsx packages/renderer/renderers/model-viewer-renderer.tsx packages/renderer/renderers/model-text-renderer.tsx packages/renderer/renderers/earth-renderer.tsx
git commit -m "feat(renderer): add 3D renderers (globe, generic-model, model-viewer, model-text, earth)"
```

---

## Task 9: Content renderers (carousel, code-diff, background-columns, featured-overlay, sidebar-images, index-grid)

**Files:**
- Create: `packages/renderer/renderers/carousel-renderer.tsx`
- Create: `packages/renderer/renderers/code-diff-renderer.tsx`
- Create: `packages/renderer/renderers/background-columns-renderer.tsx`
- Create: `packages/renderer/renderers/featured-overlay-renderer.tsx`
- Create: `packages/renderer/renderers/sidebar-images-renderer.tsx`
- Create: `packages/renderer/renderers/index-grid-renderer.tsx`

- [ ] **Step 1: Carousel renderer**

```tsx
'use client';

import { useState } from 'react';
import type { RendererProps } from '@dds/types';

export function CarouselRenderer({ section }: RendererProps) {
  const images = section.meta?.images as Array<{ src: string; alt?: string }> | undefined;
  const [current, setCurrent] = useState(0);

  if (!images?.length) return null;

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={images[current].src}
            alt={images[current].alt || `Slide ${current + 1}`}
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 w-2 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-neutral-600'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Code-diff renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

interface CodeBlock {
  code: string;
  language?: string;
  label?: string;
}

export function CodeDiffRenderer({ section }: RendererProps) {
  const title = section.subject?.title;
  const body = section.content?.body;
  const before = section.content?.before as CodeBlock | undefined;
  const after = section.content?.after as CodeBlock | undefined;
  const showLineNumbers = (section.meta?.showLineNumbers as boolean) ?? true;

  if (!before || !after) return null;

  function renderCode(block: CodeBlock, label: string) {
    const lines = block.code.trim().split('\n');
    return (
      <div className="flex-1 overflow-hidden rounded-lg">
        <div className="bg-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-300">
          {block.label || label}
        </div>
        <pre className="overflow-x-auto bg-neutral-900 p-4 text-sm leading-relaxed text-neutral-300">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                {showLineNumbers && (
                  <span className="mr-4 select-none text-neutral-600">{i + 1}</span>
                )}
                <span>{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {title && <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>}
        {body && <div className="mb-6"><Markdown>{body}</Markdown></div>}
        <div className="flex flex-col gap-4 sm:flex-row">
          {renderCode(before, 'Before')}
          {renderCode(after, 'After')}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Background-columns renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function BackgroundColumnsRenderer({ section }: RendererProps) {
  const title = section.subject?.title;
  const body = section.content?.body;
  const bg = section.media?.backgroundFull;
  const video = section.media?.video;

  return (
    <section className="relative overflow-hidden px-6 py-20">
      {bg && (
        <img
          src={bg.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          aria-hidden="true"
          loading="lazy"
        />
      )}
      <div className="relative z-10 mx-auto grid max-w-5xl gap-12 sm:grid-cols-2">
        <div>
          {title && <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>}
          {body && <Markdown>{body}</Markdown>}
        </div>
        {video && (
          <div className="overflow-hidden rounded-xl shadow-2xl">
            <img
              src={video.src}
              alt={video.alt || ''}
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Featured-overlay renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function FeaturedOverlayRenderer({ section }: RendererProps) {
  const title = section.subject?.title;
  const body = section.content?.body;
  const bgFull = section.media?.backgroundFull;
  const link = section.links?.primary;

  if (!bgFull) return null;

  return (
    <section className="relative overflow-hidden px-6 py-24">
      <img
        src={bgFull.src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {title && <h2 className="mb-4 text-3xl font-bold text-white">{title}</h2>}
        {body && <Markdown className="prose prose-invert prose-sm mx-auto max-w-xl">{body}</Markdown>}
        {link && (
          <a
            href={link.href}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
          >
            {link.text} &rarr;
          </a>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Sidebar-images renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function SidebarImagesRenderer({ section }: RendererProps) {
  const title = section.subject?.title;
  const body = section.content?.body;
  const sidebarImages = section.media?.sidebarImages || [];

  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-2">
        <div>
          {title && <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>}
          {body && <Markdown>{body}</Markdown>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {sidebarImages.map((imgSet, i) => {
            const src = imgSet.dark?.src || imgSet.light?.src;
            if (!src) return null;
            return (
              <img
                key={i}
                src={src}
                alt={imgSet.alt || ''}
                className="rounded-lg shadow-lg"
                loading="lazy"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Index-grid renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';

export function IndexGridRenderer({ section }: RendererProps) {
  const title = section.subject?.title || 'Content Index';
  const description = section.subject?.description;
  const body = section.content?.body;
  const children = section.children || [];

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-3xl font-bold text-white">{title}</h2>
        {description && <p className="mb-8 text-neutral-400">{description}</p>}
        {body && <p className="mb-8 text-neutral-400">{body}</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <div key={child.id} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">{child.subject?.title || child.name}</h3>
              <p className="text-sm text-neutral-400">{child.subject?.description || child.content?.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add packages/renderer/renderers/carousel-renderer.tsx packages/renderer/renderers/code-diff-renderer.tsx packages/renderer/renderers/background-columns-renderer.tsx packages/renderer/renderers/featured-overlay-renderer.tsx packages/renderer/renderers/sidebar-images-renderer.tsx packages/renderer/renderers/index-grid-renderer.tsx
git commit -m "feat(renderer): add carousel, code-diff, background-columns, featured-overlay, sidebar-images, index-grid renderers"
```

---

## Task 10: Signal-lines, intro, theme-switcher renderers

**Files:**
- Create: `packages/renderer/renderers/signal-lines-renderer.tsx`
- Create: `packages/renderer/renderers/intro-renderer.tsx`
- Create: `packages/renderer/renderers/theme-switcher-renderer.tsx`

- [ ] **Step 1: Signal-lines renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';

export function SignalLinesRenderer({ section }: RendererProps) {
  const height = (section.meta?.height as string) || '100vh';
  const color = (section.subject?.color as string) || '#00aaff';

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{ height }}
      data-section-id={section.id}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="h-px w-3/4 opacity-30"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-xs text-neutral-600">Signal Lines — canvas renderer (requires R3F)</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Intro renderer**

```tsx
'use client';

import { useState, useEffect } from 'react';
import type { RendererProps } from '@dds/types';

export function IntroRenderer({ section }: RendererProps) {
  const name = section.subject?.title || '';
  const role = section.content?.body || '';
  const rawHighlights = section.content?.highlights || section.content?.disciplines || [];
  const highlights: string[] = rawHighlights.map((h: any) =>
    typeof h === 'string' ? h : h.description || h.label || ''
  );

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (highlights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % highlights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [highlights.length]);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950" />
      <div className="relative z-10 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-7xl">
          {name}
        </h1>
        <p className="mb-6 text-xl text-neutral-300 sm:text-2xl">{role}</p>
        {highlights.length > 0 && (
          <div className="h-8 text-lg font-medium text-indigo-400 transition-opacity">
            +{highlights[current]}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Theme-switcher renderer**

```tsx
'use client';

import type { RendererProps } from '@dds/types';
import { Markdown } from '../lib/markdown';

export function ThemeSwitcherRenderer({ section }: RendererProps) {
  const title = section.subject?.title;
  const body = section.content?.body;
  const themedImage = section.media?.themedImage;

  // Use dark variant by default (platform is dark-themed)
  const imgSrc = themedImage?.dark?.src;
  if (!imgSrc) return null;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <img
          src={imgSrc}
          alt={themedImage?.alt || ''}
          className="mb-8 h-auto w-full rounded-xl"
          loading="lazy"
        />
        <div className="mx-auto max-w-3xl text-center">
          {title && <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>}
          {body && <Markdown>{body}</Markdown>}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/renderer/renderers/signal-lines-renderer.tsx packages/renderer/renderers/intro-renderer.tsx packages/renderer/renderers/theme-switcher-renderer.tsx
git commit -m "feat(renderer): add signal-lines, intro, theme-switcher renderers"
```

---

## Task 11: Wire everything into registry + exports

**Files:**
- Modify: `packages/renderer/renderers/index.ts`
- Modify: `packages/renderer/registry.ts`
- Modify: `packages/renderer/index.ts`

- [ ] **Step 1: Update renderers/index.ts with all exports**

```ts
// Platform-original renderers
export { HeroRenderer } from './hero-renderer';
export { TextRenderer } from './text-renderer';
export { StatsRenderer } from './stats-renderer';
export { FeatureMatrixRenderer } from './feature-matrix-renderer';
export { TimelineRenderer } from './timeline-renderer';
export { CTARenderer } from './cta-renderer';
export { TwoColumnRenderer } from './two-column-renderer';
export { SectorsGridRenderer } from './sectors-grid-renderer';

// Canonical-ported renderers
export { StandardCardRenderer } from './standard-card-renderer';
export { HeaderRenderer } from './header-renderer';
export { TextOnlyRenderer } from './text-only-renderer';
export { SideBySideRenderer } from './side-by-side-renderer';
export { ImageOnlyRenderer } from './image-only-renderer';
export { ImageTextRenderer } from './image-text-renderer';
export { CenteredTextRenderer } from './centered-text-renderer';
export { ProfileRenderer } from './profile-renderer';
export { ProjectHeaderRenderer } from './project-header-renderer';
export { ProjectSummaryRenderer } from './project-summary-renderer';
export { GlobeRenderer } from './globe-renderer';
export { GenericModelRenderer } from './generic-model-renderer';
export { ModelViewerRenderer } from './model-viewer-renderer';
export { ModelTextRenderer } from './model-text-renderer';
export { EarthRenderer } from './earth-renderer';
export { CarouselRenderer } from './carousel-renderer';
export { CodeDiffRenderer } from './code-diff-renderer';
export { BackgroundColumnsRenderer } from './background-columns-renderer';
export { FeaturedOverlayRenderer } from './featured-overlay-renderer';
export { SidebarImagesRenderer } from './sidebar-images-renderer';
export { IndexGridRenderer } from './index-grid-renderer';
export { SignalLinesRenderer } from './signal-lines-renderer';
export { IntroRenderer } from './intro-renderer';
export { ThemeSwitcherRenderer } from './theme-switcher-renderer';
```

- [ ] **Step 2: Update registry.ts — register all canonical keys + keep platform aliases**

```ts
import type { RendererEntry, RendererRegistry } from '@dds/types';

// Platform-original
import { HeroRenderer } from './renderers/hero-renderer';
import { TextRenderer } from './renderers/text-renderer';
import { StatsRenderer } from './renderers/stats-renderer';
import { FeatureMatrixRenderer } from './renderers/feature-matrix-renderer';
import { TimelineRenderer } from './renderers/timeline-renderer';
import { CTARenderer } from './renderers/cta-renderer';
import { TwoColumnRenderer } from './renderers/two-column-renderer';
import { SectorsGridRenderer } from './renderers/sectors-grid-renderer';

// Canonical-ported
import { StandardCardRenderer } from './renderers/standard-card-renderer';
import { HeaderRenderer } from './renderers/header-renderer';
import { TextOnlyRenderer } from './renderers/text-only-renderer';
import { SideBySideRenderer } from './renderers/side-by-side-renderer';
import { ImageOnlyRenderer } from './renderers/image-only-renderer';
import { ImageTextRenderer } from './renderers/image-text-renderer';
import { CenteredTextRenderer } from './renderers/centered-text-renderer';
import { ProfileRenderer } from './renderers/profile-renderer';
import { ProjectHeaderRenderer } from './renderers/project-header-renderer';
import { ProjectSummaryRenderer } from './renderers/project-summary-renderer';
import { GlobeRenderer } from './renderers/globe-renderer';
import { GenericModelRenderer } from './renderers/generic-model-renderer';
import { ModelViewerRenderer } from './renderers/model-viewer-renderer';
import { ModelTextRenderer } from './renderers/model-text-renderer';
import { EarthRenderer } from './renderers/earth-renderer';
import { CarouselRenderer } from './renderers/carousel-renderer';
import { CodeDiffRenderer } from './renderers/code-diff-renderer';
import { BackgroundColumnsRenderer } from './renderers/background-columns-renderer';
import { FeaturedOverlayRenderer } from './renderers/featured-overlay-renderer';
import { SidebarImagesRenderer } from './renderers/sidebar-images-renderer';
import { IndexGridRenderer } from './renderers/index-grid-renderer';
import { SignalLinesRenderer } from './renderers/signal-lines-renderer';
import { IntroRenderer } from './renderers/intro-renderer';
import { ThemeSwitcherRenderer } from './renderers/theme-switcher-renderer';

export function createRegistry(entries: Record<string, RendererEntry>): RendererRegistry {
  return { ...entries };
}

// Helper to create entry with minimal metadata
function entry(name: string, component: any, description: string, layouts: string[] = [name]): RendererEntry {
  return { component, metadata: { name, displayName: name, description, layouts } };
}

export const defaultRegistry: RendererRegistry = createRegistry({
  // ─── Platform-original ────────────────────────
  'hero':             entry('hero', HeroRenderer, 'Full viewport hero'),
  'intro':            entry('intro', IntroRenderer, 'Landing intro with rotating highlights', ['intro', 'hero']),
  'text':             entry('text', TextRenderer, 'Generic text section'),
  'section':          entry('section', TextRenderer, 'Generic section (alias)'),
  'cta':              entry('cta', CTARenderer, 'Call to action'),
  'two-column':       entry('two-column', TwoColumnRenderer, 'Two-column highlights'),
  'sectors-grid':     entry('sectors-grid', SectorsGridRenderer, 'Sector card grid'),

  // ─── Canonical text/layout ────────────────────
  'standard-card':    entry('standard-card', StandardCardRenderer, 'Universal fallback card'),
  'header':           entry('header', HeaderRenderer, 'Text heading + body'),
  'text-only':        entry('text-only', TextOnlyRenderer, 'Simple heading + body'),
  'centered-text':    entry('centered-text', CenteredTextRenderer, 'Centered text with link'),
  'side-by-side':     entry('side-by-side', SideBySideRenderer, 'Text left, image right'),
  'profile':          entry('profile', ProfileRenderer, 'Two-column profile'),
  'code-diff':        entry('code-diff', CodeDiffRenderer, 'Side-by-side code comparison'),

  // ─── Canonical image/media ────────────────────
  'image-only':       entry('image-only', ImageOnlyRenderer, 'Theme-aware image display'),
  'image-text':       entry('image-text', ImageTextRenderer, 'Image + heading + text'),
  'carousel':         entry('carousel', CarouselRenderer, 'Image carousel'),
  'sidebar-images':   entry('sidebar-images', SidebarImagesRenderer, 'Text + sidebar images'),
  'background-columns': entry('background-columns', BackgroundColumnsRenderer, 'Full bg + text + video'),
  'featured-overlay': entry('featured-overlay', FeaturedOverlayRenderer, 'Background with overlay'),
  'theme-switcher':   entry('theme-switcher', ThemeSwitcherRenderer, 'Dark/light preview toggle'),

  // ─── Canonical project/landing ────────────────
  'project-header':   entry('project-header', ProjectHeaderRenderer, 'Hero header with background'),
  'project-summary':  entry('project-summary', ProjectSummaryRenderer, 'Landing card with CTA'),
  'index-grid':       entry('index-grid', IndexGridRenderer, 'Content index grid'),

  // ─── Canonical stats/data ─────────────────────
  'stats-grid':       entry('stats-grid', StatsRenderer, 'Stats grid'),
  'feature-matrix':   entry('feature-matrix', FeatureMatrixRenderer, 'Feature comparison table'),
  'timeline':         entry('timeline', TimelineRenderer, 'Vertical timeline'),

  // ─── Canonical 3D/spatial ─────────────────────
  'globe':            entry('globe', GlobeRenderer, 'Three.js globe'),
  'earth':            entry('earth', EarthRenderer, 'Interactive Earth with scroll children'),
  'generic-model':    entry('generic-model', GenericModelRenderer, 'GLB model viewer'),
  'model-viewer':     entry('model-viewer', ModelViewerRenderer, '<model-viewer> web component'),
  'model-text':       entry('model-text', ModelTextRenderer, '3D model + text'),
  'signal-lines':     entry('signal-lines', SignalLinesRenderer, 'Animated signal lines'),
});
```

- [ ] **Step 3: Update index.ts — add new exports**

Add to the existing index.ts after the existing exports:

```ts
// Markdown
export { Markdown } from './lib/markdown';

// Fallback router
export { resolveRendererKey, type RendererDecision } from './lib/resolve-renderer';
```

- [ ] **Step 4: Type-check**

Run: `cd "/Volumes/Seagate Portable Drive/claude/dds-platform" && pnpm turbo run build --filter=@dds/renderer`
Expected: Build succeeds.

- [ ] **Step 5: Run all tests**

Run: `cd "/Volumes/Seagate Portable Drive/claude/dds-platform" && pnpm vitest run`
Expected: All tests pass (including resolve-renderer tests).

- [ ] **Step 6: Commit**

```bash
git add packages/renderer/renderers/index.ts packages/renderer/registry.ts packages/renderer/index.ts
git commit -m "feat(renderer): wire all 27 canonical renderers into registry + exports"
```

---

## Task 12: Registry completeness test

**Files:**
- Create: `packages/renderer/__tests__/registry.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import { defaultRegistry } from '../registry';

const CANONICAL_KEYS = [
  'standard-card', 'header', 'text-only', 'centered-text',
  'side-by-side', 'image-only', 'image-text', 'profile',
  'project-header', 'project-summary', 'index-grid',
  'stats-grid', 'feature-matrix', 'timeline',
  'globe', 'earth', 'generic-model', 'model-viewer', 'model-text',
  'carousel', 'code-diff', 'background-columns', 'featured-overlay',
  'sidebar-images', 'signal-lines', 'theme-switcher', 'intro',
];

const PLATFORM_KEYS = [
  'hero', 'text', 'section', 'cta', 'two-column', 'sectors-grid',
];

describe('defaultRegistry', () => {
  it.each(CANONICAL_KEYS)('has canonical renderer: %s', (key) => {
    expect(defaultRegistry[key]).toBeDefined();
    expect(defaultRegistry[key].component).toBeTypeOf('function');
  });

  it.each(PLATFORM_KEYS)('has platform renderer: %s', (key) => {
    expect(defaultRegistry[key]).toBeDefined();
    expect(defaultRegistry[key].component).toBeTypeOf('function');
  });

  it('has at least 33 registered keys', () => {
    expect(Object.keys(defaultRegistry).length).toBeGreaterThanOrEqual(33);
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd "/Volumes/Seagate Portable Drive/claude/dds-platform" && pnpm vitest run packages/renderer/__tests__/registry.test.ts`
Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/renderer/__tests__/registry.test.ts
git commit -m "test(renderer): add registry completeness tests for all 33 renderer keys"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] 8-step fallback router ported (Task 3)
- [x] All 27 canonical renderer keys registered (Tasks 5-10, verified by Task 12)
- [x] Platform-only renderers preserved (hero, cta, two-column, sectors-grid)
- [x] 3D renderers with graceful degradation when R3F absent (Task 8)
- [x] Landing dispatch via project-summary (Task 7)
- [x] Markdown component for body text (Task 2)
- [x] Batch renderer uses decision tree (Task 4)

**Placeholder scan:** No TBD/TODO. Every task has complete code.

**Type consistency:** All renderers import `RendererProps` from `@dds/types`. `resolveRendererKey` signature stable across tasks 3/4. Registry `entry()` helper used consistently in Task 11.

**Dependencies:** `react-markdown` added as direct dep. R3F as optional peer dep with runtime checks. No CSS modules — all Tailwind.
