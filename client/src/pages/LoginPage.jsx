import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Shield, Eye, EyeOff, LogIn, AlertCircle, Lock } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.ok) {
      navigate(result.user.role === 'proctor' ? '/proctor' : '/lobby');
    } else {
      setError(result.error);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: 'var(--surface-0)' }}>
      <div className="mesh-bg" />

      <div className="card-glass animate-fadeUp" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, margin: '0 20px', padding: '40px 36px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, background: 'var(--primary-600)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: 'var(--shadow-md), 0 0 32px var(--primary-glow)' }}>
            <Shield size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.5px', marginBottom: 6 }}>
            ExamGuard
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-base)' }}>
            Examination Integrity Monitoring Platform
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="animate-fadeUp" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
            <AlertCircle size={16} color="var(--danger)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--text-base)', color: 'var(--danger-light)' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label className="input-label">Email Address</label>
            <input type="email" className="input" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div className="input-group" style={{ marginBottom: 28 }}>
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} className="input" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="btn-icon" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', border: 'none' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? <><span className="spinner" /> Authenticating...</> : <><LogIn size={16} /> Sign In</>}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="surface" style={{ marginTop: 24, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Lock size={10} /> Demo Credentials
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-3)' }}>Student</span>
              <code style={{ color: 'var(--primary-300)', fontFamily: 'var(--font-mono)' }}>student@exam.com / student123</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-3)' }}>Proctor</span>
              <code style={{ color: 'var(--primary-300)', fontFamily: 'var(--font-mono)' }}>proctor@exam.com / proctor123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
