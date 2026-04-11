import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: {
    default: 'ageofabundance.wiki',
    template: '%s · ageofabundance.wiki',
  },
  description:
    'A working-definition wiki for the Age of Abundance — its curves, inversions, and primitives.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="wiki-skip-link" href="#main-content">
          Skip to main content
        </a>
        <div className="wiki-shell">
          <header className="wiki-header" role="banner">
            <div className="wiki-header__inner">
              <Link
                href="/"
                className="wiki-header__brand"
                aria-label="ageofabundance.wiki — home"
              >
                ageofabundance.wiki
              </Link>
              <nav
                className="wiki-header__nav"
                aria-label="Primary navigation"
              >
                <Link href="/">Index</Link>
                <Link href="/wiki/age-of-abundance">Start here</Link>
              </nav>
            </div>
          </header>
          <main id="main-content" role="main" tabIndex={-1}>
            {children}
          </main>
          <footer className="wiki-footer" role="contentinfo">
            <p>
              Built on the <strong>@dds/renderer</strong> Universal Section
              schema. Content is parametric; rendering is plugin-driven.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
