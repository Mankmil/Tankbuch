import { useMemo, useState } from 'react';
import {
  Download,
  LayoutGrid,
  List,
  Moon,
  Plus,
  RotateCcw,
  Sun,
  Trash2,
} from 'lucide-react';
import { FuelEntryForm } from './components/FuelEntryForm';
import { FuelEntrySheet } from './components/FuelEntrySheet';
import { FuelHistoryList } from './components/FuelHistoryList';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { PricePerLiterSquare } from './components/PricePerLiterSquare';
import { TotalCostSquare } from './components/TotalCostSquare';
import { useFuelEntries } from './hooks/useFuelEntries';
import { useTheme } from './hooks/useTheme';
import {
  FuelEntry,
  TimeFilter,
  computeStats,
  enrichEntries,
  filterEntriesByTime,
  formatKm,
  formatPricePerLiter,
} from './types/fuel';

type MobileTab = 'overview' | 'history';

export default function App() {
  const {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    clearAllEntries,
    restoreDemoEntries,
    exportCsv,
  } = useFuelEntries();
  const { theme, toggleTheme } = useTheme();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [mobileTab, setMobileTab] = useState<MobileTab>('overview');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const enrichedAll = useMemo(() => enrichEntries(entries), [entries]);
  const filteredEntries = useMemo(
    () => filterEntriesByTime(enrichedAll, timeFilter),
    [enrichedAll, timeFilter]
  );
  const stats = useMemo(() => computeStats(filteredEntries), [filteredEntries]);

  const lastOdometer = useMemo(() => {
    if (enrichedAll.length === 0) return null;
    return Math.max(...enrichedAll.map((e) => e.odometer));
  }, [enrichedAll]);

  const handleOpenNew = () => {
    setEditingEntry(null);
    setSheetOpen(true);
  };

  const handleEdit = (entry: FuelEntry) => {
    setEditingEntry(entry);
    setSheetOpen(true);
  };

  const handleSaveSheet = (data: Omit<FuelEntry, 'id' | 'createdAt'>) => {
    if (editingEntry) {
      updateEntry(editingEntry.id, data);
      setEditingEntry(null);
    } else {
      addEntry(data);
    }
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      window.setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    clearAllEntries();
    setConfirmClear(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 h-12 md:h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 pt-safe">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 md:gap-8">
          <a
            href="#top"
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            Tankbuch
          </a>

          <nav
            aria-label="Hauptnavigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <a
              href="#uebersicht"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Übersicht
            </a>
            <a
              href="#verlauf"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Verlauf
            </a>
            <button
              type="button"
              onClick={exportCsv}
              disabled={entries.length === 0}
              className="hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
            >
              CSV Export
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleOpenNew}
              className="hidden md:inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 hover:from-yellow-300 hover:via-amber-300 hover:to-orange-300 active:scale-[0.98] text-slate-950 text-xs font-semibold shadow-sm shadow-amber-500/25 transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tanken</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="top"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-7 pb-24 md:pb-14"
      >
        {/* Filter Header Row */}
        <div
          id="uebersicht"
          className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6"
        >
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Deine Tankkosten
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Alle Ausgaben und Literpreise auf einen Blick
            </p>
          </div>

          <div
            role="group"
            aria-label="Zeitraum filtern"
            className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/90"
          >
            {(
              [
                { key: 'all', label: 'Alle' },
                { key: 'year', label: 'Jahr' },
                { key: '30d', label: '30 Tage' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTimeFilter(tab.key)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  timeFilter === tab.key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Section (Always shown on desktop; controlled by mobileTab on mobile) */}
        <div className={mobileTab === 'history' ? 'hidden md:block' : 'block'}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            {/* Left 7 Columns: The Two Square Windows + Summary Strip */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              {/* Two Square Windows Side-by-Side */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <TotalCostSquare stats={stats} timeFilter={timeFilter} />
                <PricePerLiterSquare entries={filteredEntries} stats={stats} />
              </div>

              {/* Clean 3-Metric Supporting Strip */}
              <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 px-4 py-3.5 sm:px-6 sm:py-4">
                <div className="min-w-0">
                  <span className="block text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
                    Ø Literpreis
                  </span>
                  <span className="mt-0.5 block text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono-tabular truncate">
                    {stats.entryCount > 0 ? `${formatPricePerLiter(stats.avgPricePerLiter)} €` : '–'}
                  </span>
                </div>
                <div className="min-w-0 border-l border-slate-100 dark:border-slate-800 pl-3 sm:pl-4">
                  <span className="block text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
                    Ø Verbrauch
                  </span>
                  <span className="mt-0.5 block text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono-tabular truncate">
                    {stats.avgConsumptionPer100Km !== null
                      ? `${stats.avgConsumptionPer100Km.toFixed(1).replace('.', ',')} L/100`
                      : '–'}
                  </span>
                </div>
                <div className="min-w-0 border-l border-slate-100 dark:border-slate-800 pl-3 sm:pl-4">
                  <span className="block text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
                    Distanz
                  </span>
                  <span className="mt-0.5 block text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono-tabular truncate">
                    {stats.totalDistanceKm > 0 ? `${formatKm(stats.totalDistanceKm)} km` : '–'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns (Desktop Quick Entry Card) */}
            <aside className="hidden lg:block lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Tankung eintragen
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Daten werden direkt lokal auf deinem Gerät gespeichert.
                </p>
              </div>
              <FuelEntryForm
                lastOdometer={lastOdometer}
                onSubmit={(data) => addEntry(data)}
              />
            </aside>
          </div>
        </div>

        {/* History Section */}
        <section
          id="verlauf"
          className={`mt-6 sm:mt-8 ${mobileTab === 'overview' ? 'block' : 'block'}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 sm:mb-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                Tankverlauf
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                {filteredEntries.length} {filteredEntries.length === 1 ? 'Eintrag' : 'Einträge'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {entries.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="md:hidden min-h-[40px] inline-flex items-center gap-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 rounded-xl border text-xs font-medium transition-colors whitespace-nowrap ${
                      confirmClear
                        ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{confirmClear ? 'Wirklich löschen?' : 'Alle löschen'}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={restoreDemoEntries}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Beispieldaten laden</span>
                </button>
              )}
            </div>
          </div>

          <FuelHistoryList
            entries={filteredEntries}
            onEdit={handleEdit}
            onDelete={deleteEntry}
          />
        </section>
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb Zone) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 dark:bg-slate-900/92 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 pb-safe"
      >
        <div className="grid grid-cols-3 items-center h-14 px-2">
          <button
            type="button"
            onClick={() => {
              setMobileTab('overview');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              mobileTab === 'overview'
                ? 'text-teal-700 dark:text-teal-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Übersicht</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="min-h-[44px] mx-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 hover:from-yellow-300 hover:via-amber-300 hover:to-orange-300 active:scale-[0.97] text-slate-950 flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/25 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-semibold">Tanken</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileTab('history');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              mobileTab === 'history'
                ? 'text-teal-700 dark:text-teal-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <List className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Verlauf</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet / Modal for Adding or Editing Entries */}
      <FuelEntrySheet
        isOpen={sheetOpen}
        editingEntry={editingEntry}
        lastOdometer={lastOdometer}
        onClose={() => {
          setSheetOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveSheet}
      />

      <OfflineIndicator />
    </div>
  );
}
