import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'bg-[#0B1220] hover:bg-[#102A43] text-white shadow-sm border border-transparent',
    secondary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    outline: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
    destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    teal: 'bg-[#0F766E] hover:bg-[#0d645e] text-white shadow-sm',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
    md: 'h-10 px-4 text-sm rounded-xl gap-2',
    lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
