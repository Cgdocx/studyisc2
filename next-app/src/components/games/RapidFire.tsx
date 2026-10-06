'use client';

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react';
import data from '@/data/games/rapid-fire.json';
import { readStored, shuffled, useLater, writeStored } from './shared';

interface Statement { s: string; a: boolean; d: string; e: string }
interface Results { score: number; correct: number; wrong: number; streak: number; high: number; record: boolean }

const STATEMENTS = data.statements as Statement[];
const HIDE: CSSProperties = { display: 'none' };
const SHOW: CSSProperties = { display: 'block' };

const multiplier = (streak: number) => (streak >= 10 ? 3 : streak >= 5 ? 2 : 1);

export default function RapidFire() {
  const [phase, setPhase] = useState<'start' | 'play' | 'results'>('start');
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRed, setTimerRed] = useState(false);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [deck, setDeck] = useState<Statement[]>([]);
  const [idx, setIdx] = useState(0);
  const [answering, setAnswering] = useState(false);
  const [flash, setFlash] = useState('');
  const [explain, setExplain] = useState('');
  const [badge, setBadge] = useState({ text: '', pop: false });
  const [results, setResults] = useState<Results | null>(null);
  const later = useLater();
  const gen = useRef(0);
  const left = useRef(60);

  function showStatement(nextIdx: number, currentDeck: Statement[]) {
    let d = currentDeck;
    let i = nextIdx;
    if (i >= d.length) d = shuffled(STATEMENTS);
    if (i >= d.length) i = 0;
    setDeck(d);
    setIdx(i);
    setExplain('');
    setFlash('');
    setAnswering(false);
  }

  function startGame() {
    gen.current++;
    setPhase('play');
    setRound(r => r + 1);
    left.current = 60;
    setTimeLeft(60);
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setStreak(0);
    setMaxStreak(0);
    showStatement(0, shuffled(STATEMENTS));
  }

  function endGame(finalScore: number) {
    setPhase('results');
    let hs = parseInt(readStored('rf_highscore') || '0', 10);
    const record = finalScore > hs;
    if (record) {
      writeStored('rf_highscore', String(finalScore));
      hs = finalScore;
    }
    setResults({ score: finalScore, correct, wrong, streak: maxStreak, high: hs, record });
  }

  function answer(val: boolean) {
    if (answering || timeLeft <= 0) return;
    setAnswering(true);
    const st = deck[idx];
    if (val === st.a) {
      const s = streak + 1;
      const m = multiplier(s);
      setCorrect(correct + 1);
      setStreak(s);
      if (s > maxStreak) setMaxStreak(s);
      setScore(score + 10 * m);
      setFlash(' flash-correct');
      if (s === 5 || s === 10) {
        setBadge({ text: 'x' + m + '!', pop: true });
        later(() => setBadge(b => ({ ...b, pop: false })), 600);
      }
    } else {
      setWrong(wrong + 1);
      setStreak(0);
      setFlash(' flash-wrong');
    }
    setExplain('  ' + st.e);
    const g = gen.current;
    later(() => { if (gen.current === g) showStatement(idx + 1, deck); }, 800);
  }

  const tick = useEffectEvent(() => {
    if (left.current <= 0) return;
    const t = --left.current;
    setTimeLeft(t);
    if (t <= 10) setTimerRed(true);
    if (t <= 0) endGame(score);
  });

  useEffect(() => {
    if (phase !== 'play') return;
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [phase, round]);

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (answering || timeLeft <= 0 || phase !== 'play') return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') answer(true);
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') answer(false);
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey(e);
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const st = deck[idx];
  return (
    <div className="pg-rapid-fire pg-game">
      <div className="wrap">
        <div className="game-header">
          <div className="eyebrow">Mini Game / Speed</div>
          <h1>Rapid Fire</h1>
          <div className="sub">ถูกหรือผิด? ตอบให้มากที่สุดภายใน 60 วินาที : Streak ยิ่งยาว คะแนนยิ่งทวีคูณ</div>
        </div>

        <div id="startScreen" style={phase === 'start' ? undefined : HIDE}>
          <div className="statement-card">
            <div className="statement-text">กดปุ่มด้านล่างเพื่อเริ่มเกม</div>
            <div className="statement-domain">80+ คำถามครอบคลุม 5 DOMAINS</div>
          </div>
          <button className="start-btn" onClick={startGame}>START GAME</button>
        </div>

        <div id="gameScreen" style={phase === 'play' ? SHOW : HIDE}>
          <div className="hud">
            <div className="hud-box"><div className="hud-label">เวลา</div><div className="hud-value timer" id="timer" style={timerRed ? { color: 'var(--red)' } : undefined}>{timeLeft}</div></div>
            <div className="hud-box"><div className="hud-label">คะแนน</div><div className="hud-value" id="score">{score}</div></div>
            <div className="hud-box"><div className="hud-label">Streak</div><div className="hud-value streak" id="streak">{streak}</div></div>
            <div className="hud-box"><div className="hud-label">ตัวคูณ</div><div className="hud-value" id="multiplier">{'x' + multiplier(streak)}</div></div>
          </div>
          <div className={'statement-card' + flash} id="statementCard">
            <div className="statement-text" id="statementText">{st ? st.s : ''}</div>
            <div className="statement-domain" id="statementDomain">{st ? st.d : ''}</div>
            <div className={'statement-explain' + (explain ? ' show' : '')} id="statementExplain">{explain}</div>
          </div>
          <div className="btn-row">
            <button className="game-btn btn-true" id="btnTrue" disabled={answering} onClick={() => answer(true)}>ถูก</button>
            <button className="game-btn btn-false" id="btnFalse" disabled={answering} onClick={() => answer(false)}>ผิด</button>
          </div>
        </div>

        <div className="results-card" id="resultsScreen" style={phase === 'results' ? SHOW : phase === 'play' && results ? HIDE : undefined}>
          <h2>หมดเวลา!</h2>
          <div className="results-grid">
            <div className="result-stat"><div className="val" id="finalScore">{results ? results.score : 0}</div><div className="lbl">คะแนนรวม</div></div>
            <div className="result-stat"><div className="val" id="finalCorrect">{results ? results.correct : 0}</div><div className="lbl">ตอบถูก</div></div>
            <div className="result-stat"><div className="val" id="finalWrong">{results ? results.wrong : 0}</div><div className="lbl">ตอบผิด</div></div>
            <div className="result-stat"><div className="val" id="finalStreak">{results ? results.streak : 0}</div><div className="lbl">Streak สูงสุด</div></div>
          </div>
          <div id="recordMsg" className="new-record" style={results && results.record ? SHOW : HIDE}>{results && results.record ? 'NEW HIGH SCORE!' : ''}</div>
          <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>HIGH SCORE: <span id="highScore">{results ? results.high : 0}</span></div>
          <button className="restart-btn" onClick={startGame}>PLAY AGAIN</button>
        </div>
      </div>

      <div className={'multiplier-badge' + (badge.pop ? ' pop' : '')} id="multiBadge">{badge.text}</div>
    </div>
  );
}
