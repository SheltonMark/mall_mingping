'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { salespersonApi } from '@/lib/salespersonApi';

interface Salesperson {
  id: string;
  accountId: string;
  chineseName: string;
  englishName: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface SalespersonAuthContextType {
  salesperson: Salesperson | null;
  token: string | null;
  loading: boolean;
  login: (accountId: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Salesperson>) => Promise<void>;
}

const SalespersonAuthContext = createContext<SalespersonAuthContextType | undefined>(undefined);

export function SalespersonAuthProvider({ children }: { children: ReactNode }) {
  const [salesperson, setSalesperson] = useState<Salesperson | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化：从localStorage加载token
  useEffect(() => {
    const savedToken = localStorage.getItem('salesperson_token');
    if (savedToken) {
      salespersonApi.getProfile(savedToken)
        .then(data => {
          setSalesperson(data);
          setToken(savedToken);
        })
        .catch(() => {
          localStorage.removeItem('salesperson_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (accountId: string, password: string) => {
    const data = await salespersonApi.login({ accountId, password });
    setToken(data.access_token);
    setSalesperson(data.salesperson);
    localStorage.setItem('salesperson_token', data.access_token);
  };

  const logout = () => {
    setSalesperson(null);
    setToken(null);
    localStorage.removeItem('salesperson_token');
  };

  const updateProfile = async (data: Partial<Salesperson>) => {
    if (!token) throw new Error('未登录');
    const updated = await salespersonApi.updateProfile(token, data);
    setSalesperson(updated);
  };

  return (
    <SalespersonAuthContext.Provider value={{ salesperson, token, loading, login, logout, updateProfile }}>
      {children}
    </SalespersonAuthContext.Provider>
  );
}

export function useSalespersonAuth() {
  const context = useContext(SalespersonAuthContext);
  if (!context) throw new Error('useSalespersonAuth must be used within SalespersonAuthProvider');
  return context;
}
