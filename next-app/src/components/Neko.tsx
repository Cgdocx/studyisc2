'use client';

import { useEffect, useRef } from 'react';

type Mode = 'walk' | 'sit' | 'sleep';

export default function Neko() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = Math.random() * (window.innerWidth - 60);
    let dir = 1;
    let mode: Mode = 'walk';
    let timer = 100 + Math.random() * 200;
    let raf = 0;
    const paint = () => { el.className = mode + (dir < 0 ? ' flip' : ''); };
    const next = () => {
      if (mode === 'walk') {
        mode = Math.random() < 0.65 ? 'sit' : 'sleep';
        timer = mode === 'sit' ? 150 + Math.random() * 200 : 250 + Math.random() * 350;
      } else {
        mode = 'walk';
        timer = 200 + Math.random() * 400;
        if (Math.random() < 0.4) dir *= -1;
      }
      paint();
    };
    paint();
    const frame = () => {
      if (--timer <= 0) next();
      if (mode === 'walk') {
        x += 1.2 * dir;
        if (x > window.innerWidth - 55) { dir = -1; paint(); }
        if (x < 5) { dir = 1; paint(); }
      }
      el.style.left = x + 'px';
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div id="neko" ref={ref} aria-hidden="true">
      <svg width="50" height="45" viewBox="0 0 50 45">
        <path className="ntail" d="M8,30 Q2,18 6,8" stroke="#0F0F0F" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="24" cy="33" rx="15" ry="10" fill="#0F0F0F" />
        <circle cx="38" cy="22" r="9" fill="#0F0F0F" />
        <polygon points="31,16 34,4 38,14" fill="#0F0F0F" />
        <polygon points="38,14 41,3 44,14" fill="#0F0F0F" />
        <polygon points="32.5,15 34,7 36,14" fill="#F06CA8" />
        <polygon points="39,13.5 41,6 43,14" fill="#F06CA8" />
        <ellipse className="neye" cx="35" cy="21" rx="2" ry="2.5" fill="#F5C518" />
        <ellipse className="neye" cx="42" cy="21" rx="2" ry="2.5" fill="#F5C518" />
        <circle className="neye" cx="35.5" cy="21.5" r="1.2" fill="#0F0F0F" />
        <circle className="neye" cx="42.5" cy="21.5" r="1.2" fill="#0F0F0F" />
        <line className="neye-shut" x1="33" y1="21" x2="37" y2="21" stroke="#F5C518" strokeWidth="1.5" strokeLinecap="round" />
        <line className="neye-shut" x1="40" y1="21" x2="44" y2="21" stroke="#F5C518" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="37.5,24.5 38.5,24.5 38,25.5" fill="#F06CA8" />
        <text className="nzzz" x="46" y="12" fill="#F5C518" fontFamily="monospace" fontSize="10" fontWeight="bold">z</text>
      </svg>
    </div>
  );
}
