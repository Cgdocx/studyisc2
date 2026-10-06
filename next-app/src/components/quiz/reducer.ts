import type { Lang, Order, Question, QuizState, StudyMode } from './types';
import { EXAM_SECONDS_PER_QUESTION } from './strings';

export type Action =
  | { type: 'setLang'; lang: Lang }
  | { type: 'setName'; name: string }
  | { type: 'setStudyMode'; mode: StudyMode }
  | { type: 'setOrder'; mode: Order }
  | { type: 'toggleDomain'; dom: number }
  | { type: 'setDomains'; doms: number[] }
  | { type: 'setCount'; count: number }
  | { type: 'start'; pool: Question[] }
  | { type: 'answer'; idx: number }
  | { type: 'tick' }
  | { type: 'next' }
  | { type: 'finish'; manual: boolean }
  | { type: 'toStart' };

export const initialState: QuizState = {
  screen: 'start', mode: 'all', selectedDomains: [1, 2, 3, 4, 5], count: 50,
  questions: [], current: 0, answered: null, score: 0, wrong: 0, answers: [],
  lang: 'en', userName: '', studyMode: 'practice',
  examTimeLeft: 0, finishedManually: false, runId: 0,
};

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function timeout(s: QuizState): QuizState {
  if (s.answered !== null) return s;
  const q = s.questions[s.current];
  return {
    ...s,
    examTimeLeft: 0,
    wrong: s.wrong + 1,
    answered: -1,
    answers: [...s.answers, { qIndex: s.current, selected: -1, correct: q.correct_idx, isCorrect: false, timedOut: true }],
  };
}

export function reducer(s: QuizState, a: Action): QuizState {
  switch (a.type) {
    case 'setLang': return { ...s, lang: a.lang };
    case 'setName': return { ...s, userName: a.name };
    case 'setStudyMode': return { ...s, studyMode: a.mode };
    case 'setOrder': return { ...s, mode: a.mode };
    case 'toggleDomain': {
      const has = s.selectedDomains.includes(a.dom);
      return { ...s, selectedDomains: has ? s.selectedDomains.filter(d => d !== a.dom) : [...s.selectedDomains, a.dom] };
    }
    case 'setDomains': return { ...s, selectedDomains: a.doms };
    case 'setCount': return { ...s, count: a.count };
    case 'start': {
      if (a.pool.length === 0) return s;
      const src = s.mode === 'random' ? shuffle(a.pool) : [...a.pool];
      const n = Math.min(Math.max(1, s.count), src.length);
      return {
        ...s, questions: src.slice(0, n), current: 0, answered: null, score: 0, wrong: 0, answers: [],
        finishedManually: false, screen: 'quiz', examTimeLeft: EXAM_SECONDS_PER_QUESTION, runId: s.runId + 1,
      };
    }
    case 'answer': {
      if (s.answered !== null || s.screen !== 'quiz') return s;
      const q = s.questions[s.current];
      const ok = a.idx === q.correct_idx;
      return {
        ...s, answered: a.idx, score: s.score + (ok ? 1 : 0), wrong: s.wrong + (ok ? 0 : 1),
        answers: [...s.answers, { qIndex: s.current, selected: a.idx, correct: q.correct_idx, isCorrect: ok }],
      };
    }
    case 'tick': {
      if (s.screen !== 'quiz' || s.answered !== null) return s;
      const left = s.examTimeLeft - 1;
      return left <= 0 ? timeout(s) : { ...s, examTimeLeft: left };
    }
    case 'next':
      if (s.screen !== 'quiz') return s;
      if (s.current < s.questions.length - 1) {
        return { ...s, current: s.current + 1, answered: null, examTimeLeft: EXAM_SECONDS_PER_QUESTION };
      }
      return { ...s, screen: 'results' };
    case 'finish':
      if (s.screen !== 'quiz') return s;
      return { ...s, screen: 'results', finishedManually: a.manual ? true : s.finishedManually };
    case 'toStart': return { ...s, screen: 'start' };
  }
}
