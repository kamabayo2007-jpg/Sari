import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Search,
  Calendar,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';

interface ClientOrdersTabProps {
  onSelectTracking: (orderRef: string) => void;
  onGoToShop: () => void;
}

export const ClientOrdersTab: React.FC<ClientOrdersTabProps> = ({
  onSelectTracking,
  onGoToShop,
}) => {
  const { orders, currentUser, formatFCFA, isCloudConnected } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchRef, setSearchRef] = useState<string>('');

  // Récupérer UNIQUEMENT les commandes qui correspondent au client actif (sécurité et confidentialité strictes)
  const clientOrders = orders.filter((o) => {
    // Si administrateur du hub, accès superviseur
    if (currentUser.role === 'ADMIN') return true;

    // Correspondance par téléphone malien ou identifiant compte connecté
    const isSamePhone =
      Boolean(currentUser.telephone) &&
      currentUser.telephone.length > 6 &&
      o.clientTelephone.replace(/\s+/g, '') === currentUser.telephone.replace(/\s+/g, '');

    const isSameName =
      Boolean(currentUser.nom && currentUser.prenom) &&
      o.clientNom.toLowerCase().trim() === currentUser.nom.toLowerCase().trim() &&
      o.clientPrenom.toLowerCase().trim() === currentUser.prenom.toLowerCase().trim();

    const isMatchingClientId = Boolean(o.clientId && o.clientId === currentUser.id);
    const isMatchingFirebaseUid = Boolean(
      currentUser.firebaseUid && o.clientFirebaseUid === currentUser.firebaseUid
    );

    return Boolean(isSamePhone || isSameName || isMatchingClientId || isMatchingFirebaseUid);
  });

  const filteredOrders = clientOrders.filter((order) => {
    const matchesStatus = filterStatus === 'ALL' || order.statut === filterStatus;
    const matchesSearch =
      searchRef === '' ||
      order.reference.toLowerCase().includes(searchRef.toLowerCase()) ||
      order.quartier.toLowerCase().includes(searchRef.toLowerCase()) ||
      order.items.some((a) => a.produitNom.toLowerCase().includes(searchRef.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (statut: OrderStatus) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            En attente de confirmation
          </span>
        );
      case 'CONFIRMEE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Confirmée au Hub
          </span>
        );
      case 'EN_PREPARATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Package className="w-3.5 h-3.5 text-indigo-600" />
            Colis en préparation
          </span>
        );
      case 'EXPEDIEE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 animate-pulse">
            <Truck className="w-3.5 h-3.5 text-teal-600" />
            En cours de livraison
          </span>
        );
      case 'LIVREE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Colis livré avec succès
          </span>
        );
      case 'ECHOUEE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Livraison échouée
          </span>
        );
      case 'ANNULEE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <AlertCircle className="w-3.5 h-3.5 text-stone-500" />
            Commande annulée
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentMethodBadge = (mode: string) => {
    switch (mode) {
      case 'CASH_ON_DELIVERY':
        return 'Espèces à la livraison (COD)';
      case 'ORANGE_MONEY':
        return 'Orange Money Mali';
      case 'MOOV_MONEY':
        return 'Moov Money (Flooz)';
      case 'WAVE':
        return 'Wave Mali';
      default:
        return mode;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* En-tête de la section */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Historique de Mes Achats & Commandes
              </h2>
              <p className="text-xs text-stone-500">
                Retrouvez tous vos achats enregistrés dans la base Firestore et suivez l acheminement en direct.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCloudConnected && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Synchronisé avec Firestore
            </span>
          )}
          <button
            onClick={onGoToShop}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Faire un nouvel achat
          </button>
        </div>
      </div>

      {/* Barre de filtre et de recherche */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            placeholder="Rechercher par référence MR-..., quartier ou produit..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL', label: 'Toutes' },
            { id: 'EN_ATTENTE', label: 'En attente' },
            { id: 'EXPEDIEE', label: 'En livraison' },
            { id: 'LIVREE', label: 'Livrées' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                filterStatus === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des commandes */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-dashed border-stone-300 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-stone-800">Aucune commande trouvée</h3>
            <p className="text-xs text-stone-500">
              Vous n avez pas encore passé de commande ou aucun achat ne correspond à votre recherche.
            </p>
          </div>
          <button
            onClick={onGoToShop}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Découvrir le catalogue boutique
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              id={`order-card-${order.reference}`}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-emerald-500/40 transition-all duration-200"
            >
              {/* Entête de carte de commande */}
              <div className="p-4 sm:p-5 bg-stone-50/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-stone-900 bg-white px-3 py-1 rounded-lg border border-stone-200 shadow-2xs">
                    {order.reference}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(order.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(order.statut)}
                  <button
                    onClick={() => onSelectTracking(order.reference)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition"
                    title="Ouvrir le suivi détaillé du livreur"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Suivi en direct</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </button>
                </div>
              </div>

              {/* Corps de la carte */}
              <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Articles commandés */}
                <div className="lg:col-span-2 space-y-3">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Articles ({order.items.reduce((acc, a) => acc + a.quantite, 0)})
                  </h4>
                  <div className="divide-y divide-stone-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-stone-900">{item.produitNom}</p>
                          <div className="text-[11px] text-stone-500 font-mono flex items-center gap-2">
                            <span>SKU: {item.produitSku}</span>
                            <span>•</span>
                            <span>Quantité: {item.quantite}</span>
                          </div>
                        </div>
                        <div className="text-right font-bold text-stone-900">
                          {formatFCFA(item.totalLigne)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Résumé financier */}
                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                    <span className="text-stone-500">Sous-total articles :</span>
                    <span className="font-semibold text-stone-800">{formatFCFA(order.montantArticles)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Frais de livraison :</span>
                    <span className="font-semibold text-stone-800">{formatFCFA(order.fraisLivraison)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-black text-stone-900 pt-1 border-t border-stone-100">
                    <span>Montant Total à payer :</span>
                    <span className="text-emerald-800 text-base">{formatFCFA(order.montantTotal)}</span>
                  </div>
                </div>

                {/* Détails de livraison & Règlement */}
                <div className="bg-stone-50/70 rounded-xl p-4 border border-stone-200 space-y-3 text-xs">
                  <h4 className="font-bold text-stone-700 uppercase tracking-wider text-[11px]">
                    Destination & Livraison
                  </h4>

                  <div className="space-y-2 text-stone-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-stone-900">{order.commune}</strong>
                        <p>{order.quartier}</p>
                        <p className="text-[11px] text-stone-500 italic mt-0.5">
                          Repère : {order.repereVisuel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-stone-200">
                      <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span>{order.clientTelephone}</span>
                    </div>

                    {order.livreurNom && (
                      <div className="flex items-center gap-2 pt-1 border-t border-stone-200 text-teal-800 font-medium">
                        <Truck className="w-3.5 h-3.5 shrink-0" />
                        <span>Livreur assigné : <strong>{order.livreurNom}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-200 space-y-1">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Mode de paiement
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-stone-900">
                      <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                      <span>{getPaymentMethodBadge(order.modePaiement)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
