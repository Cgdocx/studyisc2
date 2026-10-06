import type { Metadata } from 'next';
import Outline1832 from '@/components/outline/Outline1832';
import { BANK_1832 } from '@/lib/banks';
import '@/styles/outline1832.css';

export const metadata: Metadata = {
  title: BANK_1832.title,
};

export default function Quiz1832Page() {
  return <Outline1832 config={BANK_1832} />;
}
