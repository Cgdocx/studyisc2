import { DOMAINS } from './art';
import type { BattleDomain } from './types';

export const CYCLE = 8;
export const MOBS_PER = 5;
export const BOSS_TURNS = 3;
export const PLAYER_MAX = 100;
export const HIT = 40;
export const MOB_ATK = 15;
export const BOSS_ATK = 25;
export const BOSS_HEAL = 30;
export const REVIEW_MAX = 3;
export const REVIEW_CAP = 10;
export const CAP_HP = 30;

export interface Slot {
  stage: number;
  stages: number;
  pos: number;
  start: number;
  bossStart: number;
  isBoss: boolean;
  bossTurns: number;
}

export function slot(i: number, total: number): Slot {
  const start = Math.floor(i / CYCLE) * CYCLE;
  const pos = i - start;
  const bossStart = start + MOBS_PER;
  return {
    stage: start / CYCLE + 1,
    stages: Math.ceil(total / CYCLE),
    pos,
    start,
    bossStart,
    isBoss: pos >= MOBS_PER,
    bossTurns: Math.min(BOSS_TURNS, Math.max(0, total - bossStart)),
  };
}

export function domainOf(dom: number | undefined): BattleDomain {
  return DOMAINS[Math.min(Math.max(dom || 1, 1), 5) - 1];
}

export function shuffleIdx(n: number): number[] {
  const a = Array.from({ length: n }, (_, k) => k);
  for (let k = n - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
}

export function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function replay(node: HTMLElement | null, cls: string, pool?: string[]): void {
  if (!node) return;
  (pool || [cls]).forEach(c => node.classList.remove(c));
  void node.offsetWidth;
  node.classList.add(cls);
}
