import LangToggle from './LangToggle';
import TopicBadge from './TopicBadge';
import { DOMAIN_NAMES, DOMAIN_NAMES_TH, LETTERS } from './strings';
import type { Lang, QuizState } from './types';

interface Props {
  state: QuizState;
  koLock: boolean;
  onLang: (l: Lang) => void;
  onAnswer: (idx: number) => void;
  onNext: () => void;
  onFinishNow: () => void;
}

function TimerIcon() {
  return (
    <svg className="timer-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
      <circle cx="10" cy="11" r="7" />
      <polyline points="10,7 10,11 13,13" />
      <line x1="8" y1="2" x2="12" y2="2" />
    </svg>
  );
}

export default function QuizScreen({ state: s, koLock, onLang, onAnswer, onNext, onFinishNow }: Props) {
  const q = s.questions[s.current];
  const total = s.questions.length;
  const pct = (((s.current + (s.answered !== null ? 1 : 0)) / total) * 100).toFixed(0);
  const hasTh = !!q.question_th;
  const isBoth = s.lang === 'both' && hasTh;
  const useTh = s.lang === 'th' && hasTh;
  const noThFallback = (s.lang === 'th' || s.lang === 'both') && !hasTh;
  const isExam = s.studyMode === 'exam';
  const domName = isBoth ? `${DOMAIN_NAMES[q.dom]} · ${DOMAIN_NAMES_TH[q.dom]}` : useTh ? DOMAIN_NAMES_TH[q.dom] : DOMAIN_NAMES[q.dom];

  const timeLeft = Math.max(0, s.examTimeLeft);
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const isLast = s.current >= total - 1;
  const nextLabel = isBoth ? 'Next Question / ข้อถัดไป' : isLast ? (useTh ? 'ดูผลลัพธ์' : 'View Results') : (useTh ? 'ข้อถัดไป' : 'Next Question');
  const lastLabel = isBoth ? 'View Results / ดูผลลัพธ์' : nextLabel;

  const finishNow = () => {
    if (window.confirm('End the quiz now? Any unanswered questions will count against you and your result will be marked incomplete.')) onFinishNow();
  };

  return (
    <>
      <LangToggle lang={s.lang} disableTh={!hasTh} onChange={onLang} />
      <div className="exam-bar">
        <div className={'exam-timer' + (timeLeft <= 15 ? ' low' : '')}><TimerIcon />{mm}:{ss}</div>
        <button type="button" className="btn btn-secondary exam-finish-btn" onClick={finishNow}>Finish Now</button>
      </div>
      <div className="quiz-header">
        <span className="progress-info">{s.current + 1} / {total}</span>
        <div className="score-live">
          {isExam
            ? <span className="score-answered">Answered {s.answers.length}/{total}</span>
            : <><span className="score-correct">[OK] {s.score}</span><span className="score-wrong">[X] {s.wrong}</span></>}
        </div>
      </div>
      <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: pct + '%' }} /></div>
      <div className="question-card">
        <div className="domain-tag">Domain {q.dom} · {domName}</div>{' '}
        {noThFallback && <><span className="notice-tag">Thai not available yet - showing English</span>{' '}</>}
        <TopicBadge text={q.question} />
        <div className="question-number">QUESTION {q.id}</div>
        <div className="question-text">
          {isBoth ? (
            <div className="bilingual-block">
              <div className="bilingual-pair"><span className="lang-chip">EN</span><span className="bilingual-en">{q.question}</span></div>
              <div className="bilingual-pair"><span className="lang-chip th">TH</span><span className="bilingual-th">{q.question_th}</span></div>
            </div>
          ) : useTh ? q.question_th : q.question}
        </div>
        <div className="options">
          {q.options.map((opt, idx) => {
            let c = 'option-btn';
            if (s.answered !== null) {
              c += ' disabled';
              if (isExam) {
                if (idx === s.answered) c += ' exam-selected';
              } else if (idx === s.answered && idx === q.correct_idx) c += ' correct-selected';
              else if (idx === s.answered) c += ' wrong-selected';
              else if (idx === q.correct_idx) c += ' correct-reveal';
            }
            return (
              <button type="button" key={idx} className={c} onClick={() => onAnswer(idx)}>
                <span className="option-letter">{LETTERS[idx]}</span>
                <span>
                  {isBoth
                    ? <><div className="bilingual-en">{opt}</div><div className="bilingual-th">{q.options_th[idx]}</div></>
                    : useTh ? q.options_th[idx] : opt}
                </span>
              </button>
            );
          })}
        </div>
        {!isExam && s.answered !== null && (isBoth ? (
          <div className="explanation-box">
            <strong><span className="lang-chip">EN</span>Why this is correct</strong>
            <div className="bilingual-en">{q.explanation}</div>
            <div className="bilingual-th"><span className="lang-chip th">TH</span>{q.explanation_th}</div>
          </div>
        ) : q.explanation ? (
          <div className="explanation-box"><strong>{useTh ? 'เหตุผล' : 'Why this is correct'}</strong>{useTh ? q.explanation_th : q.explanation}</div>
        ) : null)}
        {s.answered !== null && !koLock && (
          <div className="nav-row">
            <button type="button" className="btn btn-primary" onClick={onNext}>{isLast ? lastLabel : nextLabel}</button>
          </div>
        )}
      </div>
    </>
  );
}
