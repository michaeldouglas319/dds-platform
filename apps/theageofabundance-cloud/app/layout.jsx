export const metadata = {
  title: 'theageofabundance.cloud',
  description: 'theageofabundance.cloud',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
