'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { SimpleBankConfig } from '@/lib/banks';
import BankLoading from '@/components/quiz/engine/BankLoading';
import { postToSheet } from '@/components/quiz/engine/sheet';
import { shuffle } from '@/components/quiz/engine/shuffle';
import { useBank } from '@/components/quiz/engine/useBank';
import TopicBadge from '@/components/quiz/TopicBadge';
import { renderQuestionCanvas } from './canvas';
import { COMPANION, DOMAINS, I18N, domainName, type Strings, type ViewMode } from './i18n';

interface BankQ { d: number; q: string; c: string[]; a: number; e?: string; ct?: string[]; et?: string; qt?: string }

interface Summary {
  correct: number; total: number; skipped: number; timed: number; pct: number; passed: boolean;
  by: Record<number, { c: number; t: number }>;
}

interface Session {
  items: BankQ[];
  i: number;
  userName: string;
  mode: string;
  limit: number;
  answers: (number | null)[];
  reasons: string[];
  left: number;
  endedEarly: boolean;
  strictIntegrity?: boolean;
  integrityStrikes?: number;
  tabSwitches?: number;
  suspiciousFastAnswers?: number;
  qStartTime?: number;
  isPearsonVue?: boolean;
  disqualified?: boolean;
  isHandlingStrike?: boolean;
  summary?: Summary;
}

interface ResultView {
  score: string;
  verdictCls: string;
  verdictText: string;
  integrityLog: number;
  detail: string;
  bars: { name: string; c: number; t: number; p: number }[];
  missed: number;
}

interface ReviewView { viewMode: ViewMode; x: Strings }

interface StrikeModal { title: string; desc: ReactNode; btnText: string; btnBg: string; final: boolean }

type Screen = 'home' | 'quiz' | 'result';

const SAVED_KEY = 'cc_1832_saved_session';
const MISTAKE_KEY = 'cc_mistake_bank';
const NAME_KEY = 'cc_quiz_name';
const QUIZ_SCHEMA_VERSION = '2026.1';
const LETTERS = ['A', 'B', 'C', 'D'];

const styleCache = new Map<string, CSSProperties>();
function sx(s: string): CSSProperties {
  let v = styleCache.get(s);
  if (!v) {
    const o: Record<string, string> = {};
    s.split(';').forEach(p => {
      const i = p.indexOf(':');
      if (i < 0) return;
      const k = p.slice(0, i).trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      o[k] = p.slice(i + 1).trim();
    });
    v = o as CSSProperties;
    styleCache.set(s, v);
  }
  return v;
}

function fmtTime(sec: number): string {
  const s = Math.max(0, sec);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function answerLabel(q: BankQ, ans: number): string {
  return LETTERS[ans] + '. ' + q.c[ans];
}

function isAnswered(ans: number | null | undefined): ans is number {
  return ans != null && ans >= 0;
}

const randomOf = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export default function Outline1832({ config }: { config: SimpleBankConfig }) {
  const { data, error } = useBank<BankQ[]>(config.dataFile);
  if (!data) return <div className="pg-outline"><div className="wrap"><BankLoading error={error} /></div></div>;
  return <OutlineApp bank={data} config={config} />;
}

function OutlineApp({ bank, config }: { bank: BankQ[]; config: SimpleBankConfig }) {
  const [, setVersion] = useState(0);
  const bump = useCallback(() => setVersion(v => v + 1), []);
  const [viewMode, setViewMode] = useState<ViewMode>('en');
  const uiLang = viewMode === 'th' ? 'th' : 'en';
  const x = I18N[uiLang];
  const [selected, setSelected] = useState<Set<number>>(() => new Set([1, 2, 3, 4, 5]));
  const [screen, setScreen] = useState<Screen>('home');
  const [qCount, setQCount] = useState('25');
  const [qMode, setQMode] = useState('practice');
  const [qIntegrity, setQIntegrity] = useState('on');
  const [qTimer, setQTimer] = useState('90');
  const [userName, setUserName] = useState('');
  const [homeBtn, setHomeBtn] = useState(false);
  const [resumeDesc, setResumeDesc] = useState<string | null>(null);
  const [mistakeDesc, setMistakeDesc] = useState<string | null>(null);
  const [timerText, setTimerText] = useState('1:30');
  const [timerCls, setTimerCls] = useState('');
  const [strict, setStrict] = useState(false);
  const [strikeBadge, setStrikeBadge] = useState<{ text: string; pink: boolean } | null>(null);
  const [strikeDots, setStrikeDots] = useState(0);
  const [modal, setModal] = useState<StrikeModal | null>(null);
  const [blurred, setBlurred] = useState(false);
  const [intToast, setIntToast] = useState<{ msg: string | null; show: boolean }>({ msg: null, show: false });
  const [result, setResult] = useState<ResultView | null>(null);
  const [review, setReview] = useState<ReviewView | null>(null);
  const [sendNote, setSendNote] = useState('Saving result…');
  const [companionOn, setCompanionOn] = useState(false);
  const [companion, setCompanion] = useState({ speech: 'ลุยเลย! ค่อย ๆ อ่านโจทย์นะ', sprite: '●', name: 'BYTE Lv.1', streak: 'x0 STREAK', bg: '', anim: '', seq: 0 });
  const [pwaToast, setPwaToast] = useState(false);
  const [resizeSeq, setResizeSeq] = useState(0);

  const sessionRef = useRef<Session | null>(null);
  const screenRef = useRef<Screen>('home');
  const tickRef = useRef<number | null>(null);
  const comp = useRef({ streak: 0, level: 1, timer: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const modalRef = useRef<StrikeModal | null>(null);
  const pwaWorker = useRef<ServiceWorker | null>(null);
  const viewRef = useRef<ViewMode>('en');
  const selectedRef = useRef(selected);
  const nameValRef = useRef('');
  viewRef.current = viewMode;
  selectedRef.current = selected;
  nameValRef.current = userName;
  modalRef.current = modal;

  const session = sessionRef.current;
  const showEn = viewMode === 'en' || viewMode === 'both';
  const showTh = viewMode === 'th' || viewMode === 'both';

  const go = (s: Screen) => { screenRef.current = s; setScreen(s); };

  const saveActiveSession = useCallback(() => {
    const s = sessionRef.current;
    if (!s || !s.items || !s.items.length) return;
    if (s.i >= s.items.length) return;
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify({
        v: QUIZ_SCHEMA_VERSION,
        userName: s.userName,
        mode: s.mode,
        limit: s.limit,
        i: s.i,
        answers: s.answers,
        reasons: s.reasons,
        itemIndices: s.items.map(it => bank.indexOf(it)),
        integrityStrikes: s.integrityStrikes || 0,
        timeLeft: typeof s.left === 'number' ? s.left : s.limit,
        timestamp: Date.now(),
      }));
    } catch { /* storage restricted */ }
  }, [bank]);

  const checkSavedSession = useCallback(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (!raw) { setResumeDesc(null); return; }
      const st = JSON.parse(raw);
      if (!st || st.v !== QUIZ_SCHEMA_VERSION || !st.itemIndices || !st.itemIndices.length) {
        try { localStorage.removeItem(SAVED_KEY); } catch { /* ignore */ }
        setResumeDesc(null);
        return;
      }
      const answeredCount = (st.answers || []).filter((a: number | null) => a !== null && a !== -1).length;
      setResumeDesc('ทำค้างอยู่ที่ข้อ ' + ((st.i || 0) + 1) + '/' + st.itemIndices.length + ' (ตอบแล้ว ' + answeredCount + ' ข้อ)');
    } catch { /* ignore */ }
  }, []);

  const checkMistakeBank = useCallback(() => {
    try {
      const raw = localStorage.getItem(MISTAKE_KEY);
      if (!raw) { setMistakeDesc(null); return; }
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : [];
      if (!list.length) { setMistakeDesc(null); return; }
      setMistakeDesc('มีข้อสอบในคลังรอฝึกทบทวน ' + list.length + ' ข้อ (Mastery streak >= 2 เพื่อปลดออก)');
    } catch { /* ignore */ }
  }, []);

  const updateCompanionUI = useCallback((speech: string | null, anim: '' | 'bounce' | 'shake') => {
    let stage = COMPANION.evolutionStages[0];
    for (const s of COMPANION.evolutionStages) if (comp.current.level >= s.minLevel) stage = s;
    setCompanion(c => ({
      speech: speech ?? c.speech,
      sprite: stage.sprite,
      name: `${stage.name} Lv.${comp.current.level}`,
      streak: `x${comp.current.streak} STREAK`,
      bg: stage.bg,
      anim,
      seq: c.seq + 1,
    }));
    if (speech) {
      window.clearTimeout(comp.current.timer);
      comp.current.timer = window.setTimeout(() => {
        const s = sessionRef.current;
        setCompanion(c => ({ ...c, speech: `พร้อมลุยข้อ ${s ? s.i + 1 : 1} แล้ว!` }));
      }, 4500);
    }
  }, []);

  const initCompanion = useCallback(() => {
    comp.current.streak = 0;
    comp.current.level = 1;
    updateCompanionUI('ยินดีที่ได้ร่วมทาง! ลุยไปด้วยกันนะ', '');
  }, [updateCompanionUI]);

  const onCompanionAnswer = (isCorrect: boolean) => {
    const s = sessionRef.current;
    if (s && s.mode !== 'practice') return;
    if (isCorrect) {
      comp.current.streak++;
      if (comp.current.streak % 3 === 0) comp.current.level++;
      const bonus = comp.current.streak >= 3 ? ` (Streak x${comp.current.streak}!)` : '';
      updateCompanionUI(randomOf(COMPANION.correctQuotes) + bonus, 'bounce');
    } else {
      comp.current.streak = 0;
      updateCompanionUI(randomOf(COMPANION.wrongQuotes), 'shake');
    }
  };

  const stopTimer = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  }, []);

  const finishRef = useRef<() => void>(() => undefined);
  const nextRef = useRef<() => void>(() => undefined);

  const onTimeout = useCallback(() => {
    stopTimer();
    const s = sessionRef.current;
    if (!s || s.answers[s.i] !== null) return;
    s.answers[s.i] = -2;
    s.reasons[s.i] = 'timeout';
    if (s.mode === 'practice') bump();
    else nextRef.current();
  }, [stopTimer, bump]);

  const startTimer = useCallback((keepTimer?: boolean) => {
    stopTimer();
    const s = sessionRef.current;
    if (!s) return;
    if (!s.limit) { setTimerText('OFF'); setTimerCls(''); return; }
    s.left = (keepTimer && typeof s.left === 'number' && s.left > 0) ? s.left : s.limit;
    setTimerText(fmtTime(s.left));
    setTimerCls('');
    tickRef.current = window.setInterval(() => {
      const cur = sessionRef.current;
      if (!cur) return;
      cur.left -= 1;
      setTimerText(fmtTime(cur.left));
      setTimerCls(cur.left <= 20 && cur.left > 0 ? 'warn' : '');
      if (cur.left % 5 === 0) saveActiveSession();
      if (cur.left <= 0) { setTimerCls('dead'); onTimeout(); }
    }, 1000);
  }, [stopTimer, saveActiveSession, onTimeout]);

  const renderQuestion = useCallback((keepTimer?: boolean) => {
    const s = sessionRef.current;
    if (s) s.qStartTime = Date.now();
    if (!keepTimer) startTimer();
    bump();
  }, [startTimer, bump]);

  const enterQuiz = () => { go('quiz'); setHomeBtn(true); };

  const updateMistakeBankHardened = (items: BankQ[], answers: (number | null)[]) => {
    try {
      const raw = localStorage.getItem(MISTAKE_KEY);
      let entries: { idx: number; streak: number }[] = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) entries = parsed.map(item => (typeof item === 'number' ? { idx: item, streak: 0 } : item));
      }
      const map = new Map<number, number>();
      entries.forEach(e => map.set(e.idx, e.streak || 0));
      items.forEach((q, i) => {
        const bIdx = bank.indexOf(q);
        if (bIdx === -1) return;
        if (answers[i] !== q.a) map.set(bIdx, 0);
        else if (map.has(bIdx)) {
          const ns = (map.get(bIdx) || 0) + 1;
          if (ns >= 2) map.delete(bIdx); else map.set(bIdx, ns);
        }
      });
      let updated: { idx: number; streak: number }[] = [];
      map.forEach((streak, idx) => updated.push({ idx, streak }));
      if (updated.length > 250) updated = updated.slice(updated.length - 250);
      localStorage.setItem(MISTAKE_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  const sendResultToSheet = (s: Session) => {
    const tracker = config.tracker;
    if (!tracker || !s.summary) return;
    const xx = I18N[viewRef.current === 'th' ? 'th' : 'en'];
    setSendNote(xx.sending);
    const name = ((nameRef.current && nameRef.current.value) || s.userName || '').trim() || 'Anonymous';
    try { localStorage.setItem(NAME_KEY, name); } catch { /* ignore */ }
    const sum = s.summary;
    const answers = s.items.map((q, i) => {
      const ans = s.answers[i];
      const d = DOMAINS.find(dd => dd.id === q.d);
      let yourAnswer = 'SKIPPED';
      if (isAnswered(ans)) yourAnswer = answerLabel(q, ans);
      else if (ans === -2 || s.reasons[i] === 'timeout') yourAnswer = 'TIMEOUT';
      else if (ans == null) yourAnswer = 'NOT ANSWERED';
      return {
        domain: q.d,
        domainName: d ? d.en : String(q.d),
        questionId: i + 1,
        question: q.q,
        yourAnswer,
        correctAnswer: LETTERS[q.a] + '. ' + q.c[q.a],
        isCorrect: ans === q.a,
      };
    });
    const payload = {
      name,
      mode: s.mode || 'practice',
      domains: [...selectedRef.current].sort(),
      language: viewRef.current,
      total: sum.total,
      correct: sum.correct,
      wrong: Math.max(0, sum.total - sum.correct),
      answers,
    };
    postToSheet(tracker, JSON.stringify(payload)).then(() => {
      const x2 = I18N[viewRef.current === 'th' ? 'th' : 'en'];
      setSendNote(x2.sent + ' [' + name + ' / ' + sum.pct + '%]');
    });
  };

  const finish = () => {
    const s = sessionRef.current;
    if (!s) return;
    setCompanionOn(false);
    stopTimer();
    try { localStorage.removeItem(SAVED_KEY); } catch { /* ignore */ }
    let correct = 0, skipped = 0, timed = 0;
    const by: Record<number, { c: number; t: number }> = {};
    DOMAINS.forEach(d => { by[d.id] = { c: 0, t: 0 }; });
    s.items.forEach((q, i) => {
      by[q.d].t++;
      const a = s.answers[i];
      const r = s.reasons[i];
      if (a === q.a) { correct++; by[q.d].c++; }
      if (r === 'skipped' || a === -1) skipped++;
      if (r === 'timeout' || a === -2) timed++;
    });
    const total = s.items.length;
    const pct = total ? Math.round(correct / total * 100) : 0;
    const passed = pct >= 70;
    s.summary = { correct, total, skipped, timed, pct, passed, by };
    go('result');
    const missed = s.items.filter((q, i) => s.answers[i] !== q.a && bank.indexOf(q) !== -1).length;
    updateMistakeBankHardened(s.items, s.answers);
    const vm = viewRef.current;
    const xx = I18N[vm === 'th' ? 'th' : 'en'];
    const strikes = s.integrityStrikes || 0;
    let verdictCls: string;
    let verdictText: string;
    if (s.disqualified) {
      verdictCls = 'verdict fail';
      verdictText = 'DISQUALIFIED · ละเมิดกติกาความปลอดภัยครบ 3 ครั้ง';
    } else {
      verdictText = passed ? xx.pass : xx.fail;
      verdictCls = 'verdict ' + (passed ? 'pass' : 'fail');
    }
    let detail = xx.answered(correct, total, skipped, timed);
    if (s.endedEarly) detail += ' · ' + xx.endedEarly;
    setStrict(false);
    if (s.strictIntegrity) {
      detail += ' · สลับหน้าต่าง: ' + (s.tabSwitches || 0) + ' ครั้ง';
      if ((s.suspiciousFastAnswers || 0) > 0) detail += ' · ตอบเร็วผิดปกติ: ' + s.suspiciousFastAnswers + ' ข้อ';
    }
    setResult({
      score: pct + '%',
      verdictCls,
      verdictText,
      integrityLog: s.disqualified ? 0 : strikes,
      detail,
      bars: DOMAINS.filter(d => by[d.id].t).map(d => ({ name: domainName(d.id, vm), c: by[d.id].c, t: by[d.id].t, p: Math.round(by[d.id].c / by[d.id].t * 100) })),
      missed,
    });
    setReview(null);
    sendResultToSheet(s);
  };
  finishRef.current = finish;

  const nextQ = () => {
    stopTimer();
    const s = sessionRef.current;
    if (!s) return;
    if (s.i >= s.items.length - 1) { finish(); return; }
    s.i++;
    renderQuestion();
    saveActiveSession();
  };
  nextRef.current = nextQ;

  const skipQ = () => {
    const s = sessionRef.current;
    if (!s) return;
    if (s.answers[s.i] === null) { s.answers[s.i] = -1; s.reasons[s.i] = 'skipped'; }
    nextQ();
    saveActiveSession();
  };

  const pick = (idx: number) => {
    const s = sessionRef.current;
    if (!s) return;
    if (s.answers[s.i] !== null && s.mode === 'practice') return;
    if (s.answers[s.i] !== null && s.reasons[s.i] === 'timeout') return;
    s.answers[s.i] = idx;
    s.reasons[s.i] = 'answered';
    const q = s.items[s.i];
    if (s.strictIntegrity) {
      const latency = Date.now() - (s.qStartTime || Date.now());
      if (((q && q.q) || '').length > 140 && latency < 1800) s.suspiciousFastAnswers = (s.suspiciousFastAnswers || 0) + 1;
    }
    onCompanionAnswer(idx === q.a);
    if (s.mode === 'practice') stopTimer();
    bump();
    saveActiveSession();
  };

  const startQuiz = () => {
    const name = userName.trim();
    if (!name) { alert(x.needName); nameRef.current?.focus(); return; }
    try { localStorage.setItem(NAME_KEY, name); } catch { /* ignore */ }
    if (!selected.size) { alert(x.needDomain); return; }
    let items = shuffle(bank.filter(q => selected.has(q.d)));
    if (qCount !== 'all') items = items.slice(0, Math.min(+qCount, items.length));
    sessionRef.current = {
      items, i: 0, userName: name, mode: qMode, limit: parseInt(qTimer, 10),
      answers: Array(items.length).fill(null), reasons: Array(items.length).fill(''),
      left: 0, endedEarly: false, strictIntegrity: true, tabSwitches: 0, suspiciousFastAnswers: 0, qStartTime: Date.now(),
    };
    setStrict(true);
    enterQuiz();
    if (qMode === 'practice') { setCompanionOn(true); initCompanion(); } else setCompanionOn(false);
    renderQuestion();
    saveActiveSession();
  };

  const startPearsonVue = () => {
    const name = userName.trim() || 'Candidate';
    const targets: Record<number, number> = { 1: 26, 2: 10, 3: 22, 4: 24, 5: 18 };
    const pools: Record<number, BankQ[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    bank.forEach(q => { if (pools[q.d]) pools[q.d].push(q); });
    let items: BankQ[] = [];
    for (let d = 1; d <= 5; d++) items.push(...shuffle(pools[d]).slice(0, targets[d]));
    items = shuffle(items);
    sessionRef.current = {
      items, i: 0, userName: name, mode: 'exam', limit: 72,
      answers: Array(items.length).fill(null), reasons: Array(items.length).fill(''),
      left: 0, endedEarly: false, isPearsonVue: true, strictIntegrity: true, integrityStrikes: 0,
      tabSwitches: 0, suspiciousFastAnswers: 0, qStartTime: Date.now(),
    };
    setStrict(true);
    enterQuiz();
    setCompanionOn(false);
    renderQuestion();
    saveActiveSession();
  };

  const practiceMistakes = () => {
    try {
      const raw = localStorage.getItem(MISTAKE_KEY);
      if (!raw) { alert('ไม่มีข้อสอบในคลังข้อผิด'); return; }
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : [];
      if (!list.length) { alert('ไม่มีข้อสอบในคลังข้อผิด'); return; }
      const items = list.map((item: number | { idx: number }) => (typeof item === 'object' ? bank[item.idx] : bank[item])).filter(Boolean);
      if (!items.length) { alert('ไม่พบข้อสอบในระบบ'); return; }
      sessionRef.current = {
        items: shuffle(items), i: 0, userName: userName.trim() || 'Candidate', mode: 'practice', limit: 0,
        answers: Array(items.length).fill(null), reasons: Array(items.length).fill(''), left: 0, endedEarly: false,
      };
      enterQuiz();
      renderQuestion();
      saveActiveSession();
    } catch { /* ignore */ }
  };

  const retryCurrentMissed = () => {
    const s = sessionRef.current;
    if (!s || !s.items) return;
    const missed = s.items.filter((q, i) => s.answers[i] !== q.a);
    if (!missed.length) return;
    sessionRef.current = {
      items: shuffle(missed), i: 0, userName: s.userName, mode: s.mode, limit: s.limit,
      answers: Array(missed.length).fill(null), reasons: Array(missed.length).fill(''), left: 0, endedEarly: false,
    };
    enterQuiz();
    renderQuestion();
    saveActiveSession();
  };

  const resumeSession = () => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (!raw) return;
      const st = JSON.parse(raw);
      if (!st || st.v !== QUIZ_SCHEMA_VERSION || !st.itemIndices || !st.itemIndices.length) {
        try { localStorage.removeItem(SAVED_KEY); } catch { /* ignore */ }
        return;
      }
      const items = (st.itemIndices as number[]).map(idx => bank[idx]).filter(Boolean);
      if (!items.length) return;
      sessionRef.current = {
        items, i: Math.min(st.i || 0, items.length - 1), userName: st.userName || '', mode: st.mode || 'exam',
        limit: st.limit || 0, answers: st.answers || Array(items.length).fill(null),
        reasons: st.reasons || Array(items.length).fill(''),
        left: typeof st.timeLeft === 'number' ? st.timeLeft : (st.limit || 0),
        endedEarly: false, strictIntegrity: true, integrityStrikes: st.integrityStrikes || 0,
      };
      const strikes = st.integrityStrikes || 0;
      if (strikes > 0) setStrikeBadge(b => ({ text: `STRIKES: ${strikes}/3`, pink: (b && b.pink) || strikes >= 2 }));
      go('quiz');
      if ((st.mode || 'exam') === 'exam') setCompanionOn(false);
      else { setCompanionOn(true); initCompanion(); }
      setHomeBtn(true);
      renderQuestion(true);
    } catch { /* ignore */ }
  };

  const goHome = () => {
    setCompanionOn(false);
    stopTimer();
    setStrict(false);
    go('home');
    setHomeBtn(false);
    checkSavedSession();
    checkMistakeBank();
  };

  const endNow = () => {
    const s = sessionRef.current;
    if (!s) return;
    s.endedEarly = true;
    finish();
  };

  const showReview = () => {
    setReview({ viewMode, x });
  };
  useEffect(() => {
    if (review) reviewRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [review]);

  const triggerIntegrityToast = (msg: string) => {
    setIntToast({ msg, show: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setIntToast(t => ({ ...t, show: false })), 3500);
  };

  const requestExamFullscreen = () => {
    const elem = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
    try {
      if (elem.requestFullscreen) elem.requestFullscreen().catch(() => undefined);
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    } catch { /* ignore */ }
  };

  const disqualify = () => {
    const s = sessionRef.current;
    setModal(null);
    modalRef.current = null;
    if (!s) return;
    s.isHandlingStrike = false;
    s.endedEarly = true;
    s.disqualified = true;
    finishRef.current();
  };

  const triggerIntegrityStrike = (reason: string) => {
    const s = sessionRef.current;
    if (!s || !s.strictIntegrity || screenRef.current !== 'quiz') return;
    if (s.isHandlingStrike) return;
    s.isHandlingStrike = true;
    s.integrityStrikes = (s.integrityStrikes || 0) + 1;
    saveActiveSession();
    const strikes = s.integrityStrikes;
    setStrikeBadge(b => ({ text: `STRIKES: ${strikes}/3`, pink: (b && b.pink) || strikes >= 2 }));
    setStrikeDots(strikes);
    if (strikes >= 3) {
      const m: StrikeModal = {
        title: '[X] DISQUALIFIED: ละเมิดกติกาครบ 3 ครั้ง',
        desc: <>ตรวจพบการสลับหน้าต่างหรือหลุดจากโหมดเต็มหน้าจอครบ 3 ครั้ง<br /><strong>ระบบได้ยุติการสอบและประมวลผลคะแนนของข้อที่ทำทันที</strong></>,
        btnText: 'ดูผลคะแนนการสอบ',
        btnBg: 'var(--pink)',
        final: true,
      };
      setModal(m);
      modalRef.current = m;
      window.setTimeout(() => { if (modalRef.current === m) disqualify(); }, 3800);
      return;
    }
    const m: StrikeModal = {
      title: `[!] INTEGRITY STRIKE ${strikes}/3: ออกจากโหมดสอบ`,
      desc: <>{reason || 'ตรวจพบการสลับหน้าต่างหรือหลุดออกจากโหมดเต็มหน้าจอ'}<br /><strong>คำเตือน:</strong> หากตรวจพบครบ 3 ครั้ง ระบบจะตัดสิทธิ์และส่งผลสอบทันที</>,
      btnText: '⛶ ล็อกเต็มหน้าจอและสอบต่อ',
      btnBg: 'var(--ink)',
      final: false,
    };
    setModal(m);
    modalRef.current = m;
  };

  const onModalButton = () => {
    const m = modalRef.current;
    if (!m) return;
    if (m.final) { disqualify(); return; }
    requestExamFullscreen();
    setModal(null);
    modalRef.current = null;
    window.setTimeout(() => { const s = sessionRef.current; if (s) s.isHandlingStrike = false; }, 500);
  };

  const handlers = useRef({ triggerIntegrityStrike, triggerIntegrityToast, pick, nextQ });
  handlers.current = { triggerIntegrityStrike, triggerIntegrityToast, pick, nextQ };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAME_KEY) || '';
      if (saved) setUserName(saved);
    } catch { /* ignore */ }
    checkSavedSession();
    checkMistakeBank();
  }, [checkSavedSession, checkMistakeBank]);

  useEffect(() => {
    const strictQuiz = () => {
      const s = sessionRef.current;
      return !!(s && s.strictIntegrity && screenRef.current === 'quiz');
    };
    const isFs = () => !!(document.fullscreenElement || (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement);
    let resizeTimer = 0;
    const onResize = () => {
      if (!strictQuiz()) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => setResizeSeq(v => v + 1), 120);
    };
    const onOrientation = () => window.setTimeout(onResize, 150);
    const onContext = (e: Event) => { if (strictQuiz()) { e.preventDefault(); e.stopPropagation(); } };
    const onSelectStart = (e: Event) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (strictQuiz() && tag !== 'INPUT' && tag !== 'TEXTAREA') e.preventDefault();
    };
    const onCopy = (e: ClipboardEvent) => {
      if (!strictQuiz()) return;
      e.preventDefault();
      const sel = (window.getSelection() || '').toString();
      if (!sel) return;
      const poisoned = sel.split('').map(ch => ch + (Math.random() > 0.4 ? '\u200B' : '\u200C')).join('');
      if (e.clipboardData) e.clipboardData.setData('text/plain', poisoned);
    };
    const onFsChange = () => {
      if (strictQuiz() && !isFs()) handlers.current.triggerIntegrityStrike('ตรวจพบการหลุดออกจากโหมดเต็มหน้าจอ (Fullscreen Exited)');
    };
    const onBlur = () => { if (strictQuiz()) setBlurred(true); };
    const onFocus = () => { if (strictQuiz()) setBlurred(false); };
    const onPointer = () => setBlurred(false);
    const onVisibility = () => {
      if (strictQuiz() && document.hidden) handlers.current.triggerIntegrityStrike('ตรวจพบการสลับแท็บหรือเปิดแอปพลิเคชันอื่น (Tab/App Switch)');
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const s = sessionRef.current;
      if (s && s.strictIntegrity && e.key === 'PrintScreen') {
        try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText('').catch(() => undefined); } catch { /* ignore */ }
        handlers.current.triggerIntegrityToast('[!] ไม่อนุญาตให้ใช้คำสั่ง PrintScreen ระหว่างสอบ');
      }
    };
    const onWinKeyDown = (e: KeyboardEvent) => {
      if (!strictQuiz()) return;
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ['s', 'S', '3', '4'].includes(e.key)) {
        e.preventDefault();
        handlers.current.triggerIntegrityToast('[!] ตรวจพบปุ่มลัดจับภาพหน้าจอ (Screen Capture Blocked)');
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handlers.current.triggerIntegrityToast('[!] ไม่อนุญาตให้สั่งพิมพ์ (Print) หน้าข้อสอบ');
      }
    };
    const keyMap: Record<string, number> = {
      Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3,
      Numpad1: 0, Numpad2: 1, Numpad3: 2, Numpad4: 3,
      KeyA: 0, KeyB: 1, KeyC: 2, KeyD: 3,
    };
    const onDocKeyDown = (e: KeyboardEvent) => {
      if (screenRef.current !== 'quiz') return;
      if (e.code in keyMap) { e.preventDefault(); handlers.current.pick(keyMap[e.code]); }
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.code === 'Enter' || e.code === 'ArrowRight' || (e.code === 'Space' && tag !== 'BUTTON' && tag !== 'INPUT')) {
        e.preventDefault();
        const btn = document.getElementById('btnNext') as HTMLButtonElement | null;
        if (btn && !btn.disabled) handlers.current.nextQ();
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrientation);
    window.addEventListener('contextmenu', onContext);
    document.addEventListener('selectstart', onSelectStart);
    document.addEventListener('copy', onCopy);
    document.addEventListener('contextmenu', onContext);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pointerdown', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onWinKeyDown);
    document.addEventListener('keydown', onDocKeyDown);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientation);
      window.removeEventListener('contextmenu', onContext);
      document.removeEventListener('selectstart', onSelectStart);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onWinKeyDown);
      document.removeEventListener('keydown', onDocKeyDown);
      window.clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => () => {
    if (tickRef.current) clearInterval(tickRef.current);
    window.clearTimeout(comp.current.timer);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              pwaWorker.current = worker;
              setPwaToast(true);
            }
          });
        });
      }).catch(() => undefined);
    };
    if (document.readyState === 'complete') register();
    else {
      window.addEventListener('load', register, { once: true });
      return () => window.removeEventListener('load', register);
    }
  }, []);

  const changeView = (mode: ViewMode) => {
    setViewMode(mode);
    if (sessionRef.current && screenRef.current === 'quiz') renderQuestion(true);
  };
  const toggleDomain = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const q = screen === 'quiz' && session ? session.items[session.i] : null;
  const strictQ = !!(q && session && session.strictIntegrity);
  const canvasKey = q && session ? `${session.i}|${bank.indexOf(q)}|${viewMode}|${session.userName}` : '';
  useLayoutEffect(() => {
    const cv = canvasRef.current;
    const s = sessionRef.current;
    if (!strictQ || !cv || !s) return;
    const cur = s.items[s.i];
    renderQuestionCanvas(cv, cur, { showEn: viewRef.current === 'en' || viewRef.current === 'both', showTh: viewRef.current === 'th' || viewRef.current === 'both', candidateId: s.userName || 'Candidate' });
  }, [strictQ, canvasKey, resizeSeq]);

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  bank.forEach(b => { counts[b.d]++; });
  const selCount = bank.filter(b => selected.has(b.d)).length;
  const trCount = bank.filter(b => b.qt).length;
  const selIds = [...selected].sort();

  const chosen = session && q ? session.answers[session.i] : null;
  const practice = session?.mode === 'practice';
  const revealed = !!q && practice && chosen !== null;
  let status = '';
  if (q && session && chosen !== null) {
    status = x.incorrect;
    if (chosen === q.a) status = x.correct;
    if (session.reasons[session.i] === 'timeout') status = x.timeout;
    if (chosen === -1) status = x.skipped;
  }

  const printName = userName.trim() || 'Anonymous';
  const sum = session?.summary;

  return (
    <div className={'pg-outline' + (strict ? ' strict-exam-active' : '')}>
      <div className="wrap">
        <header className="hero-section">
          <div className="eyebrow">ISC2 CC · PRACTICE QUIZ (THAI OUTLINE)</div>
          <h1 id="t-title">{x.title}</h1>
          <div className="sub" id="t-sub">{x.sub}</div>
          <div className="toolbar" style={sx('margin-top: 18px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;')}>
            <div className="seg" id="langSeg" title="Language display">
              {(['en', 'th', 'both'] as ViewMode[]).map(m => (
                <button key={m} type="button" data-mode={m} className={viewMode === m ? 'on' : undefined} onClick={() => changeView(m)}>
                  {m === 'en' ? 'EN' : m === 'th' ? 'TH' : 'EN+TH'}
                </button>
              ))}
            </div>
            <button className={'btn' + (homeBtn ? '' : ' hidden')} id="btnHome" type="button" onClick={goHome}>{x.home}</button>
          </div>
        </header>

        <section id="screen-home" className={'hero' + (screen === 'home' ? '' : ' hidden')}>
          <div id="resumeBanner" className={'card' + (resumeDesc ? '' : ' hidden')} style={sx('margin-bottom: 18px; border: 3px solid var(--ink); box-shadow: 5px 5px 0 var(--ink); background: var(--cream-2); padding: 16px 20px;')}>
            <div style={sx('display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;')}>
              <div>
                <div style={sx('display: flex; align-items: center; gap: 8px;')}>
                  <span className="pill" style={sx('background: var(--yellow); color: var(--ink); font-family: var(--font-mono); font-size: 11px; font-weight: 700; padding: 2px 8px; border: 1px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); text-transform: uppercase;')}>Saved Session</span>
                  <strong id="resumeTitle" style={sx('color: var(--ink); font-family: var(--font-display); font-size: 16px; text-transform: uppercase;')}>พบแบบทดสอบที่ทำค้างไว้</strong>
                </div>
                <div id="resumeDesc" style={sx('font-size: 13.5px; color: var(--ink-2); margin-top: 4px;')}>{resumeDesc ?? 'ทำค้างอยู่ที่ข้อ 1/100'}</div>
              </div>
              <div style={sx('display: flex; gap: 8px;')}>
                <button className="btn primary" id="btnResume" type="button" style={sx('padding: 8px 16px; font-size: 13px;')} onClick={resumeSession}>ทำต่อจากจุดเดิม</button>
                <button className="btn" id="btnDiscardResume" type="button" style={sx('padding: 8px 16px; font-size: 13px;')} onClick={() => { localStorage.removeItem(SAVED_KEY); setResumeDesc(null); }}>ล้างข้อมูล</button>
              </div>
            </div>
          </div>
          <div id="mistakeBanner" className={'card' + (mistakeDesc ? '' : ' hidden')} style={sx('margin-bottom: 18px; border: 3px solid var(--ink); box-shadow: 5px 5px 0 var(--ink); background: #FEF3C7; padding: 16px 20px;')}>
            <div style={sx('display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;')}>
              <div>
                <div style={sx('display: flex; align-items: center; gap: 8px;')}>
                  <span className="pill" style={sx('background: var(--orange); color: var(--white); font-family: var(--font-mono); font-size: 11px; font-weight: 700; padding: 2px 8px; border: 1px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); text-transform: uppercase;')}>Active Recall</span>
                  <strong id="mistakeTitle" style={sx('color: var(--ink); font-family: var(--font-display); font-size: 16px; text-transform: uppercase;')}>คลังข้อที่เคยตอบผิด (Spaced Repetition)</strong>
                </div>
                <div id="mistakeDesc" style={sx('font-size: 13.5px; color: var(--ink-2); margin-top: 4px;')}>{mistakeDesc ?? 'มีข้อสอบที่บันทึกไว้รอทบทวน 0 ข้อ'}</div>
              </div>
              <div style={sx('display: flex; gap: 8px;')}>
                <button className="btn primary" id="btnPracticeMistakes" type="button" style={sx('padding: 8px 16px; font-size: 13px; background: var(--orange); color: var(--white);')} onClick={practiceMistakes}>ฝึกทำข้อที่เคยผิด</button>
                <button className="btn" id="btnClearMistakes" type="button" style={sx('padding: 8px 16px; font-size: 13px;')} onClick={() => { localStorage.removeItem(MISTAKE_KEY); setMistakeDesc(null); }}>ล้างคลังข้อผิด</button>
              </div>
            </div>
          </div>
          <div className="card pearson-card" style={sx('margin-bottom: 20px; background: var(--white); border: 3px solid var(--ink); box-shadow: 5px 5px 0 var(--ink); padding: 18px 22px;')}>
            <div style={sx('display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;')}>
              <div>
                <div style={sx('display: flex; align-items: center; gap: 8px;')}>
                  <span className="pill" style={sx('background: var(--green); color: var(--white); font-family: var(--font-mono); font-size: 11px; font-weight: 700; padding: 2px 8px; border: 1px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); text-transform: uppercase;')}>Official Outline</span>
                  <strong style={sx('color: var(--ink); font-family: var(--font-display); font-size: 16px; text-transform: uppercase;')}>จำลองสอบจริง Pearson VUE (100 ข้อ / 120 นาที)</strong>
                </div>
                <div style={sx('font-size: 13.5px; color: var(--ink-2); margin-top: 6px; line-height: 1.5;')}>
                  สุ่มข้อสอบตามสัดส่วนข้อสอบทางการ: D1 (26q), D2 (10q), D3 (22q), D4 (24q), D5 (18q) · ห้ามย้อนกลับ (Linear Flow)
                </div>
              </div>
              <button className="btn primary" id="btnPearsonVue" type="button" style={sx('padding: 10px 22px; font-size: 14px; background: var(--green); color: var(--white);')} onClick={startPearsonVue}>
                เริ่มจำลองสอบจริง
              </button>
            </div>
          </div>
          <h2 id="t-hero">{x.hero}</h2>
          <p id="t-hero-p">{x.heroP}</p>

          <div className="domains" id="domainList">
            {DOMAINS.map(d => (
              <div key={d.id} className={'domain' + (selected.has(d.id) ? ' selected' : '')} data-id={d.id} onClick={() => toggleDomain(d.id)}>
                <span className="num">{d.id}</span>
                <div className="meta">
                  <div>{viewMode === 'th' ? d.th : viewMode === 'both' ? <>{d.en}<br /><small className="th-text">{d.th}</small></> : d.en}</div>
                  <small>{counts[d.id]} {x.available}</small>
                </div>
                <div style={sx('display:flex;align-items:center;gap:10px')}>
                  <span className="weight">{d.weight}</span>
                  <span className="chk" />
                </div>
              </div>
            ))}
          </div>
          <p className="pill" id="selDomainsLine" style={sx('margin:0 0 12px')}>
            {selIds.length ? selIds.map(id => id + '. ' + domainName(id, viewMode)).join('  ·  ') : x.needDomain}
          </p>

          <div className="controls">
            <div className="field">
              <label id="t-len">{x.len}</label>
              <select id="qCount" value={qCount} onChange={e => setQCount(e.target.value)}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">{x.allOpt}</option>
              </select>
            </div>
            <div className="field">
              <label id="t-mode">{x.mode}</label>
              <select id="qMode" value={qMode} onChange={e => setQMode(e.target.value)}>
                <option value="practice">{x.practice}</option>
                <option value="exam">{x.exam}</option>
              </select>
            </div>
            <div className="field">
              <label id="t-integrity">Strict Exam Integrity</label>
              <select id="qIntegrity" value={qIntegrity} onChange={e => setQIntegrity(e.target.value)}>
                <option value="on">Enabled (Anti-AI &amp; Copy Protection)</option>
                <option value="off">Disabled (Study Friendly)</option>
              </select>
            </div>
            <div className="field">
              <label id="t-timer">{x.timer}</label>
              <select id="qTimer" value={qTimer} onChange={e => setQTimer(e.target.value)}>
                <option value="90">1:30</option>
                <option value="60">1:00</option>
                <option value="120">2:00</option>
                <option value="0">Off</option>
              </select>
            </div>
            <div className="field name-field">
              <label id="t-name">{x.name}</label>
              <input
                ref={nameRef}
                id="userName"
                type="text"
                maxLength={80}
                placeholder="Name"
                required
                autoComplete="name"
                value={userName}
                onChange={e => { setUserName(e.target.value); try { localStorage.setItem(NAME_KEY, e.target.value.trim()); } catch { /* ignore */ } }}
              />
            </div>
            <button className="btn primary" id="btnStart" type="button" onClick={startQuiz}>{x.start}</button>
            <button className="btn" id="btnAll" type="button" onClick={() => setSelected(selected.size === 5 ? new Set() : new Set([1, 2, 3, 4, 5]))}>{selected.size === 5 ? x.none : x.all}</button>
          </div>
          <div className="stats-row">
            <span className="pill" id="bankStat">{bank.length} {x.inBank}</span>{' '}
            <span className="pill" id="selStat">{selCount} {x.selected}</span>{' '}
            <span className="pill" id="trStat">{trCount} / {bank.length} {x.translated}</span>
          </div>
        </section>

        <section id="screen-quiz" className={screen === 'quiz' ? '' : 'hidden'}>
          <div className="quiz-top">
            <div>
              <div className="q-domain" id="qDomain">{q ? 'Domain ' + q.d + ' · ' + domainName(q.d, viewMode) : ''}</div>
              <div id="qTopicBadge">{q && <TopicBadge text={q.q} />}</div>
              <div style={sx('display:flex;align-items:center;gap:8px;flex-wrap:wrap;')}>
                <div className="pill" id="qPos">{q && session ? x.qOf(session.i + 1, session.items.length) : ''}</div>
                <div id="strikeBadge" className={'pill' + (strikeBadge ? '' : ' hidden')} style={{ ...sx('background:var(--yellow);color:var(--ink);font-weight:700;border:1px solid var(--ink);box-shadow:2px 2px 0 var(--ink);'), ...(strikeBadge?.pink ? { background: 'var(--pink)' } : {}) }}>
                  {strikeBadge ? strikeBadge.text : 'STRIKES: 0/3'}
                </div>
              </div>
            </div>
            <div className="toolbar">
              <div className={'timer-box' + (timerCls ? ' ' + timerCls : '')} id="timerBox">
                <div className="lab" id="timerLab">{x.timeLeft}</div>
                <div className="val" id="timerVal">{timerText}</div>
              </div>
              <button className="btn danger" id="btnEnd" type="button" onClick={endNow}>{x.end}</button>
            </div>
          </div>
          <div className="progress"><span id="prog" style={q && session ? { width: (session.i / session.items.length * 100) + '%' } : undefined} /></div>
          <div className={'card quiz-card-container' + (blurred ? ' exam-blur' : '')} id="quizMainCard">
            <div id="blurScreenOverlay" className={'blur-overlay' + (blurred ? '' : ' hidden')} onClick={() => setBlurred(false)}>
              <span className="badge">SECURITY BLUR</span>
              <h3>หน้าจอถูกเบลออัตโนมัติ</h3>
              <p>ตรวจพบการสลับหน้าต่างหรือเครื่องมือภายนอก แตะหรือคลิกที่นี่เพื่อกลับเข้าสู่หน้าจอข้อสอบ</p>
            </div>
            <canvas ref={canvasRef} id="qCanvas" className={strictQ ? undefined : 'hidden'} style={sx('width:100%;max-width:100%;display:block;margin-bottom:12px;')} />
            <div className={'question' + (q && (strictQ || (!showEn && !(viewMode === 'th' && !q.qt))) ? ' hidden' : '')} id="qText">{q ? q.q : ''}</div>
            <div className={'question-th th-text' + (q && (strictQ || !showTh || !q.qt) ? ' hidden' : '')} id="qTextTh">{q ? q.qt || '' : ''}</div>
            <div className="choices" id="qChoices">
              {q && session && q.c.map((c, idx) => {
                const th = q.ct && q.ct[idx] ? q.ct[idx] : '';
                let cls = 'choice';
                if (revealed) {
                  cls += ' locked';
                  if (idx === q.a) cls += ' correct';
                  else if (idx === chosen) cls += ' wrong';
                } else if (!practice && chosen !== null && idx === chosen) cls += ' selected';
                const body = viewMode === 'th' && !th
                  ? <span>{c}</span>
                  : <>{showEn && <span>{c}</span>}{showTh && th && <span className="th th-text">{th}</span>}</>;
                return (
                  <button key={idx} className={cls} type="button" data-choice-idx={idx} onClick={() => pick(idx)}>
                    <span className="letter">{LETTERS[idx]}</span><span>{body}</span>
                  </button>
                );
              })}
            </div>
            <div className={'explain' + (revealed ? ' show' : '')} id="qExplain">
              {revealed && q && (
                <>
                  <b>{status}.</b>{' '}
                  {showEn && (q.e || '')}
                  {showTh && q.et && (showEn ? <><br /><span className="th-text">{q.et}</span></> : <span className="th-text">{q.et}</span>)}
                </>
              )}
            </div>
            <div className="nav">
              <button className="btn" id="btnSkip" type="button" onClick={skipQ}>{x.skip}</button>
              <button className="btn primary" id="btnNext" type="button" disabled={!q || (practice ? chosen === null : false)} onClick={nextQ}>
                {q && session && session.i === session.items.length - 1 ? x.finish : x.next}
              </button>
            </div>
          </div>
        </section>

        <section id="screen-result" className={screen === 'result' ? '' : 'hidden'}>
          <div className="card result">
            <p className="pill" id="resLabel" style={sx('display:inline-block')}>{x.result}</p>
            <div className="score" id="resScore">{result ? result.score : '0%'}</div>
            <div className={result ? result.verdictCls : 'verdict fail'} id="resVerdict">
              {result ? result.verdictText : 'FAIL'}
              {result && result.integrityLog > 0 && (
                <div style={sx('font-size:12px;margin-top:6px;font-family:var(--font-mono);font-weight:700;color:var(--pink);')}>[!] INTEGRITY LOG: ตรวจพบการสลับหน้าจอ/หลุดเต็มหน้าจอ {result.integrityLog}/3 ครั้ง</div>
              )}
            </div>
            <p id="resPassLine" style={sx('color:var(--muted);margin:4px 0 8px')}>{x.passing}</p>
            <p id="resDetail" style={sx('color:var(--muted);margin:6px 0 12px')}>{result ? result.detail : ''}</p>
            <div className="barlist" id="resBars">
              {result && result.bars.map(b => (
                <div key={b.name}>
                  <div className="barline"><span>{b.name}</span><span>{b.c}/{b.t} ({b.p}%)</span></div>
                  <div className="bar"><i style={{ width: b.p + '%' }} /></div>
                </div>
              ))}
            </div>
            <p className="send-note" id="resSend">{sendNote}</p>
            <div className="nav" style={sx('justify-content:center;flex-wrap:wrap;gap:10px;margin-top:16px;')}>
              <button className="btn" id="btnReview" type="button" onClick={showReview}>{x.review}</button>
              <button className="btn" id="btnPrint" type="button" onClick={() => window.print()}>{x.printMissed}</button>
              <button className="btn" id="btnExportJson" type="button" style={sx('background:var(--white);')} onClick={() => exportWeaknessJson(sessionRef.current, viewMode)}>Export Analysis JSON</button>
              <button className={'btn primary' + (result && result.missed > 0 ? '' : ' hidden')} id="btnRetryMissed" type="button" style={sx('background:var(--orange);color:var(--white);')} onClick={retryCurrentMissed}>
                ฝึกทำเฉพาะข้อที่ผิด (<span id="missedBadge">{result ? result.missed : 0}</span>)
              </button>
              <button className="btn primary" id="btnAgain" type="button" onClick={goHome}>{x.again}</button>
            </div>
          </div>
          <div id="reviewBox" ref={reviewRef} className={review ? undefined : 'hidden'} style={sx('margin-top:14px')}>
            {review && session && session.items.map((rq, i) => {
              const rx = review.x;
              const ans = session.answers[i];
              const r = session.reasons[i];
              let mark = ans === rq.a ? rx.correct : rx.incorrect;
              if (r === 'skipped' || ans === -1) mark = rx.skipped;
              if (r === 'timeout' || ans === -2) mark = rx.timeout;
              if (ans == null && !r) mark = rx.noAnswer;
              return (
                <div key={i} className="card" style={sx('margin-bottom:10px')}>
                  <div className="q-domain">Q{i + 1} · {domainName(rq.d, review.viewMode)} · {mark}</div>
                  <div className="question" style={sx('font-size:16px')}>{rq.q}</div>
                  {review.viewMode !== 'en' && rq.qt && <div className="question-th th-text" style={sx('font-size:15px')}>{rq.qt}</div>}
                  <div style={sx('margin:8px 0;color:var(--muted);font-size:14px')}>
                    {rx.correct}: <b style={sx('color:var(--green2)')}>{LETTERS[rq.a]}. {rq.c[rq.a]}</b>
                    {ans !== rq.a && isAnswered(ans) && <><br />{rx.incorrect}: {answerLabel(rq, ans)}</>}
                    {ans == null && !r && <><br />{rx.yourAnswer}: {rx.noAnswer}</>}
                  </div>
                  <div className="explain show"><b>{rx.explanation}.</b> {rq.e || ''}{review.viewMode !== 'en' && rq.et && <div className="th-text" style={sx('margin-top:6px')}>{rq.et}</div>}</div>
                </div>
              );
            })}
          </div>
          <div id="printArea">
            {sum && session && (
              <>
                <h2>{x.printTitle}</h2>
                <p>{printName} · {sum.pct}% · {sum.passed ? x.pass : x.fail} · {sum.correct}/{sum.total}</p>
                {session.items.every((pq, i) => session.answers[i] === pq.a) && <p>{x.correct}</p>}
                {session.items.map((pq, i) => {
                  const ans = session.answers[i];
                  if (ans === pq.a) return null;
                  const r = session.reasons[i];
                  let yours = x.noAnswer;
                  if (isAnswered(ans)) yours = answerLabel(pq, ans);
                  else if (r === 'timeout' || ans === -2) yours = x.timeout;
                  else if (r === 'skipped' || ans === -1) yours = x.skipped;
                  return (
                    <div key={i} className="miss">
                      <h3>Q{i + 1} · Domain {pq.d} · {domainName(pq.d, viewMode)}</h3>
                      <p><b>{pq.q}</b></p>
                      {pq.qt && <p>{pq.qt}</p>}
                      <p>{x.yourAnswer}: {yours}</p>
                      <p>{x.correct}: {LETTERS[pq.a]}. {pq.c[pq.a]}</p>
                      <p>{x.explanation}: {pq.e || ''}</p>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </section>

        <div className="credits" id="credits">
          Made by <b>Gotji</b> · Credit to <a href="https://openexam.kuru.in.th/" target="_blank" rel="noopener">openexam.kuru.in.th</a>
          {' '}and NCSA group
        </div>
        <footer className="note" id="t-foot">{x.foot}</footer>
      </div>

      <div id="pwaUpdateToast" className={'card' + (pwaToast ? '' : ' hidden')} style={sx('position:fixed;bottom:20px;right:20px;z-index:9999;box-shadow:4px 4px 0 var(--ink);border:3px solid var(--ink);background:var(--yellow);color:var(--ink);padding:12px 18px;display:flex;align-items:center;gap:12px;font-family:var(--font-mono);font-weight:700;')}>
        <span style={sx('font-size:13px;')}>[!] มีคลังข้อสอบเวอร์ชันใหม่</span>
        <button className="btn primary" id="btnPwaRefresh" style={sx('padding:6px 14px;font-size:12px;background:var(--ink);color:var(--white);border:2px solid var(--ink);box-shadow:2px 2px 0 var(--ink);')} onClick={() => { pwaWorker.current?.postMessage({ type: 'SKIP_WAITING' }); window.location.reload(); }}>อัปเดตทันที</button>
      </div>
      <div id="integrityWarningToast" className={'card' + (intToast.show ? '' : ' hidden')} style={sx('position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;background:var(--pink);color:var(--white);border:3px solid var(--ink);box-shadow:4px 4px 0 var(--ink);padding:10px 20px;font-size:13.5px;display:flex;align-items:center;gap:8px;font-family:var(--font-mono);font-weight:700;')}>
        <span>{intToast.msg ?? <>[!] ตรวจพบการสลับหน้าต่างหรือแท็บเบราว์เซอร์ (ครั้งที่ <span id="tabSwitchCount">0</span>)</>}</span>
      </div>

      <div id="integrityModal" className={'strike-modal' + (modal ? '' : ' hidden')}>
        <div className="strike-box">
          <span className="strike-pill">SECURITY INTEGRITY GATE</span>
          <h2 id="strikeTitle">{modal ? modal.title : '[!] ตรวจพบการออกจากโหมดสอบ (STRIKE 1/3)'}</h2>
          <p id="strikeDesc">{modal ? modal.desc : null}</p>
          <div className="strike-meter">
            {[1, 2, 3].map(i => <div key={i} className={'strike-dot' + (i <= strikeDots ? ' active' : '')} id={`dot${i}`}>{i}</div>)}
          </div>
          <div>
            <button className="btn primary" id="btnReenterFullscreen" type="button" style={{ ...sx('padding:12px 28px;font-size:14px;background:var(--ink);color:var(--white);'), background: modal ? modal.btnBg : 'var(--ink)' }} onClick={onModalButton}>
              {modal ? modal.btnText : '⛶ ล็อกเต็มหน้าจอและสอบต่อ'}
            </button>
          </div>
        </div>
      </div>

      <div id="companionWidget" className={'companion-widget' + (companionOn ? '' : ' hidden')}>
        <div id="companionBubble" className="companion-bubble">
          <span id="companionSpeech">{companion.speech}</span>
        </div>
        <div
          id="companionCard"
          className="companion-avatar-card"
          title="คลิกเพื่อทักทาย Byte"
          style={companion.bg ? { backgroundColor: companion.bg } : undefined}
          onClick={() => updateCompanionUI(randomOf(COMPANION.clickQuotes), 'bounce')}
        >
          <div key={companion.seq} id="companionSprite" className={'companion-sprite' + (companion.anim ? ' ' + companion.anim : '')}>{companion.sprite}</div>
          <div className="companion-meta">
            <div id="companionName" className="companion-name">{companion.name}</div>
            <div id="companionStreak" className="companion-streak">{companion.streak}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function exportWeaknessJson(session: Session | null, viewMode: ViewMode) {
  if (!session || !session.summary) return;
  const s = session.summary;
  const missedDetails: Record<string, unknown>[] = [];
  session.items.forEach((q, i) => {
    const ans = session.answers[i];
    if (ans === q.a) return;
    let yourAns = 'No Answer / Skipped';
    if (ans !== null && ans >= 0 && q.c[ans]) yourAns = LETTERS[ans] + '. ' + q.c[ans];
    missedDetails.push({
      questionIndex: i + 1,
      domainId: q.d,
      domainName: domainName(q.d, viewMode),
      question_en: q.q,
      question_th: q.qt || '',
      options_en: q.c,
      options_th: q.ct || [],
      userAnswer: yourAns,
      correctAnswer: LETTERS[q.a] + '. ' + q.c[q.a],
      explanation_en: q.e || '',
      explanation_th: q.et || '',
    });
  });
  const domainStats: Record<string, unknown> = {};
  DOMAINS.forEach(d => {
    const stat = s.by[d.id];
    if (stat && stat.t > 0) {
      const scorePct = Math.round(stat.c / stat.t * 100);
      domainStats['Domain_' + d.id] = {
        name: d.en, name_th: d.th, correct: stat.c, total: stat.t, scorePercent: scorePct,
        status: scorePct >= 70 ? 'PASS' : 'NEEDS_IMPROVEMENT',
      };
    }
  });
  const integrity = {
    strictModeActive: !!session.strictIntegrity,
    tabSwitchCount: session.tabSwitches || 0,
    integrityStrikes: session.integrityStrikes || 0,
    disqualified: !!session.disqualified,
    suspiciousFastAnswerCount: session.suspiciousFastAnswers || 0,
  };
  const candidateName = session.userName || 'Candidate';
  const exportDate = new Date().toISOString();
  const payload: Record<string, unknown> = {
    reportTitle: 'ISC2 CC Comprehensive Weakness & Exam Readiness Analysis',
    candidateName,
    exportDate,
    totalQuestions: s.total,
    correctCount: s.correct,
    overallScorePercent: s.pct,
    overallVerdict: s.passed ? 'PASS' : 'FAIL',
    domainBreakdown: domainStats,
    totalMissedQuestions: missedDetails.length,
    missedQuestionsList: missedDetails,
    examIntegrityMetrics: integrity,
  };
  const signatureData = `${candidateName}|${s.total}|${s.correct}|${s.pct}|${s.passed ? 'PASS' : 'FAIL'}|${integrity.integrityStrikes}|${integrity.disqualified}|${exportDate}`;
  const finishDownload = (sigHex: string | null) => {
    payload.cryptographicIntegrity = { algorithm: 'SHA-256', signatureData, signatureHash: sigHex || 'UNAVAILABLE' };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ISC2_CC_Weakness_Analysis_' + (session.userName || 'Candidate').replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
    window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(signatureData)).then(buf => {
      finishDownload(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
    }).catch(() => finishDownload(null));
  } else finishDownload(null);
}
