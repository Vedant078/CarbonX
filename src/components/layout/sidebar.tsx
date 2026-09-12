'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  ListPlus,
  Sparkles,
  Send,
  FileCheck,
  Truck,
  ChartNoAxesCombined,
  Settings,
  Shield,
  Building,
  LogOut,
  Atom,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hideForRole?: string;
  roleOnly?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'MARKETPLACE',
      items: [
        { label: 'Discover CO₂', href: '/marketplace', icon: Search },
        { label: 'My Listings', href: '/listings', icon: ListPlus, hideForRole: 'BUYER' },
        { label: 'Matches', href: '/matches', icon: Sparkles },
      ],
    },
    {
      title: 'TRANSACTIONS',
      items: [
        { label: 'Requests', href: '/requests', icon: Send },
        { label: 'Deals', href: '/deals', icon: FileCheck },
      ],
    },
    {
      title: 'LOGISTICS',
      items: [
        { label: 'Active Shipments', href: '/shipments', icon: Truck },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { label: 'Analytics', href: '/analytics', icon: ChartNoAxesCombined },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Settings', href: '/settings', icon: Settings },
        { label: 'Admin View', href: '/admin', icon: Shield, roleOnly: 'ADMIN' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#0B1220] flex items-center justify-center text-white shadow-md group-hover:bg-blue-600 transition-colors">
            <Atom className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-[#0B1220] group-hover:text-blue-600 transition-colors">
              Carbon<span className="text-blue-600">X</span>
            </span>
            <span className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase -mt-1">
              Marketplace
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => {
          const visibleItems = section.items.filter((item) => {
            if (item.hideForRole && role === item.hideForRole) return false;
            if (item.roleOnly && role !== item.roleOnly) return false;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {section.title}
              </h4>
              <div className="space-y-0.5 mt-1.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
                        )}
                      />
                      <span>{item.label}</span>
                      {item.label === 'Matches' && (
                        <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          24
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Footer Profile Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0B1220] text-white flex items-center justify-center font-bold text-xs">
            {user.company.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{user.company}</p>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{user.role}</span>
            </p>
          </div>
          <Link
            href="/"
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Return to Public Landing Page"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
