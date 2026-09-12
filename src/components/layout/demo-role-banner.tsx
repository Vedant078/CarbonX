'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@/types';
import { UserCheck, ShieldCheck, Factory, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DemoRoleBanner() {
  const { user, role, switchRole } = useAuth();

  const roles: { id: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'SUPPLIER',
      label: 'Supplier Demo',
      icon: <Factory className="w-3.5 h-3.5" />,
      desc: 'Mumbai Steel Works',
    },
    {
      id: 'BUYER',
      label: 'Buyer Demo',
      icon: <Building2 className="w-3.5 h-3.5" />,
      desc: 'GreenFuel Technologies',
    },
    {
      id: 'ADMIN',
      label: 'Admin Demo',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      desc: 'Platform Operations',
    },
  ];

  return (
    <div className="bg-[#0B1220] text-slate-200 px-4 py-2 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-medium text-slate-300">
          Demo Mode Active: <strong className="text-white">{user.company}</strong> ({role})
        </span>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <span className="text-[11px] text-slate-400 px-2 font-medium flex items-center gap-1">
          <UserCheck className="w-3 h-3 text-blue-400" /> Switch Role:
        </span>
        {roles.map((r) => {
          const isActive = role === r.id;
          return (
            <button
              key={r.id}
              onClick={() => switchRole(r.id)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs font-semibold cursor-pointer',
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              )}
              title={`Switch perspective to ${r.desc}`}
            >
              {r.icon}
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
