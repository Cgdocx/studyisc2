import type { Ref } from 'react';
import type { RailView } from './types';

export default function StageRail({ rail, ref }: { rail: RailView | null; ref?: Ref<HTMLDivElement> }) {
  return (
    <div className="qb-rail" id="qb-rail" ref={ref}>
      {rail && (
        <>
          <span className="qb-stage">Stage {rail.stage} / {rail.stages}</span>
          {rail.dots.map(d => <span key={d.label} className={'qb-dot' + d.cls}>{d.label}</span>)}
        </>
      )}
    </div>
  );
}
