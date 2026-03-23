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
  title: 'RSPlatform | Premium OSRS Marketplace',
  description: 'The premium marketplace for Old School RuneScape assets, currency, and professional boosting services.',
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
                <Suspense fallback={<div className="h-20 bg-zinc-950/50 backdrop-blur-xl border-b border-white/5" />}>
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
