'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Sidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { canAccessRoute, getDashboardRouteForRole } from '@/lib/rbac';
import { Loader2 } from 'lucide-react';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicDashboardRoute = pathname.startsWith('/marketplace') || pathname.startsWith('/analytics');

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      if (!isPublicDashboardRoute) {
        router.replace('/login');
      }
      return;
    }

    if (!user.role) {
      router.replace('/select-role');
      return;
    }

    // Direct URL role protection guard
    if (!canAccessRoute(user, pathname)) {
      const targetRoute = getDashboardRouteForRole(user.role);
      router.replace(targetRoute);
      return;
    }

    // If navigating to generic /dashboard, redirect to specific role dashboard
    if (pathname === '/dashboard') {
      const targetRoute = getDashboardRouteForRole(user.role);
      router.replace(targetRoute);
      return;
    }
  }, [user, isAuthenticated, isLoading, pathname, router, isPublicDashboardRoute]);

  // Loading state guard to prevent flickering of unauthorized content
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 font-mono text-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">CARBONX PLATFORM</h2>
          <p className="text-xs text-slate-400">Authenticating workspace & permissions...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated user accessing public marketplace or analytics pages
  if (!isAuthenticated || !user) {
    if (isPublicDashboardRoute) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <PublicHeader />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {children}
          </main>
          <PublicFooter />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 font-mono text-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">CARBONX PLATFORM</h2>
          <p className="text-xs text-slate-400">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Authenticated user but missing role or blocked route
  if (!user.role || !canAccessRoute(user, pathname)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 font-mono text-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">CARBONX PLATFORM</h2>
          <p className="text-xs text-slate-400">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-64 max-w-xs bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200">
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AppHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
