import React, { useState } from 'react';
import { generateLicenseBatch, type GeneratedCodeItem } from '../../services/admin/adminService';
import { Button } from '../common/Button';
import { Sparkles, Copy, Download, Check, AlertTriangle, KeyRound } from 'lucide-react';
import { format } from 'date-fns';

interface LicenseGeneratorTabProps {
  adminUid: string;
  adminEmail: string;
  onGenerationComplete?: () => void;
}

export const LicenseGeneratorTab: React.FC<LicenseGeneratorTabProps> = ({
  adminUid,
  adminEmail,
  onGenerationComplete,
}) => {
  const [plan, setPlan] = useState<'PLUS' | 'PRO'>('PLUS');
  const [durationPreset, setDurationPreset] = useState<string>('365');
  const [customDays, setCustomDays] = useState<number>(30);
  const [count, setCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCodeItem[] | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let durationDays: number | null = null;
    if (durationPreset === 'unlimited') {
      durationDays = null;
    } else if (durationPreset === 'custom') {
      durationDays = customDays > 0 ? customDays : 30;
    } else {
      durationDays = Number(durationPreset);
    }

    try {
      const results = await generateLicenseBatch(adminUid, adminEmail, {
        plan,
        durationDays,
        count,
        notes,
      });

      setGeneratedCodes(results);
      if (onGenerationComplete) onGenerationComplete();
    } catch (err: any) {
      alert('Fehler beim Generieren der Lizenzen: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!generatedCodes) return;
    const text = generatedCodes.map(g => g.plainCode).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!generatedCodes) return;
    const content = [
      `SchoolCal Lizenzcodes - Erstellt am ${format(new Date(), 'dd.MM.yyyy HH:mm')}`,
      `Tarif: ${plan} | Laufzeit: ${durationPreset === 'unlimited' ? 'Unbegrenzt' : `${durationPreset} Tage`}`,
      notes ? `Notiz: ${notes}` : '',
      '--------------------------------------------------',
      ...generatedCodes.map((g, idx) => `${idx + 1}. ${g.plainCode}`),
      '--------------------------------------------------',
    ].filter(Boolean).join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SchoolCal_Licenses_${plan}_${format(new Date(), 'yyyyMMdd_HHmm')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {generatedCodes ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <strong className="block font-bold">Wichtig: Einmalige Anzeige der Codes!</strong>
              Aus Sicherheitsgründen werden die vollständigen Klartext-Codes in der Datenbank nur als SHA-256-Hash gespeichert. Kopiere oder speichere die Codes jetzt ab.
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Generierte Codes ({generatedCodes.length})
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyAll}
                  icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? 'Kopiert!' : 'Alle kopieren'}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadTxt}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Als .txt herunterladen
                </Button>
              </div>
            </div>

            <div className="p-3 bg-gray-900 text-gray-100 rounded-xl font-mono text-xs space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
              {generatedCodes.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-800 last:border-0">
                  <span className="text-gray-400 select-none mr-2">{idx + 1}.</span>
                  <span className="text-emerald-400 font-bold select-all tracking-wider flex-1">
                    {item.plainCode}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase ml-2">
                    {item.license.plan}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setGeneratedCodes(null)}
            >
              Weitere Codes erstellen
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Erstelle neue kryptografisch zufällige Lizenzcodes für den Plus- oder Pro-Tarif.
          </div>

          {/* 1. Plan Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Tarifstufe
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPlan('PLUS')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  plan === 'PLUS'
                    ? 'border-ios-blue bg-blue-50/60 dark:bg-blue-500/10 ring-2 ring-ios-blue'
                    : 'border-black/5 dark:border-white/10 bg-gray-50 dark:bg-ios-dark-secondary'
                }`}
              >
                <div className="text-xs font-extrabold text-ios-blue uppercase">Plus Tarif</div>
                <div className="text-[11px] text-gray-500 mt-0.5">WebUntis, erweiterte Funktionen</div>
              </button>

              <button
                type="button"
                onClick={() => setPlan('PRO')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  plan === 'PRO'
                    ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-500/10 ring-2 ring-purple-500'
                    : 'border-black/5 dark:border-white/10 bg-gray-50 dark:bg-ios-dark-secondary'
                }`}
              >
                <div className="text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase">Pro Tarif</div>
                <div className="text-[11px] text-gray-500 mt-0.5">KI-Planung, Notenanalysen, Alle Features</div>
              </button>
            </div>
          </div>

          {/* 2. Duration Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Gültigkeitsdauer (Laufzeit)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: '30', label: '30 Tage' },
                { id: '90', label: '90 Tage' },
                { id: '180', label: '180 Tage' },
                { id: '365', label: '365 Tage' },
                { id: 'unlimited', label: 'Unbegrenzt' },
                { id: 'custom', label: 'Manuell' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDurationPreset(d.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold text-center border transition-all ${
                    durationPreset === d.id
                      ? 'bg-ios-blue text-white border-ios-blue shadow-xs'
                      : 'bg-gray-50 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 border-black/5 dark:border-white/5 hover:bg-gray-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {durationPreset === 'custom' && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="3650"
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-lg text-xs font-bold text-gray-900 dark:text-white"
                />
                <span className="text-xs text-gray-500">Tage ab Aktivierung</span>
              </div>
            )}
          </div>

          {/* 3. Quantity & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Anzahl Codes
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
              >
                {[1, 5, 10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Code' : 'Codes'}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Notiz / Zweck (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="z.B. Testgruppe Gymnasium 10b"
                className="w-full px-3.5 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              icon={<Sparkles className="w-4 h-4 text-amber-300" />}
            >
              {loading ? 'Generiere...' : `${count} Lizenzcode${count > 1 ? 's' : ''} jetzt generieren`}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
