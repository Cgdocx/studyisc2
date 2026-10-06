import LessonPage from '@/components/lesson/LessonPage';
import { lessonMetadata } from '@/components/lesson/lessons';
import '@/styles/lesson.css';

export const metadata = lessonMetadata(3);

export default function LessonDomain3Page() {
  return <LessonPage n={3} />;
}
