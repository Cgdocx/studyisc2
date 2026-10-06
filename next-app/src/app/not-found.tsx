import SiteLink from '@/components/SiteLink';
import '@/styles/landing.css';

export default function NotFound() {
  return (
    <div className="pg-landing">
      <div className="container">
        <header className="hero">
          <div className="eyebrow">404 : NOT FOUND</div>
          <h1>ไม่พบหน้านี้</h1>
          <p className="sub">ลิงก์อาจถูกย้ายหรือพิมพ์ผิด กลับไปเลือกชุดข้อสอบหรือเส้นทางเรียนได้จากหน้ารวม</p>
          <div className="start-actions" style={{ marginTop: 18, alignItems: 'center' }}>
            <SiteLink file="isc2-cc-landing.html" className="start-btn primary">กลับหน้าชุดข้อสอบ</SiteLink>
          </div>
        </header>
      </div>
    </div>
  );
}
