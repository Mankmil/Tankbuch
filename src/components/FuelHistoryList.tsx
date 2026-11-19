import React from 'react';
import { Fuel, Pencil, Trash2 } from 'lucide-react';
import {
  EnrichedFuelEntry,
  FuelEntry,
  formatDateDe,
  formatEuro,
  formatKm,
  formatLiters,
  formatPricePerLiter,
} from '../types/fuel';

interface FuelHistoryListProps {
  entries: EnrichedFuelEntry[];
  onEdit: (entry: FuelEntry) => void;
  onDelete: (id: string) => void;
}

export const FuelHistoryList: React.FC<FuelHistoryListProps> = ({
  entries,
  onEdit,
  onDelete,
}) => {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
          <Fuel className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Noch keine Tankvorgänge
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          Erfasse deine erste Tankung mit Datum, Kilometerstand, Gesamtpreis und Preis pro Liter.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors min-h-[68px]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Fuel className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <span>{formatDateDe(entry.date)}</span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="font-mono-tabular text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
                    {formatKm(entry.odometer)} km
                  </span>
                </div>

                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                  <span>{formatLiters(entry.liters)} L</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatPricePerLiter(entry.pricePerLiter)} €/L</span>
                  {entry.consumptionPer100Km !== null && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-teal-700 dark:text-teal-400 font-medium">
                        {entry.consumptionPer100Km.toFixed(1).replace('.', ',')} L/100km
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div className="text-right mr-1">
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono-tabular">
                  {formatEuro(entry.totalPrice)}
                </div>
                {entry.distanceKm !== null && (
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono-tabular">
                    +{formatKm(entry.distanceKm)} km
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onEdit(entry)}
                aria-label={`Tankung vom ${formatDateDe(entry.date)} bearbeiten`}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(entry.id)}
                aria-label={`Tankung vom ${formatDateDe(entry.date)} löschen`}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
