'use client';

import { useEffect, useRef, useState } from 'react';
import data from '@/data/games/domain-sort.json';
import { now, shuffled, useLater } from './shared';

interface Concept { t: string; h: string; d: number }
interface Result { term: string; expected: number; got: number; correct: boolean }
interface Summary { title: string; correct: number; wrong: number; streak: number; time: string; button: string; results: Result[] }

const CONCEPTS = data.concepts as Concept[];
const D_COLORS = data.colors as Record<string, string>;
const D_NAMES = data.names as Record<string, string>;
const BUCKETS = [
  { d: 1, en: 'Security Principles', th: 'หลักการรักษาความปลอดภัย' },
  { d: 2, en: 'BC, DR & IR', th: 'ความต่อเนื่องทางธุรกิจ' },
  { d: 3, en: 'Access Controls', th: 'การควบคุมการเข้าถึง' },
  { d: 4, en: 'Network Security', th: 'ความปลอดภัยเครือข่าย' },
  { d: 5, en: 'Security Operations', th: 'การปฏิบัติการรักษาความปลอดภัย' },
];

export default function DomainSort() {
  const [started, setStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [rounds, setRounds] = useState<Concept[][]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [totals, setTotals] = useState({ correct: 0, wrong: 0 });
  const [roundScore, setRoundScore] = useState({ correct: 0, wrong: 0, streak: 0, best: 0 });
  const [questionIdx, setQuestionIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState<number | null>(null);
  const [flash, setFlash] = useState<'' | ' correct-flash' | ' wrong-flash'>('');
  const [cardDragging, setCardDragging] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [timerText, setTimerText] = useState('0s');
  const [startTime, setStartTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [game, setGame] = useState(0);
  const locked = useRef(false);
  const gen = useRef(0);
  const later = useLater();

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTimerText(Math.floor((now() - startTime) / 1000) + 's'), 200);
    return () => clearInterval(id);
  }, [playing, startTime]);

  function loadRound(idx: number) {
    gen.current++;
    locked.current = false;
    setRoundIdx(idx);
    setRoundScore({ correct: 0, wrong: 0, streak: 0, best: 0 });
    setQuestionIdx(0);
    setCardIdx(0);
    setFlash('');
    setResults([]);
    setStartTime(now());
    setPlaying(true);
    setShowSummary(false);
  }

  function startGame() {
    const pool = shuffled(CONCEPTS);
    setRounds([pool.slice(0, 10), pool.slice(10, 20), pool.slice(20, 30), pool.slice(30, 40)]);
    setTotals({ correct: 0, wrong: 0 });
    setGame(g => g + 1);
    setStarted(true);
    loadRound(0);
  }

  function endRound(rs: typeof roundScore, tot: typeof totals, list: Result[]) {
    setPlaying(false);
    const elapsed = Math.floor((now() - startTime) / 1000);
    const final = roundIdx >= 3;
    const pct = Math.round(tot.correct / (tot.correct + tot.wrong) * 100);
    setSummary({
      title: final ? 'จบเกม!' : 'สรุปรอบที่ ' + (roundIdx + 1),
      correct: rs.correct,
      wrong: rs.wrong,
      streak: rs.best,
      time: final ? 'รอบนี้: ' + elapsed + 's | รวม: ' + tot.correct + '/' + (tot.correct + tot.wrong) + ' (' + pct + '%)' : 'Time: ' + elapsed + 's',
      button: final ? 'เล่นใหม่' : 'รอบถัดไป',
      results: list,
    });
    setShowSummary(true);
  }

  function pickDomain(d: number) {
    if (!started || locked.current || cardIdx === null || questionIdx >= 10) return;
    locked.current = true;
    const c = rounds[roundIdx][questionIdx];
    const correct = d === c.d;
    const list = [...results, { term: c.t, expected: c.d, got: d, correct }];
    const streak = correct ? roundScore.streak + 1 : 0;
    const rs = {
      correct: roundScore.correct + (correct ? 1 : 0),
      wrong: roundScore.wrong + (correct ? 0 : 1),
      streak,
      best: Math.max(roundScore.best, streak),
    };
    const tot = { correct: totals.correct + (correct ? 1 : 0), wrong: totals.wrong + (correct ? 0 : 1) };
    const nextQ = questionIdx + 1;
    setResults(list);
    setFlash(correct ? ' correct-flash' : ' wrong-flash');
    setRoundScore(rs);
    setTotals(tot);
    setQuestionIdx(nextQ);
    const g = gen.current;
    later(() => {
      if (gen.current !== g) return;
      locked.current = false;
      if (nextQ >= 10) { endRound(rs, tot, list); return; }
      setCardIdx(nextQ);
      setFlash('');
      setCardDragging(false);
    }, correct ? 400 : 800);
  }

  function nextRound() {
    if (roundIdx >= 3) { startGame(); return; }
    loadRound(roundIdx + 1);
  }

  const card = started && cardIdx !== null ? rounds[roundIdx]?.[cardIdx] : undefined;

  return (
    <div className="pg-domain-sort pg-game">
      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">Mini Game 2 / 8</div>
          <h1>Domain Sort จัดหมวดหมู่</h1>
          <div className="sub">concept โผล่มา : เลือก (หรือลาก) ใส่ Domain ที่ถูกต้อง : 4 รอบ รอบละ 10</div>
        </div>

        <div id="startScreen" className={'start-screen' + (started ? ' hidden' : '')}>
          <p>concept จะปรากฏทีละใบ ให้แตะ (หรือลาก) ลงถังโดเมนที่ถูกต้อง<br />ทั้งหมด 4 รอบ รอบละ 10 concept<br />จับเวลาและนับ streak!</p>
          <button className="btn green" onClick={startGame}>เริ่มเกม</button>
        </div>

        <div id="gameUI" className={started && !showSummary ? '' : 'hidden'}>
          <div className="scoreboard">
            <div className="score-item"><div>ROUND</div><div className="val" id="roundNum">{`${roundIdx + 1}/4`}</div></div>
            <div className="score-item"><div>CORRECT</div><div className="val" id="correctNum">{totals.correct}</div></div>
            <div className="score-item wrong"><div>WRONG</div><div className="val" id="wrongNum">{totals.wrong}</div></div>
            <div className="score-item streak"><div>STREAK</div><div className="val" id="streakNum">{roundScore.streak}</div></div>
            <div className="score-item timer"><div>TIME</div><div className="val" id="timerNum">{timerText}</div></div>
            <div className="score-item"><div>Q</div><div className="val" id="qNum">{`${questionIdx}/10`}</div></div>
          </div>

          <div className="concept-zone" id="conceptZone">
            {card && (
              <div
                key={`${game}:${roundIdx}:${cardIdx}`}
                className={'concept-card' + (cardDragging ? ' dragging' : '') + flash}
                id="currentCard"
                draggable="true"
                onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setCardDragging(true); }}
                onDragEnd={() => setCardDragging(false)}
              >
                {card.t}<span className="hint">{card.h}</span>
              </div>
            )}
          </div>

          <div className="buckets" id="buckets">
            {BUCKETS.map(b => (
              <div
                key={b.d}
                className={'bucket' + (hover === b.d ? ' hover' : '')}
                data-d={b.d}
                onClick={() => pickDomain(b.d)}
                onDragOver={e => e.preventDefault()}
                onDragEnter={e => { e.preventDefault(); setHover(b.d); }}
                onDragLeave={() => setHover(h => (h === b.d ? null : h))}
                onDrop={e => { e.preventDefault(); setHover(null); pickDomain(b.d); }}
              >
                <div className="bnum">{`D${b.d}`}</div>
                <div className="bname-en">{b.en}</div>
                <div className="bname-th">{b.th}</div>
              </div>
            ))}
          </div>
        </div>

        <div id="roundSummary" className={'round-summary' + (showSummary ? '' : ' hidden')}>
          <h2 id="summaryTitle">{summary ? summary.title : 'สรุปรอบ'}</h2>
          <div className="stat">ถูก: <span className="g" id="sumCorrect">{summary ? summary.correct : 0}</span> / ผิด: <span className="r" id="sumWrong">{summary ? summary.wrong : 0}</span></div>
          <div className="stat">Best Streak: <span className="p" id="sumStreak">{summary ? summary.streak : 0}</span></div>
          <div className="stat" id="sumTime">{summary ? summary.time : ''}</div>
          <div className="result-list" id="resultList">
            {summary && summary.results.map((r, i) => (
              <div key={i} className={'result-item ' + (r.correct ? 'ri-correct' : 'ri-wrong')}>
                <span className="ri-icon">{r.correct ? '\u2713' : '\u2717'}</span>
                <span className="ri-term">{r.term}</span>
                <span className="ri-dom" style={{ background: D_COLORS[r.expected] }}>{D_NAMES[r.expected]}</span>
                {!r.correct && <span className="ri-dom" style={{ background: 'var(--red)', marginLeft: 4, fontSize: 9 }}>{'you: D' + r.got}</span>}
              </div>
            ))}
          </div>
          <br />
          <button className="btn green" id="nextBtn" onClick={nextRound}>{summary ? summary.button : 'รอบถัดไป'}</button>
        </div>
      </div>
    </div>
  );
}
