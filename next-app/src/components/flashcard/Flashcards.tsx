'use client';

import { Suspense, useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseFlags, useStoredFlags } from '@/lib/storage';
import data from '@/data/content/flashcards.json';

export const FC_KEY = 'fc_mastered';

interface Card { d: number; term: string; hint: string; th: string; en: string }
interface Domain { id: number; name: string; th: string; color: string }
type Flags = Record<string, boolean>;

const DOMAINS = data.domains as Domain[];
const ALL_CARDS = data.cards as Card[];
const cardKey = (c: Card) => c.d + ':' + c.term;
const poolFor = (filter: number) => (filter === 0 ? ALL_CARDS : ALL_CARDS.filter(c => c.d === filter));

interface Deck {
  filter: number;
  deck: Card[];
  idx: number;
  unknownOnly: boolean;
  flipped: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function build(s: Omit<Deck, 'deck' | 'idx' | 'flipped'>, mastered: Flags): Deck {
  let pool = poolFor(s.filter);
  if (s.unknownOnly) pool = pool.filter(c => !mastered[cardKey(c)]);
  return { ...s, deck: pool.slice(), idx: 0, flipped: false };
}

function advance(s: Deck, mastered: Flags): Deck {
  if (s.unknownOnly) {
    const deck = s.deck.filter(c => !mastered[cardKey(c)]);
    return { ...s, deck, idx: deck.length ? s.idx % deck.length : s.idx, flipped: false };
  }
  return { ...s, idx: (s.idx + 1) % s.deck.length, flipped: false };
}

function initialDeck(search: string): Deck {
  const startDomain = parseInt(new URLSearchParams(search).get('d') ?? '', 10);
  const filter = DOMAINS.some(dom => dom.id === startDomain) ? startDomain : 0;
  const s = build({ filter, unknownOnly: false }, {});
  shuffle(s.deck);
  return s;
}

interface ViewProps {
  ready: boolean;
  s: Deck;
  mastered: Flags;
  on?: {
    filter: (d: number) => void;
    shuffle: () => void;
    reset: () => void;
    toggleUnknown: () => void;
    flip: () => void;
    know: () => void;
    dunno: () => void;
    showAll: () => void;
  };
}

const PLACEHOLDER: Deck = { filter: 0, deck: [], idx: 0, unknownOnly: false, flipped: false };

function FlashcardView({ ready, s, mastered, on }: ViewProps) {
  const touch = useRef({ x: 0, y: 0 });
  const empty = ready && s.deck.length === 0;
  const card = ready && s.deck.length ? s.deck[s.idx] : null;
  const dom = card ? DOMAINS.find(d => d.id === card.d) : undefined;
  const pool = poolFor(s.filter);
  const known = pool.filter(c => mastered[cardKey(c)]).length;
  const pct = pool.length === 0 ? 0 : Math.round(known / pool.length * 100);
  const shown = (visible: boolean, display: string): CSSProperties | undefined => (ready ? { display: visible ? display : 'none' } : undefined);

  return (
    <div className="wrap">
      <h1>Flashcard ISC2 CC</h1>
      <p className="subtitle">บัตรคำศัพท์เตรียมสอบ 100 ใบ ครบ 5 โดเมน : Space=พลิก, Arrow Left=ยังไม่รู้, Arrow Right=รู้แล้ว</p>

      <div className="progress-bar-wrap">
        <div className="progress-label"><span id="progText">รู้แล้ว: {ready ? known : 0} / {ready ? pool.length : 0}</span><span id="progPct">{ready ? pct : 0}%</span></div>
        <div className="progress-track"><div className="progress-fill" id="progFill" style={{ width: (ready ? pct : 0) + '%' }} /></div>
      </div>

      <div className="domain-filters" id="domainFilters">
        {ready && [0, ...DOMAINS.map(d => d.id)].map(d => (
          <button key={d} className={'domain-btn' + (s.filter === d ? ' active' : '')} data-d={d} onClick={() => on?.filter(d)}>{d === 0 ? 'ALL' : 'D' + d}</button>
        ))}
      </div>
      <div className="controls-row">
        <button className="ctrl-btn" id="shuffleBtn" onClick={on?.shuffle}>SHUFFLE</button>
        <button className="ctrl-btn" id="resetBtn" onClick={on?.reset}>RESET ALL</button>
        <button className="ctrl-btn" id="unknownOnlyBtn" onClick={on?.toggleUnknown}>{s.unknownOnly ? 'ดูทั้งหมด' : 'ดูเฉพาะ "ยังไม่รู้"'}</button>
      </div>

      <div className="card-counter" id="cardCounter" style={shown(!empty, 'block')}>{card ? `${s.idx + 1} / ${s.deck.length}` : '1 / 100'}</div>

      <div
        className="card-scene"
        id="cardScene"
        style={shown(!empty, 'block')}
        onClick={on?.flip}
        onTouchStart={e => { touch.current = { x: e.changedTouches[0].screenX, y: e.changedTouches[0].screenY }; }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].screenX - touch.current.x;
          const dy = e.changedTouches[0].screenY - touch.current.y;
          if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
          if (dx > 0) on?.know(); else on?.dunno();
        }}
      >
        <div className={'card3d' + (s.flipped ? ' flipped' : '')} id="card3d">
          <div className="card-face card-front">
            <div className="term" id="termEl">{card ? card.term : 'Loading...'}</div>
            <div className="hint" id="hintEl">{card ? card.hint : ''}</div>
            <div className="flip-hint">คลิกหรือกด Space เพื่อพลิก</div>
          </div>
          <div className="card-face card-back">
            <div className="domain-tag" id="domainTag" style={dom ? { background: dom.color } : undefined}>{card && dom ? `Domain ${card.d}: ${dom.name}` : 'DOMAIN 1'}</div>
            <div className="def-th" id="defTh">{card ? card.th : ''}</div>
            <div className="def-en" id="defEn">{card ? card.en : ''}</div>
          </div>
        </div>
      </div>

      <div className="action-row" style={shown(!empty, 'flex')}>
        <button className="act-btn dunno" id="dunnoBtn" onClick={on?.dunno}>ยังไม่รู้</button>
        <button className="act-btn know" id="knowBtn" onClick={on?.know}>รู้แล้ว</button>
      </div>

      <div className="shortcuts">
        <kbd>Space</kbd> พลิก &nbsp; <kbd>&larr;</kbd> ยังไม่รู้ &nbsp; <kbd>&rarr;</kbd> รู้แล้ว
      </div>

      <div className="domain-progress" id="domainProgress">
        {ready && DOMAINS.map(d => {
          const dc = ALL_CARDS.filter(c => c.d === d.id);
          const dk = dc.filter(c => mastered[cardKey(c)]).length;
          const dp = dc.length === 0 ? 0 : Math.round(dk / dc.length * 100);
          return (
            <div className="dp-item" key={d.id}>
              <div className="dp-label" style={{ color: d.color }}>D{d.id}: {d.name}</div>
              <div className="dp-bar"><div className="dp-fill" style={{ width: dp + '%', background: d.color }} /></div>
              <div className="dp-count">{dk}/{dc.length} ({dp}%)</div>
            </div>
          );
        })}
      </div>

      <div className="empty-state" id="emptyState" style={{ display: empty ? 'block' : 'none' }}>
        <div className="big">{'\u2713'}</div>
        <div>ผ่านหมดทุกใบในชุดนี้แล้ว!</div>
        <button className="ctrl-btn" style={{ marginTop: 16 }} onClick={on?.showAll}>กลับดูทั้งหมด</button>
      </div>
    </div>
  );
}

function FlashcardApp({ search }: { search: string }) {
  const [stored, save] = useStoredFlags(FC_KEY);
  const mastered = stored ?? parseFlags(null);
  const [s, setS] = useState<Deck>(() => initialDeck(search));

  const mark = (known: boolean) => {
    if (s.deck.length === 0) return;
    const next = { ...mastered };
    if (known) next[cardKey(s.deck[s.idx])] = true;
    else delete next[cardKey(s.deck[s.idx])];
    save(next);
    setS(advance(s, next));
  };
  const on: NonNullable<ViewProps['on']> = {
    filter: d => setS(build({ filter: d, unknownOnly: s.unknownOnly }, mastered)),
    shuffle: () => setS({ ...s, deck: shuffle(s.deck.slice()), idx: 0, flipped: false }),
    reset: () => {
      if (confirm('ต้องการรีเซ็ตทั้งหมดจริงหรือ? ความก้าวหน้าจะหายไป')) {
        save({});
        setS(build({ filter: s.filter, unknownOnly: false }, {}));
      }
    },
    toggleUnknown: () => setS(build({ filter: s.filter, unknownOnly: !s.unknownOnly }, mastered)),
    flip: () => setS({ ...s, flipped: !s.flipped }),
    know: () => mark(true),
    dunno: () => mark(false),
    showAll: () => setS(build({ filter: s.filter, unknownOnly: false }, mastered)),
  };

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.code === 'Space') { e.preventDefault(); on.flip(); }
    if (e.code === 'ArrowRight') { e.preventDefault(); on.know(); }
    if (e.code === 'ArrowLeft') { e.preventDefault(); on.dunno(); }
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey(e);
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  return <FlashcardView ready s={s} mastered={mastered} on={on} />;
}

function FlashcardsClient() {
  const search = useSearchParams().toString();
  return <FlashcardApp key={search} search={search ? '?' + search : ''} />;
}

export default function Flashcards() {
  return (
    <div className="pg-flashcard">
      <Suspense fallback={<FlashcardView ready={false} s={PLACEHOLDER} mastered={{}} />}>
        <FlashcardsClient />
      </Suspense>
    </div>
  );
}
