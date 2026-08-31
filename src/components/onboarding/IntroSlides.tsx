import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  BellRing,
  Smartphone,
  Tablet,
  Laptop,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../common/Button';

interface IntroSlidesProps {
  onCompleteIntro: () => void;
  onSkipAll: () => void;
}

export const IntroSlides: React.FC<IntroSlidesProps> = ({
  onCompleteIntro,
  onSkipAll,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'welcome',
      icon: BookOpen,
      iconGradient: 'from-ios-blue to-indigo-600',
      badge: 'Willkommen 👋',
      badgeVariant: 'blue' as const,
      title: 'Willkommen bei SchoolCal',
      subtitle: 'Dein Schulalltag. Einfach organisiert.',
      description:
        'Der moderne, intelligente Schulbegleiter für Stundenplan, Aufgaben, Klausuren und Benachrichtigungen.',
      illustration: (
        <div className="relative w-full h-36 flex items-center justify-center">
          <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-ios-blue via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 animate-pulse">
            <BookOpen className="w-10 h-10" />
          </div>
        </div>
      ),
      buttonText: 'Weiter',
    },
    {
      id: 'all_in_one',
      icon: Calendar,
      iconGradient: 'from-blue-500 to-cyan-500',
      badge: 'Alles an einem Ort',
      badgeVariant: 'blue' as const,
      title: 'Dein Schulalltag. Endlich an einem Ort.',
      subtitle: 'Kalender, Stundenplan, Aufgaben und Prüfungen.',
      description:
        'Kein Zettelchaos mehr: Alle Termine, Fächer und Fristen sind übersichtlich und strukturiert gebündelt.',
      illustration: (
        <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
            <Calendar className="w-5 h-5 text-ios-blue mx-auto mb-1" />
            <div className="text-xs font-bold text-gray-900 dark:text-white">Kalender</div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
            <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <div className="text-xs font-bold text-gray-900 dark:text-white">Stundenplan</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-xs font-bold text-gray-900 dark:text-white">Aufgaben</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
            <Sparkles className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-xs font-bold text-gray-900 dark:text-white">Klausuren</div>
          </div>
        </div>
      ),
      buttonText: 'Weiter',
    },
    {
      id: 'schedule',
      icon: Clock,
      iconGradient: 'from-indigo-500 to-purple-600',
      badge: 'Stundenplan & Smart Day',
      badgeVariant: 'purple' as const,
      title: 'Dein Stundenplan im Blick.',
      subtitle: 'Unterricht, Räume, Lehrer und Änderungen.',
      description:
        'Der intelligente Smart Day zeigt dir in Echtzeit die aktuelle und nächste Stunde, Raumwechsel oder Vertretungen.',
      illustration: (
        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/10 max-w-xs mx-auto text-left shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold mb-1">
            <span>Als Nächstes • 3. Stunde</span>
            <span className="text-ios-blue font-bold">in 15 Min</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ios-blue text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              M
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Mathematik</div>
              <div className="text-[11px] text-gray-500">Raum 204 • Herr Fischer</div>
            </div>
          </div>
        </div>
      ),
      buttonText: 'Weiter',
    },
    {
      id: 'homework_engine',
      icon: CheckCircle2,
      iconGradient: 'from-amber-500 to-orange-500',
      badge: 'Smarte Fristen',
      badgeVariant: 'amber' as const,
      title: 'Nie wieder eine Aufgabe vergessen.',
      subtitle: 'Automatische Fälligkeiten anhand deines Stundenplans.',
      description:
        'SchoolCal schlägt automatisch die nächste Stunde des Fachs als Frist vor. Du kannst das Datum jederzeit anpassen.',
      illustration: (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 max-w-xs mx-auto text-left">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">Deutsch Buch S. 42</span>
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-1">
            ⚡ Frist automatisch ermittelt: Nächste Deutschstunde (Mittwoch)
          </div>
        </div>
      ),
      buttonText: 'Weiter',
    },
    {
      id: 'notifications',
      icon: BellRing,
      iconGradient: 'from-rose-500 to-red-600',
      badge: 'Immer informiert',
      badgeVariant: 'red' as const,
      title: 'Bleib rechtzeitig informiert.',
      subtitle: 'Ausfälle, Vertretungen und wichtige Termine.',
      description:
        'Erhalte auf Wunsch diskrete Benachrichtigungen vor Unterrichtsbeginn, bei Raumänderungen oder anstehenden Klausuren.',
      illustration: (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 max-w-xs mx-auto flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-red-600 dark:text-red-400">Raumänderung Physik</div>
            <div className="text-[11px] text-gray-600 dark:text-gray-300">Heute in Physiksaal 2 statt Raum 101</div>
          </div>
        </div>
      ),
      buttonText: 'Weiter',
    },
    {
      id: 'sync',
      icon: Laptop,
      iconGradient: 'from-emerald-500 to-teal-600',
      badge: 'Cloud Sync',
      badgeVariant: 'green' as const,
      title: 'Alles auf deinen Geräten.',
      subtitle: 'Nahtlose Synchronisation in Echtzeit.',
      description:
        'Deine Daten werden sicher verschlüsselt über deinen SchoolCal-Account zwischen iPhone, iPad und Desktop synchronisiert.',
      illustration: (
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary flex items-center justify-center text-gray-800 dark:text-gray-200 shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500">iPhone</span>
          </div>

          <ArrowRight className="w-4 h-4 text-ios-blue animate-pulse" />

          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary flex items-center justify-center text-gray-800 dark:text-gray-200 shadow-xs">
              <Tablet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500">iPad</span>
          </div>

          <ArrowRight className="w-4 h-4 text-ios-blue animate-pulse" />

          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary flex items-center justify-center text-gray-800 dark:text-gray-200 shadow-xs">
              <Laptop className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500">Desktop</span>
          </div>
        </div>
      ),
      buttonText: 'SchoolCal einrichten',
    },
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onCompleteIntro();
    }
  };

  return (
    <div className="relative flex flex-col justify-between h-full min-h-[460px] p-6 text-center select-none">
      {/* Top Header: Progress indicators & Skip button */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {/* Slide Dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-6 bg-ios-blue'
                  : 'w-1.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'
              }`}
              aria-label={`Gehe zu Folie ${idx + 1}`}
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          type="button"
          onClick={onSkipAll}
          className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors px-2 py-1 rounded-lg"
        >
          Überspringen
        </button>
      </div>

      {/* Main Slide Content with Animation */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-sm space-y-4"
          >
            {/* Visual illustration */}
            <div className="my-2">{slide.illustration}</div>

            {/* Badge & Title */}
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-ios-blue/10 text-ios-blue">
                {slide.badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                {slide.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                {slide.subtitle}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pt-1">
                {slide.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer: Action Buttons */}
      <div className="pt-4 flex items-center gap-3">
        {currentSlide > 0 && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setCurrentSlide((prev) => prev - 1)}
          >
            Zurück
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleNext}
          icon={currentSlide === slides.length - 1 ? <Sparkles className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        >
          {slide.buttonText}
        </Button>
      </div>
    </div>
  );
};
