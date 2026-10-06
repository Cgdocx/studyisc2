import type { Lang } from './types';

interface Props {
  lang: Lang;
  disableTh: boolean;
  onChange: (l: Lang) => void;
}

const TH_MISSING = 'Thai not available for this question yet';

export default function LangToggle({ lang, disableTh, onChange }: Props) {
  const btn = (l: Lang, label: string, thOnly: boolean) => (
    <button
      type="button"
      className={'lang-btn' + (lang === l ? ' active' : '') + (thOnly && disableTh ? ' lang-unavailable' : '')}
      disabled={thOnly && disableTh}
      title={thOnly && disableTh ? TH_MISSING : undefined}
      onClick={() => onChange(l)}
    >
      {label}
    </button>
  );
  return (
    <div className="lang-toggle-wrap">
      <div className="lang-toggle">
        {btn('en', 'EN', false)}
        {btn('th', 'TH', true)}
        {btn('both', 'EN+TH', true)}
      </div>
    </div>
  );
}
