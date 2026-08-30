import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
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
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hallo ${user?.displayName?.split(' ')[0] || 'Schüler'}! 👋 Ich bin dein persönlicher SchoolCal KI-Assistent. Ich kenne deinen aktuellen Stundenplan, deine Hausaufgaben und bevorstehende Prüfungen. Wie kann ich dir heute helfen?`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages, isLoading]);

  const suggestionChips = [
    'Was muss ich heute noch machen?',
    'Wann habe ich meine nächste Klausur?',
    'Wie sieht meine Woche aus?',
    'Ich habe heute von 16 bis 18 Uhr Zeit. Was soll ich lernen?',
  ];

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
      title="SchoolCal KI-Schulassistent"
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
        <div className="flex flex-col h-[70vh] sm:h-[650px] max-h-[80dvh] -mx-4 -mb-4">
          {/* Header Banner */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Kontextbezogene Schul-KI
              </span>
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
                        : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-900 dark:text-white rounded-tl-xs whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}

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
                  <span>Analysiere deine SchoolCal-Daten...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-4 py-2 bg-gray-50/50 dark:bg-ios-dark-card/50 border-t border-black/5 dark:border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
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
              placeholder="Frage zu Stundenplan, Aufgaben oder Klausuren..."
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
