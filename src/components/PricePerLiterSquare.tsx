import React, { useMemo, useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import {
  EnrichedFuelEntry,
  FuelStats,
  formatPricePerLiter,
  formatShortDateDe,
  formatDateDe,
} from '../types/fuel';

interface PricePerLiterSquareProps {
  entries: EnrichedFuelEntry[]; // newest-first
  stats: FuelStats;
}

interface ChartPoint {
  x: number;
  y: number;
  entry: EnrichedFuelEntry;
}

export const PricePerLiterSquare: React.FC<PricePerLiterSquareProps> = ({ entries, stats }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Chronological order (oldest -> newest) for chart left-to-right
  const chronological = useMemo(() => [...entries].reverse(), [entries]);

  const chartData = useMemo(() => {
    const width = 260;
    const height = 132;
    const padX = 12;
    const padTop = 14;
    const padBottom = 14;

    if (chronological.length === 0) {
      return { width, height, points: [] as ChartPoint[], linePath: '', areaPath: '', avgY: height / 2, minVal: 0, maxVal: 0 };
    }

    const prices = chronological.map((e) => e.pricePerLiter);
    const rawMin = Math.min(...prices);
    const rawMax = Math.max(...prices);
    const span = rawMax - rawMin;
    const padding = span > 0.005 ? span * 0.2 : 0.06;
    const minVal = Math.max(0, rawMin - padding);
    const maxVal = rawMax + padding;
    const range = maxVal - minVal || 0.1;

    const plotW = width - padX * 2;
    const plotH = height - padTop - padBottom;

    const points: ChartPoint[] = chronological.map((entry, i) => {
      const x =
        chronological.length === 1
          ? width / 2
          : padX + (i / (chronological.length - 1)) * plotW;
      const normalized = (entry.pricePerLiter - minVal) / range;
      const y = padTop + plotH - normalized * plotH;
      return { x, y, entry };
    });

    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    const areaPath =
      points.length > 1
        ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(height - padBottom).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - padBottom).toFixed(1)} Z`
        : '';

    const avgNorm = (stats.avgPricePerLiter - minVal) / range;
    const avgY = padTop + plotH - avgNorm * plotH;

    return { width, height, points, linePath, areaPath, avgY, minVal, maxVal };
  }, [chronological, stats.avgPricePerLiter]);

  const displayedPoint =
    activeIndex !== null && chartData.points[activeIndex]
      ? chartData.points[activeIndex]
      : chartData.points[chartData.points.length - 1] ?? null;

  const handlePointer = (clientX: number, target: SVGSVGElement | null) => {
    if (!target || chartData.points.length === 0) return;
    const rect = target.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * chartData.width;
    let closestIdx = 0;
    let minDist = Infinity;
    chartData.points.forEach((p, idx) => {
      const dist = Math.abs(p.x - relX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });
    setActiveIndex(closestIdx);
  };

  return (
    <>
      <section
        aria-label="Grafik Preis pro Liter"
        className="aspect-square flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-xs transition-colors"
      >
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">
              Preis / Liter
            </h2>
            <p className="mt-0.5 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              {displayedPoint ? formatShortDateDe(displayedPoint.entry.date) : 'Verlauf'}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white font-mono-tabular whitespace-nowrap">
              {displayedPoint ? `${formatPricePerLiter(displayedPoint.entry.pricePerLiter)} €` : '–'}
            </span>
            {chronological.length > 0 && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                aria-label="Preisgrafik vergrößern"
                className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="relative flex-1 flex items-center justify-center my-1 min-h-0">
          {chronological.length === 0 ? (
            <div className="text-center px-2">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Noch keine Daten
              </p>
            </div>
          ) : (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              className="w-full h-full overflow-visible touch-none select-none cursor-crosshair"
              onPointerDown={(e) => handlePointer(e.clientX, svgRef.current)}
              onPointerMove={(e) => {
                if (e.buttons > 0 || e.pointerType === 'mouse') {
                  handlePointer(e.clientX, svgRef.current);
                }
              }}
              onPointerLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient id="priceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D9488" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#0D9488" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Average dashed reference line */}
              <line
                x1={8}
                x2={chartData.width - 8}
                y1={chartData.avgY}
                y2={chartData.avgY}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-700"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Area fill */}
              {chartData.areaPath && (
                <path d={chartData.areaPath} fill="url(#priceAreaGrad)" />
              )}

              {/* Line */}
              {chartData.points.length > 1 && (
                <path
                  d={chartData.linePath}
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Active vertical guide */}
              {displayedPoint && (
                <line
                  x1={displayedPoint.x}
                  x2={displayedPoint.x}
                  y1={8}
                  y2={chartData.height - 8}
                  stroke="#0D9488"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                />
              )}

              {/* Data points */}
              {chartData.points.map((pt, idx) => {
                const isSelected = displayedPoint?.entry.id === pt.entry.id;
                return (
                  <g key={pt.entry.id}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 5 : 3}
                      className={
                        isSelected
                          ? 'fill-teal-600 stroke-white dark:stroke-slate-900'
                          : 'fill-white dark:fill-slate-900 stroke-teal-600 dark:stroke-teal-400'
                      }
                      strokeWidth={isSelected ? 2 : 1.75}
                    />
                    {idx === 0 && chartData.points.length === 1 && (
                      <text
                        x={pt.x}
                        y={pt.y - 12}
                        textAnchor="middle"
                        className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono-tabular"
                      >
                        {formatPricePerLiter(pt.entry.pricePerLiter)} €
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        <div className="pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[10px] sm:text-xs">
          <div className="min-w-0 truncate text-slate-500 dark:text-slate-400">
            <span>Min </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono-tabular">
              {stats.minPricePerLiter !== null ? `${formatPricePerLiter(stats.minPricePerLiter)} €` : '–'}
            </span>
          </div>
          <div className="min-w-0 truncate text-slate-500 dark:text-slate-400 text-right">
            <span>Max </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono-tabular">
              {stats.maxPricePerLiter !== null ? `${formatPricePerLiter(stats.maxPricePerLiter)} €` : '–'}
            </span>
          </div>
        </div>
      </section>

      {expanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Detailansicht Preis pro Liter"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Preis pro Liter — Detailverlauf
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono-tabular">
                  Ø {formatPricePerLiter(stats.avgPricePerLiter)} €/L · {chronological.length} Messpunkte
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Schließen"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 h-64 w-full">
              <svg
                viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="priceAreaGradExpanded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0D9488" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#0D9488" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <line
                  x1={8}
                  x2={chartData.width - 8}
                  y1={chartData.avgY}
                  y2={chartData.avgY}
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-700"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {chartData.areaPath && (
                  <path d={chartData.areaPath} fill="url(#priceAreaGradExpanded)" />
                )}
                {chartData.points.length > 1 && (
                  <path
                    d={chartData.linePath}
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {chartData.points.map((pt) => (
                  <g key={pt.entry.id}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={4}
                      className="fill-white dark:fill-slate-900 stroke-teal-600 dark:stroke-teal-400"
                      strokeWidth={2}
                    />
                  </g>
                ))}
              </svg>
            </div>

            <div className="mt-4 max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">{formatDateDe(e.date)}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono-tabular">
                    {formatPricePerLiter(e.pricePerLiter)} €/L
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
