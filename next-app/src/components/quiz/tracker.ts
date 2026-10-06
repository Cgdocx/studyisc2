import type { TrackerConfig } from '@/lib/banks';
import { postToSheet } from './engine/sheet';
import type { QuizState } from './types';
import { DOMAIN_NAMES, LETTERS } from './strings';

export function isComplete(s: QuizState): boolean {
  return s.answers.length === s.questions.length;
}

export function isPassed(s: QuizState, pct: number): boolean {
  return isComplete(s) && pct >= 70;
}

export function buildPayload(s: QuizState, tracker: TrackerConfig, opts: { autoSaved?: boolean } = {}) {
  const total = s.questions.length;
  const pct = total > 0 ? Math.round((s.score / total) * 100) : 0;
  const answers = s.answers.map(a => {
    const q = s.questions[a.qIndex];
    return {
      domain: q.dom,
      domainName: DOMAIN_NAMES[q.dom],
      questionId: q.id,
      question: q.question,
      yourAnswer: a.selected === -1 ? '(No answer - time expired)' : `${LETTERS[a.selected]}. ${q.options[a.selected]}`,
      correctAnswer: `${LETTERS[a.correct]}. ${q.options[a.correct]}`,
      isCorrect: a.isCorrect,
    };
  });
  return {
    name: s.userName || 'Anonymous',
    ...(tracker.quizTitle !== undefined ? { quizTitle: tracker.quizTitle } : {}),
    ...(tracker.sessionId ? { sessionId: s.sessionId } : {}),
    mode: s.mode,
    studyMode: s.studyMode,
    domains: [...s.selectedDomains].sort(),
    language: s.lang,
    total,
    correct: s.score,
    wrong: s.wrong,
    answered: s.answers.length,
    complete: isComplete(s),
    passed: isPassed(s, pct),
    finishedManually: s.finishedManually,
    ...(tracker.autoSaveOnHide ? { autoSaved: !!opts.autoSaved } : {}),
    answers,
  };
}

export function submitToTracker(s: QuizState, tracker: TrackerConfig, opts: { autoSaved?: boolean } = {}): void {
  postToSheet(tracker, JSON.stringify(buildPayload(s, tracker, opts))).catch(() => undefined);
}
