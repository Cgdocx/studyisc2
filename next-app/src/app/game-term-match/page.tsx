import type { Metadata } from 'next';
import TermMatch from '@/components/games/TermMatch';
import data from '@/data/games/term-match.json';
import '@/styles/games/term-match.css';
import '@/styles/games/motion.css';

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
};

export default function TermMatchPage() {
  return <TermMatch />;
}
