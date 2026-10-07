'use client';

import { useRef, useState, type ReactNode } from 'react';
import SiteLink from '@/components/SiteLink';
import data from '@/data/games/fill-gap.json';
import { shuffled, useIsClient, useLater } from './shared';

interface Question { domain: string; sentence: string; answer: string; choices: string[]; explain: string }
interface Result { answer: string; chosen: string; correct: boolean; domain: string }
interface Deal { questions: Question[]; choices: string[] }

const QUESTIONS = data.questions as Question[];
const BLANK = '_______';

function deal(): Deal {
  const questions = shuffled(QUESTIONS);
  return { questions, choices: shuffled(questions[0].choices) };
}

function Hero() {
  return (
    <header className="hero">
      <div className="eyebrow">MINI GAME / FILL THE GAP</div>
      <h1>เติมคำในช่องว่าง</h1>
      <div className="sub">เลือกคำศัพท์ที่ถูกต้องเพื่อเติมในช่องว่าง ฝึกจำแนวคิดสำคัญของ ISC2 CC ทั้ง 5 Domains</div>
    </header>
  );
}

function Shell({ done, total, correct, wrong, hidden, children }: { done: number; total: string; correct: number; wrong: number; hidden: boolean; children?: ReactNode }) {
  const hide = hidden ? { display: 'none' } : undefined;
  const width = Math.round(done / Number(total) * 100);
  return (
    <>
      <div className="progress-bar-wrap" style={hide}>
        <div className="progress-bar-fill" id="progressFill" style={{ width: width + '%' }}></div>
        <div className="progress-bar-text" id="progressText">{`${done} / ${total}`}</div>
      </div>
      <div className="score-row" style={hide}>
        <span className="score-badge correct-badge" id="correctCount">{`ถูก: ${correct}`}</span>
        <span className="score-badge wrong-badge" id="wrongCount">{`ผิด: ${wrong}`}</span>
      </div>
      {children}
    </>
  );
}

function FinalScreen({ results, show, onRestart }: { results: Result[]; show: boolean; onRestart: () => void }) {
  const total = results.length;
  const correct = results.filter(r => r.correct).length;
  return (
    <div className={'final-screen' + (show ? ' show' : '')} id="finalScreen">
      <h2>สรุปผลคะแนน</h2>
      <div className="final-score" id="finalScore">{show ? Math.round(correct / total * 100) + '%' : ''}</div>
      <div className="final-detail" id="finalDetail">{show ? `ถูก ${correct} จาก ${total} ข้อ (ผิด ${total - correct} ข้อ)` : ''}</div>
      <div id="summaryWrap">
        {show && (
          <table className="summary-table">
            <thead><tr><th>#</th><th>Domain</th><th>คำตอบที่ถูก</th><th>คำตอบของคุณ</th></tr></thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={r.correct ? 'row-correct' : 'row-wrong'}>
                  <td>{i + 1}</td><td style={{ fontSize: 11 }}>{r.domain}</td><td>{r.answer}</td><td>{r.chosen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn green" onClick={onRestart}>เล่นใหม่</button>
        <SiteLink file="games.html" className="btn">กลับหน้าเกม</SiteLink>
      </div>
    </div>
  );
}

function Game() {
  const [{ questions, choices }, setDeal] = useState(deal);
  const [current, setCurrent] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [final, setFinal] = useState(false);
  const [round, setRound] = useState(0);
  const later = useLater();
  const step = useRef(0);

  const q = questions[current];
  const answered = chosen !== null;
  const correct = results.filter(r => r.correct).length;

  function select(c: string) {
    if (answered) return;
    setChosen(c);
    setRevealed(c === q.answer);
    setResults([...results, { answer: q.answer, chosen: c, correct: c === q.answer, domain: q.domain }]);
    if (c !== q.answer) {
      const s = step.current;
      later(() => { if (step.current === s) setRevealed(true); }, 800);
    }
  }

  function next() {
    step.current++;
    if (current + 1 >= questions.length) { setFinal(true); return; }
    setCurrent(current + 1);
    setDeal({ questions, choices: shuffled(questions[current + 1].choices) });
    setChosen(null);
    setRevealed(false);
  }

  function restart() {
    step.current++;
    setDeal(deal());
    setCurrent(0);
    setChosen(null);
    setRevealed(false);
    setResults([]);
    setFinal(false);
    setRound(r => r + 1);
  }

  const cut = q.sentence.indexOf(BLANK);
  const blankClass = 'q-blank' + (answered ? (revealed ? ' filled-correct' : ' filled-wrong') : '');
  const btnClass = (c: string) => 'choice-btn'
    + (answered && c === q.answer ? (chosen === q.answer ? ' selected-correct' : ' reveal-correct') : '')
    + (answered && c === chosen && chosen !== q.answer ? ' selected-wrong' : '');

  return (
    <div className="wrap">
      <Hero />
      <Shell done={current + (answered ? 1 : 0)} total={String(questions.length)} correct={correct} wrong={results.length - correct} hidden={final}>
        <div id="gameArea" style={final ? { display: 'none' } : undefined}>
          <div className="question-card" key={`${round}:${current}`}>
            <div className="q-domain">{q.domain}</div>
            <p className="q-sentence">
              {cut < 0 ? q.sentence : <>{q.sentence.slice(0, cut)}<span className={blankClass} id="blankSpan">{answered ? (revealed ? q.answer : chosen) : '?'}</span>{q.sentence.slice(cut + BLANK.length)}</>}
            </p>
            <div className="choices" id="choicesDiv">
              {choices.map(c => (
                <button key={c} className={btnClass(c)} data-choice={c} disabled={answered} onClick={() => select(c)}>{c}</button>
              ))}
            </div>
            <div className={'explain-text' + (answered ? ' show' : '')} id="explainText">{q.explain}</div>
            <div className={'next-btn-wrap' + (answered ? ' show' : '')} id="nextBtnWrap">
              <button className="btn green" onClick={next}>{current < questions.length - 1 ? 'ข้อถัดไป' : 'ดูสรุปผล'}</button>
            </div>
          </div>
        </div>
      </Shell>
      <FinalScreen results={results} show={final} onRestart={restart} />
    </div>
  );
}

export default function FillGap() {
  const client = useIsClient();
  return (
    <div className="pg-fill-gap pg-game">
      {client ? <Game /> : (
        <div className="wrap">
          <Hero />
          <Shell done={0} total={String(QUESTIONS.length)} correct={0} wrong={0} hidden={false}>
            <div id="gameArea"></div>
          </Shell>
          <FinalScreen results={[]} show={false} onRestart={() => {}} />
        </div>
      )}
    </div>
  );
}
