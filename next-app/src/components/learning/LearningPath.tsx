'use client';

import { useEffect, useMemo, useRef } from 'react';
import SiteLink from '@/components/SiteLink';
import { useStoredFlags } from '@/lib/storage';
import data from '@/data/content/learning-path.json';

export const LP_KEY = 'lp_completed';

interface Step { id: string; name: string; desc: string; time: string; domain: number; link: string; linkText: string }
interface Phase { id: string; title: string; th: string; color: string; desc: string; steps: Step[] }

const PHASES = data.phases as Phase[];
const DOMAIN_COLORS = data.domainColors as Record<string, string>;
const DOMAIN_LABELS = data.domainLabels as Record<string, string>;
const ALL_STEPS = PHASES.flatMap(p => p.steps);

function fillColor(pct: number): string {
  if (pct < 30) return 'var(--red)';
  if (pct < 60) return 'var(--orange)';
  if (pct < 90) return 'var(--yellow)';
  return 'var(--green)';
}

export default function LearningPath() {
  const [stored, save] = useStoredFlags(LP_KEY);
  const ready = stored !== null;
  const completed = useMemo(() => stored ?? {}, [stored]);
  const focusId = useRef<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusId.current || !rootRef.current) return;
    const again = rootRef.current.querySelector<HTMLButtonElement>(`.step-check[data-step="${focusId.current}"]`);
    if (again) again.focus({ preventScroll: true });
    focusId.current = null;
  }, [completed]);

  const toggleStep = (id: string) => {
    const next = { ...completed };
    if (next[id]) delete next[id]; else next[id] = true;
    focusId.current = id;
    save(next);
  };

  const done = ALL_STEPS.filter(s => completed[s.id]).length;
  const pct = Math.round(done / ALL_STEPS.length * 100);
  const currentId = ALL_STEPS.find(s => !completed[s.id])?.id ?? null;
  const hasCurrent = ready && currentId !== null;

  const goToCurrentStep = () => {
    const current = rootRef.current?.querySelector('.step.current');
    if (!current) return;
    current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const check = current.querySelector<HTMLButtonElement>('.step-check');
    if (check) check.focus({ preventScroll: true });
  };

  const reset = () => {
    if (confirm('ต้องการรีเซ็ตความก้าวหน้าทั้งหมดจริงหรือ?')) {
      save({});
    }
  };

  let globalIdx = 0;
  return (
    <div className="pg-learning">
      <div className="wrap" ref={rootRef}>
        <h1>Learning Path ISC2 CC</h1>
        <p className="subtitle">เส้นทางเรียนแบบ Step-by-step ตั้งแต่เริ่มต้นจนพร้อมสอบ<br />กดช่องสี่เหลี่ยมหน้าแต่ละขั้นเพื่อเช็คว่าทำแล้ว ระบบบันทึกความก้าวหน้าให้อัตโนมัติ</p>

        <div className="readiness">
          <div className="label">ความพร้อมสอบ</div>
          <div className="pct" id="readinessPct">{pct}%</div>
          <div className="bar-track"><div className="bar-fill" id="readinessFill" style={ready ? { width: pct + '%', background: fillColor(pct) } : { width: '0%' }} /></div>
          <div className="detail" id="readinessDetail">{done} / {ALL_STEPS.length} steps completed</div>
        </div>

        <div className="next-row">
          <button type="button" className="next-btn" id="nextStepBtn" disabled={ready && !hasCurrent} onClick={goToCurrentStep}>
            {!ready || hasCurrent ? 'ทำขั้นถัดไป' : 'ครบทุกขั้นแล้ว'}
          </button>
        </div>

        <div id="pathContainer">
          {ready && PHASES.map(phase => {
            const phaseDone = phase.steps.filter(s => completed[s.id]).length;
            return (
              <div className="phase" key={phase.id}>
                <div className="phase-header">
                  <span className="phase-badge" style={{ background: phase.color }}>{phase.th}</span>
                  <span className="phase-title">{phase.title}</span>
                  <span className="phase-progress">{phaseDone}/{phase.steps.length}</span>
                </div>
                <p className="phase-desc">{phase.desc}</p>
                <div className="timeline">
                  {phase.steps.map(step => {
                    globalIdx++;
                    const isDone = !!completed[step.id];
                    const state = isDone ? 'done' : step.id === currentId ? 'current' : 'future';
                    return (
                      <div className={'step ' + state} key={step.id}>
                        <div className="step-node" aria-hidden="true">{isDone ? '\u2713' : globalIdx}</div>
                        <div className="step-card">
                          <button type="button" className="step-check" data-step={step.id} aria-pressed={isDone} aria-label={`${isDone ? 'ยกเลิกเช็ค' : 'เช็คว่าทำแล้ว'} : ${step.name}`} onClick={() => toggleStep(step.id)}>
                            {isDone ? '\u2713' : ''}
                          </button>
                          <div className="step-content">
                            <div className="step-title-row">
                              <span className="step-name">{step.name}</span>
                              {step.domain > 0 && <span className="step-domain-tag" style={{ background: DOMAIN_COLORS[step.domain] }}>{DOMAIN_LABELS[step.domain]}</span>}
                            </div>
                            <div className="step-desc">{step.desc}</div>
                            <div className="step-time">{step.time}</div>
                          </div>
                          <SiteLink file={step.link} className="step-link">{step.linkText}</SiteLink>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="reset-row">
          <button className="reset-btn" id="resetBtn" onClick={reset}>RESET PROGRESS</button>
        </div>
      </div>
    </div>
  );
}
