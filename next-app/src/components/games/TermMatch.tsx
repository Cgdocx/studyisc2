'use client';

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react';
import data from '@/data/games/term-match.json';
import { shuffled, useLater } from './shared';

interface Pair { t: string; d: string; dom: number }
interface Round { pairs: Pair[]; terms: number[]; defs: number[] }
interface Score { correct: number; wrong: number }
interface Summary { title: string; correct: number; wrong: number; accuracy: string; button: string }
interface Ghost { idx: number; className: string; width: number; x: number; y: number }

const PAIRS = data.pairs as Pair[];
const DOMAIN_NAMES = data.domainNames as Record<string, string>;
const ZERO: Score = { correct: 0, wrong: 0 };

function makeRound(pairs: Pair[]): Round {
  return {
    pairs,
    terms: shuffled(pairs).map(p => pairs.indexOf(p)),
    defs: shuffled(pairs).map(p => pairs.indexOf(p)),
  };
}

const bump = (m: Record<number, number>, k: number, d: number) => ({ ...m, [k]: Math.max(0, (m[k] || 0) + d) });

export default function TermMatch() {
  const [started, setStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [rounds, setRounds] = useState<Pair[][]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [total, setTotal] = useState<Score>(ZERO);
  const [roundScore, setRoundScore] = useState<Score>(ZERO);
  const [matched, setMatched] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [wrongDef, setWrongDef] = useState<Record<number, number>>({});
  const [wrongTerm, setWrongTerm] = useState<Record<number, number>>({});
  const [dragging, setDragging] = useState<number | null>(null);
  const [hoverDef, setHoverDef] = useState<number | null>(null);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const later = useLater();
  const gen = useRef(0);
  const dragIdx = useRef<number | null>(null);
  const touch = useRef<{ idx: number; el: HTMLElement } | null>(null);
  const termsCol = useRef<HTMLDivElement>(null);

  function loadRound(idx: number, all: Pair[][]) {
    gen.current++;
    setRoundIdx(idx);
    setRound(makeRound(all[idx]));
    setRoundScore(ZERO);
    setMatched([]);
    setSelected(null);
    setWrongDef({});
    setWrongTerm({});
    setShowSummary(false);
  }

  function startGame() {
    const pool = shuffled(PAIRS);
    const all = [pool.slice(0, 8), pool.slice(8, 16), pool.slice(16, 24)];
    setRounds(all);
    setTotal(ZERO);
    setStarted(true);
    loadRound(0, all);
  }

  function nextRound() {
    if (roundIdx >= 2) { startGame(); return; }
    loadRound(roundIdx + 1, rounds);
  }

  function showRoundSummary(rs: Score, tot: Score, idx: number) {
    const pct = rs.correct > 0 ? Math.round(rs.correct / (rs.correct + rs.wrong) * 100) : 0;
    const final = idx >= 2;
    const totalPct = Math.round(tot.correct / (tot.correct + tot.wrong) * 100);
    setSummary({
      title: final ? 'จบเกม!' : 'สรุปรอบที่ ' + (idx + 1),
      button: final ? 'เล่นใหม่' : 'รอบถัดไป',
      correct: rs.correct,
      wrong: rs.wrong,
      accuracy: final
        ? 'รอบนี้: ' + pct + '% | รวมทั้งหมด: ' + totalPct + '% (' + tot.correct + '/' + (tot.correct + tot.wrong) + ')'
        : 'Accuracy: ' + pct + '%',
    });
    setShowSummary(true);
  }

  function checkMatch(termIdx: number | null, defIdx: number) {
    if (termIdx === null || !round) return;
    const g = gen.current;
    if (termIdx === defIdx) {
      const nextMatched = [...matched, defIdx];
      const rs = { ...roundScore, correct: roundScore.correct + 1 };
      const tot = { ...total, correct: total.correct + 1 };
      setMatched(nextMatched);
      setRoundScore(rs);
      setTotal(tot);
      if (nextMatched.length >= 8) later(() => { if (gen.current === g) showRoundSummary(rs, tot, roundIdx); }, 600);
    } else {
      setWrongDef(m => bump(m, defIdx, 1));
      setWrongTerm(m => bump(m, termIdx, 1));
      setRoundScore(s => ({ ...s, wrong: s.wrong + 1 }));
      setTotal(s => ({ ...s, wrong: s.wrong + 1 }));
      later(() => {
        if (gen.current !== g) return;
        setWrongDef(m => bump(m, defIdx, -1));
        setWrongTerm(m => bump(m, termIdx, -1));
      }, 800);
    }
    setSelected(null);
  }

  function termClick(idx: number) {
    if (matched.includes(idx)) return;
    setSelected(idx);
  }

  function defClick(idx: number) {
    if (selected === null || matched.includes(idx)) return;
    checkMatch(selected, idx);
  }

  const onTouchStart = useEffectEvent((e: TouchEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('.term-card');
    if (!el) return;
    const idx = Number(el.dataset.idx);
    if (matched.includes(idx)) return;
    touch.current = { idx, el };
    dragIdx.current = idx;
  });

  const onTouchMove = useEffectEvent((e: TouchEvent) => {
    const t = touch.current;
    if (!t) return;
    e.preventDefault();
    const p = e.touches[0];
    const over = document.elementFromPoint(p.clientX, p.clientY);
    setHoverDef(over && over.classList.contains('def-card') ? Number((over as HTMLElement).dataset.idx) : null);
    if (!ghost) setDragging(t.idx);
    setGhost(g => g
      ? { ...g, x: p.clientX - 40, y: p.clientY - 20 }
      : { idx: t.idx, className: t.el.className, width: t.el.offsetWidth, x: p.clientX - 40, y: p.clientY - 20 });
  });

  const onTouchEnd = useEffectEvent((e: TouchEvent) => {
    const t = touch.current;
    if (!t) return;
    setDragging(null);
    if (ghost) {
      const p = e.changedTouches[0];
      setGhost(null);
      setHoverDef(null);
      const target = document.elementFromPoint(p.clientX, p.clientY) as HTMLElement | null;
      if (target && target.classList.contains('def-card') && !target.classList.contains('matched-correct')) checkMatch(dragIdx.current, Number(target.dataset.idx));
    } else {
      termClick(t.idx);
    }
    touch.current = null;
  });

  useEffect(() => {
    const col = termsCol.current;
    if (!col) return;
    const start = (e: TouchEvent) => onTouchStart(e);
    const move = (e: TouchEvent) => onTouchMove(e);
    const end = (e: TouchEvent) => onTouchEnd(e);
    col.addEventListener('touchstart', start, { passive: false });
    col.addEventListener('touchmove', move, { passive: false });
    col.addEventListener('touchend', end);
    return () => {
      col.removeEventListener('touchstart', start);
      col.removeEventListener('touchmove', move);
      col.removeEventListener('touchend', end);
    };
  }, []);

  const termClass = (idx: number) => 'term-card'
    + (selected === idx ? ' selected' : '')
    + (matched.includes(idx) ? ' matched' : '')
    + (wrongTerm[idx] ? ' matched-wrong-flash' : '')
    + (dragging === idx ? ' dragging' : '');

  const termName = (p: Pair) => (p.t + ' ' + DOMAIN_NAMES[p.dom]).replace(/D[1-5]$/, '').trim();

  return (
    <div className="pg-term-match pg-game">
      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">Mini Game 1 / 8</div>
          <h1>Term Match จับคู่คำศัพท์</h1>
          <div className="sub">ลาก term ไปวางบน definition ที่ถูกต้อง : 3 รอบ รอบละ 8 คู่ ครบ 5 Domains</div>
        </div>

        <div id="startScreen" className={'start-screen' + (started ? ' hidden' : '')}>
          <p>ลาก (หรือแตะ) คำศัพท์จากคอลัมน์ซ้ายไปจับคู่กับคำอธิบายที่ถูกต้องในคอลัมน์ขวา<br />ทั้งหมด 3 รอบ รอบละ 8 คู่</p>
          <button className="btn green" onClick={startGame}>เริ่มเกม</button>
        </div>

        <div id="gameUI" className={started && !showSummary ? '' : 'hidden'}>
          <div className="scoreboard">
            <div className="score-item"><div>ROUND</div><div className="val" id="roundNum">{`${roundIdx + 1}/3`}</div></div>
            <div className="score-item"><div>CORRECT</div><div className="val" id="correctNum">{total.correct}</div></div>
            <div className="score-item wrong"><div>WRONG</div><div className="val" id="wrongNum">{total.wrong}</div></div>
            <div className="score-item"><div>MATCHED</div><div className="val" id="matchedNum">{`${matched.length}/8`}</div></div>
          </div>
          <div className="game-area">
            <div>
              <div className="column-label">Terms (คำศัพท์)</div>
              <div id="termsCol" ref={termsCol}>
                {round && round.terms.map(idx => {
                  const p = round.pairs[idx];
                  return (
                    <div
                      key={`${roundIdx}:${idx}`}
                      className={termClass(idx)}
                      draggable="true"
                      data-idx={idx}
                      onDragStart={e => { dragIdx.current = idx; setDragging(idx); e.dataTransfer.effectAllowed = 'move'; }}
                      onDragEnd={() => setDragging(null)}
                      onClick={() => termClick(idx)}
                    >
                      {p.t} <span className="domain-tag">{DOMAIN_NAMES[p.dom]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="column-label">Definitions (คำอธิบาย)</div>
              <div id="defsCol">
                {round && round.defs.map(idx => {
                  const p = round.pairs[idx];
                  const ok = matched.includes(idx);
                  return (
                    <div
                      key={`${roundIdx}:${idx}`}
                      className={'def-card' + (hoverDef === idx ? ' drop-hover' : '') + (ok ? ' matched-correct' : '') + (wrongDef[idx] ? ' matched-wrong' : '')}
                      data-idx={idx}
                      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                      onDragEnter={e => { e.preventDefault(); setHoverDef(idx); }}
                      onDragLeave={() => setHoverDef(h => (h === idx ? null : h))}
                      onDrop={e => { e.preventDefault(); setHoverDef(null); checkMatch(dragIdx.current, idx); }}
                      onClick={() => defClick(idx)}
                    >
                      {p.d}
                      {Array.from({ length: wrongDef[idx] || 0 }, (_, k) => <span key={k} className="matched-label wrong">{'// WRONG'}</span>)}
                      {ok && <span className="matched-label correct">{'// CORRECT : ' + termName(p)}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div id="roundSummary" className={'round-summary' + (showSummary ? '' : ' hidden')}>
          <h2 id="summaryTitle">{summary ? summary.title : 'สรุปรอบ'}</h2>
          <div className="stat">ถูก: <span className="g" id="sumCorrect">{summary ? summary.correct : 0}</span> / ผิด: <span className="r" id="sumWrong">{summary ? summary.wrong : 0}</span></div>
          <div className="stat" id="sumAccuracy">{summary ? summary.accuracy : ''}</div>
          <br />
          <button className="btn green" id="nextBtn" onClick={nextRound}>{summary ? summary.button : 'รอบถัดไป'}</button>
        </div>
      </div>
      {ghost && (
        <div
          className={ghost.className}
          style={{ position: 'fixed', pointerEvents: 'none', zIndex: 99999, opacity: 0.85, width: ghost.width, left: ghost.x, top: ghost.y } as CSSProperties}
        >
          {round && <>{round.pairs[ghost.idx].t} <span className="domain-tag">{DOMAIN_NAMES[round.pairs[ghost.idx].dom]}</span></>}
        </div>
      )}
    </div>
  );
}
