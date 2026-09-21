import React from 'react';
import { useApp } from '../context/AppContext';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, HardDrive, Zap } from 'lucide-react';

export const OfflineIndicatorBanner: React.FC = () => {
  const {
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    pendingOfflineCount,
    syncOfflineQueue,
    isCloudConnected,
  } = useApp();

  const isActuallyOffline = !isOnline || isSimulatedOffline;

  if (!isActuallyOffline) {
    return null;
  }

  return (
    <div className="bg-amber-600 text-white px-4 py-2 text-xs shadow-md border-b border-amber-700 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-left">
          <div className="p-1 rounded-full bg-amber-700/80 animate-pulse">
            <WifiOff className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <span className="font-black text-amber-100 uppercase tracking-wider text-[11px] block sm:inline mr-2">
              Mode Hors Ligne Actif (Réseau Malien)
            </span>
            <span className="text-amber-100/90 text-[11px]">
              {isSimulatedOffline
                ? 'Simulation de coupure réseau activée pour test.'
                : 'Connexion Internet interrompue (Orange / Malitel / Moov).'}
              {' '}Vos commandes et déclarations de réassort sont enregistrées en toute sécurité dans la mémoire locale de votre appareil.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {pendingOfflineCount > 0 && (
            <span className="flex items-center gap-1 bg-amber-800 text-white text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-500">
              <HardDrive className="w-3 h-3 text-amber-300" />
              {pendingOfflineCount} opération(s) en attente de sync
            </span>
          )}

          {isSimulatedOffline && (
            <button
              onClick={toggleSimulatedOffline}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-amber-900 font-bold text-xs transition shadow-sm flex items-center gap-1"
              title="Désactiver la simulation pour repasser en mode connecté"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-700" />
              Rétablir la connexion
            </button>
          )}

          {!isSimulatedOffline && isOnline && (
            <button
              onClick={syncOfflineQueue}
              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Synchroniser avec Firestore
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
