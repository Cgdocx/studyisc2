# studyisc2 Next.js pilot

Next.js (App Router, TypeScript) version of the ISC2 CC Study Hub. Phase 1 ported the landing page and the 583 quiz, Phase 2 the other quiz sets, Phase 3 the content pages:

| Route | Replaces |
|-------|----------|
| `/studyisc2/isc2-cc-landing` | `isc2-cc-landing.html` |
| `/studyisc2/isc2_cc_BothThai-eng_583quiz` | `isc2_cc_BothThai-eng_583quiz.html` |
| `/studyisc2/isc2_cc_exam548_5Domain_dualTh-Eng` | `isc2_cc_exam548_5Domain_dualTh-Eng.html` |
| `/studyisc2/1832quiz_NewExamDomainTH` | `1832quiz_NewExamDomainTH.html` |
| `/studyisc2/isc2_cc_exam1NCSA_bi_no-track-50q` | `isc2_cc_exam1NCSA_bi_no-track-50q.html` |
| `/studyisc2/quiz-explained` | `quiz-explained.html` |
| `/studyisc2/lesson-domain-1` ... `/studyisc2/lesson-domain-5` | `lesson-domain-1.html` ... `lesson-domain-5.html` |
| `/studyisc2/learning-path` | `learning-path.html` |
| `/studyisc2/flashcard` | `flashcard.html` |
| `/studyisc2/` | `index.html` (Mind Map) |

The live GitHub Pages site still serves the root `.html` files. Nothing here is deployed yet. Still to port: `games.html` and the game pages.

## Run

```bash
cd next-app
npm install
npm run dev
```

Open http://localhost:3000/studyisc2/isc2-cc-landing (all routes live under the `/studyisc2` basePath).

## Build (static export)

```bash
npm run build
npm run serve
```

`npm run build` writes a static site to `out/` (`output: 'export'`, `basePath: '/studyisc2'`). Each page is exported as `<route>.html`, so the file names match the current URLs.

The Mind Map is the root route (`src/app/page.tsx`), exported as `out/index.html`, so `/studyisc2/` and `/studyisc2/index.html` keep working. It does not collide with the legacy root `index.html`: Pages serves the repo root, not `out/`, until the deploy switch.

`npm run serve` serves `out/` at http://localhost:4173/studyisc2/ the way GitHub Pages would. Links to pages that are not ported yet fall back to the original `.html` files in the repo root.

## Question banks

Every bank is generated from a real source file in the repo root and fetched at runtime:

| File | Source |
|------|--------|
| `questions-583.json` | `studyisc2_questions_583_bilingual.csv` (`npm run gen:questions`) |
| `questions-548.json` | `ALL_QUESTIONS` in `isc2_cc_exam548_5Domain_dualTh-Eng.html` |
| `bank-1832.json` | `<script id="bank">` in `1832quiz_NewExamDomainTH.html` |
| `ncsa-50.json` | `DATA` in `isc2_cc_exam1NCSA_bi_no-track-50q.html` |
| `quiz-explained.json` | `QUESTIONS` in `quiz-explained.html` |

```bash
npm run gen:banks      # extract the 4 HTML embedded banks
npm run verify:banks   # deep compare each JSON with its source (count and every field)
```

Bank settings (data file, timer rules, Google Sheet endpoint and payload shape, battle layer on or off) live in `src/lib/banks.ts`. The 583 and 548 pages share the bilingual engine in `src/components/quiz/`.

## Content pages

Study content is copied verbatim from the original pages into `src/data/content/` and rendered at build time, so it is in the static HTML:

| File | Source |
|------|--------|
| `lessons.json` | tabs, hero, content blocks (including SVG diagrams) and bottom nav of `lesson-domain-1.html` ... `lesson-domain-5.html` |
| `learning-path.json` | `phases`, `domainColors`, `domainLabels` in `learning-path.html` |
| `flashcards.json` | `DOMAINS`, `ALL_CARDS` in `flashcard.html` |
| `mindmap.json` | `chapters`, `chapterIcons`, meta tags and the noscript fallback in `index.html` |

```bash
npm run gen:content      # extract the content JSON
npm run verify:content   # JSON equals a fresh extraction; lessons rebuilt from data match the original markup token by token
```

Progress uses the same localStorage keys and JSON as the legacy pages, so it carries over in both directions: `lp_completed` (Learning Path, `{"s1":true,...}`) and `fc_mastered` (flashcards, `{"<domain>:<term>":true,...}`). Lessons and the Mind Map store nothing.

## Lint

```bash
npm run lint
```

ESLint uses `eslint-config-next` (core web vitals and TypeScript). The React Compiler rules `refs`, `purity`, `set-state-in-effect` and `exhaustive-deps` are switched off only for the Phase 1 and 2 components (`quiz`, `outline`, `ncsa`, `explained`, `battle`), which keep mutable state in refs. Refactoring them is a follow-up; new code passes the full rule set.

## Deploy switch

1. `npm run build`, with `sw.js`, `manifest.json` and `favicon.ico` copied into `public/` so they ship in `out/`.
2. Change Pages to a GitHub Actions workflow that publishes `next-app/out/`.
3. Verify every URL on the live site, then remove the legacy root `.html` files.

## Layout

```
src/app/layout.tsx                    global nav, fonts, Neko
src/app/globals.css                   design tokens and nav styles from CLAUDE.md
src/app/isc2-cc-landing/              landing page and card data
src/app/<quiz file name>/             one route per quiz page
src/lib/banks.ts                      per bank config
src/components/quiz/                  bilingual engine (583, 548): QuizApp, reducer, screens, tracker
src/components/quiz/engine/           shared bank loader, Sheet sender, shuffle
src/components/outline/               1832 set (companion, Pearson VUE simulation, exam integrity)
src/components/ncsa/                  NCSA Mock 50
src/components/explained/             quiz-explained
src/components/battle/                BattleLayer, Fighter, Sprite, HpBar, StageRail, RevivePanel, BattleReport
src/app/page.tsx                      Mind Map (root route, exported as index.html)
src/app/lesson-domain-N/              one route per lesson, all rendered by components/lesson/LessonPage
src/components/lesson/                shared lesson layout and data
src/components/learning/              Learning Path tracker
src/components/flashcard/             flashcards
src/components/mindmap/               Mind Map
src/lib/storage.ts                    localStorage hook shared by Learning Path and flashcards
src/data/content/                     extracted study content
src/styles/                           page styles scoped under .pg-landing, .pg-quiz, .pg-outline, .pg-ncsa, .pg-explained, .pg-lesson, .pg-learning, .pg-flashcard, .pg-mindmap
scripts/                              bank and content generators, verifiers, local static server
```

Rules from the root `CLAUDE.md` still apply: neo-brutalist tokens, the exact Google Fonts URL, IBM Plex Sans Thai fallbacks, no emoji, no `system-ui`, no double dash in user facing text.
