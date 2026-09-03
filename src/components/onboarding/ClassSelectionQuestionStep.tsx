import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  evaluateQuestionVisibility,
  extractActiveVariants,
} from '../../services/school/classTimetableService';
import type { OnboardingQuestion } from '../../types';

interface ClassSelectionQuestionStepProps {
  className: string;
  questions: OnboardingQuestion[];
  initialAnswers?: Record<string, string>;
  onComplete: (answers: Record<string, string>, activeVariantIds: string[]) => void;
  onBack?: () => void;
}

export const ClassSelectionQuestionStep: React.FC<ClassSelectionQuestionStepProps> = ({
  className,
  questions,
  initialAnswers = {},
  onComplete,
  onBack,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Evaluate which questions are currently visible based on answers
  const visibleQuestions = useMemo(() => {
    return evaluateQuestionVisibility(questions, answers);
  }, [questions, answers]);

  const activeQuestion = visibleQuestions[currentQuestionIdx] || visibleQuestions[0];

  const handleSelectOption = (questionId: string, optionId: string) => {
    const updatedAnswers = { ...answers, [questionId]: optionId };
    setAnswers(updatedAnswers);

    // If there is a next question visible, auto-advance smoothly
    const nextVisible = evaluateQuestionVisibility(questions, updatedAnswers);
    if (currentQuestionIdx < nextVisible.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handleFinish = () => {
    const activeVariants = extractActiveVariants(questions, answers);
    onComplete(answers, activeVariants);
  };

  const isCurrentAnswered = Boolean(activeQuestion && answers[activeQuestion.id]);
  const isLastQuestion = currentQuestionIdx === visibleQuestions.length - 1;
  const allRequiredAnswered = visibleQuestions.every(
    (q) => !q.required || Boolean(answers[q.id])
  );

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Header Info */}
      <div className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ios-blue/10 text-ios-blue text-[11px] font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          Klasse {className}
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Deinen Stundenplan anpassen
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Damit wir deinen persönlichen Stundenplan passgenau einrichten können, beantworte bitte
          diese kurzen Fragen.
        </p>
      </div>

      {/* Progress Dots */}
      {visibleQuestions.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-1">
          {visibleQuestions.map((q, idx) => {
            const isAnswered = Boolean(answers[q.id]);
            const isCurrent = idx === currentQuestionIdx;
            return (
              <div
                key={q.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'w-6 bg-ios-blue'
                    : isAnswered
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-gray-200 dark:bg-gray-700'
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Question Card */}
      {activeQuestion && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 space-y-3 shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-ios-blue">
                  Frage {currentQuestionIdx + 1} von {visibleQuestions.length}
                </span>
                {activeQuestion.required && (
                  <span className="text-[10px] text-red-500 font-bold">*Pflichtangabe</span>
                )}
              </div>
              <h4 className="text-base font-black text-gray-900 dark:text-white mt-1">
                {activeQuestion.title}
              </h4>
              {activeQuestion.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {activeQuestion.description}
                </p>
              )}
            </div>

            {/* Options list */}
            <div className="space-y-2 pt-1">
              {activeQuestion.options.map((opt) => {
                const isSelected = answers[activeQuestion.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(activeQuestion.id, opt.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all border flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-ios-blue/10 border-ios-blue text-ios-blue shadow-xs'
                        : 'bg-white dark:bg-ios-dark-tertiary border-black/5 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          isSelected ? 'text-ios-blue' : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {opt.label}
                      </div>
                      {opt.subLabel && (
                        <div className="text-[10px] text-gray-400 mt-0.5">{opt.subLabel}</div>
                      )}
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-ios-blue bg-ios-blue text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {currentQuestionIdx > 0 ? (
          <Button
            variant="secondary"
            size="md"
            onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Vorherige Frage
          </Button>
        ) : onBack ? (
          <Button variant="secondary" size="md" onClick={onBack}>
            Zurück
          </Button>
        ) : (
          <div />
        )}

        <div>
          {isLastQuestion ? (
            <Button
              variant="primary"
              size="md"
              disabled={!allRequiredAnswered}
              onClick={handleFinish}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Stundenplan fertigstellen
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              disabled={!isCurrentAnswered}
              onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Weiter
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
