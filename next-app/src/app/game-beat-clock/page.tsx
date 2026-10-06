import type { Metadata } from 'next';
import BeatClock from '@/components/games/BeatClock';
import data from '@/data/games/beat-clock.json';
import '@/styles/games/beat-clock.css';
import '@/styles/games/motion.css';

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
};

export default function BeatClockPage() {
  return <BeatClock />;
}
