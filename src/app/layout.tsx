import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { AuthSessionProvider } from '@/providers/SessionProvider';
import { RouteProgressBar } from '@/components/common/RouteProgressBar';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#8B2635',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'CogniPath AI',
    template: '%s · CogniPath AI',
  },
  description:
    'Adaptive learning platform for software engineers featuring AI-synthesized syllabi, sandboxed code execution, and real-time diagnostic feedback.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CogniPath AI',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    title: 'CogniPath AI · Adaptive Learning Infrastructure',
    description:
      'Master software engineering through AI-synthesized syllabi, sandboxed practice challenges, and real-time diagnostic feedback.',
    url: 'https://cognipath.ai',
    siteName: 'CogniPath AI',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'CogniPath AI Emblem',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CogniPath AI',
    description: 'Adaptive learning platform for software engineers',
    images: ['/icon-512.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F9F7F2] dark:bg-[#121210] text-[#121212] dark:text-[#F4F2EC]">
        <AuthSessionProvider>
          <Suspense fallback={null}>
            <RouteProgressBar />
          </Suspense>
          {children}
          <Toaster richColors position="top-right" />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
