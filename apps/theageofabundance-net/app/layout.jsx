export const metadata = {
  title: 'theageofabundance.net',
  description: 'theageofabundance.net',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
