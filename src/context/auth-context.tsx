'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '@/types';
import { db } from '@/lib/db';

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  switchRole: (newRole: UserRole) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>({
    id: 'user-supplier-1',
    name: 'Rajesh Sharma',
    email: 'rajesh@mumbaisteel.com',
    company: 'Mumbai Steel Works',
    role: 'SUPPLIER',
    location: 'Mumbai, Maharashtra',
    latitude: 19.076,
    longitude: 72.8777,
    createdAt: '2026-08-01T10:00:00Z',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const current = await db.getCurrentUser();
        setUser(current);
      } catch (err) {
        console.error('Failed to load user state', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const switchRole = async (newRole: UserRole) => {
    setIsLoading(true);
    try {
      const updated = await db.setCurrentUser(newRole);
      setUser(updated);
    } catch (err) {
      console.error('Failed to switch role', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        switchRole,
        isLoading,
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
