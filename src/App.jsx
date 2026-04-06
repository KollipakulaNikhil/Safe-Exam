import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage   from './pages/LoginPage';
import LobbyPage   from './pages/LobbyPage';
import ExamPage    from './pages/ExamPage';
import ResultPage  from './pages/ResultPage';
import ProctorPage from './pages/ProctorPage';

/*
  ProtectedRoute: if not logged in → redirect to /login
  if wrong role → redirect to correct home
*/
function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-dark)',
        }}
      >
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

/*
  AppRoutes: decides where to send users
*/
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Login — redirect if already logged in */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={user.role === 'proctor' ? '/proctor' : '/lobby'} replace />
            : <LoginPage />
        }
      />

      {/* Student pages */}
      <Route path="/lobby"  element={<ProtectedRoute role="student"><LobbyPage  /></ProtectedRoute>} />
      <Route path="/exam"   element={<ProtectedRoute role="student"><ExamPage   /></ProtectedRoute>} />
      <Route path="/result" element={<ProtectedRoute role="student"><ResultPage /></ProtectedRoute>} />

      {/* Proctor page */}
      <Route path="/proctor" element={<ProtectedRoute role="proctor"><ProctorPage /></ProtectedRoute>} />

      {/* Default: go to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

/*
  Root App: provides auth context + router
*/
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
