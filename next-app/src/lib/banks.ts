export type TrackerTransport = 'beacon' | 'fetch' | 'fetch-retry-json';

export interface TrackerConfig {
  url: string;
  transport: TrackerTransport;
  quizTitle?: string;
  sessionId?: boolean;
  autoSaveOnHide?: boolean;
}

export type TimerRule =
  | { kind: 'none' }
  | { kind: 'per-question'; seconds: number }
  | { kind: 'per-question-choice'; options: number[]; defaultSeconds: number };

interface BankBase {
  id: string;
  file: string;
  title: string;
  dataFile: string;
  tracker: TrackerConfig | null;
  battle: boolean;
  timer: TimerRule;
  modes: string[];
}

export interface BilingualBankConfig extends BankBase {
  layout: 'bilingual';
  strings: {
    appTitle: { en: string; th: string };
    tagline: { en: string; th: string };
    printTitle: string;
  };
}

export interface SimpleBankConfig extends BankBase {
  layout: 'ncsa' | 'explained' | 'outline';
}

export type BankConfig = BilingualBankConfig | SimpleBankConfig;

export const BANK_583: BilingualBankConfig = {
  id: '583',
  layout: 'bilingual',
  file: 'isc2_cc_BothThai-eng_583quiz.html',
  title: 'ISC2 CC - Combined Practice Bank (583 Questions)',
  dataFile: 'questions-583.json',
  tracker: {
    url: 'https://script.google.com/macros/s/AKfycbxUOMS6CiqBj6fYKkLNpuu0-RRIHhIArTENMJQRzbOhjEVI_xPpyKbvFqNvdJtg5LwH/exec',
    transport: 'beacon',
  },
  battle: true,
  timer: { kind: 'per-question', seconds: 90 },
  modes: ['practice', 'exam'],
  strings: {
    appTitle: { en: 'ISC2 CC - Combined Practice Bank', th: 'ISC2 CC - คลังข้อสอบฝึกฝนรวม' },
    tagline: {
      en: '583 unique questions across all 5 domains, merged from 6 source banks. Fully bilingual - every question, choice, and explanation is available in English and Thai. Use the EN / TH / EN+TH toggle to switch languages, including a side-by-side view.',
      th: 'ข้อสอบ 583 ข้อ ครอบคลุมทั้ง 5 โดเมน รวบรวมจากคลังข้อสอบ 6 แหล่ง มีสองภาษาครบถ้วน - ทุกคำถาม ตัวเลือก และคำอธิบายมีทั้งภาษาอังกฤษและภาษาไทย ใช้ปุ่ม EN / TH / EN+TH เพื่อสลับภาษา รวมถึงมุมมองแบบเทียบสองภาษา',
    },
    printTitle: 'ISC2 CC - Exam Result',
  },
};

export const BANK_548: BilingualBankConfig = {
  id: '548',
  layout: 'bilingual',
  file: 'isc2_cc_exam548_5Domain_dualTh-Eng.html',
  title: 'ISC2 Cybersecurity Exam Practice (548 Questions) - Bilingual Interactive Quiz',
  dataFile: 'questions-548.json',
  tracker: {
    url: 'https://script.google.com/macros/s/AKfycbztlsZsrt4Mfnlq2LThFgIZE9Z8a25zcnX8Bdh8J9ZGLeWadtuu9hIbVFH9443KCQIn/exec',
    transport: 'beacon',
    quizTitle: 'ISC2 CC Exam548 5Domain (dualTh-Eng)',
    sessionId: true,
    autoSaveOnHide: true,
  },
  battle: true,
  timer: { kind: 'per-question', seconds: 90 },
  modes: ['practice', 'exam'],
  strings: {
    appTitle: { en: 'ISC2 Cybersecurity Exam Practice (548 Questions)', th: 'ISC2 Cybersecurity แบบทดสอบฝึกหัด (548 ข้อ)' },
    tagline: {
      en: '548 questions across all 5 domains. Fully bilingual - every question, choice, and explanation is available in English and Thai. Use the EN / TH / EN+TH toggle to switch languages, including a side-by-side view.',
      th: 'ข้อสอบ 548 ข้อ ครอบคลุมทั้ง 5 โดเมน มีสองภาษาครบถ้วน - ทุกคำถาม ตัวเลือก และคำอธิบายมีทั้งภาษาอังกฤษและภาษาไทย ใช้ปุ่ม EN / TH / EN+TH เพื่อสลับภาษา รวมถึงมุมมองแบบเทียบสองภาษา',
    },
    printTitle: 'ISC2 Cybersecurity - Exam Result',
  },
};

export const BANK_1832: SimpleBankConfig = {
  id: '1832',
  layout: 'outline',
  file: '1832quiz_NewExamDomainTH.html',
  title: 'ISC2 CC Practice Quiz · 2026 Outline',
  dataFile: 'bank-1832.json',
  tracker: {
    url: 'https://script.google.com/macros/s/AKfycbwuLraAO-1VWcY52NvlyWAJ_peFVSd2tSffZQO2jEotw5--0KE-GGYDZ1bZsNDfpPCc/exec',
    transport: 'fetch-retry-json',
  },
  battle: false,
  timer: { kind: 'per-question-choice', options: [90, 60, 120, 0], defaultSeconds: 90 },
  modes: ['practice', 'exam', 'pearson-vue', 'mistake-bank', 'retry-missed'],
};

export const BANK_NCSA50: SimpleBankConfig = {
  id: 'ncsa50',
  layout: 'ncsa',
  file: 'isc2_cc_exam1NCSA_bi_no-track-50q.html',
  title: 'ISC2 CC - CC Practice Exam 1 (50 Q) - Bilingual Interactive Quiz',
  dataFile: 'ncsa-50.json',
  tracker: {
    url: 'https://script.google.com/macros/s/AKfycbzkwljYxUoOQFKjMtbl250eQtItDSvt5zr0ew-ObCp9TBXaKQJfo2LBicSU__3VITTVCQ/exec',
    transport: 'fetch',
  },
  battle: false,
  timer: { kind: 'none' },
  modes: ['self-check'],
};

export const BANK_EXPLAINED: SimpleBankConfig = {
  id: 'explained',
  layout: 'explained',
  file: 'quiz-explained.html',
  title: 'ISC2 CC - อธิบายทำไมผิด: แบบทดสอบ 60 ข้อพร้อมคำอธิบายทุกตัวเลือก',
  dataFile: 'quiz-explained.json',
  tracker: null,
  battle: false,
  timer: { kind: 'none' },
  modes: ['all', 'domain', 'review-wrong'],
};
