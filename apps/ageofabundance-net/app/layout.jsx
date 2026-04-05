export const metadata = {
  title: 'ageofabundance.net',
  description: 'ageofabundance.net',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
