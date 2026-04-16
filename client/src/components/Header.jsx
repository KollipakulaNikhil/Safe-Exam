import { Shield, LogOut } from 'lucide-react';
import { Avatar, Badge, StatusDot } from './UI';

export default function Header({ user, onLogout, subtitle = 'Student Portal', live = false }) {
  return (
    <header className="app-header">
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="logo">
          <div className="logo-icon">
            <Shield size={18} color="white" />
          </div>
          <div>
            <div className="logo-text">ExamGuard</div>
            <div className="logo-sub">{subtitle}</div>
          </div>
        </div>
        {live && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusDot live />
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--success)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.5px',
              }}
            >
              LIVE
            </span>
          </div>
        )}
      </div>

      {/* Right: user info + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name={user?.name || 'User'} />
        <div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, lineHeight: 1.2 }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>
            {user?.email}
          </div>
        </div>
        <Badge color={user?.role === 'proctor' ? 'yellow' : 'blue'}>
          {user?.role?.toUpperCase()}
        </Badge>
        {onLogout && (
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>
            <LogOut size={14} />
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
}
