import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useSocket } from '../SocketContext';
import { getExams, getDashboard, getEvents, getStudentDetail, flagStudent as apiFlagStudent, terminateStudent as apiTerminateStudent } from '../api/api';
import Editor from '@monaco-editor/react';
import {
  Shield, Users, AlertTriangle, Activity, LogOut, Clock,
  Search, BarChart3, X, Flag, XCircle, Download, FileText,
  Code2, Upload, RefreshCw, Monitor,
} from 'lucide-react';
import { Avatar, Badge, ProgressBar, StatusDot, InfoRow } from '../components/UI';

function sevColor(s) { return s === 'CRITICAL' ? 'var(--danger)' : s === 'WARN' ? 'var(--warning)' : 'var(--primary-400)'; }
function sevBadge(s) { return s === 'CRITICAL' ? 'red' : s === 'WARN' ? 'yellow' : 'blue'; }
function riskColor(r) { return r >= 60 ? 'var(--danger)' : r >= 30 ? 'var(--warning)' : 'var(--success)'; }
function statusBadge(s) { return { active: 'green', idle: 'gray', flagged: 'red', submitted: 'blue' }[s] || 'gray'; }
function timeSince(ts) { const d = Math.round((Date.now() - new Date(ts).getTime()) / 60000); return d < 1 ? 'just now' : `${d}m ago`; }

/* ── Student Drawer ── */
function StudentDrawer({ submissionId, onClose, socket }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('timeline');
  const [confirmTerm, setConfirmTerm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getStudentDetail(submissionId)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [submissionId]);

  async function handleFlag() {
    setActionLoading(true);
    try { await apiFlagStudent(submissionId); const res = await getStudentDetail(submissionId); setData(res.data); }
    catch (err) { console.error(err); }
    setActionLoading(false);
  }

  async function handleTerminate() {
    setActionLoading(true);
    try { await apiTerminateStudent(submissionId); const res = await getStudentDetail(submissionId); setData(res.data); setConfirmTerm(false); }
    catch (err) { console.error(err); }
    setActionLoading(false);
  }

  if (loading) return (<><div className="drawer-backdrop" onClick={onClose} /><div className="drawer"><div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" style={{ width: 24, height: 24 }} /></div></div></>);
  if (!data) return null;

  const { submission, timeline } = data;
  const student = submission.student;
  const answers = submission.answers || [];
  const uploads = answers.filter(a => a.type === 'upload' && a.uploadedFile);

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        {/* Header */}
        <div style={{ padding: 20, borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={student.name} flagged={submission.integrity?.flagged} size="lg" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{student.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{student.email}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}><X size={18} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-mono)', color: riskColor(submission.integrity?.riskScore || 0), lineHeight: 1 }}>{submission.integrity?.riskScore || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Risk Score</div>
            </div>
            <div style={{ flex: 1 }}>
              <InfoRow label="Tab Switches" value={submission.integrity?.tabSwitches || 0} />
              <InfoRow label="IP Address" value={submission.ip || '—'} />
              <InfoRow label="Progress" value={`${answers.length}/${submission.exam?.questions?.length || '?'}`} />
              <InfoRow label="Status" value={submission.status} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ flexShrink: 0 }}>
          {['timeline', 'answers', 'uploads'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ flex: 1, textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {tab === 'timeline' && (
            <div className="timeline">
              {(timeline || []).map(ev => (
                <div key={ev._id} className="timeline-item">
                  <div className="timeline-dot" style={{ borderColor: sevColor(ev.severity) }}>
                    <Activity size={14} color={sevColor(ev.severity)} />
                  </div>
                  <div className="timeline-body" style={{ borderLeftColor: sevColor(ev.severity) }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Badge color={sevBadge(ev.severity)}>{ev.severity}</Badge>
                      <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{timeSince(ev.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-1)' }}>{ev.description}</p>
                  </div>
                </div>
              ))}
              {(!timeline || timeline.length === 0) && <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: 20 }}>No events recorded</p>}
            </div>
          )}

          {tab === 'answers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {answers.map((a, i) => (
                <div key={i} className="surface" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 12, fontFamily: 'var(--font-mono)' }}>Q{a.questionNum}</span>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <Badge color={a.type === 'mcq' ? 'blue' : a.type === 'code' ? 'green' : 'yellow'}>{a.type.toUpperCase()}</Badge>
                      {a.isCorrect !== undefined && <Badge color={a.isCorrect ? 'green' : 'red'}>{a.isCorrect ? '✓ Correct' : '✗ Wrong'}</Badge>}
                    </div>
                  </div>
                  {a.questionText && <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 5 }}>{a.questionText}</p>}
                  {a.type === 'mcq' && <p style={{ fontSize: 12, fontWeight: 600, color: a.isCorrect ? 'var(--success)' : 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{a.selectedOption}</p>}
                  {a.type === 'code' && a.codeAnswer && (
                    <div style={{ marginTop: 6, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                      <Editor height="100px" language={a.codeLang || 'javascript'} value={a.codeAnswer} theme="vs-dark" options={{ readOnly: true, fontSize: 11, minimap: { enabled: false }, lineNumbers: 'on', scrollBeyondLastLine: false }} />
                    </div>
                  )}
                  {a.type === 'upload' && a.uploadFileName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <FileText size={13} color="var(--primary-400)" />
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{a.uploadFileName}</span>
                    </div>
                  )}
                  <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>Score: {a.marksObtained || 0}/{a.questionMarks || '?'}</p>
                </div>
              ))}
              {answers.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: 20 }}>No answers submitted yet</p>}
            </div>
          )}

          {tab === 'uploads' && (
            <div>
              {uploads.length === 0
                ? <div style={{ textAlign: 'center', padding: 40 }}><Upload size={30} color="var(--text-3)" style={{ margin: '0 auto 8px', display: 'block' }} /><p style={{ fontSize: 13, color: 'var(--text-3)' }}>No files uploaded</p></div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {uploads.map((u, i) => (
                      <div key={i} className="surface" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={18} color="var(--warning)" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{u.uploadFileName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>Q{u.questionNum}</div>
                        </div>
                      </div>
                    ))}
                  </div>}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: 14, borderTop: '1px solid var(--border-default)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-outline-warning" style={{ width: '100%' }} onClick={handleFlag} disabled={actionLoading}>
            <Flag size={14} /> {submission.integrity?.flagged ? 'Remove Flag' : 'Flag Student'}
          </button>
          {submission.status !== 'submitted' && (
            confirmTerm ? (
              <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)', marginBottom: 6 }}>Confirm termination?</p>
                <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>This will immediately end the student's exam session.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setConfirmTerm(false)}>Cancel</button>
                  <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={handleTerminate} disabled={actionLoading}>
                    {actionLoading ? <span className="spinner" /> : <XCircle size={12} />} Terminate
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-danger" style={{ width: '100%' }} onClick={() => setConfirmTerm(true)}><XCircle size={14} /> Terminate Session</button>
            )
          )}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════
   MAIN: Proctor Dashboard
   ══════════════════════════════════ */
export default function ProctorPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const socket = useSocket();

  const [examId, setExamId] = useState(null);
  const [dashData, setDashData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [evFilter, setEvFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  // Remote desktop alerts — shown as flashing banners
  const [rdAlerts, setRdAlerts] = useState([]);

  // Load exam list, then dashboard
  useEffect(() => {
    getExams()
      .then(res => {
        if (res.data.length > 0) {
          const id = res.data[0]._id;
          setExamId(id);
          return loadDashboard(id);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Join socket room
  useEffect(() => {
    if (socket && examId && user) {
      socket.emit('join_exam', { examId, userId: user._id, role: 'proctor' });

      socket.on('new_event', (data) => {
        setEvents(prev => [data.event, ...prev]);
        if (data.studentUpdate) {
          setDashData(prev => {
            if (!prev) return prev;
            const students = prev.students.map(s =>
              s.id === data.studentUpdate.submissionId
                ? { ...s, risk: data.studentUpdate.riskScore, tabs: data.studentUpdate.tabSwitches, flagged: data.studentUpdate.flagged, status: data.studentUpdate.flagged ? 'flagged' : s.status }
                : s
            );
            return { ...prev, students };
          });
        }
      });

      // ── Remote desktop high-priority alert ──
      socket.on('remote_desktop_alert', (data) => {
        const alert = { ...data, id: Date.now() + Math.random() };
        setRdAlerts(prev => [alert, ...prev.slice(0, 4)]); // keep last 5
        // Auto-dismiss after 30 seconds
        setTimeout(() => {
          setRdAlerts(prev => prev.filter(a => a.id !== alert.id));
        }, 30000);
      });

      socket.on('student_submitted', () => { if (examId) loadDashboard(examId); });
      socket.on('student_progress', (data) => {
        setDashData(prev => {
          if (!prev) return prev;
          const students = prev.students.map(s =>
            s.name === data.studentName ? { ...s, answered: data.answeredCount } : s
          );
          return { ...prev, students };
        });
      });

      return () => { socket.off('new_event'); socket.off('remote_desktop_alert'); socket.off('student_submitted'); socket.off('student_progress'); };
    }
  }, [socket, examId, user]);

  async function loadDashboard(id) {
    try {
      const [dashRes, evRes] = await Promise.all([getDashboard(id), getEvents(id)]);
      setDashData(dashRes.data);
      setEvents(evRes.data);
    } catch (err) { console.error(err); }
  }

  async function handleRefresh() {
    if (!examId) return;
    setRefreshing(true);
    await loadDashboard(examId);
    setRefreshing(false);
  }

  function handleLogout() { logout(); navigate('/login'); }

  function openDrawer(student) { setSelectedSubmission(student.id); setDrawerOpen(true); }

  if (loading) return (<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>);

  const students = dashData?.students || [];
  const stats = dashData?.stats || {};
  const exam = dashData?.exam || {};
  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
  const filteredEvents = evFilter === 'all' ? events : events.filter(e => e.severity === evFilter.toUpperCase());

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-0)' }}>

      {/* ── Remote Desktop Alert Banners ── */}
      {rdAlerts.length > 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {rdAlerts.map(alert => (
            <div key={alert.id} style={{
              background: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
              borderBottom: '2px solid #ef4444',
              padding: '10px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Monitor size={16} color="#fca5a5" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🚨 REMOTE DESKTOP / SCREEN SHARING DETECTED
                </div>
                <div style={{ fontSize: 12, color: '#fecaca', marginTop: 2 }}>
                  <strong>{alert.studentName}</strong> ({alert.studentEmail}) — {alert.description}
                </div>
              </div>
              <span style={{ fontSize: 10, color: '#fca5a5', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                {new Date(alert.detectedAt).toLocaleTimeString()}
              </span>
              <button
                onClick={() => setRdAlerts(prev => prev.filter(a => a.id !== alert.id))}
                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: 6, cursor: 'pointer', color: '#fca5a5', display: 'flex', padding: '4px 8px', flexShrink: 0 }}
              >
                <X size={14} /> Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="logo">
            <div className="logo-icon"><Shield size={18} color="white" /></div>
            <div><div className="logo-text">ExamGuard</div><div className="logo-sub">Proctor Dashboard</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><StatusDot live /><span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>LIVE</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleRefresh} disabled={refreshing}><RefreshCw size={14} className={refreshing ? 'spinning' : ''} /> Refresh</button>
          <Avatar name={user?.name || 'Proctor'} />
          <span style={{ fontSize: 14 }}>{user?.name}</span>
          <Badge color="yellow">PROCTOR</Badge>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}><LogOut size={14} /> Sign Out</button>
        </div>
      </header>

      {/* Stats strip */}
      <div style={{ padding: '16px 24px', background: 'rgba(15,19,32,0.5)', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
        <div className="grid-4" style={{ marginBottom: 14 }}>
          {[
            { icon: Users, value: stats.activeCount || 0, label: 'Active Students', color: 'var(--success)', bg: 'var(--success-bg)' },
            { icon: AlertTriangle, value: stats.flaggedCount || 0, label: 'Flagged', color: 'var(--danger)', bg: 'var(--danger-bg)' },
            { icon: Activity, value: stats.totalTabs || 0, label: 'Tab Switches', color: 'var(--warning)', bg: 'var(--warning-bg)' },
            { icon: BarChart3, value: stats.avgRisk || 0, label: 'Avg Risk Score', color: 'var(--primary-400)', bg: 'var(--info-bg)' },
          ].map((m, i) => (
            <div key={i} className="metric-card">
              <div className="metric-icon" style={{ background: m.bg }}><m.icon size={20} color={m.color} /></div>
              <div><div className="metric-value" style={{ color: m.color }}>{m.value}</div><div className="metric-label">{m.label}</div></div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>Exam: {exam.name || 'Loading...'}</span>
          <ProgressBar value={45} max={exam.duration || 90} color="blue" />
          <span style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
            {stats.totalStudents || 0} students
          </span>
        </div>
      </div>

      {/* Main: student grid + event log */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Students */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ position: 'relative', maxWidth: 340, flex: 1 }}>
              <Search size={14} color="var(--text-3)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="input" style={{ paddingLeft: 32 }} placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{filtered.length} students</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {filtered.map(student => (
              <div key={student.id} className={`student-card ${selectedSubmission === student.id ? 'selected' : ''} ${student.flagged ? 'flagged' : ''}`} onClick={() => openDrawer(student)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={student.name} flagged={student.flagged} />
                    <div><div style={{ fontWeight: 600, fontSize: 14 }}>{student.name}</div><div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{student.email}</div></div>
                  </div>
                  <Badge color={statusBadge(student.status)}>{student.status}</Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 20 }}>
                    {[
                      { label: 'Risk', value: student.risk, color: riskColor(student.risk) },
                      { label: 'Tabs', value: student.tabs, color: student.tabs > 2 ? 'var(--warning)' : 'var(--text-2)' },
                      { label: 'Done', value: `${student.answered}/${exam.totalQuestions || '?'}`, color: 'var(--text-2)' },
                    ].map(m => (
                      <div key={m.label}><div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: m.color, lineHeight: 1 }}>{m.value}</div><div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{m.label}</div></div>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>›</span>
                </div>
                <div style={{ marginTop: 12 }}><ProgressBar value={student.risk} max={100} color={student.risk >= 60 ? 'red' : student.risk >= 30 ? 'yellow' : 'green'} /></div>
              </div>
            ))}
            {filtered.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No students found</p>}
          </div>
        </div>

        {/* Event log sidebar */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-default)', background: 'var(--surface-1)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, marginBottom: 10 }}><Activity size={14} color="var(--primary-400)" /> Event Log</h3>
            <div style={{ display: 'flex', gap: 5 }}>
              {['all', 'critical', 'warn', 'info'].map(f => (
                <button key={f} onClick={() => setEvFilter(f)} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'capitalize', fontFamily: 'var(--font-sans)', border: 'none', cursor: 'pointer', background: evFilter === f ? 'var(--primary-600)' : 'var(--surface-3)', color: evFilter === f ? '#fff' : 'var(--text-3)' }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredEvents.map(ev => (
              <div key={ev._id} className="event-row">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Badge color={sevBadge(ev.severity)}>{ev.severity}</Badge>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{timeSince(ev.createdAt)}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{ev.student?.name || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{ev.description}</div>
              </div>
            ))}
            {filteredEvents.length === 0 && <p style={{ textAlign: 'center', padding: 20, color: 'var(--text-3)', fontSize: 12 }}>No events</p>}
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && selectedSubmission && (
        <StudentDrawer submissionId={selectedSubmission} onClose={() => setDrawerOpen(false)} socket={socket} />
      )}
    </div>
  );
}
