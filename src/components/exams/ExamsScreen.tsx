import React, { useState } from 'react';
import { Plus, GraduationCap, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { useExamStore } from '../../store/useExamStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { ExamCard } from './ExamCard';
import { ExamModal } from './ExamModal';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { Exam } from '../../types';

export const ExamsScreen: React.FC = () => {
  const { exams, addExam, updateExam, deleteExam, toggleExamTopic } = useExamStore();
  const { subjects, teachers, rooms } = useSchoolStore();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));

  const filteredExams = exams.filter(e => {
    if (selectedSubjectFilter === 'all') return true;
    return e.subjectId === selectedSubjectFilter;
  });

  return (
    <div className="space-y-4 pb-24 ipad:pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Klausuren & Prüfungen</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-500 font-bold">
              {exams.length} anstehend
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Klausurtermine, Stoffthemen und Lernfortschritt verwalten
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingExam(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Klausur eintragen
        </Button>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 px-1">
        <button
          type="button"
          onClick={() => setSelectedSubjectFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedSubjectFilter === 'all'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-600 dark:text-gray-400 hover:bg-gray-200'
          }`}
        >
          Alle Fächer
        </button>

        {subjects.map((sub) => {
          const isSelected = selectedSubjectFilter === sub.id;
          const count = exams.filter(e => e.subjectId === sub.id).length;

          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubjectFilter(sub.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: isSelected ? sub.color : undefined,
              }}
            >
              <span>{sub.name}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-white/25 text-white' : 'bg-black/10 dark:bg-white/10'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Exams List */}
      <div className="space-y-3.5">
        {filteredExams.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="w-8 h-8 text-ios-blue" />}
            title="Keine anstehenden Prüfungen"
            description="Aktuell sind keine Klausuren oder Tests eingetragen."
            actionLabel="Erste Klausur eintragen"
            onAction={() => {
              setEditingExam(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          filteredExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              subject={subjectMap.get(exam.subjectId)}
              teacher={exam.teacherId ? teacherMap.get(exam.teacherId) : undefined}
              room={exam.roomId ? roomMap.get(exam.roomId) : undefined}
              onToggleTopic={toggleExamTopic}
              onEdit={(e) => {
                setEditingExam(e);
                setIsModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Modal */}
      <ExamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(ex) => {
          if (editingExam) {
            updateExam(ex.id, ex);
          } else {
            addExam(ex);
          }
        }}
        onDelete={(id) => deleteExam(id)}
        initialExam={editingExam}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
      />
    </div>
  );
};
