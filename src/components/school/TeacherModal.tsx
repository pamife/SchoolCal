import React, { useState, useEffect } from 'react';
import { Teacher, Subject } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { Trash2 } from 'lucide-react';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
  onDelete?: (id: string) => void;
  initialTeacher?: Teacher | null;
  subjects: Subject[];
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTeacher,
  subjects,
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('Herr');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (initialTeacher) {
      setName(initialTeacher.name);
      setShortName(initialTeacher.shortName);
      setEmail(initialTeacher.email || '');
      setTitle(initialTeacher.title || 'Herr');
      setSelectedSubjects(initialTeacher.subjects || []);
    } else {
      setName('');
      setShortName('');
      setEmail('');
      setTitle('Herr');
      setSelectedSubjects([]);
    }
  }, [initialTeacher, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const teacherToSave: Teacher = {
      id: initialTeacher?.id || `teach-${Date.now()}`,
      name: name.trim(),
      shortName: shortName.trim() || name.slice(0, 3).toUpperCase(),
      email: email.trim() || undefined,
      title: title || undefined,
      subjects: selectedSubjects,
    };

    onSave(teacherToSave);
    onClose();
  };

  const toggleSubject = (subId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialTeacher ? 'Lehrkraft bearbeiten' : 'Neue Lehrkraft'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Name */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Anrede / Titel
            </label>
            <input
              type="text"
              placeholder="Frau / Dr."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Vollständiger Name
            </label>
            <input
              type="text"
              required
              placeholder="z.B. Frau Schmidt"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!shortName) setShortName(e.target.value.slice(0, 3).toUpperCase());
              }}
              className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Short name & Email */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Kürzel
            </label>
            <input
              type="text"
              placeholder="SCH"
              maxLength={4}
              value={shortName}
              onChange={(e) => setShortName(e.target.value.toUpperCase())}
              className="w-full px-3 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-bold text-center text-gray-900 dark:text-white uppercase focus:outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              E-Mail (optional)
            </label>
            <input
              type="email"
              placeholder="schmidt@schule.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Subjects taught */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Unterrichtete Fächer
          </label>
          <div className="flex flex-wrap gap-1.5">
            {subjects.map((sub) => {
              const isSelected = selectedSubjects.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => toggleSubject(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-ios-blue text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {initialTeacher && onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={() => {
                onDelete(initialTeacher.id);
                onClose();
              }}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Löschen
            </Button>
          )}

          <Button type="submit" variant="primary" size="md" fullWidth>
            {initialTeacher ? 'Speichern' : 'Lehrer anlegen'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
