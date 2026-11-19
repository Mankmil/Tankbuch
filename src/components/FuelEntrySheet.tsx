import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { FuelEntry } from '../types/fuel';
import { FuelEntryForm } from './FuelEntryForm';

interface FuelEntrySheetProps {
  isOpen: boolean;
  editingEntry: FuelEntry | null;
  lastOdometer: number | null;
  onClose: () => void;
  onSave: (data: Omit<FuelEntry, 'id' | 'createdAt'>) => void;
}

export const FuelEntrySheet: React.FC<FuelEntrySheetProps> = ({
  isOpen,
  editingEntry,
  lastOdometer,
  onClose,
  onSave,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={editingEntry ? 'Tankvorgang bearbeiten' : 'Neuer Tankvorgang'}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 px-5 pt-3 pb-6 sm:p-6 shadow-2xl pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            {editingEntry ? 'Tankvorgang bearbeiten' : 'Neuer Tankvorgang'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <FuelEntryForm
          initialEntry={editingEntry}
          lastOdometer={lastOdometer}
          onSubmit={(data) => {
            onSave(data);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};
