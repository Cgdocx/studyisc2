'use client';

import { useEffect, useRef, type Ref } from 'react';
import type { Lang, Question } from '@/components/quiz/types';
import { REVIEW_CAP } from './engine';

export type ReviveView =
  | {
      phase: 'ask' | 'answered';
      key: number;
      need: number;
      ok: number;
      tries: number;
      q: Question;
      perm: number[];
      picked: number | null;
      correct: boolean;
      gain: number;
      note: string;
      final: 'none' | 'full' | 'cap';
    }
  | { phase: 'done'; key: number; reason: 'full' | 'cap'; msg: string };

interface Props {
  view: ReviveView;
  lang: Lang;
  onPick: (j: number) => void;
  onNext: () => void;
  onContinue: () => void;
  ref?: Ref<HTMLDivElement>;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function QuestionText({ q, lang }: { q: Question; lang: Lang }) {
  if (lang === 'th' && q.question_th) return <div className="qb-rv-q">{q.question_th}</div>;
  if (lang === 'both' && q.question_th) {
    return <><div className="qb-rv-q">{q.question}</div><div className="qb-rv-q-th">{q.question_th}</div></>;
  }
  return <div className="qb-rv-q">{q.question}</div>;
}

function OptionText({ q, i, lang }: { q: Question; i: number; lang: Lang }) {
  const th = q.options_th && q.options_th[i];
  if (lang === 'th' && th) return <>{th}</>;
  if (lang === 'both' && th) return <>{q.options[i]}<span className="qb-rv-opt-th">{th}</span></>;
  return <>{q.options[i]}</>;
}

function Explanation({ q, lang }: { q: Question; lang: Lang }) {
  if (lang === 'th' && q.explanation_th) return <>{q.explanation_th}</>;
  if (lang === 'both' && q.explanation_th) return <>{q.explanation}<br />{q.explanation_th}</>;
  return <>{q.explanation || q.explanation_th || ''}</>;
}

function Meta({ ok, need, tries }: { ok: number; need: number; tries: number }) {
  return (
    <div className="qb-rv-meta">
      <span className="qb-pill ok">ฟื้นแล้ว {ok} / {need}</span>
      <span className="qb-pill">ทบทวน {tries} / {REVIEW_CAP} ครั้ง</span>
    </div>
  );
}

export default function RevivePanel({ view, lang, onPick, onNext, onContinue, ref }: Props) {
  const box = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = box.current;
    if (!root) return;
    const target = root.querySelector<HTMLElement>(
      view.phase === 'ask' ? '.qb-rv-opt' : view.phase === 'answered' ? '#qb-rv-next' : '#qb-rv-continue'
    );
    target?.focus({ preventScroll: true });
  }, [view.key, view.phase]);

  const setRefs = (el: HTMLDivElement | null) => {
    box.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = el;
  };

  if (view.phase === 'done') {
    return (
      <div className="qb-revive" id="qb-revive" ref={setRefs}>
        <div className="qb-rv-head">
          <span className="qb-rv-tag" style={{ background: 'var(--green)' }}>REVIVED</span>
          <h3>{view.msg}</h3>
        </div>
        <p className="qb-rv-sub">คะแนนของรอบนี้ยังนับจากคำตอบแรกเหมือนเดิม</p>
        <button type="button" className="qb-rv-btn go" id="qb-rv-continue" onClick={onContinue}>สู้ต่อ : ไปข้อถัดไป</button>
      </div>
    );
  }

  const { q, perm, picked, need, ok, tries } = view;
  const answered = view.phase === 'answered';
  const label = view.final === 'full' ? 'ฟื้นคืนชีพ' : view.final === 'cap' ? 'ฟื้นคืนชีพฉุกเฉิน' : 'ข้อทบทวนถัดไป';

  return (
    <div className="qb-revive" id="qb-revive" ref={setRefs}>
      <div className="qb-rv-head"><span className="qb-rv-tag">KO</span><h3>ทบทวนเพื่อฟื้นคืนชีพ</h3></div>
      <p className="qb-rv-sub">
        ตอบข้อที่เพิ่งผิดให้ถูก {need} ข้อ ตัวเลือกสลับตำแหน่งใหม่ ถูกแต่ละข้อได้ HP คืน ครบแล้วสู้ต่อ คะแนนจริงนับเฉพาะคำตอบแรกเท่านั้น
      </p>
      <Meta ok={ok} need={need} tries={tries} />
      <QuestionText q={q} lang={lang} />
      <div className="qb-rv-opts">
        {perm.map((orig, j) => {
          let cls = 'qb-rv-opt';
          if (answered && orig === q.correct_idx) cls += ' correct';
          if (answered && j === picked && !view.correct) cls += ' wrong';
          return (
            <button type="button" key={j} className={cls} data-j={j} disabled={answered} onClick={() => onPick(j)}>
              <span className="qb-rv-letter">{LETTERS[j]}</span>
              <span><OptionText q={q} i={orig} lang={lang} /></span>
            </button>
          );
        })}
      </div>
      <div id="qb-rv-fb">
        {answered && (
          <>
            <div className={'qb-rv-fb ' + (view.correct ? 'ok' : 'no')}>
              <strong>{view.correct ? `[OK] ถูกต้อง +${view.gain} HP` : `[X] ยังไม่ถูก : ${view.note}`}</strong>
              <Explanation q={q} lang={lang} />
            </div>
            <button type="button" className={'qb-rv-btn' + (view.final !== 'none' ? ' go' : '')} id="qb-rv-next" onClick={onNext}>{label}</button>
          </>
        )}
      </div>
    </div>
  );
}
