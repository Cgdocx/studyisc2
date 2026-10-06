'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import BattleLayer from '@/components/battle/BattleLayer';
import { BASE_PATH } from '@/lib/site';
import { initialState, reducer } from './reducer';
import QuizScreen from './QuizScreen';
import ResultsScreen from './ResultsScreen';
import StartScreen from './StartScreen';
import { submitToTracker } from './tracker';
import type { Question } from './types';

export const QUESTIONS_URL = `${BASE_PATH}/data/questions-583.json`;

export default function QuizApp() {
  const [bank, setBank] = useState<Question[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [s, dispatch] = useReducer(reducer, initialState);
  const [nameDraft, setNameDraft] = useState('');
  const [koLock, setKoLock] = useState(false);
  const lockRef = useRef(false);
  const sentRun = useRef(0);

  useEffect(() => {
    let alive = true;
    fetch(QUESTIONS_URL)
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<Question[]>; })
      .then(data => { if (alive) setBank(data); })
      .catch(() => { if (alive) setLoadError(true); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (s.screen !== 'quiz' || s.answered !== null || koLock) return;
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [s.screen, s.current, s.answered, s.runId, koLock]);

  const last = s.answers[s.answers.length - 1];
  useEffect(() => {
    if (s.screen !== 'quiz' || s.studyMode !== 'exam' || !last || !last.timedOut || last.qIndex !== s.current) return;
    const id = window.setTimeout(() => dispatch({ type: 'next' }), 900);
    return () => clearTimeout(id);
  }, [s.screen, s.studyMode, s.current, last]);

  useEffect(() => {
    if (s.screen === 'results' && sentRun.current !== s.runId) {
      sentRun.current = s.runId;
      submitToTracker(s);
    }
  }, [s]);

  const onLockChange = useCallback((locked: boolean) => {
    lockRef.current = locked;
    setKoLock(locked);
  }, []);
  const next = useCallback(() => {
    if (lockRef.current) return;
    dispatch({ type: 'next' });
  }, []);

  const start = () => {
    if (!bank) return;
    dispatch({ type: 'start', pool: bank.filter(q => s.selectedDomains.includes(q.dom)) });
    window.scrollTo({ top: 0 });
  };

  const battleOn = s.studyMode !== 'exam' && (s.screen === 'quiz' || s.screen === 'results') && s.questions.length > 0;

  return (
    <div className="pg-quiz">
      {battleOn && (
        <BattleLayer
          questions={s.questions}
          current={s.current}
          answered={s.answered}
          answers={s.answers}
          screen={s.screen}
          lang={s.lang}
          onLockChange={onLockChange}
          onContinue={next}
        />
      )}
      <div className="app" id="app">
        {!bank ? (
          <div className="start-screen">
            <div className="subheading">{loadError ? '[!] Could not load the question bank. Please reload the page.' : 'Loading question bank...'}</div>
          </div>
        ) : s.screen === 'start' ? (
          <StartScreen
            state={s}
            bank={bank}
            nameDraft={nameDraft}
            onName={raw => { setNameDraft(raw); dispatch({ type: 'setName', name: raw.trim() }); }}
            onLang={l => dispatch({ type: 'setLang', lang: l })}
            onStudyMode={m => dispatch({ type: 'setStudyMode', mode: m })}
            onOrder={m => dispatch({ type: 'setOrder', mode: m })}
            onToggleDomain={d => dispatch({ type: 'toggleDomain', dom: d })}
            onSetDomains={d => dispatch({ type: 'setDomains', doms: d })}
            onCount={n => dispatch({ type: 'setCount', count: n })}
            onStart={start}
          />
        ) : s.screen === 'quiz' ? (
          <QuizScreen
            state={s}
            koLock={koLock}
            onLang={l => dispatch({ type: 'setLang', lang: l })}
            onAnswer={idx => dispatch({ type: 'answer', idx })}
            onNext={next}
            onFinishNow={() => dispatch({ type: 'finish', manual: true })}
          />
        ) : (
          <ResultsScreen
            state={s}
            onLang={l => dispatch({ type: 'setLang', lang: l })}
            onNewQuiz={() => dispatch({ type: 'toStart' })}
            onRetry={start}
          />
        )}
      </div>
    </div>
  );
}
