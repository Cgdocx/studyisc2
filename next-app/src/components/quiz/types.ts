export interface Question {
  id: number;
  dom: number;
  question: string;
  question_th: string;
  options: string[];
  options_th: string[];
  correct_idx: number;
  explanation: string;
  explanation_th: string;
}

export type Lang = 'en' | 'th' | 'both';
export type StudyMode = 'practice' | 'exam';
export type Order = 'all' | 'random';
export type Screen = 'start' | 'quiz' | 'results';

export interface Answer {
  qIndex: number;
  selected: number;
  correct: number;
  isCorrect: boolean;
  timedOut?: boolean;
}

export interface QuizState {
  screen: Screen;
  mode: Order;
  selectedDomains: number[];
  count: number;
  questions: Question[];
  current: number;
  answered: number | null;
  score: number;
  wrong: number;
  answers: Answer[];
  lang: Lang;
  userName: string;
  studyMode: StudyMode;
  examTimeLeft: number;
  finishedManually: boolean;
  runId: number;
}
