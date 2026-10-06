export interface PortalCard {
  badgeBg: string;
  btnBg: string;
  btnColor: string;
  badgeLight: boolean;
  badge: string;
  title: string;
  subTh: string;
  desc: string;
  meta: string[];
  file: string;
  cta: string;
}

export interface PortalSection {
  step: string;
  title: string;
  cards: PortalCard[];
}

export const PORTAL_SECTIONS: PortalSection[] = [
  {
    "step": "STEP 1",
    "title": "เรียน : ทำความเข้าใจเนื้อหา",
    "cards": [
      {
        "badgeBg": "var(--yellow)",
        "btnBg": "var(--ink)",
        "btnColor": "var(--cream)",
        "badgeLight": false,
        "badge": "ROADMAP // 21 STEPS",
        "title": "LEARNING PATH",
        "subTh": "เส้นทางเรียน 21 ขั้น จากศูนย์จนพร้อมสอบ",
        "desc": "เส้นทางเรียนแนะนำ 21 ขั้นตอน ตั้งแต่เริ่มต้นจนพร้อมสอบ ติดตามความคืบหน้าด้วย Progress Tracker บอกได้เลยว่าขั้นถัดไปต้องทำอะไร",
        "meta": [
          "21 STEPS",
          "4 PHASES",
          "TRACK PROGRESS"
        ],
        "file": "learning-path.html",
        "cta": "เริ่มเส้นทาง"
      },
      {
        "badgeBg": "var(--green)",
        "btnBg": "var(--green)",
        "btnColor": "var(--white)",
        "badgeLight": true,
        "badge": "BEGINNER FRIENDLY",
        "title": "LESSONS 5 DOMAINS",
        "subTh": "บทเรียนมือใหม่ ครบ 5 โดเมน",
        "desc": "บทเรียนสำหรับมือใหม่ อธิบายด้วยภาษาง่ายๆ เปรียบเทียบชีวิตจริง มี Visual Diagram และ Real-World Scenarios",
        "meta": [
          "5 DOMAINS",
          "ANALOGIES + SVG",
          "CHEAT SHEET"
        ],
        "file": "lesson-domain-1.html",
        "cta": "เริ่มเรียน"
      },
      {
        "badgeBg": "var(--pink)",
        "btnBg": "var(--pink)",
        "btnColor": "var(--ink)",
        "badgeLight": false,
        "badge": "FLASHCARD // 100 CARDS",
        "title": "FLASHCARDS",
        "subTh": "บัตรคำศัพท์ 100 ใบ แยกตามโดเมน",
        "desc": "บัตรคำศัพท์ 100 ใบ พลิกดูคำตอบ แบ่งตาม Domain กด \"รู้แล้ว\" หรือ \"ยังไม่รู้\" แล้วติดตามความคืบหน้าได้",
        "meta": [
          "100 CARDS",
          "5 DOMAINS",
          "TRACK PROGRESS"
        ],
        "file": "flashcard.html",
        "cta": "เริ่มฝึก"
      },
      {
        "badgeBg": "var(--orange)",
        "btnBg": "var(--orange)",
        "btnColor": "var(--white)",
        "badgeLight": true,
        "badge": "MINI GAMES // 8 GAMES",
        "title": "MINI GAMES",
        "subTh": "เกมฝึกทักษะ 8 รูปแบบ ทวนแบบสนุก",
        "desc": "เกมฝึกทักษะ 8 รูปแบบ: จับคู่ จัดหมวด ถูกผิด แข่งเวลา เรียงลำดับ เติมคำ ปกป้องปราสาท นักสืบฟิชชิ่ง",
        "meta": [
          "8 GAMES",
          "ALL DOMAINS"
        ],
        "file": "games.html",
        "cta": "เล่นเกม"
      },
      {
        "badgeBg": "var(--green)",
        "btnBg": "var(--green)",
        "btnColor": "var(--white)",
        "badgeLight": true,
        "badge": "INTERACTIVE MIND MAP",
        "title": "CHAPTERS MIND MAP",
        "subTh": "สรุป 12 บทเรียน พร้อม Exam Focus",
        "desc": "ผังความคิดสรุปเนื้อหาข้อสอบทั้ง 5 โดเมนหลัก พร้อมระบบกรองคำศัพท์ จุดเน้นข้อสอบ (Exam Focus) และแนวทางปฏิบัติตามมาตรฐานสากล",
        "meta": [
          "12 CHAPTERS",
          "TH / EN",
          "CHEATSHEET"
        ],
        "file": "index.html",
        "cta": "เปิด Mind Map"
      }
    ]
  },
  {
    "step": "STEP 2",
    "title": "ฝึกและสอบ : วัดความพร้อม",
    "cards": [
      {
        "badgeBg": "var(--red)",
        "btnBg": "var(--red)",
        "btnColor": "var(--white)",
        "badgeLight": true,
        "badge": "WHY WRONG? // 60 Q",
        "title": "QUIZ EXPLAINED",
        "subTh": "อธิบายทำไมผิด 60 ข้อ พร้อมเหตุผลทุกตัวเลือก",
        "desc": "แบบทดสอบ 60 ข้อ พร้อมคำอธิบายทุกตัวเลือก ทั้งข้อถูกและข้อผิด ช่วยให้เข้าใจลึกซึ้งว่าทำไมแต่ละตัวเลือกถูกหรือผิด",
        "meta": [
          "60 QUESTIONS",
          "FULL EXPLANATIONS"
        ],
        "file": "quiz-explained.html",
        "cta": "เริ่มอธิบาย"
      },
      {
        "badgeBg": "var(--green)",
        "btnBg": "var(--green)",
        "btnColor": "var(--white)",
        "badgeLight": true,
        "badge": "PRACTICE EXAM // 50 Q",
        "title": "NCSA MOCK 50",
        "subTh": "ชุด 50 ข้อ จำลองแนวข้อสอบ สกมช.",
        "desc": "ชุดข้อสอบจำลอง 50 ข้อ แนวเดียวกับการทดสอบของ สกมช. ไม่มีระบบติดตามภายนอก ปลอดภัย รวดเร็ว พร้อมสรุปผลทันที",
        "meta": [
          "50 QUESTIONS",
          "MOCK TEST",
          "NCSA STYLE"
        ],
        "file": "isc2_cc_exam1NCSA_bi_no-track-50q.html",
        "cta": "เริ่มสอบ"
      },
      {
        "badgeBg": "var(--pink)",
        "btnBg": "var(--pink)",
        "btnColor": "var(--white)",
        "badgeLight": true,
        "badge": "PRACTICE EXAM // 583 Q",
        "title": "DUAL THAI-ENGLISH",
        "subTh": "ชุด 583 ข้อ เทียบสองภาษา ไทย อังกฤษ",
        "desc": "ข้อสอบสองภาษาคู่ขนาน เหมาะสำหรับฝึกความคุ้นเคยกับคำศัพท์เฉพาะทางภาษาอังกฤษ พร้อมคำแปลไทยและเหตุผลประกอบ",
        "meta": [
          "583 QUESTIONS",
          "BILINGUAL",
          "FLASHCARDS"
        ],
        "file": "isc2_cc_BothThai-eng_583quiz.html",
        "cta": "เริ่มสอบ"
      },
      {
        "badgeBg": "var(--yellow)",
        "btnBg": "var(--ink)",
        "btnColor": "var(--cream)",
        "badgeLight": false,
        "badge": "PRACTICE EXAM // 548 Q",
        "title": "5 DOMAINS PRACTICE",
        "subTh": "ชุด 548 ข้อ แยกฝึกตาม 5 โดเมน",
        "desc": "ชุดข้อสอบแบบเจาะลึกเฉพาะโดเมน เลือกลุยโดเมนที่ต้องการเสริมความมั่นใจ สลับดูคำแปลไทยและอังกฤษได้ทันที",
        "meta": [
          "548 QUESTIONS",
          "5 DOMAINS",
          "DUAL TH/EN"
        ],
        "file": "isc2_cc_exam548_5Domain_dualTh-Eng.html",
        "cta": "เริ่มสอบ"
      },
      {
        "badgeBg": "var(--orange)",
        "btnBg": "var(--orange)",
        "btnColor": "var(--white)",
        "badgeLight": true,
        "badge": "PRACTICE EXAM // 1,832 Q",
        "title": "1,832 EXAM DOMAINS",
        "subTh": "ชุด 1,832 ข้อ แปลไทย ครบ 5 โดเมน",
        "desc": "คลังข้อสอบฉบับแปลไทยครอบคลุม 5 โดเมนหลัก เลือกลุยแบบสุ่มข้อสอบ จำลองเวลาจริง พร้อมเฉลยละเอียดและสถิติรายโดเมน",
        "meta": [
          "1,832 QUESTIONS",
          "5 DOMAINS",
          "THAI"
        ],
        "file": "1832quiz_NewExamDomainTH.html",
        "cta": "เริ่มสอบ"
      }
    ]
  }
];
