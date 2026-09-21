import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DeliveryFailureReason, Order } from '../types';
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Banknote,
  Clock,
  AlertTriangle,
  FileText,
  Navigation,
} from 'lucide-react';

export const DeliveryPortal: React.FC = () => {
  const {
    currentUser,
    orders,
    completeDelivery,
    failDelivery,
    updateOrderStatus,
    formatFCFA,
    addToast,
  } = useApp();

  // Filtrer les commandes assignées à ce livreur ou prêtes à livrer
  const assignedOrders = orders.filter(
    (o) => o.livreurId === currentUser.id || (!o.livreurId && o.statut === 'EN_PREPARATION')
  );

  // Modal d'échec de livraison
  const [failingOrder, setFailingOrder] = useState<Order | null>(null);
  const [failureReason, setFailureReason] = useState<DeliveryFailureReason>('CLIENT_INJOIGNABLE');
  const [failureComment, setFailureComment] = useState('');

  // Total des espèces collectées aujourd'hui (à reverser au caissier hub)
  const cashCollectedTotal = orders
    .filter(
      (o) =>
        o.livreurId === currentUser.id &&
        o.statut === 'LIVREE' &&
        o.modePaiement === 'ESPECES_LIVRAISON'
    )
    .reduce((sum, o) => sum + o.montantTotal, 0);

  const activeDeliveries = assignedOrders.filter(
    (o) => o.statut === 'EN_PREPARATION' || o.statut === 'EXPEDIEE'
  );
  const completedDeliveries = assignedOrders.filter(
    (o) => o.statut === 'LIVREE' || o.statut === 'ECHOUEE'
  );

  const handleFailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!failingOrder) return;

    failDelivery(failingOrder.id, failureReason, failureComment);
    setFailingOrder(null);
    setFailureComment('');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Entête Espace Livreur */}
      <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-teal-950 text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <Truck className="w-4 h-4" />
              Feuille de Route Livreur • {currentUser.prenom} {currentUser.nom}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Tournée Urbaine Bamako
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Consultez vos colis assignés, utilisez les repères géographiques pour localiser les clients, encaissez les paiements à la livraison et mettez à jour les statuts en direct.
            </p>
          </div>

          {/* Caisse Espèces Détenue */}
          <div className="bg-stone-950/70 p-4 rounded-xl border border-emerald-600/40 text-right">
            <span className="text-xs text-stone-400 block">Total Espèces Collectées (À Reverser)</span>
            <span className="text-2xl font-black text-amber-400 block mt-1">
              {formatFCFA(cashCollectedTotal)}
            </span>
            <span className="text-[10px] text-stone-400">Responsabilité financière agent (RM-17)</span>
          </div>
        </div>
      </div>

      {/* Livraisons en Cours */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Courses Actives en Cours ({activeDeliveries.length})
          </h2>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500 text-xs">
            Aucune course active en ce moment. Vous êtes à jour dans votre tournée !
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeDeliveries.map((order) => {
              const isEnRoute = order.statut === 'EXPEDIEE';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {order.reference}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isEnRoute ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.statut}
                      </span>
                    </div>

                    {/* Informations Client & Repère Visuel */}
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-sm">
                          {order.clientPrenom} {order.clientNom}
                        </span>
                        <a
                          href={`tel:${order.clientTelephone.replace(/\s+/g, '')}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Appeler
                        </a>
                      </div>

                      <div className="flex items-start gap-2 text-stone-600">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>{order.commune || order.ville}</strong> — {order.quartier}
                          <div className="text-stone-900 font-semibold mt-1 p-2 bg-amber-50 rounded border border-amber-200 text-[11px]">
                            📍 Repère : {order.repereVisuel}
                          </div>
                        </div>
                      </div>

                      {order.clientTelephone2 && (
                        <div className="text-[11px] text-stone-500">
                          Numéro secours : <strong>{order.clientTelephone2}</strong>
                        </div>
                      )}
                    </div>

                    {/* Détails du Panier & Montant */}
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-stone-700">Articles à remettre :</div>
                      {order.items.map((it) => (
                        <div key={it.id} className="text-stone-600 flex justify-between">
                          <span>{it.quantite}x {it.produitNom}</span>
                          <span className="font-medium">{formatFCFA(it.totalLigne)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-bold block">
                          Montant à Encaisser ({order.modePaiement === 'ESPECES_LIVRAISON' ? 'Cash COD' : order.modePaiement})
                        </span>
                        <span className="text-lg font-black text-emerald-800">
                          {formatFCFA(order.montantTotal)}
                        </span>
                      </div>
                      <span className="text-xs text-stone-500">
                        Frais livraison inclus : {formatFCFA(order.fraisLivraison)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Livreur */}
                  <div className="pt-3 border-t border-stone-200 flex flex-wrap gap-2">
                    {!isEnRoute ? (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            'EXPEDIEE',
                            `Colis récupéré par le livreur ${currentUser.prenom} ${currentUser.nom}`,
                            { livreurId: currentUser.id, livreurNom: `${currentUser.prenom} ${currentUser.nom}` }
                          )
                        }
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Prendre en charge le colis (Départ en route)
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => completeDelivery(order.id)}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Livraison Effectuée & Encaissée
                        </button>
                        <button
                          onClick={() => setFailingOrder(order)}
                          className="px-3 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Échec
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Historique des Livraisons Complétées */}
      <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-stone-900">
          Historique de la Tournée ({completedDeliveries.length})
        </h2>

        {completedDeliveries.length === 0 ? (
          <div className="text-xs text-stone-500 text-center py-4">
            Aucune livraison terminée pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-stone-100 text-xs">
            {completedDeliveries.map((o) => (
              <div key={o.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">{o.reference}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.statut === 'LIVREE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {o.statut}
                    </span>
                  </div>
                  <div className="text-stone-500 mt-0.5">
                    Client : {o.clientPrenom} {o.clientNom} • {o.commune || o.ville} ({o.quartier})
                  </div>
                  {o.motifEchec && (
                    <div className="text-rose-600 font-medium text-[11px] mt-0.5">
                      Motif d échec : {o.motifEchec} {o.commentaireEchec ? `(${o.commentaireEchec})` : ''}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-bold text-stone-900">{formatFCFA(o.montantTotal)}</div>
                  <div className="text-[10px] text-stone-400">{o.modePaiement}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Déclaration d'Échec (RM-18) */}
      {failingOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Déclaration d Échec de Livraison
              </h3>
              <button
                onClick={() => setFailingOrder(null)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Conformément à la règle <strong>RM-18</strong>, tout échec de livraison exige la sélection d un motif normé afin d alerter le service client et de restituer la marchandise au stock (RM-08).
            </p>

            <form onSubmit={handleFailSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Motif standardisé *</label>
                <select
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value as DeliveryFailureReason)}
                  className="w-full p-2 rounded-lg border border-stone-300 font-medium bg-white"
                >
                  <option value="CLIENT_INJOIGNABLE">Client injoignable (après 3 tentatives)</option>
                  <option value="CLIENT_ABSENT">Client absent au point de rendez-vous</option>
                  <option value="REFUS_CLIENT">Refus du client (prix ou non-conformité)</option>
                  <option value="ADRESSE_INACCESSIBLE">Adresse / Repère introuvable</option>
                  <option value="COLIS_ENDOMMAGE">Colis endommagé pendant le transport</option>
                  <option value="AUTRE">Autre motif</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Commentaire explicatif (facultatif)</label>
                <textarea
                  rows={2}
                  value={failureComment}
                  onChange={(e) => setFailureComment(e.target.value)}
                  placeholder="Précisez les détails..."
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setFailingOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 font-semibold text-stone-700 hover:bg-stone-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow"
                >
                  Enregistrer l Échec
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
