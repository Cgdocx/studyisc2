import type { Metadata } from 'next';
import LearningPath from '@/components/learning/LearningPath';
import data from '@/data/content/learning-path.json';
import '@/styles/learning-path.css';

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
};

export default function LearningPathPage() {
  return <LearningPath />;
}
