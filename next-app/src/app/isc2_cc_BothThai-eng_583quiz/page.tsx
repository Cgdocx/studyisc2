import type { Metadata } from 'next';
import QuizApp from '@/components/quiz/QuizApp';
import '@/styles/quiz.css';
import '@/styles/battle.css';

export const metadata: Metadata = {
  title: 'ISC2 CC - Combined Practice Bank (583 Questions)',
};

export default function Quiz583Page() {
  return <QuizApp />;
}
