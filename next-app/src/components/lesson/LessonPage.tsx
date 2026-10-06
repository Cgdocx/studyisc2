import { createElement } from 'react';
import SiteLink from '@/components/SiteLink';
import { LESSONS, LESSON_TABS, LESSON_TABS_ARIA, type LessonBlock } from './lessons';

function Block({ block }: { block: LessonBlock }) {
  const { class: className, ...rest } = block.attrs;
  return createElement(block.tag, { className, ...rest, dangerouslySetInnerHTML: { __html: block.html } });
}

export default function LessonPage({ n }: { n: number }) {
  const lesson = LESSONS[n - 1];
  const { hero } = lesson;
  const subLines = hero.subLines.flatMap((line, i) => (i ? [<br key={'br' + i} />, line] : [line]));
  return (
    <div className={`pg-lesson lv-${lesson.variant} l-${n}`}>
      <div className="wrap">
        <nav className="lesson-tabs" aria-label={LESSON_TABS_ARIA}>
          {LESSON_TABS.map(t => (
            <SiteLink key={t.n} file={t.file} className={'lesson-tab' + (t.n === n ? ' active' : '')} aria-current={t.n === n ? 'page' : undefined}>
              <b>{t.code}</b><span>{t.label}</span>
            </SiteLink>
          ))}
        </nav>
        <header className={hero.className}>
          <div className="eyebrow">{hero.eyebrow}</div>
          <h1>{hero.title}</h1>
          {createElement(hero.subTag, { className: 'sub' }, ...subLines)}
        </header>
        {lesson.blocks.map((b, i) => <Block key={i} block={b} />)}
        <nav className="lesson-nav" aria-label={lesson.navAria}>
          {lesson.nav.map(l => (
            <SiteLink key={l.href} file={l.href} className={l.className}>
              {l.label}<small>{l.small}</small>
            </SiteLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
