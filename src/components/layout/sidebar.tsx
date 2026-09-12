'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  FileText,
  Sparkles,
  ShoppingBag,
  Briefcase,
  Truck,
  TrendingUp,
  Settings,
  Layers,
  DollarSign,
  MapPin,
  CheckCircle2,
  Package,
  Navigation,
  Users,
  Gavel,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@/types';
import { BrandLogo } from '@/components/ui/brand-logo';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const isBuyer = role === 'BUYER';
  const isDealer = role === 'DEALER';
  const isLogistics = role === 'LOGISTICS';

  const buyerNav = [
    { label: 'Dashboard', href: '/buyer/dashboard', icon: LayoutDashboard },
    {
      group: 'DISCOVER',
      items: [
        { label: 'CO₂ Marketplace', href: '/buyer/marketplace', icon: Search },
        { label: 'CO₂ Auctions', href: '/buyer/marketplace', icon: Sparkles },
        { label: 'My Requirements', href: '/buyer/requirements', icon: FileText },
      ],
    },
    {
      group: 'PURCHASES & BIDS',
      items: [
        { label: 'My Bids', href: '/buyer/bids', icon: Gavel },
        { label: 'Supply Requests', href: '/buyer/requests', icon: Package },
        { label: 'Dealer Proposals', href: '/buyer/proposals', icon: ShieldCheck },
        { label: 'My Deals', href: '/buyer/deals', icon: CheckCircle2 },
      ],
    },
    {
      group: 'LOGISTICS',
      items: [
        { label: 'My Shipments', href: '/buyer/shipments', icon: Truck },
      ],
    },
    { label: 'Analytics', href: '/analytics', icon: TrendingUp },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const dealerNav = [
    { label: 'Dashboard', href: '/dealer/dashboard', icon: LayoutDashboard },
    {
      group: 'MARKETPLACE',
      items: [
        { label: 'Supply Entities', href: '/dealer/supply', icon: Search },
        { label: 'Buyer Demand', href: '/dealer/demand', icon: FileText },
        { label: 'Opportunities', href: '/dealer/opportunities', icon: Sparkles },
        { label: 'Match Analytics', href: '/dealer/matches', icon: Layers },
      ],
    },
    {
      group: 'TRANSACTIONS',
      items: [
        { label: 'Proposals', href: '/dealer/proposals', icon: ShieldCheck },
        { label: 'Deal Pipeline', href: '/dealer/deals', icon: CheckCircle2 },
      ],
    },
    {
      group: 'FINANCE',
      items: [
        { label: 'Commissions', href: '/dealer/commissions', icon: DollarSign },
      ],
    },
    { label: 'Analytics', href: '/analytics', icon: TrendingUp },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const logisticsNav = [
    { label: 'Dashboard', href: '/logistics/dashboard', icon: LayoutDashboard },
    {
      group: 'OPERATIONS',
      items: [
        { label: 'Available Jobs', href: '/logistics/available', icon: Package },
        { label: 'Active Shipments', href: '/logistics/shipments', icon: Truck },
      ],
    },
    {
      group: 'FLEET & CREW',
      items: [
        { label: 'Vehicles', href: '/logistics/vehicles', icon: Truck },
        { label: 'Drivers', href: '/logistics/drivers', icon: Users },
      ],
    },
    {
      group: 'ROUTES',
      items: [
        { label: 'Route Activity', href: '/logistics/routes', icon: Navigation },
      ],
    },
    { label: 'Analytics', href: '/analytics', icon: TrendingUp },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const activeNav = isBuyer ? buyerNav : isDealer ? dealerNav : logisticsNav;

  const getPrimaryCta = () => {
    if (isBuyer) {
      return { label: 'Find CO₂ Supply', href: '/buyer/marketplace', icon: Search, color: 'bg-emerald-600 hover:bg-emerald-500' };
    }
    if (isDealer) {
      return { label: 'Find Opportunities', href: '/dealer/opportunities', icon: Sparkles, color: 'bg-indigo-600 hover:bg-indigo-500' };
    }
    return { label: 'View Available Shipments', href: '/logistics/available', icon: Package, color: 'bg-cyan-600 hover:bg-cyan-500' };
  };

  const primaryCta = getPrimaryCta();

  return (
    <aside className="w-64 bg-card border-r border-border/80 flex flex-col justify-between h-screen sticky top-0 font-sans z-40 select-none">
      <div className="p-4 space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between px-1 pt-1">
          <BrandLogo
            href="/"
            size="sm"
            subtitle={role ? role.replace('_', ' ') : 'BUYER'}
            roleBadge={role || 'BUYER'}
          />
        </div>

        {/* Primary CTA Button */}
        <div className="px-1">
          <Link href={primaryCta.href} onClick={onCloseMobile}>
            <button className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 ${primaryCta.color}`}>
              <primaryCta.icon className="w-3.5 h-3.5" />
              <span>{primaryCta.label}</span>
            </button>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-4 px-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          {activeNav.map((item: any, idx) => {
            if (item.group) {
              return (
                <div key={idx} className="space-y-1 pt-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase px-2 block">
                    {item.group}
                  </span>
                  {item.items.map((sub: any) => {
                    const active = pathname === sub.href;
                    const Icon = sub.icon;
                    return (
                      <Link
                        key={`${sub.label}-${sub.href}`}
                        href={sub.href}
                        onClick={onCloseMobile}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                          active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-border/60 bg-muted/10 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-foreground truncate">{user?.name || 'User'}</div>
            <div className="text-[10px] text-muted-foreground truncate">{user?.company || user?.email || ''}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ClockIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
