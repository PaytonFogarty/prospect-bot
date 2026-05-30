import { useState, useEffect, useRef } from 'react';

const CONTACTS = [
  { initials: 'MT', name: 'Michael Torres', title: 'VP Sales', company: 'Apex Corp', email: 'michael.t@apex...', phone: null, emailStatus: 'ok', color: '#7c3aed', newEmail: null, newPhone: '+1 (212) 555-0147', syncLabel: 'phone added' },
  { initials: 'JW', name: 'Jennifer Walsh', title: 'Head of Growth', company: 'NovaTech', email: null, phone: null, emailStatus: 'missing', color: '#0d9488', newEmail: 'j.walsh@novatech.com', newPhone: '+1 (415) 555-0293', syncLabel: 'email + phone added' },
  { initials: 'RK', name: 'Robert Kim', title: 'Sales Director', company: 'Meridian', email: 'r.kim@oldmail.net', phone: '+1 (917) 555-0100', emailStatus: 'outdated', color: '#3b82f6', newEmail: 'r.kim@meridian.io', newPhone: null, syncLabel: 'email refreshed' },
  { initials: 'AF', name: 'Amanda Foster', title: 'CRO', company: 'Pinnacle', email: 'a.foster@pinnacle.com', phone: null, emailStatus: 'ok', color: '#7c3aed', newEmail: null, newPhone: '+1 (312) 555-0881', syncLabel: 'phone added' },
  { initials: 'CL', name: 'Christopher Lee', title: 'VP Revenue', company: 'Stellar', email: 'c.lee@old-stellar.net', phone: '+1 (650) 555-0200', emailStatus: 'outdated', color: '#0d9488', newEmail: 'c.lee@stellar.com', newPhone: null, syncLabel: 'email refreshed' },
  { initials: 'NB', name: 'Nicole Brown', title: 'Sales Manager', company: 'Vertex', email: null, phone: null, emailStatus: 'missing', color: '#3b82f6', newEmail: 'n.brown@vertex.co', newPhone: '+1 (510) 555-0734', syncLabel: 'email + phone added' },
  { initials: 'DP', name: 'David Park', title: 'Head of Sales', company: 'Quantum', email: null, phone: '+1 (408) 555-0300', emailStatus: 'missing', color: '#7c3aed', newEmail: 'd.park@quantum.ai', newPhone: null, syncLabel: 'email added' },
  { initials: 'SM', name: 'Sarah Mitchell', title: 'Director of Sales', company: 'Atlas', email: 's.mitchell@atlas.io', phone: null, emailStatus: 'ok', color: '#0d9488', newEmail: null, newPhone: '+1 (646) 555-0392', syncLabel: 'phone added' },
];

const SCENE_LABELS = ['Scanning your CRM', 'Finding fresh contact data', 'Syncing updates to Outreach', 'Complete'];
const DURATIONS = [7000, 7000, 6000, 4000];

const css = `
@keyframes rd-blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes rd-spin{to{transform:rotate(360deg)}}
@keyframes rd-glow{0%,100%{box-shadow:0 0 40px rgba(124,58,237,0.12)}50%{box-shadow:0 0 70px rgba(124,58,237,0.25)}}
@keyframes rd-stamp{0%{transform:scale(0.3);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes rd-packet{0%{left:0;opacity:0}10%{opacity:1}90%{opacity:1}100%{left:calc(100% - 8px);opacity:0}}
`;

export default function RefreshDemo() {
  const [scene, setScene] = useState(0);
  const [ms, setMs] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setMs(m => m + 50), 50);
    return () => clearInterval(id);
  }, [scene]);

  useEffect(() => {
    const t = setTimeout(() => {
      setFading(true);
      setTimeout(() => { setScene(s => (s + 1) % 4); setMs(0); setFading(false); }, 500);
    }, DURATIONS[scene]);
    return () => clearTimeout(t);
  }, [scene]);

  return (
    <>
      <style>{css}</style>
      <div style={{
        background: '#0d0d14', borderRadius: 20, maxWidth: 500, width: '100%',
        border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif', color: '#f0f0f5',
        ...(scene === 3 && !fading ? { animation: 'rd-glow 2s ease infinite' } : {}),
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 0 0' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: scene === i ? '#7c3aed' : 'transparent', border: scene === i ? '2px solid #7c3aed' : '2px solid rgba(255,255,255,0.2)', transition: 'all 0.3s ease' }} />
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '12px 0 4px', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c3aed', fontWeight: 700 }}>
          Step {scene + 1} — {SCENE_LABELS[scene]}
        </div>
        <div style={{ padding: '8px 28px 28px', minHeight: 440, opacity: fading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
          {scene === 0 && <ScanScene ms={ms} />}
          {scene === 1 && <UpdateScene ms={ms} />}
          {scene === 2 && <SyncScene ms={ms} />}
          {scene === 3 && <CompleteScene ms={ms} />}
        </div>
      </div>
    </>
  );
}

function ContactRow({ c, visible, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.4s ease' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{c.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3 }}>{c.name}</div>
        <div style={{ fontSize: '0.5625rem', color: '#8a8a9a', lineHeight: 1.3 }}>{c.title} · {c.company}</div>
      </div>
      {children}
    </div>
  );
}

function DataCell({ label, value, status }) {
  if (!value && status === 'missing') return <span style={{ fontSize: '0.5625rem', color: '#555' }}>—</span>;
  if (status === 'outdated') return <span style={{ fontSize: '0.5625rem', color: '#f87171' }}>&#9888; outdated</span>;
  if (value) return <span style={{ fontSize: '0.5625rem', color: '#8a8a9a' }}>{value.length > 22 ? value.slice(0, 22) + '...' : value}</span>;
  return <span style={{ fontSize: '0.5625rem', color: '#555' }}>—</span>;
}

function Spinner() {
  return <span style={{ display: 'inline-block', width: 10, height: 10, border: '1.5px solid rgba(255,255,255,0.15)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'rd-spin 0.6s linear infinite' }} />;
}

/* ── Scene 1: Scanning CRM ─────────────────────────── */
function ScanScene({ ms }) {
  const rowDelay = 650;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Your CRM — 847 contacts</span>
        <span style={{ fontSize: '0.625rem', color: '#8a8a9a' }}>Outreach</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {CONTACTS.map((c, i) => {
          const appear = ms > i * rowDelay;
          const checkStart = i * rowDelay + 400;
          const checking = ms > checkStart && ms < checkStart + 800;
          return (
            <ContactRow key={i} c={c} visible={appear}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, minWidth: 80 }}>
                <DataCell value={c.email} status={c.emailStatus} />
                <DataCell value={c.phone ? c.phone.slice(0, 16) : null} status={c.phone ? 'ok' : 'missing'} />
              </div>
              <div style={{ width: 20, display: 'flex', justifyContent: 'center' }}>
                {checking && <Spinner />}
              </div>
            </ContactRow>
          );
        })}
      </div>
      {ms > 5500 && (
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.6875rem', color: '#8a8a9a', opacity: 1, transition: 'opacity 0.4s ease' }}>
          Scanning 847 contacts...
        </div>
      )}
    </div>
  );
}

/* ── Scene 2: Finding Updates ──────────────────────── */
function UpdateScene({ ms }) {
  const rowDelay = 750;

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {CONTACTS.map((c, i) => {
          const searchStart = i * rowDelay;
          const searching = ms > searchStart && ms < searchStart + 500;
          const resolved = ms > searchStart + 500;
          const typeStart = searchStart + 550;

          // Determine what's new
          const hasNewEmail = !!c.newEmail;
          const hasNewPhone = !!c.newPhone;
          const emailText = hasNewEmail ? c.newEmail : c.email;
          const phoneText = hasNewPhone ? c.newPhone : (c.phone || null);
          const emailTyped = hasNewEmail && resolved ? c.newEmail.substring(0, Math.min(c.newEmail.length, Math.floor(Math.max(0, ms - typeStart) / 25))) : null;
          const emailDone = hasNewEmail && resolved && ms > typeStart + c.newEmail.length * 25;
          const phoneDone = resolved && ms > typeStart + 300;
          const badgeShow = resolved && ms > searchStart + 900;

          return (
            <ContactRow key={i} c={c} visible>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, minWidth: 90, flex: '0 0 auto' }}>
                {/* Email line */}
                <span style={{ fontSize: '0.5625rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                  {hasNewEmail && resolved ? (
                    <span style={{ color: '#16a34a' }}>
                      {emailDone ? c.newEmail : emailTyped}
                      {!emailDone && <span style={{ display: 'inline-block', width: 1, height: 9, background: '#7c3aed', animation: 'rd-blink 0.8s step-end infinite', marginLeft: 1 }} />}
                    </span>
                  ) : (
                    <DataCell value={emailText} status={c.emailStatus} />
                  )}
                </span>
                {/* Phone line */}
                <span style={{ fontSize: '0.5625rem' }}>
                  {hasNewPhone && phoneDone ? (
                    <span style={{ color: '#16a34a', transition: 'opacity 0.3s ease' }}>{c.newPhone}</span>
                  ) : (
                    <DataCell value={phoneText} status={phoneText ? 'ok' : 'missing'} />
                  )}
                </span>
              </div>
              <div style={{ width: 56, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                {searching && <span style={{ fontSize: '0.5rem', color: '#8a8a9a', display: 'flex', alignItems: 'center', gap: 3 }}><Spinner /></span>}
                {badgeShow && <span style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a', padding: '2px 6px', borderRadius: 4, fontSize: '0.5rem', fontWeight: 600, animation: 'rd-stamp 0.35s ease forwards', whiteSpace: 'nowrap' }}>Updated</span>}
              </div>
            </ContactRow>
          );
        })}
      </div>
    </div>
  );
}

/* ── Scene 3: Syncing ──────────────────────────────── */
function SyncScene({ ms }) {
  const lineDelay = 600;
  const progress = Math.min(100, (ms / 5200) * 100);
  const visibleLines = Math.min(8, Math.floor(ms / lineDelay));

  // Packet animation: cycle every 1200ms
  const packetPhase = (ms % 1200) / 1200;

  return (
    <div>
      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 16 }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #9333ea)', borderRadius: 2, width: `${progress}%`, transition: 'width 0.3s ease' }} />
      </div>

      {/* Sync visualization */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, padding: '0 20px' }}>
        <div style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 999, padding: '6px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', flexShrink: 0 }}>Lusha</div>
        <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.08)', position: 'relative', margin: '0 4px' }}>
          {/* Animated packets */}
          {[0, 1, 2].map(p => (
            <div key={p} style={{
              position: 'absolute', top: -3, width: 8, height: 8, borderRadius: '50%',
              background: '#7c3aed', boxShadow: '0 0 8px rgba(124,58,237,0.5)',
              left: `${((packetPhase + p * 0.33) % 1) * 100}%`,
              opacity: ms > 300 ? 0.9 : 0,
              transition: 'opacity 0.3s ease',
            }} />
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '6px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#8a8a9a', flexShrink: 0 }}>Outreach</div>
      </div>

      {/* Sync log */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {CONTACTS.map((c, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
            fontSize: '0.75rem',
            opacity: i < visibleLines ? 1 : 0,
            transform: i < visibleLines ? 'translateX(0)' : 'translateX(-20px)',
            transition: 'all 0.4s ease',
          }}>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>&#10003;</span>
            <span style={{ fontWeight: 600 }}>{c.name}</span>
            <span style={{ color: '#8a8a9a' }}>— {c.syncLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Scene 4: Complete ─────────────────────────────── */
function CompleteScene({ ms }) {
  const show = ms > 300;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 400, textAlign: 'center',
      opacity: show ? 1 : 0, transform: show ? 'scale(1)' : 'scale(0.92)',
      transition: 'all 0.6s ease',
    }}>
      {/* Refresh icon */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(124,58,237,0.12)', border: '2px solid rgba(124,58,237,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.75rem', color: '#7c3aed', marginBottom: 20,
        boxShadow: '0 0 60px rgba(124,58,237,0.2)',
      }}>&#8635;</div>

      <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>847 contacts scanned</div>
      <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>8 records updated</div>
      <div style={{ fontSize: '0.8125rem', color: '#8a8a9a', marginBottom: 28 }}>Your CRM is up to date</div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { num: '5', label: 'Emails added/refreshed' },
          { num: '6', label: 'Phones added' },
          { num: '0', label: 'Manual work' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2, color: i === 2 ? '#f0f0f5' : '#16a34a' }}>{s.num}</div>
            <div style={{ fontSize: '0.625rem', color: '#8a8a9a', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.75rem', color: '#555' }}>Run automatically or on demand anytime.</div>
    </div>
  );
}
