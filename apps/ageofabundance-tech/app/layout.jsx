export const metadata = {
  title: 'ageofabundance.tech',
  description: 'ageofabundance.tech',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
