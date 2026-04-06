import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { STUDENTS, EVENTS, EXAM, TIMELINE } from '../data';
import Editor from '@monaco-editor/react';
import {
  Shield, Users, AlertTriangle, Activity, LogOut, Clock,
  Search, BarChart3, X, Flag, XCircle, Download, FileText,
  Code2, Upload, CheckCircle2, ArrowLeftRight, Wifi,
} from 'lucide-react';
import { Avatar, Badge, ProgressBar, StatusDot, InfoRow } from '../components/UI';

/* ─────────────────────────────────────────
   Helper: severity color
   ───────────────────────────────────────── */
function sevColor(s) {
  if (s === 'CRITICAL') return 'var(--red)';
  if (s === 'WARN') return 'var(--yellow)';
  return 'var(--blue)';
}
function sevBadge(s) {
  if (s === 'CRITICAL') return 'red';
  if (s === 'WARN') return 'yellow';
  return 'blue';
}
function riskColor(r) {
  if (r >= 60) return 'var(--red)';
  if (r >= 30) return 'var(--yellow)';
  return 'var(--green)';
}
function statusBadge(s) {
  return { active:'green', idle:'gray', flagged:'red', submitted:'blue' }[s] || 'gray';
}
function timeSince(ts) {
  const diff = Math.round((Date.now() - ts) / 60000);
  if (diff < 1) return 'just now';
  return `${diff}m ago`;
}

/* ─────────────────────────────────────────
   Component: Student Drawer
   ───────────────────────────────────────── */
function StudentDrawer({ student, onClose }) {
  const [tab, setTab] = useState('timeline');
  const [confirmTerm, setConfirmTerm] = useState(false);

  // Mock answers for the drawer
  const mockAnswers = [
    { num: 1, type: 'mcq',    text: 'BST time complexity',       selected: 'O(log n)', correct: true,  marks: '2/2' },
    { num: 2, type: 'mcq',    text: 'BFS data structure',        selected: 'Queue',    correct: true,  marks: '2/2' },
    { num: 4, type: 'mcq',    text: 'Root between subtrees',     selected: 'Preorder', correct: false, marks: '0/2' },
    {
      num: 9, type: 'code', text: 'Reverse linked list',
      code: 'function reverseList(head) {\n  let prev = null, cur = head;\n  while (cur) {\n    let next = cur.next;\n    cur.next = prev;\n    prev = cur; cur = next;\n  }\n  return prev;\n}',
      lang: 'javascript', marks: '4/5',
    },
    { num: 14, type: 'upload', text: 'Graph coloring', file: 'solution.pdf', size: '2.4 MB', marks: '—' },
  ];

  const uploads = mockAnswers.filter(a => a.type === 'upload');

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* Drawer panel */}
      <div className="drawer">
        {/* Header */}
        <div style={{ padding: 20, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={student.name} flagged={student.flagged} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{student.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {student.email}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Risk + stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: riskColor(student.risk),
                  lineHeight: 1,
                }}
              >
                {student.risk}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Risk Score</div>
            </div>
            <div style={{ flex: 1 }}>
              <InfoRow label="Tab Switches" value={student.tabs} />
              <InfoRow label="IP Address" value={student.ip} />
              <InfoRow label="Progress" value={`${student.answered}/${EXAM.totalQuestions}`} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ flexShrink: 0 }}>
          {['timeline', 'answers', 'uploads'].map(t => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
              style={{ flex: 1, textTransform: 'capitalize' }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {/* Timeline */}
          {tab === 'timeline' && (
            <div className="timeline">
              {TIMELINE.map(ev => (
                <div key={ev.id} className="timeline-item">
                  <div
                    className="timeline-icon"
                    style={{ borderColor: sevColor(ev.sev) }}
                  >
                    <Activity size={14} color={sevColor(ev.sev)} />
                  </div>
                  <div
                    className="timeline-body"
                    style={{ borderLeftColor: sevColor(ev.sev) }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <Badge color={sevBadge(ev.sev)}>{ev.sev}</Badge>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {timeSince(ev.time)}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-primary)' }}>{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Answers */}
          {tab === 'answers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mockAnswers.map((a, i) => (
                <div key={i} className="elevated" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 12, fontFamily: 'var(--font-mono)' }}>Q{a.num}</span>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <Badge color={a.type === 'mcq' ? 'blue' : a.type === 'code' ? 'green' : 'yellow'}>
                        {a.type.toUpperCase()}
                      </Badge>
                      {a.correct !== undefined && (
                        <Badge color={a.correct ? 'green' : 'red'}>
                          {a.correct ? '✓ Correct' : '✗ Wrong'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>{a.text}</p>

                  {a.type === 'mcq' && (
                    <p style={{ fontSize: 12, fontWeight: 600, color: a.correct ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                      {a.selected}
                    </p>
                  )}

                  {a.type === 'code' && (
                    <div style={{ marginTop: 6, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <Editor
                        height="100px"
                        language={a.lang}
                        value={a.code}
                        theme="vs-dark"
                        options={{
                          readOnly: true, fontSize: 11, minimap: { enabled: false },
                          lineNumbers: 'on', scrollBeyondLastLine: false,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      />
                    </div>
                  )}

                  {a.type === 'upload' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <FileText size={13} color="var(--blue)" />
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{a.file}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({a.size})</span>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', marginLeft: 'auto', display: 'flex' }}>
                        <Download size={13} />
                      </button>
                    </div>
                  )}

                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                    Score: {a.marks}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Uploads */}
          {tab === 'uploads' && (
            <div>
              {uploads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Upload size={30} color="var(--text-muted)" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No files uploaded yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {uploads.map((u, i) => (
                    <div key={i} className="elevated" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: 8,
                          background: 'rgba(245,158,11,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}
                      >
                        <FileText size={18} color="var(--yellow)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{u.file}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Q{u.num} • {u.size}
                        </div>
                      </div>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: 14, borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-warn-outline" style={{ width: '100%' }}>
            <Flag size={14} /> Flag Student for Review
          </button>

          {confirmTerm ? (
            <div
              style={{
                padding: 12, borderRadius: 'var(--radius-md)',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 6 }}>
                Confirm termination?
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                This will immediately end the student's exam session.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setConfirmTerm(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger btn-sm" style={{ flex: 1 }}>
                  <XCircle size={12} /> Terminate
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-danger" style={{ width: '100%' }} onClick={() => setConfirmTerm(true)}>
              <XCircle size={14} /> Terminate Session
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   Main: Proctor Dashboard
   ───────────────────────────────────────── */
export default function ProctorPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [evFilter, setEvFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Refresh timer
  useEffect(() => {
    const t = setInterval(() => setLastUpdate(new Date()), 5000);
    return () => clearInterval(t);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function openDrawer(student) {
    setSelectedStudent(student);
    setDrawerOpen(true);
  }

  // Filtered students
  const filtered = STUDENTS.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  // Filtered events
  const filteredEvents =
    evFilter === 'all'
      ? EVENTS
      : EVENTS.filter(e => e.severity === evFilter.toUpperCase());

  // Stats
  const activeCount  = STUDENTS.filter(s => s.status === 'active').length;
  const flaggedCount = STUDENTS.filter(s => s.flagged).length;
  const totalTabs    = STUDENTS.reduce((a, s) => a + s.tabs, 0);
  const avgRisk      = Math.round(STUDENTS.reduce((a, s) => a + s.risk, 0) / STUDENTS.length);
  const elapsed      = 45; // mock elapsed minutes

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      {/* Header */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="logo">
            <div className="logo-icon">
              <Shield size={18} color="white" />
            </div>
            <div>
              <div className="logo-title">ExamGuard</div>
              <div className="logo-sub">Proctor Dashboard</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusDot live={true} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
              Live
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <Avatar name={user?.name || 'Proctor'} />
          <span style={{ fontSize: 14 }}>{user?.name}</span>
          <span className="badge badge-yellow">PROCTOR</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Stats strip */}
      <div
        style={{
          padding: '16px 24px',
          background: 'rgba(17,24,39,0.5)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div className="grid-4" style={{ marginBottom: 14 }}>
          {[
            { icon: Users,         value: activeCount,  label: 'Active Students', color: 'var(--green)',  bg: 'rgba(34,197,94,0.12)' },
            { icon: AlertTriangle, value: flaggedCount, label: 'Flagged',          color: 'var(--red)',    bg: 'rgba(239,68,68,0.12)' },
            { icon: Activity,      value: totalTabs,    label: 'Tab Switches',     color: 'var(--yellow)', bg: 'rgba(245,158,11,0.12)' },
            { icon: BarChart3,     value: avgRisk,      label: 'Avg Risk Score',   color: 'var(--blue)',   bg: 'rgba(59,130,246,0.12)' },
          ].map((m, i) => (
            <div key={i} className="metric-card">
              <div className="metric-icon" style={{ background: m.bg }}>
                <m.icon size={20} color={m.color} />
              </div>
              <div>
                <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
                <div className="metric-label">{m.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Exam progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
            Exam Progress:
          </span>
          <ProgressBar value={elapsed} max={EXAM.duration} color="blue" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
            {elapsed}m / {EXAM.duration}m
          </span>
        </div>
      </div>

      {/* Main content: student grid + event log */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Student grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ position: 'relative', maxWidth: 340, flex: 1 }}>
              <Search
                size={14}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                className="input"
                style={{ paddingLeft: 32 }}
                placeholder="Search students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {filtered.length} students
            </span>
          </div>

          {/* Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 14,
            }}
          >
            {filtered.map(student => (
              <div
                key={student.id}
                className={`student-card ${selectedStudent?.id === student.id ? 'selected' : ''} ${student.flagged ? 'flagged' : ''}`}
                onClick={() => openDrawer(student)}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={student.name} flagged={student.flagged} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{student.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {student.email}
                      </div>
                    </div>
                  </div>
                  <Badge color={statusBadge(student.status)}>{student.status}</Badge>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 20 }}>
                    {[
                      { label: 'Risk', value: student.risk, color: riskColor(student.risk) },
                      { label: 'Tabs', value: student.tabs, color: student.tabs > 2 ? 'var(--yellow)' : 'var(--text-secondary)' },
                      { label: 'Done', value: `${student.answered}/${EXAM.totalQuestions}`, color: 'var(--text-secondary)' },
                    ].map(m => (
                      <div key={m.label}>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: m.color, lineHeight: 1 }}>
                          {m.value}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>›</span>
                </div>

                {/* Risk bar */}
                <div style={{ marginTop: 12 }}>
                  <ProgressBar
                    value={student.risk}
                    max={100}
                    color={student.risk >= 60 ? 'red' : student.risk >= 30 ? 'yellow' : 'green'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event log sidebar */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--border)',
            background: 'var(--bg-card)',
          }}
        >
          {/* Log header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              <Activity size={14} color="var(--blue)" />
              Event Log
            </h3>
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: 5 }}>
              {['all', 'critical', 'warn', 'info'].map(f => (
                <button
                  key={f}
                  onClick={() => setEvFilter(f)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    fontFamily: 'var(--font-sans)',
                    border: 'none',
                    cursor: 'pointer',
                    background: evFilter === f ? 'var(--blue)' : 'var(--bg-elevated)',
                    color: evFilter === f ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Event list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredEvents.map(ev => (
              <div key={ev.id} className="event-row">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <Badge color={sevBadge(ev.severity)}>{ev.severity}</Badge>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {timeSince(ev.time)}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{ev.student}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{ev.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student drawer */}
      {drawerOpen && selectedStudent && (
        <StudentDrawer student={selectedStudent} onClose={() => setDrawerOpen(false)} />
      )}
    </div>
  );
}
