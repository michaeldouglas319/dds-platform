# DDS Icon System Documentation

## Overview

The DDS icon system maps 25+ domain verticals and brands to **Sumerian cuneiform glyphs** (Unicode U+12000–U+12FFF) with automatic 3D flip-card animations and multi-level fallbacks.

**Key files:**
- `cuneiform.ts` — Master glyph registry and domain mapping utilities
- `icon-mappings.ts` — Glyph + Lucide icon suggestions + HTML entity fallbacks
- `AppChip.tsx` — 3D flip-card component with auto-animate and click-to-flip
- `CuneiformIcon.tsx` — Higher-level wrapper with preset animations

---

## Cuneiform Glyphs (U+12000–U+12FFF)

Each vertical maps to a Sumerian logogram with historical meaning:

| Vertical | Glyph | Code | Sumerian | Meaning |
|----------|-------|------|----------|---------|
| **shop** | 𒃵 | U+120F5 | GAR | Marketplace, to set in place |
| **store** | 𒃻 | U+120FB | GÁ | Storehouse, granary |
| **art** | 𒌓 | U+12313 | UD | Light, radiance, beauty |
| **wiki** | 𒉈 | U+12248 | NÍG | Archive, thing of record |
| **dev** | 𒁲 | U+12072 | DIM | To craft, to build |
| **ai** | 𒊮 | U+122AE | ŠÀ | Heart, mind, intelligence |
| **space** | 𒀭 | U+1202D | AN | Heaven, sky, cosmos |
| **agency** | 𒂍 | U+1208D | É | House, estate, organization |
| **cloud** | 𒅎 | U+1214E | IM | Wind, storm, sky |
| **net** | 𒊓 | U+12293 | SA | Net, sinew, connection |
| **asia** | 𒆠 | U+121A0 | KI | Earth, land, place |
| **xyz** | 𒌋 | U+1230B | U | Totality, the whole |

**Full registry:** See `CUNEIFORM` object in `cuneiform.ts` (25 entries)

---

## AppChip Component

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

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entry` | `CuneiformEntry` | — | Cuneiform glyph data (required) |
| `size` | `number` | `56` | Size in px (16–128) |
| `borderRadius` | `number` | `14` | Corner radius of badge |
| `flipDelay` | `number` | `1400` | Delay before auto-flip (ms) |
| `flipDuration` | `number` | `800` | Duration of flip animation (ms) |
| `easing` | `string` | `cubic-bezier(0.4, 0, 0.2, 1)` | CSS easing function |
| `badgeIcon` | `ReactNode` | — | Override badge icon (back face) |
| `badgeBg` | `string` | — | Badge background color |
| `badgeBorder` | `string` | — | Badge border color |
| `tooltip` | `boolean` | `true` | Show tooltip on hover |
| `flipped` | `boolean` | `false` | Controlled flip state |
| `disableAutoFlip` | `boolean` | `false` | Disable auto-flip animation |
| `onFlip` | `(showing) => void` | — | Callback when flip completes |
| `clickToFlip` | `boolean` | `true` | Enable click-to-flip toggle |

### 3D Flip Animation

AppChip uses CSS `preserve-3d` and `backfaceVisibility: hidden` to create a smooth 3D card flip:

1. **Front face** (0-180°): Cuneiform glyph
   - Background: `color-mix(in srgb, currentColor 8%, transparent)`
   - Border: `color-mix(in srgb, currentColor 15%, transparent)`

2. **Back face** (180°): Badge SVG icon
   - Background: `color-mix(in srgb, currentColor 12%, transparent)`
   - Border: `color-mix(in srgb, currentColor 25%, transparent)`
   - Rendered counter-rotated to appear upright

3. **Timing**:
   - Delay: `flipDelay` (default 1400ms, allows user to see cuneiform first)
   - Duration: `flipDuration` (default 800ms)
   - Easing: Smooth cubic-bezier for natural motion

### Theme Integration

AppChip inherits color from `currentColor` and uses CSS color-mixing for subtle backgrounds:

```css
/* Theme color variable must be set on parent */
[data-theme="red"] {
  color: var(--color-red-500);
}

/* AppChip computes accent automatically */
--color-brand-primary: var(--color-red-500);
--color-brand-accent: color-mix(in srgb, var(--color-red-500) 40%, var(--color-gray-900));
```

### Example: Renderer Integration

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

---

## AppChipGrid Component

Display multiple cuneiform icons in a responsive grid with staggered flip animations:

```tsx
import { AppChipGrid, getCuneiformByCategory } from '@dds/icons';

const entries = getCuneiformByCategory('commerce');

<AppChipGrid
  entries={entries}
  size={56}
  gap={20}
  flipDelay={800}
  flipStagger={120}
  flipDuration={800}
  showLabels={true}
/>
```

**Props:**
- `entries`: Array of `CuneiformEntry`
- `size`: Icon size in px
- `gap`: Grid gap
- `flipStagger`: Delay between each icon's flip (ms)
- `onChipClick`: Callback for click events
- `showLabels`: Display `.vertical` label below each icon

---

## Icon Mappings

### ICON_MAPPINGS Registry

Maps each vertical to cuneiform glyph + Lucide suggestions + fallbacks:

```typescript
interface IconMapping {
  glyph: string;              // U+12000 character
  name: string;               // Sumerian transliteration
  meaning: string;            // English definition
  lucideIcon: string;         // Suggested icon (kebab-case)
  entityFallback?: string;    // Emoji: '🛍️'
  asciFallback?: string;      // ASCII: '[S]'
  description: string;        // Tooltip text
}
```

**Usage:**

```tsx
import { ICON_MAPPINGS, getIconMapping } from '@dds/icons';

const mapping = getIconMapping('shop');
console.log(mapping.glyph);        // '𒃵'
console.log(mapping.lucideIcon);   // 'store'
console.log(mapping.entityFallback); // '🛍️'
```

### Lucide Icon Suggestions

For environments that can't render cuneiform glyphs, each vertical includes a Lucide icon suggestion:

```typescript
LUCIDE_ICON_SUGGESTIONS = {
  commerce: ['store', 'shopping-cart', 'package', 'box', 'warehouse', 'gift', 'truck'],
  creative: ['palette', 'paintbrush', 'camera', 'film', 'music', 'feather', 'sparkles'],
  knowledge: ['book-open', 'book', 'file-text', 'database', 'layers', 'map', 'search'],
  // ...
}
```

**Usage:**

```tsx
import { getLucideSuggestion } from '@dds/icons';

const icon = getLucideSuggestion('commerce', 0); // 'store'
```

### HTML Entity Fallbacks

For minimal/legacy environments:

```typescript
ENTITY_FALLBACKS = {
  arrow: '→',
  checkmark: '✓',
  copyright: '©',
  infinity: '∞',
  // ...
}
```

---

## Cuneiform Rendering

### Browser Support

Cuneiform glyphs from Unicode block U+12000–U+12FFF require:
- **Fonts**: Segoe UI Symbol, Arial Unicode MS, Noto Sans Cuneiform
- **Browsers**: All modern browsers (tested Chrome, Firefox, Safari, Edge)
- **Fallback detection**: Use `isCuneiformSupported()` to check at runtime

### Sizing & Typography

```css
/* Minimum size for readable glyphs */
.cuneiform-glyph {
  font-size: 32px;           /* 24px minimum, 128px maximum */
  font-family: "Segoe UI Symbol", "Arial Unicode MS", sans-serif;
  line-height: 1;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Color inheritance via currentColor */
color: currentColor; /* Theming hook */
```

### Rendering Helper

```tsx
import { renderIconWithFallback } from '@dds/icons';

// Cascading fallback: cuneiform → emoji → ASCII
const display = renderIconWithFallback(mapping);

// Force fallback
const emoji = renderIconWithFallback(mapping, { preferEmoji: true });
const ascii = renderIconWithFallback(mapping, { preferAscii: true });
```

---

## Theme Colors (9-Color Palette)

AppChip supports all 9 DDS theme colors via CSS custom properties:

```css
:root {
  --color-red-500: hsl(0, 100%, 50%);
  --color-orange-500: hsl(30, 100%, 50%);
  --color-yellow-500: hsl(60, 100%, 50%);
  --color-green-500: hsl(120, 100%, 50%);
  --color-blue-500: hsl(240, 100%, 50%);
  --color-purple-500: hsl(270, 100%, 50%);
  --color-pink-500: hsl(330, 100%, 50%);
  --color-gray-500: hsl(0, 0%, 50%);
  --color-slate-500: hsl(220, 13%, 50%);
}
```

**Theme variant application:**

```tsx
// Apply theme color to parent
<div className="text-red-500">
  <AppChip entry={entry} />
</div>

// Or use data attribute
<div data-theme="blue">
  <AppChip entry={entry} />
</div>
```

---

## Integration Examples

### 1. Entry Highlight (Featured Card)

```tsx
// packages/renderer/renderers/entry-highlight-renderer.tsx
import { getCuneiformForDomain, AppChip } from '@dds/icons';

export function EntryHighlightRenderer({ section }: RendererProps) {
  const cuneiformEntry = getCuneiformForDomain(section.name);

  return (
    <article>
      {cuneiformEntry && (
        <div className="text-red-400">
          <AppChip entry={cuneiformEntry} size={48} flipDelay={2000} />
        </div>
      )}
      {/* ... rest of card ... */}
    </article>
  );
}
```

### 2. Entry Grid (Card Collection)

```tsx
// Render small icons with staggered flip
items.map((item, i) => (
  <div key={item.id}>
    {cuneiformEntry && (
      <AppChip
        entry={cuneiformEntry}
        size={32}
        flipDelay={1200 + i * 100}
        flipDuration={500}
      />
    )}
  </div>
))
```

### 3. Hero Section (Large Display)

```tsx
// Hero with large icon
<section>
  {cuneiformEntry && (
    <AppChip entry={cuneiformEntry} size={64} flipDelay={1600} />
  )}
</section>
```

---

## Testing & Verification

### Cuneiform Rendering Test

```tsx
import { isCuneiformSupported, CUNEIFORM_LIST } from '@dds/icons';

// Runtime check
if (isCuneiformSupported()) {
  console.log('✓ Cuneiform glyphs supported');
} else {
  console.log('✗ Using emoji fallbacks');
}

// Verify all glyphs render
CUNEIFORM_LIST.forEach((entry) => {
  console.log(`${entry.vertical}: ${entry.glyph} (${entry.codepoint})`);
});
```

### Theme Color Coverage

Test all 9 colors across renderers:

```tsx
const THEME_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray', 'slate'];

THEME_COLORS.forEach((color) => {
  const entry = getCuneiformByTLD('shop');
  render(
    <div className={`text-${color}-500`}>
      <AppChip entry={entry} />
    </div>
  );
});
```

### Flip Animation Verification

- [ ] Cuneiform visible on load
- [ ] Auto-flip after delay
- [ ] Badge icon appears on flip
- [ ] Hover shows tooltip with name + meaning
- [ ] Click toggles flip manually
- [ ] Multiple icons stagger correctly in grid

---

## Performance Notes

**Bundle size:** ~12KB (cuneiform.ts + AppChip.tsx + icon-mappings.ts)

**Rendering:**
- AppChip uses `transform: rotateY()` (GPU-accelerated)
- No layout shift on flip (fixed dimensions)
- Tooltip positioned absolutely (no impact on flow)

**Optimization tips:**
- Lazy-load icon mappings if only needed in specific sections
- Memoize `getCuneiformForDomain()` calls in list renderers
- Use `disableAutoFlip={true}` for grid items (user-triggered flip only)

---

## Troubleshooting

### Glyphs Don't Render

**Symptom:** See placeholder box or question mark instead of cuneiform

**Solution:**
1. Check browser support: `isCuneiformSupported()`
2. Verify font stack: Segoe UI Symbol or Noto Sans Cuneiform installed
3. Check font-size ≥ 24px
4. Enable antialiasing: `-webkit-font-smoothing: antialiased`
5. Use `renderIconWithFallback()` for emoji fallback

### Flip Animation Jittery

**Symptom:** 3D rotation feels stuttered or jumps

**Solution:**
1. Reduce `flipDuration` (default 800ms is safe)
2. Check if parent has `will-change: transform`
3. Verify `backfaceVisibility: hidden` is applied
4. Test in Chrome DevTools (disable GPU if needed)

### Tooltip Not Showing

**Symptom:** Tooltip hidden behind other elements

**Solution:**
1. Verify parent has sufficient z-index context
2. Check tooltip has `z-index: 50` (increase if needed)
3. Ensure parent doesn't have `overflow: hidden`
4. Set `tooltip={true}` explicitly in props

### Theme Color Not Applying

**Symptom:** AppChip stays gray/neutral

**Solution:**
1. Verify parent has `color: var(--color-xxx-500)`
2. Check CSS custom properties are defined
3. Inspect `currentColor` in DevTools
4. Test with explicit `badgeBg` and `badgeBorder` props

---

## Future Extensions

- [ ] Add SVG glyph variants (thin, bold, mono)
- [ ] Cuneiform text input (translit → glyph lookup)
- [ ] Interactive glyph picker for authoring
- [ ] Haptic feedback on flip (mobile)
- [ ] WebGL variant for high-performance grids (1000+ icons)
- [ ] Accessibility: ARIA labels for cuneiform meaning
