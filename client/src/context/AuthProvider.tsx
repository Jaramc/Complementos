import { useState, type ReactNode } from 'react';
import client from '../api/client';
import { AuthContext, type User } from './authContext';

function readStoredUser(): User | null {
  const stored = localStorage.getItem('pqrs_user');
  if (!stored) return null;
  try { return JSON.parse(stored) as User; } catch { localStorage.removeItem('pqrs_user'); return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await client.post<User>('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('pqrs_user', JSON.stringify(data));
      if (data.token) {
        localStorage.setItem('pqrs_token', data.token);
      }
    } finally { setIsLoading(false); }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pqrs_user');
    localStorage.removeItem('pqrs_token');
  };
  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}
