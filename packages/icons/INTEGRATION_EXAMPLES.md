# Icon System Integration Examples

This document provides code examples and patterns for integrating the DDS icon system into renderers, components, and data sections.

---

## 1. Renderer Integration

### Hero Renderer (Large Display)

**File:** `packages/renderer/renderers/hero-renderer.tsx`

```tsx
import { getCuneiformForDomain, AppChip } from '@dds/icons';
import type { RendererProps } from '@dds/types';

export function HeroRenderer({ section }: RendererProps) {
  const { subject, meta, name, links } = section;

  // Extract domain from section metadata or name
  const domainForIcon = meta?.domain ?? name ?? links?.primary?.href;
  const cuneiformEntry = domainForIcon ? getCuneiformForDomain(domainForIcon) : undefined;

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="badges">
          {/* Large 64px icon with slow flip */}
          {cuneiformEntry && (
            <div className="text-indigo-400" title={`${cuneiformEntry.name} — ${cuneiformEntry.meaning}`}>
              <AppChip
                entry={cuneiformEntry}
                size={64}
                flipDelay={1600}  // User sees cuneiform first
                flipDuration={700}
              />
            </div>
          )}
          {subject?.category && (
            <span className="badge-category">{subject.category}</span>
          )}
        </div>
        <h1>{subject?.title}</h1>
      </div>
    </section>
  );
}
```

**Behavior:**
- 64px cuneiform glyph appears on load
- After 1.6 seconds, flips to show badge icon
- User can hover to see tooltip with glyph name & meaning
- Color inherits from parent (e.g., `text-indigo-400`)

### Entry Highlight Renderer (Featured Card)

**File:** `packages/renderer/renderers/entry-highlight-renderer.tsx`

```tsx
import { getCuneiformForDomain, AppChip } from '@dds/icons';

export function EntryHighlightRenderer({ section }: RendererProps) {
  const { subject, meta, links, name } = section;

  // Fallback chain: meta.domain → primary link domain → section name
  const domainForIcon = meta?.domain ?? links?.primary?.domain ?? name;
  const cuneiformEntry = domainForIcon ? getCuneiformForDomain(domainForIcon) : undefined;

  return (
    <article className="featured-card">
      <div className="badges">
        {/* Medium 48px icon in badge bar */}
        {cuneiformEntry && (
          <div className="text-red-400" title={`${cuneiformEntry.name} — ${cuneiformEntry.meaning}`}>
            <AppChip
              entry={cuneiformEntry}
              size={48}
              flipDelay={2000}
              flipDuration={600}
            />
          </div>
        )}
        <span className="badge-featured">Featured</span>
        {subject?.category && (
          <span className="badge-category">{subject.category}</span>
        )}
      </div>
      <h2>{subject?.title}</h2>
      {/* ... rest of card ... */}
    </article>
  );
}
```

**Behavior:**
- Medium icon (48px) in featured badge row
- Longer delay (2s) since card may not be immediately visible
- Paired with "Featured" and category badges

### Entry Grid Renderer (Card Collection)

**File:** `packages/renderer/renderers/entry-grid-renderer.tsx`

```tsx
import { getCuneiformForDomain, AppChip } from '@dds/icons';

export function EntryGridRenderer({ section }: RendererProps) {
  const { content } = section;
  const items = content?.items ?? [];

  return (
    <section className="entry-grid">
      <div className="grid">
        {items.map((item, index) => {
          // Extract domain from item name or link
          const domainForIcon = item.name ?? item.links?.primary?.href;
          const cuneiformEntry = domainForIcon ? getCuneiformForDomain(domainForIcon) : undefined;

          return (
            <div key={item.id} className="card">
              {/* Small 32px icon with staggered flip */}
              {cuneiformEntry && (
                <div className="text-neutral-400" title={`${cuneiformEntry.name} — ${cuneiformEntry.meaning}`}>
                  <AppChip
                    entry={cuneiformEntry}
                    size={32}
                    flipDelay={1200 + index * 100}  // Stagger by 100ms per card
                    flipDuration={500}
                    disableAutoFlip={false}
                  />
                </div>
              )}
              <h3>{item.subject?.title}</h3>
              {/* ... rest of card ... */}
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

**Behavior:**
- Small 32px icons in card header
- Staggered flip: first card flips at 1.2s, second at 1.3s, etc.
- Creates cascading animation effect across grid
- Random jitter: `1200 + Math.random() * 400` for natural variation

---

## 2. Data Section Patterns

### Adding Domain Metadata

To enable AppChip in your sections, add `meta.domain` field:

```typescript
// Example section data
const section = {
  id: 'my-section',
  type: 'section',
  name: 'shop',
  
  subject: {
    title: 'Shop',
    category: 'Commerce',
  },
  
  content: {
    body: 'Our e-commerce platform...',
  },
  
  meta: {
    domain: 'shop.example.com',  // ← Enables AppChip lookup
  },
};
```

### Domain Lookup Fallback Chain

If `meta.domain` is not provided, the system tries:

1. `section.meta.domain` — Explicit domain override
2. `section.links.primary.domain` — Link metadata
3. `section.name` — Vertical identifier (e.g., 'shop', 'wiki', 'dev')

**Example:**

```typescript
// All of these enable AppChip
const section1 = { name: 'shop', ... };
const section2 = { meta: { domain: 'myshop.example.com' }, ... };
const section3 = { links: { primary: { domain: 'wiki.example.com', href: '...' } }, ... };
```

---

## 3. Custom Styling

### Theme Color Integration

AppChip inherits color via `currentColor`:

```tsx
{/* Red theme */}
<div className="text-red-500">
  <AppChip entry={entry} />  {/* Glyphcolorred, accent auto-adjusted */}
</div>

{/* Blue theme */}
<div className="text-blue-500">
  <AppChip entry={entry} />  {/* Glyph color blue */}
</div>

{/* Custom CSS variable */}
<div style={{ color: 'var(--color-brand-primary)' }}>
  <AppChip entry={entry} />
</div>
```

### Badge Icon Customization

Override the back-face icon:

```tsx
{/* Use custom emoji */}
<AppChip
  entry={entry}
  badgeIcon={'🏪'}
  badgeBg="hsl(30 100% 50% / 0.15)"
  badgeBorder="hsl(30 100% 50% / 0.25)"
/>

{/* Use Lucide icon */}
import { Store } from 'lucide-react';

<AppChip
  entry={entry}
  badgeIcon={<Store size={20} />}
/>
```

### Size Scaling

Recommended sizes:

| Context | Size | Use Case |
|---------|------|----------|
| Text label | 16px | Inline with text, small badges |
| Grid card | 32px | Compact card header |
| Featured card | 48px | Card badge row |
| Hero section | 64px | Large display with title |
| Feature display | 96px+ | Full-screen feature or modal |

```tsx
{/* Small: grid card */}
<AppChip entry={entry} size={32} />

{/* Medium: featured card */}
<AppChip entry={entry} size={48} />

{/* Large: hero section */}
<AppChip entry={entry} size={64} />

{/* XLarge: feature display */}
<AppChip entry={entry} size={96} />
```

---

## 4. Animation Timing Patterns

### Fast Flip (Action-Triggered)

For user-initiated flips:

```tsx
<AppChip
  entry={entry}
  disableAutoFlip={true}  // No auto-flip
  flipDuration={400}      // Quick response
  clickToFlip={true}      // Click to toggle
/>
```

### Slow Reveal (Initial Load)

For hero sections where icon is the focal point:

```tsx
<AppChip
  entry={entry}
  flipDelay={2000}        // Long delay to show cuneiform first
  flipDuration={800}      // Smooth, leisurely flip
/>
```

### Staggered Grid (Collection Animation)

For multiple icons:

```tsx
{items.map((item, i) => (
  <AppChip
    key={item.id}
    entry={getCuneiformForDomain(item.name)}
    flipDelay={800 + i * 150}  // Each card 150ms apart
    flipDuration={600}
  />
))}
```

### No Animation (Static Display)

For thumbnails or minimal contexts:

```tsx
<AppChip
  entry={entry}
  disableAutoFlip={true}
  tooltip={false}
  size={24}
/>
```

---

## 5. Tooltip & Accessibility

### Tooltip Content

Hover reveals:

```
[Glyph] Name · Codepoint
Meaning
Sumerian cuneiform · .vertical
```

Example:
```
𒃵 GAR · U+120F5
Marketplace · To set in place
Sumerian cuneiform · .shop
```

### Accessible Labeling

```tsx
<div
  title={`${entry.name} — ${entry.meaning}`}
  aria-label={`${entry.vertical} icon: ${entry.meaning}`}
>
  <AppChip entry={entry} tooltip={true} />
</div>
```

### Hiding Tooltip

```tsx
<AppChip
  entry={entry}
  tooltip={false}  // No hover tooltip
/>
```

---

## 6. Glyph Rendering Verification

### Check Cuneiform Support

```typescript
import { isCuneiformSupported } from '@dds/icons';

if (isCuneiformSupported()) {
  console.log('✓ Cuneiform glyphs will render');
} else {
  console.log('✗ Falling back to emoji/ASCII');
}
```

### Fallback to Emoji

```typescript
import { renderIconWithFallback, getIconMapping } from '@dds/icons';

const mapping = getIconMapping('shop');

// Auto-fallback: cuneiform → emoji → ASCII
const display = renderIconWithFallback(mapping);

// Force emoji
const emoji = renderIconWithFallback(mapping, { preferEmoji: true });

// Force ASCII
const ascii = renderIconWithFallback(mapping, { preferAscii: true });
```

---

## 7. Testing & QA Checklist

### Rendering

- [ ] Cuneiform glyphs visible at all sizes (16–128px)
- [ ] Anti-aliasing enabled (no jagged edges)
- [ ] Font stack working (Segoe UI Symbol, etc.)
- [ ] Emoji fallback if cuneiform unsupported

### Animation

- [ ] Glyphs visible on initial load
- [ ] Auto-flip occurs after correct delay
- [ ] Badge icon appears smooth (no jitter)
- [ ] Multiple icons in grid stagger correctly
- [ ] Click toggles manual flip (if enabled)

### Theming

- [ ] All 9 colors render correctly
- [ ] Tooltips visible on hover
- [ ] Badge background and border respect theme
- [ ] No overflow or layout shift on flip

### Accessibility

- [ ] ARIA labels present
- [ ] Tooltips read aloud
- [ ] Keyboard navigation (focus visible)
- [ ] No motion if `prefers-reduced-motion`

---

## 8. Common Issues & Fixes

### Glyphs Not Rendering

```typescript
// Diagnose
console.log('Cuneiform supported:', isCuneiformSupported());
console.log('Glyph width:', ctx.measureText('𒃵').width);

// Fix: Ensure font stack
<div style={{ fontFamily: '"Segoe UI Symbol", "Arial Unicode MS", sans-serif' }}>
  <AppChip entry={entry} />
</div>
```

### Tooltip Hidden Behind Content

```tsx
// Ensure parent has sufficient z-index
<div style={{ position: 'relative', zIndex: 10 }}>
  <AppChip entry={entry} tooltip={true} />
</div>
```

### Animation Stuttering

```tsx
// Reduce duration and enable GPU acceleration
<div style={{ willChange: 'transform' }}>
  <AppChip
    entry={entry}
    flipDuration={500}  // Faster is smoother
  />
</div>
```

### Theme Not Applying

```tsx
// Verify currentColor inheritance
<div style={{ color: 'var(--color-red-500)' }}>
  <AppChip entry={entry} />
</div>

// Or use explicit color
<div className="text-red-500">
  <AppChip entry={entry} />
</div>
```

---

## 9. Performance Optimization

### Memoization

```typescript
import { useMemo } from 'react';
import { getCuneiformForDomain } from '@dds/icons';

export function CardComponent({ item }) {
  // Memoize domain lookup
  const cuneiformEntry = useMemo(
    () => getCuneiformForDomain(item.name),
    [item.name]
  );

  return <AppChip entry={cuneiformEntry} />;
}
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const AppChipLazy = lazy(() => import('@dds/icons').then(m => ({ default: m.AppChip })));

export function GridCard({ item }) {
  return (
    <Suspense fallback={<div className="icon-placeholder" />}>
      <AppChipLazy entry={cuneiformEntry} />
    </Suspense>
  );
}
```

### Grid Performance

```tsx
// For large grids (100+ cards), disable auto-flip
{items.map((item) => (
  <AppChip
    key={item.id}
    entry={getCuneiformForDomain(item.name)}
    disableAutoFlip={true}  // Reduce animations
    size={32}
  />
))}
```

---

## 10. Future Enhancement Ideas

- [ ] Animated SVG glyph variants (outline, filled, animated)
- [ ] Glyph picker UI for authoring sections
- [ ] WebGL renderer for 1000+ icon grids
- [ ] Haptic feedback on mobile (flip vibration)
- [ ] Cuneiform text input (transliteration → glyph lookup)
- [ ] Accessibility: reduced motion support
- [ ] Dark/light mode glyph variants
