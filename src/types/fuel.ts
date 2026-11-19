export interface FuelEntry {
  id: string;
  date: string; // YYYY-MM-DD
  odometer: number; // Kilometerstand (km)
  totalPrice: number; // Gesamtpreis (€)
  pricePerLiter: number; // Preis pro Liter (€/L)
  createdAt: number;
}

export interface EnrichedFuelEntry extends FuelEntry {
  liters: number;
  distanceKm: number | null;
  consumptionPer100Km: number | null;
  costPerKm: number | null;
}

export type TimeFilter = 'all' | 'year' | '30d';

export interface FuelStats {
  totalCost: number;
  totalLiters: number;
  entryCount: number;
  avgCostPerFill: number;
  avgPricePerLiter: number;
  minPricePerLiter: number | null;
  maxPricePerLiter: number | null;
  latestPricePerLiter: number | null;
  latestTotalCost: number | null;
  totalDistanceKm: number;
  avgConsumptionPer100Km: number | null;
}

export function parseGermanNumber(raw: string): number {
  const cleaned = raw.trim().replace(/\s+/g, '').replace(',', '.');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPricePerLiter(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value);
}

export function formatLiters(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatKm(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateDe(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

export function formatShortDateDe(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}.${parts[1]}.`;
}

export function enrichEntries(entries: FuelEntry[]): EnrichedFuelEntry[] {
  // Sort ascending by date then odometer to compute deltas chronologically
  const ascending = [...entries].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.odometer - b.odometer;
  });

  const enrichedAsc: EnrichedFuelEntry[] = ascending.map((entry, idx) => {
    const liters = entry.pricePerLiter > 0 ? entry.totalPrice / entry.pricePerLiter : 0;
    let distanceKm: number | null = null;
    let consumptionPer100Km: number | null = null;
    let costPerKm: number | null = null;

    if (idx > 0) {
      const prev = ascending[idx - 1];
      const delta = entry.odometer - prev.odometer;
      if (delta > 0 && delta < 5000) {
        distanceKm = delta;
        consumptionPer100Km = (liters / delta) * 100;
        costPerKm = entry.totalPrice / delta;
      }
    }

    return {
      ...entry,
      liters,
      distanceKm,
      consumptionPer100Km,
      costPerKm,
    };
  });

  // Return newest first for lists
  return enrichedAsc.reverse();
}

export function filterEntriesByTime(entries: EnrichedFuelEntry[], filter: TimeFilter): EnrichedFuelEntry[] {
  if (filter === 'all') return entries;
  const now = new Date();
  const cutoff = new Date(now);
  if (filter === '30d') {
    cutoff.setDate(now.getDate() - 30);
  } else if (filter === 'year') {
    cutoff.setMonth(0, 1);
    cutoff.setHours(0, 0, 0, 0);
  }
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return entries.filter((e) => e.date >= cutoffStr);
}

export function computeStats(entries: EnrichedFuelEntry[]): FuelStats {
  if (entries.length === 0) {
    return {
      totalCost: 0,
      totalLiters: 0,
      entryCount: 0,
      avgCostPerFill: 0,
      avgPricePerLiter: 0,
      minPricePerLiter: null,
      maxPricePerLiter: null,
      latestPricePerLiter: null,
      latestTotalCost: null,
      totalDistanceKm: 0,
      avgConsumptionPer100Km: null,
    };
  }

  let totalCost = 0;
  let totalLiters = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let priceSum = 0;
  let totalDistanceKm = 0;
  let litersWithDistance = 0;

  for (const e of entries) {
    totalCost += e.totalPrice;
    totalLiters += e.liters;
    priceSum += e.pricePerLiter;
    if (e.pricePerLiter < minPrice) minPrice = e.pricePerLiter;
    if (e.pricePerLiter > maxPrice) maxPrice = e.pricePerLiter;
    if (e.distanceKm !== null && e.distanceKm > 0) {
      totalDistanceKm += e.distanceKm;
      litersWithDistance += e.liters;
    }
  }

  // entries is newest-first
  const latest = entries[0];

  return {
    totalCost,
    totalLiters,
    entryCount: entries.length,
    avgCostPerFill: totalCost / entries.length,
    avgPricePerLiter: priceSum / entries.length,
    minPricePerLiter: minPrice,
    maxPricePerLiter: maxPrice,
    latestPricePerLiter: latest.pricePerLiter,
    latestTotalCost: latest.totalPrice,
    totalDistanceKm,
    avgConsumptionPer100Km: totalDistanceKm > 0 ? (litersWithDistance / totalDistanceKm) * 100 : null,
  };
}
