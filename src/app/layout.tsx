import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { LocaleProvider } from '@/app/lib/i18n-context';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: 'CRACKLIX | Punjab’s AI-Powered Government Exam Platform',
  description: 'The elite learning ecosystem for PPSC, Punjab Police, and PSSSB exams. Featuring AI Performance Coaching, Bilingual (Punjabi + English) CBT simulations, and real-time District Rankings.',
  keywords: ['Punjab Exams', 'PPSC PCS', 'PSSSB Clerk', 'Punjab Police SI Prep', 'Mock Tests Punjab', 'AI Coaching', 'Punjab GK', 'Punjabi Language Exam'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CRACKLIX',
  },
  openGraph: {
    title: 'CRACKLIX | Master Punjab Govt Exams',
    description: 'Bilingual AI-powered preparation for Punjab Civil Services and Police exams.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'CRACKLIX',
  }
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
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <FirebaseClientProvider>
          <AuthProvider>
            <LocaleProvider>
              {children}
              <Toaster />
            </LocaleProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
