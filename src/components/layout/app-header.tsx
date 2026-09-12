'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, Sparkles, User, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface AppHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function AppHeader({ onOpenMobileMenu }: AppHeaderProps) {
  const { user, role, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateDropdownCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    }
  };

  const toggleDropdown = () => {
    if (!userDropdownOpen) {
      updateDropdownCoords();
    }
    setUserDropdownOpen(!userDropdownOpen);
  };

  useEffect(() => {
    if (!userDropdownOpen) return;

    updateDropdownCoords();
    const handleScrollOrResize = () => updateDropdownCoords();

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [userDropdownOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (role === 'BUYER') {
        router.push(`/buyer/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
      } else if (role === 'DEALER') {
        router.push(`/dealer/supply?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        router.push(`/logistics/routes?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const getRoleBadgeColor = () => {
    if (role === 'BUYER') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (role === 'DEALER') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
  };

  return (
    <header className="h-16 bg-white border-b border-border/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs font-sans">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input / CarbonX AI Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CarbonX (e.g. 300t CO₂ near Pune)..."
            className="w-full h-9 pl-9 pr-10 bg-muted/20 border border-border/80 rounded-xl text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500 transition-all font-mono"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-emerald-400 transition-colors"
            title="Execute Search"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </button>
        </form>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-4">
        {/* User Identity & Role Badge */}
        {user && (
          <div>
            <button
              ref={buttonRef}
              onClick={toggleDropdown}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-muted/30 transition-all cursor-pointer border border-transparent hover:border-border/60"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs font-mono">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left font-mono">
                <span className="text-xs font-bold text-foreground leading-none">{user.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border mt-1 w-fit leading-none ${getRoleBadgeColor()}`}>
                  {user.role ? user.role.replace('_', ' ') : 'USER'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>

            {/* Portal-rendered User Dropdown Menu */}
            {mounted && userDropdownOpen && createPortal(
              <>
                {/* Transparent backdrop layer to close on click outside & block underneath pointer interactions */}
                <div
                  className="fixed inset-0 z-[9998] cursor-default bg-transparent"
                  onClick={() => setUserDropdownOpen(false)}
                />
                
                {/* Dropdown Menu rendered at document.body level */}
                <div
                  style={{
                    position: 'fixed',
                    top: `${dropdownCoords.top}px`,
                    right: `${dropdownCoords.right}px`,
                  }}
                  className="w-48 bg-white border border-slate-200/90 rounded-xl shadow-2xl p-1.5 z-[9999] font-mono text-xs space-y-0.5 animate-in fade-in duration-150 text-slate-900 opacity-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-500" />
                    <span>Settings</span>
                  </Link>
                  <div className="border-t border-slate-200 my-1" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>Logout</span>
                  </button>
                </div>
              </>,
              document.body
            )}
          </div>
        )}

        {/* Notification Bell */}
        <button
          className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-xl transition-colors cursor-pointer"
          title="View Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-background animate-pulse" />
        </button>
      </div>
    </header>
  );
}
