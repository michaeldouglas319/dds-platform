import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nanobot Control Center',
  description: 'Autonomous product enhancement dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        <div className="min-h-screen">
          <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold">🤖 Nanobot Control Center</h1>
              <p className="text-slate-400 text-sm">Autonomous product enhancement dashboard</p>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
