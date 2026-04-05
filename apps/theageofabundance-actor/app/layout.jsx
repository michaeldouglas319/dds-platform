export const metadata = {
  title: 'theageofabundance.actor',
  description: 'theageofabundance.actor',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
