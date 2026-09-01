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
  Server,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  getEffectiveGeminiApiKey,
  setCustomGeminiApiKey,
} from '../../services/ai/geminiApiClient';
import { defaultAIService } from '../../services/ai/BackendAIService';
import type { AIHealthStatus } from '../../services/ai/AIServiceInterface';

export const AiSettingsCard: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'cleared'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [serverHealth, setServerHealth] = useState<AIHealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const checkHealth = async (force = false) => {
    setLoadingHealth(true);
    try {
      const health = await defaultAIService.checkHealth(force);
      setServerHealth(health);
    } catch {
      // Ignore
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    setApiKey(getEffectiveGeminiApiKey());
    checkHealth();
  }, []);

  const handleSave = () => {
    setCustomGeminiApiKey(apiKey);
    setSaveStatus('saved');
    setTestStatus('idle');
    checkHealth(true);
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleClear = () => {
    setApiKey('');
    setCustomGeminiApiKey('');
    setSaveStatus('cleared');
    setTestStatus('idle');
    checkHealth(true);
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    const localKey = apiKey.trim() || getEffectiveGeminiApiKey();

    if (!localKey) {
      // Test server-side Netlify endpoint
      try {
        const health = await defaultAIService.checkHealth(true);
        setServerHealth(health);
        if (health.status === 'active') {
          setTestStatus('success');
          setTestMessage(`✓ Server-Verbindung erfolgreich! Modell "${health.model || 'Gemini 2.5 Flash'}" ist einsatzbereit.`);
        } else if (health.status === 'missing_key') {
          setTestStatus('error');
          setTestMessage('Kein GEMINI_API_KEY in Netlify konfiguriert und kein lokaler Key hinterlegt.');
        } else if (health.status === 'invalid_key') {
          setTestStatus('error');
          setTestMessage('Der hinterlegte Gemini API-Key ist ungültig oder abgelaufen.');
        } else {
          setTestStatus('error');
          setTestMessage(health.message || 'Verbindung fehlgeschlagen.');
        }
      } catch {
        setTestStatus('error');
        setTestMessage('Server-Endpunkt konnte nicht erreicht werden.');
      }
      return;
    }

    // Test direct Gemini with local key
    const candidateModels = [
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash-exp',
    ];

    let lastErr = '';
    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${localKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Antworte nur mit "OK".' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        });

        if (res.ok) {
          setTestStatus('success');
          setTestMessage(`✓ Verbindung erfolgreich! Modell "${model}" antwortet live.`);
          checkHealth(true);
          return;
        } else {
          const data = await res.json().catch(() => ({}));
          lastErr = `Fehler (${res.status}): ${data.error?.message || 'Modell nicht verfügbar'}`;
          if (res.status === 400 || res.status === 403) break;
        }
      } catch (e: any) {
        lastErr = `Netzwerkfehler: ${e.message}`;
      }
    }

    setTestStatus('error');
    setTestMessage(lastErr || 'Verbindung fehlgeschlagen');
  };

  const isServerConfigured = serverHealth?.status === 'active';
  const isLocalConfigured = Boolean(apiKey.trim() || getEffectiveGeminiApiKey());
  const isAnyConfigured = isServerConfigured || isLocalConfigured;

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
              <span>KI-Schulassistent</span>
              <span className="text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded-full border border-purple-500/30">
                BETA
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Google Gemini für Freitext-Antworten & intelligente Lernpläne
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isAnyConfigured ? (
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online ({serverHealth?.model || 'Gemini'})
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Nicht konfiguriert
            </span>
          )}
        </div>
      </div>

      {/* Server Status Banner */}
      <div className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-gray-600 dark:text-gray-300">
            Netlify Server-KI:
          </span>
          {serverHealth?.status === 'active' ? (
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Aktiv ({serverHealth.model || 'Gemini 2.5 Flash'})
            </span>
          ) : (
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {serverHealth?.status === 'missing_key'
                ? 'Key fehlt in Netlify Variablen'
                : serverHealth?.status === 'invalid_key'
                ? 'Key ungültig'
                : 'Lokaler Fallback'}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => checkHealth(true)}
          disabled={loadingHealth}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1"
          title="Status aktualisieren"
        >
          <RefreshCw className={`w-3 h-3 ${loadingHealth ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          Die KI wird primär serverseitig über deinen <strong>GEMINI_API_KEY in Netlify</strong> gesteuert. Optional kannst du hier einen persönlichen API-Key im Browser hinterlegen.
        </p>

        {/* Input Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Optionaler lokaler Google Gemini API-Key
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
            disabled={testStatus === 'testing'}
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
            <span>Lokaler API-Key entfernt. Netlify Server-KI wird genutzt.</span>
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
