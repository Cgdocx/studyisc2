'use client';

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react';
import GlobalNav from '@/components/GlobalNav';
import { BASE_PATH } from '@/lib/site';
import data from '@/data/content/mindmap.json';

interface Point { t: string; d: string }
interface Topic { h: string; points: Point[] }
interface Focus { badge: string; title: string; body: string }
interface Chapter {
  domainCode: string;
  domainName: string;
  domainWeight: string;
  en: string;
  th: string;
  color: string;
  tagline: string;
  topics: Topic[];
  examFocus: Focus[];
  cheat: string[];
}

const CHAPTERS = data.chapters as Chapter[];
const ICONS = data.icons as string[];
const html = (s: string) => ({ __html: s });
const pad = (i: number) => String(i + 1).padStart(2, '0');

function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={dir === 'prev' ? { verticalAlign: 'middle', marginRight: 6 } : { verticalAlign: 'middle', marginLeft: 6 }}>
      <path d={dir === 'prev' ? 'm15 18-6-6 6-6' : 'm9 18 6-6 6-6'} />
    </svg>
  );
}

export default function MindMap() {
  const [current, setCurrent] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const c = CHAPTERS[current];
  const last = CHAPTERS.length - 1;

  useEffect(() => {
    const active = spineRef.current?.children[current];
    if (active && window.innerWidth <= 768) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [current]);

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' && current < last) setCurrent(current + 1);
    if (e.key === 'ArrowLeft' && current > 0) setCurrent(current - 1);
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey(e);
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register(`${BASE_PATH}/sw.js`).catch(() => {});
  }, []);

  const accent = { '--accent-c': c.color } as CSSProperties;
  return (
    <div className="pg-mindmap" style={accent}>
      <nav className="spine" id="spine">
        <div className="spine-head">
          <div className="eyebrow">ISC2 · Certified in Cybersecurity</div>
          <h1>Chapter Index</h1>
          <div className="sub">สารบัญ 12 บท สรุป Mind Map (5 Domains)</div>
        </div>
        <div className="spine-list" id="spineList" ref={spineRef}>
          {CHAPTERS.map((ch, i) => (
            <button key={i} className={'spine-item' + (i === current ? ' active' : '')} data-index={i} onClick={() => setCurrent(i)}>
              <span className="num">{pad(i)}</span>
              <span className="label">
                {ch.en}
                <span className="th">{ch.th}</span>
              </span>
              <span className="domain-tag">{ch.domainCode}</span>
            </button>
          ))}
        </div>
        <div className="spine-foot">
          <span>12 CHAPTERS · TH/EN</span>
          <span>CREATIVE MODE</span>
        </div>
      </nav>

      <main id="main" ref={mainRef}>
        <GlobalNav inPage />
        <noscript dangerouslySetInnerHTML={html(data.noscriptHtml)} />
        <div className="page" id="page" style={accent}>
          <div className="hero-meta-bar">
            <div className="domain-meta-tag">
              <span className="tag-badge">{c.domainCode}</span>
              <span dangerouslySetInnerHTML={html(c.domainName)} />
              <span className="tag-weight">สัดส่วนข้อสอบ: {c.domainWeight}</span>
            </div>
          </div>

          <div className="hero">
            <div className="hero-num-badge">{pad(current)}</div>
            <div className="hero-titles">
              <h2><span className="hero-icon" dangerouslySetInnerHTML={html(ICONS[current])} /> {c.en}</h2>
              <div className="th-title">บทที่ {current + 1}: {c.th}</div>
            </div>
          </div>
          <div className="hero-tagline" dangerouslySetInnerHTML={html(c.tagline)} />

          <div className="section-label">Mind Map - <span className="th-label">เนื้อหาแต่ละหัวข้อ</span></div>
          <div className="topic-grid">
            {c.topics.map((t, k) => (
              <div className="topic-card" key={k}>
                <h3 dangerouslySetInnerHTML={html('<span class="ic-glyph"></span>' + t.h)} />
                <div className="plist">
                  {t.points.map((p, j) => (
                    <div className="prow" key={j}>
                      <span className="term" dangerouslySetInnerHTML={html(p.t)} /><span className="psep">:</span>{' '}
                      <span className="desc" dangerouslySetInnerHTML={html(p.d)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="section-label">Exam Focus - <span className="th-label">ประเด็นสำคัญสำหรับข้อสอบ</span></div>
          <div className="exam-focus">
            {c.examFocus.map((e, k) => (
              <div className="ef-item" key={k}>
                <div className="ef-head"><span className="ef-badge">{e.badge}</span><span className="ef-title">{e.title}</span></div>
                <div className="ef-body" dangerouslySetInnerHTML={html(e.body)} />
              </div>
            ))}
          </div>

          <div className="section-label">Cheat Sheet - <span className="th-label">สรุปสาระสำคัญแบบเร็ว</span></div>
          <div className="cheat-box"><ul>{c.cheat.map((x, k) => <li key={k} dangerouslySetInnerHTML={html(x)} />)}</ul></div>

          <div className="footnav">
            <button className="prev" disabled={current === 0} onClick={() => { if (current > 0) setCurrent(current - 1); }}><Arrow dir="prev" />ก่อนหน้า</button>
            <button className="next" disabled={current === last} onClick={() => { if (current < last) setCurrent(current + 1); }}>ถัดไป<Arrow dir="next" /></button>
          </div>
        </div>
      </main>
    </div>
  );
}
