# Blackdot Dev - Section Showcase

A comprehensive, modular component showcase for the Blackdot Dev platform that demonstrates all available sections with live theme variant switching.

## Features

### 🎨 Theme Variant System
- **9 Theme Variants** instantly switchable:
  - Minimal (clean, professional)
  - Vibrant (bold, energetic)
  - Neon (cyberpunk, high-contrast)
  - Arctic (cool blues)
  - Sunset (warm oranges/golds)
  - Forest (natural greens)
  - Midnight (cosmic purples) ← Default for blackdot-dev
  - Mist (calm grays)
  - Monochrome (pure B&W)

- **Light/Dark Mode** toggle
- **Live CSS Variable Updates** - theme changes apply instantly
- **Persistent User Preferences** - stored in localStorage

### 📺 Modular Showcase
- **Card-Based Layout** - each section in its own card
- **Live Preview** - renders actual components using DDS renderer
- **Metadata Display** - shows section ID, type, name, layout
- **JSON Inspector** - collapsible raw JSON for each section
- **Grid Layout** - responsive, auto-fills available space

### 📊 Dashboard Stats
- Total sections count
- Current theme variant
- Available theme variants
- Real-time updates

### 🔧 Developer Features
- Section index numbers for quick reference
- Type badges for easy identification
- Complete JSON inspection
- Responsive design for all screen sizes

## File Structure

```
app/
├── layout.tsx                    # Root layout with ThemeProviderV2
├── page.tsx                      # Home page with showcase link
├── globals.css                   # Global styles + theme variables
├── showcase/
│   ├── page.tsx                  # Main showcase component
│   └── showcase.module.css       # Showcase-specific styles
└── data/
    └── site.config.json          # App config with sections

SHOWCASE_README.md               # This file
```

## Usage

### Accessing the Showcase

1. **From Home Page**: Click "View Component Showcase →" button in the hero
2. **Direct URL**: Navigate to `/showcase` on your development server
3. **Local Development**: `http://localhost:3000/showcase`

### Theme Switching

**Top Header Controls:**
- 🌙/☀️ Button - Toggle between light and dark mode
- Color Circles - Click any circle to switch theme variant

### Viewing Section Details

Each card shows:
1. **Header**: Section title, type badge, and index number
2. **Preview**: Live-rendered component using DDS SectionRenderer
3. **Metadata**: ID, type, name, and layout information
4. **JSON**: Click "View JSON" to see raw section configuration

## Adding Sections

Edit `data/site.config.json` to add new sections:

```json
{
  "pages": [
    {
      "sections": [
        {
          "id": "my-section",
          "type": "section",
          "name": "my-section",
          "subject": { "title": "My Section Title" },
          "content": { "body": "Content here..." },
          "display": { "layout": "centered-text" }
        }
      ]
    }
  ]
}
```

New sections automatically appear in the showcase!

## Styling

### CSS Variables Available

All theme variants expose these CSS custom properties:

```css
--color-brand-primary              /* Main brand color */
--color-brand-accent               /* Accent color */
--color-brand-secondary            /* Secondary color */
--color-brand-background-light     /* Light mode background */
--color-brand-background-dark      /* Dark mode background */
--color-brand-text-light           /* Light mode text */
--color-brand-text-dark            /* Dark mode text */
--color-brand-border-light         /* Light mode border */
--color-brand-border-dark          /* Dark mode border */
--color-interactive-hover          /* Hover state */
--color-interactive-active         /* Active state */
--color-interactive-disabled       /* Disabled state */
```

### Custom Component Styling

Use CSS modules or CSS-in-JS with the showcase module:

```css
/* showcase.module.css */
.myComponent {
  color: var(--color-brand-primary);
  background: var(--color-brand-background-light);
  border: 1px solid var(--color-brand-border-light);
}

html.dark .myComponent {
  background: var(--color-brand-background-dark);
  border-color: var(--color-brand-border-dark);
}
```

## Component Hierarchy

```
RootLayout (with ThemeProviderV2)
├── ShowcasePage
│   ├── Header
│   │   ├── Title Area
│   │   └── Controls
│   │       ├── Theme Toggle
│   │       └── Variant Switcher (compact)
│   ├── Stats Panel
│   │   ├── Total Sections
│   │   ├── Current Variant
│   │   └── Available Variants
│   ├── Main Showcase Grid
│   │   └── ShowcaseCard (x N sections)
│   │       ├── Card Header
│   │       ├── Card Preview (SectionBatchRenderer)
│   │       └── Card Details
│   │           ├── Metadata Grid
│   │           └── JSON Inspector
│   └── Footer
```

## Performance Notes

- **Lazy Rendering**: Cards rendered in viewport
- **CSS Transitions**: Smooth theme switching
- **LocalStorage**: Minimal overhead for persistence
- **Module CSS**: Scoped styles prevent conflicts

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Development

### Start Development Server

```bash
cd apps/blackdot-dev
pnpm dev
```

Visit `http://localhost:3000/showcase`

### Building

```bash
pnpm build
```

### Type Checking

```bash
pnpm lint
```

## Section Types Supported

- `intro` - Introduction/hero sections
- `section` - Standard content sections
- `showcase` - Showcase/gallery sections
- Custom types via DDS renderer registry

See `@dds/renderer` documentation for complete section types.

## Troubleshooting

### Sections not appearing?
- Check `data/site.config.json` syntax
- Ensure sections array is populated
- Check browser console for errors

### Theme not changing?
- Make sure CSS import is present: `@dds/renderer/lib/themes/theme-variants.css`
- Check `data-theme-variant` attribute on `<html>`
- Verify localStorage is enabled

### Styles not applying?
- Check CSS variables are defined for the variant
- Ensure `ThemeProviderV2` is in layout
- Clear browser cache and localStorage

## API Integration

The showcase component uses:
- `SectionBatchRenderer` - renders multiple sections
- `useThemeVariants()` - hook for theme control
- `getAllThemeVariants()` - get all available variants
- `ThemeVariantSwitcherCompact` - UI component for switching

See `@dds/renderer` package for complete API.

## Next Steps

1. ✅ Add more sections to `site.config.json`
2. ✅ Customize theme variants
3. ✅ Add navigation structure
4. ✅ Create page-specific variants
5. ✅ Export as reusable component library

## Questions or Issues?

See the main DDS platform documentation or check the `@dds/renderer` package THEMES.md.
