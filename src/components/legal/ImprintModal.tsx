import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, AlertTriangle, Mail, Phone, Globe } from 'lucide-react';
import { Button } from '../common/Button';

interface ImprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImprintModal: React.FC<ImprintModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-ios-dark-card rounded-2xl shadow-2xl z-10 border border-black/5 dark:border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-ios-dark-secondary/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-ios-blue flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Impressum
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)
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

          {/* Legal Notice Banner */}
          <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <strong>Hinweis für den Betreiber:</strong> Vor der Veröffentlichung müssen die untenstehenden Platzhalter durch die echten Kontaktdaten des Verantwortlichen ersetzt werden.
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Diensteanbieter</h4>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 font-mono text-xs text-gray-800 dark:text-gray-200 space-y-1">
                <div><strong>[Vorname und Nachname des Betreibers]</strong></div>
                <div><strong>[Straße und Hausnummer]</strong></div>
                <div><strong>[PLZ und Ort]</strong></div>
                <div><strong>[Land, z.B. Deutschland]</strong></div>
              </div>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Kontaktmöglichkeiten</h4>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 text-xs text-gray-800 dark:text-gray-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-ios-blue" />
                  <span>E-Mail: <strong>[deine-email@domain.de]</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>Telefon: <strong>[Telefonnummer oder optional falls gesetzlich nicht zwingend]</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-500" />
                  <span>Projekt-Repository: <strong>https://github.com/pamife/SchoolCal</strong></span>
                </div>
              </div>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Haftung für Inhalte & Links</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Als Diensteanbieter sind wir gemäß den allgemeinen Gesetzen für eigene Inhalte verantwortlich. Für von Nutzern eingegebene Stundenpläne, Notizen oder Termine übernimmt SchoolCal keine Haftung auf Richtigkeit.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Urheberrecht</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Die durch den Betreiber erstellten Inhalte und Werke in dieser Anwendung unterliegen dem deutschen Urheberrecht.
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
