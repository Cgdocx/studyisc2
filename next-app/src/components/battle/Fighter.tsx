import type { Ref } from 'react';
import HpBar from './HpBar';
import Sprite, { type SpriteHandle } from './Sprite';

interface Props {
  side: 'player' | 'enemy';
  tag: string;
  name: string;
  nameTh: string;
  hp: number;
  max: number;
  svg: string;
  boss?: boolean;
  spriteRef: Ref<SpriteHandle>;
}

export default function Fighter({ side, tag, name, nameTh, hp, max, svg, boss, spriteRef }: Props) {
  const p = side === 'player';
  return (
    <div className={'qb-fighter ' + side + (boss ? ' boss' : '')} id={p ? undefined : 'qb-ef'}>
      <div className="qb-info">
        <div className="qb-tag" id={p ? undefined : 'qb-ekind'}>{tag}</div>
        <div className="qb-name" id={p ? undefined : 'qb-ename'}>{name}</div>
        <div className="qb-name-th" id={p ? undefined : 'qb-ename-th'}>{nameTh}</div>
        <HpBar id={p ? 'qb-php' : 'qb-ehp'} value={hp} max={max} enemy={!p} boss={boss} />
      </div>
      <Sprite ref={spriteRef} id={p ? 'qb-ps' : 'qb-es'} bobId={p ? 'qb-pb' : 'qb-eb'} svg={svg} withSlash={!p} />
    </div>
  );
}
