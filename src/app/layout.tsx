
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: 'CRACKLIX | Master Punjab Government Exams with AI',
  description: 'The elite learning ecosystem for Punjab Civil Services, Punjab Police, and PSSSB exams. Featuring AI Performance Coaching, CBT simulations, and real-time rankings.',
  keywords: ['Punjab Exams', 'PPSC', 'PSSSB', 'Punjab Police Prep', 'Mock Tests', 'AI Coaching', 'Punjab GK'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CRACKLIX',
  },
  openGraph: {
    title: 'CRACKLIX | High-Performance Learning Ecosystem',
    description: 'Elevate your prep with AI-powered coaching and Punjab-specific simulations.',
    url: 'https://cracklix.in',
    siteName: 'CRACKLIX',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CRACKLIX | AI Punjab Exam Mastery',
    description: 'Master Punjab Govt Exams with the elite AI performance ecosystem.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
