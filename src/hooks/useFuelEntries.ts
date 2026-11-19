import { useCallback, useEffect, useState } from 'react';
import { FuelEntry } from '../types/fuel';

const STORAGE_KEY = 'tankbuch_entries_v1';
const INITIALIZED_KEY = 'tankbuch_initialized_v1';

function getRecentDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export function createDemoEntries(): FuelEntry[] {
  return [
    {
      id: 'demo-1',
      date: getRecentDate(54),
      odometer: 82140,
      totalPrice: 68.42,
      pricePerLiter: 1.719,
      createdAt: Date.now() - 54 * 86400000,
    },
    {
      id: 'demo-2',
      date: getRecentDate(41),
      odometer: 82765,
      totalPrice: 74.15,
      pricePerLiter: 1.769,
      createdAt: Date.now() - 41 * 86400000,
    },
    {
      id: 'demo-3',
      date: getRecentDate(27),
      odometer: 83390,
      totalPrice: 69.80,
      pricePerLiter: 1.699,
      createdAt: Date.now() - 27 * 86400000,
    },
    {
      id: 'demo-4',
      date: getRecentDate(14),
      odometer: 84010,
      totalPrice: 76.50,
      pricePerLiter: 1.799,
      createdAt: Date.now() - 14 * 86400000,
    },
    {
      id: 'demo-5',
      date: getRecentDate(3),
      odometer: 84645,
      totalPrice: 71.95,
      pricePerLiter: 1.749,
      createdAt: Date.now() - 3 * 86400000,
    },
  ];
}

export function useFuelEntries() {
  const [entries, setEntries] = useState<FuelEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      const alreadyInit = localStorage.getItem(INITIALIZED_KEY);
      if (!alreadyInit) {
        const demos = createDemoEntries();
        localStorage.setItem(INITIALIZED_KEY, '1');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demos));
        return demos;
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      localStorage.setItem(INITIALIZED_KEY, '1');
    } catch {
      // Storage quota or privacy mode fallback
    }
  }, [entries]);

  const addEntry = useCallback(
    (data: Omit<FuelEntry, 'id' | 'createdAt'>) => {
      const next: FuelEntry = {
        ...data,
        id: typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
      };
      setEntries((prev) => [next, ...prev]);
      return next;
    },
    []
  );

  const updateEntry = useCallback(
    (id: string, data: Omit<FuelEntry, 'id' | 'createdAt'>) => {
      setEntries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
    },
    []
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAllEntries = useCallback(() => {
    setEntries([]);
  }, []);

  const restoreDemoEntries = useCallback(() => {
    setEntries(createDemoEntries());
  }, []);

  const exportCsv = useCallback(() => {
    const header = 'Datum;Kilometerstand (km);Gesamtpreis (EUR);Preis pro Liter (EUR/L);Liter';
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    const rows = sorted.map((e) => {
      const liters = e.pricePerLiter > 0 ? e.totalPrice / e.pricePerLiter : 0;
      return [
        e.date,
        e.odometer.toString(),
        e.totalPrice.toFixed(2).replace('.', ','),
        e.pricePerLiter.toFixed(3).replace('.', ','),
        liters.toFixed(2).replace('.', ','),
      ].join(';');
    });
    const csvContent = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tankbuch_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [entries]);

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    clearAllEntries,
    restoreDemoEntries,
    exportCsv,
  };
}
