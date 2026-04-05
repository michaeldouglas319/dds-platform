export const metadata = {
  title: 'ageofabundance.dev',
  description: 'ageofabundance.dev',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
