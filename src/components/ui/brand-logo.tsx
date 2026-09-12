'use client';

import React from 'react';
import Link from 'next/link';
import { Atom } from 'lucide-react';

export interface BrandLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  showSubtitle?: boolean;
  theme?: 'light' | 'dark';
  roleBadge?: string;
  className?: string;
  clickable?: boolean;
}

export function BrandLogo({
  href = '/',
  size = 'md',
  subtitle = 'Marketplace',
  showSubtitle = true,
  theme = 'light',
  roleBadge,
  className = '',
  clickable = true,
}: BrandLogoProps) {
  const isDark = theme === 'dark';

  // Size styling maps
  const iconContainerSize = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  }[size];

  const iconSize = {
    sm: 'w-4.5 h-4.5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  }[size];

  const titleTextSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size];

  const subtitleTextSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
  }[size];

  const getRoleBadgeStyle = (roleStr?: string) => {
    if (!roleStr) return '';
    const upper = roleStr.toUpperCase();
    if (upper.includes('BUYER')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (upper.includes('DEALER')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    if (upper.includes('LOGISTICS')) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const logoContent = (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      {/* Dark Navy Square Icon with Blue Atom Symbol */}
      <div
        className={`${iconContainerSize} bg-[#0B1220] flex items-center justify-center text-white shadow-md group-hover:bg-blue-600 transition-colors shrink-0`}
      >
        <Atom className={`${iconSize} text-blue-400 group-hover:text-white transition-colors`} />
      </div>

      {/* Brand Name & Subtitle */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`${titleTextSize} font-black tracking-tight ${
              isDark ? 'text-white' : 'text-[#0B1220]'
            } group-hover:text-blue-600 transition-colors leading-none`}
          >
            Carbon<span className="text-blue-600">X</span>
          </span>

          {roleBadge && (
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${getRoleBadgeStyle(
                roleBadge
              )}`}
            >
              {roleBadge.replace('_', ' ')}
            </span>
          )}
        </div>

        {showSubtitle && subtitle && (
          <span
            className={`${subtitleTextSize} font-bold text-slate-400 tracking-widest uppercase mt-0.5 leading-none`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  if (!clickable) {
    return logoContent;
  }

  return <Link href={href}>{logoContent}</Link>;
}
