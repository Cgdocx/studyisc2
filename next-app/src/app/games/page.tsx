import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import SiteLink from '@/components/SiteLink';
import { withCount } from '@/components/games/counts';
import data from '@/data/games/games.json';
import '@/styles/games/games.css';
import '@/styles/games/motion.css';

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
};

export default function GamesPage() {
  return (
    <div className="pg-games pg-game">
      <div className="wrap">
        <header className="hero-section">
          <div className="eyebrow">{data.hero.eyebrow}</div>
          <h1>{data.hero.title}</h1>
          <div className="sub">{data.hero.sub}</div>
        </header>
        {data.categories.map(cat => [
          <div className="category-label" key={cat.label + ':label'}>{cat.label}</div>,
          <div className="grid" key={cat.label + ':grid'}>
            {cat.cards.map(card => (
              <div className="card" style={card.style as CSSProperties} key={card.href}>
                <div>
                  <span className="card-badge">{card.badge}</span>
                  <h2>{card.title}</h2>
                  <p>{withCount(card.desc, card.href)}</p>
                </div>
                <div>
                  <div className="card-meta">{card.meta.map(m => <span key={m}>{withCount(m, card.href)}</span>)}</div>
                  <SiteLink file={card.href} className="card-btn">{card.button}</SiteLink>
                </div>
              </div>
            ))}
          </div>,
        ])}
      </div>
    </div>
  );
}
