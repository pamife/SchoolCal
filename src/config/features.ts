import type { UserPlan } from '../types';

export const PLAN_LEVELS: Record<UserPlan, number> = {
  STANDARD: 0,
  PLUS: 1,
  PRO: 2,
};

export interface PlanMeta {
  id: UserPlan;
  name: string;
  badgeLabel: string;
  badgeColor: string; // Tailwind color classes
  description: string;
  priceLabel: string;
  features: string[];
}

export const PLAN_INFO: Record<UserPlan, PlanMeta> = {
  STANDARD: {
    id: 'STANDARD',
    name: 'Standard',
    badgeLabel: 'Free',
    badgeColor: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    description: 'Dein vollständiger persönlicher Schulplaner – dauerhaft kostenlos.',
    priceLabel: 'Kostenlos',
    features: [
      'Smart Day – Basis-Tagesübersicht',
      'Basis-Schulstatistiken (Woche & Aufgaben)',
      'Grundlegende Unterrichts- & Aufgaben-Erinnerungen',
      'Unbegrenzte Fächer, Lehrer & Räume',
      'Stundenplan mit Glockenzeiten & Pausen',
      'Hausaufgaben- & Aufgabenplaner',
      'Klausuren- & Prüfungskalender',
      'Apple Kalender (.ics) & Backup-Export',
      'Bundesland-Ferienkalender 2026/2027',
      'Cloud-Synchronisation über Firebase',
      'iPhone, iPad & Web-App (PWA)',
    ],
  },
  PLUS: {
    id: 'PLUS',
    name: 'Plus',
    badgeLabel: 'Plus',
    badgeColor: 'bg-ios-blue text-white shadow-xs',
    description: 'Für Schülerinnen und Schüler, die das Maximum an Produktivität wollen.',
    priceLabel: 'Premium Lizenz',
    features: [
      'Alle Standard-Funktionen inklusive',
      'Erweiterter Smart Day mit Vertretungen & Vorankündigungen',
      'Detaillierte Fächer-Statistiken & Monats-/Jahresauswertungen',
      'Erweiterte Benachrichtigungen & Quiet Hours (Ruhezeiten)',
      'WebUntis Stundenplan-Synchronisation & Vertretungs-Push',
      'Mehrere Stundenplan-Versionen (Woche A/B)',
      'Eigene Akzentfarben & Layout-Anpassungen',
      'Prioritärer Support & schnelle Updates',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    badgeLabel: 'Pro',
    badgeColor: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs',
    description: 'Das ultimative Schul-Cockpit mit intelligenter Planung & Notenanalyse.',
    priceLabel: 'Exklusive Pro Lizenz',
    features: [
      'Alle Plus- und Standard-Funktionen',
      'KI-Schulassistent mit Echtzeit-Kontext aus Stundenplan & Aufgaben',
      'KI-Lernzeitplaner & Klausurvorbereitung mit Aktions-Bestätigung',
      'KI-gestützte Smart-Day-Tagesbriefings & Empfehlungen',
      'Langzeit-Trendstatistiken & Noten-Analysen',
      'Notenverwaltung, Schnitte & Notenspiegel',
      'Detaillierte PDF-Berichte',
      'Alle zukünftigen Premium-Features inklusive',
    ],
  },
};

export const FEATURE_GATES = {
  // Standard-Tier (Level 0)
  calendar: 'STANDARD',
  timetable: 'STANDARD',
  homework: 'STANDARD',
  exams: 'STANDARD',
  holidays: 'STANDARD',
  periodSchedule: 'STANDARD',
  backupExport: 'STANDARD',
  smartDayBasic: 'STANDARD',
  basicStats: 'STANDARD',
  basicNotifications: 'STANDARD',

  // Plus-Tier (Level 1)
  smartDayAdvanced: 'PLUS',
  advancedStats: 'PLUS',
  advancedNotifications: 'PLUS',
  webuntisNotifications: 'PLUS',
  webuntisSync: 'PLUS',
  advancedReminders: 'PLUS',
  multiWeekSchedule: 'PLUS',
  customThemes: 'PLUS',
  cloudAutoSync: 'PLUS',

  // Pro-Tier (Level 2)
  aiSchoolAssistant: 'PRO',
  aiSmartDay: 'PRO',
  aiSmartPlanning: 'PRO',
  proStats: 'PRO',
  gradeAnalytics: 'PRO',
  advancedWebUntis: 'PRO',
  examSuccessAnalytics: 'PRO',
  exportPdfReports: 'PRO',
  prioritySupport: 'PRO',
} as const;

export type FeatureKey = keyof typeof FEATURE_GATES;

/**
 * Checks if a user's plan is equal to or higher than the required plan.
 * Standard (0) < Plus (1) < Pro (2)
 */
export function isPlanEligible(userPlan: UserPlan, requiredPlan: UserPlan): boolean {
  const userLevel = PLAN_LEVELS[userPlan] ?? 0;
  const requiredLevel = PLAN_LEVELS[requiredPlan] ?? 0;
  return userLevel >= requiredLevel;
}

/**
 * Returns the required plan for a specific feature key.
 */
export function getRequiredPlanForFeature(feature: FeatureKey): UserPlan {
  return FEATURE_GATES[feature] ?? 'STANDARD';
}

