import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, getMe } from './api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from token on mount
  useEffect(() => {
    const token = localStorage.getItem('examguard_token');
    if (token) {
      getMe()
        .then(res => {
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem('examguard_token');
          localStorage.removeItem('examguard_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login via API
  async function login(email, password) {
    try {
      const res = await apiLogin(email, password);
      const { token, user: userData } = res.data;
      localStorage.setItem('examguard_token', token);
      localStorage.setItem('examguard_user', JSON.stringify(userData));
      setUser(userData);
      return { ok: true, user: userData };
    } catch (error) {
      const msg = error.response?.data?.error || 'Login failed. Please try again.';
      return { ok: false, error: msg };
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('examguard_token');
    localStorage.removeItem('examguard_user');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
