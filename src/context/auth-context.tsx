'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '@/types';
import { getDashboardRouteForRole } from '@/lib/rbac';
import { useRouter } from 'next/navigation';

interface RegisterData {
  name: string;
  email: string;
  password?: string;
  company: string;
  role?: UserRole;
  location?: string;
  buyerProfile?: any;
  dealerProfile?: any;
  logisticsProfile?: any;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, isDemo?: boolean) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<void>;
  selectRole: (role: UserRole) => Promise<void>;
  register: (userData: RegisterData) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserSession() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUserSession();
  }, []);

  const login = async (email: string, password?: string, isDemo = false): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isDemo }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password');
      }

      setUser(data.user);
      if (data.targetRoute) {
        router.push(data.targetRoute);
      } else if (data.user.role) {
        router.push(getDashboardRouteForRole(data.user.role));
      } else {
        router.push('/select-role');
      }

      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Authenticate as demo user via real backend login endpoint
      await login('buyer.demo@carbonx.demo', undefined, true);
    } finally {
      setIsLoading(false);
    }
  };

  const selectRole = async (selectedRole: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/select-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to assign role');
      }

      setUser(data.user);
      router.push(data.targetRoute || getDashboardRouteForRole(selectedRole));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user);
      if (data.user.role) {
        router.push(getDashboardRouteForRole(data.user.role));
      } else {
        router.push('/select-role');
      }

      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsLoading(false);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        selectRole,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
