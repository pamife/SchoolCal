"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const LoaderOne: React.FC = () => {
  const transition = (index: number) => ({
    duration: 1,
    repeat: Infinity,
    repeatType: 'loop' as const,
    delay: index * 0.2,
    ease: 'easeInOut' as const,
  });

  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-label="SchoolCal wird geladen"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          initial={{ y: 0 }}
          animate={{ y: [0, 10, 0] }}
          transition={transition(index)}
          className="h-4 w-4 rounded-full border border-neutral-300 bg-gradient-to-b from-neutral-400 to-neutral-300 dark:border-neutral-500 dark:from-neutral-300 dark:to-neutral-500"
          aria-hidden="true"
        />
      ))}
    </div>
  );
};
