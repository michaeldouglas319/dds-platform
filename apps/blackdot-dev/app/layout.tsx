import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { BreadcrumbProvider, NavigationVisibilityProvider } from '@/lib/contexts'
import { LoadingProvider } from '@/lib/contexts/LoadingContext'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { QueryProvider } from '@/lib/providers/query-provider'
import { AppShell } from '@/components/navigation'
import { ThemeProvider } from '@/components/theme-provider'
import { RouteTracker } from '@/lib/hooks/useRouteTracking'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = GeistSans

const geistMono = GeistMono

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <AuthProvider>
                <LoadingProvider minLoadingTime={300} debounceTime={150}>
                  <BreadcrumbProvider>
                    <NavigationVisibilityProvider>
                    <RouteTracker />
                    <AppShell>{children}</AppShell>
                    <Toaster richColors position="top-right" />
                    </NavigationVisibilityProvider>
                  </BreadcrumbProvider>
                </LoadingProvider>
              </AuthProvider>
            </ThemeProvider>
            <Analytics />
          </body>
        </html>
      </QueryProvider>
    </ClerkProvider>
  )
}
