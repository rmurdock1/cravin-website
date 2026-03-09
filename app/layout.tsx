import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { ThemeProvider } from '@/lib/theme-context';
import { SkipLink } from '@/components/layout/SkipLink';
import { StickyOrderButton } from '@/components/layout/StickyOrderButton';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Cravin Jamaican Cuisine | Authentic Jamaican Food in New York',
    template: '%s | Cravin Jamaican Cuisine',
  },
  description: 'Authentic Jamaican cuisine at 3 New York locations. Jerk chicken, oxtail, ackee & saltfish, catering for events. Order online for pickup or delivery.',
  keywords: ['Jamaican food', 'jerk chicken', 'Jamaican restaurant New York', 'Caribbean cuisine', 'Ossining', 'White Plains', 'Mount Vernon', 'catering'],
  metadataBase: new URL('https://www.cravinjc.com'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Cravin Jamaican Cuisine',
    images: [{ url: '/img/food-spread.jpeg' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cravinjc',
  },
};

// Inline script to prevent FOUC — sets data-theme before React hydrates
const themeScript = `
(function(){
  var s=localStorage.getItem('cravin-theme');
  if(!s)s=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';
  document.documentElement.setAttribute('data-theme',s);
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className={`${dmSans.variable} ${dmSerifDisplay.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <SkipLink />
          <StickyOrderButton />
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
