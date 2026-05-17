import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthChange, DEV_MODE } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // In dev mode, provide a function to set user manually (from login page)
  const devLogin = (email) => {
    setUser({ uid: 'dev-user', email: email || 'dev@aegis.local' });
  };

  const devLogout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, devLogin, devLogout, isDevMode: DEV_MODE }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
