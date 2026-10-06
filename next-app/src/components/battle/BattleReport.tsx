import { PLAYER_SVG } from './art';
import type { BattleStats } from './types';

export default function BattleReport({ stats: s, hp }: { stats: BattleStats; hp: number }) {
  return (
    <div id="qb-report">
      <div className="qb-report">
        <div className="qb-report-art" dangerouslySetInnerHTML={{ __html: PLAYER_SVG }} />
        <div>
          <h3>Battle Report</h3>
          <p>สรุปการต่อสู้ของรอบนี้ ทุกข้อที่ตอบคือหนึ่งเทิร์น</p>
          <div className="qb-pills">
            <span className="qb-pill ok">ล้มมอน {s.mobs} / {s.mobTotal}</span>
            <span className="qb-pill boss">ล้มบอส {s.bosses} / {s.bossTotal}</span>
            <span className="qb-pill">HP เหลือ {hp}</span>
            <span className="qb-pill">หมดแรง (KO) {s.ko} ครั้ง</span>
            <span className="qb-pill">ทบทวน {s.reviewTried} ข้อ</span>
            <span className="qb-pill ok">ทบทวนถูก {s.reviewOk} ข้อ</span>
          </div>
          {s.bossArt.length > 0 && (
            <div className="qb-bosses">
              {s.bossArt.map((svg, i) => <span key={i} dangerouslySetInnerHTML={{ __html: svg }} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
