"use client";

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, LoaderCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ButtonState = 'idle' | 'loading' | 'success';

export interface StatefulButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: 'primary' | 'secondary' | 'tinted' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  loadingText?: React.ReactNode;
  successText?: React.ReactNode;
  successDuration?: number;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => void | Promise<void>;
  onActionSuccess?: () => void;
  onActionError?: (error: unknown) => void;
}

export const Button = React.forwardRef<HTMLButtonElement, StatefulButtonProps>(
  function StatefulButton(
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      fullWidth = false,
      className,
      disabled,
      loadingText,
      successText,
      successDuration = 1400,
      onClick,
      onActionSuccess,
      onActionError,
      type = 'button',
      ...props
    },
    ref
  ) {
    const [state, setState] = useState<ButtonState>('idle');
    const actionInProgress = useRef(false);
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (resetTimer.current) clearTimeout(resetTimer.current);
      };
    }, []);

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!onClick || actionInProgress.current) return;

      actionInProgress.current = true;
      setState('loading');

      try {
        await onClick(event);
        setState('success');
        resetTimer.current = setTimeout(() => {
          actionInProgress.current = false;
          setState('idle');
          onActionSuccess?.();
        }, successDuration);
      } catch (error) {
        actionInProgress.current = false;
        setState('idle');
        if (onActionError) {
          onActionError(error);
        } else {
          console.error('Stateful button action failed:', error);
        }
      }
    };

    const baseStyles =
      'touch-target-y relative inline-flex cursor-pointer select-none items-center justify-center overflow-hidden rounded-ios font-medium transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs font-medium',
      md: 'px-4 py-2.5 text-sm font-medium',
      lg: 'px-5 py-3.5 text-base font-semibold',
    };

    const variantStyles = {
      primary:
        'bg-ios-blue text-white shadow-sm hover:brightness-105 active:brightness-95',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-ios-dark-secondary dark:text-white dark:hover:bg-ios-dark-tertiary',
      tinted:
        'bg-ios-blue/15 text-ios-blue hover:bg-ios-blue/20 dark:bg-ios-blue/25 dark:text-blue-400',
      destructive:
        'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
      ghost:
        'bg-transparent text-gray-700 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/5',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={twMerge(
          clsx(
            baseStyles,
            sizeStyles[size],
            variantStyles[variant],
            fullWidth && 'w-full',
            className
          )
        )}
        disabled={disabled || state !== 'idle'}
        onClick={handleClick}
        data-state={state}
        aria-busy={state === 'loading'}
        {...props}
      >
        <span className="grid place-items-center">
          <span
            className={clsx(
              'col-start-1 row-start-1 inline-flex items-center justify-center gap-2',
              state !== 'idle' && 'invisible'
            )}
          >
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
          </span>

          <AnimatePresence mode="popLayout" initial={false}>
            {state === 'loading' && (
              <motion.span
                key="loading"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.9 }}
                className="col-start-1 row-start-1 inline-flex items-center justify-center gap-2"
                aria-live="polite"
              >
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                {loadingText && <span>{loadingText}</span>}
                <span className="sr-only">Aktion wird ausgeführt</span>
              </motion.span>
            )}

            {state === 'success' && (
              <motion.span
                key="success"
                initial={{ opacity: 0, y: 6, scale: 0.75 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.75 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="col-start-1 row-start-1 inline-flex items-center justify-center gap-2"
                aria-live="polite"
              >
                <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                {successText && <span>{successText}</span>}
                <span className="sr-only">Aktion erfolgreich</span>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </button>
    );
  }
);

Button.displayName = 'StatefulButton';
