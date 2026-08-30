import React from 'react';
import { GraduationCap, Clock, ChevronRight, BookOpen, Plus } from 'lucide-react';
import { Exam, Subject } from '../../types';
import { getExamCountdownText } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';

interface ExamCountdownWidgetProps {
  exams: Exam[];
  subjects: Subject[];
  onOpenExamsTab: () => void;
  onAddExam: () => void;
  onSelectExam?: (exam: Exam) => void;
}

export const ExamCountdownWidget: React.FC<ExamCountdownWidgetProps> = ({
  exams,
  subjects,
  onOpenExamsTab,
  onAddExam,
  onSelectExam,
}) => {
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const upcomingExams = exams.slice(0, 3);

  return (
    <div className="ios-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Klausur-Countdowns
          </h3>
          {exams.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 font-bold">
              {exams.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddExam}
            className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-ios-blue transition-colors"
            title="Klausur hinzufügen"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onOpenExamsTab}
            className="text-xs font-semibold text-ios-blue hover:underline flex items-center gap-0.5"
          >
            Alle anzeigen
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {upcomingExams.length === 0 ? (
        <div className="py-4 text-center text-xs text-gray-400">
          Keine Klausuren eingetragen.
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingExams.map((exam) => {
            const subject = subjectMap.get(exam.subjectId);
            const countdown = getExamCountdownText(exam.date);

            return (
              <div
                key={exam.id}
                onClick={() => onSelectExam && onSelectExam(exam)}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary hover:bg-gray-100 dark:hover:bg-ios-dark-tertiary transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {subject && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shrink-0"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.shortName}
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {exam.title}
                    </h4>
                  </div>

                  <Badge
                    variant={
                      countdown.urgency === 'today' || countdown.urgency === 'tomorrow'
                        ? 'red'
                        : countdown.urgency === 'urgent'
                        ? 'orange'
                        : 'gray'
                    }
                    size="sm"
                    className="shrink-0"
                  >
                    {countdown.label}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1 font-medium">
                    <span>Lernfortschritt</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      {exam.studyProgress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${exam.studyProgress}%`,
                        backgroundColor: subject?.color || '#007AFF',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
