import './globals.css';
import { WikiSearch } from '../components/wiki-search.jsx';
import { buildSearchIndex } from '../content/wiki-search.js';

export const metadata = {
  title: 'ageofabundance.wiki',
  description:
    'A living encyclopedia of post-scarcity civilization — concepts, pillars, and open questions of the Age of Abundance.',
};

/** Built once at build/RSC-render time — no runtime cost. */
const searchIndex = buildSearchIndex();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="wiki-skip-link">
          Skip to main content
        </a>
        <header className="wiki-site-header">
          <nav className="wiki-site-header__nav" aria-label="Site">
            <a href="/" className="wiki-site-header__logo">
              ageofabundance.wiki
            </a>
            <WikiSearch index={searchIndex} />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
