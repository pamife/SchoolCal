import React from 'react';
import {
  GraduationCap,
  Clock,
  MapPin,
  User,
  CheckSquare,
  Square,
  Edit2,
  AlertCircle,
} from 'lucide-react';
import { Exam, Subject, Teacher, Room } from '../../types';
import { getExamCountdownText, formatGermanDate } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';

interface ExamCardProps {
  exam: Exam;
  subject?: Subject;
  teacher?: Teacher;
  room?: Room;
  onToggleTopic: (examId: string, topicId: string) => void;
  onEdit: (exam: Exam) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  subject,
  teacher,
  room,
  onToggleTopic,
  onEdit,
}) => {
  const countdown = getExamCountdownText(exam.date);
  const formattedDate = formatGermanDate(exam.date, 'EEEE, d. MMMM yyyy');

  return (
    <div className="ios-card p-4 sm:p-5 transition-all hover:shadow-lg space-y-3.5">
      {/* Top Header: Subject Badge, Title & Countdown Pill */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {subject && (
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 font-bold text-base shadow-xs"
              style={{ backgroundColor: subject.color }}
            >
              {subject.shortName}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {exam.type === 'exam'
                  ? 'Klausur'
                  : exam.type === 'test'
                  ? 'Kurzkontrolle'
                  : exam.type === 'presentation'
                  ? 'Referat / GFS'
                  : 'Mündlich'}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {subject?.name}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight mt-0.5 truncate">
              {exam.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={
              countdown.urgency === 'today' || countdown.urgency === 'tomorrow'
                ? 'red'
                : countdown.urgency === 'urgent'
                ? 'orange'
                : 'blue'
            }
            size="md"
          >
            {countdown.label}
          </Badge>

          <button
            type="button"
            onClick={() => onEdit(exam)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Klausur bearbeiten"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Row: Date, Time, Room, Teacher */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-ios-dark-secondary p-2.5 rounded-xl">
        <span className="flex items-center gap-1 font-semibold">
          <Clock className="w-3.5 h-3.5 text-ios-blue" />
          {formattedDate} {exam.startTime ? `(${exam.startTime} – ${exam.endTime || 'Ende'})` : ''}
        </span>

        {room && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {room.name}
          </span>
        )}

        {teacher && (
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-gray-400" />
            {teacher.name}
          </span>
        )}
      </div>

      {/* Study Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">
          <span>Lernfortschritt</span>
          <span className="font-bold text-ios-blue">{exam.studyProgress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${exam.studyProgress}%`,
              backgroundColor: subject?.color || '#007AFF',
            }}
          />
        </div>
      </div>

      {/* Topics Checklist */}
      {exam.topics && exam.topics.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Lernziele & Themen ({exam.topics.filter(t => t.completed).length}/{exam.topics.length} gelernt)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {exam.topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => onToggleTopic(exam.id, topic.id)}
                className="flex items-center gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-left group"
              >
                {topic.completed ? (
                  <CheckSquare className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400 group-hover:text-ios-blue shrink-0" />
                )}
                <span
                  className={`text-xs font-medium truncate ${
                    topic.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {topic.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes footer if available */}
      {exam.notes && (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic pt-1 border-t border-black/5 dark:border-white/5">
          💡 {exam.notes}
        </p>
      )}
    </div>
  );
};
