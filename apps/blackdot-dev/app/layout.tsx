import type { Metadata } from 'next';
import { ThemeProviderV2 } from '@dds/renderer';
import '@dds/renderer/lib/themes/theme-variants.css';
import siteConfig from '../data/site.config.json';
import './globals.css';

export const metadata: Metadata = {
  title: siteConfig.app.name,
  description: siteConfig.app.description,
};

const theme = (siteConfig.app.defaultTheme as 'light' | 'dark') || 'dark';
const variant = (siteConfig.app as any).themeVariant || 'minimal';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme={theme} data-theme-variant={variant} className={theme === 'dark' ? 'dark' : ''}>
      <body>
        <ThemeProviderV2 initialTheme={theme} initialVariant={variant}>
          {children}
        </ThemeProviderV2>
      </body>
    </html>
  );
}
