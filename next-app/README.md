# studyisc2 Next.js site

Next.js (App Router, TypeScript) source of the ISC2 CC Study Hub, deployed to https://cgdocx.github.io/studyisc2/. It replaced the 23 self-contained HTML pages that used to sit in the repo root (ported in four phases, switched live in PR #12, legacy files removed afterwards). Every legacy URL still works:

| Route | Legacy URL (still served, as `<route>.html`) |
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
| `/studyisc2/games` | `games.html` |
| `/studyisc2/game-term-match`, `game-domain-sort`, `game-rapid-fire`, `game-beat-clock`, `game-incident-timeline`, `game-fill-gap`, `game-defend-castle`, `game-phish-detect` | the matching `game-*.html` |

The legacy pages are still in git history: `git show 791433d:<file>.html` (the commit pinned in `scripts/legacy-snapshot.json`).

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

The Mind Map is the root route (`src/app/page.tsx`), exported as `out/index.html`, so `/studyisc2/` and `/studyisc2/index.html` keep working.
`npm run serve` serves `out/` only, at http://localhost:4173/studyisc2/, the way GitHub Pages does (extensionless URLs, `/studyisc2` redirect, `404.html`).

## Question banks

The committed JSON in `public/data/` is the source of truth, fetched at runtime. The four HTML-embedded banks were extracted from the legacy pages; the 583 bank is still generated from its CSV, which now lives in `public/` and ships at the same URL:

| File | Origin |
|------|--------|
| `questions-583.json` | `public/studyisc2_questions_583_bilingual.csv` (`npm run gen:questions`) |
| `questions-548.json` | `ALL_QUESTIONS` in the legacy `isc2_cc_exam548_5Domain_dualTh-Eng.html` |
| `bank-1832.json` | `<script id="bank">` in the legacy `1832quiz_NewExamDomainTH.html` |
| `ncsa-50.json` | `DATA` in the legacy `isc2_cc_exam1NCSA_bi_no-track-50q.html` |
| `quiz-explained.json` | `QUESTIONS` in the legacy `quiz-explained.html` |

```bash
npm run gen:questions  # rebuild questions-583.json from the CSV
npm run verify:banks   # 583 JSON equals a fresh CSV build; every bank matches its pinned hash and count; per-question integrity
```

Bank settings (data file, timer rules, Google Sheet endpoint and payload shape, battle layer on or off) live in `src/lib/banks.ts`. The 583 and 548 pages share the bilingual engine in `src/components/quiz/`.

## Content pages

Study content was copied verbatim from the original pages into `src/data/content/` and is rendered at build time, so it is in the static HTML:

| File | Origin (legacy page) |
|------|--------|
| `lessons.json` | tabs, hero, content blocks (including SVG diagrams) and bottom nav of `lesson-domain-1.html` ... `lesson-domain-5.html` |
| `learning-path.json` | `phases`, `domainColors`, `domainLabels` in `learning-path.html` |
| `flashcards.json` | `DOMAINS`, `ALL_CARDS` in `flashcard.html` |
| `mindmap.json` | `chapters`, `chapterIcons`, meta tags and the noscript fallback in `index.html` |

```bash
npm run verify:content   # JSON matches its pinned hash; lessons rebuilt from data match the pinned original markup fingerprint; integrity
```

Progress uses the same localStorage keys and JSON as the legacy pages, so it carries over in both directions: `lp_completed` (Learning Path, `{"s1":true,...}`) and `fc_mastered` (flashcards, `{"<domain>:<term>":true,...}`). Lessons and the Mind Map store nothing.

## Mini games

Game data, copy and scoring rules were copied verbatim from the original pages into `src/data/games/`:

| File | Origin (legacy page) |
|------|--------|
| `games.json` | hero and the 8 cards of `games.html` |
| `term-match.json` | `ALL_PAIRS`, `DOMAIN_NAMES` (45 pairs) |
| `domain-sort.json` | `CONCEPTS`, `D_COLORS`, `D_NAMES` (52 concepts) |
| `rapid-fire.json` | `STATEMENTS` (80) |
| `beat-clock.json` | `QUESTIONS` (48) |
| `incident-timeline.json` | `SCENARIOS` (8) |
| `fill-gap.json` | `QUESTIONS` (34) |
| `defend-castle.json` | `THREATS` (20) |
| `phish-detect.json` | `ALL_FLAGS`, `EMAILS` (16) |

```bash
npm run verify:games   # JSON matches its pinned hash, data integrity, and (after a build) each exported page's pre-JS markup matches the pinned fingerprint of the original
```

The legacy `game-beat-clock.html` once had a syntax error (`"ออกแบบ Network"}` where `]` belongs) that stopped the game from starting; it was fixed in the legacy file (6c4865b) before the snapshot, so `beat-clock.json` comes from the working script.

The games keep the legacy localStorage keys and formats: `rf_highscore` (Rapid Fire, integer string) and `btc_leaderboard` (Beat the Clock, JSON array of `{total, correct, date}`, best 10). No game sends anything to the Google Sheet.

Intentional differences from the originals:

- the Phishing Detective attachment shows an SVG paperclip instead of the emoji;
- `prefers-reduced-motion: reduce` turns off game animations and transitions (`src/styles/games/motion.css`);
- Defend the Castle resets the castle damage look and the next button label when a new game starts (the original keeps the previous game's `damaged`/`critical` classes because it assigns `className` on an SVG element, and keeps "ดูผลลัพธ์" after a lost game);
- Beat the Clock treats a non-array `btc_leaderboard` as empty instead of crashing;
- the shared global nav replaces the slightly different nav copies inside the game files.

The hub copy (44 pairs, 82 statements, 60+ questions, 35 questions) and the "0 / 35" Fill the Gap placeholder are kept as written, even though the data holds 45, 80, 48 and 34.

## Lint

```bash
npm run lint
```

ESLint uses `eslint-config-next` (core web vitals and TypeScript). The React Compiler rules `refs`, `purity`, `set-state-in-effect` and `exhaustive-deps` are switched off only for the Phase 1 and 2 components (`quiz`, `outline`, `ncsa`, `explained`, `battle`), which keep mutable state in refs. Refactoring them is a follow-up; new code passes the full rule set.

## Deploy

`.github/workflows/nextjs-pages.yml` builds and checks `next-app` on every pull request and push to `main` (`npm ci`, lint, `verify:banks`, `verify:content`, build, `verify:games`, `audit:out`). Only a manual run (`workflow_dispatch`) on `main` uploads `next-app/out/` and deploys it with `actions/deploy-pages` (Pages `build_type: workflow`). Merging alone never changes the live site.

`public/` holds the files that ship at the site root: `sw.js`, `manifest.json` (byte-identical to the legacy file), `.nojekyll`, and the three CSV files (byte-identical, moved from the repo root). `sw.js` differs from the legacy worker in two lines: the cache is `studyisc2-cache-v3`, so returning visitors dropped the cache of legacy pages, and `./favicon.ico` is out of the precache list, because that file never existed and `cache.addAll` fails as a whole on one 404.

```bash
npm run audit:out                          # every legacy URL (pinned list) is served from out/, CSV/manifest bytes, link crawl, sw.js and manifest paths
node scripts/audit-out.mjs --verify-live   # after a deploy: the live site serves the Next.js build at every legacy URL
gh workflow run nextjs-pages.yml --ref main  # deploy (needs approval)
```

Rollback to an earlier build: re-run the deploy job of an earlier successful `Next.js site` run on `main`. The legacy root site is no longer on `main`; going back to it means restoring the files from `791433d` and setting `build_type=legacy` again.

## Legacy parity snapshot

`scripts/legacy-snapshot.json` was recorded at `791433d`, the last commit with the legacy root site, right before deletion. Before hashing anything it asserted that every committed JSON equalled a fresh extraction from its original page, that `lessons.json` rebuilt each lesson's original `.wrap` markup and that each built game page's pre-JS markup matched its original. It holds:

- `files`: sha256, size and `<title>` of the 28 legacy site files (23 pages, `sw.js`, `manifest.json`, 3 CSV), which is also the URL list `audit:out` checks;
- `data`: hashes of the 18 JSON files in `public/data`, `src/data/content` and `src/data/games`;
- `lessonMarkup`, `gameMarkup`, `mindmapNoscript`: fingerprints of the original markup.

The verify scripts fail when a pinned JSON changes. If a content change is intentional, update that file's `sha256` in the snapshot in the same PR (`node -e "console.log(require('crypto').createHash('sha256').update(JSON.stringify(require('./src/data/...json'))).digest('hex'))"`), so the diff shows the content moved away from the legacy original on purpose.

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
src/app/games/, src/app/game-*/       games hub and one route per game
src/components/games/                 the 8 games and shared helpers
src/data/games/                       game data (source of truth)
src/lib/storage.ts                    localStorage hook shared by Learning Path and flashcards
src/data/content/                     study content (source of truth)
public/                               sw.js, manifest.json, .nojekyll, the 3 CSV files, data/ question banks
src/styles/                           page styles scoped under .pg-landing, .pg-quiz, .pg-outline, .pg-ncsa, .pg-explained, .pg-lesson, .pg-learning, .pg-flashcard, .pg-mindmap, .pg-games and .pg-<game>
scripts/                              gen-questions (CSV -> JSON), verifiers, legacy-snapshot.json, URL audit, local static server
```

Rules from the root `CLAUDE.md` apply: neo-brutalist tokens, the exact Google Fonts URL, IBM Plex Sans Thai fallbacks, no emoji, no `system-ui`, no double dash in user facing text.
