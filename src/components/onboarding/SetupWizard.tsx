import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  Clock,
  BellRing,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  Upload,
  Plus,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useClassTimetableStore } from '../../store/useClassTimetableStore';
import { fetchClassTimetable } from '../../services/school/classTimetableService';
import { ClassSelectionQuestionStep } from './ClassSelectionQuestionStep';
import { Button } from '../common/Button';
import { InstallGuideCard } from '../pwa/InstallGuideCard';
import { requestNotificationPermission } from '../../services/notifications/notificationService';
import type { CalendarViewType, NavigationTab, ClassTimetable } from '../../types';

interface SetupWizardProps {
  onComplete: () => void;
  onNavigateToTab?: (tab: NavigationTab) => void;
  onOpenWebUntis?: () => void;
}

type WizardStep =
  | 'profile'
  | 'school'
  | 'class_questions'
  | 'schedule'
  | 'notifications'
  | 'install'
  | 'completed';

export const SetupWizard: React.FC<SetupWizardProps> = ({
  onComplete,
  onNavigateToTab,
  onOpenWebUntis,
}) => {
  const { user, updateProfile } = useAuthStore();
  const { settings, updateSettings, setState } = useSettingsStore();
  const { classes, loadClasses, setStudentClassAndVariants } = useClassTimetableStore();

  const [currentStep, setCurrentStep] = useState<WizardStep>('profile');

  // Form State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [defaultCalendarView, setDefaultCalendarView] = useState<CalendarViewType>(
    settings.defaultCalendarView || 'week'
  );
  const [gradeLevel, setGradeLevel] = useState(settings.gradeLevel || '');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const schoolName = settings.schoolName || 'Christa-und-Peter-Scherpf-Gymnasium';
  const selectedState = settings.state || 'BB';
  const [scheduleChoice, setScheduleChoice] = useState<'admin' | 'manual' | 'import' | 'webuntis' | 'later' | null>(null);
  const [loadedClassTimetable, setLoadedClassTimetable] = useState<ClassTimetable | null>(null);
  const [isCheckingTimetable, setIsCheckingTimetable] = useState(false);

  // Notification status
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'granted' | 'denied'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'idle';
    }
    return 'idle';
  });

  const uid = user?.uid || '';
  const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';

  const stepsList: { id: WizardStep; label: string }[] = [
    { id: 'profile', label: 'Profil' },
    { id: 'school', label: 'Schule' },
    { id: 'schedule', label: 'Stundenplan' },
    { id: 'notifications', label: 'Mitteilungen' },
    { id: 'install', label: 'Installation' },
  ];

  const currentStepIndex = stepsList.findIndex((s) => s.id === currentStep);
  const progressPercent =
    currentStep === 'completed'
      ? 100
      : Math.round(((currentStepIndex >= 0 ? currentStepIndex : 0) / stepsList.length) * 100);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleSaveProfile = async () => {
    if (displayName.trim()) {
      updateProfile({ displayName: displayName.trim() });
    }
    await updateSettings({ defaultCalendarView }, uid);
    setCurrentStep('school');
  };

  const handleSaveSchool = async () => {
    setState(selectedState, uid);
    const effectiveGrade = selectedClassId
      ? classes.find((c) => c.id === selectedClassId)?.name || gradeLevel
      : gradeLevel;

    await updateSettings(
      { schoolName: schoolName.trim(), gradeLevel: effectiveGrade.trim(), state: selectedState },
      uid
    );

    if (selectedClassId) {
      setIsCheckingTimetable(true);
      try {
        const timetable = await fetchClassTimetable(selectedClassId, 'published');
        const classObj = classes.find((c) => c.id === selectedClassId);
        const className = classObj?.name || effectiveGrade;

        if (timetable && timetable.questions && timetable.questions.length > 0) {
          setLoadedClassTimetable(timetable);
          setScheduleChoice('admin');
          setCurrentStep('class_questions');
          return;
        } else if (timetable) {
          // Class has timetable without questions -> auto enroll immediately!
          setScheduleChoice('admin');
          await setStudentClassAndVariants(
            uid,
            selectedClassId,
            className,
            {},
            [],
            timetable.version || 1
          );
          setCurrentStep('notifications');
          return;
        }
      } catch (err) {
        console.warn('Error checking class timetable:', err);
      } finally {
        setIsCheckingTimetable(false);
      }
    }

    setCurrentStep('schedule');
  };

  const handleQuestionsComplete = async (
    answers: Record<string, string>,
    activeVariantIds: string[]
  ) => {
    const classObj = classes.find((c) => c.id === selectedClassId);
    const className = classObj?.name || gradeLevel;
    const version = loadedClassTimetable?.version || 1;

    await setStudentClassAndVariants(
      uid,
      selectedClassId,
      className,
      answers,
      activeVariantIds,
      version
    );

    setCurrentStep('notifications');
  };

  const handleSelectScheduleOption = async (choice: 'manual' | 'import' | 'webuntis' | 'later') => {
    setScheduleChoice(choice);
    setCurrentStep('notifications');
  };

  const handleRequestNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotificationStatus(result === 'granted' ? 'granted' : 'denied');
    await updateSettings(
      {
        notifications: {
          ...(settings.notifications as any),
          enabled: result === 'granted',
        },
      },
      uid
    );
  };

  const handleFinishWizard = async () => {
    await updateSettings(
      {
        onboardingCompleted: true,
        onboardingVersion: 1,
      },
      uid
    );

    if (scheduleChoice === 'manual' && onNavigateToTab) {
      onNavigateToTab('school');
    } else if (scheduleChoice === 'webuntis' && onOpenWebUntis) {
      onOpenWebUntis();
    }

    onComplete();
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[500px] p-5 sm:p-7 max-w-xl mx-auto select-none">
      {/* Top Header: Step Indicator & Skip */}
      {currentStep !== 'completed' && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ios-blue uppercase tracking-wider">
                Schritt {currentStepIndex + 1} von {stepsList.length}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {stepsList[currentStepIndex]?.label}
              </span>
            </div>

            <button
              type="button"
              onClick={handleFinishWizard}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              Einrichtung überspringen
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-ios-blue to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Step Container */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* STEP 1: PERSÖNLICHE EINSTELLUNGEN */}
          {/* ========================================================================= */}
          {currentStep === 'profile' && (
            <motion.div
              key="step-profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-1 text-center sm:text-left">
                <div className="w-10 h-10 rounded-2xl bg-ios-blue/15 text-ios-blue flex items-center justify-center mx-auto sm:mx-0 mb-2">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Persönliche Einstellungen
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Wie möchtest du in SchoolCal angesprochen werden?
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Dein Name
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. Paul Schmidt"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Bevorzugte Kalenderansicht
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'day', label: 'Tag' },
                      { id: '3days', label: '3 Tage' },
                      { id: 'week', label: 'Woche' },
                      { id: 'month', label: 'Monat' },
                    ].map((view) => (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => setDefaultCalendarView(view.id as CalendarViewType)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                          defaultCalendarView === view.id
                            ? 'bg-ios-blue text-white shadow-xs'
                            : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-ios-blue" />
                    <span>Zeitzone automatisch erkannt:</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{detectedTimeZone}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: DEINE KLASSE & SCHULE */}
          {/* ========================================================================= */}
          {currentStep === 'school' && (
            <motion.div
              key="step-school"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-1 text-center sm:text-left">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center mx-auto sm:mx-0 mb-2">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Deine Klasse & Schule
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  SchoolCal ist exklusiv für deine Schule vorkonfiguriert
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {/* Fixed School Badge Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-ios-blue px-2 py-0.5 rounded-full bg-blue-500/15">
                      Unterstützte Schule
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      Brandenburg (BB) 🇩🇪
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      Christa-und-Peter-Scherpf-Gymnasium
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      📍 Prenzlau, Dr.-Bähr-Straße 1
                    </p>
                  </div>
                </div>

                {/* Grade / Class input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Deine Klasse
                  </label>

                  {classes.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        value={selectedClassId}
                        onChange={(e) => {
                          const cId = e.target.value;
                          setSelectedClassId(cId);
                          const cls = classes.find((c) => c.id === cId);
                          if (cls) {
                            setGradeLevel(cls.name);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                      >
                        <option value="">– Klasse auswählen (z.B. 10A) –</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            Klasse {cls.name} (Stufe {cls.gradeLevel})
                          </option>
                        ))}
                      </select>

                      {selectedClassId ? (
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>
                            Stundenplan für Klasse{' '}
                            <strong className="underline font-bold">
                              {classes.find((c) => c.id === selectedClassId)?.name}
                            </strong>{' '}
                            gefunden! Wird automatisch eingerichtet.
                          </span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400">
                          Wähle deine Klasse aus, damit dein Stundenplan direkt automatisch bereitsteht.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="z.B. 10a, 9b, 11-1 oder Q12"
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Wird für deinen Stundenplan und WebUntis-Abgleich verwendet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2.1: BEDINGTE KLASSEN-FRAGEN (WENN VORHANDEN) */}
          {/* ========================================================================= */}
          {currentStep === 'class_questions' && loadedClassTimetable && (
            <motion.div
              key="step-class-questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ClassSelectionQuestionStep
                className={classes.find((c) => c.id === selectedClassId)?.name || gradeLevel}
                questions={loadedClassTimetable.questions}
                onComplete={handleQuestionsComplete}
                onBack={() => setCurrentStep('school')}
              />
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: STUNDENPLAN EINRICHTEN */}
          {/* ========================================================================= */}
          {currentStep === 'schedule' && (
            <motion.div
              key="step-schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-1 text-center sm:text-left">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center mx-auto sm:mx-0 mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Wie möchtest du deinen Stundenplan einrichten?
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Wähle deine bevorzugte Methode. Du kannst jederzeit später Anpassungen vornehmen.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSelectScheduleOption('manual')}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary hover:bg-gray-100 dark:hover:bg-ios-dark-tertiary border border-black/5 dark:border-white/10 text-left transition-all group flex flex-col justify-between gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-ios-blue/15 text-ios-blue flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Manuell erstellen
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Füge Fächer und Unterrichtsstunden direkt in die Wochenmatrix ein.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectScheduleOption('webuntis')}
                  className="p-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 text-left transition-all group flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white">
                      Plus
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Mit WebUntis verbinden
                    </h4>
                    <p className="text-xs text-purple-700/80 dark:text-purple-300/80 mt-0.5">
                      Automatische Synchronisation von Stundenplan & Vertretungen.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectScheduleOption('import')}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary hover:bg-gray-100 dark:hover:bg-ios-dark-tertiary border border-black/5 dark:border-white/10 text-left transition-all group flex flex-col justify-between gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Backup importieren
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Bestehende SchoolCal JSON- oder CSV-Datei wiederherstellen.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectScheduleOption('later')}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary hover:bg-gray-100 dark:hover:bg-ios-dark-tertiary border border-black/5 dark:border-white/10 text-left transition-all group flex flex-col justify-between gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Später einrichten
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Direkt zum Dashboard und den Plan später in den Einstellungen anlegen.
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: BENACHRICHTIGUNGEN */}
          {/* ========================================================================= */}
          {currentStep === 'notifications' && (
            <motion.div
              key="step-notifications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-1 text-center sm:text-left">
                <div className="w-10 h-10 rounded-2xl bg-red-500/15 text-red-600 flex items-center justify-center mx-auto sm:mx-0 mb-2">
                  <BellRing className="w-5 h-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Bleib auf dem Laufenden 🔔
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  SchoolCal kann dich zuverlässig erinnern und informieren über:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  'Bevorstehende Unterrichtsstunden',
                  'Fällige Hausaufgaben',
                  'Klausuren & Prüfungen',
                  'Unterrichtsausfälle',
                  'Vertretungen & Lehrerwechsel',
                  'Raumänderungen in Echtzeit',
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary flex items-center gap-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                {notificationStatus === 'granted' ? (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Benachrichtigungen sind erfolgreich aktiviert!</span>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleRequestNotifications}
                    icon={<BellRing className="w-4 h-4" />}
                  >
                    Benachrichtigungen jetzt aktivieren
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: APP INSTALLIEREN */}
          {/* ========================================================================= */}
          {currentStep === 'install' && (
            <motion.div
              key="step-install"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-1 text-center sm:text-left">
                <div className="w-10 h-10 rounded-2xl bg-ios-blue/15 text-ios-blue flex items-center justify-center mx-auto sm:mx-0 mb-2">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  SchoolCal auf deinem Gerät installieren
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Für Vollbild-Nutzung, Schnellzugriff und verlässliche Push-Mitteilungen
                </p>
              </div>

              {/* Dynamic Guide Card */}
              <InstallGuideCard
                compact={false}
                onInstalled={() => setCurrentStep('completed')}
              />
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* COMPLETED SCREEN */}
          {/* ========================================================================= */}
          {currentStep === 'completed' && (
            <motion.div
              key="step-completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  🎉 SchoolCal ist eingerichtet!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  Dein persönlicher Schulplaner ist einsatzbereit. Du kannst alle Einstellungen jederzeit anpassen.
                </p>
              </div>

              <div className="pt-4 max-w-xs mx-auto">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleFinishWizard}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Zum Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Controls in Footer */}
      {currentStep !== 'completed' && currentStep !== 'class_questions' && (
        <div className="pt-6 flex items-center justify-between gap-3 border-t border-black/5 dark:border-white/10 mt-6">
          {currentStepIndex > 0 ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setCurrentStep(stepsList[currentStepIndex - 1].id)}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Zurück
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentStep === 'profile' && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSaveProfile}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Weiter
              </Button>
            )}

            {currentStep === 'school' && (
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={isCheckingTimetable}
                onClick={handleSaveSchool}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                {isCheckingTimetable ? 'Prüft Plan...' : 'Weiter'}
              </Button>
            )}

            {currentStep === 'notifications' && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setCurrentStep('install')}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                {notificationStatus === 'granted' ? 'Weiter' : 'Später & Weiter'}
              </Button>
            )}

            {currentStep === 'install' && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setCurrentStep('completed')}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Einrichtung abschließen
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
