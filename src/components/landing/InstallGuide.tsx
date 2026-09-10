import { useEffect, useState } from 'react';
import { Download, Laptop, MonitorDown, Share2, Smartphone } from 'lucide-react';

type InstallPlatform = 'ios' | 'android' | 'desktop';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const platformOptions: Array<{
  id: InstallPlatform;
  label: string;
  Icon: typeof Smartphone;
}> = [
  { id: 'ios', label: 'iPhone & iPad', Icon: Smartphone },
  { id: 'android', label: 'Android', Icon: Smartphone },
  { id: 'desktop', label: 'Desktop', Icon: Laptop },
];

const getPreferredPlatform = (): InstallPlatform => {
  if (typeof navigator === 'undefined') return 'desktop';

  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  return 'desktop';
};

const guides: Record<InstallPlatform, { title: string; note: string; steps: string[] }> = {
  ios: {
    title: 'Auf iPhone oder iPad installieren',
    note: 'Die Installation erfolgt direkt über Safari – ganz ohne App Store.',
    steps: [
      'SchoolCal in Safari öffnen.',
      'Auf das Teilen-Symbol tippen.',
      '„Zum Home-Bildschirm“ auswählen.',
      'Die Installation mit „Hinzufügen“ bestätigen.',
    ],
  },
  android: {
    title: 'Auf Android installieren',
    note: 'In Chrome und anderen unterstützten Browsern erscheint ein direkter Installationsdialog.',
    steps: [
      'SchoolCal in Chrome öffnen.',
      'Das Browser-Menü oben rechts öffnen.',
      '„App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen.',
      'Die Installation bestätigen.',
    ],
  },
  desktop: {
    title: 'Auf dem Desktop installieren',
    note: 'Unterstützte Browser öffnen SchoolCal anschließend in einem eigenen App-Fenster.',
    steps: [
      'SchoolCal in Chrome, Edge oder einem anderen PWA-Browser öffnen.',
      'Das Installationssymbol in der Adressleiste oder das Browser-Menü wählen.',
      '„SchoolCal installieren“ auswählen.',
      'Die Installation bestätigen und SchoolCal über Dock, Startmenü oder Taskleiste öffnen.',
    ],
  },
};

export function InstallGuide() {
  const [selectedPlatform, setSelectedPlatform] = useState<InstallPlatform>(getPreferredPlatform);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstallPrompt(null);
  };

  const guide = guides[selectedPlatform];

  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white/80 shadow-[0_28px_80px_-35px_rgba(0,80,180,0.38)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
      <div
        className="flex gap-2 overflow-x-auto border-b border-black/[0.06] p-2.5 dark:border-white/10"
        role="tablist"
        aria-label="Installationsanleitung nach Gerät"
      >
        {platformOptions.map(({ id, label, Icon }) => (
          <button
            key={id}
            id={`install-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={selectedPlatform === id}
            aria-controls={`install-panel-${id}`}
            onClick={() => setSelectedPlatform(id)}
            className={`touch-target-y inline-flex min-w-max flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#08111d] ${
              selectedPlatform === id
                ? 'bg-ios-blue text-white shadow-sm'
                : 'text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div
        id={`install-panel-${selectedPlatform}`}
        role="tabpanel"
        aria-labelledby={`install-tab-${selectedPlatform}`}
        className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10"
      >
        <div>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ios-blue/10 text-ios-blue dark:bg-ios-blue/20 dark:text-blue-300">
            {selectedPlatform === 'ios' ? (
              <Share2 className="h-6 w-6" aria-hidden="true" />
            ) : (
              <MonitorDown className="h-6 w-6" aria-hidden="true" />
            )}
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">{guide.title}</h3>
          <p className="mt-2 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">{guide.note}</p>

          {installPrompt && selectedPlatform !== 'ios' && (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-ios-blue px-5 py-3 text-base font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue focus-visible:ring-offset-2 active:scale-[0.98] dark:focus-visible:ring-offset-[#08111d]"
            >
              <Download className="h-5 w-5" aria-hidden="true" />
              SchoolCal installieren
            </button>
          )}

          {isInstalled && (
            <p className="mt-5 rounded-2xl bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-300" role="status">
              SchoolCal wurde installiert und ist jetzt über dein App-Symbol erreichbar.
            </p>
          )}
        </div>

        <ol className="grid gap-3 lg:w-[27rem]">
          {guide.steps.map((step, index) => (
            <li
              key={step}
              className="flex items-start gap-3 rounded-2xl border border-black/[0.05] bg-slate-50/90 p-4 text-sm font-semibold leading-6 text-slate-700 dark:border-white/[0.07] dark:bg-white/[0.05] dark:text-slate-200"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ios-blue text-xs font-black text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
