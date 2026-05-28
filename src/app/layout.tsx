
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'CRACKLIX | Punjab Govt Exam Mastery',
  description: 'The elite learning ecosystem for Punjab Civil Services, Punjab Police, and PSSSB exams. Featuring AI Performance Coaching and CBT simulations.',
  keywords: ['Punjab Exams', 'PPSC', 'PSSSB', 'Punjab Police Prep', 'Mock Tests', 'AI Coaching'],
  openGraph: {
    title: 'CRACKLIX | High-Performance Learning',
    description: 'Elevate your study game with AI-powered performance coaching.',
    type: 'website',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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
