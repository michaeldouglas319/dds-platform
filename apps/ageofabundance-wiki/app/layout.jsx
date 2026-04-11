import './globals.css';

export const metadata = {
  title: 'ageofabundance.wiki',
  description:
    'An open, living wiki about the transition from scarcity economics to abundance systems.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" data-theme-variant="minimal">
      <body>{children}</body>
    </html>
  );
}
