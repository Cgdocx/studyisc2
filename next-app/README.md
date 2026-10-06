# studyisc2 Next.js pilot

Next.js (App Router, TypeScript) version of the ISC2 CC Study Hub. Phase 1 ports 2 pages:

| Route | Replaces |
|-------|----------|
| `/studyisc2/isc2-cc-landing` | `isc2-cc-landing.html` |
| `/studyisc2/isc2_cc_BothThai-eng_583quiz` | `isc2_cc_BothThai-eng_583quiz.html` |

The live GitHub Pages site still serves the root `.html` files. Nothing here is deployed yet.

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

`npm run serve` serves `out/` at http://localhost:4173/studyisc2/ the way GitHub Pages would. Links to pages that are not ported yet fall back to the original `.html` files in the repo root.

## Question bank

`public/data/questions-583.json` is generated from `../studyisc2_questions_583_bilingual.csv`:

```bash
npm run gen:questions
```

The quiz fetches this JSON at runtime instead of embedding it in the HTML.

## Layout

```
src/app/layout.tsx                    global nav, fonts, Neko
src/app/globals.css                   design tokens and nav styles from CLAUDE.md
src/app/isc2-cc-landing/              landing page and card data
src/app/isc2_cc_BothThai-eng_583quiz/ quiz route
src/components/quiz/                  QuizApp, reducer, screens, tracker (Google Sheet)
src/components/battle/                BattleLayer, Fighter, Sprite, HpBar, StageRail, RevivePanel, BattleReport
src/styles/                           page styles scoped under .pg-landing and .pg-quiz
scripts/                              question generator and local static server
```

Rules from the root `CLAUDE.md` still apply: neo-brutalist tokens, the exact Google Fonts URL, IBM Plex Sans Thai fallbacks, no emoji, no `system-ui`, no double dash in user facing text.
