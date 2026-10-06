import type { Metadata } from 'next';
import PhishDetect from '@/components/games/PhishDetect';
import data from '@/data/games/phish-detect.json';
import '@/styles/games/phish-detect.css';
import '@/styles/games/motion.css';

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
};

export default function PhishDetectPage() {
  return <PhishDetect />;
}
