import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Component } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { SocketProvider } from './SocketContext';
import LoginPage   from './pages/LoginPage';
import LobbyPage   from './pages/LobbyPage';
import ExamPage    from './pages/ExamPage';
import ResultPage  from './pages/ResultPage';
import ProctorPage from './pages/ProctorPage';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(err) { return { error: err }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)', gap: 16 }}>
          <span style={{ fontSize: 48 }}>⚠️</span>
          <h2 style={{ color: 'var(--text-0)', fontSize: 'var(--text-xl)' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-base)' }}>
            {typeof this.state.error?.message === 'string'
              ? this.state.error.message
              : this.state.error
              ? JSON.stringify(this.state.error, null, 2)
              : 'An unexpected error occurred.'}
          </p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/login'}>Go to Login</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-0)' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'proctor' ? '/proctor' : '/lobby'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={user.role === 'proctor' ? '/proctor' : '/lobby'} replace />
            : <LoginPage />
        }
      />
      <Route path="/lobby"  element={<ProtectedRoute role="student"><LobbyPage  /></ProtectedRoute>} />
      <Route path="/exam"   element={<ProtectedRoute role="student"><ExamPage   /></ProtectedRoute>} />
      <Route path="/result" element={<ProtectedRoute role="student"><ResultPage /></ProtectedRoute>} />
      <Route path="/proctor" element={<ProtectedRoute role="proctor"><ProctorPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
