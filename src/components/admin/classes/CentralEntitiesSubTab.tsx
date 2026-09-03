import React, { useState } from 'react';
import {
  BookOpen,
  User,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
} from 'lucide-react';
import { useClassTimetableStore } from '../../../store/useClassTimetableStore';
import { SegmentedControl, type SegmentOption } from '../../common/SegmentedControl';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { SUBJECT_COLORS, getSubjectIcon, hexToRgba } from '../../../utils/colorUtils';
import type { Subject, Teacher, Room } from '../../../types';

interface CentralEntitiesSubTabProps {
  adminUid: string;
}

type EntityType = 'subjects' | 'teachers' | 'rooms';

export const CentralEntitiesSubTab: React.FC<CentralEntitiesSubTabProps> = () => {
  const {
    schoolSubjects,
    schoolTeachers,
    schoolRooms,
    addOrUpdateSubject,
    removeSubject,
    addOrUpdateTeacher,
    removeTeacher,
    addOrUpdateRoom,
    removeRoom,
  } = useClassTimetableStore();

  const [activeTab, setActiveTab] = useState<EntityType>('subjects');
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state for Subject
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isNewSubject, setIsNewSubject] = useState(false);

  // Editing state for Teacher
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isNewTeacher, setIsNewTeacher] = useState(false);

  // Editing state for Room
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isNewRoom, setIsNewRoom] = useState(false);

  const tabs: SegmentOption<EntityType>[] = [
    { id: 'subjects', label: `Fächer (${schoolSubjects.length})` },
    { id: 'teachers', label: `Lehrer (${schoolTeachers.length})` },
    { id: 'rooms', label: `Räume (${schoolRooms.length})` },
  ];

  // Subject Form Handlers
  const handleSaveSubject = async () => {
    if (!editingSubject || !editingSubject.name.trim()) return;
    await addOrUpdateSubject(editingSubject);
    setEditingSubject(null);
    setIsNewSubject(false);
  };

  // Teacher Form Handlers
  const handleSaveTeacher = async () => {
    if (!editingTeacher || !editingTeacher.name.trim()) return;
    await addOrUpdateTeacher(editingTeacher);
    setEditingTeacher(null);
    setIsNewTeacher(false);
  };

  // Room Form Handlers
  const handleSaveRoom = async () => {
    if (!editingRoom || !editingRoom.name.trim()) return;
    await addOrUpdateRoom(editingRoom);
    setEditingRoom(null);
    setIsNewRoom(false);
  };

  const filteredSubjects = schoolSubjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = schoolTeachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRooms = schoolRooms.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top bar with entity switch & search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          options={tabs}
          value={activeTab}
          onChange={(v) => {
            setActiveTab(v);
            setSearchTerm('');
            setEditingSubject(null);
            setEditingTeacher(null);
            setEditingRoom(null);
          }}
          size="sm"
        />

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ios-blue w-36 sm:w-48"
            />
          </div>

          {activeTab === 'subjects' && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditingSubject({
                  id: `sub-${Date.now()}`,
                  name: '',
                  shortName: '',
                  color: SUBJECT_COLORS[schoolSubjects.length % SUBJECT_COLORS.length],
                  icon: 'BookOpen',
                });
                setIsNewSubject(true);
              }}
            >
              Fach
            </Button>
          )}

          {activeTab === 'teachers' && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditingTeacher({
                  id: `teach-${Date.now()}`,
                  name: '',
                  shortName: '',
                  title: 'Frau',
                });
                setIsNewTeacher(true);
              }}
            >
              Lehrkraft
            </Button>
          )}

          {activeTab === 'rooms' && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditingRoom({
                  id: `room-${Date.now()}`,
                  name: '',
                  building: 'Hauptgebäude',
                });
                setIsNewRoom(true);
              }}
            >
              Raum
            </Button>
          )}
        </div>
      </div>

      {/* 1. SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        <div className="space-y-3">
          {/* Modal / Inline editor for Subject */}
          {editingSubject && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-ios-blue/30 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ios-blue">
                {isNewSubject ? 'Neues Fach anlegen' : 'Fach bearbeiten'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="z.B. Mathematik"
                    value={editingSubject.name}
                    onChange={(e) =>
                      setEditingSubject({ ...editingSubject, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white dark:bg-ios-dark-tertiary rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Kürzel</label>
                  <input
                    type="text"
                    placeholder="z.B. Ma"
                    value={editingSubject.shortName}
                    onChange={(e) =>
                      setEditingSubject({ ...editingSubject, shortName: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white dark:bg-ios-dark-tertiary rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Farbe</label>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {SUBJECT_COLORS.slice(0, 8).map((c: string) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditingSubject({ ...editingSubject, color: c })}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          editingSubject.color === c ? 'scale-110 border-black dark:border-white shadow-xs' : 'border-transparent opacity-80'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingSubject(null);
                    setIsNewSubject(false);
                  }}
                >
                  Abbrechen
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveSubject}>
                  Speichern
                </Button>
              </div>
            </div>
          )}

          {filteredSubjects.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              Keine Fächer gefunden. Klicke auf „+ Fach“, um eins hinzuzufügen.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredSubjects.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    borderLeftColor: sub.color,
                    borderLeftWidth: '3px',
                    backgroundColor: hexToRgba(sub.color, 0.08),
                  }}
                  className="p-3 rounded-xl border border-black/5 dark:border-white/5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {sub.name}
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold">{sub.shortName}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubject(sub);
                        setIsNewSubject(false);
                      }}
                      className="p-1 text-gray-400 hover:text-ios-blue transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSubject(sub.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. TEACHERS TAB */}
      {activeTab === 'teachers' && (
        <div className="space-y-3">
          {editingTeacher && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-ios-blue/30 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ios-blue">
                {isNewTeacher ? 'Neue Lehrkraft anlegen' : 'Lehrkraft bearbeiten'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Titel / Anrede</label>
                  <select
                    value={editingTeacher.title || 'Frau'}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, title: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white dark:bg-ios-dark-tertiary rounded-lg text-xs font-semibold"
                  >
                    <option value="Frau">Frau</option>
                    <option value="Herr">Herr</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="z.B. Müller oder Schmidt"
                    value={editingTeacher.name}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white dark:bg-ios-dark-tertiary rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Kürzel</label>
                  <input
                    type="text"
                    placeholder="z.B. MÜL oder SCHM"
                    value={editingTeacher.shortName}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, shortName: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white dark:bg-ios-dark-tertiary rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingTeacher(null);
                    setIsNewTeacher(false);
                  }}
                >
                  Abbrechen
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveTeacher}>
                  Speichern
                </Button>
              </div>
            </div>
          )}

          {filteredTeachers.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              Keine Lehrkräfte hinterlegt. Klicke auf „+ Lehrkraft“.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredTeachers.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {t.title ? `${t.title} ` : ''}{t.name}
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold">{t.shortName}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTeacher(t);
                        setIsNewTeacher(false);
                      }}
                      className="p-1 text-gray-400 hover:text-ios-blue transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTeacher(t.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ROOMS TAB */}
      {activeTab === 'rooms' && (
        <div className="space-y-3">
          {editingRoom && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-ios-blue/30 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ios-blue">
                {isNewRoom ? 'Neuen Raum anlegen' : 'Raum bearbeiten'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Raumbezeichnung</label>
                  <input
                    type="text"
                    placeholder="z.B. A101, Sporthalle oder Chemieraum 1"
                    value={editingRoom.name}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white dark:bg-ios-dark-tertiary rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Gebäude / Notiz</label>
                  <input
                    type="text"
                    placeholder="z.B. Haus A, 1. OG"
                    value={editingRoom.building || ''}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, building: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white dark:bg-ios-dark-tertiary rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingRoom(null);
                    setIsNewRoom(false);
                  }}
                >
                  Abbrechen
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveRoom}>
                  Speichern
                </Button>
              </div>
            </div>
          )}

          {filteredRooms.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              Keine Räume hinterlegt. Klicke auf „+ Raum“.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredRooms.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {r.name}
                    </div>
                    {r.building && (
                      <div className="text-[10px] text-gray-500 font-semibold truncate">{r.building}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoom(r);
                        setIsNewRoom(false);
                      }}
                      className="p-1 text-gray-400 hover:text-ios-blue transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRoom(r.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
