import './globals.css';
import { buildSearchIndex } from '../content/wiki-search.js';
import { WikiSearch } from '../components/wiki-search.jsx';

export const metadata = {
  title: 'ageofabundance.wiki',
  description:
    'A living encyclopedia of post-scarcity civilization — concepts, pillars, and open questions of the Age of Abundance.',
};

export default function RootLayout({ children }) {
  const searchEntries = buildSearchIndex();

  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="wiki-skip-link">
          Skip to main content
        </a>
        <header className="wiki-header" role="banner">
          <nav className="wiki-header__nav" aria-label="Site">
            <a href="/" className="wiki-header__logo">
              <span className="wiki-header__dot" aria-hidden="true" />
              <span className="wiki-header__name">ageofabundance.wiki</span>
            </a>
            <div className="wiki-header__actions">
              <a href="/a" className="wiki-header__link">All articles</a>
              <WikiSearch entries={searchEntries} />
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
