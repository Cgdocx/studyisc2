import type { Metadata } from 'next';
import IncidentTimeline from '@/components/games/IncidentTimeline';
import data from '@/data/games/incident-timeline.json';
import '@/styles/games/incident-timeline.css';
import '@/styles/games/motion.css';

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
};

export default function IncidentTimelinePage() {
  return <IncidentTimeline />;
}
