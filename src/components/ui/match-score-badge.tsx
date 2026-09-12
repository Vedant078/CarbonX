import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function MatchScoreBadge({
  score,
  size = 'md',
  showIcon = true,
  className,
}: MatchScoreBadgeProps) {
  let colorStyle = 'bg-blue-50 text-blue-700 border-blue-200';
  if (score >= 90) {
    colorStyle = 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-sm';
  } else if (score >= 75) {
    colorStyle = 'bg-teal-50 text-teal-700 border-teal-200';
  } else {
    colorStyle = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs rounded-md gap-1 font-semibold',
    md: 'px-2.5 py-1 text-sm rounded-lg gap-1.5 font-bold',
    lg: 'px-4 py-2 text-lg rounded-xl gap-2 font-extrabold shadow-md',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border transition-all duration-200',
        colorStyle,
        sizes[size],
        className
      )}
    >
      {showIcon && <Sparkles className={size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'} />}
      <span>{score}% Match</span>
    </span>
  );
}
