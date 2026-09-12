import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'ACTIVE'
  | 'AVAILABLE'
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'DRAFT'
  | 'CANCELLED';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  const configs: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    ACTIVE: { label: 'Active', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    AVAILABLE: { label: 'Available', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    PENDING: { label: 'Pending', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    ACCEPTED: { label: 'Accepted', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    PREPARING: { label: 'Preparing', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    IN_TRANSIT: { label: 'In Transit', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
    DELIVERED: { label: 'Delivered', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', dot: 'bg-teal-500' },
    COMPLETED: { label: 'Completed', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    REJECTED: { label: 'Rejected', bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
    DRAFT: { label: 'Draft', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
  };

  const config = configs[normalized] || {
    label: status,
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-2xs transition-colors',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', config.dot)} />
      {config.label}
    </span>
  );
}
