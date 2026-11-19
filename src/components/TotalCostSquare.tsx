import React from 'react';
import { FuelStats, TimeFilter, formatEuro, formatLiters } from '../types/fuel';

interface TotalCostSquareProps {
  stats: FuelStats;
  timeFilter: TimeFilter;
}

const FILTER_LABELS: Record<TimeFilter, string> = {
  all: 'Gesamtzeitraum',
  year: 'Dieses Jahr',
  '30d': 'Letzte 30 Tage',
};

export const TotalCostSquare: React.FC<TotalCostSquareProps> = ({ stats, timeFilter }) => {
  return (
    <section
      aria-label="Summe aller Tankkosten"
      className="aspect-square flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-xs transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">
            Gesamtkosten
          </h2>
          <p className="mt-0.5 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
            {FILTER_LABELS[timeFilter]}
          </p>
        </div>
        <span className="text-[11px] sm:text-xs font-medium text-teal-700 dark:text-teal-400 font-mono-tabular whitespace-nowrap shrink-0">
          {stats.entryCount} {stats.entryCount === 1 ? 'Tankung' : 'Tankungen'}
        </span>
      </div>

      <div className="my-auto py-1">
        <div className="text-2xl min-[390px]:text-[28px] sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-mono-tabular leading-none truncate">
          {formatEuro(stats.totalCost)}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
          <span className="font-mono-tabular">{formatLiters(stats.totalLiters)} L</span>
          <span aria-hidden="true">·</span>
          <span>getankt</span>
        </div>
      </div>

      <div className="pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <span className="block text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 truncate">
            Ø pro Tankung
          </span>
          <span className="mt-0.5 block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono-tabular truncate">
            {stats.entryCount > 0 ? formatEuro(stats.avgCostPerFill) : '–'}
          </span>
        </div>
        <div className="min-w-0 text-right">
          <span className="block text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 truncate">
            Letzte Tankung
          </span>
          <span className="mt-0.5 block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono-tabular truncate">
            {stats.latestTotalCost !== null ? formatEuro(stats.latestTotalCost) : '–'}
          </span>
        </div>
      </div>
    </section>
  );
};
