import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tinted' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-ios transition-all active:scale-[0.97] select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4 py-2.5 gap-2 font-medium',
    lg: 'text-base px-5 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-ios-blue text-white shadow-sm hover:brightness-105 active:brightness-95',
    secondary: 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-ios-dark-tertiary',
    tinted: 'bg-ios-blue/15 text-ios-blue hover:bg-ios-blue/20 dark:bg-ios-blue/25 dark:text-blue-400',
    destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
