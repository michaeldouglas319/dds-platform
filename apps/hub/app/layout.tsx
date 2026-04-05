import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getDomainConfig } from '../config/domains';

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get('host') ?? '';
  const { domain } = getDomainConfig(host);
  return { title: domain, description: domain };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
