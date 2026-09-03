import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  Layers,
  HelpCircle,
  BookOpen,
  Plus,
  Copy,
  Archive,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { useClassTimetableStore } from '../../../store/useClassTimetableStore';
import { useSchoolConfigStore } from '../../../store/useSchoolConfigStore';
import { SegmentedControl, type SegmentOption } from '../../common/SegmentedControl';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { BottomSheet } from '../../common/BottomSheet';
import { ClassTimetableEditor } from './ClassTimetableEditor';
import { ClassVariantsTab } from './ClassVariantsTab';
import { ClassQuestionBuilderTab } from './ClassQuestionBuilderTab';
import { CentralEntitiesSubTab } from './CentralEntitiesSubTab';
import { ClassPublishDiffModal } from './ClassPublishDiffModal';
import { computeTimetableDiff } from '../../../services/school/classTimetableService';
import type {
  SchoolClass,
  ClassTimetable,
  TimetableEntry,
  TimetableVariant,
  OnboardingQuestion,
  TimetableDiff,
} from '../../../types';

interface ClassTimetableAdminTabProps {
  adminUid: string;
  adminEmail: string;
}

type ClassViewSubTab = 'timetable' | 'variants' | 'questions' | 'entities';

export const ClassTimetableAdminTab: React.FC<ClassTimetableAdminTabProps> = ({
  adminUid,
  adminEmail,
}) => {
  const {
    classes,
    selectedClass,
    publishedTimetable,
    draftTimetable,
    schoolSubjects,
    schoolTeachers,
    schoolRooms,
    isLoading,
    loadClasses,
    selectClass,
    saveDraft,
    publishDraft,
    addClass,
    updateClass,
    archiveClass,
    deleteClass,
    copyClass,
    loadSchoolEntities,
  } = useClassTimetableStore();

  const { periods } = useSchoolConfigStore();

  const [activeSubTab, setActiveSubTab] = useState<ClassViewSubTab>('timetable');

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceClassId, setCopySourceClassId] = useState('');
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [computedDiff, setComputedDiff] = useState<TimetableDiff | null>(null);

  // Form states for class creation
  const [classNameInput, setClassNameInput] = useState('');
  const [gradeLevelInput, setGradeLevelInput] = useState('');
  const [schoolYearInput, setSchoolYearInput] = useState('2026/2027');

  useEffect(() => {
    loadClasses();
    loadSchoolEntities();
  }, []);

  // Auto-select first class if none selected
  useEffect(() => {
    if (!selectedClass && classes.length > 0) {
      selectClass(classes[0].id);
    }
  }, [classes, selectedClass]);

  const subTabs: SegmentOption<ClassViewSubTab>[] = [
    { id: 'timetable', label: 'Stundenplan-Editor' },
    { id: 'variants', label: `Varianten (${draftTimetable?.variants?.length || 0})` },
    { id: 'questions', label: `Zuordnungsfragen (${draftTimetable?.questions?.length || 0})` },
    { id: 'entities', label: 'Fächer / Lehrer / Räume' },
  ];

  // Class Save Handler
  const handleSaveClass = async () => {
    if (!classNameInput.trim()) return;

    if (editingClass) {
      await updateClass(adminUid, editingClass.id, {
        name: classNameInput.trim(),
        gradeLevel: gradeLevelInput.trim() || '10',
        schoolYear: schoolYearInput.trim() || '2026/2027',
      });
    } else {
      const newClass: SchoolClass = {
        id: `class-${classNameInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
        name: classNameInput.trim(),
        gradeLevel: gradeLevelInput.trim() || '10',
        schoolYear: schoolYearInput.trim() || '2026/2027',
        archived: false,
        studentCount: 0,
        activeTimetableVersion: 1,
        publishedAt: null,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedByUid: adminUid,
      };
      await addClass(adminUid, newClass);
      await selectClass(newClass.id);
    }

    setIsClassModalOpen(false);
    setEditingClass(null);
  };

  // Copy Handler
  const handleConfirmCopy = async () => {
    if (!copySourceClassId || !selectedClass) return;
    await copyClass(adminUid, copySourceClassId, selectedClass.id);
    setIsCopyModalOpen(false);
  };

  // Open Publish Diff Modal
  const handleOpenPublishModal = () => {
    if (!draftTimetable) return;

    const diff = computeTimetableDiff(
      publishedTimetable?.baseEntries || [],
      draftTimetable.baseEntries || [],
      schoolSubjects,
      schoolTeachers,
      schoolRooms
    );

    setComputedDiff(diff);
    setIsDiffModalOpen(true);
  };

  // Confirm Publish
  const handleConfirmPublish = async (summary: string[]) => {
    if (!selectedClass || !draftTimetable) return;
    await publishDraft(adminUid, selectedClass.id, draftTimetable, summary);
  };

  return (
    <div className="space-y-4">
      {/* Top Header: Class Switcher & Class Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ios-blue/15 text-ios-blue flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                Klassen & Stundenpläne
              </h3>
              {selectedClass && (
                <Badge variant={selectedClass.archived ? 'gray' : 'blue'} size="sm">
                  {selectedClass.archived ? 'Archiviert' : `v${selectedClass.activeTimetableVersion}`}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Admin-gepflegte Pläne mit individuellen Fächer- und Lehrer-Varianten
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {classes.length > 0 && (
            <select
              value={selectedClass?.id || ''}
              onChange={(e) => selectClass(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-ios-dark-tertiary rounded-xl text-xs font-bold border border-black/5 dark:border-white/10"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Klasse {c.name} {c.archived ? '(Archiv)' : ''}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingClass(null);
              setClassNameInput('');
              setGradeLevelInput('');
              setIsClassModalOpen(true);
            }}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Klasse anlegen
          </Button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 dark:bg-ios-dark-secondary rounded-2xl border border-black/5 dark:border-white/5 space-y-3">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Noch keine Schulklassen vorhanden
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Erstelle die erste Klasse (z. B. 10A), um ihren Stundenplan und individuelle Varianten anzulegen.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingClass(null);
              setClassNameInput('');
              setGradeLevelInput('');
              setIsClassModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Jetzt erste Klasse erstellen
          </Button>
        </div>
      ) : (
        selectedClass && (
          <div className="space-y-4">
            {/* Class Info bar & actions */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-900 dark:text-white text-base">
                  Klasse {selectedClass.name}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">Stufe {selectedClass.gradeLevel}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{selectedClass.schoolYear}</span>
                {selectedClass.publishedAt && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      Live seit {new Date(selectedClass.publishedAt).toLocaleDateString('de-DE')}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingClass(selectedClass);
                    setClassNameInput(selectedClass.name);
                    setGradeLevelInput(selectedClass.gradeLevel);
                    setSchoolYearInput(selectedClass.schoolYear);
                    setIsClassModalOpen(true);
                  }}
                  className="p-1.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-lg text-gray-600 hover:text-ios-blue transition-colors text-xs font-semibold flex items-center gap-1"
                  title="Klasse umbenennen / bearbeiten"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bearbeiten</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCopySourceClassId(classes.find((c) => c.id !== selectedClass.id)?.id || '');
                    setIsCopyModalOpen(true);
                  }}
                  className="p-1.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-lg text-gray-600 hover:text-ios-blue transition-colors text-xs font-semibold flex items-center gap-1"
                  title="Stundenplan aus anderer Klasse kopieren"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kopieren</span>
                </button>

                <button
                  type="button"
                  onClick={() => archiveClass(adminUid, selectedClass.id, !selectedClass.archived)}
                  className="p-1.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-lg text-gray-600 hover:text-amber-600 transition-colors text-xs font-semibold flex items-center gap-1"
                  title={selectedClass.archived ? 'Klasse reaktivieren' : 'Klasse archivieren'}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {selectedClass.archived ? 'Reaktivieren' : 'Archivieren'}
                  </span>
                </button>
              </div>
            </div>

            {/* Subtab Navigator */}
            <div className="flex flex-wrap pb-1">
              <SegmentedControl
                options={subTabs}
                value={activeSubTab}
                onChange={setActiveSubTab}
                size="sm"
              />
            </div>

            {/* 1. TIMETABLE EDITOR TAB */}
            {activeSubTab === 'timetable' && (
              <ClassTimetableEditor
                baseEntries={draftTimetable?.baseEntries || []}
                variants={draftTimetable?.variants || []}
                subjects={schoolSubjects}
                teachers={schoolTeachers}
                rooms={schoolRooms}
                periods={periods}
                activeVersion={selectedClass.activeTimetableVersion}
                onSaveDraft={async (newEntries) => {
                  await saveDraft(adminUid, selectedClass.id, {
                    ...draftTimetable,
                    baseEntries: newEntries,
                  });
                }}
                onOpenPublishModal={handleOpenPublishModal}
              />
            )}

            {/* 2. VARIANTS TAB */}
            {activeSubTab === 'variants' && (
              <ClassVariantsTab
                classId={selectedClass.id}
                variants={draftTimetable?.variants || []}
                subjects={schoolSubjects}
                teachers={schoolTeachers}
                rooms={schoolRooms}
                periods={periods}
                onChangeVariants={async (newVariants) => {
                  await saveDraft(adminUid, selectedClass.id, {
                    ...draftTimetable,
                    variants: newVariants,
                  });
                }}
              />
            )}

            {/* 3. QUESTION BUILDER TAB */}
            {activeSubTab === 'questions' && (
              <ClassQuestionBuilderTab
                questions={draftTimetable?.questions || []}
                variants={draftTimetable?.variants || []}
                onChangeQuestions={async (newQuestions) => {
                  await saveDraft(adminUid, selectedClass.id, {
                    ...draftTimetable,
                    questions: newQuestions,
                  });
                }}
              />
            )}

            {/* 4. CENTRAL ENTITIES TAB */}
            {activeSubTab === 'entities' && <CentralEntitiesSubTab adminUid={adminUid} />}
          </div>
        )
      )}

      {/* Modal: Klasse erstellen / bearbeiten */}
      <BottomSheet
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setEditingClass(null);
        }}
        title={editingClass ? `Klasse ${editingClass.name} bearbeiten` : 'Neue Klasse erstellen'}
      >
        <div className="space-y-4 pb-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Klassenbezeichnung
            </label>
            <input
              type="text"
              placeholder="z.B. 10A, 9B, 11-1 oder Q12"
              value={classNameInput}
              onChange={(e) => setClassNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Jahrgangsstufe</label>
              <input
                type="text"
                placeholder="z.B. 10"
                value={gradeLevelInput}
                onChange={(e) => setGradeLevelInput(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Schuljahr</label>
              <input
                type="text"
                placeholder="z.B. 2026/2027"
                value={schoolYearInput}
                onChange={(e) => setSchoolYearInput(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/10">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setIsClassModalOpen(false);
                setEditingClass(null);
              }}
            >
              Abbrechen
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveClass}>
              {editingClass ? 'Aktualisieren' : 'Klasse anlegen'}
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Modal: Stundenplan aus anderer Klasse kopieren */}
      <BottomSheet
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        title="Stundenplan kopieren"
      >
        <div className="space-y-4 pb-2">
          <p className="text-xs text-gray-500">
            Wähle eine bestehende Klasse aus, von der der Stundenplan, Varianten und Zuordnungsfragen
            in die Klasse <span className="font-bold text-gray-900 dark:text-white">{selectedClass?.name}</span> kopiert werden sollen.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Quellklasse auswählen:
            </label>
            <select
              value={copySourceClassId}
              onChange={(e) => setCopySourceClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold"
            >
              <option value="">Bitte wählen...</option>
              {classes
                .filter((c) => c.id !== selectedClass?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    Klasse {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/10">
            <Button variant="secondary" size="md" onClick={() => setIsCopyModalOpen(false)}>
              Abbrechen
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!copySourceClassId}
              onClick={handleConfirmCopy}
              icon={<Copy className="w-3.5 h-3.5" />}
            >
              Stundenplan kopieren
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Modal: Diff-Vorschau & Veröffentlichen */}
      {computedDiff && draftTimetable && selectedClass && (
        <ClassPublishDiffModal
          isOpen={isDiffModalOpen}
          onClose={() => setIsDiffModalOpen(false)}
          classNameTitle={selectedClass.name}
          diff={computedDiff}
          draftTimetable={draftTimetable}
          currentPublishedVersion={selectedClass.activeTimetableVersion}
          onConfirmPublish={handleConfirmPublish}
        />
      )}
    </div>
  );
};
