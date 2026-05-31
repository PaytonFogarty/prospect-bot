// Revara wordmark: the Orion's Belt mark (three stars at their real diagonal
// positions, each with a soft glow halo) followed by the "REVARA" wordmark.
export default function Logo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width="50" height="30" viewBox="0 0 50 30">
        <circle cx="8" cy="20" r="4" fill="#7c3aed" opacity="0.95" />
        <circle cx="8" cy="20" r="9" fill="#7c3aed" opacity="0.08" />
        <circle cx="25" cy="13" r="6" fill="#a855f7" />
        <circle cx="25" cy="13" r="14" fill="#a855f7" opacity="0.09" />
        <circle cx="42" cy="7" r="3.5" fill="#7c3aed" opacity="0.9" />
        <circle cx="42" cy="7" r="8" fill="#7c3aed" opacity="0.07" />
      </svg>
      <span style={{ fontWeight: 300, letterSpacing: '4px', fontSize: 18, color: '#ffffff' }}>REVARA</span>
    </span>
  );
}
