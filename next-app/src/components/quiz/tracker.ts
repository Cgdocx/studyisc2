import type { QuizState } from './types';
import { DOMAIN_NAMES, LETTERS } from './strings';

export const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxUOMS6CiqBj6fYKkLNpuu0-RRIHhIArTENMJQRzbOhjEVI_xPpyKbvFqNvdJtg5LwH/exec';

export function isComplete(s: QuizState): boolean {
  return s.answers.length === s.questions.length;
}

export function isPassed(s: QuizState, pct: number): boolean {
  return isComplete(s) && pct >= 70;
}

export function buildPayload(s: QuizState) {
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
    answers,
  };
}

export function submitToTracker(s: QuizState): void {
  const body = JSON.stringify(buildPayload(s));
  let queued = false;
  if (navigator.sendBeacon) {
    try {
      queued = navigator.sendBeacon(APPS_SCRIPT_URL, new Blob([body], { type: 'text/plain;charset=utf-8' }));
    } catch {
      queued = false;
    }
  }
  if (!queued) {
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    }).catch(() => undefined);
  }
}
