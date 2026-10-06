import type { Metadata } from 'next';
import DomainSort from '@/components/games/DomainSort';
import data from '@/data/games/domain-sort.json';
import '@/styles/games/domain-sort.css';
import '@/styles/games/motion.css';

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
};

export default function DomainSortPage() {
  return <DomainSort />;
}
