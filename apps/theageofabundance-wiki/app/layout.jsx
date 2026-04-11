import './globals.css';

export const metadata = {
  title: 'theageofabundance.wiki',
  description:
    'A living reference for the ideas, maps, and practices of the age of abundance.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
