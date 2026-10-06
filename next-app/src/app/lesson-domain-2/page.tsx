import LessonPage from '@/components/lesson/LessonPage';
import { lessonMetadata } from '@/components/lesson/lessons';
import '@/styles/lesson.css';

export const metadata = lessonMetadata(2);

export default function LessonDomain2Page() {
  return <LessonPage n={2} />;
}
