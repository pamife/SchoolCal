import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Link,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import type {
  OnboardingQuestion,
  OnboardingQuestionOption,
  TimetableVariant,
} from '../../../types';

interface ClassQuestionBuilderTabProps {
  questions: OnboardingQuestion[];
  variants: TimetableVariant[];
  onChangeQuestions: (questions: OnboardingQuestion[]) => void;
}

export const ClassQuestionBuilderTab: React.FC<ClassQuestionBuilderTabProps> = ({
  questions,
  variants,
  onChangeQuestions,
}) => {
  const [editingQuestion, setEditingQuestion] = useState<OnboardingQuestion | null>(null);
  const [isNew, setIsNew] = useState(false);

  // New option buffer for editing modal
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionSubLabel, setNewOptionSubLabel] = useState('');
  const [newOptionVariants, setNewOptionVariants] = useState<string[]>([]);

  const handleStartAddQuestion = () => {
    const nextOrder = questions.length + 1;
    setEditingQuestion({
      id: `q-${Date.now()}`,
      order: nextOrder,
      title: '',
      description: '',
      required: true,
      condition: null,
      options: [],
    });
    setIsNew(true);
    setNewOptionLabel('');
    setNewOptionSubLabel('');
    setNewOptionVariants([]);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion || !editingQuestion.title.trim()) return;

    let updatedList: OnboardingQuestion[];
    if (isNew) {
      updatedList = [...questions, editingQuestion];
    } else {
      updatedList = questions.map((q) => (q.id === editingQuestion.id ? editingQuestion : q));
    }

    // Re-index orders
    updatedList = updatedList.map((q, idx) => ({ ...q, order: idx + 1 }));
    onChangeQuestions(updatedList);
    setEditingQuestion(null);
    setIsNew(false);
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questions.filter((q) => q.id !== id).map((q, idx) => ({ ...q, order: idx + 1 }));
    onChangeQuestions(updated);
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...questions];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const reordered = copy.map((q, idx) => ({ ...q, order: idx + 1 }));
    onChangeQuestions(reordered);
  };

  const handleAddOptionToEditing = () => {
    if (!editingQuestion || !newOptionLabel.trim()) return;

    const newOpt: OnboardingQuestionOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      label: newOptionLabel.trim(),
      subLabel: newOptionSubLabel.trim() || undefined,
      variantIds: newOptionVariants,
    };

    setEditingQuestion({
      ...editingQuestion,
      options: [...editingQuestion.options, newOpt],
    });

    setNewOptionLabel('');
    setNewOptionSubLabel('');
    setNewOptionVariants([]);
  };

  const handleRemoveOptionFromEditing = (optionId: string) => {
    if (!editingQuestion) return;
    setEditingQuestion({
      ...editingQuestion,
      options: editingQuestion.options.filter((o) => o.id !== optionId),
    });
  };

  // Preceding questions for conditional dependency selection
  const candidatePrecedingQuestions = editingQuestion
    ? questions.filter((q) => q.id !== editingQuestion.id)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Onboarding-Zuordnungsfragen
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Definiere Fragen, mit denen Schüler beim Einrichten ihre Fächer- und Lehrervarianten wählen.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleStartAddQuestion}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Frage hinzufügen
        </Button>
      </div>

      {/* Editing / Creating Card */}
      {editingQuestion && (
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-ios-blue/30 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ios-blue flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              {isNew ? 'Neue Frage erstellen' : 'Frage bearbeiten'}
            </h4>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={editingQuestion.required}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, required: e.target.checked })
                }
                className="rounded text-ios-blue focus:ring-ios-blue"
              />
              <span>Pflichtfrage</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Fragetext
              </label>
              <input
                type="text"
                placeholder="z.B. Welches Wahlpflichtfach hast du?"
                value={editingQuestion.title}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, title: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-white dark:bg-ios-dark-tertiary rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Hinweis / Beschreibung (optional)
              </label>
              <input
                type="text"
                placeholder="z.B. Bestimmt deine Unterrichtsstunden am Montag & Mittwoch"
                value={editingQuestion.description || ''}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, description: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-white dark:bg-ios-dark-tertiary rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          {/* Conditional Logic Section */}
          <div className="p-3 rounded-xl bg-white dark:bg-ios-dark-tertiary border border-black/5 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Link className="w-3 h-3 text-ios-blue" />
                Bedingte Anzeige (Conditional Logic)
              </span>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingQuestion.condition)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const firstPreceding = candidatePrecedingQuestions[0];
                      const firstOpt = firstPreceding?.options[0]?.id || '';
                      setEditingQuestion({
                        ...editingQuestion,
                        condition: firstPreceding
                          ? {
                              dependsOnQuestionId: firstPreceding.id,
                              expectedOptionId: firstOpt,
                              operator: 'equals',
                            }
                          : null,
                      });
                    } else {
                      setEditingQuestion({ ...editingQuestion, condition: null });
                    }
                  }}
                  className="rounded text-ios-blue focus:ring-ios-blue"
                />
                <span className="text-[11px] text-gray-500">Nur anzeigen wenn...</span>
              </label>
            </div>

            {editingQuestion.condition && candidatePrecedingQuestions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="block text-[10px] text-gray-400 mb-1">Frage:</span>
                  <select
                    value={editingQuestion.condition.dependsOnQuestionId}
                    onChange={(e) => {
                      const qId = e.target.value;
                      const selectedQ = candidatePrecedingQuestions.find((q) => q.id === qId);
                      setEditingQuestion({
                        ...editingQuestion,
                        condition: {
                          ...editingQuestion.condition!,
                          dependsOnQuestionId: qId,
                          expectedOptionId: selectedQ?.options[0]?.id || '',
                        },
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-ios-dark-secondary rounded-lg text-xs font-semibold"
                  >
                    {candidatePrecedingQuestions.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.order}. {q.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-[10px] text-gray-400 mb-1">Gewählte Antwort ist:</span>
                  {(() => {
                    const depQ = candidatePrecedingQuestions.find(
                      (q) => q.id === editingQuestion.condition?.dependsOnQuestionId
                    );
                    return (
                      <select
                        value={editingQuestion.condition.expectedOptionId}
                        onChange={(e) => {
                          setEditingQuestion({
                            ...editingQuestion,
                            condition: {
                              ...editingQuestion.condition!,
                              expectedOptionId: e.target.value,
                            },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-ios-dark-secondary rounded-lg text-xs font-semibold"
                      >
                        {(depQ?.options || []).map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Options Section */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Antwortmöglichkeiten & Varianten-Verknüpfung
            </h5>

            {editingQuestion.options.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400 bg-white dark:bg-ios-dark-tertiary rounded-xl">
                Noch keine Antworten hinzugefügt.
              </div>
            ) : (
              <div className="space-y-1.5">
                {editingQuestion.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-ios-dark-tertiary border border-black/5 dark:border-white/5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">
                        ○ {opt.label}
                      </div>
                      {opt.subLabel && (
                        <div className="text-[10px] text-gray-400 mt-0.5">{opt.subLabel}</div>
                      )}
                      {opt.variantIds && opt.variantIds.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] text-ios-blue font-semibold">
                            Aktiviert: {opt.variantIds.map(vid => variants.find(v => v.id === vid)?.name || vid).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionFromEditing(opt.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add option mini-form */}
            <div className="p-3 rounded-xl bg-white/70 dark:bg-ios-dark-tertiary/70 border border-dashed border-gray-300 dark:border-gray-700 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Antwort-Label (z.B. Kunst)"
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-ios-dark-secondary rounded-lg text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Untertitel (z.B. Frau Müller • A101)"
                  value={newOptionSubLabel}
                  onChange={(e) => setNewOptionSubLabel(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-ios-dark-secondary rounded-lg text-xs font-semibold"
                />
              </div>

              {/* Variant assignment selector */}
              {variants.length > 0 && (
                <div>
                  <span className="block text-[10px] text-gray-500 font-semibold mb-1">
                    Verknüpfte Stundenplan-Variante:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {variants.map((v) => {
                      const isSelected = newOptionVariants.includes(v.id);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setNewOptionVariants(
                              isSelected
                                ? newOptionVariants.filter((id) => id !== v.id)
                                : [...newOptionVariants, v.id]
                            );
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-ios-blue text-white shadow-xs'
                              : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddOptionToEditing}
                  disabled={!newOptionLabel.trim()}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Option hinzufügen
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/10">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingQuestion(null);
                setIsNew(false);
              }}
            >
              Abbrechen
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveQuestion}>
              Frage speichern
            </Button>
          </div>
        </div>
      )}

      {/* List of defined questions */}
      {questions.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 dark:bg-ios-dark-secondary rounded-2xl border border-black/5 dark:border-white/5">
          <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          Noch keine Onboarding-Fragen für diese Klasse definiert.
          <br />
          Schüler übernehmen den Basis-Stundenplan direkt ohne Zusatzfragen.
        </div>
      ) : (
        <div className="space-y-2.5">
          {questions.map((q, idx) => {
            const hasCondition = Boolean(q.condition);
            return (
              <div
                key={q.id}
                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-ios-blue/15 text-ios-blue text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {q.order}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{q.title}</span>
                        {q.required && (
                          <span className="text-[10px] text-red-500 font-bold">*Pflicht</span>
                        )}
                        {hasCondition && (
                          <Badge variant="purple" size="sm">Bedingt</Badge>
                        )}
                      </div>
                      {q.description && (
                        <p className="text-[11px] text-gray-500 mt-0.5">{q.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx, 'up')}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                      title="Nach oben"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === questions.length - 1}
                      onClick={() => handleMoveOrder(idx, 'down')}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                      title="Nach unten"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestion(q);
                        setIsNew(false);
                      }}
                      className="p-1 text-gray-400 hover:text-ios-blue transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Render Options summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="p-2 rounded-xl bg-white dark:bg-ios-dark-tertiary text-xs border border-black/5 dark:border-white/5"
                    >
                      <div className="font-bold text-gray-800 dark:text-gray-200">○ {opt.label}</div>
                      {opt.subLabel && (
                        <div className="text-[10px] text-gray-400 truncate">{opt.subLabel}</div>
                      )}
                      {opt.variantIds && opt.variantIds.length > 0 && (
                        <div className="text-[9px] text-ios-blue font-semibold truncate mt-0.5">
                          → {opt.variantIds.map(vId => variants.find(v => v.id === vId)?.name || vId).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
