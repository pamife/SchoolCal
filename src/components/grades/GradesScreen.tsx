import React, { useMemo, useState } from 'react';
import { Award, BookOpen, FileCheck2, Info, Plus, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { FeatureGate } from '../licensing/FeatureGate';
import { useGradeStore } from '../../store/useGradeStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../common/Button';
import { Button as StatefulButton } from '../ui/stateful-button';
import { BottomSheet } from '../common/BottomSheet';
import { PricingModal } from '../licensing/PricingModal';
import { LicenseActivationModal } from '../licensing/LicenseActivationModal';
import type { Grade, GradeType } from '../../types';
import { formatRecordedResult, getGradingSystem, getRecordedGradingSystem } from '../../utils/gradingSystem';

const gradeTypeLabels: Record<GradeType, string> = {
  exam: 'Klausur / Schulaufgabe',
  test: 'Test / Kurzkontrolle',
  oral: 'Mündliche Leistung',
  presentation: 'Präsentation',
  homework: 'Hausaufgabe',
  other: 'Sonstiges',
};

export const GradesScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { subjects } = useSchoolStore();
  const { settings } = useSettingsStore();
  const { grades, addGrade, deleteGrade } = useGradeStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isActivationOpen, setIsActivationOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [value, setValue] = useState<number>(2);
  const [type, setType] = useState<GradeType>('exam');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  const uid = user?.uid || '';
  const gradingSystem = getGradingSystem(settings.gradeLevel);
  const usesPoints = gradingSystem === 'points';

  const subjectGradesMap = useMemo(() => {
    const grouped = new Map<string, Grade[]>();
    grades.forEach((grade) => {
      const list = grouped.get(grade.subjectId) || [];
      list.push(grade);
      grouped.set(grade.subjectId, list);
    });
    grouped.forEach((list) => list.sort((a, b) => b.date.localeCompare(a.date)));
    return grouped;
  }, [grades]);

  const openAddModal = () => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
    setValue(usesPoints ? 10 : 2);
    setIsAddModalOpen(true);
  };

  const handleSaveGrade = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSubjectId || !title.trim()) return;

    const normalizedValue = usesPoints
      ? Math.round(Math.min(15, Math.max(0, Number(value))))
      : Math.min(6, Math.max(1, Number(value)));

    const newGrade: Grade = {
      id: `grd-${Date.now()}`,
      subjectId: selectedSubjectId,
      title: title.trim(),
      value: normalizedValue,
      weight: 1,
      gradingSystem,
      type,
      date,
      notes: notes.trim() || undefined,
    };

    await addGrade(uid, newGrade);
    setTitle('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-4 ipad:pb-6 max-w-5xl mx-auto px-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            <span>Notennachweis</span>
            <span className="rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              Pro
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ergebnisse dokumentieren – ohne Durchschnitt, Prognose oder Endnote.
          </p>
        </div>

        <Button type="button" variant="primary" size="sm" onClick={openAddModal} icon={<Plus className="h-4 w-4" />}>
          Ergebnis eintragen
        </Button>
      </div>

      <FeatureGate
        feature="gradeAnalytics"
        fallbackTitle="Persönlicher Notennachweis"
        fallbackDescription="Dokumentiere deine schulischen Ergebnisse übersichtlich nach Fach und Datum. Es werden keine Durchschnitte oder Endnoten berechnet."
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenActivation={() => setIsActivationOpen(true)}
      >
        <div className="space-y-5">
          <div className="ios-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-ios-blue dark:bg-blue-950/50">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {grades.length} {grades.length === 1 ? 'Eintrag' : 'Einträge'} dokumentiert
                </div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Aktuelle Eingabe: {usesPoints ? '0–15 Punkte (ab Klasse 11)' : 'Noten 1–6'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Info className="h-4 w-4 shrink-0" />
              <span>Die tatsächliche Zeugnisnote legt ausschließlich die Schule fest.</span>
            </div>
          </div>

          {subjects.length === 0 ? (
            <div className="ios-card p-8 text-center text-xs text-gray-500 dark:text-gray-400">
              Lege im Tab <strong>Schule</strong> zuerst deine Schulfächer an.
            </div>
          ) : grades.length === 0 ? (
            <div className="ios-card p-8 text-center">
              <Award className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">Noch keine Ergebnisse eingetragen</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Deine Einträge erscheinen hier nach Fach und Datum sortiert.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {subjects.map((subject) => {
                const subjectGrades = subjectGradesMap.get(subject.id) || [];
                if (subjectGrades.length === 0) return null;

                return (
                  <section key={subject.id} className="ios-card p-4">
                    <div className="flex items-center gap-2.5 border-b border-black/5 pb-3 dark:border-white/5">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.shortName}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{subject.name}</h3>
                        <p className="text-[11px] text-gray-400">{subjectGrades.length} {subjectGrades.length === 1 ? 'Eintrag' : 'Einträge'}</p>
                      </div>
                    </div>

                    <div className="mt-2 space-y-2">
                      {subjectGrades.map((grade) => (
                        <article key={grade.id} className="rounded-xl bg-gray-50 p-3 dark:bg-ios-dark-secondary">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-md px-2 py-1 text-xs font-bold ${
                                  getRecordedGradingSystem(grade) === 'points'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                    : 'bg-white text-gray-900 dark:bg-ios-dark-card dark:text-white'
                                }`}>
                                  {formatRecordedResult(grade)}
                                </span>
                                <span className="text-[11px] text-gray-400">{format(parseISO(grade.date), 'dd.MM.yyyy')}</span>
                              </div>
                              <h4 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{grade.title}</h4>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">{gradeTypeLabels[grade.type]}</p>
                              {grade.notes && <p className="mt-2 whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-300">{grade.notes}</p>}
                            </div>
                            <StatefulButton
                              type="button"
                              onClick={() => deleteGrade(uid, grade.id)}
                              variant="ghost"
                              size="sm"
                              className="touch-target flex shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                              aria-label={`${grade.title} löschen`}
                              title="Löschen"
                              icon={<Trash2 className="h-4 w-4" />}
                            >
                            </StatefulButton>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </FeatureGate>

      <BottomSheet isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Ergebnis dokumentieren">
        <form onSubmit={handleSaveGrade} className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
            {usesPoints
              ? `Für „${settings.gradeLevel || 'Oberstufe'}“ werden Ergebnisse als 0 bis 15 Punkte gespeichert.`
              : `Für „${settings.gradeLevel || 'deine Klassenstufe'}“ werden Ergebnisse als Noten von 1 bis 6 gespeichert.`}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Schulfach</label>
            <select
              value={selectedSubjectId}
              onChange={(event) => setSelectedSubjectId(event.target.value)}
              required
              className="w-full rounded-xl bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none dark:bg-ios-dark-secondary dark:text-white"
            >
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.shortName})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {usesPoints ? 'Punkte (0–15)' : 'Note (1–6)'}
              </label>
              <input
                type="number"
                step={usesPoints ? 1 : 0.1}
                min={usesPoints ? 0 : 1}
                max={usesPoints ? 15 : 6}
                required
                value={value}
                onChange={(event) => setValue(Number(event.target.value))}
                className="w-full rounded-xl bg-gray-100 px-3.5 py-2.5 text-center text-sm font-bold text-gray-900 focus:outline-none dark:bg-ios-dark-secondary dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Datum</label>
              <input
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-xl bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none dark:bg-ios-dark-secondary dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Art der Leistung</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as GradeType)}
              className="w-full rounded-xl bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none dark:bg-ios-dark-secondary dark:text-white"
            >
              {Object.entries(gradeTypeLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Bezeichnung / Thema</label>
            <input
              type="text"
              required
              placeholder="z. B. Klausur Analysis"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl bg-gray-100 px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none dark:bg-ios-dark-secondary dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Notiz / Nachweis (optional)</label>
            <textarea
              rows={3}
              placeholder="z. B. Rückgabedatum, Thema oder Hinweis der Lehrkraft"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-xl bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none dark:bg-ios-dark-secondary dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="md" onClick={() => setIsAddModalOpen(false)}>Abbrechen</Button>
            <Button type="submit" variant="primary" size="md" icon={<BookOpen className="h-4 w-4" />}>Speichern</Button>
          </div>
        </form>
      </BottomSheet>

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onOpenActivation={() => {
          setIsPricingOpen(false);
          setIsActivationOpen(true);
        }}
      />
      <LicenseActivationModal isOpen={isActivationOpen} onClose={() => setIsActivationOpen(false)} />
    </div>
  );
};
