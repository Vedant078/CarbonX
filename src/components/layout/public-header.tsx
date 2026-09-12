'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getDashboardRouteForRole } from '@/lib/rbac';
import { BrandLogo } from '@/components/ui/brand-logo';

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const dashboardHref = user?.role ? getDashboardRouteForRole(user.role) : '/dashboard';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <BrandLogo href="/" size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="/marketplace" className="hover:text-blue-600 transition-colors">
            Marketplace
          </Link>
          <Link href="/#how-it-works" className="hover:text-blue-600 transition-colors">
            How It Works
          </Link>
          <Link href="/#applications" className="hover:text-blue-600 transition-colors">
            Applications
          </Link>
          <Link href="/analytics" className="hover:text-blue-600 transition-colors">
            Analytics
          </Link>
        </nav>

        {/* CTA Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href={dashboardHref}>
            <Button variant="ghost" size="md" className="flex items-center gap-1.5 font-bold">
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              Dashboard
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="primary" size="md">
              Explore Marketplace <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 font-semibold text-slate-700 text-sm">
            <Link
              href="/marketplace"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#applications"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Applications
            </Link>
            <Link
              href="/analytics"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Analytics
            </Link>
            <Link
              href={dashboardHref}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors font-bold text-blue-600"
            >
              Dashboard
            </Link>
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full">
                Enter Dashboard
              </Button>
            </Link>
            <Link href="/marketplace" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" className="w-full">
                Explore Marketplace →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
