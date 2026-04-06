import { useNavigate } from 'react-router-dom';
import { RESULT } from '../data';
import {
  Trophy, XCircle, Code2, Upload, Shield, AlertTriangle,
  Download, ArrowLeft, BarChart3, Clock, TrendingUp, CheckCircle2,
} from 'lucide-react';
import { ProgressBar, Badge } from '../components/UI';

export default function ResultPage() {
  const navigate = useNavigate();
  const r = RESULT;

  // Color based on percentage
  const gradeColor =
    r.pct >= 80 ? 'var(--green)' :
    r.pct >= 60 ? 'var(--blue)' :
    r.pct >= 40 ? 'var(--yellow)' :
    'var(--red)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Header */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Exam Results</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {r.examName}
            </div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm">
          <Download size={14} /> Download Report
        </button>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', animation: 'fadeIn 0.5s ease-out' }}>
        {/* Score card */}
        <div
          className="glass-card"
          style={{ padding: 40, textAlign: 'center', marginBottom: 24 }}
        >
          {/* Icon */}
          <div
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `${gradeColor}20`,
              border: `3px solid ${gradeColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            {r.passed
              ? <Trophy size={36} color={gradeColor} />
              : <XCircle size={36} color={gradeColor} />
            }
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{r.examName}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>{r.subject}</p>

          {/* Big numbers */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
            <div>
              <div style={{ fontSize: 52, fontWeight: 700, fontFamily: 'var(--font-mono)', color: gradeColor, lineHeight: 1 }}>
                {r.obtained}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>out of {r.total}</div>
            </div>
            <div style={{ width: 1, height: 60, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 52, fontWeight: 700, fontFamily: 'var(--font-mono)', color: gradeColor, lineHeight: 1 }}>
                {r.pct}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Percentage</div>
            </div>
            <div style={{ width: 1, height: 60, background: 'var(--border)' }} />
            <Badge color={r.passed ? 'green' : 'red'} style={{ fontSize: 14, padding: '8px 16px' }}>
              {r.passed ? '✓ PASSED' : '✗ FAILED'}
            </Badge>
          </div>
        </div>

        {/* 2-column: Section breakdown + Integrity */}
        <div className="grid-2">
          {/* Section Breakdown */}
          <div className="card" style={{ padding: 24 }}>
            <h3 className="section-title">
              <BarChart3 size={16} color="var(--blue)" />
              Section Breakdown
            </h3>

            {[
              {
                icon: CheckCircle2, label: 'MCQ Section', color: 'var(--blue)',
                got: r.mcq.got, of: r.mcq.of,
                detail: `${r.mcq.answered} of ${r.mcq.total} questions answered`,
              },
              {
                icon: Code2, label: 'Code Section', color: 'var(--green)',
                got: r.code.got, of: r.code.of,
                detail: `${r.code.answered} of ${r.code.total} problems solved`,
              },
              {
                icon: Upload, label: 'Upload Section', color: 'var(--yellow)',
                got: r.upload.got, of: r.upload.of,
                detail: `${r.upload.uploaded} of ${r.upload.total} files uploaded`,
              },
            ].map(section => (
              <div
                key={section.label}
                className="elevated"
                style={{ padding: 14, marginBottom: 10 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 14, fontWeight: 600,
                    }}
                  >
                    <section.icon size={14} color={section.color} />
                    {section.label}
                  </span>
                  <span
                    style={{
                      fontWeight: 700, fontSize: 14,
                      color: section.color, fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {section.got}/{section.of}
                  </span>
                </div>
                <ProgressBar
                  value={section.got}
                  max={section.of}
                  color={
                    section.color === 'var(--blue)' ? 'blue' :
                    section.color === 'var(--green)' ? 'green' : 'yellow'
                  }
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                  {section.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Integrity Summary */}
          <div className="card" style={{ padding: 24 }}>
            <h3 className="section-title">
              <Shield size={16} color="var(--blue)" />
              Integrity Summary
            </h3>

            {/* 3 metric boxes */}
            <div className="grid-3" style={{ marginBottom: 16 }}>
              {[
                {
                  label: 'Tab Switches', value: r.integrity.tabSwitches,
                  color: r.integrity.tabSwitches > 2 ? 'var(--yellow)' : 'var(--text-secondary)',
                },
                {
                  label: 'Flags Raised', value: r.integrity.flags,
                  color: r.integrity.flags > 0 ? 'var(--red)' : 'var(--green)',
                },
                {
                  label: 'Risk Score', value: r.integrity.risk,
                  color: gradeColor,
                },
              ].map(m => (
                <div key={m.label} className="elevated" style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: m.color }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Activity log */}
            {r.integrity.log.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, fontWeight: 700, color: 'var(--yellow)',
                    marginBottom: 8,
                  }}
                >
                  <AlertTriangle size={12} />
                  Activity Log
                </h4>
                {r.integrity.log.map((entry, i) => (
                  <div
                    key={i}
                    className="elevated"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', marginBottom: 5 }}
                  >
                    <AlertTriangle size={11} color="var(--yellow)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{entry}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Meta info */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} /> Duration
                </span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{r.duration}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={13} /> Submitted At
                </span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {new Date(r.submittedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
