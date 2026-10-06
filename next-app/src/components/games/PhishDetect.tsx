'use client';

import { useState } from 'react';
import data from '@/data/games/phish-detect.json';
import { shuffled } from './shared';

interface Flag { id: string; label: string }
interface Email { from: string; to: string; date: string; subject: string; body: string; attachment: string | null; isPhishing: boolean; flags: string[]; explanation: string }
interface Outcome { correct: boolean; picked: string[] }

const ALL_FLAGS = data.flags as Flag[];
const EMAILS = data.emails as Email[];
const LINK = /<span class="fake-link">([\s\S]*?)<\/span>/g;

function Body({ html }: { html: string }) {
  const parts = html.split(LINK);
  return <>{parts.map((p, i) => i % 2 ? <span key={i} className="fake-link">{p}</span> : p)}</>;
}

function Paperclip() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="square" aria-hidden="true">
      <path d="M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.9-8.9a3.7 3.7 0 0 1 5.2 5.2l-8.9 8.9a1.8 1.8 0 0 1-2.6-2.6l8.2-8.2" />
    </svg>
  );
}

export default function PhishDetect() {
  const [screen, setScreen] = useState<'startScreen' | 'gameScreen' | 'endScreen'>('startScreen');
  const [emails, setEmails] = useState<Email[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<'decide' | 'flags' | 'result'>('decide');
  const [selected, setSelected] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [ended, setEnded] = useState(false);

  function startGame() {
    setEmails(shuffled(EMAILS).slice(0, 15));
    setIdx(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setPhase('decide');
    setSelected([]);
    setOutcome(null);
    setEnded(false);
    setScreen('gameScreen');
  }

  function win(points: number) {
    const s = streak + 1;
    setScore(score + points);
    setCorrectCount(correctCount + 1);
    setStreak(s);
    if (s > bestStreak) setBestStreak(s);
  }

  function decide(guessPhishing: boolean) {
    if (phase !== 'decide') return;
    const e = emails[idx];
    if (e.isPhishing && guessPhishing) { setPhase('flags'); return; }
    const correct = guessPhishing === e.isPhishing;
    if (correct) win(10); else setStreak(0);
    setPhase('result');
    setOutcome({ correct, picked: [] });
  }

  function toggle(id: string) {
    setSelected(selected.includes(id) ? selected.filter(f => f !== id) : [...selected, id]);
  }

  function submitFlags() {
    if (phase !== 'flags') return;
    const e = emails[idx];
    const hits = e.flags.filter((f, i, a) => a.indexOf(f) === i && selected.includes(f)).length;
    const falsePositives = selected.filter(f => !e.flags.includes(f)).length;
    win(10 + Math.max(0, hits * 3 - falsePositives * 2));
    setPhase('result');
    setOutcome({ correct: true, picked: selected });
  }

  function nextEmail() {
    const n = idx + 1;
    if (n >= emails.length) { setIdx(n); setEnded(true); setScreen('endScreen'); return; }
    setIdx(n);
    setPhase('decide');
    setSelected([]);
    setOutcome(null);
  }

  const e = emails[ended ? idx - 1 : idx];
  const total = emails.length;
  const pct = total > 0 ? Math.round(correctCount / total * 100) : 0;
  const grade = pct >= 90 ? 'Expert Detective' : pct >= 70 ? 'Good Investigator' : pct >= 50 ? 'Rookie Analyst' : 'Needs Training';
  const screenClass = (id: typeof screen) => 'screen' + (screen === id ? ' active' : '');
  const decided = phase !== 'decide';

  return (
    <div className="pg-phish-detect pg-game">
      <div className="wrap">
        <div id="startScreen" className={screenClass('startScreen')}>
          <div className="start-card">
            <svg width="100" height="90" viewBox="0 0 100 90" fill="none" style={{ marginBottom: 16 }}>
              <rect x="5" y="15" width="90" height="65" rx="3" fill="var(--white)" stroke="var(--ink)" strokeWidth="3" />
              <path d="M8 18 L50 52 L92 18" stroke="var(--ink)" strokeWidth="3" fill="none" />
              <circle cx="78" cy="22" r="14" fill="var(--red)" stroke="var(--ink)" strokeWidth="2" />
              <text x="78" y="27" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fontWeight="800" fill="var(--white)">!</text>
            </svg>
            <h1>Phishing Detective</h1>
            <div className="sub">
              คุณจะได้รับอีเมลทีละฉบับ : ตรวจสอบว่าเป็น Phishing หรือ Legit<br />
              ถ้าเป็น Phishing ให้ระบุ Red Flags ที่พบ<br />
              ยิ่งจับ Red Flags ได้มาก ยิ่งได้คะแนนเยอะ!
            </div>
            <button className="start-btn" onClick={startGame}>เริ่มสืบสวน</button>
          </div>
        </div>

        <div id="gameScreen" className={screenClass('gameScreen')}>
          <div className="stats-bar">
            <div className="stat-box">
              <div className="stat-label">EMAIL</div>
              <div className="stat-value" id="emailNum">{e ? (ended ? idx : idx + 1) + ' / ' + total : '1'}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">SCORE</div>
              <div className="stat-value" id="scoreNum" style={{ color: 'var(--green)' }}>{score}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">STREAK</div>
              <div className="stat-value" id="streakNum" style={{ color: 'var(--orange)' }}>{streak}</div>
            </div>
          </div>

          <div id="emailCard" className="email-card">
            <div className="email-toolbar">
              <div className="email-dot r"></div>
              <div className="email-dot y"></div>
              <div className="email-dot g"></div>
              <span className="email-toolbar-title">INBOX</span>
            </div>
            <div className="email-header">
              <div className="email-field">
                <span className="email-field-label">From:</span>
                <span className="email-field-value" id="emailFrom">{e ? e.from : ''}</span>
              </div>
              <div className="email-field">
                <span className="email-field-label">To:</span>
                <span className="email-field-value" id="emailTo">{e ? e.to : ''}</span>
              </div>
              <div className="email-field">
                <span className="email-field-label">Date:</span>
                <span className="email-field-value" id="emailDate">{e ? e.date : ''}</span>
              </div>
            </div>
            <div className="email-subject" id="emailSubject">{e ? e.subject : ''}</div>
            <div className="email-body" id="emailBody">{e && <Body html={e.body} />}</div>
            <div id="emailAttachment">
              {e && e.attachment && <div className="email-attachment"><Paperclip />{e.attachment}</div>}
            </div>
          </div>

          <div id="decisionArea" className="decision-area" style={e ? { display: phase === 'result' ? 'none' : 'flex' } : undefined}>
            <button className="decision-btn btn-phish" disabled={decided} onClick={() => decide(true)}>PHISHING</button>
            <button className="decision-btn btn-legit" disabled={decided} onClick={() => decide(false)}>LEGIT</button>
          </div>

          <div id="flagsSection" className={'flags-section' + (phase === 'flags' ? ' show' : '')}>
            <div className="flags-title">เลือก Red Flags ที่คุณพบ:</div>
            <div id="flagsList">
              {phase === 'flags' && ALL_FLAGS.map(f => (
                <div key={f.id} className="flag-item">
                  <div className={'flag-cb' + (selected.includes(f.id) ? ' checked' : '')} data-id={f.id} onClick={() => toggle(f.id)}></div>
                  <div className="flag-label" onClick={() => toggle(f.id)}>{f.label}</div>
                </div>
              ))}
            </div>
            <button className="submit-flags" onClick={submitFlags}>ยืนยัน Red Flags</button>
          </div>

          <div id="resultCard" className={'result-card' + (outcome ? ' show' : '')}>
            <div id="resultVerdict" className={'result-verdict' + (outcome ? (outcome.correct ? ' correct' : ' wrong') : '')}>
              {outcome && e ? (outcome.correct
                ? (e.isPhishing ? 'CORRECT! PHISHING DETECTED' : 'CORRECT! LEGITIMATE EMAIL')
                : (e.isPhishing ? 'WRONG! THIS WAS PHISHING' : 'WRONG! THIS WAS LEGITIMATE')) : ''}
            </div>
            <div id="resultText" className="result-text">{outcome && e ? e.explanation : ''}</div>
            <div id="resultFlags" className="result-flags">
              {outcome && e && e.isPhishing && e.flags.length > 0 && (
                <>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', color: 'var(--muted)' }}>RED FLAGS IN THIS EMAIL:</div>
                  {ALL_FLAGS.filter(f => e.flags.includes(f.id)).map(f => {
                    const hit = outcome.picked.includes(f.id);
                    return (
                      <div key={f.id} className="result-flag">
                        <span className={'result-flag-icon ' + (hit ? 'hit' : 'miss')}>{hit ? '[/]' : '[X]'}</span>
                        <span>{f.label}</span>
                      </div>
                    );
                  })}
                  {outcome.picked.filter(pf => !e.flags.includes(pf)).map(pf => {
                    const flag = ALL_FLAGS.find(f => f.id === pf);
                    if (!flag) return null;
                    return (
                      <div key={'fp:' + pf} className="result-flag">
                        <span className="result-flag-icon miss">[-]</span>
                        <span style={{ textDecoration: 'line-through', color: 'var(--muted)' }}>{flag.label + ' (ไม่ใช่ Red Flag ในอีเมลนี้)'}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          <button id="nextBtn" className={'next-btn' + (outcome ? ' show' : '')} onClick={nextEmail}>อีเมลถัดไป &rarr;</button>
        </div>

        <div id="endScreen" className={screenClass('endScreen')}>
          <div className="end-card">
            <h2 id="endTitle">{ended ? grade.toUpperCase() : 'INVESTIGATION COMPLETE'}</h2>
            <p id="endMessage" style={{ fontSize: 16, color: 'var(--ink-2)', marginBottom: 8 }}>
              {ended ? 'ตรวจสอบอีเมลทั้งหมด ' + total + ' ฉบับ จำแนกถูกต้อง ' + correctCount + ' ฉบับ (' + pct + '%)' : ''}
            </p>
            <div className="final-stats">
              <div className="final-stat">
                <div className="fs-label">SCORE</div>
                <div className="fs-value" id="finalScore" style={{ color: 'var(--green)' }}>{ended ? score : 0}</div>
              </div>
              <div className="final-stat">
                <div className="fs-label">CORRECT</div>
                <div className="fs-value" id="finalCorrect">{ended ? correctCount + '/' + total : 0}</div>
              </div>
              <div className="final-stat">
                <div className="fs-label">BEST STREAK</div>
                <div className="fs-value" id="finalStreak" style={{ color: 'var(--orange)' }}>{ended ? bestStreak : 0}</div>
              </div>
              <div className="final-stat">
                <div className="fs-label">ACCURACY</div>
                <div className="fs-value" id="finalAcc">{ended ? pct + '%' : '0%'}</div>
              </div>
            </div>
            <button className="retry-btn" onClick={startGame}>สืบสวนอีกครั้ง</button>
          </div>
        </div>
      </div>
    </div>
  );
}
