import { useState, useEffect, useRef } from 'react';

const PROSPECTS = [
  { initials: 'SC', name: 'Sarah Chen', title: 'Quantitative Researcher', company: 'Two Sigma', email: 's.chen@twosigma.com', color: '#7c3aed' },
  { initials: 'MW', name: 'Marcus Webb', title: 'Systematic Trader', company: 'D.E. Shaw', email: 'm.webb@deshaw.com', color: '#0d9488' },
  { initials: 'PP', name: 'Priya Patel', title: 'Quant Analyst', company: 'Citadel', email: 'p.patel@citadel.com', color: '#3b82f6' },
  { initials: 'JO', name: 'James Okafor', title: 'Portfolio Manager', company: 'Millennium', email: 'j.okafor@mlp.com', color: '#7c3aed' },
  { initials: 'EV', name: 'Elena Vasquez', title: 'Quant Strategist', company: 'Point72', email: 'e.vasquez@point72.com', color: '#0d9488' },
  { initials: 'RT', name: 'Ryan Thornton', title: 'Research Scientist', company: 'AQR', email: 'r.thornton@aqr.com', color: '#3b82f6' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STATUSES = [
  'Searching Lusha for matching contacts...',
  'Applying ICP filters...',
  'Checking CRM for duplicates...',
  'Enriching verified contacts...',
];

const S = {
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.75rem', maxWidth: 480, width: '100%', minHeight: 420, position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#f0f0f5', transition: 'opacity 0.4s ease' },
  title: { fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a8a9a', fontWeight: 600, marginBottom: 6 },
  inputWrap: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', minHeight: 38, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 14 },
  cursor: { display: 'inline-block', width: 1, height: 16, background: '#7c3aed', animation: 'pd-blink 0.8s step-end infinite', verticalAlign: 'middle', marginLeft: 1 },
  tag: (v) => ({ background: 'rgba(124,58,237,0.15)', color: '#7c3aed', padding: '3px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 500, border: '1px solid rgba(124,58,237,0.25)', opacity: v ? 1 : 0, transform: v ? 'scale(1)' : 'scale(0.7)', transition: 'all 0.25s ease' }),
  dayPill: (a) => ({ width: 36, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 600, background: a ? '#7c3aed' : 'rgba(255,255,255,0.05)', color: a ? '#fff' : '#8a8a9a', transition: 'all 0.25s ease', transform: a ? 'scale(1.05)' : 'scale(1)' }),
  btn: (pressed, loading) => ({ background: loading ? 'rgba(124,58,237,0.6)' : 'linear-gradient(135deg, #7c3aed, #9333ea)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 28px', fontSize: '0.875rem', fontWeight: 600, cursor: 'default', transform: pressed ? 'scale(0.95)' : 'scale(1)', transition: 'transform 0.15s ease', boxShadow: '0 4px 24px rgba(124,58,237,0.35)', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }),
  spinner: { display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'pd-spin 0.6s linear infinite' },
  progressBar: { position: 'absolute', top: 0, left: 0, height: 2, background: 'linear-gradient(90deg, #7c3aed, #9333ea)', transition: 'width 0.4s ease', borderRadius: 2 },
  prospectRow: (i, v) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, marginBottom: 8, opacity: v ? 1 : 0, transform: v ? 'translateX(0)' : 'translateX(40px)', transition: `all 0.5s ease ${i * 0.1}s` }),
  avatar: (c) => ({ width: 36, height: 36, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#fff', flexShrink: 0 }),
  badge: (v) => ({ background: 'rgba(22,163,74,0.15)', color: '#16a34a', padding: '2px 8px', borderRadius: 4, fontSize: '0.625rem', fontWeight: 600, marginLeft: 'auto', opacity: v ? 1 : 0, transform: v ? 'scale(1)' : 'scale(0.5)', transition: 'all 0.3s ease 0.3s', whiteSpace: 'nowrap', flexShrink: 0 }),
  stat: { textAlign: 'center', flex: 1 },
  statNum: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 },
  statLabel: { fontSize: '0.75rem', color: '#8a8a9a', marginTop: 2 },
};

export default function ProductDemo() {
  const [scene, setScene] = useState(0);
  const [tick, setTick] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef(null);

  // Scene durations in ms
  const DURATIONS = [3000, 4000, 8000, 3000];

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(interval);
  }, [scene]);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setScene(s => (s + 1) % 4);
        setTick(0);
        setFade(true);
      }, 400);
    }, DURATIONS[scene]);
    return () => clearTimeout(timerRef.current);
  }, [scene]);

  return (
    <>
      <style>{`
        @keyframes pd-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pd-spin { to{transform:rotate(360deg)} }
        @keyframes pd-glow { 0%,100%{box-shadow:0 0 30px rgba(22,163,74,0.1)} 50%{box-shadow:0 0 60px rgba(22,163,74,0.2)} }
      `}</style>
      <div style={{ ...S.card, opacity: fade ? 1 : 0, ...(scene === 3 ? { animation: 'pd-glow 2s ease infinite' } : {}) }}>
        {scene === 0 && <SceneConfig tick={tick} />}
        {scene === 1 && <SceneRunning tick={tick} />}
        {scene === 2 && <SceneResults tick={tick} />}
        {scene === 3 && <SceneSummary tick={tick} />}
      </div>
    </>
  );
}

function SceneConfig({ tick }) {
  const t = tick * 100; // ms elapsed
  const text1 = 'quant researcher';
  const text2 = 'systematic trader';
  const text3 = 'New York City';

  // Typing phase: ~60ms per char
  const typed1 = text1.substring(0, Math.floor(Math.min(t, 960) / 60));
  const tag1 = t > 1000;
  const typed2 = tag1 ? text2.substring(0, Math.floor(Math.min(t - 1100, 960) / 60)) : '';
  const tag2 = t > 2100;
  const typed3 = tag2 ? text3.substring(0, Math.floor(Math.min(t - 2200, 780) / 60)) : '';
  const tag3 = t > 2900;
  const showCursor = !tag3;

  // Days highlight one by one after tags done
  const daysStart = 2200;
  const activeDays = Math.min(5, Math.max(0, Math.floor((t - daysStart) / 120)));

  return (
    <div>
      <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 18 }}>Pipeline Setup</div>
      <div style={S.title}>Keywords</div>
      <div style={S.inputWrap}>
        {tag1 && <span style={S.tag(true)}>quant researcher</span>}
        {tag2 && <span style={S.tag(true)}>systematic trader</span>}
        {!tag1 && <><span style={{ fontSize: '0.8125rem', color: '#f0f0f5' }}>{typed1}</span>{showCursor && <span style={S.cursor} />}</>}
        {tag1 && !tag2 && <><span style={{ fontSize: '0.8125rem', color: '#f0f0f5' }}>{typed2}</span>{showCursor && <span style={S.cursor} />}</>}
      </div>
      <div style={S.title}>Location</div>
      <div style={S.inputWrap}>
        {tag3 && <span style={S.tag(true)}>New York City</span>}
        {tag2 && !tag3 && <><span style={{ fontSize: '0.8125rem', color: '#f0f0f5' }}>{typed3}</span>{showCursor && <span style={S.cursor} />}</>}
      </div>
      <div style={S.title}>Schedule</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {DAYS.map((d, i) => <span key={d} style={S.dayPill(i < activeDays)}>{d}</span>)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, position: 'relative' }}>
          <div style={{ width: '25%', height: '100%', background: '#7c3aed', borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: '0.75rem', color: '#8a8a9a', whiteSpace: 'nowrap' }}>50 prospects/run</span>
      </div>
    </div>
  );
}

function SceneRunning({ tick }) {
  const t = tick * 100;
  const pressed = t > 200 && t < 500;
  const loading = t > 500;
  const statusIdx = loading ? Math.min(3, Math.floor((t - 600) / 800)) : -1;
  const progress = loading ? Math.min(100, ((t - 500) / 3200) * 100) : 0;

  return (
    <div>
      <div style={{ ...S.progressBar, width: `${progress}%` }} />
      <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 24 }}>Pipeline Setup</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <button style={S.btn(pressed, loading)}>
          {loading && <span style={S.spinner} />}
          {loading ? 'Running...' : 'Run Now'}
        </button>
        {loading && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            {STATUSES.map((s, i) => (
              <div key={i} style={{ fontSize: '0.875rem', color: statusIdx === i ? '#f0f0f5' : 'transparent', height: statusIdx === i ? 28 : 0, overflow: 'hidden', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {statusIdx === i && <span style={S.spinner} />}
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SceneResults({ tick }) {
  const t = tick * 100;
  const headerVisible = t > 300;
  const count = Math.min(6, Math.max(0, Math.floor((t - 800) / 600)));
  // Badges appear 800ms after their card
  const badgeCount = Math.min(6, Math.max(0, Math.floor((t - 1600) / 600)));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: headerVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <span style={{ color: '#16a34a', fontSize: '1.125rem' }}>&#10003;</span>
          <span style={{ fontSize: '1rem', fontWeight: 600 }}>Run Complete</span>
        </div>
        <div style={{ background: 'rgba(124,58,237,0.15)', color: '#7c3aed', padding: '4px 12px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
          {count}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {PROSPECTS.map((p, i) => (
          <div key={i} style={S.prospectRow(i, i < count)}>
            <div style={S.avatar(p.color)}>{p.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.3 }}>{p.name}</div>
              <div style={{ fontSize: '0.6875rem', color: '#8a8a9a', lineHeight: 1.3 }}>{p.title} &middot; {p.company}</div>
              <div style={{ fontSize: '0.625rem', color: '#8a8a9a', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                <span style={{ fontSize: '0.5625rem' }}>&#9993;</span> {p.email}
              </div>
            </div>
            <div style={S.badge(i < badgeCount)}>Added to Outreach &#10003;</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneSummary({ tick }) {
  const t = tick * 100;
  const v = t > 300;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, textAlign: 'center', opacity: v ? 1 : 0, transform: v ? 'scale(1)' : 'scale(0.95)', transition: 'all 0.5s ease' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>&#10003;</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>6 prospects added</div>
      <div style={{ fontSize: '0.875rem', color: '#8a8a9a', marginBottom: 32 }}>Pipeline complete in 12 seconds</div>
      <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
        <div style={S.stat}>
          <div style={{ ...S.statNum, color: '#16a34a' }}>6</div>
          <div style={S.statLabel}>New contacts</div>
        </div>
        <div style={S.stat}>
          <div style={{ ...S.statNum, color: '#f0f0f5' }}>0</div>
          <div style={S.statLabel}>Duplicates skipped</div>
        </div>
        <div style={S.stat}>
          <div style={{ ...S.statNum, color: '#f0f0f5' }}>0</div>
          <div style={S.statLabel}>Manual work</div>
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '6px 16px', fontSize: '0.75rem', color: '#8a8a9a', fontWeight: 500 }}>
        Delivered to Outreach
      </div>
    </div>
  );
}
