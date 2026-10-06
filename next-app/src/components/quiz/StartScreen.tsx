import { useState } from 'react';
import LangToggle from './LangToggle';
import type { BilingualBankConfig } from '@/lib/banks';
import { DOMAIN_NAMES, DOMAIN_NAMES_TH, pick, t } from './strings';
import type { Lang, Order, Question, QuizState, StudyMode } from './types';

interface Props {
  config: BilingualBankConfig;
  state: QuizState;
  bank: Question[];
  nameDraft: string;
  onName: (raw: string) => void;
  onLang: (l: Lang) => void;
  onStudyMode: (m: StudyMode) => void;
  onOrder: (m: Order) => void;
  onToggleDomain: (d: number) => void;
  onSetDomains: (d: number[]) => void;
  onCount: (n: number) => void;
  onStart: () => void;
}

const DOMS = [1, 2, 3, 4, 5];

export default function StartScreen(p: Props) {
  const { state: s, bank } = p;
  const L = s.lang;
  const poolSize = bank.filter(q => s.selectedDomains.includes(q.dom)).length;
  const [countEdit, setCountEdit] = useState<string | null>(null);
  const shownCount = countEdit ?? String(Math.min(s.count, poolSize || 1));
  const canStart = poolSize > 0 && !!s.userName;

  return (
    <>
      <header className="hero-section">
        <div className="eyebrow">{t('createdBy', L)}</div>
        <h1>{pick(p.config.strings.appTitle, L)}</h1>
        <div className="sub">{pick(p.config.strings.tagline, L)}</div>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
          <LangToggle lang={L} disableTh={false} onChange={p.onLang} />
        </div>
      </header>

      <div className="start-screen">
        <div className="name-row">
          <label htmlFor="quiz-name">{t('yourNameLabel', L)}</label>
          <input
            id="quiz-name"
            type="text"
            className="name-input"
            placeholder={t('namePlaceholder', L)}
            value={p.nameDraft}
            onChange={e => p.onName(e.target.value)}
          />
        </div>

        <div className="section-label">{t('studyModeLabel', L)}</div>
        <div className="mode-cards">
          <div className={'mode-card' + (s.studyMode === 'practice' ? ' selected' : '')} onClick={() => p.onStudyMode('practice')}>
            <h3>{t('practiceTitle', L)}</h3><span>{t('practiceDesc', L)}</span>
          </div>
          <div className={'mode-card' + (s.studyMode === 'exam' ? ' selected' : '')} onClick={() => p.onStudyMode('exam')}>
            <h3>{t('examTitle', L)}</h3><span>{t('examDesc', L)}</span>
          </div>
        </div>
        <div className="subheading" style={{ marginTop: 8 }}>{s.studyMode === 'exam' ? t('examNote', L) : t('practiceNote', L)}</div>

        <div className="section-label">{t('orderLabel', L)}</div>
        <div className="mode-cards">
          <div className={'mode-card' + (s.mode === 'all' ? ' selected' : '')} onClick={() => p.onOrder('all')}>
            <h3>{t('sequentialTitle', L)}</h3><span>{t('sequentialDesc', L)}</span>
          </div>
          <div className={'mode-card' + (s.mode === 'random' ? ' selected' : '')} onClick={() => p.onOrder('random')}>
            <h3>{t('randomTitle', L)}</h3><span>{t('randomDesc', L)}</span>
          </div>
        </div>

        <div className="section-label">{t('domainsLabel', L)}</div>
        <div className="domain-grid">
          {DOMS.map(d => {
            const checked = s.selectedDomains.includes(d);
            const count = bank.filter(q => q.dom === d).length;
            const thCount = bank.filter(q => q.dom === d && q.question_th).length;
            const dname = L === 'both' ? `${DOMAIN_NAMES[d]} / ${DOMAIN_NAMES_TH[d]}` : L === 'th' ? DOMAIN_NAMES_TH[d] : DOMAIN_NAMES[d];
            return (
              <div key={d} className={'domain-row' + (checked ? ' checked' : '')} onClick={() => p.onToggleDomain(d)}>
                <input type="checkbox" checked={checked} onClick={e => e.stopPropagation()} onChange={() => p.onToggleDomain(d)} />
                <div className="dnum">{d}</div>
                <div className="dname">{dname}</div>
                {thCount > 0 && <span className="dth-badge">TH {thCount}/{count}</span>}
                <div className="dcount">{count}</div>
              </div>
            );
          })}
        </div>
        <div className="domain-actions">
          <button type="button" onClick={() => p.onSetDomains([...DOMS])}>{t('selectAll', L)}</button>
          <button type="button" onClick={() => p.onSetDomains([])}>{t('clearAll', L)}</button>
        </div>

        <div className="count-row">
          <label htmlFor="quiz-count">{t('questionsCountLabel', L)}</label>
          <input
            id="quiz-count"
            type="number"
            className="count-input"
            min={1}
            max={poolSize}
            value={shownCount}
            onFocus={() => setCountEdit(shownCount)}
            onChange={e => { setCountEdit(e.target.value); p.onCount(parseInt(e.target.value, 10) || 1); }}
            onBlur={() => setCountEdit(null)}
          />
        </div>
        {poolSize === 0
          ? <div className="warn">{t('warnSelectDomain', L)}</div>
          : <div className="subheading" style={{ marginTop: 8 }}>{poolSize} {t('availableSuffix', L)}</div>}

        <div className="start-btn-row">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canStart}
            style={canStart ? undefined : { opacity: 0.5, cursor: 'not-allowed' }}
            onClick={p.onStart}
          >
            {t('startQuizBtn', L)}
          </button>
        </div>
        {!s.userName && <div className="warn" style={{ marginTop: 10 }}>{t('warnEnterName', L)}</div>}
      </div>
    </>
  );
}
