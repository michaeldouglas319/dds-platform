import './globals.css';

export const metadata = {
  title: 'ageofabundance.wiki',
  description:
    'A living, plugin-driven wiki built on the DDS UniversalSection schema.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
