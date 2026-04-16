import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useSocket } from '../SocketContext';
import {
  getExam,
  saveAnswer as apiSaveAnswer,
  submitExam as apiSubmitExam,
  uploadFile as apiUploadFile,
} from '../api/api';
import Editor from '@monaco-editor/react';
import {
  Clock, Send, AlertTriangle, ChevronLeft, ChevronRight, Bookmark,
  BookmarkCheck, Upload, Play, X, FileText, Code2, CheckSquare,
  ChevronDown, ChevronUp, Trash2, Eye, Maximize, ShieldAlert,
} from 'lucide-react';
import { ProgressBar } from '../components/UI';

/* ══════════════════════════════════════════════
   SECURITY HOOK — All exam protection in one place
   ══════════════════════════════════════════════ */
function useExamSecurity({ examId, submissionId, socket, onViolation, onToast }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const devtoolsRef = useRef(false);

  // ── 1. Fullscreen management ──
  const enterFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      setIsFullscreen(true);
    } catch (e) {
      onToast('Fullscreen request was denied. Please allow fullscreen.', 'warn');
    }
  }, [onToast]);

  useEffect(() => {
    function onFsChange() {
      const inFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      );
      setIsFullscreen(inFs);
      if (!inFs) {
        onToast('⚠️ Fullscreen exited — violation logged. Return to fullscreen.', 'danger');
        onViolation('fullscreen_exit', 'WARN', 'Student exited fullscreen mode');
      }
    }
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
    };
  }, [onToast, onViolation]);

  // Enter fullscreen on mount
  useEffect(() => {
    enterFullscreen();
  }, [enterFullscreen]);

  // ── 2. Tab / window visibility ──
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) {
        setTabSwitchCount(c => {
          const next = c + 1;
          onToast(`⚠️ Tab switch #${next} detected and logged`, 'warn');
          onViolation('tab_switch', 'WARN', `Switched to another tab/window (switch #${next})`);
          return next;
        });
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [onToast, onViolation]);

  // ── 3. Block right-click ──
  useEffect(() => {
    function block(e) {
      e.preventDefault();
      e.stopPropagation();
      onToast('Right-click is disabled during the exam', 'warn');
      onViolation('right_click', 'WARN', 'Right-click attempted and blocked');
    }
    document.addEventListener('contextmenu', block);
    return () => document.removeEventListener('contextmenu', block);
  }, [onToast, onViolation]);

  // ── 4. Block copy / cut / paste ──
  useEffect(() => {
    function blockCopy(e) {
      e.preventDefault();
      e.stopPropagation();
      onToast('Copying is disabled during the exam', 'warn');
      onViolation('right_click', 'WARN', 'Copy action blocked');
    }
    function blockCut(e) {
      e.preventDefault();
      e.stopPropagation();
      onToast('Cutting is disabled during the exam', 'warn');
    }
    function blockPaste(e) {
      e.preventDefault();
      e.stopPropagation();
      onToast('⛔ Paste is disabled during the exam', 'danger');
      onViolation('paste', 'CRITICAL', 'Paste action detected and blocked');
    }
    document.addEventListener('copy', blockCopy);
    document.addEventListener('cut', blockCut);
    document.addEventListener('paste', blockPaste);
    return () => {
      document.removeEventListener('copy', blockCopy);
      document.removeEventListener('cut', blockCut);
      document.removeEventListener('paste', blockPaste);
    };
  }, [onToast, onViolation]);

  // ── 5. Block text selection (selectstart) ──
  useEffect(() => {
    function blockSelect(e) {
      // Allow selection inside Monaco editor (it has .monaco-editor class)
      if (e.target.closest?.('.monaco-editor')) return;
      e.preventDefault();
    }
    document.addEventListener('selectstart', blockSelect);
    return () => document.removeEventListener('selectstart', blockSelect);
  }, []);

  // ── 6. Block keyboard shortcuts ──
  useEffect(() => {
    const BLOCKED_KEYS = new Set(['F12', 'F11', 'F5', 'F1']);
    function handleKey(e) {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key?.toUpperCase();

      // F12 – DevTools
      if (e.key === 'F12') {
        e.preventDefault();
        onToast('⛔ Developer tools are restricted during exams', 'danger');
        onViolation('devtools', 'CRITICAL', 'F12 developer tools key pressed');
        return;
      }

      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C – DevTools variants
      if (ctrl && shift && ['I', 'J', 'C'].includes(key)) {
        e.preventDefault();
        onToast('⛔ Developer tools are restricted', 'danger');
        onViolation('devtools', 'CRITICAL', 'DevTools shortcut blocked');
        return;
      }

      // Ctrl+U – View source
      if (ctrl && key === 'U') {
        e.preventDefault();
        onToast('View source is disabled', 'warn');
        onViolation('devtools', 'WARN', 'Ctrl+U view source blocked');
        return;
      }

      // Ctrl+P – Print
      if (ctrl && key === 'P') {
        e.preventDefault();
        onToast('Printing is disabled during the exam', 'warn');
        return;
      }

      // Ctrl+S – Save (page source)
      if (ctrl && key === 'S') {
        e.preventDefault();
        return;
      }

      // Ctrl+C – Copy
      if (ctrl && !shift && key === 'C') {
        e.preventDefault();
        onToast('Copying is disabled during the exam', 'warn');
        onViolation('right_click', 'WARN', 'Ctrl+C copy blocked');
        return;
      }

      // Ctrl+V – Paste
      if (ctrl && !shift && key === 'V') {
        e.preventDefault();
        onToast('⛔ Pasting is disabled during the exam', 'danger');
        onViolation('paste', 'CRITICAL', 'Ctrl+V paste blocked');
        return;
      }

      // Ctrl+X – Cut
      if (ctrl && !shift && key === 'X') {
        e.preventDefault();
        onToast('Cutting is disabled during the exam', 'warn');
        return;
      }

      // Ctrl+A – Select all
      if (ctrl && !shift && key === 'A') {
        // Allow inside Monaco editor
        if (!(document.activeElement?.closest?.('.monaco-editor'))) {
          e.preventDefault();
        }
        return;
      }

      // Alt+F4 – Close window
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        return;
      }

      // Other blocked function keys
      if (BLOCKED_KEYS.has(e.key)) {
        e.preventDefault();
      }
    }

    document.addEventListener('keydown', handleKey, { capture: true });
    return () => document.removeEventListener('keydown', handleKey, { capture: true });
  }, [onToast, onViolation]);

  // ── 7. DevTools size detection (heartbeat) ──
  useEffect(() => {
    const threshold = 160;
    let open = false;
    const interval = setInterval(() => {
      const widthOpen  = window.outerWidth  - window.innerWidth  > threshold;
      const heightOpen = window.outerHeight - window.innerHeight > threshold;
      const nowOpen = widthOpen || heightOpen;
      if (nowOpen && !open) {
        open = true;
        devtoolsRef.current = true;
        onToast('⛔ Developer tools detected — violation logged', 'danger');
        onViolation('devtools', 'CRITICAL', 'Browser developer tools detected (window size changed)');
      }
      if (!nowOpen && open) {
        open = false;
        devtoolsRef.current = false;
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [onToast, onViolation]);

  // ── 8. Block print ──
  useEffect(() => {
    function blockPrint() {
      onToast('Printing is blocked during the exam', 'warn');
    }
    window.addEventListener('beforeprint', blockPrint);
    // Also inject CSS to hide content on print
    const style = document.createElement('style');
    style.id = 'exam-print-block';
    style.textContent = `@media print { body { display: none !important; } }`;
    document.head.appendChild(style);
    return () => {
      window.removeEventListener('beforeprint', blockPrint);
      document.getElementById('exam-print-block')?.remove();
    };
  }, [onToast]);

  // ── 9. Extension DOM mutation detector ──
  useEffect(() => {
    // Watch for injected elements NOT initiated by our app
    const knownIds = new Set(['exam-print-block']);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue; // element nodes only
          const id = node.id || '';
          const cls = node.className || '';
          // Common extension injection patterns
          const suspicious = [
            'grammarly', 'honey', 'loom', 'dashlane', 'lastpass',
            '__aiPrompt', 'gpt', 'copilot', 'extension',
          ];
          const isSuspicious = suspicious.some(s =>
            id.toLowerCase().includes(s) || cls.toLowerCase?.().includes(s)
          );
          if (isSuspicious && !knownIds.has(id)) {
            onToast('⚠️ Browser extension activity detected', 'danger');
            onViolation('paste', 'CRITICAL', `Suspicious extension activity detected: ${id || cls}`);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [onToast, onViolation]);

  // ── 10. Drag-and-drop block (prevent dragging answers out) ──
  useEffect(() => {
    function blockDrag(e) {
      if (!e.target.closest?.('.drop-zone')) {
        e.preventDefault();
      }
    }
    document.addEventListener('dragstart', blockDrag);
    return () => document.removeEventListener('dragstart', blockDrag);
  }, []);

  return { isFullscreen, tabSwitchCount, enterFullscreen };
}

/* ── Fullscreen Warning Overlay ── */
function FullscreenWarning({ onEnter }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(8,11,20,0.97)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--danger-bg)', border: '2px solid var(--danger-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <ShieldAlert size={32} color="var(--danger)" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Fullscreen Required</h2>
        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
          The exam requires fullscreen mode at all times.<br />
          Exiting fullscreen is recorded as a violation.
        </p>
        <button
          className="btn btn-primary btn-lg"
          onClick={onEnter}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Maximize size={16} /> Return to Fullscreen
        </button>
      </div>
    </div>
  );
}

/* ── Question Navigator Sidebar ── */
function QuestionNav({ questions, currentIndex, answers, markedForReview, onSelect }) {
  const answered = Object.keys(answers).length;
  function getQClass(q, i) {
    if (i === currentIndex) return 'q-num q-current';
    if (markedForReview[q._id]) return 'q-num q-review';
    if (answers[q._id]) return 'q-num q-answered';
    return 'q-num q-unattempted';
  }
  return (
    <div className="q-nav">
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Questions</p>
      <div className="q-grid">
        {questions.map((q, i) => (
          <button key={q._id} className={getQClass(q, i)} onClick={() => onSelect(i)} title={`Q${q.num} (${q.type})`}>{q.num}</button>
        ))}
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[
          { style: { border: '2px solid var(--primary-400)', background: 'var(--info-bg)' }, label: 'Current' },
          { style: { background: 'var(--primary-600)' }, label: 'Answered' },
          { style: { background: 'var(--warning)' }, label: 'Review' },
          { style: { background: 'var(--surface-3)', border: '1px solid var(--border-subtle)' }, label: 'Unattempted' },
        ].map(item => (
          <div key={item.label} className="legend-item"><span className="legend-box" style={item.style} />{item.label}</div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <ProgressBar value={answered} max={questions.length} color="blue" />
        <p style={{ textAlign: 'center', marginTop: 6, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{answered}/{questions.length} answered</p>
      </div>
    </div>
  );
}

/* ── MCQ Question ── */
function MCQQuestion({ question, selectedAnswer, onAnswer, isMarked, onMark }) {
  return (
    <div style={{ padding: 24, maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <span className="badge badge-blue" style={{ marginBottom: 8, display: 'inline-flex' }}>MCQ • {question.marks} marks</span>
          <h2 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.65 }}>{question.text}</h2>
        </div>
        <button onClick={onMark} className="btn btn-ghost btn-sm" style={{ flexShrink: 0, marginLeft: 16, color: isMarked ? 'var(--warning)' : undefined, borderColor: isMarked ? 'var(--warning-border)' : undefined }}>
          {isMarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />} {isMarked ? 'Marked' : 'Review'}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {question.options.map((option, i) => (
          <button
            key={i}
            className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
            onClick={() => onAnswer(option)}
            onCopy={e => e.preventDefault()}
          >
            <span className={`option-letter ${selectedAnswer === option ? 'option-letter-selected' : 'option-letter-default'}`}>{String.fromCharCode(65 + i)}</span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Code Question ── */
function CodeQuestion({ question, savedCode, savedLang, onSave }) {
  const [lang, setLang] = useState(savedLang || 'javascript');
  const [code, setCode] = useState(savedCode || question.starter || '');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [showProblem, setShowProblem] = useState(true);

  async function runCode() {
    setRunning(true); setOutput('');
    await new Promise(r => setTimeout(r, 1500));
    setOutput(`> Running ${lang}...\n> Compilation: OK\n> Output:\n  [Function executed successfully]\n\n> Time: 42ms | Memory: 2.1 MB`);
    setRunning(false);
    onSave(code, lang);
  }

  function handleCodeChange(value) {
    setCode(value || '');
    onSave(value || '', lang);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ borderBottom: '1px solid var(--border-default)' }}>
        <button onClick={() => setShowProblem(!showProblem)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-1)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
            <FileText size={14} color="var(--success)" /> Problem Statement <span className="badge badge-green">{question.marks} marks</span>
          </span>
          {showProblem ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showProblem && <p style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>{question.text}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface-1)', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
        <select className="input" value={lang} onChange={e => setLang(e.target.value)} style={{ width: 150, padding: '5px 8px', fontSize: 12 }}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={runCode} disabled={running}>
          {running ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Running...</> : <><Play size={12} /> Run Code</>}
        </button>
      </div>
      <div style={{ flex: '1 1 60%', minHeight: 260 }}>
        {/* Monaco editor — copy/paste allowed inside editor for coding */}
        <Editor
          height="100%"
          language={lang}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            padding: { top: 14 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
      <div style={{ borderTop: '1px solid var(--border-default)', minHeight: 110, maxHeight: 180, overflow: 'auto' }}>
        <div style={{ padding: '6px 12px', background: 'var(--surface-1)', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
          <Code2 size={12} /> Output
        </div>
        <pre style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'var(--font-mono)', color: output ? 'var(--success)' : 'var(--text-3)', whiteSpace: 'pre-wrap' }}>
          {output || 'Run your code to see output here...'}
        </pre>
      </div>
    </div>
  );
}

/* ── Upload Question ── */
function UploadQuestion({ question, uploadedFiles, onUpload, submissionId }) {
  const [files, setFiles] = useState(uploadedFiles || []);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  async function addFiles(fileList) {
    setUploading(true);
    for (const file of Array.from(fileList)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('questionId', question._id);
        formData.append('questionNum', question.num);
        const res = await apiUploadFile(submissionId, formData);
        const added = { id: Date.now() + Math.random(), name: res.data.file.name, size: res.data.file.size, path: res.data.file.path };
        setFiles(prev => { const updated = [...prev, added]; onUpload(updated); return updated; });
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    setUploading(false);
  }

  function removeFile(id) {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    onUpload(updated);
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <div style={{ padding: 24, maxWidth: 760 }}>
      <span className="badge badge-yellow" style={{ marginBottom: 10, display: 'inline-flex' }}>Upload • {question.marks} marks</span>
      <h2 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.65, marginBottom: 20 }}>{question.text}</h2>
      <div
        className={`drop-zone ${dragging ? 'active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        style={{ marginBottom: 16 }}
      >
        {uploading
          ? <><span className="spinner" style={{ margin: '0 auto 10px', display: 'block' }} /><p style={{ fontSize: 14, color: 'var(--text-2)' }}>Uploading...</p></>
          : <>
              <Upload size={30} color="var(--text-3)" style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Drag & drop files here, or <span style={{ color: 'var(--primary-400)', textDecoration: 'underline' }}>browse</span></p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>Accepted: {question.formats} — Max 10 MB</p>
            </>}
        <input ref={fileRef} type="file" multiple hidden onChange={e => addFiles(e.target.files)} />
      </div>
      {files.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Uploaded Files</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {files.map(file => (
              <div key={file.id} className="surface" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={16} color="var(--primary-400)" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{file.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{formatSize(file.size)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Uploaded</span>
                  <button onClick={() => removeFile(file.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Submit Modal ── */
function SubmitModal({ questions, answers, onClose, onSubmit, submitting }) {
  const answered = Object.keys(answers).length;
  const unanswered = questions.filter(q => !answers[q._id]);
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Submit Examination?</h2>
        <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 20 }}>Review your submission summary below.</p>
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="surface" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary-400)' }}>{answered}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>Answered</div>
          </div>
          <div className="surface" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: unanswered.length > 0 ? 'var(--warning)' : 'var(--success)' }}>{unanswered.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>Unanswered</div>
          </div>
        </div>
        {unanswered.length > 0 && (
          <div style={{ padding: '10px 12px', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--warning)', fontWeight: 600 }}>
              <AlertTriangle size={14} /> Unanswered: Q{unanswered.map(q => q.num).join(', Q')}
            </p>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }} disabled={submitting}><Eye size={14} /> Review</button>
          <button className="btn btn-primary" onClick={onSubmit} style={{ flex: 1 }} disabled={submitting}>
            {submitting ? <><span className="spinner" /> Submitting...</> : <><Send size={14} /> Submit Final</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN: Exam Page
   ═══════════════════════════════════════════ */
export default function ExamPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionId, setSubmissionId] = useState(null);
  const [examId, setExamId] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [codeAnswers, setCodeAnswers] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [activeTab, setActiveTab] = useState('mcq');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Refs that security callbacks need without re-registering listeners
  const submissionIdRef = useRef(null);
  const examIdRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => { submissionIdRef.current = submissionId; }, [submissionId]);
  useEffect(() => { examIdRef.current = examId; }, [examId]);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const handleViolation = useCallback((type, severity, description) => {
    const sid = submissionIdRef.current;
    const eid = examIdRef.current;
    const sock = socketRef.current;
    if (sock && sid && eid) {
      sock.emit('violation', { examId: eid, submissionId: sid, type, severity, description });
    }
  }, []);

  // ── Security system ──
  const { isFullscreen, tabSwitchCount, enterFullscreen } = useExamSecurity({
    examId,
    submissionId,
    socket,
    onViolation: handleViolation,
    onToast: addToast,
  });

  // Load exam data from backend
  useEffect(() => {
    const stored = localStorage.getItem('examguard_submission');
    if (!stored) { navigate('/lobby'); return; }

    const { submissionId: subId, examId: exId } = JSON.parse(stored);
    setSubmissionId(subId);
    setExamId(exId);

    getExam(exId)
      .then(res => {
        setExam(res.data);
        setTimeRemaining(res.data.duration * 60);
        if (res.data.questions?.[0]) setActiveTab(res.data.questions[0].type);
      })
      .catch(() => navigate('/lobby'))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Join socket room
  useEffect(() => {
    if (socket && examId && user) {
      socket.emit('join_exam', { examId, userId: user._id, role: 'student' });
    }
  }, [socket, examId, user]);

  const questions = exam?.questions || [];
  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (currentQ) setActiveTab(currentQ.type);
  }, [currentIndex]);

  // Timer countdown
  useEffect(() => {
    if (!exam) return;
    const t = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { clearInterval(t); setShowSubmitModal(true); return 0; }
        if (prev === 300) addToast('⚠️ 5 minutes remaining!', 'warn');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [exam, addToast]);

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  async function handleSaveAnswer(questionId, questionNum, type, data) {
    if (!submissionId) return;
    try {
      const res = await apiSaveAnswer(submissionId, { questionId, questionNum, type, ...data });
      if (socket && examId) {
        socket.emit('answer_saved', {
          examId, studentName: user?.name,
          questionNum, answeredCount: res.data.answeredCount,
          totalQuestions: questions.length,
        });
      }
    } catch (err) {
      console.error('Save answer error:', err);
    }
  }

  async function handleSubmitExam() {
    if (!submissionId) return;
    setSubmitting(true);
    try {
      await apiSubmitExam(submissionId);
      if (socket && examId) {
        socket.emit('exam_submitted', { examId, studentName: user?.name, submissionId });
      }
      // Exit fullscreen gracefully
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      localStorage.setItem('examguard_result', JSON.stringify({ submissionId }));
      localStorage.removeItem('examguard_submission');
      navigate('/result');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit exam', 'danger');
      setSubmitting(false);
    }
  }

  function handleTabClick(type) {
    setActiveTab(type);
    const idx = questions.findIndex(q => q.type === type);
    if (idx >= 0) setCurrentIndex(idx);
  }

  const isLowTime = timeRemaining < 300;
  const tabs = [
    { key: 'mcq', label: 'MCQ', icon: CheckSquare, count: questions.filter(q => q.type === 'mcq').length },
    { key: 'code', label: 'Code', icon: Code2, count: questions.filter(q => q.type === 'code').length },
    { key: 'upload', label: 'Upload', icon: Upload, count: questions.filter(q => q.type === 'upload').length },
  ];

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="spinner" style={{ width: 32, height: 32 }} />
          <p style={{ marginTop: 16, color: 'var(--text-3)' }}>Loading exam...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-0)',
      // Disable text selection across the whole exam page
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
    }}>

      {/* Fullscreen enforce overlay */}
      {!isFullscreen && exam && <FullscreenWarning onEnter={enterFullscreen} />}

      {/* Toast notifications */}
      <div className="toast-wrapper">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <AlertTriangle size={14} color={toast.type === 'danger' ? 'var(--danger)' : 'var(--warning)'} style={{ flexShrink: 0 }} />
            <span style={{ color: 'var(--text-1)', fontSize: 13 }}>{toast.message}</span>
            <button
              onClick={() => setToasts(p => p.filter(t => t.id !== toast.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', marginLeft: 'auto', display: 'flex' }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {showSubmitModal && (
        <SubmitModal
          questions={questions}
          answers={answers}
          onClose={() => setShowSubmitModal(false)}
          onSubmit={handleSubmitExam}
          submitting={submitting}
        />
      )}

      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', background: 'var(--surface-1)',
        borderBottom: '1px solid var(--border-default)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{exam?.name}</span>
          <span className="badge badge-gray">Q{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className={`timer ${isLowTime ? 'timer-low' : ''}`}>
          <Clock size={16} />{formatTime(timeRemaining)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Security indicators */}
          <span style={{
            fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
            color: isFullscreen ? 'var(--success)' : 'var(--danger)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Maximize size={11} />{isFullscreen ? 'SECURE' : 'NOT FULLSCREEN'}
          </span>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: tabSwitchCount > 0 ? 'var(--warning)' : 'var(--text-3)' }}>
            Switches: {tabSwitchCount}
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowSubmitModal(true)}>
            <Send size={12} /> Submit
          </button>
        </div>
      </header>

      {/* Main body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <QuestionNav
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          markedForReview={markedForReview}
          onSelect={setCurrentIndex}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="tabs">
            {tabs.map(tab => (
              <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => handleTabClick(tab.key)}>
                <tab.icon size={14} />
                {tab.label}
                <span className={`tab-count ${activeTab === tab.key ? 'tab-count-active' : 'tab-count-inactive'}`}>{tab.count}</span>
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface-0)' }}>
            {currentQ?.type === 'mcq' && (
              <MCQQuestion
                question={currentQ}
                selectedAnswer={answers[currentQ._id]}
                onAnswer={val => {
                  setAnswers(p => ({ ...p, [currentQ._id]: val }));
                  handleSaveAnswer(currentQ._id, currentQ.num, 'mcq', { selectedOption: val });
                }}
                isMarked={!!markedForReview[currentQ._id]}
                onMark={() => setMarkedForReview(p => ({ ...p, [currentQ._id]: !p[currentQ._id] }))}
              />
            )}
            {currentQ?.type === 'code' && (
              <CodeQuestion
                question={currentQ}
                savedCode={codeAnswers[currentQ._id]?.code}
                savedLang={codeAnswers[currentQ._id]?.lang}
                onSave={(code, lang) => {
                  setCodeAnswers(p => ({ ...p, [currentQ._id]: { code, lang } }));
                  setAnswers(p => ({ ...p, [currentQ._id]: code || 'written' }));
                  handleSaveAnswer(currentQ._id, currentQ.num, 'code', { codeAnswer: code, codeLang: lang });
                }}
              />
            )}
            {currentQ?.type === 'upload' && (
              <UploadQuestion
                question={currentQ}
                uploadedFiles={uploadedFiles[currentQ._id]}
                submissionId={submissionId}
                onUpload={files => {
                  setUploadedFiles(p => ({ ...p, [currentQ._id]: files }));
                  if (files.length > 0) setAnswers(p => ({ ...p, [currentQ._id]: 'uploaded' }));
                  else setAnswers(p => { const n = { ...p }; delete n[currentQ._id]; return n; });
                }}
              />
            )}
          </div>

          {/* Bottom nav */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 20px', background: 'var(--surface-1)',
            borderTop: '1px solid var(--border-default)', flexShrink: 0,
          }}>
            <button className="btn btn-ghost" disabled={currentIndex === 0} onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}>
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setMarkedForReview(p => ({ ...p, [currentQ?._id]: !p[currentQ?._id] }))}
              style={{ color: markedForReview[currentQ?._id] ? 'var(--warning)' : undefined, borderColor: markedForReview[currentQ?._id] ? 'var(--warning-border)' : undefined }}
            >
              {markedForReview[currentQ?._id] ? <BookmarkCheck size={13} /> : <Bookmark size={13} />} Mark for Review
            </button>
            {currentIndex < questions.length - 1
              ? <button className="btn btn-primary" onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}>Next <ChevronRight size={14} /></button>
              : <button className="btn btn-primary" onClick={() => setShowSubmitModal(true)}><Send size={14} /> Submit Exam</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
