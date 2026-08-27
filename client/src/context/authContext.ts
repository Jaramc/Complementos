import { createContext } from 'react';

export interface User {
  email: string;
  tenantId: string;
  role: string;
  token: string;
  expiration: string;
}

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
