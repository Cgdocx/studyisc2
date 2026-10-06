import { Fragment, type CSSProperties } from 'react';
import type { Metadata } from 'next';
import SiteLink from '@/components/SiteLink';
import { PORTAL_SECTIONS } from './cards';
import '@/styles/landing.css';

export const metadata: Metadata = {
  title: 'ISC2 CC Exam & Study Portal',
};

const START_STEPS = ['Learning Path', 'บทเรียน Domain 1', 'Flashcard', 'ข้อสอบสั้น', 'สอบเต็มชุด'];

export default function LandingPage() {
  return (
    <div className="pg-landing">
      <div className="container">
        <header className="hero">
          <div className="eyebrow">PORTAL // LEARN &gt; PRACTICE &gt; EXAM</div>
          <h1>ISC2 CC EXAM PORTAL</h1>
          <div className="hero-th">ศูนย์รวมคลังข้อสอบและผังความคิดสรุปเนื้อหาเตรียมสอบมาตรฐานสากล</div>
          <p className="sub">
            รวบรวมแบบทดสอบคัดสรรพร้อมเฉลยละเอียด สรุปเนื้อหาตาม Exam Outline ทางการ ครบ 5 โดเมน สำหรับผู้เตรียมสอบใบรับรอง ISC2 Certified in Cybersecurity
          </p>
        </header>

        <section className="start-here" aria-labelledby="startHereTitle">
          <div className="start-tag">เริ่มที่นี่</div>
          <div className="start-body">
            <h2 id="startHereTitle">มือใหม่ : เริ่มจาก Learning Path</h2>
            <p>ทำตามลำดับนี้แล้วไม่หลง ระบบจำความคืบหน้าไว้ในเครื่องนี้ให้อัตโนมัติ</p>
            <ol className="start-steps">
              {START_STEPS.map((s, i) => (
                <li key={s}><b>{i + 1}</b>{s}</li>
              ))}
            </ol>
          </div>
          <div className="start-actions">
            <SiteLink file="learning-path.html" className="start-btn primary">เปิด Learning Path</SiteLink>
            <SiteLink file="lesson-domain-1.html" className="start-btn">เริ่มบทเรียน Domain 1</SiteLink>
          </div>
        </section>

        {PORTAL_SECTIONS.map(section => (
          <Fragment key={section.step}>
            <div className="section-label"><span>{section.step}</span>{section.title}</div>
            <div className="grid">
              {section.cards.map(card => (
                <div
                  key={card.title}
                  className="card"
                  style={{ '--badge-bg': card.badgeBg, '--btn-bg': card.btnBg, '--btn-color': card.btnColor } as CSSProperties}
                >
                  <div>
                    <div className="card-head">
                      <span className="card-badge" style={card.badgeLight ? { color: '#fff' } : undefined}>{card.badge}</span>
                      <h2>{card.title}</h2>
                      <div className="card-sub-th">{card.subTh}</div>
                    </div>
                    <p>{card.desc}</p>
                  </div>
                  <div>
                    <div className="card-meta">{card.meta.map(m => <span key={m}>{m}</span>)}</div>
                    <SiteLink file={card.file} className="card-btn">{card.cta}</SiteLink>
                  </div>
                </div>
              ))}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
