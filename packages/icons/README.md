# @dds/icons — Sumerian Cuneiform Icon System

A production-ready icon system mapping 26 domain verticals to ancient Sumerian cuneiform glyphs (Unicode U+12000–U+12FFF) with 3D flip-card animations, multi-level fallbacks, and comprehensive theme support.

## Quick Start

### Basic Usage

```tsx
import { AppChip, getCuneiformByTLD } from '@dds/icons';

const entry = getCuneiformByTLD('shop');

<AppChip
  entry={entry}
  size={56}
  flipDelay={1400}
  flipDuration={800}
/>
```

### In a Renderer

```tsx
import { getCuneiformForDomain, AppChip } from '@dds/icons';

export function HeroRenderer({ section }: RendererProps) {
  const domainForIcon = section.meta?.domain ?? section.name;
  const cuneiformEntry = domainForIcon ? getCuneiformForDomain(domainForIcon) : undefined;

  return (
    <section>
      {cuneiformEntry && (
        <div className="text-indigo-400">
          <AppChip
            entry={cuneiformEntry}
            size={64}
            flipDelay={1600}
            flipDuration={700}
          />
        </div>
      )}
    </section>
  );
}
```

## What's Included

### Components
- **AppChip** — 3D flip-card icon component (cuneiform ↔ badge icon)
- **AppChipGrid** — Responsive grid with staggered animations
- **CuneiformIcon** — Higher-level wrapper with preset animations

### Data & Utilities
- **CUNEIFORM** — Master registry (26 domains → glyphs)
- **ICON_MAPPINGS** — Glyph + Lucide suggestion + fallbacks
- **getCuneiformByTLD()** — Lookup by domain extension (.shop, .dev, .ai)
- **getCuneiformForDomain()** — Lookup by full domain or vertical name
- **isCuneiformSupported()** — Runtime glyph rendering detection
- **renderIconWithFallback()** — Cascading fallback renderer

### Documentation
- **ICON_USAGE.md** — Comprehensive API reference & best practices
- **INTEGRATION_EXAMPLES.md** — Real code examples from 3 renderers
- **IMPLEMENTATION_SUMMARY.md** — Deliverables, verification, testing

## Features

✓ **26 domain mappings** (shop, art, wiki, dev, ai, space, etc.)
✓ **3D flip animation** (CSS preserve-3d, GPU-accelerated)
✓ **Auto-flip & manual toggle** (configurable timing)
✓ **Hover tooltips** (glyph name, Sumerian meaning, codepoint)
✓ **Responsive sizing** (16px–128px+)
✓ **Theme colors** (9-color palette via CSS custom properties)
✓ **Multi-level fallbacks** (cuneiform → emoji → ASCII)
✓ **No dependencies** (React 18+ only)
✓ **Production-ready** (tested in hero, featured, grid renderers)

## Cuneiform Glyphs

Each vertical maps to a historical Sumerian logogram:

| Vertical | Glyph | Meaning |
|----------|-------|---------|
| shop | 𒃵 | Marketplace, to set in place |
| art | 𒌓 | Light, radiance, beauty |
| wiki | 𒉈 | Archive, thing of record |
| dev | 𒁲 | To craft, to build |
| ai | 𒊮 | Heart, mind, intelligence |
| space | 𒀭 | Heaven, sky, cosmos |
| cloud | 𒅎 | Wind, storm, sky |
| (+ 19 more) | — | — |

**Full list:** See `cuneiform.ts` or `ICON_USAGE.md`

## Integration in 3 Renderers

### Hero (`packages/renderer/renderers/hero-renderer.tsx`)
- **Size:** 64px (large display)
- **Delay:** 1600ms (user sees cuneiform first)
- **Position:** Above category badge
- **Animation:** Slow, smooth flip

### Featured Card (`packages/renderer/renderers/entry-highlight-renderer.tsx`)
- **Size:** 48px (medium)
- **Delay:** 2000ms (long delay for scroll context)
- **Position:** Badge row (with "Featured" + category)
- **Animation:** Leisurely flip

### Grid (`packages/renderer/renderers/entry-grid-renderer.tsx`)
- **Size:** 32px (compact)
- **Delay:** Staggered (1200ms + 100ms × index)
- **Position:** Card header
- **Animation:** Cascading flip effect

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (with emoji fallback if needed)

**Fallback:** `renderIconWithFallback()` uses emoji/ASCII if cuneiform not supported

## Performance

- **Bundle size:** ~12KB (all components + mappings)
- **Rendering:** O(1) fixed DOM per icon
- **Animation:** GPU-accelerated (transform)
- **Tooltip:** No layout shift (absolutely positioned)

## Examples

### Grid with Staggered Flip
```tsx
import { AppChipGrid, getCuneiformByCategory } from '@dds/icons';

const entries = getCuneiformByCategory('commerce');

<AppChipGrid
  entries={entries}
  size={56}
  gap={20}
  flipDelay={800}
  flipStagger={120}
  showLabels={true}
/>
```

### Custom Styling
```tsx
// Theme color inheritance
<div className="text-red-500">
  <AppChip entry={entry} size={64} />
</div>

// Override badge icon
<AppChip
  entry={entry}
  badgeIcon={'🏪'}
  badgeBg="hsl(30 100% 50% / 0.15)"
  badgeBorder="hsl(30 100% 50% / 0.25)"
/>

// No animation
<AppChip
  entry={entry}
  disableAutoFlip={true}
  tooltip={false}
  size={24}
/>
```

### Fallback Rendering
```tsx
import { renderIconWithFallback, getIconMapping } from '@dds/icons';

const mapping = getIconMapping('shop');

// Auto-fallback: cuneiform → emoji → ASCII
const display = renderIconWithFallback(mapping);

// Force emoji
const emoji = renderIconWithFallback(mapping, { preferEmoji: true });
```

## API Reference

### AppChip Props
```typescript
interface AppChipProps {
  entry: CuneiformEntry;           // Glyph data (required)
  size?: number;                   // Size in px (default: 56)
  flipDelay?: number;              // Delay before auto-flip (default: 1400ms)
  flipDuration?: number;           // Flip animation duration (default: 800ms)
  easing?: string;                 // CSS easing (default: cubic-bezier(...))
  badgeIcon?: ReactNode;           // Override back-face icon
  badgeBg?: string;                // Badge background color
  badgeBorder?: string;            // Badge border color
  tooltip?: boolean;               // Show tooltip on hover (default: true)
  flipped?: boolean;               // Controlled flip state
  disableAutoFlip?: boolean;       // Disable auto-flip (default: false)
  onFlip?: (showing) => void;      // Flip callback
  clickToFlip?: boolean;           // Enable click toggle (default: true)
  className?: string;              // CSS class
  style?: CSSProperties;           // Inline styles
}
```

### Utility Functions
```typescript
getCuneiformByTLD(tld: string) → CuneiformEntry | undefined
getCuneiformForDomain(domain: string) → CuneiformEntry | undefined
getCuneiformByCategory(category: string) → CuneiformEntry[]
extractTLD(domain: string) → string
getIconMapping(vertical: string) → IconMapping | undefined
getLucideSuggestion(category: string, index?: number) → string
isCuneiformSupported() → boolean
renderIconWithFallback(mapping: IconMapping, options?: {...}) → string
```

## Documentation

- **[ICON_USAGE.md](./ICON_USAGE.md)** — Complete API reference, rendering guide, troubleshooting
- **[INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md)** — 10 sections with real code from 3 renderers
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** — Deliverables, testing results, performance

## Files

```
packages/icons/
├── AppChip.tsx                    # 3D flip-card component
├── CuneiformIcon.tsx              # Wrapper with presets
├── cuneiform.ts                   # Registry & lookups (26 entries)
├── icon-mappings.ts               # Glyphs + Lucide suggestions + fallbacks
├── index.ts                       # Main exports
├── package.json                   # Package configuration
├── ICON_USAGE.md                  # Comprehensive guide
├── INTEGRATION_EXAMPLES.md        # Code examples
├── IMPLEMENTATION_SUMMARY.md      # Deliverables & testing
└── README.md                      # This file
```

## Theme Colors (9 Palette)

```css
red, orange, yellow, green, blue, purple, pink, gray, slate
```

Apply via parent element:
```tsx
<div className="text-red-500">
  <AppChip entry={entry} />
</div>
```

## Troubleshooting

### Glyphs Don't Render
```typescript
import { isCuneiformSupported } from '@dds/icons';

if (!isCuneiformSupported()) {
  // Use emoji/ASCII fallback
  const display = renderIconWithFallback(mapping, { preferEmoji: true });
}
```

### Animation Stuttering
```tsx
<div style={{ willChange: 'transform' }}>
  <AppChip entry={entry} flipDuration={500} />
</div>
```

### Tooltip Hidden
```tsx
// Ensure parent has sufficient z-index
<div style={{ position: 'relative', zIndex: 10 }}>
  <AppChip entry={entry} tooltip={true} />
</div>
```

See **[ICON_USAGE.md](./ICON_USAGE.md)** for full troubleshooting guide.

## Quick Reference

### Get Started
1. Import AppChip: `import { AppChip, getCuneiformByTLD } from '@dds/icons'`
2. Get entry: `const entry = getCuneiformByTLD('shop')`
3. Render: `<AppChip entry={entry} size={56} />`

### Domain Lookup
```typescript
// By TLD (.shop, .dev, .ai)
getCuneiformByTLD('shop')

// By full domain
getCuneiformForDomain('example.shop')

// By section name
getCuneiformForDomain('wiki')

// By category
getCuneiformByCategory('commerce')
```

### Sizes
- **16–24px:** Badges, text labels
- **32px:** Grid cards (compact)
- **48px:** Featured cards (medium)
- **64px:** Hero sections (large)
- **96px+:** Feature displays (XL)

### Rendering
```typescript
// Cascading fallback
renderIconWithFallback(mapping)  // cuneiform → emoji → ASCII

// Force emoji
renderIconWithFallback(mapping, { preferEmoji: true })

// Force ASCII
renderIconWithFallback(mapping, { preferAscii: true })
```

## License

Part of the DDS Platform (private).

## Credits

- **Cuneiform Unicode:** Unicode Consortium (U+12000–U+12FFF block)
- **Badge icons:** Lucide icon library inspiration
- **3D animation:** CSS Transforms (W3C standard)
- **Integration:** Hero, featured, and grid renderers in DDS Platform

---

**Last updated:** April 24, 2026
**Status:** Production-ready ✓
