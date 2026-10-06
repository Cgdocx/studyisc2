# studyisc2 Next.js pilot

Next.js (App Router, TypeScript) version of the ISC2 CC Study Hub. Phase 1 ported the landing page and the 583 quiz, Phase 2 the other quiz sets, Phase 3 the content pages, Phase 4 the mini games:

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
| `/studyisc2/games` | `games.html` |
| `/studyisc2/game-term-match`, `game-domain-sort`, `game-rapid-fire`, `game-beat-clock`, `game-incident-timeline`, `game-fill-gap`, `game-defend-castle`, `game-phish-detect` | the matching `game-*.html` |

Every page of the site is now ported. The live GitHub Pages site still serves the root `.html` files. Nothing here is deployed yet.

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

## Mini games

Game data, copy and scoring rules come verbatim from the original pages into `src/data/games/`:

| File | Source |
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
npm run gen:games      # extract the game JSON
npm run verify:games   # JSON equals a fresh extraction, data integrity, and (after a build) each exported page's pre-JS markup matches the original token by token
```

The script of `game-beat-clock.html` has a syntax error (`"ออกแบบ Network"}` where `]` belongs), so the live game never starts. The generator applies that one character fix in memory, asserts it occurs exactly once, and leaves the legacy file untouched. `verify:games` proves the original fails to parse and the fixed copy parses.

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

## Deploy switch

`.github/workflows/nextjs-pages.yml` builds and checks `next-app` on every pull request and push to `main` (`npm ci`, lint, `verify:banks`, `verify:content`, build, `verify:games`, `audit:out`). Only a manual run (`workflow_dispatch`) on `main` uploads `next-app/out/` and deploys it with `actions/deploy-pages`, so merging changes nothing while Pages still builds the repo root (`build_type: legacy`).

`public/` carries the root assets so they ship in `out/` at the same URLs: `sw.js`, `manifest.json` (byte-identical copy), `.nojekyll`, and the root CSV files (copied by `npm run build` through `prebuild`, not committed twice). `sw.js` differs from the root copy in two lines: the cache is renamed `studyisc2-cache-v3`, so returning visitors drop the old cache of legacy pages when the new worker activates, and `./favicon.ico` is gone from the precache list, because the file has never existed and `cache.addAll` fails as a whole on one 404, which leaves today's precache empty.

```bash
npm run audit:out                          # every URL the legacy site serves exists in out/, link crawl, sw.js and manifest paths
node scripts/audit-out.mjs --live          # same, plus a side by side status table against the live site
node scripts/audit-out.mjs --verify-live   # after the switch: the live site serves the Next.js build everywhere
npm run serve:strict                       # serve out/ only, the way Pages will after the switch
```

Switch, in order (each step needs approval):

1. Merge the deploy PR and wait for the `Next.js site` run on `main` to pass.
2. `gh api -X PUT repos/Cgdocx/studyisc2/pages -f build_type=workflow`
3. `gh workflow run nextjs-pages.yml --ref main`, then watch it finish.
4. `node scripts/audit-out.mjs --verify-live`, and open the site in a browser.
5. Rollback if anything is wrong: `gh api -X PUT repos/Cgdocx/studyisc2/pages -f build_type=legacy -f "source[branch]=main" -f "source[path]=/"`, then `gh api -X POST repos/Cgdocx/studyisc2/pages/builds`.

Removing the legacy root `.html` files is a separate later step. `verify:banks`, `verify:content` and `verify:games` read those files, so they have to be retired or pointed at the JSON first; the root CSV files stay because `gen:questions` and `sync-public` use them.

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
src/data/games/                       extracted game data
src/lib/storage.ts                    localStorage hook shared by Learning Path and flashcards
src/data/content/                     extracted study content
public/                               sw.js, manifest.json, .nojekyll (CSV files copied at build time)
src/styles/                           page styles scoped under .pg-landing, .pg-quiz, .pg-outline, .pg-ncsa, .pg-explained, .pg-lesson, .pg-learning, .pg-flashcard, .pg-mindmap, .pg-games and .pg-<game>
scripts/                              bank, content and game generators, verifiers, URL audit, local static server
```

Rules from the root `CLAUDE.md` still apply: neo-brutalist tokens, the exact Google Fonts URL, IBM Plex Sans Thai fallbacks, no emoji, no `system-ui`, no double dash in user facing text.
