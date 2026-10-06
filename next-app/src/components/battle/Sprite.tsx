'use client';

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { replay } from './engine';
import type { DamageKind, SpriteAnim } from './types';

export interface SpriteHandle {
  play: (anim: SpriteAnim) => void;
  flash: (cls: 'flash-hit' | 'flash-hurt') => void;
  slash: () => void;
  pop: (text: string, kind: DamageKind) => void;
  mark: (cls: 'defeat' | 'flee') => void;
  reset: () => void;
}

interface Props {
  id: string;
  bobId: string;
  svg: string;
  withSlash?: boolean;
  ref?: Ref<SpriteHandle>;
}

const ANIMS: SpriteAnim[] = ['lunge-r', 'lunge-l', 'shake', 'enter', 'boss-enter'];

export default function Sprite({ id, bobId, svg, withSlash, ref }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const bob = useRef<HTMLDivElement>(null);
  const slashEl = useRef<HTMLDivElement>(null);
  const seq = useRef(0);
  const timers = useRef<number[]>([]);
  const [pops, setPops] = useState<{ id: number; text: string; kind: DamageKind }[]>([]);

  useEffect(() => () => timers.current.forEach(t => clearTimeout(t)), []);

  useImperativeHandle(ref, () => ({
    play: anim => replay(box.current, anim, ANIMS),
    flash: cls => replay(bob.current, cls, ['flash-hit', 'flash-hurt']),
    slash: () => replay(slashEl.current, 'show'),
    pop: (text, kind) => {
      const pid = ++seq.current;
      setPops(p => [...p, { id: pid, text, kind }]);
      timers.current.push(window.setTimeout(() => setPops(p => p.filter(x => x.id !== pid)), 900));
    },
    mark: cls => box.current?.classList.add(cls),
    reset: () => {
      if (box.current) box.current.className = 'qb-sprite';
      if (bob.current) bob.current.className = 'qb-bob';
      setPops([]);
    },
  }), []);

  return (
    <div className="qb-sprite" id={id} ref={box}>
      <div className="qb-bob" id={bobId} ref={bob} dangerouslySetInnerHTML={{ __html: svg }} />
      {withSlash && <div className="qb-slash" ref={slashEl} />}
      {pops.map(p => <div key={p.id} className={'qb-dmg ' + p.kind}>{p.text}</div>)}
    </div>
  );
}
