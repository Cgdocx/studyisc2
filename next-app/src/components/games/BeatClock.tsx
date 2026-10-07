'use client';

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react';
import data from '@/data/games/beat-clock.json';
import { now, readStored, shuffled, useLater, writeStored } from './shared';

interface Question { q: string; c: string[]; a: number; d: string; e: string }
interface Entry { total: number; correct: number; date: string }
interface Results { time: string; penalty: string; total: string; accuracy: string; board: Entry[]; entry: Entry }

const QUESTIONS = data.questions as Question[];
const TOTAL_Q = 20;
const LB_KEY = 'btc_leaderboard';
const HIDE: CSSProperties = { display: 'none' };
const SHOW: CSSProperties = { display: 'block' };

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

function getLeaderboard(): Entry[] {
  try {
    const v: unknown = JSON.parse(readStored(LB_KEY) || '[]');
    return Array.isArray(v) ? (v as Entry[]) : [];
  } catch {
    return [];
  }
}

const today = () => new Date().toLocaleDateString('th-TH');

export default function BeatClock() {
  const [phase, setPhase] = useState<'start' | 'play' | 'results'>('start');
  const [game, setGame] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timerText, setTimerText] = useState('0:00');
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const gen = useRef(0);
  const later = useLater();

  useEffect(() => {
    if (phase !== 'play') return;
    const id = setInterval(() => setTimerText(formatTime((Date.now() - startTime) / 1000)), 100);
    return () => clearInterval(id);
  }, [phase, startTime, game]);

  function startGame() {
    gen.current++;
    setQuestions(shuffled(QUESTIONS).slice(0, TOTAL_Q));
    setCurrent(0);
    setCorrectCount(0);
    setPenalty(0);
    setPicked(null);
    setFinished(false);
    setStartTime(now());
    setGame(g => g + 1);
    setPhase('play');
  }

  function endGame(correct: number, penaltyTime: number) {
    const elapsed = (now() - startTime) / 1000;
    const total = elapsed + penaltyTime;
    const entry: Entry = { total: Math.round(total * 10) / 10, correct, date: today() };
    let board = getLeaderboard();
    board.push(entry);
    board.sort((a, b) => a.total - b.total);
    board = board.slice(0, 10);
    writeStored(LB_KEY, JSON.stringify(board));
    setFinished(true);
    setPhase('results');
    setResults({
      time: formatTime(elapsed),
      penalty: '+' + penaltyTime + 's',
      total: formatTime(total),
      accuracy: Math.round(correct / TOTAL_Q * 100) + '%',
      board,
      entry,
    });
  }

  function selectAnswer(idx: number) {
    if (picked !== null || phase !== 'play') return;
    const q = questions[current];
    setPicked(idx);
    const correct = correctCount + (idx === q.a ? 1 : 0);
    const pen = penalty + (idx === q.a ? 0 : 5);
    setCorrectCount(correct);
    setPenalty(pen);
    if (current >= TOTAL_Q - 1) {
      const g = gen.current;
      later(() => { if (gen.current === g) endGame(correct, pen); }, 800);
    }
  }

  function nextQuestion() {
    setCurrent(current + 1);
    setPicked(null);
  }

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (phase !== 'play') return;
    if (picked === null) {
      if (e.key === '1' || e.key === 'a' || e.key === 'A') selectAnswer(0);
      if (e.key === '2' || e.key === 'b' || e.key === 'B') selectAnswer(1);
      if (e.key === '3' || e.key === 'c' || e.key === 'C') selectAnswer(2);
      if (e.key === '4' || e.key === 'd' || e.key === 'D') selectAnswer(3);
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (current < TOTAL_Q - 1) nextQuestion();
    }
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey(e);
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const q = questions[current];
  const answered = picked !== null;
  return (
    <div className="pg-beat-clock pg-game">
      <div className="wrap">
        <div className="game-header">
          <div className="eyebrow">Mini Game / Speed</div>
          <h1>Beat the Clock</h1>
          <div className="sub">ตอบ 20 ข้อให้เร็วที่สุด ยิ่งเร็วยิ่งดี ยิ่งถูกยิ่งเก่ง</div>
        </div>

        <div id="startScreen" style={phase === 'start' ? undefined : HIDE}>
          <div className="question-card" style={{ textAlign: 'center' }}>
            <div className="q-text">{`ระบบจะสุ่ม ${TOTAL_Q} ข้อจากคลัง ${QUESTIONS.length} คำถาม ครอบคลุม 5 Domains`}<br />นาฬิกาเดินตั้งแต่เริ่ม : ตอบผิดมี Penalty +5 วินาที</div>
          </div>
          <button className="start-btn" onClick={startGame}>START</button>
        </div>

        <div id="gameScreen" style={phase === 'play' ? SHOW : HIDE}>
          <div className="hud">
            <div className="hud-box"><div className="hud-label">ข้อที่</div><div className="hud-value" id="qNum">{`${current + 1}/${TOTAL_Q}`}</div></div>
            <div className="hud-box"><div className="hud-label">เวลา</div><div className="hud-value" id="timer">{timerText}</div></div>
            <div className="hud-box"><div className="hud-label">ถูก</div><div className="hud-value" id="correctCount" style={{ color: 'var(--green)' }}>{correctCount}</div></div>
            <div className="hud-box"><div className="hud-label">Penalty</div><div className="hud-value" id="penalty" style={{ color: 'var(--red)' }}>{`+${penalty}s`}</div></div>
          </div>
          <div className="progress-bar"><div className="progress-fill" id="progressFill" style={{ width: (finished ? 100 : current / TOTAL_Q * 100) + '%' }}></div></div>
          <div className="question-card" id="questionCard">
            <div className="q-number" id="qLabel">{q ? 'Question ' + (current + 1) : ''}</div>
            <div className="q-domain" id="qDomain">{q ? q.d : ''}</div>
            <div className="q-text" id="qText">{q ? q.q : ''}</div>
            <div className="choices" id="choices">
              {q && q.c.map((c, i) => (
                <button
                  key={`${game}:${current}:${i}`}
                  className={'choice-btn' + (answered && i === q.a ? ' correct' : '') + (answered && i === picked && picked !== q.a ? ' wrong' : '')}
                  disabled={answered}
                  onClick={() => selectAnswer(i)}
                >
                  {String.fromCharCode(65 + i) + '. ' + c}
                </button>
              ))}
            </div>
            <div className={'explain-box' + (answered ? ' show' : '')} id="explainBox">{answered && q ? q.e : ''}</div>
          </div>
          <button className="next-btn" id="nextBtn" style={questions.length === 0 ? undefined : answered && current < TOTAL_Q - 1 ? SHOW : HIDE} onClick={nextQuestion}>{'NEXT >>'}</button>
        </div>

        <div className="results-card" id="resultsScreen" style={phase === 'results' ? SHOW : phase === 'play' && results ? HIDE : undefined}>
          <h2>FINISHED!</h2>
          <div className="results-grid">
            <div className="result-stat"><div className="val" id="finalTime">{results ? results.time : '0:00'}</div><div className="lbl">เวลาจริง</div></div>
            <div className="result-stat"><div className="val" id="finalPenalty">{results ? results.penalty : '0s'}</div><div className="lbl">Penalty</div></div>
            <div className="result-stat"><div className="val" id="finalTotal">{results ? results.total : '0:00'}</div><div className="lbl">เวลารวม</div></div>
            <div className="result-stat"><div className="val" id="finalAccuracy">{results ? results.accuracy : '0%'}</div><div className="lbl">ความแม่นยำ</div></div>
          </div>
          <div className="leaderboard" id="leaderboard">
            <h3>LEADERBOARD TOP 10</h3>
            <table className="lb-table">
              <thead><tr><th>#</th><th>เวลารวม</th><th>ถูก</th><th>วันที่</th></tr></thead>
              <tbody id="lbBody">
                {results && results.board.map((e, i) => (
                  <tr key={i} className={e.total === results.entry.total && e.date === results.entry.date ? 'highlight' : undefined}>
                    <td>{i + 1}</td><td>{formatTime(e.total)}</td><td>{e.correct + '/20'}</td><td>{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="restart-btn" onClick={startGame}>PLAY AGAIN</button>
        </div>
      </div>
    </div>
  );
}
