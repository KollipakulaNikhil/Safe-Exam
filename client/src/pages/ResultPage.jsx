import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResult } from '../api/api';
import {
  Trophy, XCircle, Code2, Upload, Shield, AlertTriangle,
  Download, ArrowLeft, BarChart3, Clock, TrendingUp, CheckCircle2,
} from 'lucide-react';
import { ProgressBar, Badge } from '../components/UI';

export default function ResultPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('examguard_result');
    if (!stored) { navigate('/lobby'); return; }

    const { submissionId, result: cachedResult } = JSON.parse(stored);

    // If we already have the full result from the submit response, use it directly
    if (cachedResult) {
      setResult(cachedResult);
      setLoading(false);
      return;
    }

    // Fallback: fetch from API (e.g. if page was refreshed)
    getResult(submissionId)
      .then(res => setResult(res.data))
      .catch(err => {
        console.error('getResult failed:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load your results. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="spinner" style={{ width: 32, height: 32 }} />
          <p style={{ marginTop: 16, color: 'var(--text-3)' }}>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--danger-bg)', border: '2px solid var(--danger-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <XCircle size={30} color="var(--danger)" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Could Not Load Results</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 8, lineHeight: 1.7 }}>{error}</p>
          <p style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 24 }}>Your exam was submitted. Please contact your proctor if this persists.</p>
          <button className="btn btn-primary" onClick={() => { localStorage.removeItem('examguard_result'); navigate('/lobby'); }}>Back to Lobby</button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const sub = result.submission;
  const score = sub.score || {};
  const integrity = sub.integrity || {};
  const pct = score.percentage || 0;

  const gradeColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--primary-400)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-0)' }}>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { localStorage.removeItem('examguard_result'); navigate('/login'); }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Exam Results</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{sub.exam?.name || 'Exam'}</div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm"><Download size={14} /> Download Report</button>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', animation: 'fadeUp 0.5s ease-out' }}>
        {/* Score card */}
        <div className="card-glass" style={{ padding: 40, textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${gradeColor}20`, border: `3px solid ${gradeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {score.passed ? <Trophy size={36} color={gradeColor} /> : <XCircle size={36} color={gradeColor} />}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{sub.exam?.name || 'Exam'}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 28 }}>{sub.exam?.subject || ''}</p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
            <div>
              <div style={{ fontSize: 52, fontWeight: 700, fontFamily: 'var(--font-mono)', color: gradeColor, lineHeight: 1 }}>{score.obtained || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>out of {score.total || 0}</div>
            </div>
            <div style={{ width: 1, height: 60, background: 'var(--border-default)' }} />
            <div>
              <div style={{ fontSize: 52, fontWeight: 700, fontFamily: 'var(--font-mono)', color: gradeColor, lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Percentage</div>
            </div>
            <div style={{ width: 1, height: 60, background: 'var(--border-default)' }} />
            <Badge color={score.passed ? 'green' : 'red'}>{score.passed ? '✓ PASSED' : '✗ FAILED'}</Badge>
          </div>
        </div>

        {/* 2-column: Section breakdown + Integrity */}
        <div className="grid-2">
          <div className="card" style={{ padding: 24 }}>
            <h3 className="section-title"><BarChart3 size={16} color="var(--primary-400)" /> Section Breakdown</h3>
            {[
              { icon: CheckCircle2, label: 'MCQ Section', color: 'var(--primary-400)', pColor: 'blue', data: score.mcq, detailFn: d => d ? `${d.answered || 0} of ${d.total || 0} answered` : '' },
              { icon: Code2, label: 'Code Section', color: 'var(--success)', pColor: 'green', data: score.code, detailFn: d => d ? `${d.answered || 0} of ${d.total || 0} solved` : '' },
              { icon: Upload, label: 'Upload Section', color: 'var(--warning)', pColor: 'yellow', data: score.upload, detailFn: d => d ? `${d.uploaded || 0} of ${d.total || 0} uploaded` : '' },
            ].map(section => (
              <div key={section.label} className="surface" style={{ padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                    <section.icon size={14} color={section.color} /> {section.label}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: section.color, fontFamily: 'var(--font-mono)' }}>
                    {section.data?.got || 0}/{section.data?.of || 0}
                  </span>
                </div>
                <ProgressBar value={section.data?.got || 0} max={section.data?.of || 1} color={section.pColor} />
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>{section.detailFn(section.data)}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 className="section-title"><Shield size={16} color="var(--primary-400)" /> Integrity Summary</h3>

            <div className="grid-3" style={{ marginBottom: 16 }}>
              {[
                { label: 'Tab Switches', value: integrity.tabSwitches || 0, color: (integrity.tabSwitches || 0) > 2 ? 'var(--warning)' : 'var(--text-2)' },
                { label: 'Flags Raised', value: integrity.flags || 0, color: (integrity.flags || 0) > 0 ? 'var(--danger)' : 'var(--success)' },
                { label: 'Risk Score', value: integrity.riskScore || 0, color: gradeColor },
              ].map(m => (
                <div key={m.label} className="surface" style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>

            {result.integrityLog && result.integrityLog.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--warning)', marginBottom: 8 }}>
                  <AlertTriangle size={12} /> Activity Log
                </h4>
                {result.integrityLog.map((entry, i) => (
                  <div key={i} className="surface" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', marginBottom: 5 }}>
                    <AlertTriangle size={11} color="var(--warning)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{entry}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={13} /> Duration</span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{result.duration}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}><TrendingUp size={13} /> Submitted At</span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString() : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
