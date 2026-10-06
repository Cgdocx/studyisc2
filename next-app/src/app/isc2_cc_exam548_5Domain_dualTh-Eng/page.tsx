import type { Metadata } from 'next';
import QuizApp from '@/components/quiz/QuizApp';
import { BANK_548 } from '@/lib/banks';
import '@/styles/quiz.css';
import '@/styles/battle.css';

export const metadata: Metadata = {
  title: BANK_548.title,
};

export default function Quiz548Page() {
  return <QuizApp config={BANK_548} />;
}
