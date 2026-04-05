export const metadata = {
  title: 'theageofabundance.store',
  description: 'theageofabundance.store',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
