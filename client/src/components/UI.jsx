// ============================================================
// UI Components — Enterprise Design System
// ============================================================

// Badge with color variant
export function Badge({ children, color = 'blue' }) {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

// Status dot
export function StatusDot({ color = 'green', live = false }) {
  return <span className={`dot ${live ? 'dot-live' : `dot-${color}`}`} />;
}

// Loading spinner
export function Spinner({ size = 16 }) {
  return <span className="spinner" style={{ width: size, height: size }} />;
}

// Section heading
export function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="section-title">
      {Icon && <Icon size={16} color="var(--primary-400)" />}
      {children}
    </h3>
  );
}

// Progress bar
export function ProgressBar({ value, max, color = 'blue' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress-track">
      <div className={`progress-fill progress-${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// Label:Value info row
export function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="info-row">
      <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {Icon && <Icon size={13} color="var(--text-3)" />}
        {label}
      </span>
      <span className="info-value">{value}</span>
    </div>
  );
}

// Avatar initials
export function Avatar({ name, flagged = false, size = 'default' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const cls = `avatar ${flagged ? 'avatar-red' : ''} ${size === 'lg' ? 'avatar-lg' : ''}`;
  return <div className={cls}>{initials}</div>;
}

// Separator line
export function Divider({ spacing = 16 }) {
  return (
    <div
      style={{
        height: 1,
        background: 'var(--border-subtle)',
        margin: `${spacing}px 0`,
      }}
    />
  );
}

// Stat box (number + label)
export function StatBox({ value, label, color = 'var(--text-1)' }) {
  return (
    <div className="surface" style={{ padding: '14px 16px', textAlign: 'center' }}>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color,
          lineHeight: 1,
          letterSpacing: '-0.5px',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}
