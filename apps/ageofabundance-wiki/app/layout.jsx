import './globals.css';

export const metadata = {
  title: 'ageofabundance.wiki',
  description:
    'A living encyclopedia of post-scarcity civilization — concepts, pillars, and open questions of the Age of Abundance.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="wiki-skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
