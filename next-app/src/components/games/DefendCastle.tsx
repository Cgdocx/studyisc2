'use client';

import { useState } from 'react';
import data from '@/data/games/defend-castle.json';
import { range, shuffled } from './shared';

interface Threat { text: string; severity: string; damage: number; domain: string; correct: number; choices: string[]; explanation: string }
interface Answer { picked: number; correct: boolean }

const THREATS = data.threats as Threat[];

function Castle({ id, className }: { id?: string; className: string }) {
  return (
    <svg id={id} className={className} viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="60" width="120" height="100" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="20" y="40" width="30" height="30" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="75" y="30" width="30" height="40" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="130" y="40" width="30" height="30" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="3" />
      <rect x="20" y="32" width="10" height="12" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="40" y="32" width="10" height="12" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="75" y="20" width="10" height="14" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="95" y="20" width="10" height="14" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="130" y="32" width="10" height="12" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="150" y="32" width="10" height="12" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="72" y="110" width="36" height="50" rx="18" fill="var(--ink-2)" stroke="var(--ink)" strokeWidth="3" />
      <path d="M90 75 L105 82 L105 100 L90 110 L75 100 L75 82 Z" fill="var(--green)" stroke="var(--ink)" strokeWidth="2" />
      <text x="90" y="96" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fontWeight="800" fill="var(--white)">S</text>
    </svg>
  );
}

export default function DefendCastle() {
  const [screen, setScreen] = useState<'startScreen' | 'gameScreen' | 'endScreen'>('startScreen');
  const [game, setGame] = useState(0);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [round, setRound] = useState(0);
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3]);
  const [hp, setHp] = useState(100);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [ended, setEnded] = useState(false);

  function startGame() {
    const list = shuffled(THREATS).slice(0, 20);
    setThreats(list);
    setHp(100);
    setScore(0);
    setRound(0);
    setCorrectCount(0);
    setAnswer(null);
    setEnded(false);
    setGame(g => g + 1);
    setScreen('gameScreen');
    setOrder(shuffled(range(4)));
  }

  function handleChoice(btnIdx: number) {
    if (answer) return;
    const t = threats[round];
    const ok = order[btnIdx] === t.correct;
    setAnswer({ picked: btnIdx, correct: ok });
    if (ok) {
      setScore(score + 10);
      setCorrectCount(correctCount + 1);
    } else {
      setHp(Math.max(0, hp - t.damage));
    }
  }

  function nextRound() {
    const r = round + 1;
    setRound(r);
    if (r >= threats.length || hp <= 0) { setEnded(true); setScreen('endScreen'); return; }
    setAnswer(null);
    setOrder(shuffled(range(4)));
  }

  const cur = ended ? round - 1 : round;
  const t = threats[cur];
  const level = hp <= 30 ? 'danger' : hp <= 50 ? 'warn' : '';
  const castleLevel = (hp <= 50 ? ' damaged' : '') + (hp <= 30 ? ' critical' : '');
  const correctBtn = t ? order.indexOf(t.correct) : -1;
  const survived = hp > 0;
  const screenClass = (id: typeof screen) => 'screen' + (screen === id ? ' active' : '');

  return (
    <div className="pg-defend-castle pg-game">
      <div className="wrap">
        <div id="startScreen" className={screenClass('startScreen')}>
          <div className="start-card">
            <Castle className="castle-svg" />
            <h1>Defend the Castle</h1>
            <div className="sub">
              คุณคือ Security Analyst ผู้ปกป้องปราสาท<br />
              ภัยคุกคามจะโจมตีเข้ามาทีละระลอก : เลือก Security Control ที่ถูกต้องเพื่อป้องกัน<br />
              ตอบถูก = บล็อกภัยสำเร็จ (+10 คะแนน) | ตอบผิด = ปราสาทเสียหาย (HP ลด)<br />
              เป้าหมาย: รอดให้ครบ 20 ระลอก!
            </div>
            <button className="start-btn" onClick={startGame}>เริ่มปกป้องปราสาท</button>
          </div>
        </div>

        <div id="gameScreen" className={screenClass('gameScreen')}>
          <div className="castle-area">
            <Castle id="castleIcon" className={'castle-svg' + castleLevel} />
          </div>

          <div className="hp-bar-wrap">
            <div id="hpBarFill" className={'hp-bar-fill' + (level ? ' ' + level : '')} style={{ width: Math.max(0, hp) + '%' }}></div>
            <div id="hpBarText" className="hp-bar-text">{`HP ${hp} / 100`}</div>
          </div>

          <div className="stats-bar">
            <div className="stat-box">
              <div className="stat-label">ROUND</div>
              <div className="stat-value" id="roundNum">{cur + 1}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">SCORE</div>
              <div className="stat-value" id="scoreNum" style={{ color: 'var(--green)' }}>{score}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">HP</div>
              <div className={'stat-value hp' + (level ? ' ' + level : '')} id="hpNum">{hp}</div>
            </div>
          </div>

          <div id="threatCard" className="threat-card">
            <div className="threat-header">
              <span id="severityBadge" className={'severity-badge ' + (t ? t.severity : 'high')}>{t ? t.severity.toUpperCase() : 'HIGH'}</span>
              <span id="threatRound" className="threat-round">{`ROUND ${cur + 1} / ${threats.length || 20}`}</span>
            </div>
            <div id="threatText" className="threat-text">{t ? t.text : ''}</div>
            <div id="threatDomain" className="threat-domain">{t ? t.domain : ''}</div>
          </div>

          <div id="choices" className="choices">
            {t && order.map((orig, i) => (
              <button
                key={`${game}:${cur}:${i}`}
                className={'choice-btn' + (answer && i === correctBtn ? ' correct' : '') + (answer && !answer.correct && i === answer.picked ? ' wrong' : '')}
                disabled={!!answer}
                onClick={() => handleChoice(i)}
              >
                {t.choices[orig]}
              </button>
            ))}
          </div>

          <div id="explanation" className={'explanation' + (answer ? (answer.correct ? ' correct-exp show' : ' wrong-exp show') : '')}>
            <div className="exp-title" id="expTitle">{answer && t ? (answer.correct ? 'BLOCKED! +10 POINTS' : 'HIT! -' + t.damage + ' HP') : ''}</div>
            <div id="expText">{answer && t ? t.explanation : ''}</div>
          </div>

          <button id="nextBtn" className={'next-btn' + (answer ? ' show' : '')} onClick={nextRound}>{hp <= 0 ? 'ดูผลลัพธ์' : 'ระลอกถัดไป \u2192'}</button>
        </div>

        <div id="endScreen" className={screenClass('endScreen')}>
          <div className="gameover-card">
            <h2 id="endTitle" style={ended ? { color: survived ? 'var(--green)' : 'var(--red)' } : undefined}>{ended ? (survived ? 'MISSION COMPLETE!' : 'CASTLE FALLEN!') : 'GAME OVER'}</h2>
            <p id="endMessage" style={{ fontSize: 16, color: 'var(--ink-2)', marginBottom: 8 }}>
              {ended ? (survived ? 'ปราสาทปลอดภัย! คุณปกป้องได้สำเร็จครบ ' + round + ' ระลอก' : 'ปราสาทถูกทำลาย! คุณรอดได้ ' + round + ' ระลอก') : ''}
            </p>
            <div className="final-stats">
              <div className="final-stat">
                <div className="fs-label">SCORE</div>
                <div className="fs-value" id="finalScore" style={{ color: 'var(--green)' }}>{ended ? score : 0}</div>
              </div>
              <div className="final-stat">
                <div className="fs-label">ROUNDS</div>
                <div className="fs-value" id="finalRounds">{ended ? round : 0}</div>
              </div>
              <div className="final-stat">
                <div className="fs-label">HP</div>
                <div className="fs-value" id="finalHP">{ended ? Math.max(0, hp) : 0}</div>
              </div>
              <div className="final-stat">
                <div className="fs-label">ACCURACY</div>
                <div className="fs-value" id="finalAcc">{ended ? (round > 0 ? Math.round(correctCount / round * 100) + '%' : '0%') : '0%'}</div>
              </div>
            </div>
            <button className="retry-btn" onClick={startGame}>เล่นอีกครั้ง</button>
          </div>
        </div>
      </div>
    </div>
  );
}
