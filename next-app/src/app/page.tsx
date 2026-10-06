import type { Metadata, Viewport } from 'next';
import MindMap from '@/components/mindmap/MindMap';
import data from '@/data/content/mindmap.json';
import '@/styles/mindmap.css';

const m = data.metas as Record<string, string>;

export const metadata: Metadata = {
  title: data.title,
  description: m.description,
  keywords: m.keywords,
  authors: [{ name: m.author }],
  openGraph: {
    type: 'website',
    url: m['og:url'],
    title: m['og:title'],
    description: m['og:description'],
    siteName: m['og:site_name'],
    locale: m['og:locale'],
  },
  twitter: {
    card: 'summary_large_image',
    title: m['twitter:title'],
    description: m['twitter:description'],
  },
  other: { 'twitter:url': m['twitter:url'] },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: m['theme-color'],
};

export default function MindMapPage() {
  return <MindMap />;
}
