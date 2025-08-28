import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/auth-provider';
import { SocketProvider } from '@/components/socket-provider';
import { AnalyticsProvider } from '@/components/analytics-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EcoAlert - Pollution Intelligence & Emergency Response Suite',
  description: 'Real-time environmental monitoring, AI-powered insights, and emergency response for a healthier planet',
  keywords: ['environmental monitoring', 'air quality', 'pollution', 'emergency response', 'IoT sensors', 'AI analytics'],
  authors: [{ name: 'EcoAlert Team' }],
  creator: 'EcoAlert',
  publisher: 'EcoAlert Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ecoalert.app',
    siteName: 'EcoAlert',
    title: 'EcoAlert - Pollution Intelligence & Emergency Response Suite',
    description: 'Real-time environmental monitoring, AI-powered insights, and emergency response for a healthier planet',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EcoAlert Environmental Monitoring Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EcoAlert - Pollution Intelligence & Emergency Response Suite',
    description: 'Real-time environmental monitoring, AI-powered insights, and emergency response for a healthier planet',
    images: ['/twitter-image.png'],
    creator: '@ecoalertapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#10b981" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SocketProvider>
              <AnalyticsProvider>
                {children}
                <Toaster />
              </AnalyticsProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
