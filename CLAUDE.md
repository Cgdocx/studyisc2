# CLAUDE.md — ISC2 CC Study Portal

AI ทุกตัวต้องอ่านไฟล์นี้ก่อนแก้ไขโปรเจกต์นี้ ห้ามหลุดจากกฎเหล่านี้

## ภาษา

- เนื้อหาหลักเป็น **ภาษาไทย** ศัพท์เทคนิคใช้ภาษาอังกฤษ
- ห้ามใช้ `--` (double dash) เป็นตัวคั่นข้อความ ใช้ `—` (em-dash) แทนเสมอ
- ห้ามใช้ emoji ในเนื้อหา ยกเว้นผู้ใช้ขอ
- ห้ามใส่ comment ที่ไม่จำเป็น เช่น `<!-- Section 1 -->` หรือ `// TODO`

## Theme — Neo-Brutalist

ธีมคือ Neo-Brutalist ทุกหน้าต้องใช้ design tokens เดียวกัน:

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

Google Fonts import URL ต้องเป็นตัวนี้เท่านั้น:
```
fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700;800&display=swap
```

Font variables ต้องมี **IBM Plex Sans Thai** เป็น fallback เสมอ:
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

ทุกหน้าต้องมี nav bar เหมือนกันทั้ง 23 หน้า:

```html
<div class="cg-links">
  <a href="learning-path.html" class="cg-link">LEARNING PATH</a>
  <a href="lesson-domain-1.html" class="cg-link">บทเรียน</a>
  <a href="flashcard.html" class="cg-link">FLASHCARD</a>
  <a href="isc2-cc-landing.html" class="cg-link">ชุดข้อสอบ</a>
  <a href="quiz-explained.html" class="cg-link">อธิบายทำไมผิด</a>
  <a href="games.html" class="cg-link">MINI GAMES</a>
  <a href="index.html" class="cg-link">MIND MAP</a>
</div>
```

Active state: หน้าปัจจุบันให้เพิ่ม `class="cg-link active"` ตาม mapping:
- `index.html` → MIND MAP
- `isc2-cc-landing.html` + quiz pages ทั้งหมด → ชุดข้อสอบ
- `flashcard.html` → FLASHCARD
- `learning-path.html` → LEARNING PATH
- `quiz-explained.html` → อธิบายทำไมผิด
- `games.html` + `game-*.html` → MINI GAMES
- `lesson-domain-*.html` → บทเรียน

## โครงสร้างไฟล์

- ทุกหน้าเป็น **self-contained single HTML file** (inline CSS + JS)
- ไม่มี build step, ไม่มี bundler — GitHub Pages serve raw HTML
- localStorage ใช้สำหรับ progress tracking (flashcard, quiz scores, learning path)
- ไม่ต้องสร้างไฟล์ CSS/JS แยก

## ไฟล์ทั้งหมด (23 หน้า)

| กลุ่ม | ไฟล์ |
|-------|------|
| Landing | `isc2-cc-landing.html` |
| Mind Map | `index.html` |
| Quiz | `1832quiz_NewExamDomainTH.html`, `isc2_cc_BothThai-eng_583quiz.html`, `isc2_cc_exam548_5Domain_dualTh-Eng.html`, `isc2_cc_exam1NCSA_bi_no-track-50q.html`, `quiz-explained.html` |
| Lessons | `lesson-domain-1.html` ถึง `lesson-domain-5.html` |
| Flashcard | `flashcard.html` |
| Learning Path | `learning-path.html` |
| Games Portal | `games.html` |
| Games | `game-term-match.html`, `game-domain-sort.html`, `game-rapid-fire.html`, `game-beat-clock.html`, `game-incident-timeline.html`, `game-fill-gap.html`, `game-defend-castle.html`, `game-phish-detect.html` |

## ISC2 CC 5 Domains

1. Security Principles
2. Business Continuity, Disaster Recovery & Incident Response
3. Access Controls Concepts
4. Network Security
5. Security Operations

## สิ่งที่ AI ห้ามทำ

- ห้ามใช้ `--` เป็นตัวคั่น (ใช้ `—`)
- ห้ามใช้ `system-ui` เป็น font fallback
- ห้ามสร้าง nav bar ที่แตกต่างจาก template ข้างบน
- ห้ามเปลี่ยนค่าสี/ธีมโดยไม่ได้รับอนุญาต
- ห้ามเพิ่ม `console.log` ทิ้งไว้ในโค้ด
- ห้ามใส่ placeholder text เช่น "Lorem ipsum", "example.com", "your-name-here"
- ห้ามเขียนตัวเลขที่ไม่ตรงกับความจริง (เช่น "120+ flashcards" ถ้ามีแค่ 100)
- ห้ามเพิ่ม HTML comment ที่ไม่จำเป็น (`<!-- Section X -->`)
- เมื่อแก้ไขไฟล์ใดไฟล์หนึ่ง ต้องตรวจสอบว่า nav bar และ font variables ยังถูกต้อง
