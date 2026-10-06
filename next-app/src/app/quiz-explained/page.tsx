import type { Metadata } from 'next';
import ExplainedQuiz from '@/components/explained/ExplainedQuiz';
import { BANK_EXPLAINED } from '@/lib/banks';
import '@/styles/explained.css';

export const metadata: Metadata = {
  title: BANK_EXPLAINED.title,
  description: 'แบบทดสอบ ISC2 CC 57 ข้อ พร้อมคำอธิบายทุกตัวเลือกว่าทำไมถูกและทำไมผิด ครอบคลุม 5 Domains',
};

export default function QuizExplainedPage() {
  return <ExplainedQuiz config={BANK_EXPLAINED} />;
}
