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
};

export function activeNavFor(pathname: string | null): NavKey | null {
  if (!pathname) return null;
  const clean = pathname.replace(/\/$/, '').replace(/\.html$/, '');
  const hit = Object.values(PORTED_ROUTES).find(p => p.route === clean);
  return hit ? hit.nav : null;
}

export function legacyHref(file: string): string {
  return `${BASE_PATH}/${file}`;
}
