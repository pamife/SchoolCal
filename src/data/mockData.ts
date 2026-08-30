import type {
  Subject,
  Teacher,
  Room,
  SchedulePeriodTime,
  ScheduleEntry,
  Substitution,
  CalendarEvent,
  Homework,
  Exam,
  UserSettings,
  UserProfile,
} from '../types';

export const MOCK_USER: UserProfile = {
  uid: 'demo-user-123',
  displayName: 'Paul Schmidt',
  email: 'paul.schmidt@schueler-mail.de',
  photoURL: '',
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-30T12:00:00Z',
};

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'sub-mathe', name: 'Mathematik', shortName: 'M', color: '#007AFF', icon: 'Calculator', teacherId: 'teach-mueller', defaultRoomId: 'room-204' },
  { id: 'sub-deutsch', name: 'Deutsch', shortName: 'D', color: '#FF3B30', icon: 'BookOpen', teacherId: 'teach-schmidt', defaultRoomId: 'room-204' },
  { id: 'sub-englisch', name: 'Englisch', shortName: 'E', color: '#5856D6', icon: 'Languages', teacherId: 'teach-weber', defaultRoomId: 'room-101' },
  { id: 'sub-physik', name: 'Physik', shortName: 'PH', color: '#32ADE6', icon: 'Atom', teacherId: 'teach-becker', defaultRoomId: 'room-p1' },
  { id: 'sub-biologie', name: 'Biologie', shortName: 'BIO', color: '#34C759', icon: 'Leaf', teacherId: 'teach-fischer', defaultRoomId: 'room-204' },
  { id: 'sub-geschichte', name: 'Geschichte', shortName: 'G', color: '#FF9500', icon: 'Landmark', teacherId: 'teach-schmidt', defaultRoomId: 'room-204' },
  { id: 'sub-informatik', name: 'Informatik', shortName: 'INF', color: '#AF52DE', icon: 'Code', teacherId: 'teach-mueller', defaultRoomId: 'room-inf2' },
  { id: 'sub-kunst', name: 'Kunst', shortName: 'KU', color: '#FF2D55', icon: 'Palette', teacherId: 'teach-hoffmann', defaultRoomId: 'room-k2' },
  { id: 'sub-sport', name: 'Sport', shortName: 'SPO', color: '#00C7BE', icon: 'Activity', teacherId: 'teach-weber', defaultRoomId: 'room-sp1' },
];

export const MOCK_TEACHERS: Teacher[] = [
  { id: 'teach-mueller', name: 'Herr Dr. Müller', shortName: 'MÜL', email: 'mueller@goethe-gymnasium.de', title: 'Dr.', subjects: ['sub-mathe', 'sub-informatik'] },
  { id: 'teach-schmidt', name: 'Frau Schmidt', shortName: 'SCH', email: 'schmidt@goethe-gymnasium.de', title: 'StRin', subjects: ['sub-deutsch', 'sub-geschichte'] },
  { id: 'teach-weber', name: 'Herr Weber', shortName: 'WEB', email: 'weber@goethe-gymnasium.de', title: 'OStR', subjects: ['sub-englisch', 'sub-sport'] },
  { id: 'teach-becker', name: 'Frau Becker', shortName: 'BEC', email: 'becker@goethe-gymnasium.de', title: 'StRin', subjects: ['sub-physik', 'sub-mathe'] },
  { id: 'teach-fischer', name: 'Herr Fischer', shortName: 'FIS', email: 'fischer@goethe-gymnasium.de', title: 'StR', subjects: ['sub-biologie'] },
  { id: 'teach-hoffmann', name: 'Frau Hoffmann', shortName: 'HOF', email: 'hoffmann@goethe-gymnasium.de', title: 'StRin', subjects: ['sub-kunst'] },
];

export const MOCK_ROOMS: Room[] = [
  { id: 'room-204', name: 'Raum 204', building: 'Hauptgebäude', floor: '2. Stock', notes: 'Klassenzimmer 10b' },
  { id: 'room-101', name: 'Raum 101', building: 'Hauptgebäude', floor: '1. Stock', notes: 'Sprachenraum' },
  { id: 'room-301', name: 'Raum 301', building: 'Hauptgebäude', floor: '3. Stock', notes: 'Fachraum Mathematik' },
  { id: 'room-p1', name: 'Physiksaal P1', building: 'Trakt B', floor: 'Erdgeschoss', notes: 'Optik-Labor' },
  { id: 'room-inf2', name: 'Computerraum INF-2', building: 'Trakt C', floor: '1. Stock', notes: '30 iMac Workstations' },
  { id: 'room-sp1', name: 'Dreifach-Turnhalle', building: 'Sportzentrum', floor: 'EG', notes: 'Halle 1 & 2' },
  { id: 'room-k2', name: 'Kunstatelier K2', building: 'Altbau', floor: 'Dachgeschoss', notes: 'Staffeleien vorhanden' },
];

export const DEFAULT_PERIOD_TIMES: SchedulePeriodTime[] = [
  { period: 1, startTime: '08:00', endTime: '08:45' },
  { period: 2, startTime: '08:50', endTime: '09:35' },
  { period: 3, startTime: '09:55', endTime: '10:40' },
  { period: 4, startTime: '10:45', endTime: '11:30' },
  { period: 5, startTime: '11:45', endTime: '12:30' },
  { period: 6, startTime: '12:35', endTime: '13:20' },
  { period: 7, startTime: '14:05', endTime: '14:50' },
  { period: 8, startTime: '14:55', endTime: '15:40' },
];

export const MOCK_SCHEDULE_ENTRIES: ScheduleEntry[] = [
  // Montag (dayOfWeek: 1)
  { id: 'sch-mo-1', dayOfWeek: 1, period: 1, startTime: '08:00', endTime: '08:45', subjectId: 'sub-mathe', teacherId: 'teach-mueller', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-mo-2', dayOfWeek: 1, period: 2, startTime: '08:50', endTime: '09:35', subjectId: 'sub-mathe', teacherId: 'teach-mueller', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-mo-3', dayOfWeek: 1, period: 3, startTime: '09:55', endTime: '10:40', subjectId: 'sub-deutsch', teacherId: 'teach-schmidt', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-mo-4', dayOfWeek: 1, period: 4, startTime: '10:45', endTime: '11:30', subjectId: 'sub-englisch', teacherId: 'teach-weber', roomId: 'room-101', versionId: 'default' },
  { id: 'sch-mo-5', dayOfWeek: 1, period: 5, startTime: '11:45', endTime: '12:30', subjectId: 'sub-physik', teacherId: 'teach-becker', roomId: 'room-p1', versionId: 'default' },
  { id: 'sch-mo-6', dayOfWeek: 1, period: 6, startTime: '12:35', endTime: '13:20', subjectId: 'sub-physik', teacherId: 'teach-becker', roomId: 'room-p1', versionId: 'default' },

  // Dienstag (dayOfWeek: 2)
  { id: 'sch-di-1', dayOfWeek: 2, period: 1, startTime: '08:00', endTime: '08:45', subjectId: 'sub-biologie', teacherId: 'teach-fischer', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-di-2', dayOfWeek: 2, period: 2, startTime: '08:50', endTime: '09:35', subjectId: 'sub-biologie', teacherId: 'teach-fischer', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-di-3', dayOfWeek: 2, period: 3, startTime: '09:55', endTime: '10:40', subjectId: 'sub-mathe', teacherId: 'teach-mueller', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-di-4', dayOfWeek: 2, period: 4, startTime: '10:45', endTime: '11:30', subjectId: 'sub-geschichte', teacherId: 'teach-schmidt', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-di-5', dayOfWeek: 2, period: 5, startTime: '11:45', endTime: '12:30', subjectId: 'sub-sport', teacherId: 'teach-weber', roomId: 'room-sp1', versionId: 'default' },
  { id: 'sch-di-6', dayOfWeek: 2, period: 6, startTime: '12:35', endTime: '13:20', subjectId: 'sub-sport', teacherId: 'teach-weber', roomId: 'room-sp1', versionId: 'default' },

  // Mittwoch (dayOfWeek: 3)
  { id: 'sch-mi-1', dayOfWeek: 3, period: 1, startTime: '08:00', endTime: '08:45', subjectId: 'sub-englisch', teacherId: 'teach-weber', roomId: 'room-101', versionId: 'default' },
  { id: 'sch-mi-2', dayOfWeek: 3, period: 2, startTime: '08:50', endTime: '09:35', subjectId: 'sub-englisch', teacherId: 'teach-weber', roomId: 'room-101', versionId: 'default' },
  { id: 'sch-mi-3', dayOfWeek: 3, period: 3, startTime: '09:55', endTime: '10:40', subjectId: 'sub-informatik', teacherId: 'teach-mueller', roomId: 'room-inf2', versionId: 'default' },
  { id: 'sch-mi-4', dayOfWeek: 3, period: 4, startTime: '10:45', endTime: '11:30', subjectId: 'sub-informatik', teacherId: 'teach-mueller', roomId: 'room-inf2', versionId: 'default' },
  { id: 'sch-mi-5', dayOfWeek: 3, period: 5, startTime: '11:45', endTime: '12:30', subjectId: 'sub-deutsch', teacherId: 'teach-schmidt', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-mi-6', dayOfWeek: 3, period: 6, startTime: '12:35', endTime: '13:20', subjectId: 'sub-geschichte', teacherId: 'teach-schmidt', roomId: 'room-204', versionId: 'default' },

  // Donnerstag (dayOfWeek: 4)
  { id: 'sch-do-1', dayOfWeek: 4, period: 1, startTime: '08:00', endTime: '08:45', subjectId: 'sub-deutsch', teacherId: 'teach-schmidt', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-do-2', dayOfWeek: 4, period: 2, startTime: '08:50', endTime: '09:35', subjectId: 'sub-deutsch', teacherId: 'teach-schmidt', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-do-3', dayOfWeek: 4, period: 3, startTime: '09:55', endTime: '10:40', subjectId: 'sub-mathe', teacherId: 'teach-mueller', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-do-4', dayOfWeek: 4, period: 4, startTime: '10:45', endTime: '11:30', subjectId: 'sub-biologie', teacherId: 'teach-fischer', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-do-5', dayOfWeek: 4, period: 5, startTime: '11:45', endTime: '12:30', subjectId: 'sub-kunst', teacherId: 'teach-hoffmann', roomId: 'room-k2', versionId: 'default' },
  { id: 'sch-do-6', dayOfWeek: 4, period: 6, startTime: '12:35', endTime: '13:20', subjectId: 'sub-kunst', teacherId: 'teach-hoffmann', roomId: 'room-k2', versionId: 'default' },
  { id: 'sch-do-7', dayOfWeek: 4, period: 7, startTime: '14:05', endTime: '14:50', subjectId: 'sub-informatik', teacherId: 'teach-mueller', roomId: 'room-inf2', versionId: 'default' },

  // Freitag (dayOfWeek: 5)
  { id: 'sch-fr-1', dayOfWeek: 5, period: 1, startTime: '08:00', endTime: '08:45', subjectId: 'sub-englisch', teacherId: 'teach-weber', roomId: 'room-101', versionId: 'default' },
  { id: 'sch-fr-2', dayOfWeek: 5, period: 2, startTime: '08:50', endTime: '09:35', subjectId: 'sub-physik', teacherId: 'teach-becker', roomId: 'room-p1', versionId: 'default' },
  { id: 'sch-fr-3', dayOfWeek: 5, period: 3, startTime: '09:55', endTime: '10:40', subjectId: 'sub-mathe', teacherId: 'teach-mueller', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-fr-4', dayOfWeek: 5, period: 4, startTime: '10:45', endTime: '11:30', subjectId: 'sub-mathe', teacherId: 'teach-mueller', roomId: 'room-204', versionId: 'default' },
  { id: 'sch-fr-5', dayOfWeek: 5, period: 5, startTime: '11:45', endTime: '12:30', subjectId: 'sub-deutsch', teacherId: 'teach-schmidt', roomId: 'room-204', versionId: 'default' },
];

export const MOCK_SUBSTITUTIONS: Substitution[] = [
  {
    id: 'subst-1',
    scheduleEntryId: 'sch-mo-5',
    date: '2026-08-31',
    type: 'teacher_change',
    newTeacherId: 'teach-schmidt',
    newRoomId: 'room-101',
    note: 'Frau Schmidt vertritt Frau Becker (Aufgaben im Schulportal)',
  },
  {
    id: 'subst-2',
    scheduleEntryId: 'sch-do-7',
    date: '2026-09-03',
    type: 'cancelled',
    note: 'Informatik-AG entfällt diese Woche wegen Lehrerkonferenz',
  }
];

export const MOCK_HOMEWORK: Homework[] = [
  {
    id: 'hw-1',
    title: 'Mathematik Buch S. 142 Nr. 4, 7a-d',
    description: 'Extremwertaufgaben mit Nebenbedingung (Volumenoptimierung Zylinder)',
    subjectId: 'sub-mathe',
    dueDate: '2026-09-01',
    dueTime: '08:00',
    priority: 'high',
    status: 'todo',
    createdAt: '2026-08-28T14:30:00Z',
  },
  {
    id: 'hw-2',
    title: 'Englisch: Essay "Social Media & Teen Identity"',
    description: 'Mindestens 350 Wörter strukturieren und Vokabeln aus Unit 2 einbinden.',
    subjectId: 'sub-englisch',
    dueDate: '2026-09-02',
    dueTime: '08:00',
    priority: 'normal',
    status: 'in_progress',
    createdAt: '2026-08-27T10:00:00Z',
  },
  {
    id: 'hw-3',
    title: 'Physik: Versuchsprotokoll Brechungsgesetz',
    description: 'Diagramm mit Excel/Geogebra erstellen und Grenzwinkel der Totalreflexion berechnen.',
    subjectId: 'sub-physik',
    dueDate: '2026-09-04',
    dueTime: '08:50',
    priority: 'high',
    status: 'todo',
    createdAt: '2026-08-29T11:00:00Z',
  },
  {
    id: 'hw-4',
    title: 'Geschichte: Textquellenanalyse Bismarck',
    description: 'Rede "Blut und Eisen" (1862) lesen und historische Leitfragen beantworten.',
    subjectId: 'sub-geschichte',
    dueDate: '2026-09-08',
    dueTime: '10:45',
    priority: 'low',
    status: 'todo',
    createdAt: '2026-08-29T12:00:00Z',
  },
  {
    id: 'hw-5',
    title: 'Biologie: Zellteilung / Mitose Phasen zeichnen',
    description: 'Skizzen der Prophase, Metaphase, Anaphase und Telophase ins Heft.',
    subjectId: 'sub-biologie',
    dueDate: '2026-08-29',
    dueTime: '08:00',
    priority: 'normal',
    status: 'done',
    createdAt: '2026-08-25T15:00:00Z',
    completedAt: '2026-08-28T18:00:00Z',
  },
];

export const MOCK_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    title: '1. Klausur Mathematik',
    subjectId: 'sub-mathe',
    type: 'exam',
    date: '2026-09-08',
    startTime: '08:00',
    endTime: '09:35',
    roomId: 'room-204',
    teacherId: 'teach-mueller',
    topics: [
      { id: 'top-1', title: 'Differentialrechnung & Ableitungsregeln', completed: true },
      { id: 'top-2', title: 'Kurvendiskussion ganzrationaler Funktionen', completed: true },
      { id: 'top-3', title: 'Extremwertaufgaben mit Nebenbedingungen', completed: true },
      { id: 'top-4', title: 'Tangenten- und Normalengleichungen', completed: false },
      { id: 'top-5', title: 'Anwendungsaufgaben im Sachzusammenhang', completed: false },
    ],
    studyProgress: 65,
    notes: 'Hilfsmittel: Formelsammlung & grafikfähiger Taschenrechner erlaubt.',
  },
  {
    id: 'exam-2',
    title: 'Physik Kurzkontrolle',
    subjectId: 'sub-physik',
    type: 'test',
    date: '2026-09-04',
    startTime: '08:50',
    endTime: '09:35',
    roomId: 'room-p1',
    teacherId: 'teach-becker',
    topics: [
      { id: 'top-p1', title: 'Lichtbrechung nach Snellius', completed: true },
      { id: 'top-p2', title: 'Totalreflexion & Lichtleiter', completed: true },
      { id: 'top-p3', title: 'Optische Linsen und Abbildungsgesetze', completed: true },
      { id: 'top-p4', title: 'Konstruktion von Strahlengängen', completed: false },
    ],
    studyProgress: 75,
    notes: '20-minütiger schriftlicher Zwischentest.',
  },
  {
    id: 'exam-3',
    title: 'Englisch Schulaufgabe',
    subjectId: 'sub-englisch',
    type: 'exam',
    date: '2026-09-17',
    startTime: '08:00',
    endTime: '09:35',
    roomId: 'room-101',
    teacherId: 'teach-weber',
    topics: [
      { id: 'top-e1', title: 'Vocabulary Units 1 - 3', completed: false },
      { id: 'top-e2', title: 'Text Analysis & Stylistic Devices', completed: false },
      { id: 'top-e3', title: 'Opinion Essay Structure', completed: true },
      { id: 'top-e4', title: 'Mediation (German to English)', completed: false },
    ],
    studyProgress: 25,
    notes: 'Zweisprachiges Wörterbuch ab Teil 2 gestattet.',
  },
  {
    id: 'exam-4',
    title: 'Informatik Projektpräsentation',
    subjectId: 'sub-informatik',
    type: 'presentation',
    date: '2026-09-24',
    startTime: '09:55',
    endTime: '11:30',
    roomId: 'room-inf2',
    teacherId: 'teach-mueller',
    topics: [
      { id: 'top-i1', title: 'Objektorientierte Modellierung (UML)', completed: true },
      { id: 'top-i2', title: 'Implementierung in Python/Java', completed: false },
      { id: 'top-i3', title: 'Präsentationsfolien fertigstellen', completed: false },
    ],
    studyProgress: 40,
    notes: 'Gruppenpräsentation mit max. 15 Minuten Vortragszeit.',
  },
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Zahnarzt Kontrolltermin',
    description: 'Routine-Check & Zahnspangenkontrolle',
    type: 'personal',
    startDate: '2026-09-02T16:00:00',
    endDate: '2026-09-02T16:45:00',
    location: 'Praxis Dr. Sommer, Stadtplatz 4',
    color: '#34C759',
    reminderMinutes: 60,
    recurrence: 'none',
  },
  {
    id: 'evt-2',
    title: 'Volleyball Jugendtraining',
    description: 'TSV Sporthalle West - Hallenschuhe mitnehmen!',
    type: 'leisure',
    startDate: '2026-09-01T18:00:00',
    endDate: '2026-09-01T19:30:00',
    location: 'TSV Turnhalle',
    color: '#00C7BE',
    reminderMinutes: 30,
    recurrence: 'weekly',
  },
  {
    id: 'evt-3',
    title: 'Lerngruppe Mathe (Analysis)',
    description: 'Altklausuren durchrechnen bei Jonas',
    type: 'study',
    startDate: '2026-09-06T15:00:00',
    endDate: '2026-09-06T17:30:00',
    location: 'Stadtbibliothek Lernraum 3',
    color: '#007AFF',
    subjectId: 'sub-mathe',
    reminderMinutes: 60,
    recurrence: 'none',
  },
  {
    id: 'evt-4',
    title: 'Schülerratssitzung',
    description: 'Planung des Herbstsportfests & Schulfest-Stände',
    type: 'other',
    startDate: '2026-09-03T13:30:00',
    endDate: '2026-09-03T14:30:00',
    location: 'Aula',
    color: '#AF52DE',
    reminderMinutes: 15,
    recurrence: 'none',
  }
];

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'system',
  accentColor: '#007AFF',
  state: 'BY',
  schoolName: 'Goethe-Gymnasium',
  gradeLevel: 'Klasse 10b',
  periodTimes: DEFAULT_PERIOD_TIMES,
  defaultCalendarView: 'week',
  notificationsEnabled: true,
  dailySummaryTime: '07:15',
  activeTimetableVersion: 'default',
};
