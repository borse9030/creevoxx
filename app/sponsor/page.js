import React from "react";
import Link from "next/link";
import styles from "./sponsor.module.css";

export const metadata = {
  title: "Sponsor & Partner | Creevoxx",
  description: "Promote your Minecraft Bedrock/MCPE server, app, or tool across Creevoxx's audience.",
  robots: { index: true, follow: true },
};

// --- CONFIGURABLE STATS & PRICING ---
const STATS = {
  youtubeSubs: "15K+",
  youtubeViews48h: "30,000",
  websiteMonthlyVisitors: "50,000",
  updatedDate: "July 2026",
};

const LINKS = {
  youtubeChannel: "https://youtube.com/@creevoxx?si=6an4S31derNpahWX",
  website: "https://www.creevoxx.dev",
  contactEmail: "mailto:realcreevoxx@gmail.com",
};

const PRICES = {
  basic: "$25-30",
  weeklyTakeover: "$80-100",
  premium: "$150-180",
};
// ------------------------------------

const YoutubeGraph = () => {
  const heights = [
    12,15,18,14,10,8,6,7,5,8,12,15,20,25,28,30,35,32,28,25,20,18,15,12,
    14,16,19,22,20,18,15,14,12,10,12,15,18,25,30,35,38,40,36,32,28,25,22,20
  ];
  return (
    <div className={styles.dashboardScale} style={{ display: 'flex', gap: '12px', flexDirection: 'row', width: '100%', height: '420px', background: '#0f0f0f', borderRadius: '8px', padding: '12px', boxSizing: 'border-box', color: '#fff', fontFamily: '"Roboto", "Arial", sans-serif', flexWrap: 'wrap' }}>
      
      {/* Main Content */}
      <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Channel analytics</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {/* Pills */}
              <div style={{ padding: '3px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px' }}>✦</span> How did viewers find my content?
              </div>
              <div style={{ padding: '3px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px' }}>✦</span> How many new viewers did I reach?
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', fontWeight: '500' }}>Advanced mode</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px', fontSize: '10px', fontWeight: '500', color: '#aaaaaa', flexWrap: 'wrap' }}>
          <div style={{ paddingBottom: '6px', color: '#fff', borderBottom: '2px solid #fff' }}>Overview</div>
          <div style={{ paddingBottom: '6px' }}>Content</div>
          <div style={{ paddingBottom: '6px' }}>Audience</div>
          <div style={{ paddingBottom: '6px' }}>Revenue</div>
          <div style={{ paddingBottom: '6px' }}>Trends</div>
          <div style={{ flexGrow: 1, textAlign: 'right', fontSize: '8px' }}>
            2 - 29 Jul 2026<br/>
            <span style={{ fontSize: '10px', color: '#fff' }}>Last 28 days ▾</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          Your channel got 425,456 views in the last 28 days
        </div>

        {/* Chart Card */}
        <div style={{ flexGrow: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', display: 'flex', flexDirection: 'column', background: '#121212', overflow: 'hidden' }}>
          {/* Chart Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '70px', padding: '8px', background: '#212121', borderBottom: '2px solid #fff', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#aaaaaa', marginBottom: '4px' }}>Views</div>
              <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2px' }}>
                4.2L <span style={{ color: '#2ba640', fontSize: '10px', borderRadius: '50%', border: '1px solid #2ba640', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</span>
              </div>
              <div style={{ fontSize: '8px', color: '#aaaaaa', marginTop: '4px' }}>2.1L more than usual</div>
            </div>
            <div style={{ flex: 1, minWidth: '70px', padding: '8px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '9px', color: '#aaaaaa', marginBottom: '4px' }}>Watch time (hours)</div>
              <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2px' }}>
                14.5K <span style={{ color: '#2ba640', fontSize: '10px', borderRadius: '50%', border: '1px solid #2ba640', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</span>
              </div>
              <div style={{ fontSize: '8px', color: '#aaaaaa', marginTop: '4px' }}>750% more than previous 28 days</div>
            </div>
            <div style={{ flex: 1, minWidth: '70px', padding: '8px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '9px', color: '#aaaaaa', marginBottom: '4px' }}>Subscribers</div>
              <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2px' }}>
                +3,240 <span style={{ color: '#2ba640', fontSize: '10px', borderRadius: '50%', border: '1px solid #2ba640', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</span>
              </div>
              <div style={{ fontSize: '8px', color: '#aaaaaa', marginTop: '4px' }}>&gt;999% more than previous 28 days</div>
            </div>
            <div style={{ flex: 1, minWidth: '70px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#aaaaaa', marginBottom: '4px' }}>Estimated revenue ⓘ</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>—</div>
            </div>
          </div>

          {/* Chart SVG */}
          <div style={{ flexGrow: 1, position: 'relative', minHeight: '120px', padding: '12px' }}>
             {/* Grid Lines */}
             <div style={{ position: 'absolute', left: '16px', right: '32px', top: '16px', bottom: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
               {[1,2,3,4].map(i => <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', width: '100%', height: 0 }}></div>)}
             </div>
             
             {/* Y Axis */}
             <div style={{ position: 'absolute', right: '8px', top: '10px', bottom: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '8px', color: '#aaaaaa', textAlign: 'right' }}>
               <span>30K</span>
               <span>20K</span>
               <span>10K</span>
               <span>0</span>
             </div>

             <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ position: 'absolute', left: '16px', right: '32px', top: '16px', bottom: '32px', width: 'calc(100% - 48px)', height: 'calc(100% - 48px)', overflow: 'visible' }}>
               <defs>
                 <linearGradient id="yt-grad" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="rgba(62,166,255,0.3)"/>
                   <stop offset="100%" stopColor="rgba(62,166,255,0)"/>
                 </linearGradient>
               </defs>
               <path d="M0,140 L50,138 L100,135 L150,135 L200,120 L250,130 L300,110 L350,115 L400,60 L450,40 L500,70 L500,150 L0,150 Z" fill="url(#yt-grad)" />
               <path d="M0,140 L50,138 L100,135 L150,135 L200,120 L250,130 L300,110 L350,115 L400,60 L450,40 L500,70" fill="none" stroke="#3ea6ff" strokeWidth="2" />
             </svg>
             
             {/* X Axis */}
             <div style={{ position: 'absolute', left: '16px', right: '32px', bottom: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#aaaaaa' }}>
               <span>2 Jul</span>
               <span>7 Jul</span>
               <span>11 Jul</span>
               <span>16 Jul</span>
               <span>20 Jul</span>
               <span>25 Jul</span>
               <span>29 Jul</span>
             </div>

             {/* Little play button icons (simplified layout) */}
             <div style={{ position: 'absolute', left: '20px', right: '40px', bottom: '24px', display: 'flex', justifyContent: 'space-between', color: '#aaaaaa', fontSize: '7px' }}>
               <span>▶</span><span>▶</span><span>▶</span><span>▶</span><span>▶</span><span>▶</span><span>▶</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Realtime */}
      <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', background: '#121212', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px', textAlign: 'left' }}>Realtime</div>
        <div style={{ fontSize: '9px', color: '#aaaaaa', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#3ea6ff', marginRight: '4px' }}></span>
          Updating live
        </div>
        
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0 -12px 10px -12px' }}></div>
        
        <div style={{ textAlign: 'left', marginBottom: '10px' }}>
          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '2px' }}>15,124</div>
          <div style={{ fontSize: '10px', color: '#aaaaaa', marginBottom: '6px' }}>Subscribers</div>
          <div style={{ display: 'inline-block', padding: '3px 8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '9px', fontWeight: '500', cursor: 'pointer' }}>See live count</div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0 -12px 10px -12px' }}></div>

        <div style={{ textAlign: 'left', marginBottom: '6px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>30,000</div>
          <div style={{ fontSize: '10px', color: '#aaaaaa' }}>Views · Last 48 hours</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1px', height: '30px', width: '100%', marginBottom: '4px' }}>
          {heights.map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h * 2.5}%`, backgroundColor: '#3ea6ff', borderRadius: '1px 1px 0 0' }}></div>
          ))}
        </div>
        <div style={{ textAlign: 'right', fontSize: '8px', color: '#aaaaaa', marginBottom: '12px' }}>Now</div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0 -12px 10px -12px' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#aaaaaa', marginBottom: '8px' }}>
          <span>Top content</span>
          <span>Views</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { t: '🔥 TOP 5 Shaders for...', v: '4,881' },
            { t: '🔥 TOP 5 Shaders for...', v: '2,511' },
            { t: '🔥 TOP 5 Shaders for...', v: '2,005' },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '24px', height: '14px', backgroundColor: '#333', borderRadius: '2px' }}></div>
                <div style={{ fontSize: '9px' }}>{item.t}</div>
              </div>
              <div style={{ fontSize: '9px' }}>{item.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GoogleAnalyticsGraph = () => {
  return (
    <div className={styles.dashboardScale} style={{ display: 'flex', gap: '12px', flexDirection: 'row', width: '100%', height: '420px', background: '#0f0f0f', borderRadius: '8px', padding: '12px', boxSizing: 'border-box', color: '#fff', fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif', flexWrap: 'wrap' }}>
      
      {/* Left Card - Reports Snapshot */}
        <div style={{ flex: '1 1 350px', background: '#121212', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', marginBottom: '12px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <div style={{ flex: 1, minWidth: '70px', borderTop: '3px solid #8ab4f8', paddingTop: '6px', cursor: 'pointer', marginRight: '6px' }}>
              <div style={{ fontSize: '9px', color: '#aaaaaa', display: 'flex', alignItems: 'center' }}>Active users <span style={{fontSize:'7px', marginLeft:'2px'}}>▼</span></div>
              <div style={{ fontSize: '16px', color: '#fff', margin: '2px 0 0 0', fontWeight: '400' }}>50K</div>
              <div style={{ fontSize: '9px', color: '#81c995', fontWeight: '500' }}>↑ 42,550.0%</div>
            </div>
            <div style={{ flex: 1, minWidth: '70px', paddingTop: '6px', cursor: 'pointer', opacity: 0.7, marginRight: '6px' }}>
              <div style={{ fontSize: '9px', color: '#8ab4f8', display: 'flex', alignItems: 'center' }}>New users <span style={{fontSize:'7px', marginLeft:'2px'}}>▼</span></div>
              <div style={{ fontSize: '16px', color: '#fff', margin: '2px 0 0 0', fontWeight: '400' }}>48.2K</div>
              <div style={{ fontSize: '9px', color: '#81c995', fontWeight: '500' }}>↑ 42,700.0%</div>
            </div>
            <div style={{ flex: 1, minWidth: '70px', paddingTop: '6px', cursor: 'pointer', opacity: 0.7, marginRight: '6px' }}>
              <div style={{ fontSize: '9px', color: '#aaaaaa', display: 'flex', alignItems: 'center' }}>Key events <span style={{fontSize:'7px', marginLeft:'2px'}}>▼</span></div>
              <div style={{ fontSize: '16px', color: '#fff', margin: '2px 0 0 0', fontWeight: '400' }}>0</div>
              <div style={{ fontSize: '9px', color: '#aaaaaa' }}>-</div>
            </div>
            <div style={{ flex: 1, minWidth: '80px', paddingTop: '6px', cursor: 'pointer', opacity: 0.7 }}>
              <div style={{ fontSize: '9px', color: '#aaaaaa', display: 'flex', alignItems: 'center' }}>Average engagement t</div>
              <div style={{ fontSize: '16px', color: '#fff', margin: '2px 0 0 0', fontWeight: '400' }}>1m 45s</div>
              <div style={{ fontSize: '9px', color: '#81c995', fontWeight: '500' }}>↑ 80.2%</div>
            </div>
          </div>

          {/* Chart Area */}
          <div style={{ flexGrow: 1, position: 'relative', minHeight: '120px' }}>
            {/* Y Axis */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '8px', color: '#aaaaaa', textAlign: 'right', width: '20px' }}>
              <span>2.5k</span>
              <span>2k</span>
              <span>1.5k</span>
              <span>1k</span>
              <span>500</span>
              <span>0</span>
            </div>
            {/* Grid Lines */}
            <div style={{ position: 'absolute', left: 0, right: '24px', top: '4px', bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', width: '100%', height: 0 }}></div>)}
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', width: '100%', height: 0, borderBottomStyle: 'dashed' }}></div>
            </div>
            
            {/* SVG Line */}
            <svg viewBox="0 0 400 100" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: '24px', top: '4px', bottom: '20px', width: 'calc(100% - 24px)', height: 'calc(100% - 24px)', overflow: 'visible' }}>
               {/* Dashed line for previous period */}
               <path d="M0,98 L50,97 L100,99 L150,96 L200,98 L250,97 L300,98 L350,99 L400,98" fill="none" stroke="#8ab4f8" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
               {/* Solid line for current period */}
               <path d="M0,95 L40,92 L80,85 L120,70 L160,50 L200,60 L240,40 L280,20 L320,30 L360,15 L400,25" fill="none" stroke="#8ab4f8" strokeWidth="2" />
               {/* Current data point circle */}
               <circle cx="400" cy="25" r="3" fill="#121212" stroke="#8ab4f8" strokeWidth="2" />
            </svg>
            
            {/* X Axis */}
            <div style={{ position: 'absolute', left: 0, right: '24px', bottom: 0, display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#aaaaaa' }}>
              <span>05 Jul</span>
              <span>12</span>
              <span>19</span>
              <span>26</span>
            </div>
          </div>
          
          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '9px', color: '#aaaaaa', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }}>Last 28 days ▾</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '2px', backgroundColor: '#8ab4f8' }}></div> Last 28 days
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '2px', backgroundColor: '#8ab4f8', borderStyle: 'dashed', borderWidth: '1px 0 0 0' }}></div> Previous period
              </span>
            </div>
            <div style={{ color: '#8ab4f8', cursor: 'pointer', fontWeight: '500' }}>View reports snapshot →</div>
          </div>
        </div>

        {/* Right Card - Realtime */}
        <div style={{ flex: '0 0 200px', background: '#121212', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '8px', color: '#aaaaaa', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '2px', textTransform: 'uppercase' }}>Active users in last 30 minutes</div>
              <div style={{ fontSize: '24px', color: '#fff', marginBottom: '12px', fontWeight: '400' }}>120</div>
            </div>
            <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '2px 4px', fontSize: '8px', color: '#81c995', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ borderRadius: '50%', border: '1px solid #81c995', width: '8px', height: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '6px' }}>✓</span> ▾
            </div>
          </div>
          
          <div style={{ fontSize: '8px', color: '#aaaaaa', fontWeight: '600', letterSpacing: '0.5px', marginBottom: '6px', textTransform: 'uppercase' }}>Active users per minute</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '30px', gap: '1px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '10px' }}>
            {Array.from({length: 30}).map((_, i) => (
              <div key={i} style={{ flex: 1, backgroundColor: '#8ab4f8', height: `${Math.max(10, Math.random() * 100)}%` }}></div>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#aaaaaa', fontWeight: '600', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', textTransform: 'uppercase' }}>
            <span>Country ▾</span>
            <span>Active users ▾</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1, fontSize: '10px', color: '#fff', fontWeight: '500' }}>
            {[
              { c: 'United States', v: 84, p: '70%' },
              { c: 'United Kingdom', v: 22, p: '18%' },
              { c: 'Canada', v: 9, p: '7%' },
              { c: 'Australia', v: 5, p: '5%' }
            ].map(row => (
              <div key={row.c} style={{ position: 'relative', paddingBottom: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>{row.c}</span>
                  <span>{row.v}</span>
                </div>
                <div style={{ width: '100%', height: '2px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ width: row.p, height: '100%', backgroundColor: '#8ab4f8' }}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '9px', color: '#8ab4f8', cursor: 'pointer', fontWeight: '500' }}>
            View real time →
          </div>
        </div>

    </div>
  );
};

export default function SponsorPage() {
  return (
    <>
      <div className={styles.container}>
        {/* 1. HERO SECTION */}
        <section className={styles.hero}>
          <h1>Promote Your Bedrock/MCPE Project With Creevoxx</h1>
          <p>
            Reach thousands of active Bedrock players. Ideal for servers, shader packs, apps, hosting, or any MCPE-related brand.
          </p>
          <a href="#contact" className={styles.ctaBtn}>Book This Week's Slot</a>
        </section>

        {/* 2. STATS PROOF SECTION */}
        <section className={styles.section}>
        <h2 className={styles.sectionTitle}>The Audience</h2>
        <div className={styles.statsGrid}>
          {/* YouTube Stats */}
          <div className={styles.statCard}>
            <div className={styles.dashboardWrapper}>
              <YoutubeGraph />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', alignItems: 'baseline', marginTop: '12px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{STATS.youtubeViews48h}</span>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Avg Views / 48 Hours</span>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>•</span>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>{STATS.youtubeSubs} Subscribers — <a href={LINKS.youtubeChannel} target="_blank" rel="noreferrer" style={{color: "var(--color-accent)", textDecoration: 'none', fontWeight: '600'}}>View Channel</a></span>
            </div>
          </div>
          
          {/* Website Stats */}
          <div className={styles.statCard}>
            <div className={styles.dashboardWrapper}>
              <GoogleAnalyticsGraph />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', alignItems: 'baseline', marginTop: '12px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{STATS.websiteMonthlyVisitors}</span>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Monthly Site Visitors</span>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>•</span>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>creevoxx.dev — <a href={LINKS.website} style={{color: "var(--color-accent)", textDecoration: 'none', fontWeight: '600'}}>Visit Site</a></span>
            </div>
          </div>
        </div>
        <p className={styles.statCaption} style={{marginTop: "16px"}}>
          Stats updated {STATS.updatedDate} — screenshots available on request.
        </p>
      </section>

      {/* 3. WHO THIS IS FOR */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Who Is This For?</h2>
        <div className={styles.whoGrid}>
          <div className={styles.whoCard}>
            <div className={styles.whoIcon}>🌍</div>
            <div className={styles.whoTitle}>Server Owners</div>
            <p className={styles.statCaption}>SMPs, Minigames, Factions</p>
          </div>
          <div className={styles.whoCard}>
            <div className={styles.whoIcon}>🎨</div>
            <div className={styles.whoTitle}>Pack Creators</div>
            <p className={styles.statCaption}>Shaders & Textures</p>
          </div>
          <div className={styles.whoCard}>
            <div className={styles.whoIcon}>🛠️</div>
            <div className={styles.whoTitle}>Tools & Hosting</div>
            <p className={styles.statCaption}>Apps, utilities, hosts</p>
          </div>
          <div className={styles.whoCard}>
            <div className={styles.whoIcon}>📦</div>
            <div className={styles.whoTitle}>MCPE Brands</div>
            <p className={styles.statCaption}>Anything Bedrock related</p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Pick a Package</h3>
            <p className={styles.stepDesc}>Choose the promotional tier that fits your budget and goals from the options below.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Send Details</h3>
            <p className={styles.stepDesc}>Provide your server IP, app link, or website along with payment upfront.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Natural Integration</h3>
            <p className={styles.stepDesc}>I feature your project naturally in my videos (e.g., playing on the server or using the pack on camera).</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>4</div>
            <h3 className={styles.stepTitle}>Go Live</h3>
            <p className={styles.stepDesc}>Your link goes live in the pinned comment and description, plus site banners if included.</p>
          </div>
        </div>
      </section>


      {/* 6. BANNER PREVIEW */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Banner Placement Preview</h2>
        <div className={styles.bannerPreview}>
          <div className={styles.bannerMockup}>
            [YOUR BANNER AD HERE - 728x90 or similar]
          </div>
          <p className={styles.bannerDesc}>
            Appears prominently on resource pages and high-traffic areas of creevoxx.dev.
          </p>
        </div>
      </section>

      {/* 7. PAYMENT & TERMS */}
      <section className={styles.section}>
        <div className={styles.termsBox}>
          <h3>Payment & Terms</h3>
          <p>
            <strong>Payment Methods:</strong> [PayPal / Crypto / Bank Transfer] — Payment is required upfront before the promotional week starts.
          </p>
          <p>
            <strong>Downtime Policy:</strong> If there is an issue on your end during the sponsored week (e.g., server downtime, broken download links), promotions will continue as scheduled. No refunds will be provided for issues outside of my control. Rescheduling is available only if requested at least 48 hours before the campaign starts.
          </p>
        </div>
      </section>


      {/* 9. CONTACT / BOOKING CTA */}
      <section id="contact" className={styles.contactSection}>
        <h2 className={styles.contactTitle}>Ready to Grow Your Audience?</h2>
        <p className={styles.contactDesc}>
          Send a message to book your slot. Please include what package you're interested in and a link to your project.
        </p>
        <div className={styles.contactWarning}>
          I only take ONE sponsored slot per week. Spaces fill up fast.
        </div>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href={LINKS.contactEmail} className={styles.ctaBtn}>Email Me (realcreevoxx@gmail.com)</a>
        </div>
      </section>
    </div>
    </>
  );
}
