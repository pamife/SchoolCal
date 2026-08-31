import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Smartphone,
  BellRing,
  Clock,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react';
import { InstallGuideCard } from '../pwa/InstallGuideCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface HelpAndInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'install' | 'notifications' | 'schedule' | 'webuntis' | 'account' | 'privacy' | 'faq';
  onOpenWebUntis?: () => void;
}

export const HelpAndInstallModal: React.FC<HelpAndInstallModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'install',
  onOpenWebUntis,
}) => {
  const [activeTab, setActiveTab] = useState<
    'install' | 'notifications' | 'schedule' | 'webuntis' | 'account' | 'privacy' | 'faq'
  >(initialTab);

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const helpTabs = [
    { id: 'install' as const, label: 'App installieren', icon: Smartphone },
    { id: 'notifications' as const, label: 'Benachrichtigungen', icon: BellRing },
    { id: 'schedule' as const, label: 'Stundenplan & Zeiten', icon: Clock },
    { id: 'webuntis' as const, label: 'WebUntis', icon: RefreshCw },
    { id: 'account' as const, label: 'Account & Sync', icon: UserCheck },
    { id: 'privacy' as const, label: 'Datenschutz', icon: ShieldCheck },
    { id: 'faq' as const, label: 'FAQ', icon: HelpCircle },
  ];

  const faqs = [
    {
      q: 'Wie kann ich SchoolCal später wieder schnell öffnen?',
      a: 'Wenn du SchoolCal auf deinem iPhone, iPad, Android-Gerät oder Computer über den Installationsassistenten zum Home-Bildschirm oder Dock hinzugefügt hast, öffnet sich die App mit nur einem Tippen – genau wie eine normale App aus dem App Store, ohne Browserleiste.',
    },
    {
      q: 'Warum erhalte ich auf dem iPhone keine Push-Benachrichtigungen?',
      a: 'Apple unterstützt Web-Push-Mitteilungen auf iOS (ab iOS 16.4) ausschließlich für Web-Apps, die zum Home-Bildschirm hinzugefügt wurden. Öffne SchoolCal in Safari, tippe auf das Teilen-Symbol und wähle „Zum Home-Bildschirm“. Danach können Benachrichtigungen in den iOS-Systemeinstellungen aktiviert werden.',
    },
    {
      q: 'Funktioniert SchoolCal auch ohne Internetverbindung (Offline)?',
      a: 'Ja! SchoolCal ist als moderne Progressive Web App (PWA) mit Offline-First-Technologie gebaut. Dein Stundenplan, deine Aufgaben und Noten werden lokal im Cache deines Geräts gespeichert und stehen auch im Flugmodus oder bei schlechtem Netz zur Verfügung.',
    },
    {
      q: 'Wie synchronisieren sich meine Daten zwischen iPhone, iPad und Laptop?',
      a: 'Sobald du mit deinem SchoolCal-Konto angemeldet bist, werden alle Änderungen in Echtzeit verschlüsselt über unsere Cloud synchronisiert. Erstellst du eine Aufgabe auf dem iPad, ist sie sofort auch auf deinem iPhone und Desktop sichtbar.',
    },
    {
      q: 'Werden meine Daten an Dritte weitergegeben oder getrackt?',
      a: 'Nein. SchoolCal verzichtet vollständig auf Werbetracking und invasive Analysedienste. Deine Schuldaten gehören ausschließlich dir.',
    },
    {
      q: 'Kann ich meine Daten sichern oder exportieren?',
      a: 'Ja, in den Einstellungen findest du jederzeit die Möglichkeit, ein vollständiges JSON-Backup herunterzuladen, deinen Stundenplan als CSV-Tabelle zu exportieren oder deine Termine im Apple Kalender (.ics Format) zu abonnieren.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-3xl bg-white dark:bg-ios-dark-card rounded-[26px] shadow-2xl overflow-hidden border border-black/10 dark:border-white/10 z-10 flex flex-col max-h-[88dvh] my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-ios-blue/15 text-ios-blue flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Hilfe & Installation
              </h3>
              <p className="text-xs text-gray-500">
                Anleitungen, Gerätetipps und Antworten auf häufige Fragen
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-2 px-4 sm:px-6 bg-gray-50 dark:bg-ios-dark-secondary/60 border-b border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar">
          {helpTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-ios-blue text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-4">
          {/* ========================================================================= */}
          {/* 1. APP INSTALLIEREN */}
          {/* ========================================================================= */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                  SchoolCal auf deinem Gerät installieren
                </h4>
                <p className="text-xs text-gray-500">
                  Wähle dein Gerät aus, um die passende Schritt-für-Schritt-Anleitung anzuzeigen.
                </p>
              </div>

              <InstallGuideCard compact={false} />
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. BENACHRICHTIGUNGEN */}
          {/* ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Benachrichtigungen & Mitteilungen einrichten
                </h4>
                <p className="text-xs text-gray-500">
                  So bleibst du über Unterrichtsbeginn, Aufgaben, Fristen und Ausfälle informiert.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                    <BellRing className="w-4 h-4 text-ios-blue" />
                    <span>Automatische Erinnerungen</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    SchoolCal erinnert dich wahlweise 5, 10, 15 oder 30 Minuten vor Stundenbeginn und berechnet bei Aufgaben intelligente Fälligkeits-Erinnerungen.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <span>Ruhezeiten (Quiet Hours)</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Definiere feste Ruhezeiten (z.B. 22:00 bis 07:00 Uhr), in denen keine nicht-kritischen Mitteilungen zugestellt werden.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  📱 Besonderheit bei Apple iOS & iPadOS
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  Web-Push-Benachrichtigungen werden von Apple aus Datenschutz- und Energiespargründen erst ab iOS 16.4 und ausschließlich für installierte Web-Apps unterstützt. Füge SchoolCal in Safari über das Teilen-Symbol zum Home-Bildschirm hinzu, um Mitteilungen zu erhalten.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. STUNDENPLAN & ZEITEN */}
          {/* ========================================================================= */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Stundenplan, Glockenzeiten & Pausen
                </h4>
                <p className="text-xs text-gray-500">
                  Erfasse deinen wöchentlichen Zeitplan und passe Schulzeiten flexibel an.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">Glockenzeiten & Zeitplan anpassen</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Unter <strong>Schule &gt; Zeitplan</strong> oder in den Einstellungen kannst du die Start- und Endzeiten der 1. bis 10. Stunde sowie Pausenzeiten (z.B. Große Pause, Mittagspause) an deine Schule anpassen.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">Doppelstunden erstellen</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Beim Eintragen einer Unterrichtsstunde kannst du einfach die Option <em>„Doppelstunde (zwei aufeinanderfolgende Stunden)“</em> aktivieren. SchoolCal legt beide Blöcke automatisch an und bündelt sie optisch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. WEBUNTIS */}
          {/* ========================================================================= */}
          {activeTab === 'webuntis' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                    WebUntis Integration
                  </h4>
                  <Badge variant="purple" size="sm">Plus</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Synchronisiere deinen Stundenplan und aktuelle Vertretungen direkt mit WebUntis.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <h5 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  Wie funktioniert die Verbindung?
                </h5>
                <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
                  Trage in den Einstellungen unter „WebUntis Synchronisation“ deinen Schulnamen, den Server (z.B. hepta.webuntis.com) und deine Zugangsdaten ein. SchoolCal ruft regelmäßig deinen tagesaktuellen Stundenplan ab und aktualisiert den Smart Day bei Ausfällen und Raumwechseln automatisch.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. ACCOUNT & SYNC */}
          {/* ========================================================================= */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Account, Synchronisation & Datensicherheit
                </h4>
                <p className="text-xs text-gray-500">
                  Wie deine Daten geräteübergreifend synchron gehalten werden.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">Echtzeit-Synchronisation</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Dein Konto wird über sichere Google Firebase Firestore Datenbanken synchronisiert. Jedes Gerät greift auf dieselben Daten zu.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">Vollständige Account-Löschung</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Du hast jederzeit die volle Kontrolle: In den Einstellungen kannst du mit einem Klick dein gesamtes Konto und alle gespeicherten Daten unwiderruflich aus der Cloud löschen.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. DATENSCHUTZ */}
          {/* ========================================================================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Datenschutz & Privatsphäre
                </h4>
                <p className="text-xs text-gray-500">
                  SchoolCal schützt deine persönlichen Daten nach höchsten Standards.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mb-1.5" />
                  <div className="font-bold text-gray-900 dark:text-white">Kein Werbetracking</div>
                  <p className="text-[11px] text-gray-500 mt-1">Keine Drittanbieter-Tracker, keine Cookies zu Werbezwecken.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary">
                  <UserCheck className="w-5 h-5 text-ios-blue mb-1.5" />
                  <div className="font-bold text-gray-900 dark:text-white">Datensparsamkeit</div>
                  <p className="text-[11px] text-gray-500 mt-1">Es werden nur die für deinen Schulplaner notwendigen Angaben gespeichert.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary">
                  <ExternalLink className="w-5 h-5 text-purple-600 mb-1.5" />
                  <div className="font-bold text-gray-900 dark:text-white">DSGVO-konform</div>
                  <p className="text-[11px] text-gray-500 mt-1">Vollständige Transparenz und Recht auf Datenlöschung.</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. FAQ */}
          {/* ========================================================================= */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              <div className="space-y-1 mb-2">
                <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Häufig gestellte Fragen (FAQ)
                </h4>
                <p className="text-xs text-gray-500">
                  Die wichtigsten Antworten auf einen Blick.
                </p>
              </div>

              {faqs.map((faq, idx) => {
                const isExpanded = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 text-left font-bold text-xs sm:text-sm text-gray-900 dark:text-white"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                          isExpanded ? 'rotate-180 text-ios-blue' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-gray-600 dark:text-gray-300 pt-2 leading-relaxed"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-black/5 dark:border-white/10 flex justify-end">
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Schließen
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
