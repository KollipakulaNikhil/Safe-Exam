import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { EXAM } from '../data';
import Header from '../components/Header';
import { ProgressBar, StatusDot } from '../components/UI';
import {
  Camera, Mic, Maximize, CheckCircle2, XCircle,
  Clock, FileText, BookOpen, ShieldCheck, AlertTriangle, ChevronRight,
} from 'lucide-react';

export default function LobbyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // System check states
  const [checks, setChecks] = useState({ camera: false, mic: false, fullscreen: false });
  const [checksLoading, setChecksLoading] = useState(true);

  // Countdown before exam
  const [countdown, setCountdown] = useState(null);

  // Simulate camera and mic detection (auto-pass after 2s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setChecks(prev => ({ ...prev, camera: true, mic: true }));
      setChecksLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer: 3 → 2 → 1 → GO → navigate
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      navigate('/exam');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  const allOk = checks.camera && checks.mic && checks.fullscreen;

  function handleFullscreenEnable() {
    setChecks(prev => ({ ...prev, fullscreen: true }));
  }

  function handleStart() {
    setCountdown(3);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const mcqCount    = EXAM.questions.filter(q => q.type === 'mcq').length;
  const codeCount   = EXAM.questions.filter(q => q.type === 'code').length;
  const uploadCount = EXAM.questions.filter(q => q.type === 'upload').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column' }}>
      <Header user={user} onLogout={handleLogout} subtitle="Student Portal" />

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="countdown-overlay">
          <div style={{ textAlign: 'center' }}>
            <div className="countdown-number">{countdown || 'GO'}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginTop: 12 }}>
              Launching exam...
            </p>
          </div>
        </div>
      )}

      {/* Main layout: 2 columns */}
      <main
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: 24,
          maxWidth: 1100,
          margin: '0 auto',
          padding: '32px 24px',
          width: '100%',
          animation: 'fadeIn 0.4s ease-out',
        }}
      >
        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Exam info card */}
          <div className="card" style={{ padding: 24 }}>
            <span className="badge badge-green" style={{ marginBottom: 10, display: 'inline-flex' }}>
              <StatusDot color="green" /> Active
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{EXAM.name}</h2>

            {/* 4 info boxes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                marginTop: 20,
              }}
            >
              {[
                { icon: BookOpen, label: 'Subject', value: EXAM.subject, color: 'var(--blue)' },
                { icon: Clock, label: 'Duration', value: `${EXAM.duration} min`, color: 'var(--yellow)' },
                { icon: FileText, label: 'Questions', value: EXAM.totalQuestions, color: 'var(--green)' },
                { icon: Clock, label: 'Starts', value: new Date(EXAM.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), color: 'var(--text-muted)' },
              ].map((item, i) => (
                <div key={i} className="elevated" style={{ padding: 12 }}>
                  <item.icon size={16} color={item.color} style={{ marginBottom: 6 }} />
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {item.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules card */}
          <div className="card" style={{ padding: 24 }}>
            <h3 className="section-title">
              <ShieldCheck size={16} color="var(--blue)" />
              Exam Rules & Policies
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {EXAM.rules.map((rule, i) => (
                <div
                  key={i}
                  className="elevated"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}
                >
                  <CheckCircle2 size={16} color="var(--green)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* System checks */}
          <div className="card" style={{ padding: 20 }}>
            <h3 className="section-title">
              <ShieldCheck size={16} color="var(--blue)" />
              System Requirements
            </h3>

            {[
              { label: 'Camera Access', key: 'camera', icon: Camera },
              { label: 'Microphone Access', key: 'mic', icon: Mic },
              { label: 'Fullscreen Mode', key: 'fullscreen', icon: Maximize },
            ].map(item => (
              <div
                key={item.key}
                className="elevated"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <item.icon size={16} color="var(--text-secondary)" />
                  <span style={{ fontSize: 13 }}>{item.label}</span>
                </div>

                {checksLoading ? (
                  <span className="spinner" />
                ) : checks[item.key] ? (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--green)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <StatusDot color="green" />
                    Ready
                  </span>
                ) : (
                  <button
                    className="btn btn-sm"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--red)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: 0,
                    }}
                    onClick={item.key === 'fullscreen' ? handleFullscreenEnable : undefined}
                  >
                    <XCircle size={14} />
                    {item.key === 'fullscreen' ? 'Click to enable' : 'Failed'}
                  </button>
                )}
              </div>
            ))}

            {!allOk && (
              <p
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: 'var(--yellow)',
                  marginTop: 4,
                }}
              >
                <AlertTriangle size={13} />
                Complete all checks to start the exam
              </p>
            )}
          </div>

          {/* Start button */}
          <button
            className={`btn btn-lg ${allOk ? 'btn-primary' : ''}`}
            disabled={!allOk}
            onClick={handleStart}
            style={{
              width: '100%',
              ...(allOk
                ? { boxShadow: '0 0 20px var(--blue-glow)' }
                : {
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-muted)',
                    cursor: 'not-allowed',
                  }),
            }}
          >
            <ChevronRight size={18} />
            {allOk ? 'Start Exam' : 'Complete System Checks'}
          </button>

          {/* Exam format breakdown */}
          <div className="card" style={{ padding: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Exam Format</h4>
            {[
              { label: 'MCQ Questions',   count: mcqCount,    color: 'var(--blue)' },
              { label: 'Coding Problems', count: codeCount,   color: 'var(--green)' },
              { label: 'File Uploads',    count: uploadCount, color: 'var(--yellow)' },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 8, height: 8,
                      borderRadius: '50%',
                      background: item.color,
                      display: 'inline-block',
                    }}
                  />
                  {item.label}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: item.color,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
