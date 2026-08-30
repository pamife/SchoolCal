import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'red' | 'green' | 'amber' | 'purple' | 'orange' | 'teal' | 'gray' | 'custom';
  customColor?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  customColor,
  size = 'md',
  className,
}) => {
  const variantStyles = {
    blue: 'bg-ios-blue/15 text-ios-blue dark:bg-ios-blue/20 dark:text-blue-400',
    red: 'bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    green: 'bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    amber: 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    purple: 'bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    orange: 'bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
    teal: 'bg-teal-500/15 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
    gray: 'bg-gray-200/80 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300',
    custom: '',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg',
  };

  const style = customColor
    ? {
        backgroundColor: `${customColor}22`,
        color: customColor,
      }
    : undefined;

  return (
    <span
      style={style}
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 leading-none tracking-tight select-none',
          sizeStyles[size],
          !customColor && variantStyles[variant],
          className
        )
      )}
    >
      {children}
    </span>
  );
};
