interface Props {
  id: string;
  value: number;
  max: number;
  enemy?: boolean;
  boss?: boolean;
}

export default function HpBar({ id, value, max, enemy, boss }: Props) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  let cls = 'qb-bar-fill';
  if (enemy) cls += ' enemy' + (boss ? ' boss' : '');
  else cls += pct <= 30 ? ' danger' : pct <= 55 ? ' warn' : '';
  return (
    <div className="qb-bar">
      <div className={cls} id={id} style={{ width: pct + '%' }} />
      <div className="qb-bar-text" id={id + '-t'}>{max > 0 ? `${value} / ${max}` : ''}</div>
    </div>
  );
}
