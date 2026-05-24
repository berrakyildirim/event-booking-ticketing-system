'use client'
import { createContext, useContext, useState, useEffect } from 'react';

// Default context value: `loading: true` prevents route guards from redirecting
// before the initial session check has completed, avoiding a flash of the wrong page.
const AuthContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the HttpOnly cookie on every full page load.
  // `credentials: 'include'` is required so the browser sends the cookie with the fetch.
  // The empty dependency array means this runs once — on mount only.
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        // If the cookie is missing or expired the endpoint returns 401, so data is null
        setUser(data?.user ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook — consumers call `useAuth()` instead of importing the context directly
export function useAuth() {
  return useContext(AuthContext);
}
