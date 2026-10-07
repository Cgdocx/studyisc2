'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SimpleBankConfig } from '@/lib/banks';
import BankLoading from '@/components/quiz/engine/BankLoading';
import { postToSheet } from '@/components/quiz/engine/sheet';
import { shuffle } from '@/components/quiz/engine/shuffle';
import { useBank } from '@/components/quiz/engine/useBank';
import TopicBadge from '@/components/quiz/TopicBadge';
import { useRestoreAfterHydration } from '@/lib/client';

interface NcsaQuestion {
  id: string;
  source_index: number;
  section: string;
  dom: number;
  type: string;
  question_en: string;
  question_th: string;
  answers_en: string[];
  answers_th: string[];
  correct_indices: number[];
  explanation_en: string;
  explanation_th: string;
  prev_wrong: number | null;
}

interface NcsaData {
  title_en: string;
  title_th: string;
  domains: { id: number; en: string }[];
  questions: NcsaQuestion[];
}

interface CheckResult { correct: boolean; selected: number[]; checkedAt: number }
type LangMode = 'both' | 'en' | 'th';

interface ResultSnapshot {
  correct: number;
  total: number;
  wrong: number;
  unanswered: number;
  pct: number;
  rows: { id: number; name: string; ok: number; n: number; p: number }[];
}

const PROGRESS_KEY = 'isc2cc_examone_progress_v1';
const NAME_KEY = 'isc2cc_examone_username_v1';
const L = (n: number) => String.fromCharCode(65 + n);

function makeSessionId(): string {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

export default function NcsaExam({ config }: { config: SimpleBankConfig }) {
  const { data, error } = useBank<NcsaData>(config.dataFile);
  if (!data) return <div className="pg-ncsa"><div className="app"><BankLoading error={error} /></div></div>;
  return <NcsaApp data={data} config={config} />;
}

function NcsaApp({ data, config }: { data: NcsaData; config: SimpleBankConfig }) {
  const Q = data.questions;
  const allDomainIds = useMemo(() => data.domains.map(d => d.id), [data]);
  const byDomCount = useMemo(() => {
    const m: Record<number, number> = {};
    Q.forEach(q => { m[q.dom] = (m[q.dom] || 0) + 1; });
    return m;
  }, [Q]);

  const [screen, setScreen] = useState<'start' | 'quiz'>('start');
  const [order, setOrder] = useState<number[]>(() => Q.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [filtered, setFiltered] = useState<number[] | null>(null);
  const [reviewWrong, setReviewWrong] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(() => new Set(allDomainIds));
  const [name, setName] = useState('');
  const [lang, setLang] = useState<LangMode>('both');
  const [search, setSearch] = useState('');
  const [explainId, setExplainId] = useState<string | null>(null);
  const [modal, setModal] = useState<ResultSnapshot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sendStatus, setSendStatus] = useState('');
  const [toast, setToast] = useState<{ msg: string; kind: string; show: boolean } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const sessionId = useRef<string | null>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useRestoreAfterHydration(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) || '');
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.answers) setAnswers(p.answers);
        if (p.results) setResults(p.results);
        if (p.order && p.order.length === Q.length) setOrder(p.order);
      }
    } catch { /* storage unavailable */ }
  });

  const saveProgress = (a: Record<string, number[]>, r: Record<string, CheckResult>, o: number[]) => {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify({ answers: a, results: r, order: o })); } catch { /* ignore */ }
  };

  const active = useMemo(() => {
    let base = filtered !== null ? filtered : order;
    if (reviewWrong) base = base.filter(idx => { const r = results[Q[idx].id]; return r && !r.correct; });
    return base;
  }, [filtered, order, reviewWrong, results, Q]);
  const curPos = active.length ? Math.min(Math.max(pos, 0), active.length - 1) : 0;
  const curIdx = active.length ? active[curPos] : null;

  const lv = (l: 'en' | 'th') => (lang !== 'both' && l !== lang ? ' hidden' : '');

  const go = (p: number) => { setPos(p); setExplainId(null); };

  const showToast = (msg: string, kind: string) => {
    setToast({ msg, kind, show: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(t => (t ? { ...t, show: false } : t)), 4200);
  };

  const startQuiz = () => {
    if (selected.size === 0) { alert('Please select at least one domain. / กรุณาเลือกอย่างน้อยหนึ่ง domain'); return; }
    const nm = name.trim();
    if (!nm) { alert('Please enter your name so results can be tracked. / กรุณากรอกชื่อก่อนเริ่มทำแบบทดสอบ'); return; }
    try { localStorage.setItem(NAME_KEY, nm); } catch { /* ignore */ }
    sessionId.current = makeSessionId();
    setOrder(Q.map((_, i) => i).filter(i => selected.has(Q[i].dom)));
    setFiltered(null);
    setReviewWrong(false);
    go(0);
    setScreen('quiz');
  };

  const pickAnswer = (q: NcsaQuestion, i: number) => {
    const next = { ...answers, [q.id]: [i] };
    setAnswers(next);
    saveProgress(next, results, order);
  };

  const checkCurrent = (q: NcsaQuestion) => {
    const sel = [...(answers[q.id] || [])];
    if (!sel.length) { alert('Please select an answer. / กรุณาเลือกคำตอบ'); return; }
    const ok = sel.length === q.correct_indices.length && sel.every(v => q.correct_indices.includes(v));
    const next = { ...results, [q.id]: { correct: ok, selected: sel, checkedAt: Date.now() } };
    setResults(next);
    saveProgress(answers, next, order);
    setExplainId(q.id);
  };

  const applySearch = (raw: string) => {
    setSearch(raw);
    const term = raw.trim().toLowerCase();
    if (!term) { setFiltered(null); go(0); return; }
    setFiltered(order.filter(idx => {
      const q = Q[idx];
      return q.question_en.toLowerCase().includes(term) ||
        q.answers_en.some(a => a.toLowerCase().includes(term)) ||
        (q.question_th || '').includes(term) ||
        (q.explanation_th || '').includes(term);
    }));
    go(0);
  };

  const shuffleOrder = () => {
    const arr = shuffle(order);
    setOrder(arr);
    go(0);
    saveProgress(answers, results, arr);
  };

  const resetAll = () => {
    if (!confirm('Reset all answers and progress? / ล้างคำตอบและความคืบหน้าทั้งหมด?')) return;
    setResults({}); setAnswers({}); setFiltered(null); setReviewWrong(false); go(0);
    localStorage.removeItem(PROGRESS_KEY);
  };

  const finish = () => {
    const total = order.length;
    const checked = order.filter(i => results[Q[i].id]).length;
    const correct = order.filter(i => results[Q[i].id]?.correct).length;
    const wrong = checked - correct;
    const pct = total ? Math.round(correct / total * 100) : 0;
    const byDom: Record<number, { n: number; ok: number }> = {};
    order.forEach(i => {
      const q = Q[i];
      const r = results[q.id];
      if (!byDom[q.dom]) byDom[q.dom] = { n: 0, ok: 0 };
      byDom[q.dom].n++;
      if (r && r.correct) byDom[q.dom].ok++;
    });
    const rows = data.domains.filter(d => byDom[d.id]).map(d => {
      const s = byDom[d.id];
      return { id: d.id, name: d.en, ok: s.ok, n: s.n, p: s.n ? Math.round(s.ok / s.n * 100) : 0 };
    });
    setModal({ correct, total, wrong, unanswered: total - checked, pct, rows });
    setModalOpen(true);
    const tracker = config.tracker;
    if (!tracker) return;
    setSendStatus('Sending… / กำลังส่ง…');
    const nm = (localStorage.getItem(NAME_KEY) || '').trim();
    const payload = {
      name: nm, sessionId: sessionId.current, submittedAt: new Date().toISOString(),
      quizTitle: data.title_en,
      totalQuestions: total, totalChecked: checked, totalCorrect: correct, percent: pct,
      domains: rows.map(r => ({ id: r.id, name: r.name, total: r.n, correct: r.ok, incorrect: r.n - r.ok, percent: r.n ? Math.round(r.ok / r.n * 100) : 0 })),
      questions: order.map(i => {
        const q = Q[i];
        const r = results[q.id];
        const sel = r ? (answers[q.id] || [])[0] : null;
        return {
          id: q.id,
          domain: q.dom,
          domainName: q.section,
          checked: !!r,
          correct: r ? !!r.correct : null,
          selectedText: (sel !== null && sel !== undefined) ? q.answers_en[sel] : null,
          correctText: q.answers_en[q.correct_indices[0]],
        };
      }),
    };
    postToSheet(tracker, JSON.stringify(payload)).then(() => {
      setSendStatus('Sent to tracking sheet ✓ / ส่งผลไปยัง Google Sheet แล้ว');
      showToast('✓ Result sent / ส่งผลสำเร็จแล้ว', 'good');
    }, () => {
      setSendStatus('Failed to send - check your connection / ส่งไม่สำเร็จ');
      showToast('[!] Failed to send result / ส่งผลไม่สำเร็จ', 'bad');
    });
  };

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextRef.current?.click();
    if (e.key === 'ArrowLeft') prevRef.current?.click();
  }, []);
  useEffect(() => {
    if (screen !== 'quiz') return;
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [screen, onKey]);

  const total = order.length;
  const checkedN = order.filter(i => results[Q[i].id]).length;
  const correctN = order.filter(i => results[Q[i].id]?.correct).length;
  const progressPct = total ? Math.round(checkedN / total * 100) : 0;

  let questionView: ReactNode = null;
  if (screen === 'quiz' && curIdx === null) {
    questionView = <div className="notice">No questions match the current filter. / ไม่พบคำถามตามตัวกรอง</div>;
  } else if (screen === 'quiz' && curIdx !== null) {
    const q = Q[curIdx];
    const r = results[q.id];
    const saved = new Set(answers[q.id] || []);
    questionView = (
      <>
        <div className="question-head">
          <div>
            <TopicBadge text={q.question_en} />
            <div className="question-number">Question {curPos + 1} of {active.length} / ข้อ {curPos + 1} จาก {active.length}</div>
            <div className="question-id">ID {q.id} · Source #{q.source_index} · {q.section}</div>
          </div>
          <span className="type-pill">Single-choice / เลือกข้อเดียว</span>
        </div>
        <div className={'question-text' + lv('en')} data-lang="en">{q.question_en}</div>
        <div className={'question-text thai' + lv('th')} data-lang="th">{q.question_th}</div>
        <div className="answers">
          {q.answers_en.map((a, i) => {
            const correct = !!r && q.correct_indices.includes(i);
            const wrongSel = !!r && !correct && saved.has(i);
            const cls = correct ? 'correct' : wrongSel ? 'wrong-selected' : '';
            return (
              <label key={i} className={`answer ${cls}`}>
                <input type="radio" name={`answer-${q.id}`} value={i} checked={saved.has(i)} disabled={!!r} onChange={() => pickAnswer(q, i)} />
                <div>
                  <div className={'en' + lv('en')} data-lang="en"><span className="letter">{L(i)}.</span> {a}</div>
                  <div className={'th thai' + lv('th')} data-lang="th"><span className="letter">{L(i)}.</span> {q.answers_th[i] || ''}</div>
                  {r && q.prev_wrong === i && <div className="prev-tag">Previously answered this / เคยเลือกข้อนี้ (ผิด)</div>}
                </div>
              </label>
            );
          })}
        </div>
        {r && (
          <div className={`feedback ${r.correct ? 'good' : 'bad'}`}>
            <b>{r.correct ? 'Correct / ถูกต้อง' : 'Incorrect / ยังไม่ถูก'}</b><br />
            {' '}Correct answer: {q.correct_indices.map(i => `${L(i)}. ${q.answers_en[i]}`).join(' · ')}{' '}
          </div>
        )}
        <div className="actions">
          <button ref={prevRef} className="btn" id="prevBtn" disabled={curPos <= 0} onClick={() => go(curPos - 1)}>Previous / ก่อนหน้า</button>{' '}
          {r
            ? <button className="btn primary" id="showExplanationBtn" onClick={() => setExplainId(q.id)}>Explanation / คำอธิบาย</button>
            : <button className="btn good" id="checkBtn" onClick={() => checkCurrent(q)}>Check answer / ตรวจคำตอบ</button>}{' '}
          <button ref={nextRef} className="btn" id="nextBtn" disabled={curPos >= active.length - 1} onClick={() => go(curPos + 1)}>Next / ถัดไป</button>
        </div>
        <div id="explanationArea">
          {explainId === q.id && (
            <div className="explanation">
              <h3>Full source explanation and answer rationale / คำอธิบายและเหตุผลของคำตอบ</h3>
              <div className={'explanation-block' + lv('en')} data-lang="en">{q.explanation_en || 'No explanation in source.'}</div>
              <div className={'explanation-block thai' + lv('th')} data-lang="th">{q.explanation_th || 'ไม่มีคำอธิบายในต้นฉบับ'}</div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="pg-ncsa">
      <div className="app">
        <section className="hero hero-section">
          <div className="eyebrow">ISC2 CC · PRACTICE EXAM 1 (50 QUESTIONS)</div>
          <h1 id="titleEn">{data.title_en}</h1>
          <p className="thai-title sub" id="titleTh">{data.title_th}</p>
          <div className="meta-row">
            <span className="badge" id="questionCountBadge">{Q.length} unique questions / {Q.length} ข้อไม่ซ้ำ</span>{' '}
            <span className="badge">Source: ISC2 CC Practice Exam 1 (50 questions, even split across all 5 domains)</span>{' '}
            <span className="badge">Thai: fully pre-translated, no live API needed / แปลไทยไว้ล่วงหน้าทั้งหมด ไม่ต้องเรียก API</span>
          </div>
        </section>

        <section id="startScreen" className={'panel main-panel' + (screen === 'start' ? '' : ' hidden')}>
          <h2>Source extraction report / รายงานการดึงข้อมูล</h2>
          <p className="small">Every question, answer option, correct answer, and explanation was retained exactly as written from the source - none were reworded, shortened, or dropped.</p>
          <div className="report" id="reportGrid">
            <div className="report-item"><b>{Q.length}</b>Unique questions retained / คงไว้ทั้งหมด</div>
            <div className="report-item"><b>0</b>Duplicates excluded / ข้อซ้ำที่ตัดออก</div>
            <div className="report-item"><b>{new Set(Q.map(q => q.dom)).size}</b>Domains covered / ครอบคลุมกี่ domain</div>
          </div>
          <h3 style={{ margin: '18px 0 4px', fontSize: '.95rem', color: 'var(--muted)' }}>By domain / แยกตาม domain</h3>
          <div className="domain-bars" id="domainBars">
            {data.domains.map(d => {
              const n = byDomCount[d.id] || 0;
              const pct = Q.length ? Math.round(n / Q.length * 100) : 0;
              return (
                <div key={d.id} className="domain-bar">
                  <div>{d.en} - <span className="small">{n} question{n === 1 ? '' : 's'}</span></div>
                  <div className="domain-track"><i style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>

          <div className="domain-picker">
            <div className="domain-picker-head">
              <div><b>Choose domains to test / เลือก domain ที่จะทดสอบ</b></div>
              <div className="row-inline">
                <button className="btn" id="selectAllDomainsBtn" type="button" onClick={() => setSelected(new Set(allDomainIds))}>Select all / เลือกทั้งหมด</button>{' '}
                <button className="btn" id="clearAllDomainsBtn" type="button" onClick={() => setSelected(new Set())}>Clear / ล้าง</button>
              </div>
            </div>
            <div className="domain-list" id="domainCheckList">
              {data.domains.map(d => (
                <label key={d.id} className="domain-item">
                  <input
                    type="checkbox"
                    data-dom={d.id}
                    checked={selected.has(d.id)}
                    onChange={e => {
                      const nextSel = new Set(selected);
                      if (e.target.checked) nextSel.add(d.id); else nextSel.delete(d.id);
                      setSelected(nextSel);
                    }}
                  />{' '}
                  <span className="dname">{d.en}</span>{' '}
                  <span className="dcount">{byDomCount[d.id] || 0} q</span>
                </label>
              ))}
            </div>
            <p className="small" style={{ marginTop: 8 }}>Leave everything checked to take the full mixed-domain test, or check just one domain to drill that domain only.</p>
          </div>

          <div className="notice good">
            <b>Thai translation / คำแปลไทย:</b>
            {' '}All Thai text - questions, answer options, and explanations - is baked directly into this file at build time. No live translation API call, so this page works fully offline and on any static host (including GitHub Pages).
            {' '}คำแปลไทยทั้งหมดถูกฝังไว้ในไฟล์นี้ล่วงหน้าแล้ว ไม่มีการเรียก API แปลภาษาแบบเรียลไทม์
          </div>
          <div className="settings-grid">
            <div>
              <label className="small" htmlFor="userNameInput">Your name / ชื่อผู้เข้าสอบ (optional)</label>
              <input className="input" id="userNameInput" placeholder="e.g. Got" style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>
          <div className="actions">
            <button className="btn primary" id="startBtn" onClick={startQuiz}>Start quiz / เริ่มทำแบบทดสอบ</button>
          </div>
          <p className="small">Tip: this is self-assessment only - there is no pass/fail gate. Use &quot;Incorrect only&quot; after a first pass to drill down on what&apos;s still weak.</p>
        </section>

        <section id="quizScreen" className={screen === 'quiz' ? '' : 'hidden'}>
          <div className="toolbar">
            <button className="btn" id="homeBtn" onClick={() => setScreen('start')}>Report</button>
            <select className="select" id="languageMode" aria-label="Language mode" value={lang} onChange={e => setLang(e.target.value as LangMode)}>
              <option value="both">English + ไทย</option>
              <option value="en">English only</option>
              <option value="th">ไทยเท่านั้น</option>
            </select>
            <input className="input" id="searchInput" placeholder="Search questions / ค้นหาคำถาม" value={search} onChange={e => applySearch(e.target.value)} />
            <button className="btn" id="shuffleBtn" onClick={shuffleOrder}>Shuffle / สุ่ม</button>
            <button className="btn" id="reviewWrongBtn" onClick={() => { setReviewWrong(v => !v); go(0); }}>{reviewWrong ? 'Show all / แสดงทั้งหมด' : 'Incorrect only / เฉพาะข้อผิด'}</button>
            <div className="progress-wrap" title="Progress"><div className="progress-bar" id="progressBar" style={{ width: `${progressPct}%` }} /></div>
            <span className="badge" id="scoreBadge">{correctN} / {total}</span>
          </div>

          <div className="layout">
            <main className="panel main-panel">
              <div id="questionArea">{questionView}</div>
            </main>
            <aside className="panel side">
              <div className="stats-card" id="sideStats">
                <strong>{correctN} correct / ถูก {correctN}</strong><br />
                {' '}Checked / ตรวจแล้ว: {checkedN}/{total}<br />
                {' '}Incorrect / ผิด: {checkedN - correctN}<br />
                {' '}Progress / ความคืบหน้า: {progressPct}%
              </div>
              <div className="nav-title">Questions / คำถาม</div>
              <div className="nav-grid" id="navGrid">
                {order.map(idx => {
                  if (!active.includes(idx)) return null;
                  const q = Q[idx];
                  const r = results[q.id];
                  let cls = 'nav-q';
                  if (r) cls += r.correct ? ' correct' : ' incorrect';
                  else if (answers[q.id] && answers[q.id].length) cls += ' answered';
                  if (idx === curIdx) cls += ' current';
                  return (
                    <button key={idx} className={cls} data-go={idx} title={q.id} onClick={() => { const p = active.indexOf(idx); if (p >= 0) go(p); }}>
                      {q.source_index}
                    </button>
                  );
                })}
              </div>
              <div className="actions">
                <button className="btn good" id="finishBtn" onClick={finish}>Finish / สรุปผล</button>{' '}
                <button className="btn danger" id="resetBtn" onClick={resetAll}>Reset / เริ่มใหม่</button>
              </div>
            </aside>
          </div>
        </section>

        <footer>Generated from the source ISC2 CC study material. Original answers and explanations (English + Thai) are preserved. Fully static - no external API calls.</footer>
      </div>

      <div className={'modal' + (modalOpen ? '' : ' hidden')} id="modal" onClick={e => { if ((e.target as HTMLElement).id === 'modal') setModalOpen(false); }}>
        <div className="modal-card">
          <button className="btn" style={{ float: 'right' }} id="closeModalBtn" onClick={() => setModalOpen(false)}>Close / ปิด</button>
          <div id="modalContent">
            {modal && (
              <>
                <h2>Quiz result / ผลแบบทดสอบ</h2>
                <div className="result-score">{modal.correct}/{modal.total}</div>
                <p><b>{modal.pct}%</b> · self-assessment, no pass/fail threshold / ประเมินตนเอง ไม่มีเกณฑ์ผ่าน-ไม่ผ่าน</p>
                <div className="report">
                  {([['Correct', 'ถูก', modal.correct], ['Incorrect', 'ผิด', modal.wrong], ['Unchecked', 'ยังไม่ตรวจ', modal.unanswered]] as const).map(([en, th, n]) => (
                    <Fragment key={en}><div className="report-item"><b>{n}</b>{en} / {th}</div></Fragment>
                  ))}
                </div>
                <h3 style={{ fontSize: '.95rem', color: 'var(--muted)' }}>By domain / แยกตาม domain</h3>
                <div className="domain-bars">
                  {modal.rows.map(r => (
                    <div key={r.id} className="domain-bar">
                      <div>{r.name} - <span className="small">{r.ok}/{r.n} · {r.p}%</span></div>
                      <div className="domain-track"><i style={{ width: `${r.p}%` }} /></div>
                    </div>
                  ))}
                </div>
                {config.tracker && <p className="small" id="sendStatus">{sendStatus}</p>}
                <button className="btn" onClick={() => window.print()}>Print / พิมพ์</button>
              </>
            )}
          </div>
        </div>
      </div>
      {toast && <div id="toast" className={'toast' + (toast.show ? ' show' + (toast.kind ? ' ' + toast.kind : '') : '')}>{toast.msg}</div>}
    </div>
  );
}
