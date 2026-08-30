import React, { useState, useEffect } from 'react';
import { Subject, Teacher, Room } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { ACCENT_PALETTES, getSubjectIcon } from '../../utils/colorUtils';
import { Trash2 } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  onDelete?: (id: string) => void;
  initialSubject?: Subject | null;
  teachers: Teacher[];
  rooms: Room[];
}

const AVAILABLE_ICONS = [
  'Calculator',
  'BookOpen',
  'Languages',
  'Atom',
  'Leaf',
  'Landmark',
  'Code',
  'Palette',
  'Activity',
  'Music',
  'GraduationCap',
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialSubject,
  teachers,
  rooms,
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [color, setColor] = useState('#007AFF');
  const [icon, setIcon] = useState('BookOpen');
  const [teacherId, setTeacherId] = useState('');
  const [defaultRoomId, setDefaultRoomId] = useState('');

  useEffect(() => {
    if (initialSubject) {
      setName(initialSubject.name);
      setShortName(initialSubject.shortName);
      setColor(initialSubject.color);
      setIcon(initialSubject.icon);
      setTeacherId(initialSubject.teacherId || '');
      setDefaultRoomId(initialSubject.defaultRoomId || '');
    } else {
      setName('');
      setShortName('');
      setColor('#007AFF');
      setIcon('BookOpen');
      setTeacherId('');
      setDefaultRoomId('');
    }
  }, [initialSubject, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const subjectToSave: Subject = {
      id: initialSubject?.id || `sub-${Date.now()}`,
      name: name.trim(),
      shortName: shortName.trim() || name.slice(0, 2).toUpperCase(),
      color,
      icon,
      teacherId: teacherId || undefined,
      defaultRoomId: defaultRoomId || undefined,
    };

    onSave(subjectToSave);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialSubject ? 'Fach bearbeiten' : 'Neues Schulfach'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Short Name */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Fachname
            </label>
            <input
              type="text"
              required
              placeholder="z.B. Mathematik"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!shortName) setShortName(e.target.value.slice(0, 2).toUpperCase());
              }}
              className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Kürzel
            </label>
            <input
              type="text"
              required
              placeholder="M"
              maxLength={4}
              value={shortName}
              onChange={(e) => setShortName(e.target.value.toUpperCase())}
              className="w-full px-3 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-bold text-center text-gray-900 dark:text-white uppercase focus:outline-none"
            />
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Farbe
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PALETTES.map((p) => (
              <button
                key={p.color}
                type="button"
                onClick={() => setColor(p.color)}
                style={{ backgroundColor: p.color }}
                className={`w-8 h-8 rounded-full transition-transform ${
                  color === p.color ? 'scale-110 ring-2 ring-white dark:ring-black shadow-md' : 'opacity-80 hover:opacity-100'
                }`}
                title={p.name}
              />
            ))}
          </div>
        </div>

        {/* Icon Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ICONS.map((ic) => {
              const IconComp = getSubjectIcon(ic);
              return (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'bg-ios-blue text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Default Teacher & Room */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Standard-Lehrer
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="">Kein Standard</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.shortName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Standard-Raum
            </label>
            <select
              value={defaultRoomId}
              onChange={(e) => setDefaultRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="">Kein Standard</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {initialSubject && onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={() => {
                onDelete(initialSubject.id);
                onClose();
              }}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Löschen
            </Button>
          )}

          <Button type="submit" variant="primary" size="md" fullWidth>
            {initialSubject ? 'Speichern' : 'Fach anlegen'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
