import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Shield, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submit
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password, role);
    setLoading(false);

    if (result.ok) {
      navigate(role === 'proctor' ? '/proctor' : '/lobby');
    } else {
      setError(result.error);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-dark)',
      }}
    >
      {/* Animated dot grid background */}
      <div className="dot-bg" />

      {/* Login card */}
      <div
        className="glass-card"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
          margin: '0 16px',
          padding: 36,
          animation: 'fadeIn 0.6s ease-out',
        }}
      >
        {/* Logo */}
        <div className="text-center" style={{ marginBottom: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, var(--blue), var(--blue-dim))',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 0 28px var(--blue-glow)',
            }}
          >
            <Shield size={30} color="white" />
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--blue-light), var(--blue))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ExamGuard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Real-Time Examination Integrity Monitor
          </p>
        </div>

        {/* Role toggle */}
        <div className="segment" style={{ marginBottom: 20 }}>
          <button
            type="button"
            className={`segment-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => { setRole('student'); setError(''); }}
          >
            🎓 Student
          </button>
          <button
            type="button"
            className={`segment-btn ${role === 'proctor' ? 'active' : ''}`}
            onClick={() => { setRole('proctor'); setError(''); }}
          >
            🛡️ Proctor
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} color="var(--red)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--red-light)' }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              className="input"
              placeholder={role === 'student' ? 'student@exam.com' : 'proctor@exam.com'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 22, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Password
            </label>
            <input
              type={showPw ? 'text' : 'password'}
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute',
                right: 12,
                bottom: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
              }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg full-width"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Authenticating...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Enter Exam
              </>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div
          className="elevated"
          style={{ marginTop: 20, padding: '12px 14px' }}
        >
          <p
            style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Shield size={10} />
            Demo Credentials
          </p>
          <div style={{ fontSize: 12 }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Student:</span>
              <code style={{ color: 'var(--blue-light)', fontFamily: 'var(--font-mono)' }}>
                student@exam.com / student123
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Proctor:</span>
              <code style={{ color: 'var(--blue-light)', fontFamily: 'var(--font-mono)' }}>
                proctor@exam.com / proctor123
              </code>
            </div>
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          ExamGuard Security Protocol v3.0
        </p>
      </div>
    </div>
  );
}
