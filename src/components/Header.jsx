import { Shield } from 'lucide-react';

// Shared top navigation bar for all student pages
export default function Header({ user, onLogout, subtitle = 'Student Portal' }) {
  const initials = user?.name?.split(' ').map(n => n[0]).join('') || '?';
  const roleColor = user?.role === 'proctor' ? 'var(--yellow)' : 'var(--blue-light)';
  const roleBg    = user?.role === 'proctor' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)';
  const roleBorder= user?.role === 'proctor' ? 'rgba(245,158,11,0.3)'  : 'rgba(59,130,246,0.3)';

  return (
    <header className="app-header">
      {/* Left: Logo */}
      <div className="logo">
        <div className="logo-icon">
          <Shield size={20} color="white" />
        </div>
        <div>
          <div className="logo-title">ExamGuard</div>
          <div className="logo-sub">{subtitle}</div>
        </div>
      </div>

      {/* Right: user info + sign out */}
      <div className="flex items-center gap-12">
        <div className="avatar">{initials}</div>
        <span style={{ fontSize: 14 }}>{user?.name}</span>

        <span
          className="badge"
          style={{ background: roleBg, color: roleColor, border: `1px solid ${roleBorder}` }}
        >
          {user?.role?.toUpperCase()}
        </span>

        {onLogout && (
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
}
