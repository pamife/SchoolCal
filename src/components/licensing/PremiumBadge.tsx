import React from 'react';
import type { UserPlan } from '../../types';
import { Sparkles, Crown, Zap } from 'lucide-react';

interface PremiumBadgeProps {
  plan: UserPlan;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  plan,
  size = 'sm',
  showIcon = true,
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1',
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }[size];

  if (plan === 'PRO') {
    return (
      <span
        onClick={onClick}
        className={`inline-flex items-center font-extrabold rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xs uppercase tracking-wider ${sizeClasses} ${
          onClick ? 'cursor-pointer hover:opacity-90' : ''
        } ${className}`}
      >
        {showIcon && <Crown className="w-3 h-3 text-amber-300" />}
        <span>PRO</span>
      </span>
    );
  }

  if (plan === 'PLUS') {
    return (
      <span
        onClick={onClick}
        className={`inline-flex items-center font-extrabold rounded-full bg-ios-blue text-white shadow-xs uppercase tracking-wider ${sizeClasses} ${
          onClick ? 'cursor-pointer hover:opacity-90' : ''
        } ${className}`}
      >
        {showIcon && <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />}
        <span>PLUS</span>
      </span>
    );
  }

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center font-bold rounded-full bg-gray-100 dark:bg-ios-dark-secondary text-gray-600 dark:text-gray-400 uppercase tracking-wider ${sizeClasses} ${
        onClick ? 'cursor-pointer hover:opacity-90' : ''
      } ${className}`}
    >
      <span>STANDARD</span>
    </span>
  );
};
