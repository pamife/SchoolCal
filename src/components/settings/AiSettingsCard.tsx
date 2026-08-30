import React, { useState, useEffect } from 'react';
import {
  Brain,
  Key,
  Check,
  Trash2,
  ExternalLink,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  getEffectiveGeminiApiKey,
  setCustomGeminiApiKey,
} from '../../services/ai/geminiApiClient';

export const AiSettingsCard: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'cleared'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    setApiKey(getEffectiveGeminiApiKey());
  }, []);

  const handleSave = () => {
    setCustomGeminiApiKey(apiKey);
    setSaveStatus('saved');
    setTestStatus('idle');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleClear = () => {
    setApiKey('');
    setCustomGeminiApiKey('');
    setSaveStatus('cleared');
    setTestStatus('idle');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleTestConnection = async () => {
    const keyToTest = apiKey.trim() || getEffectiveGeminiApiKey();
    if (!keyToTest) {
      setTestStatus('error');
      setTestMessage('Bitte gib zuerst einen API-Key ein.');
      return;
    }

    setTestStatus('testing');
    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.5-flash',
    ];

    let lastErr = '';
    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToTest}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Antworte nur mit "OK".' }] }],
          }),
        });

        if (res.ok) {
          setTestStatus('success');
          setTestMessage(`✓ Verbindung erfolgreich! Modell "${model}" ist einsatzbereit.`);
          return;
        } else {
          const data = await res.json().catch(() => ({}));
          lastErr = `Fehler (${res.status}): ${data.error?.message || 'Modell nicht verfügbar'}`;
        }
      } catch (e: any) {
        lastErr = `Netzwerkfehler: ${e.message}`;
      }
    }

    setTestStatus('error');
    setTestMessage(lastErr || 'Verbindung fehlgeschlagen');
  };

  const isConfigured = Boolean(apiKey.trim() || getEffectiveGeminiApiKey());

  return (
    <div className="ios-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              KI-Schulassistent & Gemini API-Key
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-purple-600 text-white">
                Pro
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Verbinde Google Gemini für Freitext-Antworten & intelligente Lernpläne
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isConfigured ? (
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online (Gemini)
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Lokaler Fallback
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          Für freie Konversationen und detaillierte Aufgabenhilfe kannst du deinen eigenen, <strong>dauerhaft kostenlosen Google Gemini API-Key</strong> hinterlegen. Der Key wird sicher lokal in deinem Browser gespeichert.
        </p>

        {/* Input Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Google Gemini API-Key
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 pr-10 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs sm:text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 border border-black/5 dark:border-white/5"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title={showKey ? 'Verbergen' : 'Anzeigen'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              icon={<Check className="w-3.5 h-3.5" />}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
            >
              Speichern
            </Button>

            {apiKey && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                icon={<Trash2 className="w-3.5 h-3.5" />}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                title="Key löschen"
              />
            )}
          </div>
        </div>

        {/* Action Buttons & Links */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Kostenlosen API-Key bei Google AI Studio erstellen (100% kostenlos)
          </a>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing' || !apiKey.trim()}
            icon={<Sparkles className="w-3.5 h-3.5 text-purple-600" />}
          >
            {testStatus === 'testing' ? 'Verbindung wird getestet...' : 'Verbindung testen'}
          </Button>
        </div>

        {/* Status Messages */}
        {saveStatus === 'saved' && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>API-Key erfolgreich gespeichert! Die KI antwortet ab sofort live mit Gemini.</span>
          </div>
        )}

        {saveStatus === 'cleared' && (
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>API-Key entfernt. Lokale Daten-Engine ist aktiv.</span>
          </div>
        )}

        {testStatus === 'success' && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{testMessage}</span>
          </div>
        )}

        {testStatus === 'error' && (
          <div className="p-2.5 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{testMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
