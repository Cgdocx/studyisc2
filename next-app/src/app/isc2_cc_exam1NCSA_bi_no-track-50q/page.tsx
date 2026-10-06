import type { Metadata } from 'next';
import NcsaExam from '@/components/ncsa/NcsaExam';
import { BANK_NCSA50 } from '@/lib/banks';
import '@/styles/ncsa.css';

export const metadata: Metadata = {
  title: BANK_NCSA50.title,
};

export default function Ncsa50Page() {
  return <NcsaExam config={BANK_NCSA50} />;
}
