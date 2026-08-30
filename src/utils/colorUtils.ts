import type React from 'react';
import {
  Calculator,
  BookOpen,
  Languages,
  Atom,
  Leaf,
  Landmark,
  Code,
  Palette,
  Activity,
  GraduationCap,
  Music,
} from 'lucide-react';
import type { CalendarEventType } from '../types';

export const ACCENT_PALETTES = [
  { name: 'Apple Blau', color: '#007AFF' },
  { name: 'Indigo', color: '#5856D6' },
  { name: 'Lila', color: '#AF52DE' },
  { name: 'Pink', color: '#FF2D55' },
  { name: 'Orange', color: '#FF9500' },
  { name: 'Smaragdgrün', color: '#34C759' },
  { name: 'Mint & Türkis', color: '#00C7BE' },
  { name: 'Graphit', color: '#8E8E93' },
];

export function getSubjectIcon(iconName: string): React.ComponentType<{ className?: string }> {
  switch (iconName?.toLowerCase()) {
    case 'calculator':
    case 'math':
      return Calculator;
    case 'bookopen':
    case 'book':
    case 'german':
      return BookOpen;
    case 'languages':
    case 'globe':
    case 'english':
      return Languages;
    case 'atom':
    case 'physics':
      return Atom;
    case 'leaf':
    case 'bio':
    case 'biology':
      return Leaf;
    case 'landmark':
    case 'history':
      return Landmark;
    case 'code':
    case 'info':
    case 'computer':
      return Code;
    case 'palette':
    case 'art':
      return Palette;
    case 'activity':
    case 'sport':
      return Activity;
    case 'music':
      return Music;
    default:
      return GraduationCap;
  }
}

export function getEventTypeBadge(type: CalendarEventType): {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
} {
  switch (type) {
    case 'lesson':
      return { label: 'Unterricht', bgColor: 'bg-blue-500/15', textColor: 'text-blue-500 dark:text-blue-400', borderColor: 'border-blue-500/30' };
    case 'exam':
      return { label: 'Klausur', bgColor: 'bg-red-500/15', textColor: 'text-red-500 dark:text-red-400', borderColor: 'border-red-500/30' };
    case 'test':
      return { label: 'Test / LK', bgColor: 'bg-amber-500/15', textColor: 'text-amber-500 dark:text-amber-400', borderColor: 'border-amber-500/30' };
    case 'homework':
      return { label: 'Hausaufgabe', bgColor: 'bg-orange-500/15', textColor: 'text-orange-500 dark:text-orange-400', borderColor: 'border-orange-500/30' };
    case 'submission':
      return { label: 'Abgabe', bgColor: 'bg-rose-500/15', textColor: 'text-rose-500 dark:text-rose-400', borderColor: 'border-rose-500/30' };
    case 'study':
      return { label: 'Lernen', bgColor: 'bg-purple-500/15', textColor: 'text-purple-500 dark:text-purple-400', borderColor: 'border-purple-500/30' };
    case 'leisure':
      return { label: 'Freizeit', bgColor: 'bg-teal-500/15', textColor: 'text-teal-500 dark:text-teal-400', borderColor: 'border-teal-500/30' };
    case 'personal':
      return { label: 'Persönlich', bgColor: 'bg-emerald-500/15', textColor: 'text-emerald-500 dark:text-emerald-400', borderColor: 'border-emerald-500/30' };
    case 'other':
    default:
      return { label: 'Termin', bgColor: 'bg-gray-500/15', textColor: 'text-gray-500 dark:text-gray-400', borderColor: 'border-gray-500/30' };
  }
}

export function hexToRgba(hex: string, alpha: number = 1): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
