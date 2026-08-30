import React from 'react';
import { motion } from 'framer-motion';

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`relative inline-flex p-1 bg-gray-200/70 dark:bg-ios-dark-secondary rounded-ios select-none ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
    >
      {options.map((option) => {
        const isSelected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 font-medium rounded-[10px] transition-colors ${
              isSelected
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="segmented-active-pill"
                className="absolute inset-0 bg-white dark:bg-ios-dark-card rounded-[10px] shadow-sm -z-10"
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              />
            )}
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
