import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tradex_admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyAdmin() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.success && res.user && res.user.role === 'admin') {
          setAdmin(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Admin token invalid:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    verifyAdmin();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/admin-login', { email, password });
    if (res.success && res.token && res.user) {
      localStorage.setItem('tradex_admin_token', res.token);
      setToken(res.token);
      setAdmin(res.user);
    } else {
      throw new Error(res.message || 'Admin authentication failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('tradex_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: Boolean(admin),
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
