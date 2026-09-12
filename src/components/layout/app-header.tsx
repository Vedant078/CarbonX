'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Menu, 
  Sparkles, 
  User, 
  LogOut, 
  Settings as SettingsIcon, 
  ChevronDown, 
  CheckCircle2, 
  Gavel, 
  Truck, 
  FileText, 
  X,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { AppNotification } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface AppHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function AppHeader({ onOpenMobileMenu }: AppHeaderProps) {
  const { user, role, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [mounted, setMounted] = useState(false);

  const userButtonRef = useRef<HTMLButtonElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const [userDropdownCoords, setUserDropdownCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const [notifCoords, setNotifCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const updateUserDropdownCoords = () => {
    if (userButtonRef.current) {
      const rect = userButtonRef.current.getBoundingClientRect();
      setUserDropdownCoords({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    }
  };

  const updateNotifCoords = () => {
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setNotifCoords({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    }
  };

  const toggleUserDropdown = () => {
    if (!userDropdownOpen) {
      updateUserDropdownCoords();
      setNotifDropdownOpen(false);
    }
    setUserDropdownOpen(!userDropdownOpen);
  };

  const toggleNotifDropdown = () => {
    if (!notifDropdownOpen) {
      updateNotifCoords();
      setUserDropdownOpen(false);
      fetchNotifications();
    }
    setNotifDropdownOpen(!notifDropdownOpen);
  };

  useEffect(() => {
    if (!userDropdownOpen) return;
    updateUserDropdownCoords();
    const handleScrollOrResize = () => updateUserDropdownCoords();

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [userDropdownOpen]);

  useEffect(() => {
    if (!notifDropdownOpen) return;
    updateNotifCoords();
    const handleScrollOrResize = () => updateNotifCoords();

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [notifDropdownOpen]);

  // Escape key handler to close active dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
        setNotifDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotifClick = async (notif: AppNotification) => {
    if (!notif.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notif.id }),
        });
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
    setNotifDropdownOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getNotificationIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('match') || t.includes('demand') || t.includes('supply')) {
      return <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />;
    }
    if (t.includes('proposal')) {
      return <FileText className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
    if (t.includes('auction') || t.includes('bidding') || t.includes('bid')) {
      return <Gavel className="w-4 h-4 text-amber-600 shrink-0" />;
    }
    if (t.includes('shipment') || t.includes('dispatched') || t.includes('route')) {
      return <Truck className="w-4 h-4 text-cyan-600 shrink-0" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />;
  };

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

  const unreadCount = notifications.filter((n) => !n.read).length;

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
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            ref={bellRef}
            onClick={toggleNotifDropdown}
            aria-label="Open notifications"
            title="Notifications"
            className={`relative p-2 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              notifDropdownOpen
                ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 bg-indigo-600 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in duration-150">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Portal-rendered Notification Dropdown Panel */}
          {mounted && notifDropdownOpen && createPortal(
            <>
              {/* Transparent backdrop layer to close on click outside */}
              <div
                className="fixed inset-0 z-[9998] cursor-default bg-transparent"
                onClick={() => setNotifDropdownOpen(false)}
              />
              
              {/* Notification Panel */}
              <div
                style={{
                  position: 'fixed',
                  top: `${notifCoords.top}px`,
                  right: `${notifCoords.right}px`,
                }}
                className="w-80 sm:w-96 max-w-[calc(100vw-32px)] bg-white border border-slate-200/90 rounded-xl shadow-2xl z-[9999] font-sans text-slate-900 overflow-hidden animate-in fade-in duration-150 flex flex-col"
              >
                {/* Panel Header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 tracking-tight">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                {/* Panel Body / Notifications List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 font-sans text-xs">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2 font-mono">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                      <p className="font-semibold text-slate-800 text-xs">You're all caught up</p>
                      <p className="text-[11px] text-slate-400">No notifications at this time.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left ${
                          !notif.read
                            ? 'bg-indigo-50/50 hover:bg-indigo-50/80 border-l-2 border-indigo-600'
                            : 'bg-white hover:bg-slate-50/80 text-slate-600'
                        }`}
                      >
                        <div className="p-2 bg-slate-100 rounded-lg shrink-0 mt-0.5">
                          {getNotificationIcon(notif.title)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-xs font-semibold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                              {formatRelativeTime(notif.created_at)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed font-sans">
                            {notif.message}
                          </p>
                        </div>

                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Panel Footer */}
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-center shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">
                    CarbonX Notification Desk • Scoped to {role || 'USER'}
                  </span>
                </div>
              </div>
            </>,
            document.body
          )}
        </div>

        {/* User Identity & Role Badge */}
        {user && (
          <div>
            <button
              ref={userButtonRef}
              onClick={toggleUserDropdown}
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
                {/* Transparent backdrop layer to close on click outside */}
                <div
                  className="fixed inset-0 z-[9998] cursor-default bg-transparent"
                  onClick={() => setUserDropdownOpen(false)}
                />
                
                {/* Dropdown Menu rendered at document.body level */}
                <div
                  style={{
                    position: 'fixed',
                    top: `${userDropdownCoords.top}px`,
                    right: `${userDropdownCoords.right}px`,
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
      </div>
    </header>
  );
}

