import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getExams, startExam } from '../api/api';
import Header from '../components/Header';
import { ProgressBar, StatusDot } from '../components/UI';
import {
  Camera, Mic, Maximize, CheckCircle2, XCircle,
  Clock, FileText, BookOpen, ShieldCheck, AlertTriangle, ChevronRight,
} from 'lucide-react';

export default function LobbyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [exam, setExam] = useState(null);
  const [examLoading, setExamLoading] = useState(true);
  const [checks, setChecks] = useState({ camera: false, mic: false, fullscreen: false });
  const [checksLoading, setChecksLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [startError, setStartError] = useState('');

  // Fetch available exams
  useEffect(() => {
    getExams()
      .then(res => {
        if (res.data.length > 0) {
          setExam(res.data[0]); // Take the first active exam
        }
      })
      .catch(err => console.error('Failed to load exams:', err))
      .finally(() => setExamLoading(false));
  }, []);

  // Real system checks — camera/mic via getUserMedia
  useEffect(() => {
    async function runChecks() {
      const results = { camera: false, mic: false, fullscreen: false };
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        results.camera = true;
        results.mic = true;
        stream.getTracks().forEach(t => t.stop());
      } catch {
        // If permission denied, try audio only
        try {
          const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
          results.mic = true;
          audio.getTracks().forEach(t => t.stop());
        } catch {}
      }
      // Fullscreen API availability check
      results.fullscreen = !!(
        document.documentElement.requestFullscreen ||
        document.documentElement.webkitRequestFullscreen ||
        document.documentElement.mozRequestFullScreen
      );
      setChecks(results);
      setChecksLoading(false);
    }
    runChecks();
  }, []);

  // Countdown
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

  async function requestFullscreen() {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      setChecks(p => ({ ...p, fullscreen: true }));
      return true;
    } catch {
      setStartError('Fullscreen was denied. Please allow fullscreen and try again.');
      return false;
    }
  }

  async function handleStart() {
    if (!exam) return;
    setStartError('');
    // Enter fullscreen BEFORE starting
    const fsOk = await requestFullscreen();
    if (!fsOk) return;
    try {
      const res = await startExam(exam._id);
      // Store submission info for ExamPage
      localStorage.setItem('examguard_submission', JSON.stringify({
        submissionId: res.data.submissionId,
        examId: exam._id,
        answers: res.data.answers || [],
      }));
      setCountdown(3);
    } catch (err) {
      setStartError(err.response?.data?.error || 'Failed to start exam');
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (examLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="spinner" style={{ width: 32, height: 32 }} />
          <p style={{ marginTop: 16, color: 'var(--text-3)' }}>Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-0)', display: 'flex', flexDirection: 'column' }}>
        <Header user={user} onLogout={handleLogout} subtitle="Student Portal" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <FileText size={48} color="var(--text-3)" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>No Active Exams</h2>
            <p style={{ color: 'var(--text-3)' }}>There are no exams available at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  const mcqCount = exam.questions?.filter(q => q.type === 'mcq').length || 0;
  const codeCount = exam.questions?.filter(q => q.type === 'code').length || 0;
  const uploadCount = exam.questions?.filter(q => q.type === 'upload').length || 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-0)', display: 'flex', flexDirection: 'column' }}>
      <Header user={user} onLogout={handleLogout} subtitle="Student Portal" />

      {countdown !== null && (
        <div className="countdown-overlay">
          <div style={{ textAlign: 'center' }}>
            <div className="countdown-number">{countdown || 'GO'}</div>
            <p style={{ color: 'var(--text-2)', fontSize: 18, marginTop: 12 }}>Launching exam...</p>
          </div>
        </div>
      )}

      <main style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, maxWidth: 1100, margin: '0 auto', padding: '32px 24px', width: '100%', animation: 'fadeUp 0.4s ease-out' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <span className="badge badge-green" style={{ marginBottom: 10, display: 'inline-flex' }}>
              <StatusDot color="green" /> Active
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{exam.name}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
              {[
                { icon: BookOpen, label: 'Subject', value: exam.subject, color: 'var(--primary-400)' },
                { icon: Clock, label: 'Duration', value: `${exam.duration} min`, color: 'var(--warning)' },
                { icon: FileText, label: 'Questions', value: exam.questions?.length || 0, color: 'var(--success)' },
                { icon: Clock, label: 'Starts', value: new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), color: 'var(--text-3)' },
              ].map((item, i) => (
                <div key={i} className="surface" style={{ padding: 12 }}>
                  <item.icon size={16} color={item.color} style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 className="section-title"><ShieldCheck size={16} color="var(--primary-400)" /> Exam Rules & Policies</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exam.rules?.map((rule, i) => (
                <div key={i} className="surface" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                  <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 className="section-title"><ShieldCheck size={16} color="var(--primary-400)" /> System Requirements</h3>
            {[
              { label: 'Camera Access', key: 'camera', icon: Camera },
              { label: 'Microphone Access', key: 'mic', icon: Mic },
              { label: 'Fullscreen Mode', key: 'fullscreen', icon: Maximize },
            ].map(item => (
              <div key={item.key} className="surface" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <item.icon size={16} color="var(--text-2)" />
                  <span style={{ fontSize: 13 }}>{item.label}</span>
                </div>
                {checksLoading ? (
                  <span className="spinner" />
                ) : checks[item.key] ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                    <StatusDot color="green" /> Ready
                  </span>
                ) : (
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: 0 }}
                    onClick={item.key === 'fullscreen' ? requestFullscreen : undefined}>
                    <XCircle size={14} />
                    {item.key === 'fullscreen' ? 'Click to test' : 'Failed'}
                  </button>
                )}
              </div>
            ))}
            {!allOk && (
              <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--warning)', marginTop: 4 }}>
                <AlertTriangle size={13} /> Complete all checks to start
              </p>
            )}
          </div>

          {startError && (
            <div style={{ padding: '10px 12px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--danger-light)' }}>
              {startError}
            </div>
          )}

          <button className={`btn btn-lg ${allOk ? 'btn-primary' : ''}`} disabled={!allOk} onClick={handleStart}
            style={{ width: '100%', ...(allOk ? { boxShadow: '0 0 20px var(--primary-glow)' } : { background: 'var(--surface-3)', color: 'var(--text-3)', cursor: 'not-allowed' }) }}>
            <ChevronRight size={18} /> {allOk ? 'Start Exam' : 'Complete System Checks'}
          </button>

          <div className="card" style={{ padding: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Exam Format</h4>
            {[
              { label: 'MCQ Questions', count: mcqCount, color: 'var(--primary-400)' },
              { label: 'Coding Problems', count: codeCount, color: 'var(--success)' },
              { label: 'File Uploads', count: uploadCount, color: 'var(--warning)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: 'var(--text-2)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                  {item.label}
                </span>
                <span style={{ fontWeight: 700, color: item.color, fontFamily: 'var(--font-mono)' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
