import type { Metadata } from 'next';
import DefendCastle from '@/components/games/DefendCastle';
import data from '@/data/games/defend-castle.json';
import '@/styles/games/defend-castle.css';
import '@/styles/games/motion.css';

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
};

export default function DefendCastlePage() {
  return <DefendCastle />;
}
