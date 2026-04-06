import { createContext, useContext, useState, useEffect } from 'react';
import { USERS } from './data';

// Create the context
const AuthContext = createContext(null);

// AuthProvider wraps the whole app and provides login/logout
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check localStorage on first load
  useEffect(() => {
    const saved = localStorage.getItem('examguard_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (e) {}
    }
    setLoading(false);
  }, []);

  // login function: checks email + password against mock data
  async function login(email, password, role) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    const match = USERS[role];
    if (match && match.email === email && match.password === password) {
      setUser(match);
      localStorage.setItem('examguard_user', JSON.stringify(match));
      return { ok: true };
    }
    return { ok: false, error: 'Invalid credentials. Use demo credentials below.' };
  }

  // logout: clear state + localStorage
  function logout() {
    setUser(null);
    localStorage.removeItem('examguard_user');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth anywhere
export function useAuth() {
  return useContext(AuthContext);
}
