import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import GlobalNav from '@/components/GlobalNav';
import Neko from '@/components/Neko';
import { BASE_PATH, FONTS_URL } from '@/lib/site';
import './globals.css';

// Site icons live in public/ (generated from icons/*.svg by scripts/make-icons.mjs). Metadata URLs are not
// basePath-prefixed by Next.js, so BASE_PATH is added here.
export const metadata: Metadata = {
  title: 'ISC2 CC Study Hub',
  icons: {
    icon: [
      { url: `${BASE_PATH}/favicon.ico`, sizes: '16x16 32x32 48x48' },
      { url: `${BASE_PATH}/icon.svg`, type: 'image/svg+xml' },
    ],
    apple: [{ url: `${BASE_PATH}/apple-touch-icon.png`, sizes: '180x180' }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONTS_URL} rel="stylesheet" />
      </head>
      <body>
        <GlobalNav />
        {children}
        <Neko />
      </body>
    </html>
  );
}
