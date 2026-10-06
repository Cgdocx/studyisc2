'use client';

import { usePathname } from 'next/navigation';
import SiteLink from './SiteLink';
import { NAV_LINKS, activeNavFor } from '@/lib/site';

export default function GlobalNav() {
  const active = activeNavFor(usePathname());
  return (
    <nav className="creative-global-nav">
      <div className="cg-nav-inner">
        <SiteLink file="isc2-cc-landing.html" className="cg-brand">
          <span className="cg-badge">ISC2 CC</span>
          <span className="cg-title">STUDY HUB</span>
        </SiteLink>
        <div className="cg-links">
          {NAV_LINKS.map(l => (
            <SiteLink key={l.key} file={l.file} className={'cg-link' + (active === l.key ? ' active' : '')}>
              {l.label}
            </SiteLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
