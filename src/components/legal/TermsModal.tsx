import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          className="relative w-full max-w-2xl max-h-[85dvh] flex flex-col bg-white dark:bg-ios-dark-card rounded-2xl shadow-2xl z-10 border border-black/5 dark:border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-ios-dark-secondary/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Nutzungsbedingungen (Terms of Service)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Regeln für die Nutzung der SchoolCal WebApp
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner */}
          <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <strong>Hinweis für den Betreiber:</strong> Dies ist eine Standardvorlage für Schul- und Kalender-WebApps. Bei kommerzieller Nutzung oder Schuleinführung <strong>RECHTLICH PRÜFEN LASSEN</strong>.
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>1. Leistungsbeschreibung & Zweck</span>
              </h4>
              <p>
                SchoolCal ist eine persönliche Kalender- und Planungsanwendung für Schülerinnen und Schüler zur Organisation von Stundenplänen, Aufgaben, Klausuren und Terminen.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>2. Registrierung & Benutzerkonto</span>
              </h4>
              <p>
                Die Nutzung bestimmter Funktionen erfordert die Erstellung eines Benutzerkontos. Der Nutzer verpflichtet sich, seine Zugangsdaten vertraulich zu behandeln und vor dem Zugriff Dritter zu schützen.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>3. Lizenzmodell & Tarife (Standard, Plus, Pro)</span>
              </h4>
              <p>
                Der Basistarif <em>Standard</em> steht kostenlos zur Verfügung. Erweiterte Tarife (<em>Plus</em> und <em>Pro</em>) können über kryptografische Freischaltcodes aktiviert werden. Ein Weiterverkauf oder die Manipulation von Lizenzcodes ist untersagt.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>4. Haftungsausschluss für Fristen & Schulnoten</span>
              </h4>
              <p>
                SchoolCal dient als Organisationshilfe. Für verpasste Hausaufgabenfristen, fehlerhafte Raumangaben oder Prüfungsnoten wird keine Haftung übernommen. Maßgeblich sind stets die offiziellen Vorgaben der jeweiligen Schule bzw. der Lehrkräfte.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>5. Account-Kündigung & Löschung</span>
              </h4>
              <p>
                Nutzer können ihr Konto und alle gespeicherten Daten jederzeit selbstständig in den Einstellungen unwiderruflich löschen.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-black/5 dark:border-white/10 flex justify-end shrink-0 bg-gray-50/50 dark:bg-ios-dark-secondary/50">
            <Button variant="primary" size="md" onClick={onClose}>
              Schließen
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
