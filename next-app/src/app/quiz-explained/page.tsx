import type { Metadata } from 'next';
import ExplainedQuiz from '@/components/explained/ExplainedQuiz';
import { BANK_EXPLAINED } from '@/lib/banks';
import '@/styles/explained.css';

export const metadata: Metadata = {
  title: BANK_EXPLAINED.title,
};

export default function QuizExplainedPage() {
  return <ExplainedQuiz config={BANK_EXPLAINED} />;
}
