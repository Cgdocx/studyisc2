import LessonPage from '@/components/lesson/LessonPage';
import { lessonMetadata } from '@/components/lesson/lessons';
import '@/styles/lesson.css';

export const metadata = lessonMetadata(4);

export default function LessonDomain4Page() {
  return <LessonPage n={4} />;
}
