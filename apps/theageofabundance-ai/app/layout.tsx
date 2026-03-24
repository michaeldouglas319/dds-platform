import type { Metadata } from 'next';
import { ThemeProvider } from '@dds/renderer';
import { GravityBackground } from '../components/gravity-particles/gravity-background';
import siteConfig from '../data/site.config.json';
import './globals.css';

export const metadata: Metadata = {
  title: siteConfig.app.name,
  description: siteConfig.app.description,
};

const theme = (siteConfig.app.defaultTheme as 'light' | 'dark') || 'dark';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme={theme} className={theme === 'dark' ? 'dark' : ''}>
      <body>
        <GravityBackground />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
        </div>
      </body>
    </html>
  );
}
