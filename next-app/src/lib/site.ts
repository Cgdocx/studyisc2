export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700;800&display=swap';

export type NavKey = 'path' | 'lesson' | 'flashcard' | 'exam' | 'explained' | 'games' | 'mindmap';

export interface NavLink {
  key: NavKey;
  label: string;
  file: string;
}

export const NAV_LINKS: NavLink[] = [
  { key: 'path', label: 'LEARNING PATH', file: 'learning-path.html' },
  { key: 'lesson', label: 'บทเรียน', file: 'lesson-domain-1.html' },
  { key: 'flashcard', label: 'FLASHCARD', file: 'flashcard.html' },
  { key: 'exam', label: 'ชุดข้อสอบ', file: 'isc2-cc-landing.html' },
  { key: 'explained', label: 'อธิบายทำไมผิด', file: 'quiz-explained.html' },
  { key: 'games', label: 'MINI GAMES', file: 'games.html' },
  { key: 'mindmap', label: 'MIND MAP', file: 'index.html' },
];

export const PORTED_ROUTES: Record<string, { route: string; nav: NavKey }> = {
  'isc2-cc-landing.html': { route: '/isc2-cc-landing', nav: 'exam' },
  'isc2_cc_BothThai-eng_583quiz.html': { route: '/isc2_cc_BothThai-eng_583quiz', nav: 'exam' },
  'isc2_cc_exam548_5Domain_dualTh-Eng.html': { route: '/isc2_cc_exam548_5Domain_dualTh-Eng', nav: 'exam' },
  '1832quiz_NewExamDomainTH.html': { route: '/1832quiz_NewExamDomainTH', nav: 'exam' },
  'isc2_cc_exam1NCSA_bi_no-track-50q.html': { route: '/isc2_cc_exam1NCSA_bi_no-track-50q', nav: 'exam' },
  'quiz-explained.html': { route: '/quiz-explained', nav: 'explained' },
  'lesson-domain-1.html': { route: '/lesson-domain-1', nav: 'lesson' },
  'lesson-domain-2.html': { route: '/lesson-domain-2', nav: 'lesson' },
  'lesson-domain-3.html': { route: '/lesson-domain-3', nav: 'lesson' },
  'lesson-domain-4.html': { route: '/lesson-domain-4', nav: 'lesson' },
  'lesson-domain-5.html': { route: '/lesson-domain-5', nav: 'lesson' },
  'learning-path.html': { route: '/learning-path', nav: 'path' },
  'flashcard.html': { route: '/flashcard', nav: 'flashcard' },
  'index.html': { route: '/', nav: 'mindmap' },
  'games.html': { route: '/games', nav: 'games' },
  'game-term-match.html': { route: '/game-term-match', nav: 'games' },
  'game-domain-sort.html': { route: '/game-domain-sort', nav: 'games' },
  'game-rapid-fire.html': { route: '/game-rapid-fire', nav: 'games' },
  'game-beat-clock.html': { route: '/game-beat-clock', nav: 'games' },
  'game-incident-timeline.html': { route: '/game-incident-timeline', nav: 'games' },
  'game-fill-gap.html': { route: '/game-fill-gap', nav: 'games' },
  'game-defend-castle.html': { route: '/game-defend-castle', nav: 'games' },
  'game-phish-detect.html': { route: '/game-phish-detect', nav: 'games' },
};

function cleanPath(pathname: string): string {
  const p = pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/\/+$/, '');
  return p || '/';
}

export function isMindMapPath(pathname: string | null): boolean {
  return pathname !== null && cleanPath(pathname) === '/';
}

export function activeNavFor(pathname: string | null): NavKey | null {
  if (!pathname) return null;
  const clean = cleanPath(pathname);
  const hit = Object.values(PORTED_ROUTES).find(p => p.route === clean);
  return hit ? hit.nav : null;
}

export function legacyHref(file: string): string {
  return `${BASE_PATH}/${file}`;
}
