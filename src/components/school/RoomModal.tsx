import React, { useState, useEffect } from 'react';
import { Room } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { Trash2 } from 'lucide-react';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: Room) => void;
  onDelete?: (id: string) => void;
  initialRoom?: Room | null;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialRoom,
}) => {
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialRoom) {
      setName(initialRoom.name);
      setBuilding(initialRoom.building || '');
      setFloor(initialRoom.floor || '');
      setNotes(initialRoom.notes || '');
    } else {
      setName('');
      setBuilding('');
      setFloor('');
      setNotes('');
    }
  }, [initialRoom, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const roomToSave: Room = {
      id: initialRoom?.id || `room-${Date.now()}`,
      name: name.trim(),
      building: building.trim() || undefined,
      floor: floor.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSave(roomToSave);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialRoom ? 'Raum bearbeiten' : 'Neuen Raum erfassen'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Raumbezeichnung
          </label>
          <input
            type="text"
            required
            placeholder="z.B. Raum 204 oder Physiksaal P1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Building & Floor */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Gebäude / Trakt
            </label>
            <input
              type="text"
              placeholder="z.B. Hauptgebäude"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Stockwerk
            </label>
            <input
              type="text"
              placeholder="z.B. 2. OG"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Notiz / Ausstattung
          </label>
          <input
            type="text"
            placeholder="z.B. Smartboard, Beamer, Klassenzimmer 10b"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {initialRoom && onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={() => {
                onDelete(initialRoom.id);
                onClose();
              }}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Löschen
            </Button>
          )}

          <Button type="submit" variant="primary" size="md" fullWidth>
            {initialRoom ? 'Speichern' : 'Raum anlegen'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
