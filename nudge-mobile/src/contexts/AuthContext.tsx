import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../storage';

interface AuthUser {
  email: string;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseToken(token: string): AuthUser {
  try {
    const payload = token.split('.')[1];
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const claims = JSON.parse(atob(padded));
    const role: string = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? '';
    const email: string = claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? '';
    return { email, isAdmin: role === 'Admin' };
  } catch {
    return { email: '', isAdmin: false };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.getItem('authToken')
      .then((token) => { if (token) setUser(parseToken(token)); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (token: string) => {
    await storage.setItem('authToken', token);
    setUser(parseToken(token));
  };

  const logout = async () => {
    await storage.deleteItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
