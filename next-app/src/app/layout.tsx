import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import GlobalNav from '@/components/GlobalNav';
import Neko from '@/components/Neko';
import { FONTS_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: 'ISC2 CC Study Hub',
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
