// Reusable Badge component
export function Badge({ children, color = 'blue' }) {
  return (
    <span className={`badge badge-${color}`}>{children}</span>
  );
}

// Status dot (green/red/yellow)
export function StatusDot({ color = 'green', live = false }) {
  return <span className={`dot dot-${live ? 'live' : color}`} />;
}

// Loading spinner
export function Spinner() {
  return <span className="spinner" />;
}

// Section title with icon
export function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="section-title">
      {Icon && <Icon size={16} className="section-icon" color="var(--blue)" />}
      {children}
    </h3>
  );
}

// Progress bar
export function ProgressBar({ value, max, color = 'blue' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress-bar">
      <div
        className={`progress-fill progress-${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// Info row (label: value)
export function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}

// Avatar initials
export function Avatar({ name, flagged = false }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return (
    <div className={`avatar ${flagged ? 'avatar-red' : ''}`}>
      {initials}
    </div>
  );
}
