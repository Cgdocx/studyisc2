# ISC2 CC Study Portal

แหล่งรวมแบบทดสอบ บทเรียน เกม และสรุปเนื้อหาเตรียมสอบ **ISC2 Certified in Cybersecurity (CC)** ภาษาไทย-อังกฤษ

**Live:** https://cgdocx.github.io/studyisc2/

## เนื้อหาทั้งหมด

URL ทั้งหมดอยู่ใต้ https://cgdocx.github.io/studyisc2/ (เปิดแบบไม่มี `.html` ก็ได้ เช่น `/studyisc2/flashcard`)

### ชุดข้อสอบ

| ชุด | จำนวนข้อ | ภาษา | URL |
|-----|----------|------|------|
| Practice Quiz (2026 Outline) | 1,832 | TH | `1832quiz_NewExamDomainTH.html` |
| Bilingual Dual-Mode | 583 | TH/EN | `isc2_cc_BothThai-eng_583quiz.html` |
| 5-Domain Mock Exam | 548 | TH/EN | `isc2_cc_exam548_5Domain_dualTh-Eng.html` |
| NCSA Speed Test | 50 | TH/EN | `isc2_cc_exam1NCSA_bi_no-track-50q.html` |
| อธิบายทำไมผิด (ทุกตัวเลือก) | 57 | TH/EN | `quiz-explained.html` |

### บทเรียนสำหรับมือใหม่

| Domain | หัวข้อ | URL |
|--------|--------|------|
| 1 | Security Principles | `lesson-domain-1.html` |
| 2 | BC, DR & Incident Response | `lesson-domain-2.html` |
| 3 | Access Controls Concepts | `lesson-domain-3.html` |
| 4 | Network Security | `lesson-domain-4.html` |
| 5 | Security Operations | `lesson-domain-5.html` |

### เครื่องมือเรียนรู้

| เครื่องมือ | รายละเอียด | URL |
|-----------|------------|------|
| Mind Map สรุป 12 บท | สรุปประเด็นสำคัญ + Cheat Sheet | `index.html` |
| Flashcard 100 ใบ | บัตรคำศัพท์พลิกดูคำตอบ แบ่งตาม Domain | `flashcard.html` |
| Learning Path | เส้นทางเรียน 21 ขั้นตอน + Progress Tracker | `learning-path.html` |

### Mini Games (8 เกม)

| เกม | รูปแบบ | URL |
|-----|--------|------|
| Term Matching | ลากจับคู่คำศัพท์กับคำอธิบาย | `game-term-match.html` |
| Domain Sorting | จัดหมวดหมู่ concept ใส่ Domain | `game-domain-sort.html` |
| Rapid Fire | ถูก/ผิด 60 วินาที + streak multiplier | `game-rapid-fire.html` |
| Beat the Clock | 20 ข้อแข่งเวลา + leaderboard | `game-beat-clock.html` |
| Incident Timeline | เรียงลำดับขั้นตอน IR/BCP/Change Mgmt | `game-incident-timeline.html` |
| Fill the Gap | เติมคำในช่องว่าง | `game-fill-gap.html` |
| Defend the Castle | เลือก security control ปกป้องปราสาท | `game-defend-castle.html` |
| Phishing Detective | แยก phishing vs legit email | `game-phish-detect.html` |

## ISC2 CC 5 Domains

1. Security Principles
2. Business Continuity, Disaster Recovery & Incident Response
3. Access Controls Concepts
4. Network Security
5. Security Operations

## โครงสร้างโปรเจกต์

เว็บทั้งหมดอยู่ใน `next-app/` (Next.js App Router + TypeScript, static export) แต่ละหน้าคือ route ใน `next-app/src/app/<ชื่อหน้า>/` และ export เป็น `<ชื่อหน้า>.html` ชื่อเดิม ลิงก์และ bookmark เดิมจึงใช้ได้ทุกลิงก์

| ส่วน | ที่อยู่ |
|------|--------|
| หน้าเว็บ 23 หน้า | `next-app/src/app/` |
| ข้อมูลข้อสอบ (JSON) | `next-app/public/data/` |
| เนื้อหาบทเรียน, flashcard, mind map, learning path | `next-app/src/data/content/` |
| ข้อมูลเกม | `next-app/src/data/games/` |
| CSV (ข้อสอบ 583, glossary, รายชื่อหน้า) | `next-app/public/` |
| `sw.js`, `manifest.json`, ไอคอนเว็บ (`favicon.ico`, `icon.svg`, PNG) | `next-app/public/` (ต้นฉบับ vector ใน `next-app/icons/`) |
| Deploy | `.github/workflows/nextjs-pages.yml` (build + ตรวจทุก PR, deploy อัตโนมัติเมื่อ merge เข้า `main`, สั่ง run เองเพื่อ redeploy ได้) |

ไฟล์ HTML แบบเดิมที่เคยอยู่ที่ root ถูกลบแล้ว ดูย้อนหลังได้ใน git history (`git show 791433d:<ไฟล์>.html`)

## การใช้งาน

เปิด https://cgdocx.github.io/studyisc2/ หรือรันในเครื่อง:

```bash
git clone https://github.com/Cgdocx/studyisc2.git
cd studyisc2/next-app
npm install
npm run dev     # http://localhost:3000/studyisc2/
npm run build   # static site ใน next-app/out/
npm run serve   # เปิด out/ ที่ http://localhost:4173/studyisc2/
```

รายละเอียด build, การตรวจสอบ และการ deploy อยู่ใน [`next-app/README.md`](next-app/README.md)
