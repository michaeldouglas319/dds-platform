import './globals.css';

export const metadata = {
  title: 'ageofabundance.wiki',
  description:
    'A living, parametric encyclopedia of the post-scarcity transition.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
