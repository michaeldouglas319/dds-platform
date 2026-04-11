import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@dds/renderer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ageofabundance.wiki',
    template: '%s — ageofabundance.wiki',
  },
  description:
    'Open, schema-driven knowledge for the technologies, communities, and ideas of the abundance era.',
};

const DEFAULT_THEME = 'dark' as const;
const DEFAULT_VARIANT = 'minimal' as const;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      data-theme-variant={DEFAULT_VARIANT}
      className={DEFAULT_THEME === 'dark' ? 'dark' : ''}
    >
      <body>
        <ThemeProvider initialTheme={DEFAULT_THEME}>
          <a href="#main" className="skip-to-content">
            Skip to content
          </a>
          <main id="main" className="wiki-main" tabIndex={-1}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
