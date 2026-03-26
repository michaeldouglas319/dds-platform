# Blackdot Dev Showcase - Quick Start

The **Blackdot Dev** app now features an extensive, modular section showcase with live theme variant switching.

## 🚀 Access the Showcase

**Local Development:**
```bash
cd apps/blackdot-dev
pnpm dev
```

Then visit:
- Home: `http://localhost:3000/` → Click "View Component Showcase →"
- Direct: `http://localhost:3000/showcase`

## 🎨 Theme Variants (9 Available)

Click any color circle at the top-right to switch:

| Variant | Colors | Feel |
|---------|--------|------|
| **minimal** (default for some) | Black/Gray | Professional, clean |
| **vibrant** | Pink/Cyan | Bold, energetic |
| **neon** | Lime/Magenta | Cyberpunk, gaming |
| **arctic** | Blue/Sky | Fresh, tech |
| **sunset** (default for blackdot-dev) | Orange/Gold | Warm, creative |
| **forest** | Green/Mint | Natural, organic |
| **midnight** ← Current default | Purple/Violet | Cosmic, elegant |
| **mist** | Gray/Light Gray | Calm, minimal |
| **monochrome** | Black/White | Maximum contrast |

## 🌙 Light/Dark Toggle

Click the ☀️/🌙 button in the top-left to toggle between light and dark modes.

## 📊 What You See

### Header Section
- **Title & Subtitle** - App name and description
- **Theme Toggle** - Light/dark mode switch (🌙/☀️)
- **Variant Switcher** - 9 colored circles for theme selection
- **Dashboard Stats** - Section count, current variant, available variants

### Section Cards (Grid Layout)
Each section displays:
1. **Header** - Section #, title, type badge
2. **Preview** - Live rendered component
3. **Metadata** - ID, type, name, layout details
4. **JSON Toggle** - Collapsible raw JSON configuration

### Footer
- App name and section count
- Helpful description

## 🔧 Adding Sections

Edit `apps/blackdot-dev/data/site.config.json`:

```json
{
  "pages": [
    {
      "sections": [
        {
          "id": "my-section",
          "type": "section",
          "name": "my-section",
          "subject": { "title": "Section Title" },
          "content": { "body": "Content here..." },
          "display": { "layout": "centered-text" }
        }
      ]
    }
  ]
}
```

New sections automatically appear in the showcase!

## 💡 Key Features

✅ **Modular Grid Layout** - Responsive card-based design
✅ **Live Rendering** - See actual components in action
✅ **Theme Switching** - Instant preview across all 9 variants
✅ **JSON Inspector** - Understand section configuration
✅ **Dark Mode** - Toggle between light and dark
✅ **Persistent Settings** - Preferences saved to localStorage
✅ **Mobile Responsive** - Works on all screen sizes
✅ **Developer Friendly** - Section indexing and metadata

## 📁 File Structure

```
apps/blackdot-dev/
├── app/
│   ├── layout.tsx              # Root layout (ThemeProviderV2)
│   ├── page.tsx                # Home page (with showcase link)
│   ├── globals.css             # Global styles
│   └── showcase/
│       ├── page.tsx            # Main showcase component
│       └── showcase.module.css # Showcase styles
├── data/
│   └── site.config.json        # Sections & config
└── SHOWCASE_README.md          # Full documentation
```

## 🎯 Use Cases

1. **Component Library** - Show off all available sections
2. **Design System Explorer** - Test themes and styles
3. **Theme Showcase** - Preview all 9 variants instantly
4. **Section Debugger** - Inspect section JSON configuration
5. **Developer Onboarding** - Help new devs understand the system
6. **Client Demos** - Show design variations interactively

## 🔗 Navigation

- **Home Page** → Click "View Component Showcase →"
- **Showcase Page** → Shows all sections in grid
- **Direct URL** → `/showcase`

## 🎨 Styling

All styles use CSS custom properties that update based on the theme variant:

```css
--color-brand-primary              /* Main color */
--color-brand-accent               /* Accent color */
--color-brand-background-light     /* Light background */
--color-brand-background-dark      /* Dark background */
--color-brand-text-light           /* Light text */
--color-brand-text-dark            /* Dark text */
--color-brand-border-light         /* Light border */
--color-brand-border-dark          /* Dark border */
--color-interactive-hover          /* Hover state */
--color-interactive-active         /* Active state */
--color-interactive-disabled       /* Disabled state */
```

## 🚨 Troubleshooting

**Showcase doesn't load?**
- Check `data/site.config.json` syntax
- Run `pnpm dev` from the app directory
- Check browser console for errors

**Theme not switching?**
- Ensure CSS import is present in layout
- Check browser supports CSS custom properties
- Clear localStorage and reload

**Sections not appearing?**
- Add sections to `site.config.json`
- Ensure `pages[].sections` array is populated
- Restart dev server

## 📚 Learn More

- **Theme System**: See `packages/renderer/THEMES.md`
- **DDS Renderer**: See `packages/renderer/README.md`
- **Full Showcase Docs**: See `SHOWCASE_README.md` in blackdot-dev

## 🎯 Next Steps

1. Start the dev server: `pnpm dev`
2. Visit: `http://localhost:3000/showcase`
3. Try switching themes with the color circles
4. Toggle light/dark mode
5. Click "View JSON" on any section to see the config
6. Add your own sections to `site.config.json`

## ✨ Pro Tips

- **Hover** over cards for visual feedback
- **Click** color circles to see instant theme change
- **Collapsible JSON** helps understand section structure
- **Responsive** design works great on mobile
- **Persistent** preferences - your theme choice is saved!

---

**Enjoy exploring the showcase!** 🚀
