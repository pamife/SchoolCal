import React, { useState } from 'react';
import { FeatureGate } from '../licensing/FeatureGate';
import { useGradeStore } from '../../store/useGradeStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { BottomSheet } from '../common/BottomSheet';
import { PricingModal } from '../licensing/PricingModal';
import { LicenseActivationModal } from '../licensing/LicenseActivationModal';
import { Award, Plus, TrendingUp, BarChart3, Trash2, BookOpen, Calculator, Sparkles } from 'lucide-react';
import type { Grade, GradeType } from '../../types';
import { format } from 'date-fns';

export const GradesScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { subjects } = useSchoolStore();
  const { grades, addGrade, deleteGrade } = useGradeStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isActivationOpen, setIsActivationOpen] = useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [value, setValue] = useState<number>(2);
  const [weight, setWeight] = useState<number>(1);
  const [type, setType] = useState<GradeType>('exam');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const uid = user?.uid || '';
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  // Calculate Overall Average
  const totalWeightedSum = grades.reduce((sum, g) => sum + g.value * g.weight, 0);
  const totalWeights = grades.reduce((sum, g) => sum + g.weight, 0);
  const overallAverage = totalWeights > 0 ? (totalWeightedSum / totalWeights).toFixed(2) : null;

  // Group grades by subject
  const subjectGradesMap = new Map<string, Grade[]>();
  grades.forEach((g) => {
    const list = subjectGradesMap.get(g.subjectId) || [];
    list.push(g);
    subjectGradesMap.set(g.subjectId, list);
  });

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !title.trim()) return;

    const newGrade: Grade = {
      id: `grd-${Date.now()}`,
      subjectId: selectedSubjectId,
      title: title.trim(),
      value: Number(value),
      weight: Number(weight),
      type,
      date,
    };

    await addGrade(uid, newGrade);
    setTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-24 ipad:pb-10 max-w-5xl mx-auto px-1">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Noten & Notenschnitt</span>
            <span className="text-[10px] font-extrabold uppercase bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full shadow-xs">
              Pro
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Verwalte deine Noten, Fächerschnitte und deinen Gesamt-Notendurchschnitt
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => {
            if (subjects.length > 0 && !selectedSubjectId) {
              setSelectedSubjectId(subjects[0].id);
            }
            setIsAddModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Note eintragen
        </Button>
      </div>

      <FeatureGate
        feature="gradeAnalytics"
        fallbackTitle="Notenübersicht & Notenschnitt (Grade Analytics)"
        fallbackDescription="Behalte alle deine Noten, Klausurergebnisse und deinen Gesamtschnitt im Blick. Inklusive Fächer-Durchschnitt und automatischer Gewichtung. Exklusiv im Pro-Tarif verfügbar."
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenActivation={() => setIsActivationOpen(true)}
      >
        <div className="space-y-6">
          {/* Header KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="ios-card p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">Gesamtschnitt</div>
                <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                  {overallAverage ? overallAverage.replace('.', ',') : '–'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {grades.length} Note{grades.length !== 1 ? 'n' : ''} eingetragen
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="ios-card p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-gray-500">Beste Note</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {grades.length > 0 ? Math.min(...grades.map(g => g.value)).toFixed(1).replace('.', ',') : '–'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Top-Leistung</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="ios-card p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-gray-500">Erfasste Fächer</div>
                <div className="text-2xl font-bold text-ios-blue mt-1">
                  {subjectGradesMap.size} von {subjects.length}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Fächer mit Noten</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-ios-blue flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Fächerspiegel Breakdown */}
          {subjects.length === 0 ? (
            <div className="ios-card p-8 text-center text-xs text-gray-400">
              Lege im Tab <strong>Schule</strong> zuerst deine Schulfächer an, um Noten einzutragen.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {subjects.map((sub) => {
                const subGrades = subjectGradesMap.get(sub.id) || [];
                const subSum = subGrades.reduce((sum, g) => sum + g.value * g.weight, 0);
                const subWeight = subGrades.reduce((sum, g) => sum + g.weight, 0);
                const subAverage = subWeight > 0 ? (subSum / subWeight).toFixed(2).replace('.', ',') : '–';

                return (
                  <div key={sub.id} className="ios-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs"
                          style={{ backgroundColor: sub.color }}
                        >
                          {sub.shortName}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                            {sub.name}
                          </h4>
                          <span className="text-[11px] text-gray-400">
                            {subGrades.length} Note{subGrades.length !== 1 ? 'n' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-gray-400 block text-[10px] uppercase">Schnitt</span>
                        <span className="text-lg font-black text-gray-900 dark:text-white">
                          {subAverage}
                        </span>
                      </div>
                    </div>

                    {/* Grades List for this Subject */}
                    {subGrades.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5">
                        {subGrades.map((g) => (
                          <div
                            key={g.id}
                            className="p-2 rounded-lg bg-gray-50 dark:bg-ios-dark-secondary flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-md bg-white dark:bg-ios-dark-card font-black text-center flex items-center justify-center text-gray-900 dark:text-white border border-black/5 dark:border-white/10">
                                {g.value}
                              </span>
                              <div>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {g.title}
                                </span>
                                {g.weight > 1 && (
                                  <span className="ml-1 text-[10px] text-purple-600 font-bold">
                                    ({g.weight}x)
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400">{g.date}</span>
                              <button
                                type="button"
                                onClick={() => deleteGrade(uid, g.id)}
                                className="p-1 text-gray-300 hover:text-red-500 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </FeatureGate>

      {/* Add Grade Modal */}
      <BottomSheet
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Note eintragen"
      >
        <form onSubmit={handleSaveGrade} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Schulfach
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.shortName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Note (1.0 – 6.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.7"
                max="6.0"
                required
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-bold text-center text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Gewichtung
              </label>
              <select
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
              >
                <option value={1}>1-fach (normal)</option>
                <option value={2}>2-fach (Klausur / Schulaufgabe)</option>
                <option value={0.5}>0.5-fach (Mündlich / Hausaufgabe)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Bezeichnung / Thema
            </label>
            <input
              type="text"
              required
              placeholder="z.B. 1. Schulaufgabe Analysis"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="md" onClick={() => setIsAddModalOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" variant="primary" size="md">
              Note speichern
            </Button>
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

      <LicenseActivationModal
        isOpen={isActivationOpen}
        onClose={() => setIsActivationOpen(false)}
      />
    </div>
  );
};
