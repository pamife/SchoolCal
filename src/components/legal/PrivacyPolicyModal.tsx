import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, AlertTriangle, FileText, Server, Bot, HelpCircle } from 'lucide-react';
import { Button } from '../common/Button';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
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
          className="relative w-full max-w-3xl max-h-[85dvh] flex flex-col bg-white dark:bg-ios-dark-card rounded-2xl shadow-2xl z-10 border border-black/5 dark:border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-ios-dark-secondary/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Datenschutzerklärung & Transparenz
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Informationen zur Datenverarbeitung nach Art. 13 & 14 DSGVO
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
              <strong>Hinweis für den Betreiber:</strong> Dies ist eine technisch exakt auf SchoolCal abgestimmte Vorlage. Gelb markierte Abschnitte mit <em>[Platzhaltern]</em> müssen vor dem öffentlichen Einsatz individuell ausgefüllt und <strong>RECHTLICH GEPRÜFT</strong> werden.
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            
            {/* 1. Verantwortlicher */}
            <section className="space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-ios-blue" />
                <span>1. Verantwortlicher für die Datenverarbeitung</span>
              </h4>
              <p>
                Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze ist:
              </p>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 font-mono text-xs text-gray-800 dark:text-gray-200 space-y-1">
                <div><strong>[Name / Vorname des Betreibers oder Schulträgers]</strong></div>
                <div><strong>[Straße und Hausnummer]</strong></div>
                <div><strong>[PLZ und Ort]</strong></div>
                <div>E-Mail: <strong>[E-Mail-Adresse für Datenschutz-Anfragen]</strong></div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 pt-1 font-sans">
                  ⚠️ <em>RECHTLICH PRÜFEN LASSEN: Trage hier deine echten Kontaktdaten ein.</em>
                </div>
              </div>
            </section>

            {/* 2. Grundprinzipien: Privacy by Design & Zero Tracking */}
            <section className="space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>2. Grundsätze: Privacy by Default & Null Werbetracking</span>
              </h4>
              <p>
                SchoolCal wurde nach den Grundsätzen von <strong>Privacy by Design</strong> und <strong>Privacy by Default</strong> (Art. 25 DSGVO) entwickelt:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Keine Tracking- oder Werbe-Cookies:</strong> Wir verwenden keinerlei Tracking-Dienste wie Google Analytics, Meta Pixel, PostHog oder Werbenetzwerke. Ein Cookie-Banner ist daher technisch nicht erforderlich.</li>
                <li><strong>Keine Weitergabe an Werbedritte:</strong> Deine Schuldaten, Noten und Termine werden niemals für Werbezwecke ausgewertet oder verkauft.</li>
                <li><strong>Strikte Datenisolation:</strong> Deine persönlichen Daten (Stundenpläne, Aufgaben, Klausuren, Noten) sind ausschließlich für dein eigenes Benutzerkonto zugänglich. Selbst App-Administratoren haben durch technische Datenbankregeln keinen Zugriff auf deine privaten Kalender- und Noteninhalte.</li>
              </ul>
            </section>

            {/* 3. Kategorien verarbeiteter Daten */}
            <section className="space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-500" />
                <span>3. Kategorien personenbezogener Daten & Verarbeitungszwecke</span>
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                  <strong>a) Benutzerkonto & Authentifizierung (Art. 6 Abs. 1 lit. b DSGVO):</strong>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    E-Mail-Adresse, verschlüsseltes Passwort (bzw. Google-Auth-Identifikator), optionaler Anzeigename. Dient dem Login und der Zuordnung deiner Daten.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                  <strong>b) Schul- und Planungsdaten (Art. 6 Abs. 1 lit. b DSGVO):</strong>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Stundenplan, Fächer, Lehrernamen, Räume, Hausaufgaben, Klausurtermine, persönliche Kalendertermine und Noten. Dient der Bereitstellung der Stundenplan- und Aufgabenverwaltung sowie des Smart Day Dashboards.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                  <strong>c) Lizenz- & Berechtigungsstatus:</strong>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Gewählter Tarif (Standard, Plus, Pro), kryptografischer SHA-256 Lizenz-Hash und Ablaufdatum. Dient der Tarifaktivierung und Funktionsfreischaltung.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Hosting & Externe Dienstleister */}
            <section className="space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-ios-blue" />
                <span>4. Hosting, Cloud-Infrastruktur & Auftragsverarbeitung</span>
              </h4>
              <p>Für den Betrieb der Anwendung nutzen wir sorgfältig ausgewählte Infrastrukturanbieter:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Google Firebase / Cloud Firestore (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland):</strong>
                  <br />
                  Bereitstellung von Firebase Authentication und Cloud Firestore zur sicheren, TLS-verschlüsselten Speicherung und Synchronisation deiner Nutzerdaten.
                </li>
                <li>
                  <strong>Netlify Inc. (512 2nd Street, Suite 200, San Francisco, CA 94107, USA):</strong>
                  <br />
                  Hosting der statischen Webanwendung und serverlosen API-Funktionen.
                </li>
              </ul>
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-300">
                ⚠️ <em>RECHTLICH PRÜFEN LASSEN: Auftragsverarbeitungsverträge (AVV / Data Processing Addendum) mit Google Cloud und Netlify in den jeweiligen Verwaltungskonsolen abschließen.</em>
              </div>
            </section>

            {/* 5. KI-Schulassistent */}
            <section className="space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <span>5. KI-Schulassistent (Google Gemini API)</span>
              </h4>
              <p>
                Wenn du den optionalen KI-Schulassistenten nutzt, wird deine Anfrage verarbeitet:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Datenminimierung:</strong> Es wird niemals deine gesamte Datenbank übertragen. Übermittelt werden ausschließlich der für die Anfrage notwendige Kontext (z.B. heutige Stunden und anstehende Aufgaben) sowie deine konkrete Frage.</li>
                <li><strong>Kein KI-Training:</strong> API-Keys und Backend-Anfragen über die Google Cloud Gemini API unterliegen den gewerblichen Datenschutzbestimmungen von Google Cloud (keine Nutzung deiner Daten für das Training öffentlicher Modelle).</li>
              </ul>
            </section>

            {/* 6. Betroffenenrechte (Löschung & Export) */}
            <section className="space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>6. Deine Rechte als betroffene Person (Art. 15–21 DSGVO)</span>
              </h4>
              <p>Du hast jederzeit folgende gesetzliche Rechte bezüglich deiner personenbezogenen Daten:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Auskunft & Datenübertragbarkeit (Art. 15 & 20 DSGVO):</strong> Du kannst in den Einstellungen unter <em>Datenschutz $\rightarrow$ Meine Daten exportieren</em> jederzeit eine vollständige, maschinenlesbare JSON-Kopie aller deiner Daten herunterladen.</li>
                <li><strong>Recht auf Löschung (Art. 17 DSGVO):</strong> Über den Button <em>Account & alle Daten löschen</em> in den Einstellungen kannst du dein Konto und alle damit verbundenen Firestore-Cloud-Daten sofort und unwiderruflich selbstständig löschen.</li>
                <li><strong>Berichtigung (Art. 16 DSGVO):</strong> Du kannst alle eingegebenen Schul- und Profildaten direkt in der App bearbeiten.</li>
                <li><strong>Beschwerderecht (Art. 77 DSGVO):</strong> Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung deiner Daten zu beschweren.</li>
              </ul>
            </section>

            {/* 7. Minderjährige & Schüler */}
            <section className="space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-ios-blue" />
                <span>7. Besondere Hinweise für Schülerinnen, Schüler und Eltern (Minderjährige)</span>
              </h4>
              <p>
                SchoolCal richtet sich an Schülerinnen und Schüler. Sofern Nutzer das 16. Lebensjahr noch nicht vollendet haben, ist für bestimmte Dienste (insbesondere kostenpflichtige Tarife oder die Nutzung externer Schnittstellen) die Zustimmung der Erziehungsberechtigten erforderlich.
              </p>
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-300">
                ⚠️ <em>RECHTLICH PRÜFEN LASSEN: Nationale Altersgrenzen für Dienste der Informationsgesellschaft (in Deutschland i.d.R. 16 Jahre nach Art. 8 DSGVO) und Einbeziehung von Erziehungsberechtigten vor offiziellem Schul-Rollout festlegen.</em>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-black/5 dark:border-white/10 flex justify-end shrink-0 bg-gray-50/50 dark:bg-ios-dark-secondary/50">
            <Button variant="primary" size="md" onClick={onClose}>
              Verstanden & Schließen
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
