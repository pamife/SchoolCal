import React, { useState } from 'react';
import { Check, Calendar, Sparkles, X, CheckCircle2 } from 'lucide-react';
import type { AIActionPayload } from '../../types';
import { executeConfirmedAIAction } from '../../services/ai/aiActionHandler';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../common/Button';

interface AiActionCardProps {
  action: AIActionPayload;
  onExecuted?: () => void;
}

export const AiActionCard: React.FC<AiActionCardProps> = ({ action, onExecuted }) => {
  const { user } = useAuthStore();
  const { addHomework } = useHomeworkStore();
  const { addEvent } = useCalendarStore();

  const [isExecuting, setIsExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const uid = user?.uid || '';
  const units = action.data?.units || [];

  const handleConfirm = async () => {
    setIsExecuting(true);
    const res = await executeConfirmedAIAction(action, uid, {
      addHomework,
      addEvent,
    });
    setIsExecuting(false);
    setExecuted(res.success);
    setResultMessage(res.message);
    if (res.success && onExecuted) {
      onExecuted();
    }
  };

  return (
    <div className="mt-3 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {action.title || 'Vorgeschlagene Aktion'}
          </span>
        </div>

        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-xs">
          Bestätigung erforderlich
        </span>
      </div>

      {units.length > 0 && (
        <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
          {units.map((u: any, idx: number) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-white/70 dark:bg-ios-dark-secondary/70 border border-black/5 dark:border-white/5 text-xs flex items-center justify-between"
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="font-bold text-gray-900 dark:text-white truncate">
                  {u.title}
                </div>
                {u.description && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {u.description}
                  </div>
                )}
              </div>
              <div className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 shrink-0">
                {u.date} {u.time ? `um ${u.time}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {executed ? (
        <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{resultMessage || 'Aktion erfolgreich ausgeführt!'}</span>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            Verwerfen
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={isExecuting}
            icon={<Check className="w-3.5 h-3.5" />}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
          >
            {isExecuting ? 'Wird übernommen...' : 'In Aufgaben übernehmen'}
          </Button>
        </div>
      )}
    </div>
  );
};
