# CLAUDE.md — ISC2 CC Study Portal

AI ทุกตัวต้องอ่านไฟล์นี้ก่อนแก้ไขโปรเจกต์นี้ ห้ามหลุดจากกฎเหล่านี้

## ภาษา

- เนื้อหาหลักเป็น **ภาษาไทย** ศัพท์เทคนิคใช้ภาษาอังกฤษ
- ห้ามใช้ `--` (double dash) เป็นตัวคั่นข้อความ ใช้ `—` (em-dash) แทนเสมอ
- ห้ามใช้ emoji ในเนื้อหา ยกเว้นผู้ใช้ขอ
- ห้ามใส่ comment ที่ไม่จำเป็น เช่น `<!-- Section 1 -->` หรือ `// TODO`

## Theme — Neo-Brutalist

ธีมคือ Neo-Brutalist ทุกหน้าต้องใช้ design tokens เดียวกัน กำหนดไว้ใน `next-app/src/app/globals.css` (`:root`) ไฟล์ style ของแต่ละหน้าใน `next-app/src/styles/` ต้องใช้ค่าชุดเดียวกันนี้:

### สี (CSS Custom Properties)

```css
:root {
  --cream: #EFE9D9;
  --cream-2: #E4DCC4;
  --green: #1F8A4C;
  --green2: #136636;
  --green-dim: rgba(31,138,76,.15);
  --pink: #F06CA8;
  --orange: #E85A1F;
  --yellow: #F5C518;
  --ink: #0F0F0F;
  --ink-2: #2A2A2A;
  --white: #FFFFFF;
  --bg: #EFE9D9;
  --bg2: #E4DCC4;
  --card: #FFFFFF;
  --card2: #F7F4EB;
  --line: #0F0F0F;
  --text: #0F0F0F;
  --muted: #4A4A4A;
  --red: #D12438;
  --red-dim: rgba(209,36,56,.12);
  --gold: #E85A1F;
  --warn: #E85A1F;
  --shadow: 4px 4px 0 #0F0F0F;
  --radius: 0px;
}
```

### Fonts

Google Fonts import URL ต้องเป็นตัวนี้เท่านั้น อยู่ที่ `FONTS_URL` ใน `next-app/src/lib/site.ts` และโหลดครั้งเดียวใน `next-app/src/app/layout.tsx` (ห้ามโหลด font ซ้ำในหน้าอื่น):
```
fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700;800&display=swap
```

Font variables (ใน `globals.css`) ต้องมี **IBM Plex Sans Thai** เป็น fallback เสมอ:
```css
--font-display: 'Archivo Black', 'IBM Plex Sans Thai', sans-serif;
--font-body: 'Space Grotesk', 'IBM Plex Sans Thai', sans-serif;
--font-thai: 'IBM Plex Sans Thai', 'Space Grotesk', sans-serif;
--font-mono: 'JetBrains Mono', 'IBM Plex Sans Thai', monospace;
```

ห้ามใช้ `system-ui` เป็น fallback — ทำให้ภาษาไทยแสดงผลไม่ตรงธีม

### สไตล์ Neo-Brutalist

- `border: 2-3px solid var(--ink)`
- `box-shadow: var(--shadow)` (4px 4px 0 black)
- `border-radius: 0px` (ไม่มีขอบมน)
- พื้นหลัง: `var(--cream)` / `var(--bg)`
- การ์ด: `var(--card)` พื้นขาว + เส้นขอบดำ + เงาทึบ

## Navigation Bar

ทุกหน้าใช้ nav bar ตัวเดียวกันคือ component `next-app/src/components/GlobalNav.tsx` ซึ่ง render จาก `layout.tsx` ให้ทุกหน้าอัตโนมัติ (หน้า Mind Map วาง nav เองในหน้าผ่าน `<GlobalNav inPage />`) ห้ามสร้าง nav ใหม่ในหน้าใด

ลิงก์และลำดับกำหนดที่ `NAV_LINKS` ใน `next-app/src/lib/site.ts`:

| ลำดับ | ข้อความ | หน้า |
|-------|---------|------|
| 1 | LEARNING PATH | `learning-path.html` |
| 2 | บทเรียน | `lesson-domain-1.html` |
| 3 | FLASHCARD | `flashcard.html` |
| 4 | ชุดข้อสอบ | `isc2-cc-landing.html` |
| 5 | อธิบายทำไมผิด | `quiz-explained.html` |
| 6 | MINI GAMES | `games.html` |
| 7 | MIND MAP | `index.html` |

HTML ที่ได้ยังเป็น `<div class="cg-links">` + `<a class="cg-link">` แบบเดิม style อยู่ใน `globals.css`

Active state (`cg-link active`) มาจากค่า `nav` ของแต่ละหน้าใน `PORTED_ROUTES` (`site.ts`):
- `index.html` → MIND MAP
- `isc2-cc-landing.html` + quiz pages ทั้งหมด → ชุดข้อสอบ
- `flashcard.html` → FLASHCARD
- `learning-path.html` → LEARNING PATH
- `quiz-explained.html` → อธิบายทำไมผิด
- `games.html` + `game-*.html` → MINI GAMES
- `lesson-domain-*.html` → บทเรียน

ลิงก์ภายในเว็บให้ใช้ `<SiteLink file="ชื่อไฟล์.html">` (`next-app/src/components/SiteLink.tsx`) ซึ่งแปลงเป็น route ของ Next.js และใส่ basePath `/studyisc2` ให้เอง หน้าใหม่ต้องเพิ่มใน `PORTED_ROUTES` ด้วย

## โครงสร้างไฟล์

- เว็บทั้งหมดอยู่ใน `next-app/` (Next.js App Router + TypeScript) ไม่มีหน้า HTML ที่ root อีกแล้ว
- build เป็น static export (`output: 'export'`, `basePath: '/studyisc2'`) แต่ละ route export เป็น `<ชื่อหน้า>.html` ชื่อเดิม URL เดิมจึงใช้ได้ทั้งหมด
- deploy ด้วย GitHub Actions (`.github/workflows/nextjs-pages.yml`) ทุก PR ต้องผ่าน lint, `verify:banks`, `verify:content`, build, `verify:games`, `audit:out` การ deploy ทำเมื่อสั่ง run workflow เองบน `main` เท่านั้น
- ข้อมูลอยู่ใน JSON ที่ commit ไว้ (source of truth): ข้อสอบ `next-app/public/data/`, เนื้อหา `next-app/src/data/content/`, เกม `next-app/src/data/games/` แก้เนื้อหาที่ JSON ไม่ใช่ใน component
- JSON เหล่านี้ถูก pin hash ไว้ใน `next-app/scripts/legacy-snapshot.json` (หลักฐานว่าตรงกับหน้าเดิมตอนลบ) ถ้าตั้งใจแก้เนื้อหา ต้องอัปเดต hash ในไฟล์นั้นใน PR เดียวกัน (วิธีดูใน `next-app/README.md`)
- localStorage ใช้ key และรูปแบบเดิมสำหรับ progress tracking (flashcard, quiz scores, learning path, เกม) ห้ามเปลี่ยน key
- style ของแต่ละหน้าอยู่ใน `next-app/src/styles/` scoped ใต้ class `.pg-<หน้า>`

## หน้าทั้งหมด (23 หน้า)

| กลุ่ม | หน้า (URL) | Route ใน `next-app/src/app/` |
|-------|------------|------------------------------|
| Landing | `isc2-cc-landing.html` | `isc2-cc-landing/` |
| Mind Map | `index.html` | `page.tsx` (root route) |
| Quiz | `1832quiz_NewExamDomainTH.html`, `isc2_cc_BothThai-eng_583quiz.html`, `isc2_cc_exam548_5Domain_dualTh-Eng.html`, `isc2_cc_exam1NCSA_bi_no-track-50q.html`, `quiz-explained.html` | ชื่อเดียวกันไม่มี `.html` |
| Lessons | `lesson-domain-1.html` ถึง `lesson-domain-5.html` | `lesson-domain-1/` ถึง `lesson-domain-5/` |
| Flashcard | `flashcard.html` | `flashcard/` |
| Learning Path | `learning-path.html` | `learning-path/` |
| Games Portal | `games.html` | `games/` |
| Games | `game-term-match.html`, `game-domain-sort.html`, `game-rapid-fire.html`, `game-beat-clock.html`, `game-incident-timeline.html`, `game-fill-gap.html`, `game-defend-castle.html`, `game-phish-detect.html` | ชื่อเดียวกันไม่มี `.html` |

## ISC2 CC 5 Domains

1. Security Principles
2. Business Continuity, Disaster Recovery & Incident Response
3. Access Controls Concepts
4. Network Security
5. Security Operations

## สิ่งที่ AI ห้ามทำ

- **ห้ามใช้ emoji เด็ดขาด** ทั้งในเนื้อหา, UI, JS strings — ใช้ text icon แทน เช่น `[!]` `[OK]` `[X]` หรือ Unicode geometric shapes (`●`, `◆`, `★`, `✦`)
- ห้ามใช้ `--` หรือ `—` (em-dash) เป็นตัวคั่น ใช้ ` : ` สำหรับหัวข้อ/คำจำกัดความ, เว้นวรรคปกติสำหรับอุปมา, ` > ` สำหรับลำดับขั้นตอน
- ห้ามใช้ `system-ui` เป็น font fallback
- ห้ามสร้าง nav bar อื่นนอกจาก `GlobalNav`
- ห้ามเปลี่ยนค่าสี/ธีมโดยไม่ได้รับอนุญาต
- ห้ามเพิ่ม `console.log` ทิ้งไว้ในโค้ด
- ห้ามใส่ placeholder text เช่น "Lorem ipsum", "example.com", "your-name-here"
- ห้ามเขียนตัวเลขที่ไม่ตรงกับความจริง (เช่น "120+ flashcards" ถ้ามีแค่ 100)
- ห้ามเพิ่ม HTML comment ที่ไม่จำเป็น (`<!-- Section X -->`)
- เมื่อแก้ไขหน้าใด ต้องตรวจสอบว่า nav bar และ font variables ยังถูกต้อง และ `npm run lint`, `npm run build` และ verify scripts ใน `next-app/` ผ่าน
