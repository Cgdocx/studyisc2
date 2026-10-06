import LessonPage from '@/components/lesson/LessonPage';
import { lessonMetadata } from '@/components/lesson/lessons';
import '@/styles/lesson.css';

export const metadata = lessonMetadata(5);

export default function LessonDomain5Page() {
  return <LessonPage n={5} />;
}
