export const metadata = {
  title: 'theageofabundance.agency',
  description: 'theageofabundance.agency',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
