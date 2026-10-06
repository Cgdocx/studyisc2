import { getTopicForQuestion } from './topics';

export default function TopicBadge({ text }: { text: string }) {
  const topic = getTopicForQuestion(text);
  if (!topic) return null;
  return (
    <div className="topic-badge">
      <span className="topic-icon" dangerouslySetInnerHTML={{ __html: topic.svg }} />
      <span className="topic-label">{topic.label}</span>
    </div>
  );
}
