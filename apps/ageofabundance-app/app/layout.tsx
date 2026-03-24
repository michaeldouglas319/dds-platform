import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ThemeProvider } from '@dds/renderer';
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
    <ClerkProvider
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: '#6366f1',
          colorTextOnPrimaryBackground: '#fff',
        },
      }}
    >
      <html lang="en" data-theme={theme} className={theme === 'dark' ? 'dark' : ''}>
        <body>
          <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
