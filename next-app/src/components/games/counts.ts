import beatClock from '@/data/games/beat-clock.json';
import defendCastle from '@/data/games/defend-castle.json';
import domainSort from '@/data/games/domain-sort.json';
import fillGap from '@/data/games/fill-gap.json';
import incidentTimeline from '@/data/games/incident-timeline.json';
import rapidFire from '@/data/games/rapid-fire.json';
import termMatch from '@/data/games/term-match.json';
import { PHISH_EMAILS_PER_GAME } from './phish-config';

/** The number each games hub card quotes as `{count}`, taken from the game data at build time (server only:
 * imported by the games hub page). */
export const HUB_COUNTS: Record<string, number> = {
  'game-term-match.html': termMatch.pairs.length,
  'game-domain-sort.html': domainSort.concepts.length,
  'game-rapid-fire.html': rapidFire.statements.length,
  'game-beat-clock.html': beatClock.questions.length,
  'game-incident-timeline.html': incidentTimeline.scenarios.length,
  'game-fill-gap.html': fillGap.questions.length,
  'game-defend-castle.html': defendCastle.threats.length,
  'game-phish-detect.html': PHISH_EMAILS_PER_GAME,
};

export function withCount(text: string, href: string): string {
  const n = HUB_COUNTS[href];
  if (n === undefined) throw new Error('No hub count for ' + href);
  return text.replaceAll('{count}', String(n));
}
