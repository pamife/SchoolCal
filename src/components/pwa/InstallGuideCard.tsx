import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  Apple,
  Share,
  PlusSquare,
  CheckCircle2,
  Download,
  Sparkles,
  ShieldCheck,
  BellRing,
} from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import type { DeviceType } from '../../services/pwa/pwaService';

interface InstallGuideCardProps {
  compact?: boolean;
  onInstalled?: () => void;
}

export const InstallGuideCard: React.FC<InstallGuideCardProps> = ({
  compact = false,
  onInstalled,
}) => {
  const { platform, installOutcome, promptInstall } = usePwaInstall();
  const [selectedDeviceTab, setSelectedDeviceTab] = useState<DeviceType>(platform.deviceType || 'iphone');
  const [isInstalling, setIsInstalling] = useState(false);

  const handleNativeInstall = async () => {
    setIsInstalling(true);
    const res = await promptInstall();
    setIsInstalling(false);
    if (res === 'accepted' && onInstalled) {
      onInstalled();
    }
  };

  const deviceTabs: { id: DeviceType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'iphone', label: 'iPhone', icon: Smartphone },
    { id: 'ipad', label: 'iPad', icon: Tablet },
    { id: 'android_phone', label: 'Android Phone', icon: Smartphone },
    { id: 'android_tablet', label: 'Android Tablet', icon: Tablet },
    { id: 'windows', label: 'Windows', icon: Laptop },
    { id: 'mac', label: 'macOS', icon: Apple },
  ];

  // If already running standalone
  if (platform.isStandalone) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
            SchoolCal ist bereits installiert!
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-md mx-auto">
            Du verwendest SchoolCal als vollwertige Web-App auf deinem Startbildschirm. Benachrichtigungen, Offline-Funktionen und Gestensteuerung sind aktiv.
          </p>
        </div>
        <div className="flex justify-center gap-2 pt-1">
          <Badge variant="green" size="md">
            Standalone Modus aktiv
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Detected Platform Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-ios-blue/15 text-ios-blue flex items-center justify-center shrink-0">
            {platform.isIOS ? (
              <Apple className="w-5 h-5" />
            ) : platform.isAndroid ? (
              <Smartphone className="w-5 h-5" />
            ) : (
              <Laptop className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>Erkanntes Gerät:</span>
              <Badge variant="blue" size="sm">
                {platform.osName} ({platform.browserName})
              </Badge>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {platform.isIOS
                ? 'Optimierte Anleitung für Apple iOS / Safari'
                : platform.canNativePrompt
                ? 'Direkte 1-Klick-Installation wird von deinem Browser unterstützt'
                : 'Schritt-für-Schritt Installationsanleitung'}
            </p>
          </div>
        </div>

        {/* 1-Click Native Install Button for Chromium Browsers */}
        {platform.canNativePrompt && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleNativeInstall}
            disabled={isInstalling || installOutcome === 'installing'}
            icon={<Download className="w-3.5 h-3.5" />}
            className="shrink-0 shadow-sm"
          >
            {isInstalling ? 'Wird installiert...' : 'Jetzt installieren'}
          </Button>
        )}
      </div>

      {/* Device Switcher Tabs */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          {deviceTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedDeviceTab === tab.id;
            const isCurrentDevice = platform.deviceType === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedDeviceTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-ios-blue text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {isCurrentDevice && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Step by step guide container */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-ios-dark-card border border-black/5 dark:border-white/10 space-y-4">
        {/* ========================================================================= */}
        {/* IPHONE GUIDE */}
        {/* ========================================================================= */}
        {selectedDeviceTab === 'iphone' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary flex items-center justify-center text-gray-800 dark:text-gray-200">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    SchoolCal auf dem iPhone installieren
                  </h4>
                  <p className="text-xs text-gray-500">In wenigen Sekunden zum Home-Bildschirm hinzufügen</p>
                </div>
              </div>
              <Badge variant="gray" size="sm">iOS Safari</Badge>
            </div>

            {/* Step list */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-ios-blue/15 text-ios-blue text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Öffne SchoolCal in <strong>Safari</strong>.<br />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    (Hinweis: Drittanbieter-Browser wie Chrome auf iOS unterstützen systembedingt keine vollwertige Home-Bildschirm-Installation).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-ios-blue/15 text-ios-blue text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300 flex-1">
                  Tippe unten in der Leiste auf das <strong>Teilen-Symbol</strong>.
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-ios-dark-tertiary border border-black/5 text-[11px] font-bold text-ios-blue">
                    <Share className="w-3.5 h-3.5" />
                    <span>Teilen-Symbol (Kasten mit Pfeil nach oben)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-ios-blue/15 text-ios-blue text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300 flex-1">
                  Scrolle in der Aktionsliste nach unten und wähle <strong>„Zum Home-Bildschirm“</strong>.
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-ios-dark-tertiary border border-black/5 text-[11px] font-bold text-gray-800 dark:text-gray-200">
                    <PlusSquare className="w-3.5 h-3.5 text-ios-blue" />
                    <span>Zum Home-Bildschirm</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-ios-blue/15 text-ios-blue text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Bestätige oben rechts mit <strong>„Hinzufügen“</strong>. SchoolCal erscheint ab sofort als eigenständige App auf deinem Startbildschirm.
                </div>
              </div>
            </div>

            {/* Push Notification & Badge note */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <BellRing className="w-4 h-4 shrink-0 text-ios-blue mt-0.5" />
              <div>
                <strong>Wichtig für Push-Benachrichtigungen & Badges:</strong> Auf iOS (ab 16.4) werden Mitteilungen und rote Badge-Zähler für Aufgaben nur dann im System zugestellt, wenn SchoolCal als Home-Bildschirm-App ausgeführt wird.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* IPAD GUIDE */}
        {/* ========================================================================= */}
        {selectedDeviceTab === 'ipad' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary flex items-center justify-center text-gray-800 dark:text-gray-200">
                  <Tablet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    SchoolCal auf dem iPad installieren
                  </h4>
                  <p className="text-xs text-gray-500">Großes iPadOS-Layout mit Seitenleiste & Multitasking</p>
                </div>
              </div>
              <Badge variant="purple" size="sm">iPadOS Safari</Badge>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-ios-blue/15 text-ios-blue text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Öffne SchoolCal in <strong>Safari auf deinem iPad</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-ios-blue/15 text-ios-blue text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300 flex-1">
                  Tippe <strong>oben rechts</strong> in der Safari-Symbolleiste auf das <strong>Teilen-Symbol</strong> (Kasten mit Pfeil nach oben).
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-ios-dark-tertiary border border-black/5 text-[11px] font-bold text-ios-blue">
                    <Share className="w-3.5 h-3.5" />
                    <span>Teilen-Symbol in oberer iPad-Leiste</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-ios-blue/15 text-ios-blue text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300 flex-1">
                  Wähle im Dropdown-Menü <strong>„Zum Home-Bildschirm“</strong> und bestätige mit <strong>„Hinzufügen“</strong>.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-800 dark:text-purple-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-purple-600 mt-0.5" />
              <div>
                <strong>iPad Vorteil:</strong> Als installierte Web-App unterstützt SchoolCal Stage Manager, Split View und den vollen iPad-Bildschirm ohne Browser-Tabs.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ANDROID PHONE & TABLET GUIDE */}
        {/* ========================================================================= */}
        {(selectedDeviceTab === 'android_phone' || selectedDeviceTab === 'android_tablet') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    SchoolCal auf Android {selectedDeviceTab === 'android_tablet' ? 'Tablet' : 'Smartphone'}
                  </h4>
                  <p className="text-xs text-gray-500">Chrome, Samsung Internet, Edge oder Firefox</p>
                </div>
              </div>
              <Badge variant="green" size="sm">Android PWA</Badge>
            </div>

            {/* Native 1-Click Prompt available */}
            {platform.canNativePrompt && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    Automatische 1-Klick-Installation
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                    Dein Browser unterstützt die direkte Installation auf dem Startbildschirm.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNativeInstall}
                  disabled={isInstalling}
                  icon={<Download className="w-4 h-4" />}
                >
                  {isInstalling ? 'Wird hinzugefügt...' : 'App installieren'}
                </Button>
              </div>
            )}

            {/* Manual steps for Chrome / Samsung / Firefox */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Öffne das <strong>Browser-Menü</strong> (die <strong>3 Punkte ⋮</strong> oben oder unten rechts).
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Wähle <strong>„App installieren“</strong> oder <strong>„Zum Startbildschirm hinzufügen“</strong>.
                  <span className="block text-[11px] text-gray-500 mt-0.5">
                    (In Firefox: Menü → „Installieren“; in Samsung Internet: Menü → „Seite hinzufügen zu…“ → „Startbildschirm“).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Bestätige mit <strong>„Installieren“</strong> bzw. <strong>„Hinzufügen“</strong>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* WINDOWS GUIDE */}
        {/* ========================================================================= */}
        {selectedDeviceTab === 'windows' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    SchoolCal auf Windows (PC / Laptop)
                  </h4>
                  <p className="text-xs text-gray-500">Google Chrome, Microsoft Edge oder Brave</p>
                </div>
              </div>
              <Badge variant="blue" size="sm">Windows App</Badge>
            </div>

            {platform.canNativePrompt && (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    Native Desktop-App Installation
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                    Installiert SchoolCal als eigenständiges Windows-Programm im Startmenü und auf der Taskleiste.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNativeInstall}
                  disabled={isInstalling}
                  icon={<Download className="w-4 h-4" />}
                >
                  {isInstalling ? 'Wird installiert...' : 'Auf Windows installieren'}
                </Button>
              </div>
            )}

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-ios-blue/15 text-ios-blue text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Suche in der <strong>URL-Adressleiste</strong> ganz rechts nach dem <strong>Installationssymbol</strong> (Monitor mit Pfeil 🖵 oder Plus ⊕).
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-ios-blue/15 text-ios-blue text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Alternativ: Klicke im Browser-Menü (⋮) auf <strong>„SchoolCal installieren“</strong> bzw. <strong>„App installieren“</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary">
                <span className="w-6 h-6 rounded-full bg-ios-blue/15 text-ios-blue text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Bestätige die Installation. SchoolCal öffnet sich in einem eigenen, sauberen Fenster und kann an die Taskleiste geheftet werden.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MACOS GUIDE */}
        {/* ========================================================================= */}
        {selectedDeviceTab === 'mac' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-ios-dark-secondary flex items-center justify-center text-gray-800 dark:text-gray-200">
                  <Apple className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    SchoolCal auf macOS (MacBook & Mac)
                  </h4>
                  <p className="text-xs text-gray-500">Safari (ab macOS Sonoma 14) oder Chrome / Edge</p>
                </div>
              </div>
              <Badge variant="gray" size="sm">macOS App</Badge>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary space-y-1.5">
                <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Apple className="w-3.5 h-3.5" />
                  <span>Option A: In Safari (macOS Sonoma 14+)</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 pl-5 space-y-1">
                  <div>1. Klicke in der Menüleiste oben auf <strong>Ablage</strong> (File).</div>
                  <div>2. Wähle <strong>„Zum Dock hinzufügen…“</strong> (Add to Dock).</div>
                  <div>3. Bestätige. SchoolCal erscheint im Mac-Dock und im Launchpad.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary space-y-1.5">
                <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-ios-blue" />
                  <span>Option B: In Google Chrome oder Microsoft Edge</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 pl-5 space-y-1">
                  <div>1. Klicke in der Adressleiste auf das <strong>Installationssymbol</strong> (⊕).</div>
                  <div>2. Oder im Menü (⋮) auf <strong>„SchoolCal installieren“</strong>.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Why Install Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-500/5 via-ios-blue/5 to-transparent border border-black/5 dark:border-white/5 space-y-2">
        <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-ios-blue" />
          <span>Vorteile der Installation:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-600 dark:text-gray-300">
          <div className="p-2 rounded-xl bg-white/60 dark:bg-ios-dark-secondary/60">
            <strong>⚡ Sofortstart:</strong> Schneller Zugriff direkt vom Home-Bildschirm oder Dock.
          </div>
          <div className="p-2 rounded-xl bg-white/60 dark:bg-ios-dark-secondary/60">
            <strong>🔔 Benachrichtigungen:</strong> Zuverlässige Push-Mitteilungen bei Ausfällen & Fristen.
          </div>
          <div className="p-2 rounded-xl bg-white/60 dark:bg-ios-dark-secondary/60">
            <strong>📶 Offline bereit:</strong> Stundenplan auch ohne Internetverbindung abrufbar.
          </div>
        </div>
      </div>
    </div>
  );
};
