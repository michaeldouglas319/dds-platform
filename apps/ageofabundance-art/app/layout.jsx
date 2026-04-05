export const metadata = {
  title: 'ageofabundance.art',
  description: 'ageofabundance.art',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
