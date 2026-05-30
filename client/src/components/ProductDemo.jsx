import { useState, useEffect, useRef, useCallback } from 'react';

/* ── Data ─────────────────────────────────────────── */
const PROSPECTS = [
  { initials: 'SC', name: 'Sarah Chen', title: 'Quantitative Researcher', company: 'Two Sigma', email: 's.chen@twosigma.com', phone: '+1 (212) 555-0142', color: '#7c3aed', match: true },
  { initials: 'MW', name: 'Marcus Webb', title: 'Systematic Trader', company: 'D.E. Shaw', email: 'm.webb@deshaw.com', phone: '+1 (212) 555-0287', color: '#0d9488', match: true },
  { initials: 'PP', name: 'Priya Patel', title: 'Quant Analyst', company: 'Citadel', email: 'p.patel@citadel.com', phone: '+1 (312) 555-0193', color: '#3b82f6', match: true },
  { initials: 'JO', name: 'James Okafor', title: 'Portfolio Manager', company: 'Millennium', email: 'j.okafor@mlp.com', phone: '+1 (212) 555-0364', color: '#7c3aed', match: true },
  { initials: 'EV', name: 'Elena Vasquez', title: 'Quant Strategist', company: 'Point72', email: 'e.vasquez@point72.com', phone: '+1 (203) 555-0418', color: '#0d9488', match: true },
  { initials: 'RT', name: 'Ryan Thornton', title: 'Research Scientist', company: 'AQR', email: 'r.thornton@aqr.com', phone: '+1 (203) 555-0529', color: '#3b82f6', match: true },
  { initials: 'DK', name: 'David Kim', title: 'Quant Developer', company: 'Jane Street', email: 'd.kim@janestreet.com', phone: '', color: '#8a8a9a', match: false },
  { initials: 'AP', name: 'Aisha Patel', title: 'Algo Trader', company: 'Virtu', email: 'a.patel@virtu.com', phone: '', color: '#8a8a9a', match: false },
];
const MATCHED = PROSPECTS.filter(p => p.match);
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SCENE_LABELS = ['Define your search', 'Scanning LinkedIn', 'Enriching and adding to CRM', 'Complete'];
const DURATIONS = [8000, 8000, 8000, 4000];

/* ── Helpers ───────────────────────────────────────── */
function typeSlice(text, elapsed, charMs = 80) {
  return text.substring(0, Math.min(text.length, Math.floor(elapsed / charMs)));
}
function isDoneTyping(text, elapsed, charMs = 80) {
  return elapsed >= text.length * charMs;
}

/* ── Styles ────────────────────────────────────────── */
const css = `
@keyframes pd-blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes pd-spin{to{transform:rotate(360deg)}}
@keyframes pd-pulse{0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.3)}50%{box-shadow:0 0 40px rgba(124,58,237,0.5)}}
@keyframes pd-glow-green{0%,100%{box-shadow:0 0 40px rgba(22,163,74,0.15)}50%{box-shadow:0 0 80px rgba(22,163,74,0.3)}}
@keyframes pd-stamp{0%{transform:scale(0.3) rotate(-8deg);opacity:0}60%{transform:scale(1.1) rotate(1deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
`;

/* ── Main Component ────────────────────────────────── */
export default function ProductDemo() {
  const [scene, setScene] = useState(0);
  const [ms, setMs] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Tick every 50ms
  useEffect(() => {
    intervalRef.current = setInterval(() => setMs(m => m + 50), 50);
    return () => clearInterval(intervalRef.current);
  }, [scene]);

  // Scene transition
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setScene(s => (s + 1) % 4);
        setMs(0);
        setFading(false);
      }, 500);
    }, DURATIONS[scene]);
    return () => clearTimeout(timeoutRef.current);
  }, [scene]);

  return (
    <>
      <style>{css}</style>
      <div style={{
        background: '#0d0d14', borderRadius: 20, padding: 0, maxWidth: 500, width: '100%',
        border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif', color: '#f0f0f5',
        ...(scene === 3 && !fading ? { animation: 'pd-glow-green 2s ease infinite' } : {}),
      }}>
        {/* Scene dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 0 0' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: scene === i ? '#7c3aed' : 'transparent',
              border: scene === i ? '2px solid #7c3aed' : '2px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
        {/* Scene label */}
        <div style={{ textAlign: 'center', padding: '12px 0 4px', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c3aed', fontWeight: 700 }}>
          Step {scene + 1} — {SCENE_LABELS[scene]}
        </div>
        {/* Content */}
        <div style={{ padding: '8px 28px 28px', minHeight: 440, opacity: fading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
          {scene === 0 && <Scene1 ms={ms} />}
          {scene === 1 && <Scene2 ms={ms} />}
          {scene === 2 && <Scene3 ms={ms} />}
          {scene === 3 && <Scene4 ms={ms} />}
        </div>
      </div>
    </>
  );
}

/* ── Scene 1: Setup ────────────────────────────────── */
function Scene1({ ms }) {
  /*
    Timeline (ms):
    0-1280       type "quant researcher" (16 chars * 80ms)
    1280-1480    tag appears
    1480-2760    type "systematic trader"
    2760-2960    tag
    2960-3960    type "quant analyst" (13 chars)
    3960-4160    tag
    4160-4660    pause before companies (500ms gap, total ~1.5s from last tag)
    4660-5460    type "Two Sigma" (9 chars)
    5460-5660    tag
    5660-6380    type "D.E. Shaw" (9 chars)
    6380-6580    tag
    6580-7140    type "Citadel" (7 chars)
    7140-7340    tag
    — trimmed to fit 8s, compress pauses —
  */
  // Keywords phase
  const kw1 = 'quant researcher';
  const kw2 = 'systematic trader';
  const kw3 = 'quant analyst';
  const kw1Start = 200;
  const kw1End = kw1Start + kw1.length * 80;
  const kw1Tag = kw1End + 150;
  const kw2Start = kw1Tag + 200;
  const kw2End = kw2Start + kw2.length * 80;
  const kw2Tag = kw2End + 150;
  const kw3Start = kw2Tag + 200;
  const kw3End = kw3Start + kw3.length * 80;
  const kw3Tag = kw3End + 150;

  // Companies phase
  const co1 = 'Two Sigma';
  const co2 = 'D.E. Shaw';
  const co3 = 'Citadel';
  const coStart = kw3Tag + 600;
  const co1End = coStart + co1.length * 80;
  const co1Tag = co1End + 150;
  const co2Start = co1Tag + 200;
  const co2End = co2Start + co2.length * 80;
  const co2Tag = co2End + 150;
  const co3Start = co2Tag + 200;
  const co3End = co3Start + co3.length * 80;
  const co3Tag = co3End + 150;

  // Location phase
  const loc = 'New York City';
  const locStart = co3Tag + 600;
  const locEnd = locStart + loc.length * 80;
  const locTag = locEnd + 150;

  // Schedule phase
  const schedStart = locTag + 600;
  const btnStart = schedStart + 1400;

  // Active typing text and cursor
  let typingText = '';
  let showCursor = false;
  if (ms >= kw1Start && ms < kw1End) { typingText = typeSlice(kw1, ms - kw1Start); showCursor = true; }
  else if (ms >= kw2Start && ms < kw2End) { typingText = typeSlice(kw2, ms - kw2Start); showCursor = true; }
  else if (ms >= kw3Start && ms < kw3End) { typingText = typeSlice(kw3, ms - kw3Start); showCursor = true; }

  let coTyping = '';
  let coCursor = false;
  if (ms >= coStart && ms < co1End) { coTyping = typeSlice(co1, ms - coStart); coCursor = true; }
  else if (ms >= co2Start && ms < co2End) { coTyping = typeSlice(co2, ms - co2Start); coCursor = true; }
  else if (ms >= co3Start && ms < co3End) { coTyping = typeSlice(co3, ms - co3Start); coCursor = true; }

  let locTyping = '';
  let locCursor = false;
  if (ms >= locStart && ms < locEnd) { locTyping = typeSlice(loc, ms - locStart); locCursor = true; }

  const activeDays = ms >= schedStart ? Math.min(5, Math.floor((ms - schedStart) / 200)) : 0;
  const showTime = ms >= schedStart + 1000;
  const showSlider = ms >= schedStart + 1200;
  const showBtn = ms >= btnStart;

  const Tag = ({ text, visible }) => (
    <span style={{ background: 'rgba(124,58,237,0.15)', color: '#7c3aed', padding: '3px 10px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 500, border: '1px solid rgba(124,58,237,0.25)', opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.5)', transition: 'all 0.3s ease', display: 'inline-block' }}>{text}</span>
  );
  const Cursor = () => <span style={{ display: 'inline-block', width: 1.5, height: 16, background: '#7c3aed', animation: 'pd-blink 0.8s step-end infinite', verticalAlign: 'middle', marginLeft: 2 }} />;
  const Label = ({ children, visible }) => (
    <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a8a9a', fontWeight: 600, marginBottom: 6, marginTop: 14, opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>{children}</div>
  );
  const InputBox = ({ children }) => (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', minHeight: 38, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>{children}</div>
  );

  return (
    <div>
      <Label visible={ms > 100}>Search Keywords</Label>
      <InputBox>
        {ms >= kw1Tag && <Tag text="quant researcher" visible />}
        {ms >= kw2Tag && <Tag text="systematic trader" visible />}
        {ms >= kw3Tag && <Tag text="quant analyst" visible />}
        {typingText && <span style={{ fontSize: '0.8125rem' }}>{typingText}</span>}
        {showCursor && <Cursor />}
      </InputBox>

      <Label visible={ms >= coStart - 400}>Target Companies</Label>
      {ms >= coStart - 400 && (
        <InputBox>
          {ms >= co1Tag && <Tag text="Two Sigma" visible />}
          {ms >= co2Tag && <Tag text="D.E. Shaw" visible />}
          {ms >= co3Tag && <Tag text="Citadel" visible />}
          {coTyping && <span style={{ fontSize: '0.8125rem' }}>{coTyping}</span>}
          {coCursor && <Cursor />}
        </InputBox>
      )}

      <Label visible={ms >= locStart - 400}>Location</Label>
      {ms >= locStart - 400 && (
        <InputBox>
          {ms >= locTag && <Tag text="New York City" visible />}
          {locTyping && <span style={{ fontSize: '0.8125rem' }}>{locTyping}</span>}
          {locCursor && <Cursor />}
        </InputBox>
      )}

      <Label visible={ms >= schedStart - 200}>Schedule</Label>
      {ms >= schedStart - 200 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {DAYS.map((d, i) => (
              <span key={d} style={{ width: 36, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 600, background: i < activeDays ? '#7c3aed' : 'rgba(255,255,255,0.05)', color: i < activeDays ? '#fff' : '#8a8a9a', transition: 'all 0.25s ease', transform: i < activeDays ? 'scale(1.08)' : 'scale(1)' }}>{d}</span>
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#8a8a9a', opacity: showTime ? 1 : 0, transition: 'opacity 0.3s ease', marginLeft: 8 }}>8:00 AM</span>
        </div>
      )}

      {showSlider && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: showSlider ? 1 : 0, transition: 'opacity 0.3s ease' }}>
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <div style={{ width: '25%', height: '100%', background: '#7c3aed', borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: '#8a8a9a', whiteSpace: 'nowrap' }}>50 prospects/run</span>
        </div>
      )}

      {showBtn && (
        <div style={{ textAlign: 'center', marginTop: 20, opacity: 1, animation: 'pd-pulse 1.5s ease infinite' }}>
          <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, #7c3aed, #9333ea)', color: '#fff', padding: '10px 32px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 24px rgba(124,58,237,0.35)' }}>Run Now</span>
        </div>
      )}
    </div>
  );
}

/* ── Scene 2: Scanning ─────────────────────────────── */
function Scene2({ ms }) {
  // Each row appears 750ms apart, scanning takes 500ms, then result
  const rowDelay = 750;
  const scanDuration = 500;

  return (
    <div>
      {/* Search bar */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#8a8a9a', fontSize: '0.8125rem' }}>&#128269;</span>
        <span style={{ fontSize: '0.8125rem', color: '#f0f0f5' }}>quant researcher New York</span>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {PROSPECTS.map((p, i) => {
          const appear = ms > i * rowDelay;
          const scanStart = i * rowDelay + 300;
          const scanning = ms > scanStart && ms < scanStart + scanDuration;
          const resolved = ms > scanStart + scanDuration;

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 8, opacity: appear ? 1 : 0, transform: appear ? 'translateY(0)' : 'translateY(12px)',
              transition: 'all 0.4s ease',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: appear ? (resolved ? p.color : '#2a2a3a') : '#2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700, color: '#fff', flexShrink: 0, transition: 'background 0.3s ease' }}>{p.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: '0.625rem', color: '#8a8a9a', lineHeight: 1.3 }}>{p.title} · {p.company}</div>
              </div>
              <div style={{ flexShrink: 0, fontSize: '0.625rem', fontWeight: 600, minWidth: 90, textAlign: 'right' }}>
                {scanning && (
                  <span style={{ color: '#8a8a9a', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, border: '1.5px solid rgba(255,255,255,0.2)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'pd-spin 0.6s linear infinite' }} />
                    scanning...
                  </span>
                )}
                {resolved && p.match && (
                  <span style={{ color: '#16a34a' }}>&#10003; Matches ICP</span>
                )}
                {resolved && !p.match && (
                  <span style={{ color: '#8a8a9a' }}>&#10005; Already in CRM</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Counter */}
      {ms > 6500 && (
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.75rem', color: '#8a8a9a', opacity: ms > 6500 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <span style={{ color: '#16a34a', fontWeight: 600 }}>6 new prospects found</span> · <span>2 skipped (already in CRM)</span>
        </div>
      )}
    </div>
  );
}

/* ── Scene 3: Enriching ────────────────────────────── */
function Scene3({ ms }) {
  const cardDelay = 1100;
  const progress = Math.min(100, (ms / 7000) * 100);
  const currentIdx = Math.min(6, Math.floor(ms / cardDelay));

  return (
    <div>
      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 6 }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #9333ea)', borderRadius: 2, width: `${progress}%`, transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ fontSize: '0.6875rem', color: '#8a8a9a', marginBottom: 14, textAlign: 'right' }}>
        Adding prospect {Math.min(6, currentIdx + 1)} of 6...
      </div>

      {/* Prospect cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MATCHED.map((p, i) => {
          const appear = ms > i * cardDelay;
          const emailStart = i * cardDelay + 400;
          const emailDone = ms > emailStart + p.email.length * 30;
          const emailTyped = appear ? typeSlice(p.email, Math.max(0, ms - emailStart), 30) : '';
          const phoneShow = ms > i * cardDelay + 600;
          const badgeShow = ms > i * cardDelay + 800;

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, opacity: appear ? 1 : 0, transform: appear ? 'translateY(0)' : 'translateY(24px)',
              transition: 'all 0.5s ease',
            }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{p.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: '0.625rem', color: '#8a8a9a', lineHeight: 1.3 }}>{p.title} · {p.company}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
                  {appear && (
                    <span style={{ fontSize: '0.5625rem', color: '#8a8a9a', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontSize: '0.5rem' }}>&#9993;</span>
                      {emailDone ? p.email : emailTyped}
                      {!emailDone && appear && <span style={{ display: 'inline-block', width: 1, height: 10, background: '#7c3aed', animation: 'pd-blink 0.8s step-end infinite' }} />}
                    </span>
                  )}
                  {phoneShow && (
                    <span style={{ fontSize: '0.5625rem', color: '#8a8a9a', display: 'flex', alignItems: 'center', gap: 3, opacity: phoneShow ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                      <span style={{ fontSize: '0.5rem' }}>&#9742;</span> {p.phone}
                    </span>
                  )}
                </div>
              </div>
              {badgeShow && (
                <span style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a', padding: '3px 8px', borderRadius: 4, fontSize: '0.5625rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, animation: 'pd-stamp 0.4s ease forwards' }}>
                  Added to Outreach &#10003;
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Scene 4: Complete ─────────────────────────────── */
function Scene4({ ms }) {
  const show = ms > 300;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 400, textAlign: 'center',
      opacity: show ? 1 : 0, transform: show ? 'scale(1)' : 'scale(0.92)',
      transition: 'all 0.6s ease',
    }}>
      {/* Checkmark circle */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(22,163,74,0.12)', border: '2px solid rgba(22,163,74,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem', color: '#16a34a', marginBottom: 20,
        boxShadow: '0 0 60px rgba(22,163,74,0.2)',
      }}>&#10003;</div>

      <div style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: 6 }}>6 prospects added to your pipeline</div>
      <div style={{ fontSize: '0.875rem', color: '#8a8a9a', marginBottom: 32 }}>Pipeline complete</div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 28 }}>
        {[
          { num: '6', label: 'New Contacts', color: '#16a34a' },
          { num: '2', label: 'Duplicates Skipped', color: '#f0f0f5' },
          { num: '0', label: 'Manual Work', color: '#f0f0f5' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, lineHeight: 1.2 }}>{s.num}</div>
            <div style={{ fontSize: '0.6875rem', color: '#8a8a9a', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Delivered to pill */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '6px 18px', fontSize: '0.75rem', color: '#8a8a9a', fontWeight: 500, marginBottom: 12 }}>
        Delivered to Outreach
      </div>

      <div style={{ fontSize: '0.75rem', color: '#555' }}>Next run: tomorrow at 8:00 AM</div>
    </div>
  );
}
