'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { Answer, Lang, Question, Screen } from '@/components/quiz/types';
import { PLAYER_SVG } from './art';
import BattleReport from './BattleReport';
import {
  BOSS_ATK, BOSS_HEAL, CAP_HP, HIT, MOBS_PER, MOB_ATK, PLAYER_MAX, REVIEW_CAP, REVIEW_MAX,
  domainOf, reducedMotion, replay, shuffleIdx, slot,
} from './engine';
import Fighter from './Fighter';
import RevivePanel, { type ReviveView } from './RevivePanel';
import type { SpriteHandle } from './Sprite';
import StageRail from './StageRail';
import type { BattleStats, EnemyState, RailView } from './types';

interface Props {
  questions: Question[];
  current: number;
  answered: number | null;
  answers: Answer[];
  screen: Screen;
  lang: Lang;
  onLockChange: (locked: boolean) => void;
  onContinue: () => void;
}

interface ReviewQueue {
  queue: Question[];
  spare: Question[];
  need: number;
  ok: number;
  tries: number;
  cur: Question | null;
  perm: number[];
  answeredCur: boolean;
}

interface Engine {
  qref: Question[] | null;
  answers: number;
  index: number;
  hp: number;
  ko: boolean;
  locked: boolean;
  enemy: EnemyState | null;
  marks: Record<string, boolean>;
  stats: BattleStats;
  reported: boolean;
  rv: ReviewQueue | null;
  reviveView: ReviveView | null;
  rail: RailView | null;
  log: string;
  seq: number;
}

interface View {
  hp: number;
  enemy: EnemyState | null;
  rail: RailView | null;
  log: string;
  revive: ReviveView | null;
  report: { stats: BattleStats; hp: number } | null;
}

const emptyStats = (): BattleStats => ({
  mobs: 0, mobTotal: 0, bosses: 0, bossTotal: 0, ko: 0, bossArt: [], reviewTried: 0, reviewOk: 0,
});

export default function BattleLayer(props: Props) {
  const P = useRef(props);
  useLayoutEffect(() => { P.current = props; });
  const E = useRef<Engine>({
    qref: null, answers: 0, index: -1, hp: PLAYER_MAX, ko: false, locked: false, enemy: null, marks: {},
    stats: emptyStats(), reported: false, rv: null, reviveView: null, rail: null, log: '', seq: 0,
  });
  const timers = useRef<number[]>([]);
  const ps = useRef<SpriteHandle>(null);
  const es = useRef<SpriteHandle>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const reviveRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ hp: PLAYER_MAX, enemy: null, rail: null, log: '', revive: null, report: null });

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const clearTimers = () => { while (timers.current.length) clearTimeout(timers.current.pop()); };
  const commit = () => setView(v => ({
    ...v,
    hp: E.current.hp,
    enemy: E.current.enemy ? { ...E.current.enemy } : null,
    rail: E.current.rail,
    log: E.current.log,
    revive: E.current.reviveView,
  }));
  const setLock = (on: boolean) => {
    if (E.current.locked === on) return;
    E.current.locked = on;
    P.current.onLockChange(on);
  };

  const navHeight = () => {
    const nav = document.querySelector('.creative-global-nav');
    return nav ? nav.getBoundingClientRect().height : 0;
  };
  const bringIntoView = () => {
    const el = railRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    const navH = navHeight();
    if (top >= navH - 4) return;
    window.scrollTo({ top: Math.max(0, top + window.scrollY - navH - 8), behavior: reducedMotion() ? 'auto' : 'smooth' });
  };
  const pan = (fx: () => void, stay?: boolean) => {
    const arena = arenaRef.current;
    if (!arena) { fx(); return; }
    const r = arena.getBoundingClientRect();
    const navH = navHeight();
    const visible = r.bottom > navH + 80 && r.top < window.innerHeight - 80;
    if (reducedMotion() || visible || window.innerWidth > 600) { fx(); return; }
    window.scrollTo({ top: Math.max(0, r.top + window.scrollY - navH - 10), behavior: 'smooth' });
    later(fx, 380);
    if (stay) return;
    later(() => {
      const target = document.querySelector('.pg-quiz .explanation-box') || document.querySelector('.pg-quiz .nav-row');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1350);
  };
  const scrollRevive = () => {
    const box = reviveRef.current;
    if (!box) return;
    const top = box.getBoundingClientRect().top + window.scrollY - navHeight() - 10;
    window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  const buildRail = () => {
    const { questions, current } = P.current;
    const total = questions.length, sl = slot(current, total);
    const dots = [];
    for (let k = 0; k < MOBS_PER; k++) {
      const idx = sl.start + k;
      if (idx >= total) break;
      const m = E.current.marks[idx];
      dots.push({ label: 'M' + (k + 1), cls: m === true ? ' done' : m === false ? ' miss' : idx === current ? ' now' : '' });
    }
    if (sl.bossTurns > 0) {
      const bm = E.current.marks['b' + sl.stage];
      dots.push({ label: 'BOSS', cls: ' boss' + (bm === true ? ' done' : bm === false ? ' miss' : sl.isBoss ? ' now' : '') });
    }
    E.current.rail = { stage: sl.stage, stages: sl.stages, dots };
  };

  const endRevive = () => {
    E.current.rv = null;
    E.current.reviveView = null;
    setLock(false);
  };

  const reset = () => {
    clearTimers();
    endRevive();
    const total = P.current.questions.length;
    let mobTotal = 0, bossTotal = 0;
    for (let i = 0; i < total; i++) {
      const sl = slot(i, total);
      if (!sl.isBoss) mobTotal++;
      else if (sl.pos === MOBS_PER) bossTotal++;
    }
    Object.assign(E.current, {
      qref: P.current.questions, answers: 0, index: -1, hp: PLAYER_MAX, ko: false, enemy: null, marks: {},
      reported: false, stats: { ...emptyStats(), mobTotal, bossTotal },
    });
    ps.current?.reset();
    setView(v => ({ ...v, report: null }));
  };

  const showEnemy = (e: EnemyState) => {
    es.current?.reset();
    E.current.enemy = e;
    es.current?.play(e.boss ? 'boss-enter' : 'enter');
    if (e.boss) later(() => replay(arenaRef.current, 'quake'), 520);
  };

  const spawn = () => {
    const { questions, current } = P.current;
    const total = questions.length, q = questions[current], sl = slot(current, total);
    clearTimers();
    let note = '';
    if (E.current.ko) {
      E.current.ko = false;
      E.current.hp = PLAYER_MAX;
      ps.current?.reset();
      endRevive();
      note = 'ฟื้นคืนชีพ : ';
    }
    if (!sl.isBoss) {
      const d = domainOf(q.dom);
      showEnemy({ boss: false, d, m: d.mobs[sl.pos % d.mobs.length], hp: HIT, max: HIT });
      E.current.log = note + E.current.enemy!.m.th + ' ปรากฏตัว! ตอบถูกเพื่อโจมตี';
    } else if (sl.pos === MOBS_PER || !E.current.enemy || !E.current.enemy.boss) {
      const d = domainOf(questions[sl.bossStart].dom);
      const hp = HIT * sl.bossTurns;
      showEnemy({ boss: true, d, m: d.boss, hp, max: hp });
      E.current.log = note + 'บอส ' + d.boss.th + ' ปรากฏตัว! ตอบถูก ' + sl.bossTurns + ' ข้อติดเพื่อล้ม';
    } else {
      E.current.log = note + 'บอสยังยืนอยู่ : เหลืออีก ' + (sl.bossStart + sl.bossTurns - current) + ' เทิร์น';
    }
    buildRail();
    commit();
    later(bringIntoView, 0);
  };

  const turn = (a: Answer) => {
    const e = E.current.enemy;
    if (!e) return;
    const total = P.current.questions.length, sl = slot(a.qIndex, total);
    const lastBossTurn = sl.isBoss && a.qIndex === sl.bossStart + sl.bossTurns - 1;
    const prefix = a.timedOut ? 'หมดเวลา! ' : '';
    const fx: (() => void)[] = [];
    if (a.isCorrect) {
      e.hp = Math.max(0, e.hp - HIT);
      const down = e.hp <= 0;
      fx.push(() => {
        ps.current?.play('lunge-r');
        later(() => {
          es.current?.play('shake');
          es.current?.flash('flash-hit');
          es.current?.slash();
          es.current?.pop('-' + HIT, 'hit');
        }, 160);
        if (down) later(() => es.current?.mark('defeat'), 560);
      });
      if (!e.boss) {
        E.current.stats.mobs++;
        E.current.marks[a.qIndex] = true;
        E.current.log = '[HIT] ล้ม ' + e.m.th + ' (' + e.m.en + ') สำเร็จ';
      } else if (down) {
        E.current.stats.bosses++;
        E.current.stats.bossArt.push(e.m.svg);
        E.current.marks['b' + sl.stage] = true;
        const heal = Math.min(BOSS_HEAL, PLAYER_MAX - E.current.hp);
        E.current.hp += heal;
        fx.push(() => { if (heal > 0) later(() => ps.current?.pop('+' + heal, 'heal'), 700); });
        E.current.log = '[HIT] ล้มบอส ' + e.m.th + ' แล้ว! ได้รางวัล +' + heal + ' HP';
      } else {
        E.current.log = '[HIT] โจมตีบอส -' + HIT + ' HP เหลือ ' + e.hp;
      }
    } else {
      const dmg = e.boss ? BOSS_ATK : MOB_ATK;
      E.current.hp = Math.max(0, E.current.hp - dmg);
      const ko = E.current.hp <= 0;
      fx.push(() => {
        es.current?.play('lunge-l');
        later(() => {
          ps.current?.play('shake');
          ps.current?.flash('flash-hurt');
          ps.current?.pop('-' + dmg, 'hurt');
        }, 160);
        if (ko) later(() => ps.current?.mark('defeat'), 600);
        if (!e.boss || lastBossTurn) later(() => es.current?.mark('flee'), 760);
      });
      if (!e.boss) E.current.marks[a.qIndex] = false;
      if (lastBossTurn) E.current.marks['b' + sl.stage] = false;
      let msg = prefix + '[MISS] โดนตี -' + dmg + ' HP';
      if (!e.boss) msg += ' : ' + e.m.th + ' หนีไปแล้ว';
      else if (lastBossTurn) msg += ' : บอสหนีไปได้';
      if (ko) {
        E.current.ko = true;
        E.current.stats.ko++;
        msg += ' : หมดแรง! ทบทวนข้อที่ผิดเพื่อฟื้นคืนชีพ';
        setLock(true);
      }
      E.current.log = msg;
    }
    buildRail();
    commit();
    if (E.current.ko) {
      pan(() => fx.forEach(f => f()), true);
      later(startRevive, reducedMotion() ? 0 : 1150);
    } else {
      pan(() => fx.forEach(f => f()));
    }
  };

  const startRevive = () => {
    if (!E.current.ko || E.current.rv) return;
    const { answers, questions } = P.current;
    const wrong: Question[] = [];
    const seen = new Set<number>();
    for (let k = answers.length - 1; k >= 0; k--) {
      const a = answers[k];
      if (a.isCorrect || seen.has(a.qIndex)) continue;
      seen.add(a.qIndex);
      const q = questions[a.qIndex];
      if (q && q.options && q.options.length) wrong.push(q);
    }
    if (!wrong.length) { revive('none'); return; }
    const need = Math.min(REVIEW_MAX, wrong.length);
    E.current.rv = { queue: wrong.slice(0, need), spare: wrong.slice(need), need, ok: 0, tries: 0, cur: null, perm: [], answeredCur: false };
    nextReview();
    later(scrollRevive, 40);
  };

  const nextReview = () => {
    const r = E.current.rv;
    if (!r) return;
    if (r.ok >= r.need) { revive('full'); return; }
    if (r.tries >= REVIEW_CAP) { revive('cap'); return; }
    r.cur = r.queue.shift()!;
    r.perm = shuffleIdx(r.cur.options.length);
    r.answeredCur = false;
    E.current.reviveView = {
      phase: 'ask', key: ++E.current.seq, need: r.need, ok: r.ok, tries: r.tries, q: r.cur, perm: r.perm,
      picked: null, correct: false, gain: 0, note: '', final: 'none',
    };
    commit();
  };

  const reviewAnswer = (j: number) => {
    const r = E.current.rv;
    if (!r || !r.cur || r.answeredCur) return;
    r.answeredCur = true;
    const q = r.cur, ok = r.perm[j] === q.correct_idx;
    r.tries++;
    E.current.stats.reviewTried++;
    let gain = 0, note = '';
    if (ok) {
      r.ok++;
      E.current.stats.reviewOk++;
      const target = Math.round((PLAYER_MAX * r.ok) / r.need);
      gain = Math.max(0, target - E.current.hp);
      E.current.hp = Math.max(E.current.hp, target);
      if (gain > 0) ps.current?.pop('+' + gain, 'heal');
    } else {
      note = 'ข้อนี้จะกลับมาให้ลองใหม่';
      if (r.spare.length) {
        r.queue.push(r.spare.shift()!);
        r.spare.push(q);
        note = 'ลองข้อที่เคยผิดข้ออื่นแทน ข้อนี้อาจวนกลับมา';
      } else {
        r.queue.push(q);
      }
    }
    const done = r.ok >= r.need, capped = !done && r.tries >= REVIEW_CAP;
    E.current.reviveView = {
      phase: 'answered', key: E.current.seq, need: r.need, ok: r.ok, tries: r.tries, q, perm: r.perm,
      picked: j, correct: ok, gain, note, final: done ? 'full' : capped ? 'cap' : 'none',
    };
    commit();
  };

  const revive = (reason: 'none' | 'full' | 'cap') => {
    const before = E.current.hp;
    E.current.hp = reason === 'cap' ? Math.max(E.current.hp, CAP_HP) : PLAYER_MAX;
    E.current.ko = false;
    E.current.rv = null;
    ps.current?.reset();
    ps.current?.play('enter');
    if (E.current.hp > before) ps.current?.pop('+' + (E.current.hp - before), 'heal');
    if (reason === 'none') {
      endRevive();
      E.current.log = 'ฟื้นคืนชีพทันที : ไม่มีข้อผิดให้ทบทวน';
      commit();
      return;
    }
    const msg = reason === 'cap'
      ? 'ทบทวนครบ ' + REVIEW_CAP + ' ครั้งแล้ว ฟื้นคืนชีพฉุกเฉินด้วย HP ' + E.current.hp
      : 'ฟื้นคืนชีพเต็ม HP ' + E.current.hp + ' : พร้อมสู้ต่อ';
    E.current.log = msg;
    E.current.reviveView = { phase: 'done', key: ++E.current.seq, reason, msg };
    commit();
    later(scrollRevive, 40);
  };

  const continueFight = () => {
    endRevive();
    commit();
    P.current.onContinue();
  };

  const report = () => {
    if (E.current.reported) return;
    E.current.reported = true;
    clearTimers();
    setView(v => ({ ...v, report: { stats: { ...E.current.stats, bossArt: [...E.current.stats.bossArt] }, hp: E.current.hp } }));
  };

  const { questions, answers, current, answered, screen } = props;
  useEffect(() => {
    if (questions !== E.current.qref) reset();
    if (screen === 'results') {
      if (!E.current.reported) {
        endRevive();
        commit();
        report();
      }
      return;
    }
    if (answers.length > E.current.answers) {
      E.current.answers = answers.length;
      turn(answers[answers.length - 1]);
      return;
    }
    if (current !== E.current.index && answered === null) {
      E.current.index = current;
      spawn();
    }
  });

  useEffect(() => () => {
    while (timers.current.length) clearTimeout(timers.current.pop());
    P.current.onLockChange(false);
  }, []);

  const e = view.enemy;
  return (
    <div className="qb-root on" id="qb-root" aria-live="polite">
      {view.report ? (
        <BattleReport stats={view.report.stats} hp={view.report.hp} />
      ) : (
        <div id="qb-battle">
          <StageRail rail={view.rail} ref={railRef} />
          <div
            className={'qb-arena' + (e && e.boss ? ' boss-mode' : '')}
            id="qb-arena"
            ref={arenaRef}
            style={e ? ({ '--qb-tint': e.d.tint } as CSSProperties) : undefined}
          >
            <Fighter side="player" tag="ผู้เล่น" name="Sec Analyst" nameTh="ผู้พิทักษ์ข้อมูล" hp={view.hp} max={PLAYER_MAX} svg={PLAYER_SVG} spriteRef={ps} />
            <Fighter
              side="enemy"
              tag={e ? (e.boss ? 'บอส D' : 'มอน D') + e.d.id + ' · ' + e.d.en : ''}
              name={e ? e.m.en : ''}
              nameTh={e ? e.m.th : ''}
              hp={e ? e.hp : 0}
              max={e ? e.max : 0}
              svg={e ? e.m.svg : ''}
              boss={!!(e && e.boss)}
              spriteRef={es}
            />
          </div>
          <div className="qb-log" id="qb-log">{view.log}</div>
          {view.revive && (
            <RevivePanel
              ref={reviveRef}
              view={view.revive}
              lang={props.lang}
              onPick={reviewAnswer}
              onNext={() => nextReview()}
              onContinue={continueFight}
            />
          )}
        </div>
      )}
    </div>
  );
}
