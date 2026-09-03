import React, { useState } from 'react';
import { BottomSheet } from '../../common/BottomSheet';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { CheckCircle2, AlertCircle, ArrowRight, Upload } from 'lucide-react';
import type { TimetableDiff, ClassTimetable } from '../../../types';

interface ClassPublishDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  classNameTitle: string;
  diff: TimetableDiff;
  draftTimetable: ClassTimetable;
  currentPublishedVersion: number;
  onConfirmPublish: (changeSummary: string[]) => Promise<void>;
}

export const ClassPublishDiffModal: React.FC<ClassPublishDiffModalProps> = ({
  isOpen,
  onClose,
  classNameTitle,
  diff,
  draftTimetable,
  currentPublishedVersion,
  onConfirmPublish,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);

  const nextVersion = currentPublishedVersion + 1;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onConfirmPublish(diff.summary);
      onClose();
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Stundenplan veröffentlichen – Klasse ${classNameTitle}`}
    >
      <div className="space-y-4 pb-2">
        {/* Version Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-ios-blue/10 via-indigo-500/10 to-teal-500/10 border border-ios-blue/20 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-ios-blue">
              Versionsübergang
            </div>
            <div className="text-sm font-black text-gray-900 dark:text-white mt-0.5 flex items-center gap-2">
              <span>Version {currentPublishedVersion || '–'} (Live)</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-ios-blue font-bold">Version {nextVersion} (Neu)</span>
            </div>
          </div>
          <Badge variant="blue" size="md">
            {diff.items.length} Änderung{diff.items.length === 1 ? '' : 'en'}
          </Badge>
        </div>

        {/* Change List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Erkannte Änderungen vor Veröffentlichung
          </h4>

          {diff.items.length === 0 ? (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 text-center text-xs text-gray-500">
              Es wurden keine Unterschiede zum aktuell aktiven Stundenplan festgestellt.
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {diff.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-ios-dark-secondary border border-black/5 dark:border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {item.description}
                    </span>
                    <Badge
                      variant={
                        item.type === 'added'
                          ? 'green'
                          : item.type === 'removed'
                          ? 'red'
                          : 'blue'
                      }
                      size="sm"
                    >
                      {item.type === 'added' ? 'Neu' : item.type === 'removed' ? 'Entfällt' : 'Geändert'}
                    </Badge>
                  </div>

                  {item.type === 'modified' && item.before && item.after && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-black/5 dark:border-white/5">
                      <div className="text-gray-400">
                        <span className="font-semibold text-gray-500 block">Vorher:</span>
                        <span>
                          {item.before.subjectName || '–'} • {item.before.teacherName || '–'} • {item.before.roomName || '–'}
                        </span>
                      </div>
                      <div className="text-gray-800 dark:text-gray-200">
                        <span className="font-semibold text-ios-blue block">Nachher:</span>
                        <span>
                          {item.after.subjectName || '–'} • {item.after.teacherName || '–'} • {item.after.roomName || '–'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notice for Students */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Nach dem Veröffentlichen wird dieser Stundenplan sofort für alle Schüler der Klasse {classNameTitle} aktiv.
            Schüler mit individuellen Varianten behalten ihre Auswahlen.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/10">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isPublishing}>
            Abbrechen
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handlePublish}
            disabled={isPublishing}
            icon={<Upload className="w-4 h-4" />}
          >
            {isPublishing ? 'Wird veröffentlicht...' : `Jetzt veröffentlichen (v${nextVersion})`}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
