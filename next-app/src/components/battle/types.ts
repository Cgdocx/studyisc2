export interface Monster {
  en: string;
  th: string;
  svg: string;
}

export interface BattleDomain {
  id: number;
  en: string;
  th: string;
  tint: string;
  mobs: Monster[];
  boss: Monster;
}

export type SpriteAnim = 'lunge-r' | 'lunge-l' | 'shake' | 'enter' | 'boss-enter';
export type DamageKind = 'hit' | 'hurt' | 'heal';

export interface EnemyState {
  boss: boolean;
  d: BattleDomain;
  m: Monster;
  hp: number;
  max: number;
}

export interface RailDot {
  label: string;
  cls: string;
}

export interface RailView {
  stage: number;
  stages: number;
  dots: RailDot[];
}

export interface BattleStats {
  mobs: number;
  mobTotal: number;
  bosses: number;
  bossTotal: number;
  ko: number;
  bossArt: string[];
  reviewTried: number;
  reviewOk: number;
}
