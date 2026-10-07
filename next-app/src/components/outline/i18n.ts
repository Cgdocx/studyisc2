export const DOMAINS = [
  { id: 1, en: 'Security Principles', th: 'หลักการความปลอดภัย', weight: '24%' },
  { id: 2, en: 'Security Governance', th: 'ธรรมาภิบาลด้านความปลอดภัย', weight: '17.3%' },
  { id: 3, en: 'Identity And Access Management (IAM) Concepts', th: 'แนวคิดการจัดการอัตลักษณ์และการเข้าถึง (IAM)', weight: '20%' },
  { id: 4, en: 'Networking and Cloud Security Concepts', th: 'แนวคิดความปลอดภัยของเครือข่ายและคลาวด์', weight: '21.3%' },
  { id: 5, en: 'Security Operations and Incident Response', th: 'การปฏิบัติการความปลอดภัยและการตอบสนองต่อเหตุการณ์', weight: '17.3%' },
];

export const I18N = {
  en: {
    title: 'ISC2 Certified in Cybersecurity',
    sub: 'Practice Quiz · Exam Outline effective 1 Sep 2026',
    hero: 'Choose domains to practice',
    heroP: 'Select one or more official 2026 CC domains. Thai translations and fonts are embedded, so this file works without internet.',
    len: 'Number of questions', mode: 'Mode', timer: 'Timer per question',
    start: 'Start quiz', all: 'Select all', none: 'Clear', home: 'Home',
    next: 'Next', skip: 'Skip', finish: 'See results', end: 'End now',
    result: 'Result', review: 'Review answers', again: 'New quiz',
    correct: 'Correct', incorrect: 'Incorrect', skipped: 'Skipped',
    timeout: 'Time out', explanation: 'Explanation',
    foot: 'Unofficial practice tool. Thai translations and IBM Plex Sans Thai styling.',
    selected: 'selected', available: 'questions available', inBank: 'in bank',
    translated: 'strings translated offline',
    qOf: (a: number, b: number) => 'Question ' + a + ' of ' + b,
    answered: (c: number, t: number, s: number, o: number) => c + ' correct / ' + t + ' questions · skipped ' + s + ' · timed out ' + o,
    practice: 'Practice (instant feedback)', exam: 'Exam (review at the end)',
    allOpt: 'All in selection', needDomain: 'Please select at least one domain.',
    needName: 'Please enter your name before starting.',
    timeLeft: 'Time left', endedEarly: 'Ended early',
    name: 'Your name',
    printMissed: 'Print incorrect',
    passing: 'Passing score: 70%',
    pass: 'PASS',
    fail: 'FAIL',
    sending: 'Saving result to the score sheet…',
    sent: 'Result sent to the score sheet.',
    sendFail: 'Could not confirm the score sheet (result still shown here).',
    printTitle: 'Incorrect questions for further study',
    yourAnswer: 'Your answer',
    noAnswer: 'No answer',
  },
  th: {
    title: 'ISC2 Certified in Cybersecurity',
    sub: 'แบบทดสอบฝึกฝน · โครงร่างข้อสอบมีผล 1 ก.ย. 2026',
    hero: 'เลือกโดเมนที่ต้องการฝึก',
    heroP: 'เลือกหนึ่งหรือหลายโดเมนตามโครงร่าง CC ปี 2026 คำแปลภาษาไทยและฟอนต์ฝังในไฟล์นี้ ใช้ได้โดยไม่ต้องมีอินเทอร์เน็ต',
    len: 'จำนวนข้อ', mode: 'โหมด', timer: 'เวลาต่อข้อ',
    start: 'เริ่มแบบทดสอบ', all: 'เลือกทั้งหมด', none: 'ล้าง', home: 'หน้าหลัก',
    next: 'ข้อถัดไป', skip: 'ข้าม', finish: 'ดูผลคะแนน', end: 'จบทันที',
    result: 'ผลคะแนน', review: 'ตรวจคำตอบ', again: 'ทำชุดใหม่',
    correct: 'ตอบถูก', incorrect: 'ตอบผิด', skipped: 'ข้าม',
    timeout: 'หมดเวลา', explanation: 'คำอธิบาย',
    foot: 'เครื่องมือฝึกที่ไม่เป็นทางการ แปลไทยและฟอนต์ IBM Plex Sans Thai (Creative Mode)',
    selected: 'ที่เลือก', available: 'ข้อพร้อมใช้', inBank: 'ในคลังข้อสอบ',
    translated: 'ข้อความที่แปลไว้ล่วงหน้า',
    qOf: (a: number, b: number) => 'ข้อ ' + a + ' จาก ' + b,
    answered: (c: number, t: number, s: number, o: number) => 'ตอบถูก ' + c + ' จาก ' + t + ' ข้อ · ข้าม ' + s + ' · หมดเวลา ' + o,
    practice: 'ฝึกฝน (เฉลยทันที)', exam: 'จำลองสอบ (เฉลยท้ายชุด)',
    allOpt: 'ทั้งหมดในโดเมนที่เลือก', needDomain: 'กรุณาเลือกอย่างน้อยหนึ่งโดเมน',
    needName: 'กรุณาใส่ชื่อก่อนเริ่มทำแบบทดสอบ',
    timeLeft: 'เวลาที่เหลือ', endedEarly: 'จบก่อนครบ',
    name: 'ชื่อผู้ทดสอบ',
    printMissed: 'พิมพ์ข้อที่ผิด',
    passing: 'เกณฑ์ผ่าน: 70%',
    pass: 'ผ่าน',
    fail: 'ไม่ผ่าน',
    sending: 'กำลังบันทึกผลไปยังแผ่นคะแนน…',
    sent: 'ส่งผลไปยังแผ่นคะแนนแล้ว',
    sendFail: 'ยืนยันการส่งแผ่นคะแนนไม่ได้ (ยังแสดงผลในหน้านี้)',
    printTitle: 'ข้อที่ตอบผิดสำหรับทบทวน',
    yourAnswer: 'คำตอบของคุณ',
    noAnswer: 'ไม่ได้ตอบ',
  },
};

export type ViewMode = 'en' | 'th' | 'both';
export type Strings = typeof I18N.en;

export function domainName(id: number, viewMode: ViewMode): string {
  const d = DOMAINS.find(x => x.id === id)!;
  if (viewMode === 'th') return d.th;
  if (viewMode === 'both') return d.en + ' / ' + d.th;
  return d.en;
}

export const COMPANION = {
  evolutionStages: [
    { minLevel: 1, sprite: '●', name: 'BYTE (KITTEN)', bg: 'var(--yellow)' },
    { minLevel: 3, sprite: '◆', name: 'FOX BYTE', bg: 'var(--orange)' },
    { minLevel: 5, sprite: '★', name: 'CYBER LION', bg: 'var(--green-dim)' },
    { minLevel: 8, sprite: '✦', name: 'MECHA GUARDIAN', bg: 'var(--pink)' },
    { minLevel: 12, sprite: '✸', name: 'CYBER OVERLORD', bg: 'var(--accent)' },
  ],
  correctQuotes: [
    'สุดยอด! ข้อนี้แม่นมาก',
    'คอมโบมาแล้ว! ลุยต่อเลย',
    'CISSP/CC ระดับเทพ',
    'ความรู้แน่นปึ้ก! คำตอบนี้เฉียบคม',
    'คะแนนพุ่งกระฉูด! ไปต่อเลย',
  ],
  wrongQuotes: [
    'ไม่เป็นไรนะ จำหลักการข้อนี้ไว้ทบทวน!',
    'ข้อสอบชอบหลอกจุดนี้ ระวังเลยนะ',
    'ล้มแล้วลุกใหม่ ข้อต่อไปเอาคืน!',
    'เกือบถูกแล้ว อ่านทวนอีกนิดนะ สู้ ๆ',
    'เดี๋ยวระบบบันทึกลงคลังข้อผิดให้ ไม่ต้องห่วง',
  ],
  clickQuotes: [
    'เหมียว! กำลังตั้งใจอ่านโจทย์อยู่ใช่ไหม?',
    'สมาธิดีมาก ข้อนี้ไม่ยากเกินความสามารถ',
    'คลิกที่หนูทำไมเนี่ย! รีบตอบข้อสอบเร็วเข้า 555',
    'เป้าหมาย 70% อยู่แค่เอื้อม ลุยยย!',
    'พักหายใจ 2 วินาที แล้วลุยข้อต่อไป!',
  ],
};
