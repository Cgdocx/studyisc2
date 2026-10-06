import type { Metadata } from 'next';
import FillGap from '@/components/games/FillGap';
import data from '@/data/games/fill-gap.json';
import '@/styles/games/fill-gap.css';
import '@/styles/games/motion.css';

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
};

export default function FillGapPage() {
  return <FillGap />;
}
