import type { Metadata } from 'next';
import Outline1832 from '@/components/outline/Outline1832';
import { BANK_1832 } from '@/lib/banks';
import { BASE_PATH } from '@/lib/site';
import '@/styles/outline1832.css';

export const metadata: Metadata = {
  title: BANK_1832.title,
  manifest: `${BASE_PATH}/manifest.json`,
};

export default function Quiz1832Page() {
  return <Outline1832 config={BANK_1832} />;
}
