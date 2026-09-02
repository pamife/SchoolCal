import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Key,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';
import { FeatureGate } from '../licensing/FeatureGate';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useExamStore } from '../../store/useExamStore';
import { useGradeStore } from '../../store/useGradeStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { buildSafeAISchoolContext } from '../../services/ai/aiContextBuilder';
import { defaultAIService } from '../../services/ai/BackendAIService';
import {
  getEffectiveGeminiApiKey,
  setCustomGeminiApiKey,
} from '../../services/ai/geminiApiClient';
import { MarkdownText } from '../common/MarkdownText';
import { AiActionCard } from './AiActionCard';
import type { AIChatMessage } from '../../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPricing?: () => void;
  onOpenActivation?: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenPricing,
  onOpenActivation,
}) => {
  const { user } = useAuthStore();
  const { subjects, teachers, rooms, scheduleEntries } = useSchoolStore();
  const { homework } = useHomeworkStore();
  const { exams } = useExamStore();
  const { grades } = useGradeStore();
  const { settings } = useSettingsStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(() => getEffectiveGeminiApiKey());
  const [aiStatus, setAiStatus] = useState<{
    status: 'active' | 'missing_key' | 'invalid_key' | 'rate_limited' | 'unreachable' | 'offline';
    label: string;
    model?: string;
  }>({
    status: 'offline',
    label: 'Prüfe Status...',
  });

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hallo ${user?.displayName?.split(' ')[0] || 'Schüler'}! 👋 Ich bin dein persönlicher SchoolCal KI-Assistent. Ich kenne deinen aktuellen Stundenplan, deine Hausaufgaben und bevorstehende Prüfungen. Wie kann ich dir heute helfen?`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check live health status when modal opens
  const refreshAiStatus = async () => {
    try {
      const health = await defaultAIService.checkHealth();
      if (health.status === 'active') {
        setAiStatus({
          status: 'active',
          label: 'Online',
          model: health.model || 'Gemini 2.5 Flash',
        });
      } else if (health.status === 'missing_key') {
        setAiStatus({
          status: 'missing_key',
          label: 'Nicht konfiguriert',
        });
      } else if (health.status === 'invalid_key') {
        setAiStatus({
          status: 'invalid_key',
          label: 'Key ungültig',
        });
      } else if (health.status === 'rate_limited') {
        setAiStatus({
          status: 'rate_limited',
          label: 'Ausgelastet',
        });
      } else {
        setAiStatus({
          status: 'unreachable',
          label: 'Offline',
        });
      }
    } catch {
      setAiStatus({
        status: 'offline',
        label: 'Offline',
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshAiStatus();
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const suggestionChips = [
    'Was muss ich heute noch machen?',
    'Wann habe ich meine nächste Klausur?',
    'Wie sieht meine Woche aus?',
    'Ich habe heute von 16 bis 18 Uhr Zeit. Was soll ich lernen?',
  ];

  const handleSaveApiKey = () => {
    setCustomGeminiApiKey(customKeyInput);
    setShowKeyConfig(false);
    refreshAiStatus();
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build safe, privacy-preserving context exclusively for logged-in user
      const context = buildSafeAISchoolContext({
        currentDate: new Date(),
        userName: user?.displayName || 'Schüler',
        settings,
        subjects,
        teachers,
        rooms,
        scheduleEntries,
        homework,
        exams,
        grades,
      });

      const response = await defaultAIService.ask(query, context, messages);

      const assistantMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        action: response.action,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: 'Entschuldigung, bei der Bearbeitung deiner Anfrage ist ein Fehler aufgetreten.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Chat zurückgesetzt. Wie kann ich dir heute mit deinen Schulthemen helfen?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="SchoolCal KI-Schulassistent [BETA]"
    >
      <FeatureGate
        feature="aiSchoolAssistant"
        fallbackTitle="SchoolCal KI-Schulassistent & Lernplaner"
        fallbackDescription="Stelle Fragen zu deinem Stundenplan, fälligen Aufgaben oder lass dir intelligente Lernpläne berechnen. Exklusiv im Pro-Tarif verfügbar."
        onOpenPricing={() => {
          onClose();
          if (onOpenPricing) onOpenPricing();
        }}
        onOpenActivation={() => {
          onClose();
          if (onOpenActivation) onOpenActivation();
        }}
      >
        <div className="flex flex-col h-[55dvh] sm:h-[620px] max-h-[75dvh] -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 overflow-hidden">
          {/* Header Banner */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <span>SchoolCal KI</span>
                <span className="text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded-full border border-purple-500/30">
                  BETA
                </span>
              </span>

              <button
                type="button"
                onClick={() => setShowKeyConfig((prev) => !prev)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                  aiStatus.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                    : aiStatus.status === 'missing_key'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25'
                    : aiStatus.status === 'rate_limited'
                    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-500/25'
                    : 'bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25'
                }`}
                title={
                  aiStatus.status === 'active'
                    ? `KI ist aktiv (${aiStatus.model || 'Gemini 2.5 Flash'})`
                    : 'KI-Status prüfen oder optionalen Key konfigurieren'
                }
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    aiStatus.status === 'active'
                      ? 'bg-emerald-500 animate-pulse'
                      : aiStatus.status === 'missing_key'
                      ? 'bg-amber-500'
                      : aiStatus.status === 'rate_limited'
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                />
                <Key className="w-2.5 h-2.5" />
                <span>{aiStatus.label}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleClearChat}
              className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-1 font-medium transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Verlauf leeren</span>
            </button>
          </div>

          {/* Optional API Key Configuration Panel */}
          {showKeyConfig && (
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-200/50 dark:border-purple-800/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  Optionaler lokaler Google Gemini API-Key
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-gray-600 dark:text-gray-300">
                {aiStatus.status === 'active' ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    ✓ Die KI ist serverseitig in Netlify konfiguriert und einsatzbereit. Du benötigst hier keinen lokalen Key, kannst aber optional einen eigenen eintragen:
                  </span>
                ) : (
                  <span>
                    Falls kein Server-Key in Netlify hinterlegt ist, kannst du hier deinen persönlichen, kostenlosen API-Key aus Google AI Studio im Browser speichern:
                  </span>
                )}
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-ios-dark-secondary rounded-xl border border-black/10 dark:border-white/10 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Speichern</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  Kostenlosen Key bei Google AI Studio erstellen (1 Klick)
                </a>

                {customKeyInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomKeyInput('');
                      setCustomGeminiApiKey('');
                      refreshAiStatus();
                    }}
                    className="text-[10px] text-red-500 hover:underline"
                  >
                    Key löschen
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isUser
                        ? 'bg-ios-blue text-white'
                        : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-ios-blue text-white rounded-tr-xs'
                        : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-900 dark:text-white rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <span>{msg.content}</span>
                    ) : (
                      <MarkdownText content={msg.content} />
                    )}

                    {/* Propose Action Card */}
                    {msg.action && (
                      <AiActionCard
                        action={msg.action}
                        onExecuted={() => {
                          msg.actionExecuted = true;
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-100 dark:bg-ios-dark-secondary text-xs rounded-tl-xs flex items-center gap-1.5 text-gray-500">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-600" />
                  <span>Gemini KI denkt nach...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-4 py-2 bg-gray-50/50 dark:bg-ios-dark-card/50 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-1.5">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-ios-dark-secondary hover:bg-purple-50 dark:hover:bg-purple-950/20 text-gray-700 dark:text-gray-300 border border-black/5 dark:border-white/10 text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>{chip}</span>
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3.5 bg-white dark:bg-ios-dark-card border-t border-black/5 dark:border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Frage zu Stundenplan, Aufgaben, Vorträgen oder Schulthemen..."
              className="flex-1 px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs sm:text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </FeatureGate>
    </BottomSheet>
  );
};
