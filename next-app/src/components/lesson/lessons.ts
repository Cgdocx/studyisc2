import type { Metadata } from 'next';
import data from '@/data/content/lessons.json';

export interface LessonBlock {
  tag: string;
  attrs: Record<string, string>;
  html: string;
}

export interface LessonLink {
  href: string;
  className: string;
  label: string;
  small: string;
}

export interface Lesson {
  n: number;
  file: string;
  title: string;
  description: string;
  variant: 'a' | 'b';
  hero: { className: string; eyebrow: string; title: string; subTag: string; subLines: string[] };
  navAria: string;
  nav: LessonLink[];
  blocks: LessonBlock[];
}

export interface LessonTab {
  n: number;
  file: string;
  code: string;
  label: string;
}

export const LESSON_TABS: LessonTab[] = data.tabs;
export const LESSON_TABS_ARIA: string = data.tabsAria;
export const LESSONS = data.lessons as Lesson[];

export function lessonMetadata(n: number): Metadata {
  const l = LESSONS[n - 1];
  return { title: l.title, description: l.description };
}
