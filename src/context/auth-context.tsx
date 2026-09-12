'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '@/types';
import { db } from '@/lib/db';
import { getDashboardRouteForRole } from '@/lib/rbac';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<void>;
  selectRole: (role: UserRole) => Promise<void>;
  register: (userData: Omit<UserProfile, 'id' | 'createdAt'>) => Promise<UserProfile>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const current = await db.getCurrentUser();
        setUser(current);
      } catch (err) {
        console.error('Failed to load user session', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const loggedUser = await db.login(email);
      setUser(loggedUser);
      if (loggedUser.role) {
        const target = getDashboardRouteForRole(loggedUser.role);
        router.push(target);
      } else {
        router.push('/select-role');
      }
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // OAuth Simulator: Default Google login creates or authenticates user profile
      const users = await db.getUsers();
      let googleUser = users.find((u) => u.email === 'buyer.demo@carbonx.demo') || users[0];

      setUser(googleUser);
      if (googleUser.role) {
        const target = getDashboardRouteForRole(googleUser.role);
        router.push(target);
      } else {
        router.push('/select-role');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectRole = async (selectedRole: UserRole): Promise<void> => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updatedUser: UserProfile = {
        ...user,
        role: selectedRole,
      };
      await db.setCurrentUserByRole(selectedRole);
      setUser(updatedUser);
      const target = getDashboardRouteForRole(selectedRole);
      router.push(target);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<UserProfile, 'id' | 'createdAt'>): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const newUser = await db.registerUser(userData);
      setUser(newUser);
      if (newUser.role) {
        const target = getDashboardRouteForRole(newUser.role);
        router.push(target);
      } else {
        router.push('/select-role');
      }
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('carbonx_current_user_v2');
    }
    router.push('/login');
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
