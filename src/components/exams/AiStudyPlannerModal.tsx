import React, { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { FeatureGate } from '../licensing/FeatureGate';
import { useHomeworkStore } from '../../store/useHomeworkStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Sparkles, Brain, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Exam, Subject } from '../../types';
import { addDays, format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface AiStudyPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: Exam[];
  subjects: Subject[];
  onOpenPricing?: () => void;
  onOpenActivation?: () => void;
}

export const AiStudyPlannerModal: React.FC<AiStudyPlannerModalProps> = ({
  isOpen,
  onClose,
  exams,
  subjects,
  onOpenPricing,
  onOpenActivation,
}) => {
  const { user } = useAuthStore();
  const { addHomework } = useHomeworkStore();

  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');
  const [intensity, setIntensity] = useState<'light' | 'medium' | 'intense'>('medium');
  const [generatedPlan, setGeneratedPlan] = useState<Array<{ day: string; task: string }> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [applied, setApplied] = useState(false);

  const uid = user?.uid || '';
  const selectedExam = exams.find(e => e.id === selectedExamId) || exams[0];
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  const handleGenerate = () => {
    if (!selectedExam) return;
    setIsGenerating(true);
    setGeneratedPlan(null);
    setApplied(false);

    setTimeout(() => {
      const examDate = new Date(selectedExam.date);
      const daysLeft = Math.max(1, differenceInDays(examDate, new Date()));
      const daysToPlan = Math.min(daysLeft, intensity === 'light' ? 3 : intensity === 'medium' ? 5 : 7);

      const planItems: Array<{ day: string; task: string }> = [];
      const topics = selectedExam.topics && selectedExam.topics.length > 0
        ? selectedExam.topics.map(t => t.title)
        : ['Themenüberblick & Grundlagen', 'Schwerpunktthemen vertiefen', 'Übungsaufgaben & Altklausuren', 'Generalprobe & Formeln wiederholen'];

      for (let i = 0; i < daysToPlan; i++) {
        const planDate = addDays(new Date(), i);
        const topic = topics[i % topics.length];
        planItems.push({
          day: format(planDate, 'EEEE, dd.MM.', { locale: de }),
          task: `${selectedExam.title}: ${topic} (Lerneinheit ${i + 1}/${daysToPlan})`,
        });
      }

      setGeneratedPlan(planItems);
      setIsGenerating(false);
    }, 1200);
  };

  const handleApplyToTasks = async () => {
    if (!generatedPlan || !selectedExam) return;

    for (let i = 0; i < generatedPlan.length; i++) {
      const item = generatedPlan[i];
      const dueDate = format(addDays(new Date(), i), 'yyyy-MM-dd');

      await addHomework(uid, {
        id: `hw-ai-${Date.now()}-${i}`,
        title: item.task,
        subjectId: selectedExam.subjectId,
        dueDate,
        dueTime: '17:00',
        priority: 'high',
        status: 'todo',
        createdAt: new Date().toISOString(),
      });
    }

    setApplied(true);
    setTimeout(() => {
      onClose();
      setApplied(false);
      setGeneratedPlan(null);
    }, 2000);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="KI-Lernzeitplaner [BETA]"
    >
      <FeatureGate
        feature="aiSmartPlanning"
        fallbackTitle="KI-Lernzeitplaner & Prüfungsprognose"
        fallbackDescription="Lass die intelligente SchoolCal-KI deinen perfekten Lernplan vor anstehenden Klausuren berechnen. Exklusiv im Pro-Tarif verfügbar."
        onOpenPricing={() => {
          onClose();
          if (onOpenPricing) onOpenPricing();
        }}
        onOpenActivation={() => {
          onClose();
          if (onOpenActivation) onOpenActivation();
        }}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Intelligente Klausurvorbereitung
                </h4>
                <span className="text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded-full border border-purple-500/30">
                  BETA
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Verteilt den Lernstoff optimal auf die verbleibenden Tage bis zur Prüfung.
              </p>
            </div>
          </div>

          {exams.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              Trage zuerst eine Klausur ein, um einen Lernplan zu berechnen.
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Klausur auswählen
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
                >
                  {exams.map((ex) => {
                    const sub = subjectMap.get(ex.subjectId);
                    return (
                      <option key={ex.id} value={ex.id}>
                        {ex.title} ({sub?.name || 'Fach'}) – am {ex.date}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Lernintensität
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light', label: 'Gemütlich (3 Tage)' },
                    { id: 'medium', label: 'Ausgewogen (5 Tage)' },
                    { id: 'intense', label: 'Intensiv (7 Tage)' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setIntensity(lvl.id as any)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                        intensity === lvl.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-gray-50 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 border-black/5 dark:border-white/5'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Plan preview */}
              {generatedPlan && (
                <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/10">
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Generierter Lernplan ({generatedPlan.length} Lerneinheiten)
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                    {generatedPlan.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-2.5 text-xs"
                      >
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <span className="font-bold text-purple-700 dark:text-purple-300 block">
                            {item.day}
                          </span>
                          <span className="text-gray-800 dark:text-gray-200">
                            {item.task}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {applied ? (
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Lerneinheiten wurden zu deinen Aufgaben hinzugefügt!</span>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={handleApplyToTasks}
                      icon={<Calendar className="w-4 h-4" />}
                    >
                      Plan in Aufgaben & Kalender übernehmen
                    </Button>
                  )}
                </div>
              )}

              {!generatedPlan && (
                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    icon={<Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />}
                  >
                    {isGenerating ? 'Berechne Lernplan...' : 'Lernplan jetzt berechnen'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </FeatureGate>
    </BottomSheet>
  );
};
