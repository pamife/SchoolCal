import type {
  SchoolProfile,
  SchedulePeriodTime,
  ScheduleBreak,
  SchoolWebUntisConfig,
  BreakDisplayMode,
} from '../types';

export const DEFAULT_SCHOOL_ID = 'christa-peter-scherpf-gymnasium-prenzlau';

/**
 * Offizielles zentrales Schulprofil des Christa-und-Peter-Scherpf-Gymnasiums Prenzlau
 */
export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  id: DEFAULT_SCHOOL_ID,
  name: 'Christa-und-Peter-Scherpf-Gymnasium',
  city: 'Prenzlau',
  state: 'BB',
  stateName: 'Brandenburg',
  country: 'Deutschland',
  enabled: true,
  timezone: 'Europe/Berlin',
  address: 'Dr.-Bähr-Straße 1, 17291 Prenzlau',
  phone: '03984 2314',
  email: 'scherpf-gymnasium.prenzlau@schulen.brandenburg.de',
  website: 'https://www.scherpf-gymnasium.de',
  openingHours: '06:30 – 17:00 Uhr',
  createdAt: '2026-08-31T00:00:00.000Z',
  updatedAt: '2026-08-31T00:00:00.000Z',
};

/**
 * Offizielle Unterrichtszeiten am Christa-und-Peter-Scherpf-Gymnasium Prenzlau
 * Gemäß Hausordnung / Pausenordnung (Einzelstunden à 45 Min. / Blockunterricht à 90 Min.)
 */
export const OFFICIAL_SCHERPF_PERIODS: SchedulePeriodTime[] = [
  { period: 1, startTime: '07:30', endTime: '08:15', label: '1. Stunde' },
  { period: 2, startTime: '08:20', endTime: '09:05', label: '2. Stunde' },
  { period: 3, startTime: '09:20', endTime: '10:05', label: '3. Stunde' },
  { period: 4, startTime: '10:10', endTime: '10:55', label: '4. Stunde' },
  { period: 5, startTime: '11:10', endTime: '11:55', label: '5. Stunde' },
  { period: 6, startTime: '12:00', endTime: '12:45', label: '6. Stunde' },
  { period: 7, startTime: '13:20', endTime: '14:05', label: '7. Stunde' },
  { period: 8, startTime: '14:10', endTime: '14:55', label: '8. Stunde' },
  { period: 9, startTime: '15:00', endTime: '15:45', label: '9. Stunde' },
  { period: 10, startTime: '15:45', endTime: '16:30', label: '10. Stunde' },
];

/**
 * Offizielle Pausenzeiten am Christa-und-Peter-Scherpf-Gymnasium Prenzlau
 * 1. Hofpause (15 Min), 2. Hofpause (15 Min), Mittagspause (35 Min)
 */
export const OFFICIAL_SCHERPF_BREAKS: ScheduleBreak[] = [
  {
    id: 'break-hof-1',
    name: '1. Hofpause',
    afterPeriod: 2,
    startTime: '09:05',
    endTime: '09:20',
  },
  {
    id: 'break-hof-2',
    name: '2. Hofpause',
    afterPeriod: 4,
    startTime: '10:55',
    endTime: '11:10',
  },
  {
    id: 'break-lunch',
    name: 'Mittagspause',
    afterPeriod: 6,
    startTime: '12:45',
    endTime: '13:20',
  },
];

/**
 * Standard WebUntis-Konfiguration exklusiv für das Gymnasium
 */
export const DEFAULT_WEBUNTIS_CONFIG: SchoolWebUntisConfig = {
  enabled: true,
  server: 'arche.webuntis.com',
  school: 'scherpf-gymnasium',
  schoolDisplayName: 'Christa-und-Peter-Scherpf-Gymnasium',
  allowAnonymous: false,
  supportsTimetable: true,
  supportsSubstitutions: true,
  supportsCancellations: true,
  supportsRooms: true,
  supportsTeachers: true,
  supportsHomework: true,
  supportsExams: true,
  lastSyncCheck: null,
};

export const DEFAULT_BREAK_DISPLAY_MODE: BreakDisplayMode = 'banner';
