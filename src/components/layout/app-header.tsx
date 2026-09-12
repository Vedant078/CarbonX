'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, Sparkles, User, Factory, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function AppHeader({ onOpenMobileMenu }: AppHeaderProps) {
  const { user, role, switchRole } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input / CarbonX AI Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or ask CarbonX AI (e.g. 300t CO₂ near Pune)..."
            className="w-full h-9 pl-9 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
            title="Execute AI Search"
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
          </button>
        </form>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Pill */}
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => switchRole('SUPPLIER')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              role === 'SUPPLIER'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Factory className="w-3 h-3" /> Supplier
          </button>
          <button
            onClick={() => switchRole('BUYER')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              role === 'BUYER'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3 h-3" /> Buyer
          </button>
        </div>

        {/* Quick Action Button */}
        {role === 'SUPPLIER' ? (
          <Link href="/listings/new">
            <Button variant="primary" size="sm">
              + List CO₂
            </Button>
          </Link>
        ) : (
          <Link href="/requirements/new">
            <Button variant="secondary" size="sm">
              + Requirement
            </Button>
          </Link>
        )}

        {/* Notification Bell */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="View Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
        </button>
      </div>
    </header>
  );
}
