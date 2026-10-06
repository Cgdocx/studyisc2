import LessonPage from '@/components/lesson/LessonPage';
import { lessonMetadata } from '@/components/lesson/lessons';
import '@/styles/lesson.css';

export const metadata = lessonMetadata(1);

export default function LessonDomain1Page() {
  return <LessonPage n={1} />;
}
