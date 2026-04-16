import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { SocketProvider } from './SocketContext';
import LoginPage   from './pages/LoginPage';
import LobbyPage   from './pages/LobbyPage';
import ExamPage    from './pages/ExamPage';
import ResultPage  from './pages/ResultPage';
import ProctorPage from './pages/ProctorPage';

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
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
