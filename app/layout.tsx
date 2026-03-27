import type { Metadata } from 'next';
import './globals.css';
import { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { PayPalProvider } from '@/components/providers/PayPalProvider';
import { NotificationProvider } from '@/components/providers/NotificationProvider';
import { LiveChatWidget } from '@/components/support/LiveChatWidget';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'https://rsplatform.gg'),
  title: {
    default: 'RSPlatform | Premium OSRS Marketplace',
    template: '%s | RSPlatform'
  },
  description: 'The premium marketplace for Old School RuneScape assets, currency, and professional boosting services.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rsplatform.gg',
    siteName: 'RSPlatform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RSPlatform Marketplace'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RSPlatform | Premium OSRS Marketplace',
    description: 'The premium marketplace for Old School RuneScape assets, currency, and professional boosting services.',
    images: ['/og-image.png']
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-zinc-950 text-zinc-100 antialiased">
        <AuthProvider>
          <NotificationProvider>
            <PayPalProvider>
              <div className="relative flex min-h-screen flex-col">
                <Suspense fallback={<div className="h-20 bg-zinc-950 border-b border-white/5" />}>
                  <Navbar />
                </Suspense>
                <main className="flex-1">{children}</main>
                <Footer />
                <LiveChatWidget />
              </div>
            </PayPalProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
