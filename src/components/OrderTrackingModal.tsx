import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  XCircle,
  Phone,
  AlertCircle,
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRef?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialRef = '',
}) => {
  const { orders, formatFCFA } = useApp();
  const [searchRef, setSearchRef] = useState(initialRef || (orders[0]?.reference || ''));
  const [foundOrder, setFoundOrder] = useState<Order | null>(
    orders.find((o) => o.reference.toLowerCase() === (initialRef || orders[0]?.reference || '').toLowerCase()) || null
  );

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const order = orders.find(
      (o) => o.reference.trim().toLowerCase() === searchRef.trim().toLowerCase()
    );
    setFoundOrder(order || null);
  };

  const steps: { statut: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { statut: 'EN_ATTENTE', label: 'Enregistrée', icon: Clock },
    { statut: 'CONFIRMEE', label: 'Confirmée', icon: CheckCircle2 },
    { statut: 'EN_PREPARATION', label: 'Au Hub (Préparation)', icon: Package },
    { statut: 'EXPEDIEE', label: 'En Livraison', icon: Truck },
    { statut: 'LIVREE', label: 'Livrée au client', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepStatut: OrderStatus, currentStatut: OrderStatus) => {
    if (currentStatut === 'ANNULEE' || currentStatut === 'ECHOUEE') {
      return 'failed';
    }
    const orderRanks: Record<OrderStatus, number> = {
      EN_ATTENTE: 1,
      CONFIRMEE: 2,
      EN_PREPARATION: 3,
      EXPEDIEE: 4,
      LIVREE: 5,
      ANNULEE: 0,
      ECHOUEE: 0,
    };
    const currentRank = orderRanks[currentStatut] || 0;
    const stepRank = orderRanks[stepStatut] || 0;

    if (currentRank > stepRank) return 'completed';
    if (currentRank === stepRank) return 'current';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 space-y-5 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Suivi Public de Commande</h3>
              <p className="text-xs text-stone-500">
                Saisissez votre référence alphanumérique (ex: MR-20260919-0001)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 font-bold p-1">
            ✕
          </button>
        </div>

        {/* Barre de Recherche */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            required
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            placeholder="Ex: MR-20260919-0001"
            className="flex-1 text-xs sm:text-sm font-mono p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 uppercase"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow transition"
          >
            Rechercher
          </button>
        </form>

        {/* Commandes Récentes suggérées */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-stone-500 no-scrollbar">
          <span>Récents :</span>
          {orders.slice(0, 3).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                setSearchRef(o.reference);
                setFoundOrder(o);
              }}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono"
            >
              {o.reference}
            </button>
          ))}
        </div>

        {/* Résultat */}
        {foundOrder ? (
          <div className="space-y-4 pt-2 border-t border-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono font-black text-emerald-800 text-base sm:text-lg block">
                  {foundOrder.reference}
                </span>
                <span className="text-xs text-stone-500">
                  Commandé le {new Date(foundOrder.dateCreation).toLocaleString('fr-FR')}
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  foundOrder.statut === 'LIVREE'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : foundOrder.statut === 'EXPEDIEE'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : foundOrder.statut === 'ECHOUEE' || foundOrder.statut === 'ANNULEE'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {foundOrder.statut}
              </span>
            </div>

            {/* Stepper Progressif */}
            <div className="py-4">
              <div className="grid grid-cols-5 gap-1 text-center">
                {steps.map(({ statut, label, icon: Icon }) => {
                  const state = getStepStatus(statut, foundOrder.statut);

                  return (
                    <div key={statut} className="flex flex-col items-center space-y-1.5">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition ${
                          state === 'completed'
                            ? 'bg-emerald-700 text-white shadow-md'
                            : state === 'current'
                            ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-semibold leading-tight ${
                          state === 'completed' || state === 'current'
                            ? 'text-stone-900'
                            : 'text-stone-400'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alerte si échouée ou annulée */}
            {(foundOrder.statut === 'ECHOUEE' || foundOrder.statut === 'ANNULEE') && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Statut terminal : {foundOrder.statut}</strong>
                  {foundOrder.motifEchec && (
                    <div className="mt-0.5">Motif renseigné : {foundOrder.motifEchec}</div>
                  )}
                  {foundOrder.commentaireEchec && (
                    <div className="mt-0.5 text-stone-600 italic">« {foundOrder.commentaireEchec} »</div>
                  )}
                </div>
              </div>
            )}

            {/* Détails du Destinataire */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-2">
              <div className="flex justify-between font-bold text-stone-900">
                <span>Destinataire :</span>
                <span>{foundOrder.clientPrenom} {foundOrder.clientNom}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Téléphone :</span>
                <span className="font-mono font-semibold">{foundOrder.clientTelephone}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Localisation :</span>
                <span>{foundOrder.commune || foundOrder.ville} — {foundOrder.quartier}</span>
              </div>
              <div className="pt-1 border-t border-stone-200 text-amber-900 font-semibold text-[11px]">
                📍 Repère : {foundOrder.repereVisuel}
              </div>
              {foundOrder.livreurNom && (
                <div className="pt-1 border-t border-stone-200 flex justify-between text-blue-900 font-bold">
                  <span>Livreur assigné :</span>
                  <span>{foundOrder.livreurNom}</span>
                </div>
              )}
            </div>

            {/* Articles */}
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-stone-700">Contenu du colis :</div>
              {foundOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between text-stone-600">
                  <span>{it.quantite}x {it.produitNom}</span>
                  <span className="font-medium text-stone-900">{formatFCFA(it.totalLigne)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-stone-200 font-bold text-stone-900 text-sm">
                <span>Total Facturé ({foundOrder.modePaiement}) :</span>
                <span className="text-emerald-800">{formatFCFA(foundOrder.montantTotal)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-stone-500 text-xs">
            Aucune commande trouvée avec la référence <strong>{searchRef}</strong>.
          </div>
        )}
      </div>
    </div>
  );
};
