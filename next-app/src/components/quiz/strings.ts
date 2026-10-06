import type { Lang } from './types';

export const DOMAIN_NAMES: Record<number, string> = {
  1: 'Security Principles', 2: 'BC/DR/IR', 3: 'Access Controls Concepts', 4: 'Network Security', 5: 'Security Operations',
};
export const DOMAIN_NAMES_TH: Record<number, string> = {
  1: 'หลักการความปลอดภัย', 2: 'BC/DR/IR', 3: 'แนวคิดการควบคุมการเข้าถึง', 4: 'ความปลอดภัยเครือข่าย', 5: 'ปฏิบัติการความปลอดภัย',
};

export const EXAM_SECONDS_PER_QUESTION = 90;
export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const UI_STRINGS = {
  appTitle: { en: 'ISC2 CC - Combined Practice Bank', th: 'ISC2 CC - คลังข้อสอบฝึกฝนรวม' },
  createdBy: { en: 'Created by Gotji', th: 'สร้างโดย Gotji' },
  tagline: {
    en: '583 unique questions across all 5 domains, merged from 6 source banks. Fully bilingual - every question, choice, and explanation is available in English and Thai. Use the EN / TH / EN+TH toggle to switch languages, including a side-by-side view.',
    th: 'ข้อสอบ 583 ข้อ ครอบคลุมทั้ง 5 โดเมน รวบรวมจากคลังข้อสอบ 6 แหล่ง มีสองภาษาครบถ้วน - ทุกคำถาม ตัวเลือก และคำอธิบายมีทั้งภาษาอังกฤษและภาษาไทย ใช้ปุ่ม EN / TH / EN+TH เพื่อสลับภาษา รวมถึงมุมมองแบบเทียบสองภาษา',
  },
  yourNameLabel: { en: 'Your name (required)', th: 'ชื่อของคุณ (จำเป็น)' },
  namePlaceholder: { en: 'e.g. Gotji', th: 'เช่น Gotji' },
  studyModeLabel: { en: 'Study Mode', th: 'โหมดการเรียน' },
  practiceTitle: { en: 'Practice', th: 'ฝึกฝน' },
  practiceDesc: { en: 'Instant correct/wrong + explanation', th: 'แสดงถูก/ผิดทันที พร้อมคำอธิบาย' },
  examTitle: { en: 'Exam', th: 'สอบจริง' },
  examDesc: { en: 'No hints · 90s/question timer', th: 'ไม่มีคำใบ้ · จับเวลา 90 วินาที/ข้อ' },
  examNote: {
    en: 'Exam mode: no answer feedback until the end, a 90-second timer per question, and a Finish Now button to submit early. Incomplete attempts are automatically marked FAIL.',
    th: "โหมดสอบจริง: ไม่แสดงผลถูก/ผิดจนกว่าจะจบข้อสอบ มีเวลา 90 วินาทีต่อข้อ และมีปุ่ม 'จบตอนนี้' สำหรับส่งก่อนเวลา หากทำไม่ครบทุกข้อจะถูกตัดสินว่า FAIL โดยอัตโนมัติ",
  },
  practiceNote: {
    en: 'Practice mode also has a 90-second-per-question timer and a Finish Now button, but shows the correct answer and explanation immediately after each question.',
    th: "โหมดฝึกฝนก็มีตัวจับเวลา 90 วินาทีต่อข้อและปุ่ม 'จบตอนนี้' เช่นกัน แต่จะแสดงคำตอบที่ถูกต้องและคำอธิบายทันทีหลังตอบแต่ละข้อ",
  },
  orderLabel: { en: 'Order', th: 'ลำดับคำถาม' },
  sequentialTitle: { en: 'Sequential', th: 'เรียงลำดับ' },
  sequentialDesc: { en: 'Questions in order', th: 'คำถามเรียงตามลำดับ' },
  randomTitle: { en: 'Random', th: 'สุ่ม' },
  randomDesc: { en: 'Shuffled questions', th: 'คำถามแบบสุ่ม' },
  domainsLabel: { en: 'Domains', th: 'โดเมน' },
  selectAll: { en: 'Select all', th: 'เลือกทั้งหมด' },
  clearAll: { en: 'Clear all', th: 'ล้างการเลือก' },
  questionsCountLabel: { en: 'Number of questions', th: 'จำนวนข้อ' },
  warnSelectDomain: { en: 'Select at least one domain to begin.', th: 'กรุณาเลือกอย่างน้อยหนึ่งโดเมนเพื่อเริ่มต้น' },
  availableSuffix: { en: 'question(s) available for this selection', th: 'ข้อที่มีอยู่สำหรับตัวเลือกนี้' },
  startQuizBtn: { en: 'Start Quiz', th: 'เริ่มทำข้อสอบ' },
  warnEnterName: { en: 'Enter your name to begin - results are tracked per name.', th: 'กรุณากรอกชื่อก่อนเริ่ม - ผลลัพธ์จะถูกบันทึกตามชื่อ' },
} as const;

export type UiKey = keyof typeof UI_STRINGS;

export function t(key: UiKey, lang: Lang): string {
  const entry = UI_STRINGS[key];
  if (lang === 'both') return `${entry.en} / ${entry.th}`;
  return lang === 'th' ? entry.th : entry.en;
}
