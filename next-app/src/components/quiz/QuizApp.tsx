'use client';

import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import BattleLayer from '@/components/battle/BattleLayer';
import type { BilingualBankConfig } from '@/lib/banks';
import { useBank } from './engine/useBank';
import { initialState, reducer } from './reducer';
import QuizScreen from './QuizScreen';
import ResultsScreen from './ResultsScreen';
import StartScreen from './StartScreen';
import { submitToTracker } from './tracker';
import type { Question } from './types';

function makeSessionId(): string {
  return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

export default function QuizApp({ config }: { config: BilingualBankConfig }) {
  const { data: bank, error: loadError } = useBank<Question[]>(config.dataFile);
  const [s, dispatch] = useReducer(reducer, initialState);
  const [nameDraft, setNameDraft] = useState('');
  const [koLock, setKoLock] = useState(false);
  const lockRef = useRef(false);
  const sentRun = useRef(0);

  const { screen, current, answered, runId, studyMode } = s;
  useEffect(() => {
    if (screen !== 'quiz' || answered !== null || koLock) return;
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [screen, current, answered, runId, koLock]);

  const last = s.answers[s.answers.length - 1];
  useEffect(() => {
    if (screen !== 'quiz' || studyMode !== 'exam' || !last || !last.timedOut || last.qIndex !== current) return;
    const id = window.setTimeout(() => dispatch({ type: 'next' }), 900);
    return () => clearTimeout(id);
  }, [screen, studyMode, current, last]);

  const latest = useRef(s);
  useLayoutEffect(() => { latest.current = s; });
  const { tracker } = config;
  useEffect(() => {
    if (tracker && s.screen === 'results' && sentRun.current !== s.runId) {
      sentRun.current = s.runId;
      submitToTracker(s, tracker);
    }
  }, [s, tracker]);

  useEffect(() => {
    if (!tracker || !tracker.autoSaveOnHide) return;
    const trySubmitIncomplete = () => {
      const cur = latest.current;
      if (cur.screen === 'quiz' && sentRun.current !== cur.runId) {
        sentRun.current = cur.runId;
        submitToTracker(cur, tracker, { autoSaved: true });
      }
    };
    const onVis = () => { if (document.visibilityState === 'hidden') trySubmitIncomplete(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', trySubmitIncomplete);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', trySubmitIncomplete);
    };
  }, [tracker]);

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
    const seconds = config.timer.kind === 'per-question' ? config.timer.seconds : 0;
    dispatch({ type: 'start', pool: bank.filter(q => s.selectedDomains.includes(q.dom)), sessionId: makeSessionId(), seconds });
    window.scrollTo({ top: 0 });
  };

  const battleOn = config.battle && s.studyMode !== 'exam' && (s.screen === 'quiz' || s.screen === 'results') && s.questions.length > 0;

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
            config={config}
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
            config={config}
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
