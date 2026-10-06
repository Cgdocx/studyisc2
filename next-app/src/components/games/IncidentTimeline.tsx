'use client';

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react';
import SiteLink from '@/components/SiteLink';
import data from '@/data/games/incident-timeline.json';
import { range, useIsClient } from './shared';

interface Scenario { title: string; desc: string; steps: string[]; stepsTH: string[]; explain: string }
interface Ghost { idx: number; className: string; width: number; x: number; y: number }

const SCENARIOS = data.scenarios as Scenario[];
const N = SCENARIOS.length;

function shuffleOrder(n: number): number[] {
  const arr = range(n);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.every((v, i) => v === arr[i]) && a.length > 1) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

function move(order: number[], src: number, target: number): number[] {
  const from = order.indexOf(src);
  const to = order.indexOf(target);
  const rest = order.filter(i => i !== src);
  const at = rest.indexOf(target) + (from < to ? 1 : 0);
  return [...rest.slice(0, at), src, ...rest.slice(at)];
}

function Hero() {
  return (
    <header className="hero">
      <div className="eyebrow">MINI GAME / DRAG &amp; DROP</div>
      <h1>Security Incident Timeline</h1>
      <div className="sub">เรียงลำดับขั้นตอนให้ถูกต้อง ลากการ์ดไปวางในตำแหน่งที่คุณคิดว่าถูก แล้วกดตรวจคำตอบ</div>
    </header>
  );
}

function Progress({ done, hidden }: { done: number; hidden?: boolean }) {
  return (
    <div className="progress-bar-wrap" style={hidden ? { display: 'none' } : undefined}>
      <div className="progress-bar-fill" id="progressFill" style={{ width: Math.round(done / N * 100) + '%' }}></div>
      <div className="progress-bar-text" id="progressText">{`${done} / ${N}`}</div>
    </div>
  );
}

function Final({ scores, show, onRestart }: { scores: number[]; show: boolean; onRestart: () => void }) {
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const perfect = scores.filter(s => s === 100).length;
  return (
    <div className={'final-screen' + (show ? ' show' : '')} id="finalScreen">
      <h2>สรุปผลคะแนน</h2>
      <div className="final-score" id="finalScore">{show ? avg + '%' : ''}</div>
      <div className="final-detail" id="finalDetail">
        {show && <>{`ผ่านทั้ง ${N} สถานการณ์`}<br />{`ถูกตั้งแต่ครั้งแรก: ${perfect} / ${N}`}<br />{`คะแนนเฉลี่ย: ${avg}%`}</>}
      </div>
      <div className="btn-row" style={{ justifyContent: 'center' }}>
        <button className="btn green" onClick={onRestart}>เล่นใหม่</button>
        <SiteLink file="games.html" className="btn">กลับหน้าเกม</SiteLink>
      </div>
    </div>
  );
}

function Game() {
  const [current, setCurrent] = useState(0);
  const [order, setOrder] = useState(() => shuffleOrder(SCENARIOS[0].steps.length));
  const [marks, setMarks] = useState<Record<number, 'correct' | 'wrong'>>({});
  const [validated, setValidated] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [final, setFinal] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [deal, setDeal] = useState(0);
  const dragSrc = useRef<number | null>(null);
  const touchSrc = useRef<number | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const s = SCENARIOS[current];

  function renderScenario(idx: number) {
    setCurrent(idx);
    setOrder(shuffleOrder(SCENARIOS[idx].steps.length));
    setMarks({});
    setValidated(false);
    setAttempts(0);
    setDeal(d => d + 1);
  }

  function checkOrder() {
    if (validated) return;
    const tries = attempts + 1;
    setAttempts(tries);
    const next: Record<number, 'correct' | 'wrong'> = {};
    order.forEach((idx, i) => { next[idx] = idx === i ? 'correct' : 'wrong'; });
    setMarks(next);
    if (order.every((idx, i) => idx === i)) {
      setValidated(true);
      setScores([...scores, Math.max(100 - (tries - 1) * 20, 20)]);
    }
  }

  function nextScenario() {
    if (current + 1 >= N) { setFinal(true); return; }
    renderScenario(current + 1);
  }

  function restart() {
    setScores([]);
    setFinal(false);
    renderScenario(0);
  }

  function drop(src: number | null, target: number) {
    if (src === null || src === target) return;
    setOrder(o => move(o, src, target));
  }

  const itemClass = (idx: number) => 'step-item' + (marks[idx] ? ' ' + marks[idx] : '') + (dragging === idx ? ' dragging' : '') + (over === idx ? ' over' : '');

  const itemAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y);
    const item = el ? el.closest<HTMLElement>('.step-item') : null;
    return item && item.dataset.idx !== undefined && list.current?.contains(item) ? Number(item.dataset.idx) : null;
  };

  const onTouchStart = useEffectEvent((e: TouchEvent) => {
    if (validated) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>('.step-item');
    if (!el) return;
    e.preventDefault();
    const idx = Number(el.dataset.idx);
    const rect = el.getBoundingClientRect();
    const t = e.touches[0];
    touchSrc.current = idx;
    setGhost({ idx, className: el.className, width: rect.width, x: t.clientX - rect.width / 2, y: t.clientY - 20 });
    setDragging(idx);
  });

  const onTouchMove = useEffectEvent((e: TouchEvent) => {
    if (touchSrc.current === null || !ghost) return;
    e.preventDefault();
    const t = e.touches[0];
    setGhost({ ...ghost, x: t.clientX - ghost.width / 2, y: t.clientY - 20 });
    const target = itemAt(t.clientX, t.clientY);
    setOver(target !== null && target !== touchSrc.current ? target : null);
  });

  const onTouchEnd = useEffectEvent((e: TouchEvent) => {
    const src = touchSrc.current;
    if (src === null) return;
    setGhost(null);
    setDragging(null);
    setOver(null);
    const t = e.changedTouches[0];
    const target = itemAt(t.clientX, t.clientY);
    if (target !== null) drop(src, target);
    touchSrc.current = null;
  });

  useEffect(() => {
    const ul = area.current;
    if (!ul) return;
    const start = (e: TouchEvent) => onTouchStart(e);
    const moveH = (e: TouchEvent) => onTouchMove(e);
    const end = (e: TouchEvent) => onTouchEnd(e);
    ul.addEventListener('touchstart', start, { passive: false });
    ul.addEventListener('touchmove', moveH, { passive: false });
    ul.addEventListener('touchend', end);
    return () => {
      ul.removeEventListener('touchstart', start);
      ul.removeEventListener('touchmove', moveH);
      ul.removeEventListener('touchend', end);
    };
  }, []);

  const done = current + (validated ? 1 : 0);
  return (
    <div className="wrap">
      <Hero />
      <Progress done={done} hidden={final} />
      <div id="gameArea" ref={area} style={final ? { display: 'none' } : undefined}>
        <div className="scenario-card" key={deal}>
          <div className="score-badge">{`สถานการณ์ ${current + 1} / ${N}`}</div>
          <h2 className="scenario-title">{s.title}</h2>
          <p className="scenario-desc">{s.desc}</p>
          <ul className="step-list" id="stepList" ref={list}>
            {order.map((idx, pos) => (
              <li
                key={idx}
                className={itemClass(idx)}
                draggable="true"
                data-idx={idx}
                onDragStart={e => {
                  if (validated) return;
                  dragSrc.current = idx;
                  setDragging(idx);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', '');
                }}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDragEnter={() => { if (idx !== dragSrc.current) setOver(idx); }}
                onDragLeave={() => setOver(o => (o === idx ? null : o))}
                onDrop={e => { e.preventDefault(); setOver(null); drop(dragSrc.current, idx); }}
                onDragEnd={() => { setDragging(null); setOver(null); }}
              >
                <span className="step-num">{pos + 1}</span>
                <span>{`${s.steps[idx]} - ${s.stepsTH[idx]}`}</span>
              </li>
            ))}
          </ul>
          <div className="btn-row">
            <button className={'btn' + (validated ? ' green' : '')} id="checkBtn" onClick={validated ? nextScenario : checkOrder}>
              {validated ? (current < N - 1 ? 'ถัดไป' : 'ดูสรุปผล') : 'ตรวจคำตอบ'}
            </button>
            <button className="btn" id="resetBtn" onClick={() => { if (!validated) renderScenario(current); }}>สับใหม่</button>
          </div>
          <div className={'explanation-box' + (validated ? ' show' : '')} id="explainBox">
            <h3>ลำดับที่ถูกต้อง</h3>
            <ol id="correctList">
              {validated && s.steps.map((step, i) => <li key={i}><strong>{step}</strong>{` - ${s.stepsTH[i]}`}</li>)}
            </ol>
            <p style={{ marginTop: 10 }}>{s.explain}</p>
          </div>
        </div>
      </div>
      <Final scores={scores} show={final} onRestart={restart} />
      {ghost && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          <li
            className={ghost.className}
            style={{ position: 'fixed', width: ghost.width, zIndex: 99999, opacity: 0.85, pointerEvents: 'none', background: 'var(--yellow)', left: ghost.x, top: ghost.y } as CSSProperties}
          >
            <span className="step-num">{order.indexOf(ghost.idx) + 1}</span>
            <span>{`${s.steps[ghost.idx]} - ${s.stepsTH[ghost.idx]}`}</span>
          </li>
        </ul>
      )}
    </div>
  );
}

export default function IncidentTimeline() {
  const client = useIsClient();
  return (
    <div className="pg-incident-timeline pg-game">
      {client ? <Game /> : (
        <div className="wrap">
          <Hero />
          <Progress done={0} />
          <div id="gameArea"></div>
          <Final scores={[]} show={false} onRestart={() => {}} />
        </div>
      )}
    </div>
  );
}
