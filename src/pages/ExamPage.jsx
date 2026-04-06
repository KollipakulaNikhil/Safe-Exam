import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXAM } from '../data';
import Editor from '@monaco-editor/react';
import {
  Clock, Send, AlertTriangle, ChevronLeft, ChevronRight, Bookmark,
  BookmarkCheck, Upload, Play, X, FileText, Code2, CheckSquare,
  ChevronDown, ChevronUp, Trash2, Eye, Maximize,
} from 'lucide-react';
import { ProgressBar } from '../components/UI';

/* ─────────────────────────────────────────
   Sub-component: Question Navigator Sidebar
   ───────────────────────────────────────── */
function QuestionNav({ questions, currentIndex, answers, markedForReview, onSelect }) {
  const answered = Object.keys(answers).length;

  function getQClass(q, i) {
    if (i === currentIndex) return 'q-num q-current';
    if (markedForReview[q.id]) return 'q-num q-review';
    if (answers[q.id]) return 'q-num q-answered';
    return 'q-num q-unattempted';
  }

  return (
    <div className="q-nav">
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Questions
      </p>

      <div className="q-grid">
        {questions.map((q, i) => (
          <button
            key={q.id}
            className={getQClass(q, i)}
            onClick={() => onSelect(i)}
            title={`Q${q.num} (${q.type})`}
          >
            {q.num}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[
          { cls: 'legend-box', style: { border: '2px solid white', background: 'transparent' }, label: 'Current' },
          { cls: 'legend-box', style: { background: 'var(--blue)' }, label: 'Answered' },
          { cls: 'legend-box', style: { background: 'var(--yellow)' }, label: 'Review' },
          { cls: 'legend-box', style: { background: 'var(--bg-elevated)', border: '1px solid var(--border)' }, label: 'Unattempted' },
        ].map(item => (
          <div key={item.label} className="legend-item">
            <span className="legend-box" style={item.style} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginTop: 14 }}>
        <ProgressBar value={answered} max={questions.length} color="blue" />
        <p
          style={{
            textAlign: 'center',
            marginTop: 6,
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {answered}/{questions.length} answered
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-component: MCQ Question
   ───────────────────────────────────────── */
function MCQQuestion({ question, selectedAnswer, onAnswer, isMarked, onMark }) {
  return (
    <div style={{ padding: 24, maxWidth: 760 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <span className="badge badge-blue" style={{ marginBottom: 8, display: 'inline-flex' }}>
            MCQ • {question.marks} marks
          </span>
          <h2 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.65 }}>
            {question.text}
          </h2>
        </div>
        <button
          onClick={onMark}
          className="btn btn-ghost btn-sm"
          style={{
            flexShrink: 0,
            marginLeft: 16,
            color: isMarked ? 'var(--yellow)' : undefined,
            borderColor: isMarked ? 'var(--yellow)' : undefined,
          }}
        >
          {isMarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          {isMarked ? 'Marked' : 'Review'}
        </button>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {question.options.map((option, i) => (
          <button
            key={i}
            className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
            onClick={() => onAnswer(option)}
          >
            <span
              className={`option-letter ${selectedAnswer === option ? 'option-letter-selected' : 'option-letter-default'}`}
            >
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-component: Code Question
   ───────────────────────────────────────── */
function CodeQuestion({ question, savedCode, savedLang, onSave }) {
  const [lang, setLang] = useState(savedLang || 'javascript');
  const [code, setCode] = useState(savedCode || question.starter || '');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [showProblem, setShowProblem] = useState(true);

  async function runCode() {
    setRunning(true);
    setOutput('');
    // Simulate execution
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
      {/* Problem statement toggle */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setShowProblem(!showProblem)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <FileText size={14} color="var(--green)" />
            Problem Statement
            <span className="badge badge-green">{question.marks} marks</span>
          </span>
          {showProblem ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showProblem && (
          <p style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {question.text}
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <select
          className="input"
          value={lang}
          onChange={e => setLang(e.target.value)}
          style={{ width: 150, padding: '5px 8px', fontSize: 12 }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>

        <button
          className="btn btn-primary btn-sm"
          onClick={runCode}
          disabled={running}
        >
          {running ? (
            <><span className="spinner" style={{ width: 12, height: 12 }} /> Running...</>
          ) : (
            <><Play size={12} /> Run Code</>
          )}
        </button>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: '1 1 60%', minHeight: 260 }}>
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

      {/* Output panel */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          minHeight: 110,
          maxHeight: 180,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            padding: '6px 12px',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}
        >
          <Code2 size={12} />
          Output
        </div>
        <pre
          style={{
            padding: '10px 14px',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            color: output ? 'var(--green)' : 'var(--text-muted)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {output || 'Run your code to see output here...'}
        </pre>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-component: Upload Question
   ───────────────────────────────────────── */
function UploadQuestion({ question, uploadedFiles, onUpload }) {
  const [files, setFiles] = useState(uploadedFiles || []);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  function addFiles(fileList) {
    const added = Array.from(fileList).map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: f.size,
    }));
    const updated = [...files, ...added];
    setFiles(updated);
    onUpload(updated);
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
      <span className="badge badge-yellow" style={{ marginBottom: 10, display: 'inline-flex' }}>
        Upload • {question.marks} marks
      </span>
      <h2 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.65, marginBottom: 20 }}>
        {question.text}
      </h2>

      {/* Drop zone */}
      <div
        className={`drop-zone ${dragging ? 'active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        style={{ marginBottom: 16 }}
      >
        <Upload size={30} color="var(--text-muted)" style={{ margin: '0 auto 10px', display: 'block' }} />
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Drag & drop files here, or{' '}
          <span style={{ color: 'var(--blue)', textDecoration: 'underline' }}>browse</span>
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
          Accepted: {question.formats} — Max 10 MB
        </p>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={e => addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Uploaded Files
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {files.map(file => (
              <div
                key={file.id}
                className="elevated"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={16} color="var(--blue)" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{file.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {formatSize(file.size)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Uploaded</span>
                  <button
                    onClick={() => removeFile(file.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', display: 'flex' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-component: Submit Modal
   ───────────────────────────────────────── */
function SubmitModal({ questions, answers, onClose, onSubmit }) {
  const answered = Object.keys(answers).length;
  const unanswered = questions.filter(q => !answers[q.id]);

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Submit Examination?</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
          Review your submission summary below.
        </p>

        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="elevated" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>
              {answered}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Answered</div>
          </div>
          <div className="elevated" style={{ padding: 14, textAlign: 'center' }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: unanswered.length > 0 ? 'var(--yellow)' : 'var(--green)',
              }}
            >
              {unanswered.length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Unanswered</div>
          </div>
        </div>

        {unanswered.length > 0 && (
          <div
            style={{
              padding: '10px 12px',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 16,
            }}
          >
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--yellow)', fontWeight: 600 }}>
              <AlertTriangle size={14} />
              Unanswered: Q{unanswered.map(q => q.num).join(', Q')}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
            <Eye size={14} /> Review Answers
          </button>
          <button className="btn btn-primary" onClick={onSubmit} style={{ flex: 1 }}>
            <Send size={14} /> Submit Final
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main: Exam Page
   ───────────────────────────────────────── */
export default function ExamPage() {
  const navigate = useNavigate();
  const questions = EXAM.questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [codeAnswers, setCodeAnswers] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [activeTab, setActiveTab] = useState('mcq');
  const [timeRemaining, setTimeRemaining] = useState(EXAM.duration * 60);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const currentQ = questions[currentIndex];

  // Auto-set tab from question type when question changes
  useEffect(() => {
    if (currentQ) setActiveTab(currentQ.type);
  }, [currentIndex]);

  // Timer countdown
  useEffect(() => {
    const t = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setShowSubmitModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Tab switch detection
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) {
        setTabSwitchCount(c => c + 1);
        addToast('Tab switch detected and logged', 'warn');
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Block right-click & F12
  useEffect(() => {
    function handleContext(e) {
      e.preventDefault();
      addToast('Right-click is disabled during the exam', 'warn');
    }
    function handleKey(e) {
      if (e.key === 'F12') {
        e.preventDefault();
        addToast('Developer tools are restricted', 'danger');
      }
    }
    document.addEventListener('contextmenu', handleContext);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Format seconds → MM:SS
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const isLowTime = timeRemaining < 300;

  function handleSubmitExam() {
    navigate('/result');
  }

  // Jump to first question of a type when tab clicked
  function handleTabClick(type) {
    setActiveTab(type);
    const idx = questions.findIndex(q => q.type === type);
    if (idx >= 0) setCurrentIndex(idx);
  }

  const tabs = [
    { key: 'mcq',    label: 'MCQ',    icon: CheckSquare, count: questions.filter(q => q.type === 'mcq').length },
    { key: 'code',   label: 'Code',   icon: Code2,       count: questions.filter(q => q.type === 'code').length },
    { key: 'upload', label: 'Upload', icon: Upload,       count: questions.filter(q => q.type === 'upload').length },
  ];

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-dark)',
        userSelect: 'none',
      }}
    >
      {/* Toast container */}
      <div className="toast-wrapper">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <AlertTriangle
              size={14}
              color={toast.type === 'danger' ? 'var(--red)' : 'var(--yellow)'}
              style={{ flexShrink: 0 }}
            />
            <span style={{ color: 'var(--text-primary)' }}>{toast.message}</span>
            <button
              onClick={() => setToasts(p => p.filter(t => t.id !== toast.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: 'auto', display: 'flex' }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Submit modal */}
      {showSubmitModal && (
        <SubmitModal
          questions={questions}
          answers={answers}
          onClose={() => setShowSubmitModal(false)}
          onSubmit={handleSubmitExam}
        />
      )}

      {/* Top bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{EXAM.name}</span>
          <span className="badge badge-gray">Q{currentIndex + 1} / {questions.length}</span>
        </div>

        {/* Timer */}
        <div className={`timer ${isLowTime ? 'timer-low' : ''}`}>
          <Clock size={16} />
          {formatTime(timeRemaining)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: tabSwitchCount > 0 ? 'var(--yellow)' : 'var(--text-muted)',
            }}
          >
            Tab switches: {tabSwitchCount}
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowSubmitModal(true)}>
            <Send size={12} /> Submit
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Question Navigator */}
        <QuestionNav
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          markedForReview={markedForReview}
          onSelect={setCurrentIndex}
        />

        {/* Right panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tab bar */}
          <div className="tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => handleTabClick(tab.key)}
              >
                <tab.icon size={14} />
                {tab.label}
                <span className={`tab-count ${activeTab === tab.key ? 'tab-count-active' : 'tab-count-inactive'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Question content */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-dark)' }}>
            {currentQ?.type === 'mcq' && (
              <MCQQuestion
                question={currentQ}
                selectedAnswer={answers[currentQ.id]}
                onAnswer={val => setAnswers(p => ({ ...p, [currentQ.id]: val }))}
                isMarked={!!markedForReview[currentQ.id]}
                onMark={() => setMarkedForReview(p => ({ ...p, [currentQ.id]: !p[currentQ.id] }))}
              />
            )}

            {currentQ?.type === 'code' && (
              <CodeQuestion
                question={currentQ}
                savedCode={codeAnswers[currentQ.id]?.code}
                savedLang={codeAnswers[currentQ.id]?.lang}
                onSave={(code, lang) => {
                  setCodeAnswers(p => ({ ...p, [currentQ.id]: { code, lang } }));
                  setAnswers(p => ({ ...p, [currentQ.id]: code || 'written' }));
                }}
              />
            )}

            {currentQ?.type === 'upload' && (
              <UploadQuestion
                question={currentQ}
                uploadedFiles={uploadedFiles[currentQ.id]}
                onUpload={files => {
                  setUploadedFiles(p => ({ ...p, [currentQ.id]: files }));
                  if (files.length > 0) {
                    setAnswers(p => ({ ...p, [currentQ.id]: 'uploaded' }));
                  } else {
                    setAnswers(p => { const n = { ...p }; delete n[currentQ.id]; return n; });
                  }
                }}
              />
            )}
          </div>

          {/* Bottom nav */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 20px',
              background: 'var(--bg-card)',
              borderTop: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <button
              className="btn btn-ghost"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() =>
                setMarkedForReview(p => ({ ...p, [currentQ?.id]: !p[currentQ?.id] }))
              }
              style={{
                color: markedForReview[currentQ?.id] ? 'var(--yellow)' : undefined,
                borderColor: markedForReview[currentQ?.id] ? 'var(--yellow)' : undefined,
              }}
            >
              {markedForReview[currentQ?.id] ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
              Mark for Review
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowSubmitModal(true)}>
                <Send size={14} /> Submit Exam
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
