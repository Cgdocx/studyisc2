import { useMemo } from 'react';
import LangToggle from './LangToggle';
import { DOMAIN_NAMES, DOMAIN_NAMES_TH, LETTERS } from './strings';
import { isComplete, isPassed } from './tracker';
import type { Lang, QuizState } from './types';

interface Props {
  state: QuizState;
  onLang: (l: Lang) => void;
  onNewQuiz: () => void;
  onRetry: () => void;
}

const NO_ANSWER = '(No answer - time expired)';

export default function ResultsScreen({ state: s, onLang, onNewQuiz, onRetry }: Props) {
  const total = s.questions.length;
  const pct = total > 0 ? Math.round((s.score / total) * 100) : 0;
  const complete = isComplete(s);
  const passed = isPassed(s, pct);
  const unanswered = total - s.answers.length;
  const circ = 2 * Math.PI * 78;
  const off = circ - (pct / 100) * circ;
  const col = passed ? 'var(--green)' : 'var(--red)';
  let grade = 'Keep studying';
  if (!complete) grade = 'Incomplete - marked FAIL';
  else if (pct >= 90) grade = 'Outstanding!';
  else if (pct >= 80) grade = 'Great job!';
  else if (pct >= 70) grade = 'You passed!';
  else if (pct >= 60) grade = 'Almost there';
  const wrongAnswers = s.answers.filter(a => !a.isCorrect);
  const printedAt = useMemo(() => new Date().toLocaleString(), []);

  const print = () => requestAnimationFrame(() => setTimeout(() => window.print(), 50));

  return (
    <>
      <LangToggle lang={s.lang} disableTh={false} onChange={onLang} />
      <div className="results">
        {s.finishedManually && <div className="finish-banner">[OK] Your result has been sent.</div>}
        {!complete && (
          <div className="incomplete-banner">
            [!] You answered {s.answers.length} of {total} questions. Incomplete attempts are automatically marked <strong>FAIL</strong>, regardless of score.
          </div>
        )}
        <div className="results-circle">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="78" stroke="var(--line)" strokeWidth="8" fill="none" />
            <circle
              cx="90" cy="90" r="78" stroke={col} strokeWidth="8" fill="none"
              strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="pct-text">
            <span className="pct-number" style={{ color: col }}>{pct}%</span>{' '}
            <span className="pct-label">{passed ? 'PASS' : 'FAIL'}</span>
          </div>
        </div>
        <h2>{grade}</h2>
        <p className="subtitle">You answered {s.score} out of {total} correctly{unanswered > 0 ? ` (${unanswered} unanswered)` : ''}</p>
        <div className="stat-grid">
          <div className="stat-card green"><div className="val">{s.score}</div><div className="lbl">Correct</div></div>
          <div className="stat-card red"><div className="val">{s.wrong}</div><div className="lbl">Incorrect</div></div>
          <div className="stat-card gold"><div className="val">{pct}%</div><div className="lbl">Score</div></div>
        </div>
        <div className="results-actions">
          <button type="button" className="btn btn-secondary" onClick={onNewQuiz}>New Quiz</button>{' '}
          <button type="button" className="btn btn-primary" onClick={onRetry}>Retry Same Selection</button>{' '}
          <button type="button" className="btn btn-secondary" onClick={print}>Print Results</button>
        </div>
        {wrongAnswers.length > 0 && (
          <div className="review-section">
            <h3>Review Incorrect Answers ({wrongAnswers.length})</h3>
            {wrongAnswers.map(a => {
              const q = s.questions[a.qIndex];
              const hasTh = !!q.question_th;
              const isBoth = s.lang === 'both' && hasTh;
              const useTh = s.lang === 'th' && hasTh;
              const yourAns = a.selected === -1 ? NO_ANSWER : `${LETTERS[a.selected]}. ${q.options[a.selected]}`;
              if (isBoth) {
                return (
                  <div className="review-item" key={a.qIndex}>
                    <div className="review-domain">Domain {q.dom} · {DOMAIN_NAMES[q.dom]} / {DOMAIN_NAMES_TH[q.dom]}</div>
                    <div className="review-q"><span className="lang-chip">EN</span>Q{q.id}: {q.question}</div>
                    <div className="review-q"><span className="lang-chip th">TH</span>{q.question_th}</div>
                    <div className="review-meta">
                      <span className="review-your">Your answer: {yourAns} {a.selected === -1 ? '' : `/ ${q.options_th[a.selected]}`}</span>{' '}
                      <span className="review-correct-label">Correct: {LETTERS[a.correct]}. {q.options[a.correct]} / {q.options_th[a.correct]}</span>
                    </div>
                  </div>
                );
              }
              const opts = useTh ? q.options_th : q.options;
              return (
                <div className="review-item" key={a.qIndex}>
                  <div className="review-domain">Domain {q.dom} · {useTh ? DOMAIN_NAMES_TH[q.dom] : DOMAIN_NAMES[q.dom]}</div>
                  <div className="review-q">Q{q.id}: {useTh ? q.question_th : q.question}</div>
                  <div className="review-meta">
                    <span className="review-your">Your answer: {a.selected === -1 ? NO_ANSWER : `${LETTERS[a.selected]}. ${opts[a.selected]}`}</span>{' '}
                    <span className="review-correct-label">Correct: {LETTERS[a.correct]}. {opts[a.correct]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="print-section">
        <h1>ISC2 CC - Exam Result</h1>
        <p>Name: {s.userName || 'Anonymous'} &nbsp;|&nbsp; Date: {printedAt}</p>
        <p>
          Mode: {s.studyMode === 'exam' ? 'Exam' : 'Practice'} &nbsp;|&nbsp; Score: {s.score}/{total} ({pct}%) &nbsp;|&nbsp; Result: {passed ? 'PASS' : 'FAIL'}{!complete ? ' (incomplete)' : ''}
        </p>
        <h2>Incorrect Answers ({wrongAnswers.length})</h2>
        {wrongAnswers.length === 0 && <p>No incorrect answers.</p>}
        {wrongAnswers.map(a => {
          const q = s.questions[a.qIndex];
          const yourAns = a.selected === -1 ? NO_ANSWER : `${LETTERS[a.selected]}. ${q.options[a.selected]}`;
          const yourAnsTh = a.selected === -1 ? '(ไม่ได้ตอบ - หมดเวลา)' : q.options_th ? `${LETTERS[a.selected]}. ${q.options_th[a.selected]}` : '';
          const correctTh = q.options_th ? `${LETTERS[a.correct]}. ${q.options_th[a.correct]}` : '';
          return (
            <div className="print-item" key={a.qIndex}>
              <div className="print-q">Q{q.id} (Domain {q.dom} · {DOMAIN_NAMES[q.dom]} / {DOMAIN_NAMES_TH[q.dom]}): {q.question}</div>
              {q.question_th && <div className="print-q-th">{q.question_th}</div>}
              <div className="print-meta"><strong>Your answer (EN):</strong> {yourAns}</div>
              {yourAnsTh && <div className="print-meta"><strong>คำตอบของคุณ (TH):</strong> {yourAnsTh}</div>}
              <div className="print-meta"><strong>Correct answer (EN):</strong> {LETTERS[a.correct]}. {q.options[a.correct]}</div>
              {correctTh && <div className="print-meta"><strong>คำตอบที่ถูกต้อง (TH):</strong> {correctTh}</div>}
              {q.explanation && <div className="print-exp"><strong>Why (EN):</strong> {q.explanation}</div>}
              {q.explanation_th && <div className="print-exp"><strong>เหตุผล (TH):</strong> {q.explanation_th}</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}
