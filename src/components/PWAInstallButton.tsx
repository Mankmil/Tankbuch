import React, { useState } from 'react';
import { Download, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="min-h-[40px] flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 px-3 py-2 text-xs font-semibold text-white dark:text-slate-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span>App installieren</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="min-h-[40px] flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Auf iPhone laden</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Installation auf iPhone oder iPad"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Als App auf iOS installieren
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Schließen"
                  className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-3 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="font-mono-tabular font-semibold text-teal-700 dark:text-teal-400">1.</span>
                  <span>
                    Tippe unten in Safari auf das <strong className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-white">Teilen-Symbol <Share className="w-3.5 h-3.5 inline" /></strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="font-mono-tabular font-semibold text-teal-700 dark:text-teal-400">2.</span>
                  <span>
                    Scrolle nach unten und wähle <strong className="font-semibold text-slate-900 dark:text-white">Zum Home-Bildschirm</strong>.
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Verstanden
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 md:bottom-5 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline-Modus — Daten werden lokal gespeichert</span>
    </div>
  );
};
