import React, { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import {
  FuelEntry,
  formatKm,
  formatLiters,
  parseGermanNumber,
} from '../types/fuel';

interface FuelEntryFormProps {
  initialEntry?: FuelEntry | null;
  lastOdometer?: number | null;
  onSubmit: (data: Omit<FuelEntry, 'id' | 'createdAt'>) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

function getTodayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export const FuelEntryForm: React.FC<FuelEntryFormProps> = ({
  initialEntry,
  lastOdometer,
  onSubmit,
  onCancel,
  submitLabel = 'Tankung speichern',
}) => {
  const [date, setDate] = useState(initialEntry?.date ?? getTodayIso());
  const [odometerStr, setOdometerStr] = useState(
    initialEntry ? String(initialEntry.odometer) : ''
  );
  const [totalPriceStr, setTotalPriceStr] = useState(
    initialEntry ? initialEntry.totalPrice.toFixed(2).replace('.', ',') : ''
  );
  const [pricePerLiterStr, setPricePerLiterStr] = useState(
    initialEntry ? initialEntry.pricePerLiter.toFixed(3).replace('.', ',') : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (initialEntry) {
      setDate(initialEntry.date);
      setOdometerStr(String(initialEntry.odometer));
      setTotalPriceStr(initialEntry.totalPrice.toFixed(2).replace('.', ','));
      setPricePerLiterStr(initialEntry.pricePerLiter.toFixed(3).replace('.', ','));
      setError(null);
    }
  }, [initialEntry]);

  const previewLiters = useMemo(() => {
    const total = parseGermanNumber(totalPriceStr);
    const ppl = parseGermanNumber(pricePerLiterStr);
    if (Number.isFinite(total) && Number.isFinite(ppl) && total > 0 && ppl > 0) {
      return total / ppl;
    }
    return null;
  }, [totalPriceStr, pricePerLiterStr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Bitte ein gültiges Datum wählen.');
      return;
    }

    const odometer = parseGermanNumber(odometerStr);
    if (!Number.isFinite(odometer) || odometer < 0) {
      setError('Bitte einen gültigen Kilometerstand eingeben.');
      return;
    }

    const totalPrice = parseGermanNumber(totalPriceStr);
    if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
      setError('Bitte einen Gesamtpreis größer als 0 € eingeben.');
      return;
    }

    const pricePerLiter = parseGermanNumber(pricePerLiterStr);
    if (!Number.isFinite(pricePerLiter) || pricePerLiter <= 0) {
      setError('Bitte einen Preis pro Liter größer als 0 € eingeben.');
      return;
    }

    onSubmit({
      date,
      odometer: Math.round(odometer),
      totalPrice: Math.round(totalPrice * 100) / 100,
      pricePerLiter: Math.round(pricePerLiter * 1000) / 1000,
    });

    if (!initialEntry) {
      setOdometerStr('');
      setTotalPriceStr('');
      setPricePerLiterStr('');
      setDate(getTodayIso());
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1800);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="fuel-date"
            className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5"
          >
            Datum
          </label>
          <input
            id="fuel-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-3 text-sm text-slate-900 dark:text-white focus:border-teal-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 font-mono-tabular"
          />
        </div>

        <div>
          <label
            htmlFor="fuel-odometer"
            className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5"
          >
            Kilometerstand (km)
          </label>
          <input
            id="fuel-odometer"
            type="text"
            inputMode="numeric"
            placeholder={lastOdometer ? `z.B. ${formatKm(lastOdometer + 550)}` : 'z.B. 85200'}
            value={odometerStr}
            onChange={(e) => setOdometerStr(e.target.value)}
            required
            className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 font-mono-tabular"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="fuel-total"
            className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5"
          >
            Gesamtpreis (€)
          </label>
          <input
            id="fuel-total"
            type="text"
            inputMode="decimal"
            placeholder="z.B. 72,40"
            value={totalPriceStr}
            onChange={(e) => setTotalPriceStr(e.target.value)}
            required
            className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 font-mono-tabular"
          />
        </div>

        <div>
          <label
            htmlFor="fuel-ppl"
            className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5"
          >
            Preis pro Liter (€/L)
          </label>
          <input
            id="fuel-ppl"
            type="text"
            inputMode="decimal"
            placeholder="z.B. 1,749"
            value={pricePerLiterStr}
            onChange={(e) => setPricePerLiterStr(e.target.value)}
            required
            className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 font-mono-tabular"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
        <span>
          {lastOdometer !== null && lastOdometer !== undefined
            ? `Letzter Stand: ${formatKm(lastOdometer)} km`
            : 'Erste Erfassung'}
        </span>
        <span className="font-mono-tabular font-medium text-slate-700 dark:text-slate-300">
          {previewLiters !== null ? `≈ ${formatLiters(previewLiters)} Liter` : 'Menge wird berechnet'}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2.5 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[48px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            Abbrechen
          </button>
        )}
        <button
          type="submit"
          className="flex-1 min-h-[48px] rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 hover:from-yellow-300 hover:via-amber-300 hover:to-orange-300 active:scale-[0.98] text-slate-950 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-amber-500/25 transition-all whitespace-nowrap"
        >
          {justSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Gespeichert</span>
            </>
          ) : (
            <span>{initialEntry ? 'Änderungen speichern' : submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
};
