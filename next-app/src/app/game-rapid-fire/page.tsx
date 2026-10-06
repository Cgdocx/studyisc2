import type { Metadata } from 'next';
import RapidFire from '@/components/games/RapidFire';
import data from '@/data/games/rapid-fire.json';
import '@/styles/games/rapid-fire.css';
import '@/styles/games/motion.css';

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
};

export default function RapidFirePage() {
  return <RapidFire />;
}
