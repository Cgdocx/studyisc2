'use client';

import { useState } from 'react';
import { useRestoreAfterHydration } from '@/lib/client';
import type { SimpleBankConfig } from '@/lib/banks';
import BankLoading from '@/components/quiz/engine/BankLoading';
import { shuffle } from '@/components/quiz/engine/shuffle';
import { useBank } from '@/components/quiz/engine/useBank';
import TopicBadge from '@/components/quiz/TopicBadge';

interface ExplainedQuestion {
  d: number;
  dn: string;
  q: string;
  qe: string;
  choices: string[];
  correct: number;
  explanations: string[];
}

type Mode = 'all' | 'review' | number;

const HISTORY_KEY = 'isc2_wrong_history';
const DOMAIN_NAMES: Record<number, string> = {
  1: 'Security Principles', 2: 'BC/DR/IR', 3: 'Access Controls', 4: 'Network Security', 5: 'Security Operations',
};
const LABELS = ['A', 'B', 'C', 'D'];
const MODE_BUTTONS: { mode: Mode; label: string }[] = [
  { mode: 1, label: 'D1: Security Principles' },
  { mode: 2, label: 'D2: BC/DR/IR' },
  { mode: 3, label: 'D3: Access Controls' },
  { mode: 4, label: 'D4: Network Security' },
  { mode: 5, label: 'D5: Security Operations' },
];
const RED_BTN = { background: 'var(--red)', color: 'var(--white)' } as const;

function loadWrongHistory(): number[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveWrongHistory(arr: number[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); } catch { /* ignore */ }
}

export default function ExplainedQuiz({ config }: { config: SimpleBankConfig }) {
  const { data, error } = useBank<ExplainedQuestion[]>(config.dataFile);
  if (!data) return <div className="pg-explained"><div className="wrap"><BankLoading error={error} /></div></div>;
  return <ExplainedApp bank={data} />;
}

function ExplainedApp({ bank }: { bank: ExplainedQuestion[] }) {
  const [screen, setScreen] = useState<'start' | 'quiz' | 'results'>('start');
  const [items, setItems] = useState<ExplainedQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showReviewBtn, setShowReviewBtn] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  useRestoreAfterHydration(() => setShowReviewBtn(loadWrongHistory().length > 0));

  const startQuiz = (m: Mode) => {
    let list: ExplainedQuestion[];
    if (m === 'review') {
      const history = loadWrongHistory();
      list = bank.filter((_, i) => history.indexOf(i) !== -1);
      if (list.length === 0) { alert('ไม่มีข้อที่เคยผิด'); return; }
    } else if (m === 'all') {
      list = shuffle(bank);
    } else {
      list = shuffle(bank.filter(q => q.d === m));
    }
    setAnswers({}); setScore(0); setIdx(0); setItems(list); setScreen('quiz');
  };

  const answer = (qi: number, ci: number) => {
    if (answers[qi] !== undefined) return;
    const q = items[qi];
    setAnswers({ ...answers, [qi]: ci });
    if (ci === q.correct) setScore(s => s + 1);
    const origIdx = bank.indexOf(q);
    let history = loadWrongHistory();
    if (ci !== q.correct) {
      if (history.indexOf(origIdx) === -1) history.push(origIdx);
    } else {
      history = history.filter(x => x !== origIdx);
    }
    saveWrongHistory(history);
  };

  const navigate = (dir: number) => {
    if (dir === 1 && idx === items.length - 1) {
      setWrongCount(loadWrongHistory().length);
      setScreen('results');
      return;
    }
    setIdx(Math.max(0, Math.min(items.length - 1, idx + dir)));
  };

  const total = items.length;
  const done = Object.keys(answers).length;
  const q = items[idx];

  const renderResults = () => {
    const pct = Math.round(score / total * 100);
    const cls = pct >= 70 ? '' : pct >= 50 ? ' mid' : ' low';
    const ds: Record<number, { correct: number; total: number }> = {};
    items.forEach((it, i) => {
      if (!ds[it.d]) ds[it.d] = { correct: 0, total: 0 };
      ds[it.d].total++;
      if (answers[i] === it.correct) ds[it.d].correct++;
    });
    return (
      <>
        <h2>ผลคะแนน</h2>
        <div className={'big-score' + cls}>{pct}%</div>
        <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 16 }}>
          {score} / {total} ข้อ{pct >= 70 ? ' - ผ่านเกณฑ์' : ' - ยังไม่ผ่าน ต้องทบทวนเพิ่ม'}
        </p>
        <div className="domain-breakdown">
          {[1, 2, 3, 4, 5].filter(d => ds[d]).map(d => (
            <div key={d} className="domain-stat">
              <div className="ds-label">
                <span className={'domain-badge d' + d} style={{ fontSize: 9, padding: '2px 6px' }}>D{d}</span> {DOMAIN_NAMES[d]}
              </div>
              <div className="ds-score">{ds[d].correct}/{ds[d].total} ({Math.round(ds[d].correct / ds[d].total * 100)}%)</div>
            </div>
          ))}
        </div>
        <div className="mode-btns" style={{ marginTop: 20 }}>
          <button className="mode-btn primary" onClick={() => window.location.reload()}>เริ่มใหม่</button>
          {wrongCount > 0 && (
            <button className="mode-btn" style={RED_BTN} onClick={() => startQuiz('review')}>ทบทวนข้อที่เคยผิด ({wrongCount} ข้อ)</button>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="pg-explained">
      <div className="wrap">
        <header className="hero">
          <div className="eyebrow">DEEP LEARNING QUIZ</div>
          <h1>อธิบายทำไมผิด</h1>
          <div className="sub">แบบทดสอบ <span className="q-total">{bank.length}</span> ข้อ ครอบคลุม 5 Domains พร้อมคำอธิบายทุกตัวเลือก ไม่ใช่แค่บอกว่าข้อไหนถูก แต่อธิบายว่าทำไมตัวเลือกอื่นถึงผิด</div>
        </header>

        <div id="startScreen" className="results-card" style={{ display: screen === 'start' ? 'block' : 'none' }}>
          <h2>เลือกโหมด</h2>
          <p style={{ margin: '10px 0', fontSize: 14, color: 'var(--ink-2)' }}>ทำทั้ง <span className="q-total">{bank.length}</span> ข้อ หรือเลือกเฉพาะ Domain ที่ต้องการ</p>
          <div className="mode-btns">
            <button className="mode-btn primary" onClick={() => startQuiz('all')}>ทำทั้ง <span className="q-total">{bank.length}</span> ข้อ</button>
            {MODE_BUTTONS.map(b => (
              <button key={String(b.mode)} className="mode-btn" onClick={() => startQuiz(b.mode)}>{b.label}</button>
            ))}
            <button className="mode-btn" onClick={() => startQuiz('review')} id="reviewBtn" style={{ ...(showReviewBtn ? {} : { display: 'none' }), ...RED_BTN }}>ทบทวนข้อที่เคยผิด</button>
          </div>
        </div>

        <div id="quizArea" style={screen === 'quiz' ? undefined : { display: 'none' }}>
          {screen === 'quiz' && q && (
            <>
              <div className="progress-wrap">
                <div className="progress-top">
                  <span className="progress-label" id="progressLabel">ข้อ {idx + 1} / {total}</span>
                  <span className="progress-label" id="scoreLabel">คะแนน: {score} / {done}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" id="progressBar" style={{ width: `${done / total * 100}%` }} />
                </div>
              </div>

              <div className="filter-row" id="domainFilters" />

              <div id="questionContainer">
                <div className="q-card">
                  <div className="q-header">
                    <span className="q-num">Q{idx + 1} / {total}</span>
                    <span className={'domain-badge d' + q.d}>D{q.d}: {q.dn}</span>
                  </div>
                  <TopicBadge text={q.qe} />
                  <div className="q-body">
                    <div className="q-text">{q.q}</div>
                    <div className="q-text-en">{q.qe}</div>
                    <div className="choices">
                      {q.choices.map((c, i) => {
                        const answered = answers[idx] !== undefined;
                        let cls = 'choice-btn';
                        if (answered) {
                          cls += ' answered';
                          if (i === q.correct) cls += ' correct';
                          else if (i === answers[idx]) cls += ' wrong';
                          else cls += ' was-correct';
                        }
                        const expCls = (answered ? 'explanation show' : 'explanation') + (i === q.correct ? ' exp-correct' : ' exp-wrong');
                        return (
                          <button key={i} className={cls} onClick={() => answer(idx, i)}>
                            <span className="choice-label">{LABELS[i]})</span> {c}
                            <div className={expCls}>{i === q.correct ? '\u2713 ถูกต้อง: ' : '\u2717 ผิด เพราะ: '}{q.explanations[i]}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="q-nav">
                <button className="nav-btn" id="prevBtn" onClick={() => navigate(-1)} disabled={idx === 0}>PREV</button>{' '}
                <button className="nav-btn" id="nextBtn" onClick={() => navigate(1)}>{idx === total - 1 ? 'FINISH' : 'NEXT'}</button>
              </div>
            </>
          )}
        </div>

        <div id="resultsCard" className="results-card" style={screen === 'results' ? { display: 'block' } : undefined}>
          {screen === 'results' && renderResults()}
        </div>
      </div>
    </div>
  );
}
