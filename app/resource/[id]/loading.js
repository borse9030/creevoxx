// app/resource/[id]/loading.js
// Next.js automatically streams this as the instant fallback while page.js
// awaits Firestore + CurseForge API calls on the server.

export default function ResourceLoading() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .skel {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.09) 50%,
            rgba(255,255,255,0.04) 75%
          );
          background-size: 600px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 8px;
        }
      `}</style>

      {/* --- Mobile skeleton --------------------------- */}
      <div className="mobile-detail-container" style={{ padding: "0 0 120px" }}>
        {/* Back bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px",
          background: "#081410",
          borderBottom: "1px solid rgba(16,185,129,0.12)"
        }}>
          <div className="skel" style={{ width: 28, height: 28, borderRadius: "50%" }} />
          <div className="skel" style={{ width: 100, height: 16 }} />
        </div>

        {/* Hero image */}
        <div className="skel" style={{ width: "100%", height: 220 }} />

        {/* Title + author */}
        <div style={{ padding: "20px 16px 0" }}>
          <div className="skel" style={{ width: "75%", height: 26, marginBottom: 10 }} />
          <div className="skel" style={{ width: "45%", height: 16, marginBottom: 20 }} />

          {/* Badges row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[70, 90, 60].map((w, i) => (
              <div key={i} className="skel" style={{ width: w, height: 28, borderRadius: 50 }} />
            ))}
          </div>

          {/* Action buttons */}
          <div className="skel" style={{ width: "100%", height: 48, borderRadius: 12, marginBottom: 12 }} />
          <div className="skel" style={{ width: "100%", height: 44, borderRadius: 12, marginBottom: 28 }} />

          {/* Description lines */}
          {[100, 90, 80, 95, 70].map((pct, i) => (
            <div key={i} className="skel" style={{ width: `${pct}%`, height: 14, marginBottom: 10, borderRadius: 4 }} />
          ))}
        </div>
      </div>

      {/* --- Desktop skeleton --------------------------- */}
      <div className="desktop-detail-container" style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40 }}>
          {/* Left col */}
          <div>
            {/* Breadcrumb */}
            <div className="skel" style={{ width: 200, height: 14, marginBottom: 24 }} />
            {/* Hero */}
            <div className="skel" style={{ width: "100%", height: 320, borderRadius: 16, marginBottom: 28 }} />
            {/* Title */}
            <div className="skel" style={{ width: "70%", height: 36, marginBottom: 14 }} />
            <div className="skel" style={{ width: "45%", height: 18, marginBottom: 24 }} />
            {/* Desc lines */}
            {[100, 88, 92, 75, 80].map((pct, i) => (
              <div key={i} className="skel" style={{ width: `${pct}%`, height: 15, marginBottom: 12, borderRadius: 4 }} />
            ))}
          </div>
          {/* Right sidebar */}
          <div>
            <div className="skel" style={{ width: "100%", height: 180, borderRadius: 16, marginBottom: 20 }} />
            <div className="skel" style={{ width: "100%", height: 52, borderRadius: 10, marginBottom: 12 }} />
            <div className="skel" style={{ width: "100%", height: 52, borderRadius: 10, marginBottom: 24 }} />
            {[80, 65, 70, 60].map((w, i) => (
              <div key={i} className="skel" style={{ width: `${w}%`, height: 14, marginBottom: 12 }} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
